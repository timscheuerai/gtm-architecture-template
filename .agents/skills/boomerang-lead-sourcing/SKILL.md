---
name: boomerang-lead-sourcing
description: Turn a user-supplied Apollo or Boomerang export into a narrowly defined, auditable account batch for OXYGEN.
---

# Prepare an exported audience

Use [lead-sourcing](../lead-sourcing/SKILL.md) to define one audience and a filter ledger. This is an export/import procedure; no scraper or subscription is bundled.

Read the supplied CSV headers and a small sample. Confirm whether rows represent people or companies. Preserve the original file under ignored `data/`; record its source, export date and filter set. Count with a CSV parser, including quoted newlines.

Map company domain, person LinkedIn URL, name, title, email and provenance without treating a supplied email as freshly verified. Quarantine missing identities and malformed rows. Apply customer/pipeline exclusions from the user's current records.

Normalise company sources through the installed `normalise_sources` function or its synthetic demo. Use `oxygen-dedupe` before import. Discover the current CSV import or row-ingestion command and inspect the proposed table and mappings before executing the authorized import.

Return the exact audience, parsed/imported/rejected counts, table link and unresolved mappings. Next: company research and scoring, then persona matching, then contact verification. Do not prescribe a large scrape as the starting batch.
