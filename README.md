# GTM Architecture Kit

**Build your first qualified account queue, reviewed outreach draft and learning loop.**

One repo for the company context, agent skills and editable functions behind that work. Start with a ten-account example, then adapt it to your market.

[Use this template](https://github.com/new?template_name=gtm-architecture-template&template_owner=timscheuerai) · [Download ZIP](https://github.com/timscheuerai/gtm-architecture-template/archive/refs/heads/main.zip) · [See the worked example](examples/demo/report.md)

## Turn LinkedIn content into pipeline

Start with the [LinkedIn Pipeline Kit](linkedin/README.md): 23 selected content and branding skills, the personal-brand scaffold, a Notion board guide, OXYGEN Profile Watcher setup, an editable qualification prompt, a DM conversion framework and the high-resolution funnel. All in this repository, with one shared skills library.

The [LinkedIn guide](linkedin/README.md) takes you from your own source material to a post, then from relevant engagement to a qualified conversation. Start there if you came for the content system; the account-sourcing demo below is a separate entry point.

## Get a result first

Requires Node.js 22+. No account, API key, dependency install or paid service is needed for this demo.

```sh
git clone https://github.com/timscheuerai/gtm-architecture-template.git
cd gtm-architecture-template
npm run demo
```

Open `output/demo/report.md`. You will see **10 accounts → 5 selected accounts → 4 qualified contacts → 0 ready messages**, with a reason for every hold. Change capacity with `npm run demo -- --capacity 3`.

The demo runs the six deterministic functions using synthetic research, scores, verification and copy. It makes no provider calls or sends. [See the full first-batch guide](docs/first-batch.md) to replace the fixtures with your own criteria.

## What you get

| Part | What it helps you produce |
|---|---|
| [Company brief and rubrics](company) | One buyer, useful offer, independent fit gates and exclusions |
| [13 function templates](docs/oxygen-setup.md#the-functions) | Source intake, research, scoring, priority queues, contact lookup, test assignment, copy, readiness and results |
| [51 agent skills](docs/skills.md) | Guided GTM work, native OXYGEN operations, content, visuals and optional media |
| [Blank context workspace](context/index.md) | Your audience, voice, source material, strategy and cleared proof |
| [Worked example](examples/demo/report.md) | Inspectable decisions and held rows before you connect tools |
| [Experiment and learning templates](company/experiment.example.json) | Frozen variants, outcome definitions and reviewed next changes |
| [OXYGEN installer and blueprints](docs/oxygen-setup.md) | Seven callable tables and six disabled workflows in your workspace |

The functions are modular. [Composition](docs/composition.md) explains how to map them together and hand off to a native Sequence. Installing them does not wire or launch a full campaign.

## Pick your first job

**Prepare a first batch.** Fill [the brief](company/brief.example.md), then open this repo in your coding agent:

> Use gtm-start. Help me qualify ten known accounts, explain the holds, write one useful first touch and define one test.

**Turn your expertise into content.** Start with an interview or writing samples:

> Use setup-workspace, then capture-context and voice-calibration. Draft one LinkedIn post from the supplied source.

**Install the hosted functions.** Follow [OXYGEN setup](docs/oxygen-setup.md). It requires an OXYGEN account and CLI; provider/model runs have separate costs. Inspect a one-row preview and calibrate before a live batch.

**Operate the system in OXYGEN.** Use [the 12 additional OXYGEN skills](docs/oxygen-skills.md) for Knowledge, Recipes, Workflows, Sequences, inbox, LinkedIn marketing, sender setup, deliverability, diagnostics and table cleanup. The guide includes concrete prompts for each stage.

## One shared skills library

The canonical files live in [.agents/skills](.agents/skills). Claude Code uses the same files through `.claude/skills`. Open the repo as your workspace and ask for a skill by name. Run `npm run skills` for the catalog.

If your ZIP extractor or Git configuration materializes the Claude link as a text file, run `npm run skills:claude` to repair it. No global skill installation is required. Moving only a SKILL.md into another project can break its context and function references; keep the kit together.

The [catalog](docs/skills.md) groups GTM, OXYGEN, content and media skills by job. Flowchart helpers are bundled; media renderers and service subscriptions are separate prerequisites. Skills are instructions for an agent, not proof that each external integration has been tested.

## Make it yours

Keep real prospect exports in ignored `data/`, private company inputs in `company/private/`, and outputs in `output/`. Connection preferences are ignored; credentials stay in the tools' auth stores. Use a private working repo when filling the tracked context pages with sensitive material.

Edit prompts and contracts, then verify:

```sh
npm run build
npm test
npm run check:kit
```

See [validation](docs/validation.md) for tested behavior and remaining live-pilot work. [Sources and consolidation](docs/sources.md) records where the skills came from and what was merged or replaced. This repository is the maintained distribution of the kit.

MIT licensed. Built by [Tim Scheuer](https://github.com/timscheuerai).
