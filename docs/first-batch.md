# Build your first useful batch

The target is a small account list whose decisions you can explain, one useful message, and one test you can learn from. Start with ten companies you know. The kit does not promise meetings or autonomous end-to-end execution.

## 1. See the decisions before connecting tools

With Node.js 22+, run `npm run demo`. Open `output/demo/report.md` and `output/demo/results.json`.

The default fixture gives **12 source records → 10 valid accounts → 5 selected accounts → 4 qualified contacts → 0 ready messages**. A duplicate account retains both signals; one source is invalid. Company-2 fails the buyer gate. Company-6 is suppressed. Three companies are disqualified. Capacity holds one older-signal account. Messages remain unreviewed with no Sequence selected.

The demo executes the six deterministic functions, using prewritten research, scores, verification and copy. It calls no model or provider. The historical result example is synthetic and separate from the unsent batch.

Try `npm run demo -- --capacity 3` and compare the held reasons. Reruns replace only the generated files in `output/demo/`. [The committed sample report](../examples/demo/report.md) is available without running Node.

## 2. Define what deserves work

Fill [the blank company brief](../company/brief.example.md). Adapt the [company rubric](../company/icp.example.md), [persona rubric](../company/persona.example.md) and [offer](../company/offer.example.md). Keep real inputs in `company/private/` or your own private workspace.

Ask your agent:

> Use gtm-start. Read my brief and help me prepare ten known accounts. Record expected fit decisions before running paid research. Produce accepted and held rows with reasons, plus one first-touch draft.

Use `lead-sourcing` to translate the brief into filters and `oxygen-dedupe` to inspect identities. Keep a source URL and observation date for every signal. Unknown evidence stays unknown.

## 3. Inspect the hosted functions

Follow [OXYGEN setup](oxygen-setup.md). The public CLI is the default; `--cli oxygen-dev` selects dev explicitly. Installing functions creates resources but runs no paid function.

Compare your ten expected decisions with the first real scoring sample after inspecting the prompt and current estimate. A one-row preview alone cannot calibrate quality. Resolve disagreements about evidence or criteria before scaling. Scope any paid call to the selected rows and a credit ceiling.

The [composition guide](composition.md) describes the mappings between stages. Accounts must pass company fit before buyer work. Both gates must pass before contact lookup. Stale signals lose intent weight; intent cannot rescue failed fit. Failed buyer matching needs an explicit retry or hold decision.

## 4. Write and review one message

Use `outbound-copywriter` with a real buyer, one supported observation and the useful offer. Use `split-test-designer` to freeze one changed dimension and two variants. The [experiment file](../company/experiment.example.json) is an example, including a review floor that is not a significance claim.

The generated first-touch callable consumes mapped evidence and the assigned variant. Inspect one output before expanding. Keep test_round, group_id, variant_id and prompt_version through the native Sequence and result events.

`prepare_sequence` adds a readiness gate. Your real Sequence still needs recipients, reviewed rendering, sender identity, suppression, reply stops and capacity. Use `oxygen-sequencer-enroll` to inspect that handoff within the requested send scope.

## 5. Close the loop with one learning

Normalize actual delivery/reply/meeting events into the analysis contract. Check deduplication, denominators and cohort consistency. Record one finding, its limits and the next proposed change in [the learning note](../templates/learning-note.md).

For content, capture a public-use source into [the context workspace](../context/index.md), calibrate voice, then draft one post about a supported lesson. Use `content-strategy` to connect it to an offer. A reaction or comment is an engagement signal; any outbound follow-through still needs buyer qualification and the actual requested scope.

Finish with the brief, filters, decision table, one reviewed message, frozen test and verified execution state. Those are the useful outputs; the number of installed skills is secondary.
