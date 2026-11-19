#!/usr/bin/env python3
"""Turn one AP signal engine's tables into content: results.json, a LinkedIn
post draft and an animated GIF + MP4 (the ending of the live webinar build).

It only reads (free table exports) and renders locally. Nothing is published,
scheduled or paid for.

  # an engine built by hand, tables named "Accounts", "Hiring: CFO", ...
  python3 content/build_content.py --folder "AP engine" --prefix prebuilt
  # the replica made by build_engine.py --label Live (or build_engine.py --content)
  python3 content/build_content.py --folder "AP engine · Live build" --label Live --prefix live

Outputs land in the example's generated/<prefix>/: results.json,
linkedin-post.md, ap-engine-live.gif, ap-engine-live.mp4 and a still PNG.
Rendering needs Node.js with Playwright (Chromium) and ffmpeg; --no-render
skips it. Company names in the graphic are
anonymized ("aerospace parts maker, 162 staff") unless --names is passed.
Person names never appear.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
EXAMPLE = HERE.parent
RENDERER = HERE / "capture.mjs"
ENV = dict(os.environ)
FAMILIES = [("cfo", "Hiring: CFO", "CFO or VP Finance"), ("erp", "Hiring: ERP", "ERP migration"),
            ("audit", "Hiring: audit and SOX", "audit and SOX"), ("ap", "Hiring: AP", "accounts payable")]
KIT_URL = "oxygen-agent.com/resources/gtm-architecture-kit"
PROMO = "WEBINAR50"


def ox(args: list[str], profile: str | None) -> dict:
    cmd = ["oxygen", *(["--profile", profile] if profile else []), *args, "--json"]
    proc = subprocess.run(cmd, capture_output=True, text=True, env=ENV)
    out = proc.stdout.strip()
    data = json.loads(out[out.index("{"):]) if "{" in out else {}
    if not data.get("ok"):
        raise SystemExit(f"STOPPED: {' '.join(args[:3])}: {json.dumps(data.get('error'))[:300]}")
    return data.get("data") or {}


def export(slug: str, path: Path, profile: str) -> list[dict]:
    ox(["tables", "export", slug, "--format", "json", "--limit", "1000", "--output", str(path)], profile)
    data = json.loads(path.read_text())
    return data if isinstance(data, list) else data.get("rows", [])


def num(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def short_name(name: str) -> str:
    name = re.sub(r"\s*\((?:[^)]*)\)\s*", " ", name or "").strip()
    name = re.sub(r",?\s+(Inc\.?|LLC|Ltd\.?|Corp\.?|Corporation|Group|Company)$", "", name, flags=re.I).strip()
    return re.sub(r"\s+&\s+Mattress$", "", name).strip()


INDUSTRY_NOUNS = [
    ("aerospace", "aerospace parts maker"), ("aviation", "aerospace parts maker"), ("furniture", "furniture retailer"),
    ("food", "food manufacturer"), ("beverage", "food manufacturer"), ("machinery", "machinery maker"),
    ("civil engineering", "civil engineering firm"), ("construction", "construction firm"),
    ("logistics", "logistics company"), ("transportation", "logistics company"), ("truck", "trucking company"),
    ("wholesale", "distributor"), ("medicine", "consumer health company"), ("manufacturing", "manufacturer"),
]


def anonymize(industry: str) -> str:
    low = (industry or "").lower()
    for key, noun in INDUSTRY_NOUNS:
        if key in low:
            return noun
    return (low.replace(";", ",").split(",")[0].strip() or "company") + " company"


def chips(row: dict) -> list[str]:
    out = []
    if num(row.get("erp_postings")) > 0:
        out.append("ERP migration job ad")
    if num(row.get("cfo_postings")) > 0:
        out.append("CFO search")
    n = int(num(row.get("ap_postings")))
    if n:
        out.append(f"{n} AP job ad{'s' if n > 1 else ''}")
    n = int(num(row.get("audit_postings")))
    if n:
        out.append(f"{n} audit/SOX job ad{'s' if n > 1 else ''}")
    if num(row.get("new_finance_leaders")) > 0:
        out.append("new finance leader (ContactOut)")
    if row.get("erp"):
        out.append(str(row["erp"]))
    return out


def find_tables(folder: str, label: str, profile: str) -> tuple[dict, dict]:
    projects = ox(["projects", "list"], profile)
    items = projects if isinstance(projects, list) else projects.get("projects", [])
    project = next((p for p in items if folder in (p.get("displayName"), p.get("slug"))), None)
    if not project:
        raise SystemExit(f"STOPPED: folder {folder!r} not found")
    listing = ox(["tables", "list", "--project", project["slug"], "--limit", "200"], profile)
    tables = listing if isinstance(listing, list) else listing.get("tables", [])
    by_name = {t["displayName"]: t for t in tables}
    name = (lambda base: f"{label} · {base}") if label else (lambda base: base)
    wanted = {"accounts": name("Accounts"), "buyers": name("Buyers"), **{k: name(n) for k, n, _ in FAMILIES}}
    missing = [n for n in wanted.values() if n not in by_name]
    if missing:
        raise SystemExit(f"STOPPED: tables not found in {folder!r}: {missing}")
    return project, {k: by_name[n] for k, n in wanted.items()}


def collect(args) -> dict:
    project, tables = find_tables(args.folder, args.label, args.profile)
    out_dir = EXAMPLE / "generated" / args.prefix
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = {k: export(t["slug"], out_dir / f"export-{k}.json", args.profile) for k, t in tables.items()}
    acc, buyers = rows["accounts"], rows["buyers"]

    signals = {}
    erp_counts: Counter = Counter()
    for key, _, label in FAMILIES:
        r = rows[key]
        signals[key] = {"label": label, "postings": len(r),
                        "kept": sum(1 for x in r if x.get("ai_filter") in (True, "true"))}
        erp_counts.update(x["erp_named"] for x in r if x.get("erp_named"))

    sourced = [a for a in acc if not str(a.get("source") or "").startswith("Hiring")]
    added = [a for a in acc if str(a.get("source") or "").startswith("Hiring")]
    fit = Counter(a.get("fit") or "unscored" for a in acc)
    tier = Counter(a.get("tier") or "C" for a in acc)
    with_signal = [a for a in acc if a.get("fit") in ("A", "B") and num(a.get("score")) > 0]
    leaders = [a for a in acc if num(a.get("new_finance_leaders")) > 0]
    top = sorted((a for a in acc if a.get("tier") in ("A", "B")), key=lambda a: -num(a.get("score")))[:8]
    top_accounts = [{
        "name": short_name(a.get("company_name") or ""),
        "descriptor": anonymize(a.get("acct_industry") or ""),
        "industry": a.get("acct_industry"),
        "employees": int(num(a.get("acct_employees"))) or None,
        "tier": a.get("tier"), "score": int(num(a.get("score"))),
        "erp": a.get("erp") or None,
        "chips": chips(a),
        "why_now": a.get("why_now"),
    } for a in top]

    emails = [b for b in buyers if b.get("email")]
    providers = Counter("ContactOut" if "contactout" in str(b.get("email_provider") or "") else "Blitz" for b in emails)
    with_copy = [b for b in buyers if b.get("copy_email_1")]
    sample = next((b for b in with_copy if b.get("email")), with_copy[0] if with_copy else None)

    results = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "folder": project["displayName"], "label": args.label or "Prebuilt",
        "accounts": {"total": len(acc), "sourced": len(sourced), "added_from_signals": len(added)},
        "fit": {"A": fit.get("A", 0), "B": fit.get("B", 0), "C": fit.get("C", 0), "unscored": fit.get("unscored", 0)},
        "signals": signals,
        "signals_kept_total": sum(s["kept"] for s in signals.values()),
        "erp_named": dict(erp_counts.most_common()),
        "fit_ab_with_fresh_signal": len(with_signal),
        "new_finance_leaders_accounts": len(leaders),
        "tier": {"A": tier.get("A", 0), "B": tier.get("B", 0), "C": tier.get("C", 0)},
        "top_accounts": top_accounts,
        "buyers": {"total": len(buyers), "personas": dict(Counter(b.get("persona") or "unscored" for b in buyers)),
                   "emails_found": len(emails), "emails_by_provider": dict(providers),
                   "copy_ready": len(with_copy), "ready": sum(1 for b in buyers if str(b.get("ready")) == "true")},
        "sample_copy": {"subject": sample.get("copy_subject"), "email_1": sample.get("copy_email_1"),
                        "company": short_name(sample.get("company_name") or "")} if sample else None,
        "folder_slug": project.get("slug"),
        "kit_url": KIT_URL, "promo": PROMO,
    }
    if args.credits_since:
        usage = ox(["billing", "usage", "--from", args.credits_since, "--limit", "1"], args.profile)
        results["credits_used_workspace"] = usage.get("managed_credits_used")
    (out_dir / "results.json").write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n")
    return results


def erp_line(erp: dict) -> str:
    names = [k for k in erp][:3]
    if not names:
        return "The job ads name the ERP when they mention one"
    return "The job ads name the ERP: " + ", ".join(names)


def post(r: dict) -> str:
    acc, tier, b = r["accounts"], r["tier"], r["buyers"]
    tier_ab = tier["A"] + tier["B"]
    co = b["emails_by_provider"].get("ContactOut", 0)
    lines = [
        "We built an AP outbound engine live, from a blank page.",
        "",
        f"{acc['total']} accounts in. {tier_ab} worth a message this week.",
        "",
        "In OXYGEN with Claude Code, at the GTM Collective webinar with ContactOut.",
        "",
        "5 steps, all in 1 folder:",
        "",
        "1) Source the TAM",
        f"→ Blitz pulls {acc['sourced']} US companies with 100 to 1,000 staff",
        f"→ Finance job ads add {acc['added_from_signals']} companies that are hiring right now",
        "",
        "2) Score fit before spending",
        "→ An AI column labels every account A, B or C against the ICP",
        f"→ {r['fit']['A'] + r['fit']['B']} pass, the rest get no more spend",
        "",
        "3) Layer signals",
        "→ CFO, ERP, audit and AP job ads, filtered for in-house roles",
        f"→ {erp_line(r['erp_named'])}",
        f"→ ContactOut's free count finds a new finance leader at {r['new_finance_leaders_accounts']} accounts",
        "",
        "4) Spend only on Tier A and B",
        f"→ {b['total']} buyers found at the top accounts",
        f"→ Emails from Blitz first, ContactOut on a miss ({co} of {b['emails_found']} came from ContactOut)",
        "",
        "5) Write the outreach",
        "→ An AI research agent reads each account",
        "→ The copy opens with the trigger and the pain, then offers a free resource",
        "",
        "An account needs 1 strong signal or 2 stacked ones before we spend a credit on it.",
        "",
        "Every table, prompt and workflow is in the repo. Link in the comments.",
    ]
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--folder", required=True)
    ap.add_argument("--label", default="", help='Table name prefix, e.g. "Live". Empty for the prebuilt engine.')
    ap.add_argument("--prefix", default="prebuilt", help="Output folder name under generated/.")
    ap.add_argument("--names", action="store_true", help="Show real company names in the graphic.")
    ap.add_argument("--no-render", action="store_true", help="Write results.json and the post only.")
    ap.add_argument("--credits-since", default=None, help="ISO time to read the workspace credit meter from.")
    ap.add_argument("--oxygen-draft", action="store_true",
                    help="Also save the post + GIF as an OXYGEN Publishing DRAFT (no sender, not scheduled, never published). "
                         "The CLI marks this command as credit-spending; use only with the author's go.")
    ap.add_argument("--profile", default=os.environ.get("OXYGEN_PROFILE"), help="Stored oxygen CLI profile; default: the active profile.")
    args = ap.parse_args()
    t0 = time.time()
    results = collect(args)
    out_dir = EXAMPLE / "generated" / args.prefix
    print(f"[content] results.json: {results['accounts']['total']} accounts, Tier A {results['tier']['A']} "
          f"B {results['tier']['B']}, {results['buyers']['total']} buyers, {results['buyers']['copy_ready']} copies "
          f"({int(time.time() - t0)} s)", flush=True)
    (out_dir / "linkedin-post.md").write_text(post(results))
    print(f"[content] LinkedIn post draft: {out_dir / 'linkedin-post.md'}", flush=True)
    if not args.no_render:
        cmd = ["node", str(RENDERER), "--results", str(out_dir / "results.json"), "--out", str(out_dir)]
        if args.names:
            cmd.append("--names")
        subprocess.run(cmd, check=True, cwd=RENDERER.parent)
        print(f"[content] GIF + MP4: {out_dir / 'ap-engine-live.gif'} ({int(time.time() - t0)} s total)", flush=True)
    if args.oxygen_draft:
        made = ox(["publishing", "posts", "create", "--provider", "linkedin", "--draft",
                   "--name", f"AP engine built live ({results['label']})", "--text-file", str(out_dir / "linkedin-post.md"),
                   "--media-file", str(out_dir / "ap-engine-live.gif"),
                   "--idempotency-key", f"ap-engine-content-{args.prefix}-{results['generated_at'][:10]}"], args.profile)
        post_row = made.get("post") or made
        print(f"[content] OXYGEN draft post (not scheduled): {made.get('web_url') or post_row.get('id')}", flush=True)


if __name__ == "__main__":
    main()
