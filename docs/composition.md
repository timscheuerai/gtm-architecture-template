# Compose a motion

The installation prints function names; `npm run status` reports workspace-local table IDs and callable slugs. Those IDs are kept in `.oxygen/`, which Git ignores. Re-running setup resumes the same installation. Losing that state file and installing again can create additional tables; preserve it or use a new prefix deliberately.

## Bind a function to your working table

Start with a table containing `company_evidence` (JSON), `icp_rubric` (text) and an empty `company_fit` (JSON) output column. Evidence must come from the company research step or facts you reviewed. The rubric comes from the company knowledge you maintain.

```sh
oxygen callables describe gtm-architecture-score-company-icp --json
oxygen callables bind YOUR_TABLE gtm-architecture-score-company-icp \
  --key score_company --label 'Score company' \
  --inputs-json '{"company_evidence":"company_evidence","icp_rubric":"icp_rubric"}' \
  --outputs-json '{"result":"company_fit"}' --json
oxygen columns run YOUR_TABLE score_company --row-id YOUR_ROW_ID --dry-run --json
```

The binding creates a reusable action on your source table. OXYGEN executes the backing table and writes its `result` into `company_fit`. It owns the durable run and callback; you do not run a local row loop.

After reviewing the exact row, rendered prompt and credit estimate, a live run is explicit:

```sh
oxygen columns run YOUR_TABLE score_company --row-id YOUR_ROW_ID \
  --approved --max-credits YOUR_CHOSEN_CAP --json
oxygen table-runs wait RETURNED_RUN_ID --json
oxygen tables query YOUR_TABLE --limit 10 --json
```

Use IDs returned by your installation, not IDs from someone else's workspace. Do not automatically retry a live provider operation after an ambiguous timeout; inspect its run first.

## Map the stages

| From | Into | Mapping and gate |
|---|---|---|
| List/signal input | `normalise_sources` | Supply `company_domain`, `source`, `signal_type`, `observed_at_ms`; retain the returned signal array. |
| `enrich_company.result` | `score_company_icp.company_evidence` | Supply your rubric separately; check citations and missing fields. |
| Company fit | `prioritise_accounts.candidates` | `score` becomes `company_score`. Pass `disqualified` as `company_disqualified`; it must explicitly be false, even when the score is high. Supply fresh signal strength and timestamp separately. |
| Selected accounts | `find_person` | Pass company domain, persona rubric and excluded profiles. Stop when capacity or your retry limit is reached. |
| Candidate | `enrich_person` | Pass the exact profile URL, target employer and known evidence; hold missing identities. |
| Enriched person | `score_persona_icp` | Pass the person's evidence and persona rubric, independently of company fit. |
| Company/persona scores | `prioritise_contacts` | Both thresholds must pass; pass `company_disqualified` and `persona_disqualified` as explicit booleans. Missing or true flags hold the contact. Preserve known suppression status. |
| Selected contact | `enrich_contact_details` | Pass full name, company domain and exact LinkedIn URL; inspect the native payload and verification outcome. |
| Qualified, verified contact | `assign_test_variant` | Use normalised company domain as `account_key`. Persist the returned IDs. Never reorder variants or change assignment rules inside a round. |
| Evidence + assignment | `generate_first_touch` | Supply the correct fixed copy/CTA as `assigned_copy`, allowed offer claims and pinned version IDs. Check returned IDs against the stored assignment. |
| Reviewed message | `prepare_sequence` | Map the verifier's documented **valid** status and checked timestamp. Unknown, catch-all and missing verification must be held. Pass the exact reviewed message and current capacity. |
| Native Sequence events | `analyse_results` | Normalise to the example's event contract. Preserve enrollment, test round, group, variant and prompt version. Include delivered events in the same window as outcomes. |

The priority functions rank a bounded supplied batch. Query candidate rows from OXYGEN in a hosted Workflow and map their values to the declared input. Do not silently treat a sample of ten rows as the entire workspace queue.

## Native sending

The kit does not create or activate a Sequence. Discover the current command contract in your destination workspace:

```sh
oxygen capabilities search 'enroll qualified contacts into an existing sequence' --json
oxygen commands get 'sequences enroll' --json
oxygen tools search 'sequence enroll' --workflow-eligible --json
```

Hydrate the exact selected tool before authoring its node. For a recurring motion, the hosted Workflow enrols into the already configured native Sequence. Do not substitute raw provider sends. Keep the persisted variant and prompt version with the enrollment, and let the Sequence recheck current suppression, capacity and reply-stop state.

## Learning

`analyse_results` groups by round, audience group, variant and prompt version. It deduplicates enrollments, counts positive replies and meetings only against delivered enrollments, and flags orphan outcomes. Its sample floor only tells you whether your preset review threshold was reached.

Write the observed result and proposed change into your learning store. Review the proposal before changing maintained ICP/persona/offer definitions. Run one changed variable in the next round and retain the old configuration.

Deterministic workflow timestamps use Unix epoch **milliseconds**, including `as_of_ms`, `observed_at_ms` and `verified_at_ms`. Bind these explicitly from your event records. They never read an ambient clock, so a replay uses the same time reference.
