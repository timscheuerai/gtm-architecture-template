# Sources and consolidation

This repository is the maintained distribution for the combined GTM Architecture Kit. It contains the 13 function templates, the blank author/company context, the walkthrough and one canonical skills library. The original repositories retain their histories; they are not required to use this kit.

| Source | Snapshot used | Treatment |
|---|---|---|
| OXYGEN-CRO/gtm-vault | `12accb49fb765597537768466b8bf7c59af250c0` | Copy, personalization and enrollment procedures retained; vendor-specific sourcing/domain/mailbox skills removed in v0.3.0 |
| OXYGEN-CRO/client-template | `0244c4e34e2f184197a1e7d32cb72f37af0c1110` | Seven GTM procedures generalized; client names, engagement rules and unbundled adapter assumptions removed |
| OXYGEN-CRO/content-engine-template | `17eb37ada46ceb2193f76eaae3658b230ed4a56d` | Twelve generic skills, blank context, context scripts and portable flowchart helpers adapted to this layout |
| timscheuerai/content-vault | `848abc38d4b733ebf704f5c5ff8486f3e2908412` | Content and media capabilities retained as portable procedures; overlaps merged and historical machine/project assumptions removed |
| OXYGEN CLI skill catalog | Retrieved 2026-09-14 with CLI 1.927.2 from dev API 1.978.7 | Twelve native OXYGEN procedures adapted with kit links; private provenance markers and unbundled vendor runbooks excluded |
| This kit | v0.1.0 → v0.3.0 | Thirteen function templates retained; first-batch demo, gtm-start, onboarding, native OXYGEN guide and package checks added |

The two outbound-copywriter versions become one skill. LinkedIn writing and graphics use the generic content-engine version. The old repurpose skill maps to repurpose-content. The nested manim-video skill is promoted into the discoverable library. The v0.3.0 update removes three vendor-specific skills and adds twelve native OXYGEN skills, giving **51 skills**. [The catalog](../skills/catalog.json) records the original paths, retrieval commands, source content hashes and treatment. OXYGEN source hashes exclude workspace-specific provenance comments.

Older repositories also contain historical assets, provider scripts, deployment recipes and media projects. Those are not copied wholesale. The kit includes the reusable procedures and clearly states where an external tool is required; it does not claim to bundle an uploader, renderer, domain purchaser or mailbox client that is absent. Legacy event recipes still need mapping to the current native contracts before use.

No private repository history, live campaign copy, client examples, prospect exports, credentials or workspace connection IDs are imported. Synthetic examples remain explicitly synthetic. The source snapshots identify provenance, not a claim that every old implementation was production-validated here.

The consolidated code and documentation are distributed under [MIT](../LICENSE), copyright 2026 Tim Scheuer. The public content-vault source also carries Tim Scheuer's MIT license. Optional providers and author-supplied assets retain their own terms and licenses.
