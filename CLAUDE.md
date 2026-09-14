# Working in this template

Read README.md and the selected skill or function definition before editing it. Start at `docs/first-batch.md` for a first pilot. Skills live only in `.agents/skills/`; `.claude/skills` points there. Read `context/AGENTS.md` for author context work; context skill paths resolve from `context/`. Use the destination OXYGEN CLI's `whoami`, `commands get`, and relevant schemas to verify grammar. Default to `oxygen`; use `oxygen-dev` when the operator selects dev.

Source functions and prompts are authored locally. Production rows, paid work, callbacks and scheduling belong to hosted OXYGEN Tables and Workflows; outreach belongs to native Sequences.

Run `npm run build` after changing a deterministic source or contract. Run `npm test` to validate fixtures and the exact generated workflow sources. Keep generated definitions in Git. A live paid run is a separate operation with an explicit row scope and credit ceiling.

For skill changes, update `skills/catalog.json`, run `npm run build` and `npm run check:kit`. For context changes run `npm run check:context` (Python 3). Keep the root `CLAUDE.md` identical to this file. The offline demo executes only synthetic fixtures; do not extend it into a local production scheduler, provider runner or sending service. Regenerate `examples/demo/report.md` deliberately if the demo's behavior changes.

External tool and provider procedures must inspect the actual installed capabilities. No missing renderer, uploader, registrar client or mailbox connection may be described as bundled. Drafting, installing definitions and publishing or sending are separate actions; follow the user's actual authorized scope without repeating approval requests.

Never commit CLI credentials, `.oxygen/` state, real prospect exports or private company knowledge. Example companies and people are synthetic. Read `docs/composition.md` before joining stages: the diagram is an intended motion, not proof that all stages are wired.
