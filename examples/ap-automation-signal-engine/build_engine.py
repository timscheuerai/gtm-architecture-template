#!/usr/bin/env python3
"""Build a replica of the AP-automation signal engine in an OXYGEN folder.

One command rebuilds the whole AP signal engine from this example in an OXYGEN
folder, step by step (the webinar's "build that system" moment):

  1 folder         5 Accounts columns (facts, ERP, fit, signals, score, tier,
  2 knowledge        why-now, AI research agent)
  3 Accounts       6 Buyers table (lookups, persona fit, email waterfall, verify,
  4 signal tables    AI copy with a free-resource offer)
                   7 one draft Sequence fed by the AI copy (no sender, nothing sends)
                   8 workflows W1, W1b, W2, W3 (on-demand triggers)
                   9 --run: W1 -> W1b -> W2 -> W3 (W3 writes the copy, stops at approval)
                  10 --content: results.json, LinkedIn post and animated GIF

Every paid step runs under a ceiling. Re-running resumes: existing tables,
columns, Sequences and workflows are reused, not duplicated.

  python3 build_engine.py --folder "AP engine · Live build" --label Live --prefix live --plan
  python3 build_engine.py --folder "AP engine · Live build" --label Live --prefix live --run

Requires the `oxygen` CLI, logged in (`oxygen login`). Pass `--profile` to use a
stored CLI profile; without it the active profile is used. The knowledge pages it
checks (`demo-ap-automation-*`) do not exist in a new workspace: create your own 3
pages from `knowledge/` first, or the step only prints a hint.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = HERE / "spec"
RECIPE_DIR = HERE / "workflows" if (HERE / "workflows").is_dir() else HERE
ENV = dict(os.environ, NODE_OPTIONS="--no-network-family-autoselection --dns-result-order=ipv4first")
WEB = os.environ.get("OXYGEN_APP_URL", "https://oxygen-agent.com") + "/workspaces/{org}"

FAMILIES = [
    dict(key="cfo", name="Hiring: CFO", family="CFO", last_days=30,
         prompt="US companies hiring a CFO or VP Finance",
         keywords="Chief Financial Officer,CFO,VP Finance,Vice President of Finance,Head of Finance",
         ai_filter="An in-house CFO or VP Finance role at an operating company, not a fractional-CFO firm, accounting firm or staffing agency hiring for a client"),
    dict(key="erp", name="Hiring: ERP", family="ERP", last_days=60,
         prompt="US companies hiring for an ERP implementation or migration",
         keywords="NetSuite Administrator,ERP Project Manager,ERP Analyst,ERP Implementation,Systems Accountant,Finance Systems Manager,ERP Manager",
         ai_filter="An in-house role whose posting mentions implementing, migrating to or replacing an ERP such as NetSuite, SAP S/4HANA, Microsoft Dynamics, Sage Intacct or Acumatica, not a consultancy or ERP vendor"),
    dict(key="audit", name="Hiring: audit and SOX", family="Audit/SOX", last_days=30,
         prompt="US companies hiring for audit, SOX or controller roles",
         keywords="Internal Audit,SOX,Audit Manager,Controller,Assistant Controller,Senior Accountant",
         ai_filter="An in-house role supporting year-end close, external audit or SOX readiness at an operating company, not at an accounting firm, audit firm or staffing agency"),
    dict(key="ap", name="Hiring: AP", family="AP", last_days=30,
         prompt="US companies hiring accounts payable staff",
         keywords="Accounts Payable Specialist,Accounts Payable Clerk,AP Specialist,AP Clerk,Accounts Payable Manager,Accounts Payable Supervisor",
         ai_filter="An in-house accounts payable role at an operating company, not at an accounting firm, BPO or staffing agency"),
]
KNOWLEDGE = ["demo-ap-automation-icp", "demo-ap-automation-buyers", "demo-ap-signal-weights"]
TEMPLATE_SLUGS = {"hiring-cfo": "cfo", "hiring-erp": "erp", "hiring-audit-and-sox": "audit", "hiring-ap": "ap"}
RECIPES = ["w1-signals-into-accounts.ts", "w1b-contactout-new-leaders.ts", "w2-tier-ab-to-buyers.ts", "w3-route-to-outbound.ts"]
SEQUENCES = [("benchmark", "Benchmark offer", "benchmark-offer.json")]
COPY_SECTIONS = [("copy_subject", "Subject"), ("copy_email_1", "Email 1"), ("copy_li_note", "LinkedIn note"),
                 ("copy_li_message", "LinkedIn message"), ("copy_email_2", "Email 2")]


def decay(col: str) -> str:
    return f"if(is_blank({col}), 0, if({col} <= 30, 1, if({col} <= 60, 0.5, if({col} <= 90, 0.25, 0))))"


# ---------------------------------------------------------------- CLI helpers
class OxygenError(RuntimeError):
    pass


def ox(args: list[str], *, retries: int = 2, allow_fail: bool = False) -> dict:
    cmd = ["oxygen", *(["--profile", PROFILE] if PROFILE else []), *args, "--json"]
    last = None
    for attempt in range(retries + 1):
        proc = subprocess.run(cmd, capture_output=True, text=True, env=ENV)
        out = proc.stdout.strip()
        try:
            data = json.loads(out[out.index("{"):]) if "{" in out else {}
        except json.JSONDecodeError:
            data = {}
        if data.get("ok"):
            return data.get("data") or {}
        last = data.get("error") or {"message": (proc.stderr or out)[-400:]}
        if (last or {}).get("code") in ("network_error", "rate_limited") and attempt < retries:
            time.sleep(4 * (attempt + 1))
            continue
        break
    if allow_fail:
        return {"_error": last}
    raise OxygenError(f"{' '.join(args[:3])}: {json.dumps(last)[:400]}")


def say(step: str, text: str, link: str | None = None) -> None:
    print(f"[{step}] {text}" + (f"\n        {link}" if link else ""), flush=True)


def as_list(data, *keys):
    if isinstance(data, list):
        return data
    for key in keys:
        if isinstance(data.get(key), list):
            return data[key]
    return []


# ---------------------------------------------------------------- state
class Build:
    def __init__(self, args):
        self.a = args
        self.label = args.label
        self.prefix = args.prefix
        who = ox(["whoami"])
        self.org = who["organization"]["id"]
        self.web = WEB.format(org=self.org)
        self.project = None
        self.tables: dict[str, dict] = {}
        self.columns: dict[str, set[str]] = {}

    # -- lookups
    def table_name(self, base: str) -> str:
        return f"{self.label} · {base}"

    def find_table(self, name: str):
        data = ox(["tables", "list", "--project", self.project["slug"], "--limit", "200"])
        for t in as_list(data, "tables", "items"):
            if t.get("displayName") == name:
                return t
        return None

    def cols(self, slug: str) -> set[str]:
        if slug not in self.columns:
            data = ox(["tables", "describe", slug])
            self.columns[slug] = {c["key"] for c in data.get("columns", [])}
        return self.columns[slug]

    def row_count(self, slug: str) -> int:
        data = ox(["tables", "describe", slug, "--stats"])
        stats = data.get("stats") or {}
        return int(stats.get("row_count") or stats.get("rowCount") or data.get("row_count") or 0)

    def wait_rows(self, slug: str, label: str, timeout: int = 240) -> int:
        last, stable, start = -1, 0, time.time()
        while time.time() - start < timeout:
            n = self.row_count(slug)
            stable = stable + 1 if n == last and n > 0 else 0
            if stable >= 2:
                break
            last = n
            time.sleep(6)
        say("rows", f"{label}: {last} rows")
        return last

    def add_col(self, slug: str, key: str, args: list[str]) -> None:
        if key in self.cols(slug):
            return
        ox(["columns", "add", slug, "--key", key, *args])
        self.columns[slug].add(key)

    def formula(self, slug, key, label, expr, note):
        self.add_col(slug, key, ["--label", label, "--kind", "formula",
                                 "--definition-json", json.dumps({"expression": expr}), "--description", note])

    def lookup(self, slug, key, label, source, match, mode, extra=()):
        self.add_col(slug, key, ["--label", label, "--lookup-table", source, "--lookup-match", match,
                                 "--lookup-normalize", "linkedin", "--lookup-mode", mode, *extra])

    # -- steps
    def step_folder(self):
        data = ox(["projects", "list"])
        for p in as_list(data, "projects", "items"):
            if p.get("displayName") == self.a.folder:
                self.project = p
                break
        if not self.project:
            created = ox(["projects", "create", self.a.folder])
            self.project = created.get("project") or created
        say("1 folder", f"{self.a.folder}", f"{self.web}/tables?project={self.project['slug']}")

    def step_knowledge(self):
        missing = [slug for slug in KNOWLEDGE if "_error" in ox(["knowledge", "page", "get", slug], allow_fail=True)]
        if missing:
            say("2 knowledge", f"missing pages {missing}: create them from knowledge/ (ICP, buyers, signal weights) "
                "with `oxygen knowledge page upsert`; the prompts in spec/ carry the same rules")
        say("2 knowledge", "ICP, buyers and signal weights (shared demo pages)",
            WEB.split("/workspaces")[0] + "/knowledge")

    def step_accounts(self):
        name = self.table_name("Accounts")
        t = self.find_table(name)
        if not t:
            pages = max(1, -(-self.a.accounts // 50))
            run = ox(["companies", "search", "run", "--source", "company_search",
                      "--source-filters-json", f"@{SPEC / 'accounts-filters.json'}",
                      "--target-count", str(self.a.accounts), "--project", self.project["slug"],
                      "--table-name", name, "--upsert-key", "domain", "--mode", "live",
                      "--max-credits", str(pages + 1), "--approved"])
            t = run.get("table") or {}
            say("3 accounts", f"Blitz company search: {self.a.accounts} US companies, 100-1,000 staff, "
                f"distribution, manufacturing, construction, logistics ({pages} credits)")
        self.tables["accounts"] = t
        n = self.wait_rows(t["slug"], name)
        self.add_col(t["slug"], "source", ["--label", "Source", "--type", "text",
                                           "--description", "Where the account came from: company search or a hiring signal."])
        rows = ox(["tables", "query", t["slug"], "--fields", "linkedin_url,source", "--limit", "1000",
                   "--max-chars", "100000"]).get("rows", [])
        fill = [{"linkedin_url": r["linkedin_url"], "source": "TAM: Blitz company search"}
                for r in rows if r.get("linkedin_url") and not r.get("source")]
        if fill:
            ox(["tables", "upsert", t["slug"], "--key", "linkedin_url", "--rows-json", json.dumps(fill)])
        say("3 accounts", f"{n} accounts, one row per company", f"{self.web}/tables/{t['id']}")

    def step_signals(self):
        for fam in FAMILIES:
            name = self.table_name(fam["name"])
            t = self.find_table(name)
            if not t:
                base = ["signals", "search", "run", "--family", "hiring", "--scope", "market",
                        "--countries", "US", "--max-pages", str(self.a.signal_pages),
                        "--project", self.project["slug"], "--prompt", fam["prompt"],
                        "--keywords", fam["keywords"], "--last-days", str(fam["last_days"]),
                        "--ai-filter", fam["ai_filter"]]
                dry = ox([*base, "--mode", "dry_run"])
                cap = dry.get("recommended_max_credits") or 20
                run = ox([*base, "--mode", "live", "--max-credits", str(cap), "--approved"])
                ing = run.get("ingestion_run") or {}
                ox(["tables", "rename", ing["tableId"], "--name", name])
                t = {"id": ing["tableId"], "slug": None}
                say("4 signals", f"{fam['name']}: {self.a.signal_pages} page(s) of 50 job ads, AI filter "
                    f"drops agencies (about {(dry.get('credits') or {}).get('estimated_credits')} credits)")
            t = self.find_table(name)
            self.tables[fam["key"]] = t
        for fam in FAMILIES:
            t = self.tables[fam["key"]]
            self.wait_rows(t["slug"], t["displayName"])
            erp_expr = (SPEC / "erp-expr.txt").read_text().strip()
            s = t["slug"]
            self.formula(s, "company_linkedin_url", "Company LinkedIn",
                         'normalize_linkedin_url(path(source_payload, "company_linkedin_url"))',
                         "The hiring company's LinkedIn page, from the posting. Free.")
            self.formula(s, "kept_company_li", "Kept company", 'if(ai_filter = true, company_linkedin_url, "")',
                         "Company LinkedIn only when the AI filter kept the posting.")
            self.formula(s, "age_days", "Age (days)", 'date_diff(today(), date_parse(signal_date), "day")',
                         "Days since the posting went live.")
            self.formula(s, "erp_named", "ERP named", erp_expr,
                         "The ERP the posting names in its title or summary. Free technographics.")
            self.formula(s, "erp_company_li", "ERP company", 'if(erp_named != "", company_linkedin_url, "")',
                         "Company LinkedIn only when the posting names an ERP.")
            say("4 signals", f"{t['displayName']}: company, kept, age and ERP-named formulas (free)",
                f"{self.web}/tables/{t['id']}")

    def step_account_columns(self):
        acc = self.tables["accounts"]["slug"]
        self.add_col(acc, "source", ["--label", "Source", "--type", "text"])
        if "company_enrich" not in self.cols(acc):
            ox(["columns", "add", acc, "--preset", "company_enrich", "--input", "linkedin_url=linkedin_url"])
            self.columns.pop(acc, None)
        self.formula(acc, "acct_domain", "Domain (any source)", "coalesce(domain, company_domain)", "Free.")
        self.formula(acc, "acct_industry", "Industry (any source)", "coalesce(industry, company_industry)", "Free.")
        self.formula(acc, "acct_employees", "Employees (any source)",
                     "coalesce(employee_count, number(company_headcount))", "Free.")
        self.formula(acc, "acct_description", "Description (any source)",
                     "coalesce(evidence, company_description)", "Free.")
        for fam in FAMILIES:
            src, k, nm = self.tables[fam["key"]]["slug"], fam["key"], fam["family"]
            self.lookup(acc, f"{k}_postings", f"{nm} postings", src, "linkedin_url=kept_company_li", "count")
            self.lookup(acc, f"{k}_age", f"{nm} freshest (days)", src, "linkedin_url=kept_company_li",
                        "aggregate", ["--lookup-aggregate", "min:age_days"])
            self.lookup(acc, f"erp_from_{k}", f"ERP in {nm} ads", src, "linkedin_url=erp_company_li",
                        "first-match", ["--lookup-return", "erp_named"])
        self.formula(acc, "erp", "ERP (from job ads)",
                     'ifblank(erp_from_erp, ifblank(erp_from_ap, ifblank(erp_from_audit, ifblank(erp_from_cfo, ""))))',
                     "The ERP the company's own job ads name. Free.")
        self.add_col(acc, "ap_company_fit", ["--label", "AP Company Fit", "--classify", "A,B,C",
                                              "--prompt", (SPEC / "fit-prompt.txt").read_text(),
                                              "--run-condition", "not(is_blank(acct_industry) and is_blank(acct_description))",
                                              "--run-condition-columns", "acct_industry,acct_description",
                                              "--description", "Stage 03. Classify, 0.075 credits a row."])
        self.formula(acc, "fit", "Fit", 'default(path(ap_company_fit, "label"), "")', "A, B or C.")
        self.formula(acc, "pts_erp", "ERP migration pts", f"if(erp_postings > 0, 30 * {decay('erp_age')}, 0)", "30 with freshness.")
        self.formula(acc, "pts_cfo", "CFO posting pts", f"if(cfo_postings > 0, 25 * {decay('cfo_age')}, 0)", "25 with freshness.")
        self.formula(acc, "pts_ap", "AP hiring pts",
                     f"if(ap_postings > 0, (20 + if(ap_postings >= 2, 5, 0)) * {decay('ap_age')}, 0)", "20, +5 for 2+.")
        self.formula(acc, "pts_audit", "Audit hiring pts",
                     f"if(audit_postings > 0, (15 + if(audit_postings >= 2, 5, 0)) * {decay('audit_age')}, 0)", "15, +5 for 2+.")
        self.add_col(acc, "new_finance_leaders", ["--label", "New finance leaders (ContactOut)", "--type", "number"])
        self.add_col(acc, "leaders_checked", ["--label", "Leaders checked", "--type", "text"])
        self.formula(acc, "pts_new_leader", "New leader pts",
                     "if(number(default(new_finance_leaders, 0)) > 0, 20, 0)", "20 when ContactOut sees a new finance leader.")
        self.formula(acc, "signal_types", "Signal types",
                     "if(pts_erp > 0, 1, 0) + if(pts_cfo > 0, 1, 0) + if(pts_ap > 0, 1, 0) + if(pts_audit > 0, 1, 0) + if(pts_new_leader > 0, 1, 0)",
                     "Fresh signal types.")
        self.formula(acc, "score", "Score",
                     'if(or(fit = "A", fit = "B"), pts_erp + pts_cfo + pts_ap + pts_audit + pts_new_leader + if(signal_types >= 3, 20, if(signal_types = 2, 10, 0)), 0)',
                     "Stage 04. Points plus stacking; Fit C scores 0. Free.")
        self.formula(acc, "tier", "Tier", 'if(score >= 50, "A", if(score >= 30, "B", "C"))', "A 50+, B 30-49, C under 30.")
        self.formula(acc, "top_trigger", "Top trigger",
                     'if(score = 0, "", if(and(pts_erp > 0, pts_erp >= pts_cfo + pts_new_leader, pts_erp >= pts_ap, pts_erp >= pts_audit), "ERP", '
                     'if(and(pts_cfo + pts_new_leader > 0, pts_cfo + pts_new_leader >= pts_ap, pts_cfo + pts_new_leader >= pts_audit), "CFO", "Audit/AP")))',
                     "Picks the Sequence.")
        self.add_col(acc, "why_now", ["--label", "Why now", "--prompt", (SPEC / "why-now-prompt.txt").read_text().strip(),
                                       "--run-condition", 'or(tier = "A", tier = "B")', "--run-condition-columns", "tier",
                                       "--no-structured-output", "--description", "Stage 08. AI line, Tier A/B only."])
        self.add_col(acc, "account_research", ["--label", "AI research (Tier A/B)", "--kind", "research",
                                                "--research-depth", "quick",
                                                "--prompt", (SPEC / "research-prompt.txt").read_text(),
                                                "--run-condition", 'or(tier = "A", tier = "B")', "--run-condition-columns", "tier",
                                                "--description", "Stage 08. Web Research Agent, about 2.1 credits a row, Tier A/B only."])
        self.add_col(acc, "buyers_searched", ["--label", "Buyers searched", "--type", "text"])
        say("5 accounts", f"{len(self.cols(acc))} columns: facts, ERP, AP Company Fit, signal lookups, "
            "ContactOut new leaders, score, tier, why-now, AI research", f"{self.web}/tables/{self.tables['accounts']['id']}")

    def step_buyers(self):
        name = self.table_name("Buyers")
        t = self.find_table(name)
        if not t:
            cols = [{"key": k, "label": l, "dataType": "text"} for k, l in [
                ("full_name", "Name"), ("first_name", "First name"), ("last_name", "Last name"), ("job_title", "Title"),
                ("linkedin_url", "LinkedIn"), ("headline", "Headline"), ("country", "Country"),
                ("role_start_date", "In role since"), ("company_name", "Company"), ("company_domain", "Company domain"),
                ("company_linkedin_url", "Company LinkedIn"), ("buyer_role", "Buyer role"), ("found_by", "Found by")]]
            created = ox(["tables", "create", name, "--project", self.project["slug"], "--columns-json", json.dumps(cols)])
            t = created.get("table") or created
        self.tables["buyers"] = t
        b, acc = t["slug"], self.tables["accounts"]["slug"]
        for key, label, ret in [("account_tier", "Account tier", "tier"), ("account_fit", "Account fit", "fit"),
                                ("top_trigger", "Top trigger", "top_trigger"), ("why_now", "Why now", "why_now"),
                                ("account_erp", "ERP", "erp"), ("account_industry", "Industry", "acct_industry"),
                                ("account_research", "Company research", "account_research")]:
            self.lookup(b, key, label, acc, "company_linkedin_url=linkedin_url", "first-match", ["--lookup-return", ret])
        self.formula(b, "months_in_role", "Months in role",
                     'if(is_blank(role_start_date), "", date_diff(today(), date_parse(role_start_date), "month"))', "Free.")
        self.add_col(b, "ap_persona_fit", ["--label", "AP Persona Fit", "--classify", "Economic buyer,Champion,User,No fit",
                                            "--prompt", (SPEC / "persona-prompt.txt").read_text(),
                                            "--run-condition", 'or(account_tier = "A", account_tier = "B")',
                                            "--run-condition-columns", "account_tier",
                                            "--description", "Stage 06. Classify, 0.075 credits a row."])
        self.formula(b, "persona", "Persona", 'default(path(ap_persona_fit, "label"), "")', "Buying role.")
        if "work_email_enrichment" not in self.cols(b):
            ox(["enrich-column", "run", b, "--capability", "work_email", "--linkedin-url-column", "linkedin_url",
                "--full-name-column", "full_name", "--company-domain-column", "company_domain",
                "--provider-order", "blitzapi,contactout", "--limit", "1", "--approved", "--max-credits", "1"])
            self.columns.pop(b, None)
        if "email_verification" not in self.cols(b):
            ox(["enrich-column", "run", b, "--capability", "verify_email", "--source-column", "email",
                "--provider-order", "millionverifier", "--target-column", "email_verification",
                "--limit", "1", "--approved", "--max-credits", "1"])
            self.columns.pop(b, None)
        self.add_col(b, "bounceban_check", ["--label", "BounceBan (catch-all only)", "--kind", "tool",
                                             "--definition-json", json.dumps({"mode": "native", "toolId": "bounceban.verify_single",
                                                                              "inputMapping": {"email": {"type": "column", "columnKey": "email"}},
                                                                              "credentialMode": "managed"}),
                                             "--run-condition", 'and(not(is_blank(email)), contains(lower(text(email_verification)), "catch"))',
                                             "--run-condition-columns", "email,email_verification"])
        self.formula(b, "channel", "Channel",
                     'if(persona = "No fit", "Skip", if(is_blank(email), "LinkedIn only", if(contains(lower(text(bounceban_check)), "deliverable"), "Email + LinkedIn", '
                     'if(contains(lower(text(email_verification)), "invalid"), "LinkedIn only", if(contains(lower(text(email_verification)), "catch"), "Waiting for BounceBan", '
                     'if(contains(lower(text(email_verification)), "valid"), "Email + LinkedIn", "Verify first"))))))',
                     "Verified email: email and LinkedIn. Otherwise LinkedIn only.")
        self.formula(b, "ready", "Ready for outbound",
                     'and(or(persona = "Economic buyer", persona = "Champion", persona = "User"), or(channel = "Email + LinkedIn", channel = "LinkedIn only"), or(account_tier = "A", account_tier = "B"))',
                     "W3 enrolls only these rows.")
        self.add_col(b, "outbound_copy", ["--label", "Outbound copy (AI)", "--prompt", (SPEC / "copy-prompt.txt").read_text(),
                                           "--run-condition", 'text(ready) = "true"', "--run-condition-columns", "ready",
                                           "--description", "Stage 08. Why-now + research + the free AP benchmark offer."])
        for key, section in COPY_SECTIONS:
            self.formula(b, key, f"Copy: {section}", f'default(path(outbound_copy, "{section}"), "")',
                         f"Section '{section}' of the AI copy; the Sequence uses it.")
        self.add_col(b, "routed_to", ["--label", "Routed to", "--type", "text"])
        say("6 buyers", f"{len(self.cols(b))} columns: account lookups, AP Persona Fit, email waterfall "
            "(Blitz, then ContactOut), MillionVerifier, BounceBan, channel, ready, AI copy", f"{self.web}/tables/{t['id']}")

    def step_sequences(self):
        existing = {s.get("slug") for s in as_list(ox(["sequences", "list", "--limit", "200"], allow_fail=True),
                                                     "sequences", "items")}
        for key, title, steps in SEQUENCES:
            slug = f"{self.prefix}-{key}"
            if slug in existing:
                continue
            made = ox(["sequences", "create", "--name", f"{self.label} · {title} (draft)", "--slug", slug,
                       "--steps-file", str(SPEC / "sequences" / steps), "--channels", "linkedin,email",
                       "--table", self.tables["buyers"]["slug"], "--url-column", "linkedin_url", "--max-credits", "0"],
                      allow_fail=True)
            err = made.get("_error") or {}
            if err and err.get("code") != "sequence_slug_taken":
                raise OxygenError(f"sequences create: {json.dumps(err)[:300]}")
        say("7 sequence", "1 draft Sequence: visit, email 1, invite, message or email 2, all from the AI copy. "
            "No sender, nothing sends", f"{self.web}/sequencer/sequences")

    def step_preview(self):
        """Fill the first rows so the tables show data before the workflows run."""
        n = self.a.preview_rows
        if n <= 0:
            return
        for t in [self.tables[f["key"]] for f in FAMILIES]:
            for col in ("company_linkedin_url", "kept_company_li", "age_days", "erp_named", "erp_company_li"):
                ox(["columns", "run", t["slug"], col, "--all", "--background", "--force"], allow_fail=True)
        acc = self.tables["accounts"]["slug"]
        for col in ("acct_domain", "acct_industry", "acct_employees", "acct_description",
                    "erp_from_cfo", "erp_from_erp", "erp_from_audit", "erp_from_ap", "erp"):
            ox(["columns", "run", acc, col, "--all", "--background", "--force"], allow_fail=True)
        time.sleep(20)
        ox(["columns", "run", acc, "ap_company_fit", "--limit", str(n), "--approved",
            "--max-credits", str(max(1, round(n * 0.1 + 0.5))), "--idempotency-key", f"{self.prefix}-preview-fit-{n}"])
        say("preview", f"AP Company Fit on the first {n} accounts (about {n * 0.075:.2f} credits); "
            "signal formulas and ERP stored", f"{self.web}/tables/{self.tables['accounts']['id']}")

    def render_recipe(self, name: str) -> Path:
        src = (RECIPE_DIR / name).read_text()
        src = src.replace('"ap-webinar-', f'"{self.prefix}-').replace('name: "AP webinar ', f'name: "{self.label} ')
        src = src.replace('const ACCOUNTS = "accounts";', f'const ACCOUNTS = "{self.tables["accounts"]["slug"]}";')
        src = src.replace('const BUYERS = "buyers";', f'const BUYERS = "{self.tables["buyers"]["slug"]}";')
        for template_slug, key in TEMPLATE_SLUGS.items():
            src = src.replace(f'table: "{template_slug}"', f'table: "{self.tables[key]["slug"]}"')
        out = HERE / "generated" / self.prefix / name
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(src)
        return out

    def step_workflows(self):
        self.workflows = {}
        ceilings = {"w1": 400, "w1b": 20, "w2": 250, "w3": 80}
        for name in RECIPES:
            short = name.split("-")[0]
            path = self.render_recipe(name)
            lint = ox(["workflows", "lint", "--file", str(path)])
            if lint.get("issues"):
                raise OxygenError(f"lint {name}: {lint['issues']}")
            applied = ox(["workflows", "apply", "--file", str(path), "--approved", "--max-credits", str(ceilings[short])])
            wf = applied.get("workflow") or applied
            ox(["workflows", "enable", wf["id"], "--approved", "--max-credits", str(ceilings[short]),
                "--reason", f"{self.label} replica: on-demand trigger only"])
            self.workflows[short] = wf
            say("8 workflows", f"{wf.get('name')}", f"{self.web}/workflows/{wf['id']}")

    def run_workflow(self, short: str, payload: dict, cap: int) -> dict:
        wf = self.workflows[short]
        call = ox(["workflows", "call", wf["id"], "--mode", "live", "--input-json", json.dumps(payload),
                   "--max-credits", str(cap), "--approved", "--idempotency-key", f"{self.prefix}-{short}-{int(time.time())}"])
        run_id = (call.get("run") or call).get("id")
        link = f"{self.web}/workflows/{wf['id']}/runs/{run_id}"
        say("9 run", f"{wf.get('name')} started", link)
        start, last_done = time.time(), -1
        while time.time() - start < 1800:
            run = ox(["workflows", "run", run_id])
            r = run.get("run") or run
            steps = r.get("steps") or run.get("steps") or []
            done = sum(1 for s in steps if s.get("status") == "completed")
            status = r.get("status")
            if done != last_done:
                say("9 run", f"  {short}: {status}, {done} steps done")
                last_done = done
            if status in ("completed", "failed", "cancelled", "awaiting_approval"):
                say("9 run", f"  {short}: {status} {json.dumps(r.get('output') or r.get('error'))[:300]}")
                return r
            time.sleep(15)
        return {"status": "timeout"}

    def step_run(self):
        self.run_workflow("w1", {"max_new": self.a.max_new, "enrich_wait_seconds": self.a.enrich_wait}, 400)
        self.run_workflow("w1b", {}, 20)
        self.run_workflow("w2", {"max_accounts": 40}, 250)
        self.run_workflow("w3", {"copy_wait_seconds": 120}, 80)

    def summary(self):
        acc = self.tables["accounts"]
        tmp = HERE / "generated" / self.prefix / "accounts-export.json"
        ox(["tables", "export", acc["slug"], "--format", "json", "--limit", "1000", "--output", str(tmp)])
        data = json.loads(tmp.read_text())
        rows = data if isinstance(data, list) else data.get("rows", [])
        val = lambda r, k: (r.get(k) or {}).get("value") if isinstance(r.get(k), dict) else r.get(k)
        fit = {f: sum(1 for r in rows if val(r, "fit") == f) for f in "ABC"}
        tier = {t: sum(1 for r in rows if val(r, "tier") == t) for t in "ABC"}
        leaders = sum(1 for r in rows if (val(r, "new_finance_leaders") or 0) and float(val(r, "new_finance_leaders")) > 0)
        say("done", f"{len(rows)} accounts · fit A {fit['A']} B {fit['B']} C {fit['C']} · "
            f"new finance leaders at {leaders} · Tier A {tier['A']} B {tier['B']} C {tier['C']}")
        say("done", "Buyers", f"{self.web}/tables/{self.tables['buyers']['id']}")


def main():
    global PROFILE
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--folder", required=True, help="Folder display name; created if missing.")
    ap.add_argument("--label", default="Live", help="Prefix for table, Sequence and workflow names.")
    ap.add_argument("--prefix", default="live", help="Slug prefix for workflows and Sequences.")
    ap.add_argument("--accounts", type=int, default=100, help="Accounts from Blitz company search (1 credit per 50).")
    ap.add_argument("--signal-pages", type=int, default=1, help="Pages of 50 job ads per hiring family.")
    ap.add_argument("--max-new", type=int, default=150, help="W1: most hiring companies to add.")
    ap.add_argument("--enrich-wait", type=int, default=180, help="W1: seconds to wait for enrichment.")
    ap.add_argument("--preview-rows", type=int, default=10, help="Run AP Company Fit on this many accounts right away.")
    ap.add_argument("--profile", default=os.environ.get("OXYGEN_PROFILE"), help="Stored oxygen CLI profile; default: the active profile.")
    ap.add_argument("--plan", action="store_true", help="Print the plan and price; build nothing.")
    ap.add_argument("--run", action="store_true", help="After building, run W1 -> W1b -> W2 -> W3.")
    ap.add_argument("--content", action="store_true",
                    help="At the end, turn the engine's results into results.json, a LinkedIn post and the animated GIF.")
    ap.add_argument("--names", action="store_true", help="With --content: show real company names in the GIF.")
    a = ap.parse_args()
    PROFILE = a.profile

    if a.plan:
        pages = max(1, -(-a.accounts // 50))
        sig = 4 * (a.signal_pages + 50 * a.signal_pages * 0.075)
        print(f"Plan for '{a.folder}' (label {a.label}, prefix {a.prefix}):")
        print(f"  Accounts: {a.accounts} from Blitz company search, {pages} credits")
        print(f"  4 hiring tables: {a.signal_pages} page(s) each with the AI filter, about {sig:.0f} credits")
        print("  Columns, Buyers, Sequences, workflows: free to create")
        print(f"  --run: W1 enrich + fit (about 1 credit per new company + 0.075 per account), "
              "W1b free counts (about 0.05 a step), W2 buyers + emails (Blitz 1.5, ContactOut 16.5 on a hit), W3 stops at approval")
        print("  W2 also runs why-now (about 4 a row) and the AI research agent (about 2.1 a row) on Tier A/B")
        print("  W3 writes the AI copy (about 4 a buyer), then stops at its approval")
        print("  Ceilings per run: W1 400, W1b 20, W2 250, W3 80")
        return
    b = Build(a)
    t0 = time.time()
    for step in (b.step_folder, b.step_knowledge, b.step_accounts, b.step_signals, b.step_account_columns,
                 b.step_buyers, b.step_sequences, b.step_preview, b.step_workflows):
        step()
    say("built", f"engine built in {int(time.time() - t0)} s")
    if a.run:
        b.step_run()
        b.summary()
    if a.content:
        script = HERE / "content" / "build_content.py"
        cmd = [sys.executable, str(script), "--folder", a.folder, "--label", a.label,
               "--prefix", a.prefix, *(["--profile", a.profile] if a.profile else [])] + (["--names"] if a.names else [])
        say("10 content", "results.json, LinkedIn post draft and animated GIF from this engine's own tables")
        subprocess.run(cmd, check=True, env=ENV)


if __name__ == "__main__":
    try:
        main()
    except OxygenError as e:
        print(f"STOPPED: {e}", file=sys.stderr)
        sys.exit(1)
