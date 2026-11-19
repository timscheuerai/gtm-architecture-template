import { defineRecipe } from "@oxygen/recipe-sdk";

/**
 * W3 · Route ready buyers to outbound (AP automation worked example).
 *
 * Stage 08 of "The outbound engine":
 *   1. Read Buyers where `ready` is true (persona fits, a reachable channel,
 *      account in Tier A or B) and not yet routed.
 *   2. Pick the Sequence from the account's top trigger:
 *      ERP -> ap-webinar-erp, CFO -> ap-webinar-cfo, Audit/AP -> ap-webinar-audit-ap,
 *      past champion -> ap-webinar-champion.
 *   3. STOP for a human: an approval step shows who would be enrolled where.
 *   4. Only after approval: enroll them. Enrolling sends nothing; every
 *      Sequence is a draft until a person starts it with a send ceiling.
 *
 * A CRM write (tier, score, why-now on the company) is a separate, approved
 * step you add once you have confirmed which portal it writes to. As shipped,
 * W3 writes nothing outside OXYGEN.
 */

const BUYERS = "buyers";
const SEQUENCE_FOR_TRIGGER: Record<string, string> = {
  ERP: "ap-webinar-erp",
  CFO: "ap-webinar-cfo",
  "Audit/AP": "ap-webinar-audit-ap",
  Champion: "ap-webinar-champion",
};

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
  if (value?.data && !value?.rows && !value?.items) return unpack(value.data);
  return value;
}

function rowsOf(value: any): Row[] {
  const page = unpack(value);
  return page?.rows ?? page?.items ?? [];
}

export default defineRecipe({
  id: "ap-webinar-w3-route-to-outbound",
  name: "AP webinar W3: route ready buyers to outbound (daily, approval-gated)",
  status: "disabled",
  runtime: "durable",
  // Demo: on demand. Production: daily, after W2:
  // trigger: { type: "cron", cron: "0 10 * * 1-5", timezone: "America/New_York" }
  trigger: { type: "api" },
  inputSchema: {
    type: "object",
    properties: { audit: { type: "boolean" } },
    additionalProperties: false,
  },
  tools: ["oxygen.rows_query", "oxygen.rows_upsert", "oxygen_columns_run", "oxygen_sequences_enroll"],
  async run(ctx) {
    const input = (ctx.input ?? {}) as { audit?: boolean };
    const audit = input.audit === true || ctx.mode !== "live";
    const today = String(await ctx.now()).slice(0, 10);

    // 0. Free refresh of the stored values `ready` depends on.
    if (!audit) {
      for (const column of ["account_tier", "top_trigger", "why_now", "persona", "channel", "ready"]) {
        await ctx.tools.run("oxygen_columns_run", {
          table: BUYERS, column, selection: { mode: "all" }, force: true, background: true,
        }, { key: `refresh-buyers-${column}` });
      }
      await ctx.wait("let-buyers-refresh", { seconds: 45 });
    }

    // 1. Ready buyers that are not routed yet.
    const buyers = rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: BUYERS,
      fields: ["linkedin_url", "full_name", "company_name", "persona", "channel", "top_trigger", "buyer_role", "ready", "routed_to"],
      limit: 5000,
    }, { key: "read-buyers" })).filter((row) => (row.ready === true || row.ready === "true") && !row.routed_to);

    // 2. Sequence per buyer.
    const plan = new Map<string, Row[]>();
    for (const row of buyers) {
      const trigger = row.buyer_role === "past_champion" ? "Champion" : String(row.top_trigger ?? "");
      const sequence = SEQUENCE_FOR_TRIGGER[trigger];
      if (!sequence) continue;
      plan.set(sequence, [...(plan.get(sequence) ?? []), row]);
    }
    const summary = [...plan.entries()].map(([sequence, rows]) => ({
      sequence,
      people: rows.map((row) => `${row.full_name} (${row.persona}, ${row.company_name}, ${row.channel})`),
    }));
    ctx.log("info", "w3.plan", { ready: buyers.length, summary });
    if (audit || buyers.length === 0) return { audit, ready: buyers.length, summary };

    // 3. Human approval before anyone is enrolled.
    const approval = await ctx.approvals.require({
      label: "enroll-ap-buyers",
      estimated_credits: 0,
      summary: `Enroll ${buyers.length} buyers into draft Sequences: ` +
        summary.map((s) => `${s.sequence}: ${s.people.length}`).join(", "),
    });
    if (!approval?.approved) return { ready: buyers.length, enrolled: 0, approved: false };

    // 4. Enroll (sends nothing; the Sequences stay drafts) and mark the rows.
    let enrolled = 0;
    for (const [sequence, rows] of plan) {
      await ctx.tools.run("oxygen_sequences_enroll", {
        sequence,
        leads: rows.map((row) => ({ table_row_id: String(row._row_id), lead_profile_url: row.linkedin_url, lead_name: row.full_name })),
        exclude_contacted: true,
      }, { key: `enroll-${sequence}` });
      await ctx.tools.run("oxygen.rows_upsert", {
        table: BUYERS,
        key: "linkedin_url",
        return: "summary",
        rows: rows.map((row) => ({ linkedin_url: row.linkedin_url, routed_to: `${sequence} ${today}` })),
      }, { key: `mark-${sequence}` });
      enrolled += rows.length;
    }
    return { ready: buyers.length, enrolled };
  },
});
