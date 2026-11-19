import { defineRecipe } from "@oxygen/recipe-sdk";

/**
 * W2 · Tier A/B accounts to buyers (AP automation worked example).
 *
 * Stage 05 + 06 + 07 of "The outbound engine". Spend starts only here, and
 * only for accounts the free score put in Tier A or B:
 *   1. Read Accounts. Take Tier A/B accounts whose buyers were not searched yet.
 *   2. Blitz people search, 1 credit per call of up to 50 people, for the
 *      buyer titles at those accounts (US only). Where Blitz finds nobody,
 *      ContactOut people search (16.5 per person returned) fills the gap.
 *   3. Keep the best person per role: Tier A gets up to 3 (economic buyer,
 *      champion, AP user), Tier B gets 1 (champion first, else economic buyer).
 *   4. Upsert into Buyers (key: person LinkedIn URL) and mark the accounts.
 *   5. AP Persona Fit (0.075 a row) on the new buyers, then the work-email
 *      waterfall (Blitz first, ContactOut only on a miss, billed on a hit)
 *      for everyone who is not "No fit".
 *
 * Rules: knowledge page "AP automation buyers (demo)".
 */

const ACCOUNTS = "accounts";
const BUYERS = "buyers";
const ROLE_TITLES = {
  economic: ["Chief Financial Officer", "CFO", "VP Finance", "Vice President of Finance", "Vice President, Finance", "Head of Finance"],
  champion: ["Controller", "Director of Finance", "Finance Director", "Head of Accounting", "Finance Systems Manager"],
  user: ["Accounts Payable Manager", "AP Manager", "Accounts Payable Supervisor", "AP Lead", "Accounts Payable Lead"],
} as const;
type Role = keyof typeof ROLE_TITLES;
const EXCLUDE_TITLES = ["Assistant", "Intern", "Fractional", "Analyst", "Clerk", "Specialist", "Recruiter"];
const ACCOUNT_REFRESH = [
  "cfo_postings", "cfo_age", "erp_postings", "erp_age", "audit_postings", "audit_age", "ap_postings", "ap_age",
  "erp_from_cfo", "erp_from_erp", "erp_from_audit", "erp_from_ap",
  "acct_domain", "acct_industry", "acct_employees", "erp", "fit",
  "pts_erp", "pts_cfo", "pts_ap", "pts_audit", "signal_types", "score", "tier", "top_trigger",
];
const BUYER_LOOKUPS = ["account_tier", "account_fit", "top_trigger", "account_erp", "account_industry", "months_in_role"];
const WHY_NOW_CREDITS_PER_ROW = 5; // list about 4
const PERSONA_CREDITS_PER_ROW = 0.1; // list 0.075
const EMAIL_CREDITS_PER_ROW = 18; // worst case: ContactOut hit at 16.5

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

function normLinkedIn(value: unknown, kind: "company" | "in"): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().toLowerCase().match(new RegExp(`linkedin\\.com\\/${kind}\\/([^/?#\\s]+)`));
  return match ? `https://www.linkedin.com/${kind}/${match[1]}` : null;
}

function roleOf(title: string): Role | null {
  const t = title.toLowerCase();
  if (/accounts payable|\bap (manager|lead|supervisor)\b/.test(t)) return "user";
  if (/chief financial officer|\bcfo\b|vp,? finance|vice president,? (of )?finance|head of finance/.test(t)) return "economic";
  if (/controller|director of finance|finance director|head of accounting|finance systems/.test(t)) return "champion";
  return null;
}

export default defineRecipe({
  id: "ap-webinar-w2-tier-ab-to-buyers",
  name: "AP webinar W2: Tier A/B accounts to buyers (weekly)",
  status: "disabled",
  runtime: "durable",
  // Demo: on demand. Production: weekly, an hour after W1:
  // trigger: { type: "cron", cron: "0 9 * * 1", timezone: "America/New_York" }
  trigger: { type: "api" },
  inputSchema: {
    type: "object",
    properties: {
      max_accounts: { type: "number", minimum: 1, maximum: 200 },
      audit: { type: "boolean" },
    },
    additionalProperties: false,
  },
  tools: ["oxygen.rows_query", "oxygen.rows_upsert", "oxygen_columns_run", "blitzapi.people_search", "contactout.people_search"],
  async run(ctx) {
    const input = (ctx.input ?? {}) as { max_accounts?: number; audit?: boolean };
    const audit = input.audit === true || ctx.mode !== "live";
    const maxAccounts = Math.min(Math.max(Math.floor(input.max_accounts ?? 40), 1), 200);
    const today = String(await ctx.now()).slice(0, 10);

    // 0. Free refresh. Lookups, AI inputs and run conditions read STORED
    //    values, so materialize the Accounts formulas and lookups first.
    if (!audit) {
      for (const column of ACCOUNT_REFRESH) {
        await ctx.tools.run("oxygen_columns_run", {
          table: ACCOUNTS, column, selection: { mode: "all" }, force: true, background: true,
        }, { key: `refresh-accounts-${column}` });
      }
      await ctx.wait("let-accounts-refresh", { seconds: 60 });
    }

    // 1. Tier A/B accounts without a buyer search yet.
    const accounts = rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: ACCOUNTS,
      fields: ["linkedin_url", "company_name", "acct_domain", "tier", "buyers_searched"],
      limit: 5000,
    }, { key: "read-accounts" }))
      .filter((row) => (row.tier === "A" || row.tier === "B") && !row.buyers_searched)
      .map((row) => ({ ...row, li: normLinkedIn(row.linkedin_url, "company") }))
      .filter((row) => row.li)
      .slice(0, maxAccounts);
    const tierOf = new Map(accounts.map((row) => [row.li as string, row.tier as string]));

    ctx.log("info", "w2.plan", { accounts: accounts.length, tier_a: accounts.filter((a) => a.tier === "A").length, audit });
    if (audit || accounts.length === 0) return { audit, accounts: accounts.length };

    // 2. Blitz people search, 25 accounts per call.
    const candidates = new Map<string, Map<Role, Row>>();
    for (let offset = 0; offset < accounts.length; offset += 25) {
      const batch = accounts.slice(offset, offset + 25).map((row) => row.li as string);
      const result = unpack(await ctx.tools.run("blitzapi.people_search", {
        "company.linkedin_url": batch,
        "people.job_title.include": [...ROLE_TITLES.economic, ...ROLE_TITLES.champion, ...ROLE_TITLES.user],
        "people.job_title.exclude": EXCLUDE_TITLES,
        "people.location.country_code": ["US"],
        max_results: 50,
      }, { key: `people-search-${offset}` }));
      const people: Row[] = result?.result?.response?.results ?? result?.response?.results ?? [];
      for (const person of people) {
        const personLi = normLinkedIn(person.linkedin_url, "in");
        const job = (person.experiences ?? []).find((exp: Row) =>
          exp.job_is_current && tierOf.has(normLinkedIn(exp.company_linkedin_url, "company") ?? ""));
        if (!personLi || !job) continue;
        const companyLi = normLinkedIn(job.company_linkedin_url, "company") as string;
        const role = roleOf(String(job.job_title ?? ""));
        if (!role) continue;
        const byRole = candidates.get(companyLi) ?? new Map<Role, Row>();
        if (!byRole.has(role)) {
          byRole.set(role, {
            linkedin_url: personLi,
            full_name: person.full_name ?? null,
            first_name: person.first_name ?? null,
            last_name: person.last_name ?? null,
            headline: person.headline ?? null,
            country: person.location?.country_code ?? null,
            job_title: job.job_title ?? null,
            role_start_date: job.job_start_date ?? null,
            company_name: job.company_name ?? null,
            company_domain: job.company_domain ?? null,
            company_linkedin_url: companyLi,
            buyer_role: role,
            found_by: `W2 Blitz people search ${today}`,
          });
        }
        candidates.set(companyLi, byRole);
      }
    }

    // 2b. ContactOut fallback: accounts where Blitz found nobody. ContactOut
    //     bills 16.5 credits per person returned (0 when it finds no one),
    //     so ask for 3 at Tier A and 1 at Tier B.
    for (const account of accounts) {
      const li = account.li as string;
      const domain = typeof account.acct_domain === "string" ? account.acct_domain.toLowerCase() : "";
      if (candidates.has(li) || !domain) continue;
      const result = unpack(await ctx.tools.run("contactout.people_search", {
        domain: [domain],
        job_title: [...ROLE_TITLES.economic, ...ROLE_TITLES.champion, ...ROLE_TITLES.user],
        exclude_job_titles: EXCLUDE_TITLES,
        current_titles_only: true,
        page_size: account.tier === "A" ? 3 : 1,
      }, { key: `contactout-search-${domain}`, optional: true }));
      const response = result?.result?.response ?? result?.response ?? {};
      // ContactOut returns `profiles` keyed by LinkedIn URL (an empty array when none).
      const raw = response.profiles;
      let profiles: Row[] = Array.isArray(raw) ? raw
        : raw && typeof raw === "object" ? Object.entries(raw).map(([url, p]) => ({ url, ...(p as Row) }))
        : [];
      if (profiles.length === 0 && Array.isArray(response.results)) profiles = response.results;
      for (const profile of profiles) {
        const personLi = normLinkedIn(profile.url ?? profile.linkedin_url ?? profile.linkedin, "in");
        const title = String(profile.title ?? profile.job_title ?? profile.headline ?? "");
        const role = roleOf(title);
        if (!personLi || !role) continue;
        const byRole = candidates.get(li) ?? new Map<Role, Row>();
        if (!byRole.has(role)) {
          byRole.set(role, {
            linkedin_url: personLi,
            full_name: profile.full_name ?? profile.name ?? null,
            first_name: profile.first_name ?? null,
            last_name: profile.last_name ?? null,
            headline: profile.headline ?? null,
            country: profile.country ?? profile.location ?? null,
            job_title: title || null,
            company_name: account.company_name ?? null,
            company_domain: domain,
            company_linkedin_url: li,
            buyer_role: role,
            found_by: `W2 ContactOut search ${today}`,
          });
        }
        candidates.set(li, byRole);
      }
    }

    // 3. Tier A: up to 3 people, one per role. Tier B: 1 person.
    const buyers: Row[] = [];
    for (const [companyLi, byRole] of candidates) {
      if (tierOf.get(companyLi) === "A") {
        for (const role of ["economic", "champion", "user"] as Role[]) {
          const person = byRole.get(role);
          if (person) buyers.push(person);
        }
      } else {
        const person = byRole.get("champion") ?? byRole.get("economic");
        if (person) buyers.push(person);
      }
    }

    // 4. Upsert buyers, mark the accounts as searched.
    const newIds: string[] = [];
    for (let offset = 0; offset < buyers.length; offset += 100) {
      const result = unpack(await ctx.tools.run("oxygen.rows_upsert", {
        table: BUYERS,
        key: "linkedin_url",
        return: "ids",
        rows: buyers.slice(offset, offset + 100),
      }, { key: `upsert-buyers-${offset}` }));
      for (const id of result?.row_ids ?? result?.ids ?? []) if (typeof id === "string") newIds.push(id);
    }
    await ctx.tools.run("oxygen.rows_upsert", {
      table: ACCOUNTS,
      key: "linkedin_url",
      return: "summary",
      rows: accounts.map((row) => ({ linkedin_url: row.linkedin_url, buyers_searched: today })),
    }, { key: "mark-accounts" });
    // Why-now line for these accounts (AI, about 4 credits a row, A/B only).
    const accountIds = accounts.map((row) => String(row._row_id)).filter((id) => id && id !== "undefined");
    if (accountIds.length > 0) {
      await ctx.tools.run("oxygen_columns_run", {
        table: ACCOUNTS,
        column: "why_now",
        selection: { mode: "row_ids", row_ids: accountIds },
        approved: true,
        max_credits: Math.ceil(accountIds.length * WHY_NOW_CREDITS_PER_ROW),
        idempotency_key: `w2-why-now-${accountIds[0]}-${accountIds.length}`,
      }, { key: "why-now" });
    }
    if (newIds.length === 0) return { accounts: accounts.length, buyers: 0 };

    // 5. Persona fit, then the email waterfall for everyone who fits.
    for (const column of BUYER_LOOKUPS) {
      await ctx.tools.run("oxygen_columns_run", {
        table: BUYERS, column, selection: { mode: "row_ids", row_ids: newIds }, force: true, background: true,
      }, { key: `refresh-buyers-${column}` });
    }
    await ctx.wait("let-buyer-lookups-refresh", { seconds: 45 });
    await ctx.tools.run("oxygen_columns_run", {
      table: BUYERS,
      column: "ap_persona_fit",
      selection: { mode: "row_ids", row_ids: newIds },
      approved: true,
      max_credits: Math.ceil(newIds.length * PERSONA_CREDITS_PER_ROW),
      idempotency_key: `w2-persona-${newIds[0]}-${newIds.length}`,
    }, { key: "persona-fit" });
    await ctx.wait("let-persona-fit-land", { seconds: 180 });

    const fitting = rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: BUYERS,
      fields: ["_row_id", "persona"],
      limit: 5000,
    }, { key: "read-persona" }))
      .filter((row) => newIds.includes(String(row._row_id)) && row.persona && row.persona !== "No fit")
      .map((row) => String(row._row_id));
    if (fitting.length > 0) {
      await ctx.tools.run("oxygen_columns_run", {
        table: BUYERS,
        column: "work_email_enrichment",
        selection: { mode: "row_ids", row_ids: fitting },
        approved: true,
        max_credits: Math.ceil(fitting.length * EMAIL_CREDITS_PER_ROW),
        idempotency_key: `w2-email-${fitting[0]}-${fitting.length}`,
      }, { key: "email-waterfall" });
    }

    return { accounts: accounts.length, buyers: newIds.length, persona_fit: fitting.length };
  },
});
