> Worked example from the ContactOut x GTM Collective webinar (2026-11-19). Starting weights, to be recalibrated from meetings.

# AP signal weights and tiers (demo)

Points per account when the signal is 30 days old or less. Only Fit A/B accounts ([AP automation ICP](ap-icp.md)) are scored.

| Signal | Points | Source |
| --- | --- | --- |
| Past champion joined the account | 50 (Tier A alone) | CRM champions + a job-change check from their old work email (ContactOut `email_profile_enrich`) |
| ERP migration posting (implementing or replacing NetSuite, Sage Intacct, SAP, Dynamics) | 30 | Blitz job search, description text |
| New finance leader in the seat (CFO, VP Finance, Head of Finance or Controller, under 1 year) | 20 | ContactOut free people count per account (W1b) |
| CFO or VP Finance posting | 25 | Blitz job search |
| AP hiring (AP specialist, AP clerk, AP manager) | 20, +5 for 2 or more postings | Blitz job search |
| Audit, SOX or controller hiring | 15, +5 for 2 or more postings | Blitz job search |
| A finance person follows a competitor | 10 | Competitor follower list |

- **Freshness:** full points up to 30 days, half at 31-60, a quarter at 61-90, zero after 90.
- **Stacking:** +10 for 2 signal types, +20 for 3 or more.
- **Tiers:** A at 50 or more (3 buyers, email and LinkedIn). B at 30-49 (1 buyer, email). C under 30: no spend, wait for the next signal.
- **Weak signal rule:** one audit posting alone (15) never starts outreach.
- **Recalibrate:** after 30 days compare meetings per 100 accounts by tier; adjust weights from the signals behind real meetings.

Buyers: [AP automation buyers](ap-buyers.md).
