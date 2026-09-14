import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import normalise from '../functions/normalise_sources.mjs';
import prioritise from '../functions/prioritise.mjs';
import assign from '../functions/assign_test_variant.mjs';
import prepare from '../functions/prepare_sequence.mjs';
import analyse from '../functions/analyse_results.mjs';
import { root, json } from './lib.mjs';

// Teaching fixture only. No network, providers, CRM writes or sending.
export function buildDemo(capacity = 5) {
  const policy = { ...json('examples/prioritise_accounts.json'), capacity };
  const companies = json('examples/score_company_icp.json');
  const experiment = json('company/experiment.example.json');
  const intake = normalise({ records: [
    ...policy.candidates.map(c => ({ id: c.id, company_domain: c.id + '.example', source: 'synthetic-list', signal_type: 'sales_hire', observed_at_ms: c.observed_at_ms })),
    { id: 'extra-signal', company_domain: 'https://www.company-0.example/about', source: 'synthetic-comment', signal_type: 'comment', observed_at_ms: policy.as_of_ms },
    { id: 'bad-domain', company_domain: 'unknown', source: 'synthetic-list', signal_type: 'list', observed_at_ms: policy.as_of_ms }
  ] });
  const domains = new Set(intake.accounts.map(a => a.company_domain));
  const candidates = policy.candidates.filter(c => domains.has(c.id + '.example'));
  const accountQueue = prioritise({ ...policy, candidates, mode: 'accounts' });
  const accountIds = new Set(accountQueue.selected.map(c => c.id));
  const contactQueue = prioritise({ ...policy, candidates: candidates.filter(c => accountIds.has(c.id)), mode: 'contacts' });
  const drafts = contactQueue.selected.map(item => {
    const candidate = candidates.find(c => c.id === item.id);
    const company = companies.find(c => c.example_id === item.id).company_evidence;
    const assignment = assign({ ...experiment, account_key: company.company_domain });
    // The manually written text and verification state below are synthetic inputs,
    // not outputs from research, AI or email verification.
    const body = `A question for the operations team at ${company.name}: how do you decide which accounts deserve research before contact lookup? I put together an editable example of that workflow. ${experiment.copy[assignment.variant_id]}`;
    const readiness = prepare({ ...json('examples/prepare_sequence.json'), ...candidate, ...assignment,
      email: `alex@${company.company_domain}`, subject: 'Your account research queue', body,
      reviewed: false, sequence_id: '', remaining_capacity: capacity });
    return { id: item.id, company_domain: company.company_domain, assignment, readiness };
  });
  const sampleHistoricalResults = analyse(json('examples/analyse_results.json'));
  return { synthetic: true, capacity, counts: { source_records: 12, unique_accounts: intake.accounts.length,
    rejected_sources: intake.rejected.length, account_queue: accountQueue.selected.length,
    contact_queue: contactQueue.selected.length, ready: drafts.filter(d => d.readiness.ready).length,
    sent: 0, provider_calls: 0 }, intake, accountQueue, contactQueue, drafts, sampleHistoricalResults };
}

export function renderReport(result) {
  const c = result.counts;
  const table = (rows, fields) => rows.map(row => '| ' + fields.map(f => String(row[f] ?? '').replaceAll('|', '\\|')).join(' | ') + ' |').join('\n');
  return `# First batch: synthetic walkthrough

No accounts, API keys or network calls are used. Research, company/persona scores, verification and draft wording are supplied fixtures. The six deterministic function templates compute the queues, assignments, holds and sample metrics.

## The funnel

| Stage | Count |
|---|---:|
| Source records | ${c.source_records} |
| Unique valid accounts | ${c.unique_accounts} |
| Rejected source records | ${c.rejected_sources} |
| Account research capacity | ${result.capacity} |
| Selected accounts | ${c.account_queue} |
| Contacts passing both gates | ${c.contact_queue} |
| Ready to enroll | ${c.ready} |
| Sent / provider calls | 0 / 0 |

An extra signal for company-0 is preserved without creating a second account. Company-2 passes company fit but fails persona fit. Company-6 is suppressed. Company-7/8/9 fail company fit. Stale intent cannot boost company-3; capacity may hold it. All message drafts await review and a real Sequence.

## Account decisions

| Selected | Priority | Intent score |
|---|---:|---:|
${table(result.accountQueue.selected, ['id','priority','intent_score'])}

| Held | Reason |
|---|---|
${table(result.accountQueue.held, ['id','reason'])}

## Contact decisions

Only the selected account cohort reaches the persona gate. A failed persona is held; the demo does not automatically find a replacement buyer or refill capacity.

| Selected | Priority | Intent score |
|---|---:|---:|
${table(result.contactQueue.selected, ['id','priority','intent_score'])}

| Held | Reason |
|---|---|
${table(result.contactQueue.held, ['id','reason'])}

## Drafts and readiness

${result.drafts.map(d => `### ${d.company_domain} · variant ${d.assignment.variant_id}\n\nSubject: ${d.readiness.subject}\n\n${d.readiness.body}\n\nHeld: ${d.readiness.reasons.join(' ')}`).join('\n\n') || 'No contacts selected.'}

## Learning loop

The JSON includes a separate synthetic historical outcome sample: one delivery and one positive reply. Those events are unrelated to the unsent drafts above. It is far below the example review floor; a displayed rate is not evidence of a winning message or a customer result.

## Make it yours

Use docs/first-batch.md and company/brief.example.md. Change capacity with npm run demo -- --capacity 3. Use the hosted functions for real research, scoring, verification and production state. See docs/composition.md for the stage mappings still required.
`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--capacity' || !/^\d+$/.test(args[1]))) throw new Error('Usage: npm run demo -- [--capacity 0..1000]');
    const result = buildDemo(args.length ? Number(args[1]) : 5);
    const out = resolve(root, 'output/demo');
    mkdirSync(out, { recursive: true });
    writeFileSync(resolve(out, 'results.json'), JSON.stringify(result, null, 2) + '\n');
    writeFileSync(resolve(out, 'report.md'), renderReport(result));
    console.log(`Synthetic demo: ${result.counts.unique_accounts} accounts → ${result.counts.account_queue} selected accounts → ${result.counts.contact_queue} contacts → ${result.counts.ready} ready. No provider calls or sends.\nRead ${resolve(out, 'report.md')}\nInspect ${resolve(out, 'results.json')}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
