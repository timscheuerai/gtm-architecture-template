# Validation — 2026-09-14

Validated using `oxygen-dev` CLI 1.927.2 against the OXYGEN dev API 1.978.2/1.978.3. The CLI reported compatible version skew. Production was not exercised.

| Check | Result |
|---|---|
| Local contract and behaviour tests | 13 passed, including execution of the exact generated code in an isolated VM |
| Function setup in dev | Seven callable backing tables registered; six workflows installed disabled |
| Hosted deterministic runs | All six completed in `dry_run`; each returned a zero-credit receipt with no paid provider calls or external writes |
| Portable blueprint preflight | Passed with no issues, using explicit references to the tables already installed by setup |
| Company scoring preview | Rendered a synthetic row's evidence and rubric into the actual prompt |
| First-touch preview | Rendered the supplied evidence, fixed CTA and experiment IDs |
| Company research preview | Resolved the research column with web grounding enabled |
| Email-waterfall preview | Resolved the native enrichment definition and current credit estimate |
| Callable composition | Bound company scoring to a separate working table and previewed its mapped input/output callback |

The preview exposed that an initial 20-credit callable ceiling was below the dev estimate. The shipped configurable ceiling is 100 credits per item. This is a cap, not a price promise; inspect your destination's current one-row estimate before choosing a live cap.

The examples checked these behaviours in the hosted runtime: stable variant assignment, source deduplication with both signals retained, separate company/persona qualification, bounded ranking, an unreviewed message held from handoff, and cohort results requiring review. Local tests additionally cover stale/future timestamps, high scores with disqualifications, suppressed contacts, duplicate events, orphan outcomes and conflicting experiment metadata.

## Not tested live

No model generation, web research, email discovery, verification or outbound delivery was executed. The ten-company expected-score fixture is a calibration target, not an observed model result. Before releasing a campaign, replace examples with real reviewed inputs and run a small paid pilot under your chosen cap.

No native Sequence is installed or connected by this kit. Provider-event normalisation, source acquisition and the complete cross-function orchestration remain specific to the motion you build. See [composition.md](composition.md).

Reproduce the local checks with `npm run build && npm test`. Reproduce installation, examples and previews with the README commands. Workspace IDs and run receipts are kept locally under `.oxygen/` and are excluded from the public template.
