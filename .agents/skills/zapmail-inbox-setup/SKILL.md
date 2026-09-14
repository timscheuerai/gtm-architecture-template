---
name: zapmail-inbox-setup
description: Plan and provision an explicitly requested sender setup through ZapMail or the connected mailbox provider, with verified account, DNS and recurring cost.
---

# Set up sender infrastructure

This is an optional provider procedure; no ZapMail MCP, mailbox subscription or credentials are bundled. Read [the runtime contract](../../../docs/runtime-contract.md) when connecting senders to OXYGEN.

Inspect the chosen workspace, domain ownership, existing DNS, current mailbox inventory and actual provider capabilities. Plan real sender identities, mailbox count, provider mix and recurring cost from the user's needs and current terms. No fixed price, mix or daily volume is assumed.

Before a paid provisioning action, make the requested mailbox list and billing concrete. Proceed within the authorized scope. A nameserver change can affect the whole domain: inspect existing records and preserve unrelated services; do not switch nameservers merely because an old recipe did.

Create only the requested resources and verify their resulting state. Inspect MX, SPF, DKIM and DMARC through the provider's actual setup and DNS results; a provisioned mailbox does not prove authentication is correct. Report propagation separately from configuration.

Connect the exact sender accounts to OXYGEN using the current connector flow. Keep exported credentials out of the repository and logs. Set warmup and limits according to the chosen provider and observed sender health, then read back status.

Return created/existing/failed mailboxes, authentication status, recurring charges and next readiness check. Infrastructure setup does not authorize launching a campaign; `oxygen-sequencer-enroll` handles that handoff.
