import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemo, renderReport } from '../scripts/demo.mjs';
import { read } from '../scripts/lib.mjs';

test('first-batch walkthrough preserves holds and never emits a ready recipient', () => {
  const result = buildDemo();
  assert.deepEqual(result.counts, {source_records:12,unique_accounts:10,rejected_sources:1,account_queue:5,contact_queue:4,ready:0,sent:0,provider_calls:0});
  assert.equal(result.intake.accounts.find(a => a.company_domain === 'company-0.example').signals.length,2);
  assert.ok(result.contactQueue.held.some(row => row.id === 'company-2'));
  assert.ok(result.accountQueue.held.some(row => row.id === 'company-6' && row.reason === 'Suppressed.'));
  assert.ok(result.drafts.every(row => !row.readiness.ready && row.readiness.reasons.some(reason => reason.includes('reviewed'))));
  assert.equal(renderReport(result),read('examples/demo/report.md'));
});

test('capacity changes propagate through the demo without changing account treatment', () => {
  const full = buildDemo();
  const small = buildDemo(3);
  assert.equal(small.counts.account_queue,3);
  assert.equal(small.counts.contact_queue,2);
  for (const row of small.drafts) assert.deepEqual(row.assignment,full.drafts.find(other => other.id === row.id).assignment);
  assert.equal(buildDemo(0).drafts.length,0);
  assert.throws(() => buildDemo(-1),/capacity/);
});
