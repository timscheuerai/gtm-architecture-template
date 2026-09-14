export default function normaliseSources(input) {
  if (!Array.isArray(input.records) || input.records.length > 1000) throw new Error('Supply at most 1000 source records.');
  const seen = new Map();
  const rejected = [];
  for (const record of input.records) {
    const raw = String(record.company_domain || '').trim().toLowerCase();
    const domain = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '').replace(/:\d+$/, '');
    const validDomain = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
    const time = record.observed_at_ms;
    if (!validDomain || !Number.isSafeInteger(time) || time < 0 || !record.source || !record.signal_type) {
      rejected.push({ id: String(record.id || raw), reason: 'Missing or invalid domain, source, signal type or timestamp.' });
      continue;
    }
    const event = { source: String(record.source), signal_type: String(record.signal_type), observed_at_ms: time };
    if (!seen.has(domain)) seen.set(domain, { company_domain: domain, signals: [] });
    const account = seen.get(domain);
    if (!account.signals.some(s => s.source === event.source && s.signal_type === event.signal_type && s.observed_at_ms === time)) account.signals.push(event);
  }
  return { accounts: [...seen.values()].sort((a,b) => a.company_domain.localeCompare(b.company_domain)), rejected };
}
