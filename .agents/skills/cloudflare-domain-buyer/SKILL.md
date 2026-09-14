---
name: cloudflare-domain-buyer
description: Plan and carry out an explicitly scoped Cloudflare domain registration using current availability, price and renewal terms.
---

# Prepare a domain registration

This is an optional infrastructure procedure. No registrar client or purchase script is bundled.

Establish the intended domain names, owner, account, registration period, renewal preference and spend ceiling from the request. Use authentic brand-adjacent names; flag confusing spellings or unrelated trademarks.

Use the connected registrar's documented read operations to check availability, exact currency/price, premium status, renewal terms, privacy and supported registration settings. Verify current API/tool help rather than reusing old command strings. Keep credentials in the connection or secret store.

Produce a concrete preview for the exact domains and settings. A suggestion to explore domains does not authorize purchase. When the user has authorized those domains and spend, execute that scope only, then verify each registration's status and expiry. Query ambiguous results before retrying.

Return confirmed domains, actual charges, renewal state and failures. For email use, hand off to `zapmail-inbox-setup` or the user's existing provider. A registration alone does not create working mailboxes or establish deliverability.
