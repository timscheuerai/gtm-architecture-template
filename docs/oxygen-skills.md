# Use the OXYGEN skills

These 21 skills operate native OXYGEN surfaces and connect to the kit's existing functions. They are adapted from the current OXYGEN skill catalog (retrieved 2026-11-19). Exact commands, available integrations and costs are discovered in your workspace.

## First hosted session

> Use oxygen-onboarding. Read my company brief, show five real matches for my ICP and save about ten first leads with why each fits.

Start with [oxygen-onboarding](../.agents/skills/oxygen-onboarding/SKILL.md) for a first campaign, or [oxygen-quickstart](../.agents/skills/oxygen-quickstart/SKILL.md) for a safe product tour. Use [oxygen-gtm-consultant](../.agents/skills/oxygen-gtm-consultant/SKILL.md) when something already runs and you want a diagnosis and a pilot. [oxygen-gtm](../.agents/skills/oxygen-gtm/SKILL.md) routes any other outcome, and [oxygen-recipes](../.agents/skills/oxygen-recipes/SKILL.md) finds a proven play to borrow.

The [function installer](oxygen-setup.md) already creates the kit's resources. A skill should inspect and reuse them rather than silently install an equivalent second set.

## Build the account engine

> Use signal-account-engine and the AP automation worked example. Build an Accounts table for my ICP, add two hiring signals and a free score, and stop before any spend over 20 credits.

| Stage | Skill |
|---|---|
| Find new accounts and buyers | [oxygen-sourcing](../.agents/skills/oxygen-sourcing/SKILL.md) |
| Columns, formulas, Classify fit scores, lookups, feeds | [oxygen-tables](../.agents/skills/oxygen-tables/SKILL.md) |
| Company facts, work email, phone, verification, ContactOut in the waterfall | [oxygen-enrichment](../.agents/skills/oxygen-enrichment/SKILL.md) |
| Hiring, tech, funding and engagement signals | [oxygen-signals](../.agents/skills/oxygen-signals/SKILL.md) |
| Canonical records, CRM imports and syncs | [oxygen-crm](../.agents/skills/oxygen-crm/SKILL.md) |
| Your own REST API as tools | [oxygen-custom-http](../.agents/skills/oxygen-custom-http/SKILL.md) |

[signal-account-engine](../.agents/skills/signal-account-engine/SKILL.md) ties them together, and [the AP automation worked example](../examples/ap-automation-signal-engine/README.md) shows the whole build with measured costs.

## Context and composition

> Use oxygen-knowledge to find the workspace's ICP and offer pages. Show which revisions should feed score_company_icp and generate_first_touch. Then use oxygen-workflow-authoring to draft the missing stage mappings.

[Knowledge](../.agents/skills/oxygen-knowledge/SKILL.md) keeps context sourced and versioned. [Workflow authoring](../.agents/skills/oxygen-workflow-authoring/SKILL.md) covers graphs, durable recipes, triggers, previews and capped runs. A page existing in Knowledge does not prove its content was mapped into a callable; inspect the actual binding in [composition](composition.md).

## Outreach readiness

> Use oxygen-email-infra and oxygen-deliverability to inspect my sender readiness. Use oxygen-sequencer to prepare a preview for the contacts passing prepare_sequence, including the actual messages, recipients and limits.

[Email infrastructure](../.agents/skills/oxygen-email-infra/SKILL.md) handles sender profiles, authentication, warm-up and native provisioning. [Deliverability](../.agents/skills/oxygen-deliverability/SKILL.md) inspects evidence and remediation. [Sequencer](../.agents/skills/oxygen-sequencer/SKILL.md) owns cadence, send ceilings and delivery controls; [the kit enrollment adapter](../.agents/skills/oxygen-sequencer-enroll/SKILL.md) handles its function output mapping. A readiness preview is separate from paid provisioning or live outreach.

## Content and replies

> Use linkedin-copywriter to draft a post about a supported lesson from this project. Use oxygen-linkedin-content and oxygen-publishing to save it as a draft for approval. Use oxygen-unibox to draft replies in existing conversations.

[LinkedIn content](../.agents/skills/oxygen-linkedin-content/SKILL.md) grounds and writes drafts; [Publishing](../.agents/skills/oxygen-publishing/SKILL.md) owns approval, scheduling and delivery. [Unibox](../.agents/skills/oxygen-unibox/SKILL.md) works existing threads. Public post comments, new DMs and existing-thread replies have different native owners. Preserve the actual user's publishing and sending scope.

## Operate the result

> Use oxygen-diagnostics to explain this failed row and show a bounded retry plan. Use oxygen-table-tidy to make the table easier to inspect while keeping raw evidence and downstream dependencies.

[Diagnostics](../.agents/skills/oxygen-diagnostics/SKILL.md) follows cell and run provenance and actual credit receipts. [Table tidy](../.agents/skills/oxygen-table-tidy/SKILL.md) improves structure and presentation; it is separate from record deduplication. Neither a retry nor a cosmetic tidy should silently repeat a paid run or external send.

The package checks validate discovery, links and deterministic examples. They do not claim a live campaign, model calibration or end-to-end execution of every skill. See [validation](validation.md).
