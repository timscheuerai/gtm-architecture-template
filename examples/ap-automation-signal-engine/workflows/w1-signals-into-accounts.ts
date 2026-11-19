import { defineRecipe } from "@oxygen/recipe-sdk";

/**
 * W1 · Hiring signals into Accounts (AP automation worked example).
 *
 * Stage 01 + 02 + 03 of "The outbound engine":
 *   1. Read the 4 hiring signal tables. Keep only postings the AI filter kept
 *      (column `kept_company_li`: in-house roles, no agencies).
 *   2. Every hiring company that is not in Accounts yet becomes a new account
 *      (dedupe on the normalized company LinkedIn URL).
 *   3. Enrich the new accounts (Blitz first, about 1 credit a company), wait
 *      for the facts to land, then score EVERY account without a fit
 *      (sourced and new) with AP Company Fit (0.075 credits a row).
 *      Fit C accounts get no further spend. `rescore: true` re-scores all.
 *
 * Score and tier are free formulas on Accounts, so they update on read.
 * Rules: knowledge page "AP automation ICP (demo)" (../knowledge/ap-icp.md).
 */

const SIGNAL_TABLES = [
  { table: "hiring-cfo", family: "CFO" },
  { table: "hiring-erp", family: "ERP" },
  { table: "hiring-audit-and-sox", family: "Audit/SOX" },
  { table: "hiring-ap", family: "AP" },
];
const SIGNAL_FORMULAS = ["company_linkedin_url", "kept_company_li", "age_days", "erp_named", "erp_company_li"];
const ACCOUNTS = "accounts";
const FIT_INPUTS = ["erp_from_cfo", "erp_from_erp", "erp_from_audit", "erp_from_ap", "erp", "acct_domain", "acct_industry", "acct_employees", "acct_description"];
const ENRICH_CREDITS_PER_ROW = 1.5; // ceiling, list price is about 1
const FIT_CREDITS_PER_ROW = 0.1; // ceiling, list price is 0.075

type Row = Record<string, unknown>;

function unpack(value: any): any {
  if (value?.structuredContent) return unpack(value.structuredContent);
  if (Array.isArray(value?.content)) {
    const text = value.content.find((c: any) => c.type === "text")?.text;
    if (text) {
      try {
        return unpack(JSON.parse(text));
      } catch {
        return value;
      }
    }
  }
  if (value?.data && !value?.rows && !value?.items) return unpack(value.data);
  return value;
}

function rowsOf(value: any): Row[] {
  const page = unpack(value);
  return page?.rows ?? page?.items ?? [];
}

/** https://www.linkedin.com/company/<slug> or null. */
function normLinkedIn(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().toLowerCase().match(/linkedin\.com\/company\/([^/?#\s]+)/);
  return match ? `https://www.linkedin.com/company/${match[1]}` : null;
}

export default defineRecipe({
  id: "ap-webinar-w1-signals-into-accounts",
  name: "AP webinar W1: hiring signals into Accounts (weekly)",
  status: "disabled",
  runtime: "durable",
  // Demo: on demand. Production: weekly, after the signal feeds refill:
  // trigger: { type: "cron", cron: "0 8 * * 1", timezone: "America/New_York" }
  trigger: { type: "api" },
  inputSchema: {
    type: "object",
    properties: {
      max_new: { type: "number", minimum: 1, maximum: 500 },
      enrich_wait_seconds: { type: "number", minimum: 30, maximum: 900 },
      rescore: { type: "boolean" },
      audit: { type: "boolean" },
    },
    additionalProperties: false,
  },
  tools: ["oxygen.rows_query", "oxygen.rows_upsert", "oxygen_columns_run"],
  async run(ctx) {
    const input = (ctx.input ?? {}) as { max_new?: number; enrich_wait_seconds?: number; rescore?: boolean; audit?: boolean };
    const audit = input.audit === true || ctx.mode !== "live";
    const maxNew = Math.min(Math.max(Math.floor(input.max_new ?? 250), 1), 500);
    const enrichWait = Math.min(Math.max(Math.floor(input.enrich_wait_seconds ?? 300), 30), 900);

    // 0. Refresh the signal tables' formula columns (free). Accounts' lookups
    //    match on stored values, and age_days moves every day.
    if (!audit) {
      for (const { table } of SIGNAL_TABLES) {
        for (const column of SIGNAL_FORMULAS) {
          await ctx.tools.run("oxygen_columns_run", {
            table,
            column,
            selection: { mode: "all" },
            force: true,
            background: true,
          }, { key: `refresh-${table}-${column}` });
        }
      }
      await ctx.wait("let-formulas-refresh", { seconds: 60 });
    }

    // 1. Kept hiring companies across the 4 signal tables.
    const companies = new Map<string, { company_name: string | null; families: Set<string> }>();
    for (const { table, family } of SIGNAL_TABLES) {
      const rows = rowsOf(await ctx.tools.run("oxygen.rows_query", {
        table,
        fields: ["company_name", "kept_company_li"],
        limit: 2000,
      }, { key: `read-${table}` }));
      for (const row of rows) {
        const li = normLinkedIn(row.kept_company_li);
        if (!li) continue;
        const entry = companies.get(li) ?? {
          company_name: typeof row.company_name === "string" ? row.company_name : null,
          families: new Set<string>(),
        };
        entry.families.add(family);
        companies.set(li, entry);
      }
    }

    // 2. Which of them are new accounts?
    const accountRows = rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: ACCOUNTS,
      fields: ["linkedin_url"],
      limit: 5000,
    }, { key: "read-accounts" }));
    const known = new Set(accountRows.map((row) => normLinkedIn(row.linkedin_url)).filter(Boolean));
    const fresh = [...companies.entries()]
      .filter(([li]) => !known.has(li))
      .slice(0, maxNew)
      .map(([li, entry]) => ({
        linkedin_url: li,
        company_name: entry.company_name,
        source: `Hiring signal: ${[...entry.families].sort().join(", ")}`,
      }));

    ctx.log("info", "w1.plan", {
      kept_companies: companies.size,
      already_accounts: companies.size - fresh.length,
      new_accounts: fresh.length,
      audit,
    });
    if (audit) {
      return { audit, kept_companies: companies.size, new_accounts: fresh.length };
    }

    // 3. Upsert the new accounts (dedupe key: company LinkedIn URL).
    const newIds: string[] = [];
    for (let offset = 0; offset < fresh.length; offset += 100) {
      const result = unpack(await ctx.tools.run("oxygen.rows_upsert", {
        table: ACCOUNTS,
        key: "linkedin_url",
        return: "ids",
        rows: fresh.slice(offset, offset + 100),
      }, { key: `upsert-accounts-${offset}` }));
      const ids = result?.row_ids ?? result?.ids ?? [];
      for (const id of ids) if (typeof id === "string") newIds.push(id);
    }

    // 4. Enrich the new accounts (sourced companies already carry their facts).
    if (newIds.length > 0) {
      await ctx.tools.run("oxygen_columns_run", {
        table: ACCOUNTS,
        column: "company_enrich",
        selection: { mode: "row_ids", row_ids: newIds },
        approved: true,
        max_credits: Math.ceil(newIds.length * ENRICH_CREDITS_PER_ROW),
        idempotency_key: `w1-enrich-${newIds[0]}-${newIds.length}`,
      }, { key: "enrich-new-accounts" });
      await ctx.wait("let-enrichment-land", { seconds: enrichWait });
    }

    // 5. Store the fit inputs (ERP lookups and "any source" facts), then score
    //    company fit for EVERY account that has no fit yet: sourced and new.
    for (const column of FIT_INPUTS) {
      await ctx.tools.run("oxygen_columns_run", {
        table: ACCOUNTS, column, selection: { mode: "all" }, force: true, background: true,
      }, { key: `refresh-fit-input-${column}` });
    }
    await ctx.wait("let-fit-inputs-refresh", { seconds: 45 });

    const unscored = rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: ACCOUNTS,
      fields: ["ap_company_fit"],
      limit: 5000,
    }, { key: "read-fit" }))
      .filter((row) => input.rescore === true || !row.ap_company_fit)
      .map((row) => String(row._row_id))
      .filter((id) => id && id !== "undefined");
    if (unscored.length > 0) {
      await ctx.tools.run("oxygen_columns_run", {
        table: ACCOUNTS,
        column: "ap_company_fit",
        selection: { mode: "row_ids", row_ids: unscored },
        force: input.rescore === true,
        approved: true,
        max_credits: Math.ceil(unscored.length * FIT_CREDITS_PER_ROW),
        idempotency_key: `w1-fit-${unscored[0]}-${unscored.length}-${input.rescore === true ? "rescore" : "new"}`,
      }, { key: "fit-accounts" });
    }

    return { kept_companies: companies.size, new_accounts: newIds.length, fit_scored: unscored.length };
  },
});
