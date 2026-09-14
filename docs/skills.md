# Skills catalog

51 skills share one library in .agents/skills/. Open the whole repository in your coding agent and ask for a skill by name. Context and function references are part of the package; these skills are not standalone single-file installs.

Start with **gtm-start** for an account batch, or **setup-workspace → capture-context → voice-calibration → linkedin-copywriter** for content. You do not need to configure every skill before starting.

The offline demo needs Node.js 22+. Hosted functions need an OXYGEN account and CLI. Flowchart helpers and context checks use Python 3. Video renderers, image tools, QMD, Notion, YouTube and OXYGEN sender connections are optional and not installed by this kit. Provider procedures discover the actual current tool/schema before operating.

## Start

| Skill | Use it for |
|---|---|
| [gtm-start](../.agents/skills/gtm-start/SKILL.md) | Set up the GTM Architecture kit and guide a first ten-account pilot, using the offline demo, company brief, skills and hosted functions. |

## Context

| Skill | Use it for |
|---|---|
| [capture-context](../.agents/skills/capture-context/SKILL.md) | Turn supplied interviews, notes, writing samples and other source material into linked author context with traceable evidence. |
| [qmd](../.agents/skills/qmd/SKILL.md) | Search and retrieve this repository's author context with optional qmd, using an isolated index for each client folder. |
| [setup-workspace](../.agents/skills/setup-workspace/SKILL.md) | Initialize this content workspace for a new author, including local preferences and optional Notion or local search setup. |
| [voice-calibration](../.agents/skills/voice-calibration/SKILL.md) | Build or refine an author's writing guide from their own writing samples and edits, without importing another creator's voice. |

## GTM

| Skill | Use it for |
|---|---|
| [crm-presync-check](../.agents/skills/crm-presync-check/SKILL.md) | Check an OXYGEN cohort against the connected CRM and produce existing, new, ambiguous or failed lookup decisions before a sync. |
| [lead-sourcing](../.agents/skills/lead-sourcing/SKILL.md) | Translate an ICP into comparable account and contact searches, build a bounded first batch and preserve provider filters and provenance. |
| [outbound-copywriter](../.agents/skills/outbound-copywriter/SKILL.md) | Write a grounded first touch or follow-up from the buyer's situation, a real offer, cleared proof and the sender's own voice. |
| [oxygen-dedupe](../.agents/skills/oxygen-dedupe/SKILL.md) | Review duplicate companies, people and source events before ingestion while preserving provenance and holding uncertain identity matches. |
| [oxygen-sequencer-enroll](../.agents/skills/oxygen-sequencer-enroll/SKILL.md) | Prepare a reviewed, verified cohort for a native OXYGEN Sequence and execute only the user's authorized enrollment and sending scope. |
| [personalize-ai-column](../.agents/skills/personalize-ai-column/SKILL.md) | Configure and preview the kit's generated first-touch callable using cited row evidence, a frozen experiment and an explicit credit ceiling. |
| [signals-sweep](../.agents/skills/signals-sweep/SKILL.md) | Collect a bounded batch of hiring, engagement or other account signals with source dates, deduplication and explicit qualification rules. |
| [spin-tags](../.agents/skills/spin-tags/SKILL.md) | Add optional wording variants to static copy using the actual sender's supported syntax while preserving meaning, merge variables and experiment control. |
| [split-test-designer](../.agents/skills/split-test-designer/SKILL.md) | Define one interpretable outbound experiment with frozen account-level assignment, copy versions and outcome measures. |

## OXYGEN

| Skill | Use it for |
|---|---|
| [oxygen-deliverability](../.agents/skills/oxygen-deliverability/SKILL.md) | Diagnose OXYGEN sender health from bounce, authentication, warmup and run evidence, then apply only the requested bounded remediation. |
| [oxygen-diagnostics](../.agents/skills/oxygen-diagnostics/SKILL.md) | Trace OXYGEN cells and runs, explain failures or credit spend, and plan reconciled retries from native provenance. |
| [oxygen-email-infra](../.agents/skills/oxygen-email-infra/SKILL.md) | Set up and inspect OXYGEN sender profiles, domains, mailboxes, authentication, warmup and Sequence attachment using native previews. |
| [oxygen-gtm](../.agents/skills/oxygen-gtm/SKILL.md) | Route a GTM outcome to the correct OXYGEN primitive and select the narrower bundled skill for hosted execution. |
| [oxygen-knowledge](../.agents/skills/oxygen-knowledge/SKILL.md) | Read and maintain OXYGEN Knowledge pages, sources, revisions and approved context so GTM functions use traceable company knowledge. |
| [oxygen-linkedin-marketing](../.agents/skills/oxygen-linkedin-marketing/SKILL.md) | Run OXYGEN LinkedIn content and warm-signal motions through Posts, Publishing, Signals, Tables and bounded Sequences. |
| [oxygen-quickstart](../.agents/skills/oxygen-quickstart/SKILL.md) | Connect this kit to an OXYGEN workspace, inspect capabilities and complete a small hosted demonstration without paid execution. |
| [oxygen-recipes](../.agents/skills/oxygen-recipes/SKILL.md) | Find and inspect a versioned OXYGEN business play, preflight its resources and adapt it to the reader's GTM goal. |
| [oxygen-sequencer](../.agents/skills/oxygen-sequencer/SKILL.md) | Operate native OXYGEN Sequences for new conversations and outreach cadence, including sender readiness, previews, enrollment, dispatch and recovery. |
| [oxygen-table-tidy](../.agents/skills/oxygen-table-tidy/SKILL.md) | Inspect and improve OXYGEN Table structure, visibility and formatting while preserving raw data, dependencies and record identity. |
| [oxygen-unibox](../.agents/skills/oxygen-unibox/SKILL.md) | Triage OXYGEN Messages and Unibox conversations, prepare grounded replies and send only within the user's specified account and thread scope. |
| [oxygen-workflow-authoring](../.agents/skills/oxygen-workflow-authoring/SKILL.md) | Author, validate and operate deterministic OXYGEN Workflows with explicit inputs, hosted runs, current schemas and inspectable effects. |

## Content

| Skill | Use it for |
|---|---|
| [content-strategy](../.agents/skills/content-strategy/SKILL.md) | Define an author's content pillars, topics, subtopics and funnel roles from their audience, evidence, goals and offer. |
| [lead-magnet-creator](../.agents/skills/lead-magnet-creator/SKILL.md) | Build a complete, reusable lead magnet with a clear reader outcome, worked example, editable starting point and tested delivery path. |
| [linkedin-copywriter](../.agents/skills/linkedin-copywriter/SKILL.md) | Draft or edit one LinkedIn post using the author's context, writing samples, factual sources and intended funnel job. |
| [long-form](../.agents/skills/long-form/SKILL.md) | Turn a sourced idea into an article or essay with a clear argument, useful examples and traceable factual claims. |
| [newsletter-writer](../.agents/skills/newsletter-writer/SKILL.md) | Write a useful newsletter issue from source material, the author's voice and one coherent reader takeaway. |
| [repurpose-content](../.agents/skills/repurpose-content/SKILL.md) | Turn an interview, newsletter, talk or other long source into distinct content pieces or visual briefs while preserving its facts and voice. |
| [researcher](../.agents/skills/researcher/SKILL.md) | Research a content or GTM question using primary evidence and return a source-backed brief with implications and open questions. |
| [week-posts](../.agents/skills/week-posts/SKILL.md) | Plan and draft a week of content using the author's configured pillars, source material, voice, cadence and optional Notion board. |
| [x-copywriter](../.agents/skills/x-copywriter/SKILL.md) | Draft concise X posts or threads from grounded source material and the author's actual voice. |

## Visuals

| Skill | Use it for |
|---|---|
| [brand-review](../.agents/skills/brand-review/SKILL.md) | Review a rendered graphic or visual system for message clarity, identity consistency and export quality; make fixes when requested. |
| [brand-system](../.agents/skills/brand-system/SKILL.md) | Establish or update a client's visual identity, reusable tokens and graphic conventions from their preferences and supplied assets. |
| [flowchart](../.agents/skills/flowchart/SKILL.md) | Create editable flowcharts, system maps and funnels with semantic icons, structured operation cards, distinct skill and decision shapes, and verified routing. |
| [graphics-designer](../.agents/skills/graphics-designer/SKILL.md) | Create an individual graphic, carousel or banner using the client's supplied visual rules, or a neutral unbranded layout when requested. |

## Media

| Skill | Use it for |
|---|---|
| [launch-video](../.agents/skills/launch-video/SKILL.md) | Create a product launch video from a truthful beat script, available assets and a reproducible motion project. |
| [manim-video](../.agents/skills/manim-video/SKILL.md) | Create an explanatory animation in Manim from a precise concept, scene plan and verified local renderer. |
| [shorts-audio](../.agents/skills/shorts-audio/SKILL.md) | Improve recorded speech using measured levels, restrained noise treatment and listening comparisons against the source. |
| [shorts-cut](../.agents/skills/shorts-cut/SKILL.md) | Select complete takes and remove false starts or dead air while preserving speech meaning and word boundaries. |
| [shorts-edit](../.agents/skills/shorts-edit/SKILL.md) | Turn raw talking-head recordings into finished shorts using reviewed take selection, audio, captions, cue-based graphics and final QA. |
| [shorts-motion](../.agents/skills/shorts-motion/SKILL.md) | Add readable, cue-aligned graphics to a short without obscuring the speaker, captions or the meaning of the footage. |
| [shorts-qa](../.agents/skills/shorts-qa/SKILL.md) | Verify an edited video for complete speech, correct captions, synchronized graphics, audio integrity, image quality and playback. |
| [video-use](../.agents/skills/video-use/SKILL.md) | Edit a supplied video through a source-preserving transcript, timeline and visual review workflow using available rendering tools. |
| [youtube-description](../.agents/skills/youtube-description/SKILL.md) | Create a YouTube description, resource links and chapters from the actual final video or timestamped transcript. |
| [youtube-publisher](../.agents/skills/youtube-publisher/SKILL.md) | Upload or update a video on the user's confirmed YouTube channel with verified metadata, processing state and requested visibility. |
| [youtube-script](../.agents/skills/youtube-script/SKILL.md) | Write a recordable YouTube script with a clear viewer promise, evidence, demo beats and a truthful payoff. |
| [youtube-thumbnail](../.agents/skills/youtube-thumbnail/SKILL.md) | Design a legible YouTube thumbnail whose visual promise is supported by the actual video. |

## Consolidation

LinkedIn writing, graphics and repurposing use the generic content-engine versions; the older repurpose skill maps to repurpose-content. The two outbound-copywriter versions are merged into one procedure. The formerly nested manim-video skill is directly discoverable. Machine-readable provenance is in [the catalog](../skills/catalog.json); scope and validation limits are in [the source notes](sources.md).
