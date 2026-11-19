# AP automation signal engine

A worked example from the ContactOut x GTM Collective webinar (2026-11-19), built live in OXYGEN for an invented AP automation company. It sources accounts, enriches and fit-scores them, layers signals into one free score, and pays for contacts only at the top tier.

![The outbound engine](diagrams/ap-outbound-engine.png)

## The case

An AP automation company works about 1,800 accounts a month at a 2.1% reply rate for 9 meetings. Its problems: too many weak signals, no single account score, and enrichment costs that keep rising, because every account pays for contacts before anyone knows it matters.

The engine scores every account on cheap account-level signals first, enriches contacts only at Tier A and B, and opens each message with the trigger that put the account there. One weak signal alone never starts outreach.

The ICP, buyers and signal weights are invented for the demo and live in [knowledge/](knowledge).

## The eight stages

| # | Stage | Built with | Measured cost |
|---|---|---|---|
| 01 | Source the TAM | Accounts table from Blitz company search, deduped on the company LinkedIn URL | 4 credits for 196 accounts (1 per 50) |
| 02 | Enrich the company | `company_enrich` preset, only where the source left gaps; a free formula names the ERP from job ads | about 1 credit a company; formula free |
| 03 | Score company fit | AP Company Fit, a Classify column (A/B/C) against the ICP page | 0.075 a row |
| 04 | Layer signals, set the tier | 4 hiring tables with an AI filter, free ContactOut count of new finance leaders, free lookups and score formulas | 14.25 per hiring family; count, lookups and formulas free |
| 05 | Find the buyer | Blitz people search at Tier A/B accounts; ContactOut people search where Blitz found nobody | Blitz 1 credit per 50 people; ContactOut 16.5 per person |
| 06 | Score persona fit | AP Persona Fit, a Classify column: economic buyer, champion, user or no fit | 0.075 a row |
| 07 | Contact waterfall | Work email Blitz first, ContactOut on a miss; MillionVerifier, BounceBan on catch-all; LinkedIn only without a verified email | Blitz 1.5 and ContactOut 16.5 per hit, nothing on a miss |
| 08 | Prioritized outbound | Why-now line and an AI research agent on Tier A/B accounts, short AI copy per buyer (why-now + pain + a free resource offer), 1 draft Sequence, approval before enrollment | why-now about 4 a row, research about 2.1 a row, copy about 4 a buyer |

Column-by-column definitions, prompts and formulas: [tables.md](tables.md).

## What the build produced

**First pass, Blitz signals only:** 385 accounts → 180 Fit B (0 Fit A) → 3 Tier B → 1 buyer. A market-wide sample rarely hits the same company twice, so single signals stayed below the line.

**With the ContactOut layer:** 385 accounts → 180 Fit B → 82 with a new finance leader → **7 Tier A + 3 Tier B** → 13 buyers → 12 emails (4 found by ContactOut) → 1 approval to enroll 13. About 480 credits in total. Nothing was sent.

- **How Tier A happens:** fresh AP or CFO hiring, a finance leader new in the seat, and the stacking bonus. An aerospace parts maker with 4 AP postings scored 25 + 20 + 10 = 55.
- **Tier B:** fresh ERP-migration postings at a furniture manufacturer naming SAP, a construction firm naming Microsoft Dynamics and a logistics software firm naming NetSuite.
- **The weak-signal rule worked:** single AP, CFO or audit postings scored 15 to 25 and stayed Tier C.
- **The size gate stopped spend:** a defense contractor, a big-box retailer and an EV maker all name SAP in their job ads and stayed Fit C on size.
- **Why-now spend:** about 4 credits a row at Tier A/B only. The same column on all 385 accounts would cost about 1,540.
- **Buyers:** CFOs (economic buyers), controllers (champions) and AP managers (users). MillionVerifier checked every email; BounceBan ran on the one catch-all.
- **Outbound:** the research agent read the 10 Tier A/B accounts (cited), the AI copy was written for every ready buyer, and W3 stopped at its approval to enroll 11 buyers into the one draft Sequence. The research and copy add roughly 75 credits per pass.

![How the engine is wired](diagrams/ap-engine-wiring.png)

## ContactOut in the engine

The webinar was co-marketed with ContactOut, which slots into four places:

1. **Size the pool for free.** `contactout.people_count` takes up to 50 domains and a list of titles per call and costs nothing. At the 179 Fit B accounts it counted 820 finance buyers, about 98% of them with an estimated work email.
2. **A new-CFO signal nobody else covers.** The same free count with `years_in_current_role: ["0_1"]`, run once per account, finds finance leaders in their first year. W1b found one at 82 of 180 fit accounts and writes the count to Accounts as a 20-point signal. It is the layer that turned single hiring signals into Tier A.
3. **The waterfall.** Work email runs Blitz first and ContactOut on a miss, billed only on a hit. In the build ContactOut found 4 of the 12 emails, all ones Blitz missed. The free `work_email_status` and `phone_status` checks say whether ContactOut holds the data before you pay; phone runs for Tier A only.
4. **Past champions.** `contactout.email_profile_enrich` turns a former customer contact's old work email into their current profile, so a job change shows up (16.5 credits a check).

## Outbound, simplified: research, short copy, 1 Sequence

Instead of 1 Sequence per trigger, every ready buyer gets copy written for them, and 1 Sequence sends whatever was written.

1. **AI research agent** on each Tier A/B account (quick web research, cited): a snapshot, the finance stack if public, and 1 AP angle grounded in a fact.
2. **Short AI copy** per buyer: the why-now fact, the pain it usually brings for AP (with 1 research detail), and an offer of a free resource. The demo's resource is fictional: "our 2026 AP benchmark".
3. **1 draft Sequence** reads the copy columns.
4. **Approval** before anyone is enrolled.

The copy style, 25 to 45 words (the prompt's own example):

> Hi Dana, saw Northwind is hiring for its SAP move. That's usually when AP gets messy: invoices still run the old way while the new system goes live. Want our AP benchmark for teams your size?

## The strategy: run both paths

Building got easy, so run both instead of choosing:

- **Coverage path:** every fit account in your TAM gets 1 touch every 90 days, as far as sending capacity allows. This matters most with a small TAM.
- **Signal path:** fresh signals push accounts to the front, Tier A/B now, with the trigger in the first line.
- **Both are evergreen:** signals refill weekly, and the coverage queue rotates every 90 days.

In this example the signal path is built; Fit A/B accounts that stay Tier C are the coverage queue (not built yet).

## Build it live: "build that system"

[build_engine.py](build_engine.py) rebuilds the whole engine in a folder of your choice, step by step, with a link per step. This is the webinar's live moment: say "build that system" to your coding agent with this repo open. It creates:

- the Accounts and the 4 hiring tables;
- every column and Buyers;
- the Sequence;
- the 4 workflows, applied and enabled with on-demand triggers.

`--run` then runs W1, W1b, W2 and W3; W3 stops at its approval.

```sh
python3 build_engine.py --folder "AP engine · Live build" --label Live --prefix live --plan   # price only
python3 build_engine.py --folder "AP engine · Live build" --label Live --prefix live --run    # build and run
```

- **Requirements:** the `oxygen` CLI, logged in; `--profile` picks a stored profile.
- **Knowledge pages:** create your own 3 pages from [knowledge/](knowledge) first (the script checks the demo slugs and only prints a hint when they are missing).
- **Defaults:** 100 accounts and 1 page of job ads per hiring family.
- **Spend:** every paid step runs under a ceiling, and the plan prints the price first.
- **Resume:** existing tables, columns, Sequences and workflows are reused, so re-running resumes after a stop.
- **Content step:** `--content` (results, a LinkedIn post and an animated GIF) is not in this kit yet.

## Workflows

Recipe source in [workflows/](workflows). Each runs on demand here; the production schedule is in a comment at the top of each file. OXYGEN Workflows replace the glue scripts (for example in n8n) that usually connect these steps.

| Workflow | What it does | Ceiling per run |
|---|---|---|
| W1 Signals into Accounts | Stores the signal formulas, adds kept hiring companies that are new to Accounts, enriches them, waits, stores the fit inputs, then runs AP Company Fit on every account without a fit (`rescore: true` re-scores all), so all scoring happens in the workflow | 400 |
| W1b New finance leaders | Free ContactOut count of leaders under 1 year in role per Fit A/B account | 20 (the counts are free; each workflow step is metered at about 0.05) |
| W2 Tier A/B to buyers | Stores the Accounts values, finds buyers (Blitz, then ContactOut), writes why-now, runs the AI research agent, persona fit, the email waterfall, MillionVerifier and BounceBan on catch-all | 250 |
| W3 Write the copy and route | Writes the AI copy for ready buyers, **pauses for a human approval** that shows the count and a sample subject line, then enrolls them into the 1 draft Sequence | 80 |

Next: W4 reads each account's SPF record weekly through a DNS-over-HTTPS GET (the native `oxygen.http_json_request` step, or a custom HTTP integration) and records newly added finance vendors as signals. W5 checks past champions monthly.

## Lessons from the build

1. **Stored values.** Formulas and lookups show live in the grid, but cross-table lookups, AI inputs and run conditions read the stored cell. Every lookup returned 0, the why-now AI saw blanks, and the persona run condition was skipped. The fix is a free `oxygen columns run <table> <column> --all --force --background` before anything reads those values; each workflow starts with it.
2. **Join on the company LinkedIn URL.** Hiring postings carry no domain. Each posting does carry the company LinkedIn URL and an AI summary of the description, which is what makes free ERP detection work.
3. **Blitz people coverage is thin at 150 to 600 employees.** ContactOut's count found 820 buyers where people search found a handful, so W2 falls back to ContactOut.
4. **Formula booleans are stored as text.** `ready` stores "true", so a run condition `ready = true` never fires. Write `text(ready) = "true"`.
5. **Re-applying a recipe disables the workflow.** Enable it again after every `oxygen workflows apply`.
6. **Free tools still meter workflow steps.** W1b's ContactOut counts are free, but each step costs about 0.05 credits; a 1-credit ceiling stopped it. Give free loops a small ceiling.
7. **Short copy wins.** The first AI copy was friendly but long. The version that works opens with the why-now fact, names the pain in 1 line and offers the resource in 1 question, 25 to 45 words.

## Product gaps we hit

1. A watch-list hiring search (`signals search run --scope watch_list --domains ...`) routes to a provider that selects accounts by LinkedIn URL, drops the domains and leaves the request with no account selector. Do not run it; pass LinkedIn URLs or call the tool per account from a recipe.
2. The `company_enrich` preset keeps its own run condition and ignores a `--run-condition` passed at creation. Limit its spend by running it on exact row ids.
3. A `verify_email` column takes one verifier. Add BounceBan as a separate tool column behind a catch-all run condition.

## Run it in your workspace

Use the [signal-account-engine](../../.agents/skills/signal-account-engine/SKILL.md) skill with this folder open, or follow these steps. Preview and approve every paid step with its own ceiling.

1. Create a tables folder and a knowledge folder; save the three [knowledge](knowledge) pages with your own ICP.
2. Preview your accounts free (`oxygen companies search preview --filters-json ...`), then run the search live into an Accounts table.
3. Create the four hiring tables with `oxygen signals search run --family hiring` (keywords and AI filters in [tables.md](tables.md)), then add the free formulas.
4. Add the Accounts and Buyers columns from [tables.md](tables.md).
5. Lint and apply the recipes: `oxygen workflows lint --file workflows/w1-signals-into-accounts.ts --json`, then `oxygen workflows apply --file ... --approved --max-credits <n> --json`. Call each with `{"audit": true}` first.
6. Create the Sequence as a draft: `oxygen sequences create --name "Benchmark offer" --slug ap-webinar-benchmark --steps-file spec/sequences/benchmark-offer.json --table buyers --url-column linkedin_url --max-credits 0 --json`. Attach senders and start only with a send ceiling you approve.

Or let [build_engine.py](build_engine.py) do steps 1 to 6 for you (next section).

## Files

- [knowledge/](knowledge): the invented ICP, buyers, and signal weights and tiers.
- [tables.md](tables.md): every table and column, with prompts, formulas and run conditions.
- [workflows/](workflows): W1, W1b, W2 and W3 recipe source.
- [spec/](spec): the prompts (fit, persona, why-now, research, copy), the account filters, the ERP formula and the Sequence steps.
- [build_engine.py](build_engine.py): rebuilds the whole engine in any folder.
- [diagrams/](diagrams): the outbound-engine map and the wiring map.

**Webinar code WEBINAR50:** $50 off your first OXYGEN credit top-up (minimum $51, until 2026-12-31, first 100 redemptions).
