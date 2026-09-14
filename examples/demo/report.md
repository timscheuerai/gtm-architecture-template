# First batch: synthetic walkthrough

No accounts, API keys or network calls are used. Research, company/persona scores, verification and draft wording are supplied fixtures. The six deterministic function templates compute the queues, assignments, holds and sample metrics.

## The funnel

| Stage | Count |
|---|---:|
| Source records | 12 |
| Unique valid accounts | 10 |
| Rejected source records | 1 |
| Account research capacity | 5 |
| Selected accounts | 5 |
| Contacts passing both gates | 4 |
| Ready to enroll | 0 |
| Sent / provider calls | 0 / 0 |

An extra signal for company-0 is preserved without creating a second account. Company-2 passes company fit but fails persona fit. Company-6 is suppressed. Company-7/8/9 fail company fit. Stale intent cannot boost company-3; capacity may hold it. All message drafts await review and a real Sequence.

## Account decisions

| Selected | Priority | Intent score |
|---|---:|---:|
| company-0 | 93.2 | 77.33 |
| company-1 | 93.2 | 77.33 |
| company-2 | 93.2 | 77.33 |
| company-5 | 79.2 | 77.33 |
| company-4 | 75.7 | 77.33 |

| Held | Reason |
|---|---|
| company-6 | Suppressed. |
| company-7 | Fit gate failed or required score missing. |
| company-8 | Fit gate failed or required score missing. |
| company-9 | Fit gate failed or required score missing. |
| company-3 | Outside this run’s capacity. |

## Contact decisions

Only the selected account cohort reaches the persona gate. A failed persona is held; the demo does not automatically find a replacement buyer or refill capacity.

| Selected | Priority | Intent score |
|---|---:|---:|
| company-0 | 89.7 | 77.33 |
| company-1 | 89.7 | 77.33 |
| company-5 | 82.7 | 77.33 |
| company-4 | 80.95 | 77.33 |

| Held | Reason |
|---|---|
| company-2 | Fit gate failed or required score missing. |

## Drafts and readiness

### company-0.example · variant A

Subject: Your account research queue

A question for the operations team at Example Company 0: how do you decide which accounts deserve research before contact lookup? I put together an editable example of that workflow. Worth sending you the architecture diagram?

Held: First touch has not been reviewed. sequence_id is missing.

### company-1.example · variant B

Subject: Your account research queue

A question for the operations team at Example Company 1: how do you decide which accounts deserve research before contact lookup? I put together an editable example of that workflow. Open to a 15-minute walkthrough?

Held: First touch has not been reviewed. sequence_id is missing.

### company-5.example · variant B

Subject: Your account research queue

A question for the operations team at Example Company 5: how do you decide which accounts deserve research before contact lookup? I put together an editable example of that workflow. Open to a 15-minute walkthrough?

Held: First touch has not been reviewed. sequence_id is missing.

### company-4.example · variant A

Subject: Your account research queue

A question for the operations team at Example Company 4: how do you decide which accounts deserve research before contact lookup? I put together an editable example of that workflow. Worth sending you the architecture diagram?

Held: First touch has not been reviewed. sequence_id is missing.

## Learning loop

The JSON includes a separate synthetic historical outcome sample: one delivery and one positive reply. Those events are unrelated to the unsent drafts above. It is far below the example review floor; a displayed rate is not evidence of a winning message or a customer result.

## Make it yours

Use docs/first-batch.md and company/brief.example.md. Change capacity with npm run demo -- --capacity 3. Use the hosted functions for real research, scoring, verification and production state. See docs/composition.md for the stage mappings still required.
