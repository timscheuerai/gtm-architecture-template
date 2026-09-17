# LinkedIn Pipeline Kit

Build a content system in your own voice, identify potential customers engaging with your posts, and turn relevant interest into a conversation.

This is the LinkedIn starting point inside the GTM Architecture Kit. The skills, second brain and qualification tools are already in this repository. You do not need to assemble several repos.

[Start with your context](../context/templates/context-interview.md) · [Notion template](notion.md) · [Profile Watcher setup](profile-watcher.md) · [Qualification](qualification.md) · [DM framework](dm-conversion.md) · [Download the flowchart](assets/linkedin-funnel.png)

## What you get

| Piece | Use it to |
|---|---|
| [23 content and branding skills](skills.md) | Research, write, repurpose and design content grounded in your own experience |
| [Personal-brand scaffold](../context/index.md) | Capture your identity, reader, positioning, voice, proof and visual rules |
| [Notion board and setup guide](notion.md) | Organize drafts, pillars, topics and hooks in your own workspace |
| [OXYGEN Profile Watcher instructions](profile-watcher.md) | Collect people engaging with recent posts into one table with source attribution |
| [Qualification prompt and output schema](qualification.md) | Assess company fit and person fit separately, with reasons and missing evidence |
| [DM conversion framework](dm-conversion.md) | Deliver a requested resource, understand the reader's problem and agree on a useful next step |
| [High-resolution flowchart](assets/linkedin-funnel.png), [GIF](assets/linkedin-funnel.gif) and [editable scene](assets/linkedin-funnel.excalidraw) | See how content, resources, qualification and conversations connect |

## Get your first result

Clone the whole kit, open it in your coding agent, then paste this:

```sh
git clone https://github.com/timscheuerai/gtm-architecture-template.git
cd gtm-architecture-template
```

```text
Read AGENTS.md and linkedin/README.md. Use setup-workspace to establish my
context in context/, then capture-context and voice-calibration on the
material I supply. Ask for the few missing details needed to draft one useful
LinkedIn post. Keep unknown claims empty. Return the draft in chat first.
```

Supply a short interview, 5–10 representative posts or writing samples, your offer and examples of people you want to help. [The interview](../context/templates/context-interview.md) gives you the questions. You can start drafting locally without Notion or OXYGEN.

Then follow the four parts below:

1. **Create relevant content.** Fill your scaffold, choose pillars and draft using `linkedin-copywriter`. Use `week-posts` once the first draft sounds like you.
2. **Organize and offer something useful.** Set up [Notion](notion.md) and use `lead-magnet-creator` for a resource that solves one reader problem. Content Board dates are editorial plans; reviewed publishing is a separate OXYGEN action.
3. **Find relevant people.** Create the native [Profile Watcher](profile-watcher.md), then add [qualification](qualification.md) to its results table.
4. **Start useful conversations.** Review the qualified people and use [the DM framework](dm-conversion.md). Existing conversations stay in Unibox; a new outreach cadence belongs in a native Sequence.

When you reach the workflow setup, paste this into your connected agent:

```text
Read linkedin/profile-watcher.md and linkedin/qualification.md. Help me set
up the native OXYGEN Profile Watcher for [MY REAL LINKEDIN PROFILE URL].
Verify my workspace, preview the daily collection scope and recurring cap,
and show me that configuration. Use my ICP and offer to fill the qualification
rubric and prepare a separate scoring column. After the watcher is active,
inspect its actual columns and preview one qualification row before any paid
scoring. Keep outreach as a separate reviewed step.
```

## What runs where

The repo holds context, skills, prompts and editable files. Notion holds the editorial board. OXYGEN owns collection, table rows, paid qualification runs and any approved outreach.

Profile Watcher is an existing OXYGEN feature, not a downloaded script. Creating it starts collection immediately and daily thereafter, with a recurring credit cap shown in the CLI preview. The qualification column has its own model cost. Neither cloning this repo nor adding the column runs a campaign. See the setup guides for the exact activation steps.

The diagram is a detailed reference, so zoom into the PNG to read the cards. Its headline is Tim's example result, not a forecast for your account. Measure qualified conversations, opportunities and signups alongside reach; distinguish each metric.

## Where the pieces came from

The original content-vault and blank content-engine template are already consolidated into this kit. This guide reuses that library rather than installing another copy. The [Adam Robinson webinar example](https://github.com/OXYGEN-CRO/adam-robinson-content-engine) supplies an optional worked example and public Notion board; its biography, voice and claims are not your context.

See [sources and validation](sources.md) for exact scope and checks. The complete repository contains 51 skills; [this guide selects 23](skills.md) for content and branding. The OXYGEN operating skills and other GTM tools remain available in the [full catalog](../docs/skills.md).
