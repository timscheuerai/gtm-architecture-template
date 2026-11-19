# Sources and consolidation

This repository is the maintained distribution for the combined GTM Architecture Kit. It contains the 13 function templates, the blank author/company context, the walkthrough and one canonical skills library. The original repositories retain their histories; they are not required to use this kit.

| Source | Snapshot used | Treatment |
|---|---|---|
| OXYGEN-CRO/gtm-vault | `12accb49fb765597537768466b8bf7c59af250c0` | Copy, personalization and enrollment procedures retained; vendor-specific sourcing/domain/mailbox skills removed in v0.3.0 |
| OXYGEN-CRO/client-template | `0244c4e34e2f184197a1e7d32cb72f37af0c1110` | Seven GTM procedures generalized; client names, engagement rules and unbundled adapter assumptions removed |
| OXYGEN-CRO/content-engine-template | `17eb37ada46ceb2193f76eaae3658b230ed4a56d` | Twelve generic skills, blank context, context scripts and portable flowchart helpers adapted to this layout |
| timscheuerai/content-vault | `848abc38d4b733ebf704f5c5ff8486f3e2908412` | Content and media capabilities retained as portable procedures; overlaps merged and historical machine/project assumptions removed |
| OXYGEN CLI skill catalog | Retrieved 2026-09-14 with CLI 1.927.2 from dev API 1.978.7 | Twelve native OXYGEN procedures adapted with kit links; private provenance markers and unbundled vendor runbooks excluded |
| OXYGEN CLI skill catalog | Retrieved 2026-11-19 with CLI 1.1048.15 from the production skill index | Eleven native procedures re-adapted, nine added (onboarding, GTM consultant, Tables, enrichment, sourcing, signals, CRM, custom HTTP, publishing) and LinkedIn marketing replaced by LinkedIn content |
| OXYGEN-CRO/oxygen-knowledge | 2026-11-19 webinar build | The signal-account-engine skill and the AP automation worked example, with workspace ids, company names and people removed |
| timscheuerai/linkedin-funnel | `d6769cb` (2026-10-20) | The LinkedIn content system: 46 genericized content, graphics, engagement and media skills copied in, with paths adapted to `.agents/skills/` and `docs/`; its 5 guides (content waterfall, DM conversion, Notion, profile watcher, qualification) added under `docs/` |
| OXYGEN-CRO/oxygen-knowledge personal-brand skills | 2026-11-19 | Generic method changes since 2026-10-20 ported into 19 content skills; 7 skills added (content-interview, content-review, storytelling-coach, lead-magnet-launch, shortform-platform-copy, swipe-file, instagram-planner); a generic slop filter added to `context/voice/` |
| This kit | v0.1.0 → v0.5.1 | Thirteen function templates retained; first-batch demo, gtm-start, onboarding, native OXYGEN guide and package checks added |

The two outbound-copywriter versions become one skill. LinkedIn writing and graphics use the generic content-engine version. The old repurpose skill maps to repurpose-content. The nested manim-video skill is promoted into the discoverable library. The v0.3.0 update removes three vendor-specific skills and adds twelve native OXYGEN skills, giving 51 skills. The v0.4.0 update adds nine native OXYGEN skills and signal-account-engine, and replaces oxygen-linkedin-marketing with oxygen-linkedin-content, giving 61 skills. The v0.5.0 update brings in the full LinkedIn content system from the LinkedIn Funnel kit and the newest private sources (24 skills added, 22 updated), giving **85 skills**. [The catalog](../skills/catalog.json) records the original paths, retrieval commands, source content hashes and treatment. OXYGEN source hashes exclude workspace-specific provenance comments.

Older repositories also contain historical assets, provider scripts, deployment recipes and media projects. Those are not copied wholesale. The kit includes the reusable procedures and clearly states where an external tool is required; it does not claim to bundle an uploader, renderer, domain purchaser or mailbox client that is absent. Legacy event recipes still need mapping to the current native contracts before use.

No private repository history, live campaign copy, client examples, prospect exports, credentials or workspace connection IDs are imported. Synthetic examples remain explicitly synthetic. The source snapshots identify provenance, not a claim that every old implementation was production-validated here.

The consolidated code and documentation are distributed under [MIT](../LICENSE), copyright 2026 Tim Scheuer. The public content-vault source also carries Tim Scheuer's MIT license. Optional providers and author-supplied assets retain their own terms and licenses.
