---
name: signal-account-engine
description: Build a signal-scored outbound engine in OXYGEN: source the TAM, enrich and fit-score companies, layer hiring and leadership signals into a free score and tier, then find, fit-score and enrich buyers only at Tier A and B accounts and route them to draft Sequences behind an approval.
---

# Build the signal-scored account engine

Read [the AP automation worked example](../../../examples/ap-automation-signal-engine/README.md) first. It is the same engine built end to end, with every column, workflow, cost and lesson.

Score every account on cheap account-level signals first, pay for contacts only at the top tier, and open each message with the trigger that put the account there. One weak signal alone never starts outreach.

## The engine

1. **Knowledge.** Write the ICP, the buyers and the signal weights as pages ([oxygen-knowledge](../oxygen-knowledge/SKILL.md)). Every score reads them.
2. **Source the TAM** ([oxygen-sourcing](../oxygen-sourcing/SKILL.md)). One Accounts table keyed on the company LinkedIn URL, so every source dedupes into one row.
3. **Enrich the company** only where the source left gaps ([oxygen-enrichment](../oxygen-enrichment/SKILL.md)).
4. **Score company fit** with a Classify column against the ICP page. Fit C stops spend.
5. **Layer signals** ([oxygen-signals](../oxygen-signals/SKILL.md)): hiring tables with an AI filter, a free formula that names the ERP from each job ad, a free ContactOut count of new finance leaders, past champions. Free lookups count them per account; free formulas turn them into points with freshness decay and a stacking bonus, then a tier.
6. **Find the buyer** at Tier A and B accounts only: a cheap people search first, ContactOut where it finds nobody.
7. **Score persona fit** with a Classify column against the buyers page; a misfit sends the search to the next role.
8. **Contact waterfall.** Work email Blitz first, ContactOut on a miss (billed on a hit), verification, then LinkedIn steps only when no email is verified.
9. **Route** ([oxygen-workflow-authoring](../oxygen-workflow-authoring/SKILL.md), [oxygen-sequencer](../oxygen-sequencer/SKILL.md)): ready buyers go to the Sequence for their account's top trigger, behind a human approval. Sequences stay drafts until someone starts them with a send ceiling.

## Rules

- Columns for work inside one table; Workflows only where work crosses tables or runs on a schedule. OXYGEN Workflows replace the glue scripts that usually connect these steps.
- Store formula and lookup values with a free forced run before lookups, AI columns or run conditions read them.
- Every paid step previews, pilots one row and runs under an approved ceiling.
- Prove the score: backtest the signals behind recent meetings, then compare meetings per 100 accounts by tier after 30 days.
