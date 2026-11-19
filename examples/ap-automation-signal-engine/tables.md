# Tables and columns

Every table lives in one OXYGEN folder. Formulas and lookups are free. Paid columns sit behind a run condition so they never spend on rows you will discard.

**Stored values.** Formulas and lookups show live values in the grid, but cross-table lookups, AI column inputs and run conditions read the stored cell. Store them first with a free forced run, `oxygen columns run <table> <column> --all --force --background --json`. W1, W2 and W3 start with that step.

## Hiring signal tables (4)

Created by `oxygen signals search run --family hiring --scope market --countries US --max-pages 3 --approved --max-credits 18`. Each run read 150 postings for 14.25 credits: 3 pages of 50, plus the AI filter at 0.075 per posting.

| Table | Title keywords | Last days | AI filter (what a posting must be) |
|---|---|---|---|
| Hiring: CFO | Chief Financial Officer, CFO, VP Finance, Vice President of Finance, Head of Finance | 30 | An in-house CFO or VP Finance role at an operating company, not a fractional-CFO firm, accounting firm or staffing agency hiring for a client |
| Hiring: ERP | NetSuite Administrator, ERP Project Manager, ERP Analyst, ERP Implementation, Systems Accountant, Finance Systems Manager, ERP Manager | 60 | An in-house role whose posting mentions implementing, migrating to or replacing an ERP such as NetSuite, SAP S/4HANA, Microsoft Dynamics, Sage Intacct or Acumatica, not a consultancy or ERP vendor |
| Hiring: audit and SOX | Internal Audit, SOX, Audit Manager, Controller, Assistant Controller, Senior Accountant | 30 | An in-house role supporting year-end close, external audit or SOX readiness at an operating company, not at an accounting firm, audit firm or staffing agency |
| Hiring: AP | Accounts Payable Specialist, Accounts Payable Clerk, AP Specialist, AP Clerk, Accounts Payable Manager, Accounts Payable Supervisor | 30 | An in-house accounts payable role at an operating company, not at an accounting firm, BPO or staffing agency |

Source columns: `job_title`, `company_name`, `domain` (empty: postings carry no domain), `signal_date`, `source_url`, `source_payload`, `ai_filter`, `ai_filter_score`, `ai_filter_strength`.

| Column | Kind | Definition |
|---|---|---|
| `company_linkedin_url` | formula | `normalize_linkedin_url(path(source_payload, "company_linkedin_url"))` |
| `kept_company_li` | formula | `if(ai_filter = true, company_linkedin_url, "")`: only postings the AI filter kept count |
| `age_days` | formula | `date_diff(today(), date_parse(signal_date), "day")` |
| `erp_named` | formula | Names the ERP from the title and the posting's AI summary (below) |
| `erp_company_li` | formula | `if(erp_named != "", company_linkedin_url, "")` |

`erp_named`, our own technographics for free:

```
if(contains(lower(concat(job_title, " ", default(path(source_payload, "ai_summary"), ""))), "netsuite"), "NetSuite", if(contains(lower(concat(job_title, " ", default(path(source_payload, "ai_summary"), ""))), "intacct"), "Sage Intacct", if(contains(lower(concat(job_title, " ", default(path(source_payload, "ai_summary"), ""))), "business central"), "Dynamics 365 Business Central", if(contains(lower(concat(job_title, " ", default(path(source_payload, "ai_summary"), ""))), "dynamics"), "Microsoft Dynamics", if(contains(lower(concat(job_title, " ", default(path(source_payload, "ai_summary"), ""))), "acumatica"), "Acumatica", if(regex_match(lower(concat(job_title, " ", default(path(source_payload, "ai_summary"), ""))), "s/?4 ?hana|\bsap\b"), "SAP", ""))))))
```

## Accounts

One row per company, deduped on the normalized company LinkedIn URL. Filled by Blitz company search (US, 100 to 1,000 employees, wholesale, manufacturing, construction, truck transportation, logistics; 1 credit per 50 companies) and by W1 from the hiring tables.

| Column | Kind | Definition | Run condition |
|---|---|---|---|
| `logo_url`, `company_name`, `domain`, `website`, `linkedin_url`, `location`, `employee_count`, `industry`, `evidence`, `raw_source` | source | Blitz company search | |
| `source` | text | "TAM: Blitz company search" or "Hiring signal: CFO, AP" | |
| `company_enrich` | enrichment preset `company_enrich` | Blitz first, then public profile data; about 1 credit a company. Fills `company_domain`, `company_headcount`, `company_industry`, `company_description`, `company_hq_country` | W1 runs it on new row ids only |
| `acct_domain`, `acct_industry`, `acct_employees`, `acct_description` | formula | `coalesce(<source field>, <enriched field>)` | |
| `cfo_postings`, `erp_postings`, `audit_postings`, `ap_postings` | lookup, count | match `linkedin_url` = `kept_company_li`, normalize `linkedin` | |
| `cfo_age`, `erp_age`, `audit_age`, `ap_age` | lookup, aggregate `min:age_days` | same match | |
| `erp_from_cfo`, `erp_from_erp`, `erp_from_audit`, `erp_from_ap` | lookup, first-match, return `erp_named` | match `linkedin_url` = `erp_company_li` | |
| `erp` | formula | `ifblank(erp_from_erp, ifblank(erp_from_ap, ifblank(erp_from_audit, ifblank(erp_from_cfo, ""))))` | |
| `ap_company_fit` | Classify, labels `A,B,C`, 0.075 a row | prompt below | `not(is_blank(acct_industry) and is_blank(acct_description))` |
| `fit` | formula | `default(path(ap_company_fit, "label"), "")` | |
| `new_finance_leaders` | number, written by W1b | free ContactOut count of CFOs, VPs or Heads of Finance and Controllers under 1 year in role | |
| `pts_erp` | formula | `if(erp_postings > 0, 30 * <decay erp_age>, 0)` | |
| `pts_cfo` | formula | `if(cfo_postings > 0, 25 * <decay cfo_age>, 0)` | |
| `pts_ap` | formula | `if(ap_postings > 0, (20 + if(ap_postings >= 2, 5, 0)) * <decay ap_age>, 0)` | |
| `pts_audit` | formula | `if(audit_postings > 0, (15 + if(audit_postings >= 2, 5, 0)) * <decay audit_age>, 0)` | |
| `signal_types` | formula | count of signal families with points above 0 | |
| `score` | formula | `if(or(fit = "A", fit = "B"), <sum of points> + if(signal_types >= 3, 20, if(signal_types = 2, 10, 0)), 0)` | |
| `tier` | formula | `if(score >= 50, "A", if(score >= 30, "B", "C"))` | |
| `top_trigger` | formula | the family with the most points: ERP, CFO or Audit/AP | |
| `why_now` | AI column, about 4 credits a row | prompt below (spec/why-now-prompt.txt) | `or(tier = "A", tier = "B")` |
| `account_research` | research column (Web Research Agent), quick depth, about 2.1 credits a row, cited | prompt below (spec/research-prompt.txt); sections Snapshot, Finance stack, AP angle, Sources | `or(tier = "A", tier = "B")` |
| `buyers_searched` | text | date W2 searched buyers here | |

`<decay x>` is `if(is_blank(x), 0, if(x <= 30, 1, if(x <= 60, 0.5, if(x <= 90, 0.25, 0))))`.

AP Company Fit prompt:

```
Rate how well this company fits the ICP of an AP automation product (knowledge page "AP automation ICP (demo)").

Company: {{company_name}}
Industry: {{acct_industry}}
Employees: {{acct_employees}}
HQ: {{location}} {{company_hq_country}}
Description: {{acct_description}}
ERP named in its job ads: {{erp}}

A = all of: HQ in the United States; 100 to 1,000 employees; wholesale and distribution, manufacturing, construction, or transportation and logistics; an operating company with its own in-house finance team; and the ERP is NetSuite, Sage Intacct, Dynamics 365 Business Central or Acumatica.
B = region, size, industry and in-house finance match, but the ERP is unknown or a different one.
C = outside the US, under 100 or over 1,000 employees, another industry (hospitals, universities, software, retail, banks), or an excluded type: accounting, bookkeeping or audit firm; staffing or recruiting agency; fractional-CFO firm; AP automation, payments or ERP vendor or implementation partner; government, public sector, association or non-profit.
If size or industry is missing, judge from the description; when the evidence is too thin, choose C and say what is missing.
```

Why-now prompt (only signals with a count above 0 may be mentioned; an earlier version called an AP-hiring account an "ERP migration"):

```
Write one sentence (max 25 words) that a sales rep at an AP automation company could open an email to {{company_name}} with. State the strongest fresh signal below as a plain fact.

Signals at this company (count, freshest age in days):
- ERP migration job ads: {{erp_postings}} ({{erp_age}} days)
- CFO or VP Finance job ads: {{cfo_postings}} ({{cfo_age}} days)
- Accounts payable job ads: {{ap_postings}} ({{ap_age}} days)
- Audit, SOX or controller job ads: {{audit_postings}} ({{audit_age}} days)
- Finance leaders new in the seat this year: {{new_finance_leaders}}
- ERP named in their job ads: {{erp}}

Only mention a signal whose count is above 0, and never mention a signal whose count is 0 or blank. If two signals are present, you may combine them. Use the everyday company name. No hype, no question, no exclamation mark, no placeholders. Return only the sentence.
```

Research agent prompt:

```
Research {{company_name}} ({{acct_domain}}), a {{acct_industry}} company with about {{acct_employees}} employees, for an AP automation sales rep. Use only facts you can cite from the web.

Return the following sections:
Snapshot: one sentence on what the company does, where it operates and how it grows (new sites, acquisitions, product lines).
Finance stack: the ERP, AP or spend tools it uses, if public. Write "not public" if you find nothing.
AP angle: one sentence on why invoice volume or AP work is likely heavy or changing right now (growth, ERP change, new finance leader, hiring), grounded in a fact.
Sources: up to 3 URLs.
```

## Buyers

One row per person, keyed on the person's LinkedIn URL and linked to Accounts on the company LinkedIn URL. Filled by W2.

| Column | Kind | Definition | Run condition |
|---|---|---|---|
| `full_name`, `first_name`, `last_name`, `job_title`, `linkedin_url`, `headline`, `country`, `role_start_date`, `company_name`, `company_domain`, `company_linkedin_url`, `buyer_role`, `found_by` | text | written by W2 from Blitz or ContactOut people search | |
| `account_tier`, `account_fit`, `top_trigger`, `why_now`, `account_erp`, `account_industry`, `account_research` | lookup, first-match | match `company_linkedin_url` = Accounts `linkedin_url`, normalize `linkedin` | |
| `months_in_role` | formula | `if(is_blank(role_start_date), "", date_diff(today(), date_parse(role_start_date), "month"))` | |
| `ap_persona_fit` | Classify, labels `Economic buyer,Champion,User,No fit`, 0.075 a row | prompt below | `or(account_tier = "A", account_tier = "B")` |
| `persona` | formula | `default(path(ap_persona_fit, "label"), "")` | |
| `work_email_enrichment` | enrichment, capability `work_email`, provider order `blitzapi,contactout` | Blitz 1.5 credits per hit, ContactOut 16.5 per hit, nothing on a miss. Fills `email`, `email_provider`, `email_status` | W2 runs it only where persona is not No fit |
| `email_verification` | enrichment, capability `verify_email`, MillionVerifier | one verifier per column | |
| `bounceban_check` | tool `bounceban.verify_single`, 1.7 credits | second check on catch-all only | `and(not(is_blank(email)), contains(lower(text(email_verification)), "catch"))` |
| `channel` | formula | "Skip" for No fit; "LinkedIn only" without a verified email; "Email + LinkedIn" when verified; "Waiting for BounceBan" on catch-all | |
| `ready` | formula | persona fits, channel is reachable, account tier A or B | |
| `outbound_copy` | AI column with sections Subject, Email 1, LinkedIn note, LinkedIn message, Email 2; about 4 credits a buyer | prompt below (spec/copy-prompt.txt) | `text(ready) = "true"` (a formula boolean is stored as text) |
| `copy_subject`, `copy_email_1`, `copy_li_note`, `copy_li_message`, `copy_email_2` | formula | `default(path(outbound_copy, "Subject"), "")` and so on; the Sequence reads these | |
| `routed_to` | text | Sequence and date W3 enrolled the buyer into, after approval | |

AP Persona Fit prompt:

```
Classify this person's buying role for an AP automation product (knowledge page "AP automation buyers (demo)").

Name: {{full_name}}
Title: {{job_title}}
Headline: {{headline}}
Company: {{company_name}}
Country: {{country}}
Months in role: {{months_in_role}}

Economic buyer = CFO, VP Finance or Head of Finance at this company, in the seat now.
Champion = Controller, Director of Finance, Head of Accounting or Finance Systems Manager at this company.
User = AP Manager, AP Lead or Accounts Payable Supervisor at this company.
No fit = anyone else: AP clerks and specialists, assistants, FP&A-only analysts, external accountants or auditors, IT without a finance-systems remit, people based outside the US, or a title that belongs to a different company or a former role.
```

Outbound copy prompt:

```
Write short first-touch outreach from an AP automation company to {{first_name}}, {{job_title}} at {{company_name}}. Buying role: {{persona}}. Months in this role: {{months_in_role}}.

Why now: {{why_now}}
Research on the company: {{account_research}}

Offer: our 2026 AP benchmark (invoices per AP person, cost per invoice, days to close for finance teams of 100 to 1,000 people). Never quote numbers from it.

How to write it:
- Straight and to the point, like a busy person writing a colleague. Short sentences.
- Open with the why-now fact ("Saw X is hiring for ..."), then name the pain it usually brings for AP in one plain line, using a research detail when it sharpens the pain. Then offer the benchmark in one short question.
- Use the everyday company name. A short "congrats on the new role" only if months in role is 6 or less.
- Banned: "I figured", "happy to", "no strings attached", "nothing fancy", "quick read", "should I leave it be", "no pitch", "peer note", "cheers", "hope", "just", "reach out", "touch base", "worth a look", exclamation marks, em dashes, flattery, any number from the benchmark.
- Do not invent anything beyond the why-now line and the research.

Example of the length and tone (for a different company):
Subject: ap during the sap move
Email 1: Hi Dana, saw Northwind is hiring for its SAP move. That's usually when AP gets messy: invoices still run the old way while the new system goes live. Want our AP benchmark for teams your size?

Return the following sections:
Subject: 2 to 5 words, lowercase.
Email 1: 25 to 45 words in 3 sentences: why now, the pain, the offer as a question.
LinkedIn note: under 150 characters, the why-now and the pain in one line, no offer.
LinkedIn message: under 220 characters, sent after they accept: the pain in one line, then the benchmark offer as a question.
Email 2: under 35 words, same thread, one more pain angle from the research, the offer again as a question.
```

## The Sequence

One draft Sequence, `ap-webinar-benchmark` ([spec/sequences/benchmark-offer.json](spec/sequences/benchmark-offer.json)): visit the profile, email 1 (skipped without an email), connection request with the LinkedIn note, then the LinkedIn message if accepted within 7 days, otherwise email 2 in the same thread. Every step reads the `copy_*` columns. No sender is attached; enrollment waits for W3's approval.
