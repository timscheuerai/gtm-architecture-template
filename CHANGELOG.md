# Changelog

## 0.4.1 · 2026-11-19

- The AP example now reports the run with the ContactOut layer. Free counts of new finance leaders lift it to 7 Tier A and 3 Tier B accounts and 13 buyers, and ContactOut found 4 of the 12 emails.
- Added the "How the engine is wired" map and refreshed "The outbound engine" map, both ending with the take-it-home panel.
- W2 now verifies every found email with MillionVerifier and sends catch-all addresses to BounceBan.

## 0.4.0 · 2026-11-19

- Added the [AP automation signal engine](examples/ap-automation-signal-engine/README.md) worked example from the ContactOut x GTM Collective webinar: invented ICP, buyers and signal weights; every table, formula and prompt; recipes W1, W1b, W2 and W3; four draft Sequences; measured costs and the funnel.
- Added `signal-account-engine`, a GTM skill that builds the engine in any workspace.
- Added nine native OXYGEN skills: `oxygen-onboarding`, `oxygen-gtm-consultant`, `oxygen-tables`, `oxygen-enrichment` (with ContactOut in the waterfall), `oxygen-sourcing`, `oxygen-signals`, `oxygen-crm`, `oxygen-custom-http` and `oxygen-publishing`.
- Replaced `oxygen-linkedin-marketing` with `oxygen-linkedin-content`, matching the current OXYGEN catalog.
- Re-adapted eleven OXYGEN skills from the 2026-11-19 catalog: `oxygen-gtm`, `oxygen-quickstart`, `oxygen-recipes`, `oxygen-workflow-authoring`, `oxygen-knowledge`, `oxygen-sequencer`, `oxygen-unibox`, `oxygen-email-infra`, `oxygen-deliverability`, `oxygen-diagnostics` and `oxygen-table-tidy`.
- Updated the catalog to 61 skills and the OXYGEN skill guide to 21 skills.

## 0.3.0 · 2026-09-14

- Removed Boomerang sourcing, ZapMail inbox setup and Cloudflare domain-buying skills.
- Added 12 native OXYGEN skills for setup, GTM routing, Knowledge, Recipes, Workflows, Sequences, Unibox, LinkedIn marketing, email infrastructure, deliverability, diagnostics and table cleanup.
- Connected the new skills to the existing functions and added a guide with concrete operator prompts.
- Updated the catalog to 51 skills while keeping all 13 function templates and the no-account demo.

## 0.2.0 · 2026-09-14

- Centralized 42 GTM, context, content, visual, media and infrastructure skills in one shared library for repository use.
- Added a blank context workspace, company brief, learning note and first-batch guide.
- Added a no-account synthetic demo that exercises six deterministic functions and explains every gate and hold.
- Merged overlapping skills, removed client examples and replaced stale command/missing-script assumptions with current-tool discovery and explicit prerequisites.
- Added catalog/link checks, demo acceptance checks and reproducible package documentation.

## 0.1.0 · 2026-09-14

- Added 13 editable OXYGEN function templates, prompts, synthetic fixtures, installation scripts and portable definitions.
- Validated deterministic dry runs and callable previews against the selected dev environment.
