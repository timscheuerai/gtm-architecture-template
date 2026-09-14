# Using OXYGEN from the skills

Skills choose and review work. Functions have declared inputs/outputs. Production records, paid execution, callbacks and schedules live in hosted OXYGEN; delivery lives in native Sequences.

Use `oxygen` by default. Use `oxygen-dev` only when the operator selects dev. Discover the current interface before constructing commands:

```sh
oxygen whoami --json
oxygen capabilities search "research and qualify accounts" --json
oxygen commands get "tables create" --json
oxygen tools search "company research" --json
```

Hydrate the actual recommended command or provider schema before use. Verify identity, workspace, selected resource IDs, inputs, output mapping, scope and cost. Examples in older repositories are not current API documentation.

The [setup guide](oxygen-setup.md) installs this kit's 13 definitions. `npm run setup` previews the resources; `--apply` creates them. `npm run status` reads installation state. Setup does not run paid functions or connect an entire campaign.

The [composition guide](composition.md) shows callable binding, input/output mapping and the Sequence handoff. Use `.oxygen/gtm-architecture.json` for this installation's recorded IDs; it is ignored by Git. Never copy another workspace's IDs into a public template.

Use [the OXYGEN skill guide](oxygen-skills.md) to choose the native procedure for context, orchestration, delivery or ongoing operations. Provider-specific procurement/setup skills are not bundled; `oxygen-email-infra` discovers native options and their current quotes.

For a real operation, distinguish:

1. Definition installed.
2. One-row prompt/cost preview or deterministic dry run inspected.
3. Live run authorized for specific rows with a credit ceiling.
4. Result verified and reviewed.
5. Delivery explicitly within the user's scope, with actual native checks applied.

A preview is not model output. A successful API request is not proof of completed processing. Read back state after writes; query before retrying ambiguous results. Continue within existing user authorization without asking for the same permission again.
