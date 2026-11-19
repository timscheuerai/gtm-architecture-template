import { defineRecipe } from "@oxygen/recipe-sdk";

/**
 * W1b · ContactOut layer: new finance leaders at fit accounts (AP automation worked example).
 *
 * Stage 04 signal layering. "New CFO in the seat" is the strongest buying
 * trigger in this use case, and no market-wide feed covers it. ContactOut's
 * people count is FREE, so we ask it once per Fit A/B account:
 *   how many CFOs, VPs of Finance, Heads of Finance or Controllers have been
 *   in their current role for under a year at this domain?
 * The count lands on Accounts (`new_finance_leaders`) and is worth 20 points
 * in the free score formula. Finding the person happens later, in W2, and
 * only for Tier A/B accounts.
 *
 * Cost: 0 credits (contactout.people_count is no-bill).
 */

const ACCOUNTS = "accounts";
const LEADER_TITLES = ["CFO", "Chief Financial Officer", "VP Finance", "Vice President of Finance", "Head of Finance", "Controller"];
const RECHECK_DAYS = 30;

type Row = Record<string, any>;

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
  if (value?.data && !value?.rows && !value?.items && !value?.result) return unpack(value.data);
  return value;
}

function rowsOf(value: any): Row[] {
  const page = unpack(value);
  return page?.rows ?? page?.items ?? [];
}

function daysBetween(a: string, b: string): number {
  return Math.floor((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

export default defineRecipe({
  id: "ap-webinar-w1b-contactout-new-leaders",
  name: "AP webinar W1b: ContactOut new finance leaders at fit accounts (weekly, free)",
  status: "disabled",
  runtime: "durable",
  // Demo: on demand. Production: weekly, right after W1:
  // trigger: { type: "cron", cron: "30 8 * * 1", timezone: "America/New_York" }
  trigger: { type: "api" },
  inputSchema: {
    type: "object",
    properties: {
      max_accounts: { type: "number", minimum: 1, maximum: 1000 },
      audit: { type: "boolean" },
    },
    additionalProperties: false,
  },
  tools: ["oxygen.rows_query", "oxygen.rows_upsert", "contactout.people_count"],
  async run(ctx) {
    const input = (ctx.input ?? {}) as { max_accounts?: number; audit?: boolean };
    const audit = input.audit === true || ctx.mode !== "live";
    const maxAccounts = Math.min(Math.max(Math.floor(input.max_accounts ?? 500), 1), 1000);
    const today = String(await ctx.now()).slice(0, 10);

    // Fit A/B accounts with a domain, not checked in the last 30 days.
    const accounts = rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: ACCOUNTS,
      fields: ["linkedin_url", "acct_domain", "fit", "leaders_checked"],
      limit: 5000,
    }, { key: "read-accounts" }))
      .filter((row) => (row.fit === "A" || row.fit === "B") && typeof row.acct_domain === "string" && row.acct_domain)
      .filter((row) => !row.leaders_checked || daysBetween(String(row.leaders_checked), today) >= RECHECK_DAYS)
      .slice(0, maxAccounts);

    ctx.log("info", "w1b.plan", { accounts: accounts.length, audit });
    if (audit || accounts.length === 0) return { audit, accounts: accounts.length };

    // One free count per account.
    const updates: Row[] = [];
    let withLeaders = 0;
    for (const row of accounts) {
      const domain = String(row.acct_domain).toLowerCase().replace(/^www\./, "");
      const result = unpack(await ctx.tools.run("contactout.people_count", {
        domain: [domain],
        job_title: LEADER_TITLES,
        current_titles_only: true,
        years_in_current_role: ["0_1"],
      }, { key: `count-${domain}`, optional: true }));
      const total = Number(result?.result?.response?.total_results ?? result?.response?.total_results ?? NaN);
      if (!Number.isFinite(total)) continue;
      if (total > 0) withLeaders += 1;
      updates.push({ linkedin_url: row.linkedin_url, new_finance_leaders: total, leaders_checked: today });
    }

    for (let offset = 0; offset < updates.length; offset += 100) {
      await ctx.tools.run("oxygen.rows_upsert", {
        table: ACCOUNTS,
        key: "linkedin_url",
        return: "summary",
        rows: updates.slice(offset, offset + 100),
      }, { key: `upsert-leaders-${offset}` });
    }

    return { accounts: accounts.length, counted: updates.length, with_new_leaders: withLeaders };
  },
});
