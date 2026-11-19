import { defineRecipe } from "@oxygen/recipe-sdk";

/**
 * W3 · Prepare the copy and route ready buyers (AP automation worked example).
 *
 * Stage 08 of "The outbound engine":
 *   1. Read Buyers where `ready` is true (persona fits, a reachable channel,
 *      account in Tier A or B) and not routed yet.
 *   2. Write the copy: one AI column per buyer (about 4 credits) uses the
 *      why-now fact, the AI research agent's notes on the company and one offer,
 *      a free resource ("The Mid-Market AP Benchmark 2026"). It returns the
 *      subject, email 1, LinkedIn note, LinkedIn message and email 2.
 *   3. STOP for a human: the approval shows how many buyers and a sample subject.
 *   4. Only after approval: enroll them into the one draft Sequence. Enrolling
 *      sends nothing; the Sequence is a draft until a person starts it.
 *
 * A CRM write (tier, score, why-now) is added once the CRM portal is confirmed.
 */

const BUYERS = "buyers";
const SEQUENCE = "ap-webinar-benchmark";
const COPY_CREDITS_PER_ROW = 5; // list about 4
const REFRESH = ["account_tier", "account_fit", "top_trigger", "why_now", "account_research", "months_in_role", "persona", "channel", "ready"];
const COPY_FIELDS = ["copy_subject", "copy_email_1", "copy_li_note", "copy_li_message", "copy_email_2"];

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
  name: "AP webinar W3: write the copy and route ready buyers (daily, approval-gated)",
  status: "disabled",
  runtime: "durable",
  // Demo: on demand. Production: daily, after W2:
  // trigger: { type: "cron", cron: "0 10 * * 1-5", timezone: "America/New_York" }
  trigger: { type: "api" },
  inputSchema: {
    type: "object",
    properties: {
      copy_wait_seconds: { type: "number", minimum: 30, maximum: 600 },
      audit: { type: "boolean" },
    },
    additionalProperties: false,
  },
  tools: ["oxygen.rows_query", "oxygen.rows_upsert", "oxygen_columns_run", "oxygen_sequences_enroll"],
  async run(ctx) {
    const input = (ctx.input ?? {}) as { copy_wait_seconds?: number; audit?: boolean };
    const audit = input.audit === true || ctx.mode !== "live";
    const copyWait = Math.min(Math.max(Math.floor(input.copy_wait_seconds ?? 120), 30), 600);
    const today = String(await ctx.now()).slice(0, 10);

    const refresh = async (columns: string[], tag: string, seconds: number) => {
      for (const column of columns) {
        await ctx.tools.run("oxygen_columns_run", {
          table: BUYERS, column, selection: { mode: "all" }, force: true, background: true,
        }, { key: `refresh-${tag}-${column}` });
      }
      await ctx.wait(`let-${tag}-refresh`, { seconds });
    };
    const readBuyers = async (key: string) => rowsOf(await ctx.tools.run("oxygen.rows_query", {
      table: BUYERS,
      fields: ["linkedin_url", "full_name", "company_name", "persona", "channel", "ready", "routed_to", "outbound_copy", ...COPY_FIELDS],
      limit: 5000,
    }, { key })).filter((row) => (row.ready === true || row.ready === "true") && !row.routed_to);

    // 1. Free refresh of the stored values `ready` and the copy depend on.
    if (!audit) await refresh(REFRESH, "inputs", 45);
    let ready = await readBuyers("read-ready");
    ctx.log("info", "w3.ready", { ready: ready.length, audit });
    if (audit || ready.length === 0) return { audit, ready: ready.length };

    // 2. Write the copy for ready buyers that have none yet.
    const needCopy = ready.filter((row) => !row.outbound_copy).map((row) => String(row._row_id));
    if (needCopy.length > 0) {
      await ctx.tools.run("oxygen_columns_run", {
        table: BUYERS,
        column: "outbound_copy",
        selection: { mode: "row_ids", row_ids: needCopy },
        approved: true,
        max_credits: Math.ceil(needCopy.length * COPY_CREDITS_PER_ROW),
        idempotency_key: `w3-copy-${needCopy[0]}-${needCopy.length}`,
      }, { key: "write-copy" });
      await ctx.wait("let-copy-land", { seconds: copyWait });
    }
    await refresh(COPY_FIELDS, "copy", 30);
    ready = (await readBuyers("read-with-copy")).filter((row) => row.copy_subject && row.copy_email_1);
    if (ready.length === 0) return { ready: 0, note: "no buyer has copy yet; run again" };

    // 3. Human approval before anyone is enrolled.
    const approval = await ctx.approvals.require({
      label: "enroll-ap-buyers",
      estimated_credits: 0,
      summary: `Enroll ${ready.length} buyers into the draft Sequence ${SEQUENCE}. ` +
        `Sample subject: "${String(ready[0].copy_subject).slice(0, 80)}" (${ready[0].full_name}, ${ready[0].company_name}).`,
    });
    if (!approval?.approved) return { ready: ready.length, enrolled: 0, approved: false };

    // 4. Enroll (sends nothing; the Sequence stays a draft) and mark the rows.
    await ctx.tools.run("oxygen_sequences_enroll", {
      sequence: SEQUENCE,
      leads: ready.map((row) => ({ table_row_id: String(row._row_id), lead_profile_url: row.linkedin_url, lead_name: row.full_name })),
      exclude_contacted: true,
    }, { key: "enroll" });
    await ctx.tools.run("oxygen.rows_upsert", {
      table: BUYERS,
      key: "linkedin_url",
      return: "summary",
      rows: ready.map((row) => ({ linkedin_url: row.linkedin_url, routed_to: `${SEQUENCE} ${today}` })),
    }, { key: "mark-routed" });
    return { ready: ready.length, enrolled: ready.length };
  },
});
