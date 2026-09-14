export default function prioritise(input) {
  const { candidates, company_threshold, persona_threshold, capacity, as_of_ms, max_signal_age_days, mode } = input;
  if (!Array.isArray(candidates) || candidates.length > 1000) throw new Error('Supply at most 1000 candidates.');
  if (!['accounts', 'contacts'].includes(mode)) throw new Error('mode must be accounts or contacts');
  if (!Number.isInteger(capacity) || capacity < 0 || capacity > 1000) throw new Error('capacity must be 0..1000');
  const score = x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100;
  if (!score(company_threshold) || !score(persona_threshold)) throw new Error('Thresholds must be 0..100.');
  const now = as_of_ms;
  if (!Number.isSafeInteger(now) || now < 0 || !Number.isFinite(max_signal_age_days) || max_signal_age_days <= 0) throw new Error('A valid as_of_ms and positive signal lifetime are required.');
  const eligible = [], held = [], ids = new Set();
  for (const c of candidates) {
    if (typeof c.id !== 'string' || !c.id || ids.has(c.id)) throw new Error('Each candidate must have a unique id.');
    ids.add(c.id);
    if (c.company_disqualified !== false || !score(c.company_score) || c.company_score < company_threshold || (mode === 'contacts' && (c.persona_disqualified !== false || !score(c.persona_score) || c.persona_score < persona_threshold))) {
      held.push({ id: c.id, reason: 'Fit gate failed or required score missing.' }); continue;
    }
    if (c.suppressed === true) { held.push({ id: c.id, reason: 'Suppressed.' }); continue; }
    const age = Number.isSafeInteger(c.observed_at_ms) && c.observed_at_ms >= 0 ? (now - c.observed_at_ms) / 86400000 : -1;
    const intent = score(c.signal_strength) && Number.isFinite(age) && age >= 0 && age <= max_signal_age_days ? c.signal_strength * (1 - age / max_signal_age_days) : 0;
    const fit = mode === 'contacts' ? (c.company_score + c.persona_score) / 2 : c.company_score;
    eligible.push({ id: c.id, priority: Math.round((0.7 * fit + 0.3 * intent) * 100) / 100, intent_score: Math.round(intent * 100) / 100, reason: '70% fit + 30% freshness-adjusted intent; passed independent fit gates.' });
  }
  eligible.sort((a,b) => b.priority - a.priority || a.id.localeCompare(b.id));
  for (const c of eligible.slice(capacity)) held.push({ id: c.id, reason: 'Outside this run’s capacity.' });
  return { selected: eligible.slice(0, capacity), held };
}
