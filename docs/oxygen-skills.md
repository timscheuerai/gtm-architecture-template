# Use the OXYGEN skills

These 12 additional skills operate native OXYGEN surfaces and connect to the kit's existing functions. They are adapted from the current OXYGEN skill catalog. Exact commands, available integrations and costs are discovered in the reader's workspace.

## First hosted session

> Use oxygen-quickstart. Inspect my selected workspace and the kit's setup plan, then help me install the functions. Keep the first walkthrough on the supplied synthetic rows.

Start with [oxygen-quickstart](../.agents/skills/oxygen-quickstart/SKILL.md). Use [oxygen-gtm](../.agents/skills/oxygen-gtm/SKILL.md) when the right native surface is unclear, or [oxygen-recipes](../.agents/skills/oxygen-recipes/SKILL.md) to inspect a business play before installing it.

The [function installer](oxygen-setup.md) already creates the kit's resources. A skill should inspect and reuse them rather than silently install an equivalent second set.

## Context and composition

> Use oxygen-knowledge to find the workspace's ICP and offer pages. Show which revisions should feed score_company_icp and generate_first_touch. Then use oxygen-workflow-authoring to draft the missing stage mappings.

[Knowledge](../.agents/skills/oxygen-knowledge/SKILL.md) keeps context sourced and versioned. [Workflow authoring](../.agents/skills/oxygen-workflow-authoring/SKILL.md) covers typed graphs, triggers, lint, previews and durable runs. A page existing in Knowledge does not prove its content was mapped into a callable; inspect the actual binding in [composition](composition.md).

## Outreach readiness

> Use oxygen-email-infra and oxygen-deliverability to inspect my sender readiness. Use oxygen-sequencer to prepare a preview for the contacts passing prepare_sequence, including the actual messages, recipients and limits.

[Email infrastructure](../.agents/skills/oxygen-email-infra/SKILL.md) handles sender profiles, authentication, warmup and native provisioning. [Deliverability](../.agents/skills/oxygen-deliverability/SKILL.md) inspects evidence and remediation. [Sequencer](../.agents/skills/oxygen-sequencer/SKILL.md) owns cadence and delivery controls; [the kit enrollment adapter](../.agents/skills/oxygen-sequencer-enroll/SKILL.md) handles its function output mapping.

Provider-specific domain-buying and mailbox-setup skills are not required. The native setup discovers whichever supported configuration the user chooses. A readiness preview is separate from paid provisioning or live outreach.

## Content and replies

> Use linkedin-copywriter to draft a post about a supported lesson from this project. Use oxygen-linkedin-marketing to prepare its native publishing and engagement plan. Use oxygen-unibox to draft replies in existing conversations.

[LinkedIn marketing](../.agents/skills/oxygen-linkedin-marketing/SKILL.md) connects Posts, Publishing, Signals, qualification and bounded Sequences. [Unibox](../.agents/skills/oxygen-unibox/SKILL.md) works existing threads. Public post comments, new DMs and existing-thread replies have different native owners. Preserve the actual user's publishing and sending scope.

## Operate the result

> Use oxygen-diagnostics to explain this failed row and show a bounded retry plan. Use oxygen-table-tidy to make the table easier to inspect while keeping raw evidence and downstream dependencies.

[Diagnostics](../.agents/skills/oxygen-diagnostics/SKILL.md) follows cell/run provenance and actual credit receipts. [Table tidy](../.agents/skills/oxygen-table-tidy/SKILL.md) improves structure and presentation; it is separate from record deduplication. Neither a retry nor a cosmetic tidy should silently repeat a paid run or external send.

The package checks validate discovery, links and deterministic examples. They do not claim a live campaign, model calibration or end-to-end execution of every skill. See [validation](validation.md).
