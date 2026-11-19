# Skills catalog

85 skills share one library in .agents/skills/. Open the whole repository in your coding agent and ask for a skill by name. Context and function references are part of the package; these skills are not standalone single-file installs.

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
| [signal-account-engine](../.agents/skills/signal-account-engine/SKILL.md) | Build a signal-scored outbound engine in OXYGEN: source the TAM, enrich and fit-score companies, layer hiring and leadership signals into a free score and tier, then find, fit-score and enrich buyers only at Tier A and B accounts and write short researched copy and route them into 1 draft Sequence behind an approval. |
| [signals-sweep](../.agents/skills/signals-sweep/SKILL.md) | Collect a bounded batch of hiring, engagement or other account signals with source dates, deduplication and explicit qualification rules. |
| [spin-tags](../.agents/skills/spin-tags/SKILL.md) | Add optional wording variants to static copy using the actual sender's supported syntax while preserving meaning, merge variables and experiment control. |
| [split-test-designer](../.agents/skills/split-test-designer/SKILL.md) | Define one interpretable outbound experiment with frozen account-level assignment, copy versions and outcome measures. |

## OXYGEN

| Skill | Use it for |
|---|---|
| [oxygen-crm](../.agents/skills/oxygen-crm/SKILL.md) | Work with OXYGEN Records, the canonical CRM: objects, fields and identities, notes and tasks, HubSpot or Attio imports and syncs with do-not-contact first, and binding and promoting Table rows into records. |
| [oxygen-custom-http](../.agents/skills/oxygen-custom-http/SKILL.md) | Turn a public HTTPS API into OXYGEN catalog tools with a custom integration manifest: operations, fields and auth, server-side credentials, dry runs and live calls, tool columns, and safe removal. |
| [oxygen-deliverability](../.agents/skills/oxygen-deliverability/SKILL.md) | Triage OXYGEN email deliverability, warm-up and bounce evidence, compare inbox placement by mailbox and receiver, run approval-gated placement tests and manage monitoring. Results are directional; bounce auto-pause is authoritative. |
| [oxygen-diagnostics](../.agents/skills/oxygen-diagnostics/SKILL.md) | Diagnose a running OXYGEN workspace: trace a cell value and its provenance, explain stuck or failed runs, sweep and retry table failures, explain plan, credit and rate-limit refusals, and explain or reduce credit spend. Read-only investigation first. |
| [oxygen-email-infra](../.agents/skills/oxygen-email-infra/SKILL.md) | Plan, set up and run OXYGEN cold email sending infrastructure: the Google and Microsoft mix and inbox count sized from the TAM, lookalike domains and DNS, managed and imported mailboxes, sender profiles, warm-up, recovery and wind-down. |
| [oxygen-enrichment](../.agents/skills/oxygen-enrichment/SKILL.md) | Fill company and contact data in OXYGEN Tables with native waterfalls: company profiles, work email, phone, LinkedIn URLs and verification, with free previews, provider preflight, one-row pilots and capped runs. Includes how ContactOut fits the waterfall. |
| [oxygen-gtm](../.agents/skills/oxygen-gtm/SKILL.md) | Route a GTM outcome to the correct OXYGEN primitive and the narrower bundled skill that teaches it: Knowledge, Records, Tables, Signals, Messages, Posts, Sequences, Publishing, Workflows, Agents and Observability. |
| [oxygen-gtm-consultant](../.agents/skills/oxygen-gtm-consultant/SKILL.md) | Act as a GTM engineering consultant on an OXYGEN workspace: rate the context, read the current state, find the binding constraint, agree the problem, design a custom motion and run it as a pilot with a success bar and a kill line. |
| [oxygen-knowledge](../.agents/skills/oxygen-knowledge/SKILL.md) | Operate OXYGEN Knowledge: index-first retrieval, wiki pages and folders, citations, revisions and sources, proposals for canonical copy, workspace skills and a local mirror. Use for company and ICP context, offers, voice, rubrics and learnings. |
| [oxygen-linkedin-content](../.agents/skills/oxygen-linkedin-content/SKILL.md) | Write LinkedIn and X drafts grounded in the workspace's Knowledge, voice and real proof: research, idea gates, channel-specific writing, visuals and review, then save drafts for approval through Publishing. |
| [oxygen-onboarding](../.agents/skills/oxygen-onboarding/SKILL.md) | Guide a first OXYGEN session from company context to first leads, a reviewed draft Sequence, a connected sender and a bounded launch. Use for get me started or the first campaign; for a diagnosis or plan, use oxygen-gtm-consultant. |
| [oxygen-publishing](../.agents/skills/oxygen-publishing/SKILL.md) | Use OXYGEN Posts and Publishing to save drafts, queue, approve, schedule and read back LinkedIn, X and other channel posts, keep approval separate from status, handle uncertain publishes, and read post performance. |
| [oxygen-quickstart](../.agents/skills/oxygen-quickstart/SKILL.md) | Connect this kit to an OXYGEN workspace, inspect capabilities and complete a small hosted demonstration without paid execution, then hand over to onboarding or the consultant. |
| [oxygen-recipes](../.agents/skills/oxygen-recipes/SKILL.md) | Search, read and install OXYGEN plays: proven GTM motions with prerequisites, credit posture, approval gates and an optional kit of native stages, then adapt the play to the reader's company. |
| [oxygen-sequencer](../.agents/skills/oxygen-sequencer/SKILL.md) | Operate native OXYGEN Sequences for new conversations and outreach cadence: readiness, drafts, previews and rendered copy, send ceilings, enrollment, do-not-contact policy, monitoring and recovery. |
| [oxygen-signals](../.agents/skills/oxygen-signals/SKILL.md) | Capture and read OXYGEN Signals: your LinkedIn network, followers, viewers and post engagers; hiring, funding, tech and news signal searches; public profile watchers and keyword post search; competitor ads; and standing auto-enroll into a Sequence. |
| [oxygen-sourcing](../.agents/skills/oxygen-sourcing/SKILL.md) | Find companies and people that are not in the workspace yet and land them in OXYGEN Tables: account and TAM lists, hiring companies, lookalikes, local businesses and buyers at named accounts, through free previews, typed plans, priced dry runs and approved live runs. |
| [oxygen-table-tidy](../.agents/skills/oxygen-table-tidy/SKILL.md) | Tidy an OXYGEN Table: find duplicate columns, ordering, formatting, types, hide or archive candidates and suspicious values, present findings by category, then apply only approved reversible fixes. Table structure, not CRM record merges. |
| [oxygen-tables](../.agents/skills/oxygen-tables/SKILL.md) | Build and run OXYGEN Tables: typed columns, formulas, AI and Classify columns, research, tool and HTTP columns, lookups and links, feeds and imports, with free previews, one-row pilots and capped runs. |
| [oxygen-unibox](../.agents/skills/oxygen-unibox/SKILL.md) | Use OXYGEN Messages and the Unibox to find, read, classify, tag, archive, draft and reply in existing email, LinkedIn and WhatsApp conversations, and send one direct email. Net-new LinkedIn outreach uses Sequences. |
| [oxygen-workflow-authoring](../.agents/skills/oxygen-workflow-authoring/SKILL.md) | Author, validate and operate deterministic OXYGEN Workflows and durable recipes with explicit inputs, call previews, smoke tests, capped live runs, hosted triggers and inspectable effects. |

## Content

| Skill | Use it for |
|---|---|
| [content-interview](../.agents/skills/content-interview/SKILL.md) | Interview the author about their vision, values and personal why, or review their week, to plan practical content grounded in their real experience and own words. Use for a values, brand, story, weekly review or content interview. |
| [content-review](../.agents/skills/content-review/SKILL.md) | Review published content, platform performance and the production workflow, then turn the evidence into the next experiment. Use for a YouTube review, a content retrospective, why a piece underperformed, or a review across platforms. |
| [content-strategy](../.agents/skills/content-strategy/SKILL.md) | Define an author's content pillars, topics, subtopics and funnel roles from their audience, evidence, goals and offer. |
| [lead-magnet-creator](../.agents/skills/lead-magnet-creator/SKILL.md) | Build a complete, reusable lead magnet with a clear reader outcome, worked example, editable starting point and tested delivery path. |
| [linkedin-copywriter](../.agents/skills/linkedin-copywriter/SKILL.md) | Draft or edit one LinkedIn post using the author's context, writing samples, factual sources and intended funnel job. |
| [long-form](../.agents/skills/long-form/SKILL.md) | Turn a sourced idea into an article or essay with a clear argument, useful examples and traceable factual claims. |
| [newsletter-writer](../.agents/skills/newsletter-writer/SKILL.md) | Write a useful newsletter issue from source material, the author's voice and one coherent reader takeaway. |
| [repurpose-content](../.agents/skills/repurpose-content/SKILL.md) | Turn an interview, newsletter, talk or other long source into distinct content pieces or visual briefs while preserving its facts and voice. |
| [researcher](../.agents/skills/researcher/SKILL.md) | Research a content or GTM question using primary evidence and return a source-backed brief with implications and open questions. |
| [storytelling-coach](../.agents/skills/storytelling-coach/SKILL.md) | Coach the author through finding, deepening and shaping 1 true story or idea of their own into a Problem, Pursuit, Payoff outline in their exact words, so they write or record it themselves. The coach asks and reflects; it never writes content. |
| [week-posts](../.agents/skills/week-posts/SKILL.md) | Plan and draft a week of content using the author's configured pillars, source material, voice, cadence and optional Notion board. |
| [x-copywriter](../.agents/skills/x-copywriter/SKILL.md) | Write or rewrite X posts and threads the way the author actually writes, from grounded source material. A post the author wrote themselves goes out as written. |
| [x-research](../.agents/skills/x-research/SKILL.md) | Research X posts and conversations in the author's niche and turn the strongest ones into sourced content ideas and angles the author can support with their own evidence. Use for niche trend scans, finding strong posts, creator research or building an X creator watchlist; it produces research briefs, not published posts. |

## Content waterfall

| Skill | Use it for |
|---|---|
| [content-waterfall](../.agents/skills/content-waterfall/SKILL.md) | Run a weekly content waterfall: find the idea of the week from what is hot on YouTube, X and LinkedIn, make 1 long video, grow its 3 roots into posts on every platform, ship the week and turn the engagers into conversations. Use when the author gives the idea of the week, wants posts from a video, hands over a recording or YouTube link, or asks to repurpose. Orchestrates the stage skills. |
| [instagram-planner](../.agents/skills/instagram-planner/SKILL.md) | Plan the author's Instagram week and guide each piece into a format that fits it. Checks that talking reels, non-talking reels and carousels are all covered, picks a sub-format per idea, and writes the hook, the pain-journey-payoff beats, the b-roll shot list and the caption plan onto the content board. |
| [lead-magnet-delivery](../.agents/skills/lead-magnet-delivery/SKILL.md) | Turn a LinkedIn lead-magnet post ("comment KEYWORD and I'll send it") into automatic delivery on OXYGEN. Every commenter who asks gets a DM with the link and a public "Sent it over:)" reply; 2nd-degree commenters are asked to connect first; nobody is messaged twice. Use when a lead-magnet post is live and the author asks to set up delivery or send the resource to commenters. |
| [lead-magnet-launch](../.agents/skills/lead-magnet-launch/SKILL.md) | Prepare and launch a finished lead magnet through a resource page, including email capture, delivery, email-tool segmentation, consent and launch QA. Use for publishing or auditing a resource funnel after the asset exists; lead-magnet-creator makes the asset. |
| [linkedin-article-adapter](../.agents/skills/linkedin-article-adapter/SKILL.md) | Adapt a finished X Article into a native LinkedIn article while preserving its text and inline figures, recompose the cover at LinkedIn's article ratio, and prepare a numbered upload folder plus a short post to share it. Use after x-article-writer when the author wants the same article on LinkedIn. |
| [linkedin-hook-writer](../.agents/skills/linkedin-hook-writer/SKILL.md) | Write, revise or compare LinkedIn hooks in the author's voice, with measured character counts and mobile-first opening budgets. Use for hook options, first-line edits, or the opening pass inside linkedin-copywriter. |
| [linkedin-unibox-reply](../.agents/skills/linkedin-unibox-reply/SKILL.md) | Draft LinkedIn DM replies in the author's voice for Unibox triage and 1:1 follow-ups, one at a time, and never send without the author's yes. Use to triage interested or unanswered LinkedIn threads, draft a DM reply, or rewrite a generic suggested reply into the author's voice. |
| [longform-edit](../.agents/skills/longform-edit/SKILL.md) | Edit a long-form YouTube recording into a finished upload, usually a designed talking-head intro with proof graphics followed by a clean, clip-only screen tutorial. Use when a video needs more than a plain cut: an animated intro, numbers shown when they are said, or a few motion graphics. |
| [shortform-platform-copy](../.agents/skills/shortform-platform-copy/SKILL.md) | Write platform-specific LinkedIn, X, Instagram Reel and YouTube Shorts copy for a short video from the video and the author's supplied facts, and schedule the short as 1 post with a channel and a cover per platform. Use when preparing, adapting, uploading or scheduling a short for several platforms. |
| [talking-head-video-cut](../.agents/skills/talking-head-video-cut/SKILL.md) | Cut and merge raw OBS or screen-recorded talking-head clips by selecting complete takes, trimming dead air and setup transitions, preserving the native picture, and QAing every join. Use for "remove the pauses", "cut the false starts", "just cut and merge" or a clean long-form YouTube cut. |
| [x-article-writer](../.agents/skills/x-article-writer/SKILL.md) | Write or revise a compact native X Article in the author's voice from their newsletter, framework, posts or lead magnet, with the strongest supported result first and useful graphics placed where they explain the argument. Also writes the X post that announces a video. Use for X Articles and illustrated long posts on X; use x-copywriter or x-planner for ordinary X posts. |
| [x-planner](../.agents/skills/x-planner/SKILL.md) | Plan the author's X posts together with them, day by day, from 3 lanes: LinkedIn posts repurposed for X, native posts from what is going viral in their niche, and their own launches or assets. Presents a slate for the author to pick and cut, drafts the picks, records their verdicts. Use when planning X for the week or when the content waterfall hands over micro posts and chapter threads. |
| [youtube-thumbnail-outlier-research](../.agents/skills/youtube-thumbnail-outlier-research/SKILL.md) | Research high-performing YouTube thumbnails in the author's niche, extract the patterns to borrow or avoid, and brief thumbnail concepts before rendering. Use when choosing a thumbnail direction or before youtube-thumbnail renders. |
| [youtube-title-outlier-packaging](../.agents/skills/youtube-title-outlier-packaging/SKILL.md) | Find YouTube packaging outliers in the author's niche, draft 2 A/B titles from proven structures with every claim marked, and brief thumbnail concepts. Use when choosing or split-testing a YouTube title or packaging a video before recording. |
| [youtube-video-research](../.agents/skills/youtube-video-research/SKILL.md) | Decide the author's next YouTube video before they record it, in 3 gates. An idea found depth-first inside their niche (a wave that is hot now, applied to their audience's outcome while the niche angle is still open), packaging proven by outliers in other niches, and the first 60 seconds scripted word for word. Ends in a go or no-go scorecard and logs every upload in a channel ledger. Use for "what should my next video be", "is this a good video idea", "validate this title or thumbnail" or "script the intro". |

## Engagement

| Skill | Use it for |
|---|---|
| [linkedin-engage](../.agents/skills/linkedin-engage/SKILL.md) | Find fresh posts from the author's LinkedIn watchlist through OXYGEN's managed scraper, draft 1 or 2 natural comments each where the author has a real receipt, and publish a Copy & open queue page that learns from what they actually post. Use for a LinkedIn comment round or to grow reach through comments; it never comments, likes or messages on its own. |
| [x-engage](../.agents/skills/x-engage/SKILL.md) | Find fresh posts from the author's X watchlist through their OXYGEN X connection, draft 1 short reply each where the author has a real practice or result to add, and publish a Reply on X queue page that learns from what they actually post. Use for a daily X reply round or to grow reach through replies; it never posts, likes or follows on its own. |

## Visuals

| Skill | Use it for |
|---|---|
| [brand-review](../.agents/skills/brand-review/SKILL.md) | Review a rendered graphic or visual system for message clarity, identity consistency and export quality; make fixes when requested. |
| [brand-system](../.agents/skills/brand-system/SKILL.md) | Establish or update a client's visual identity, reusable tokens and graphic conventions from their preferences and supplied assets. |
| [diorama-3d](../.agents/skills/diorama-3d/SKILL.md) | Build a 3D diorama graphic in three.js that tells a system as a place (a room, a factory floor, a machine line), with the roles and tools as glossy toys, labels projected from 3D, a 2-second build-in and a seamless loop, exported as a 1080 x 1350 still, MP4 and GIF. Use for a 3D or animated system graphic for a post or lead magnet; flat posters stay in graphics-designer and editable process maps in flowchart. |
| [flowchart](../.agents/skills/flowchart/SKILL.md) | Create editable flowcharts, system maps and funnels with semantic icons, structured operation cards, distinct skill and decision shapes, and verified routing. |
| [graphics-designer](../.agents/skills/graphics-designer/SKILL.md) | Create an individual graphic, carousel or banner using the client's supplied visual rules, or a neutral unbranded layout when requested. |
| [swipe-file](../.agents/skills/swipe-file/SKILL.md) | Keep 1 swipe file for every format (thumbnails, ads, shorts, posts, graphics, landing pages, films and motion) and make every design skill pull references from it. Use whenever the author shares a screenshot, link, video or post for inspiration or taste, or asks what the references say. |

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
| [video-editor](../.agents/skills/video-editor/SKILL.md) | Turn a raw talking-head or screen-demo recording, or a short, into a publish-ready edit in 1 run, in a clean caption style (off-white word-by-word captions, serif payoffs, interludes, hard reframes, no boxes), with overlays timed to the spoken word, -14 LUFS audio, an editable DaVinci Resolve timeline and a QA sheet. Use for "edit this video", "make it publish ready" or "add captions"; it uses talking-head-video-cut for the cut and its bundled Remotion overlay kit for graphics. |
| [video-use](../.agents/skills/video-use/SKILL.md) | Edit a supplied video through a source-preserving transcript, timeline and visual review workflow using available rendering tools. |
| [youtube-description](../.agents/skills/youtube-description/SKILL.md) | Create a YouTube description, resource links and chapters from the actual final video or timestamped transcript. |
| [youtube-publisher](../.agents/skills/youtube-publisher/SKILL.md) | Upload or update a video on the user's confirmed YouTube channel with verified metadata, processing state and requested visibility. |
| [youtube-script](../.agents/skills/youtube-script/SKILL.md) | Write a recordable YouTube script with a clear viewer promise, evidence, demo beats and a truthful payoff. |
| [youtube-thumbnail](../.agents/skills/youtube-thumbnail/SKILL.md) | Design a legible YouTube thumbnail whose visual promise is supported by the actual video. |

## Consolidation

The LinkedIn content system (writing, hooks, X, the content waterfall, lead magnets, engagement, storytelling, review and the visual skills) comes from the LinkedIn Funnel kit with the newest generic method changes ported in; the older repurpose skill maps to repurpose-content. The two outbound-copywriter versions are merged into one procedure. The formerly nested manim-video skill is directly discoverable. Machine-readable provenance is in [the catalog](../skills/catalog.json); scope and validation limits are in [the source notes](sources.md).
