export default function prepareSequence(input) {
  const reasons = [];
  const score = x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100;
  if(input.company_disqualified !== false || input.persona_disqualified !== false) reasons.push('A disqualification is present or has not been checked.');
  if (!score(input.company_threshold) || !score(input.persona_threshold)) throw new Error('Valid thresholds required.');
  if (!score(input.company_score) || input.company_score < input.company_threshold) reasons.push('Company fit failed.');
  if (!score(input.persona_score) || input.persona_score < input.persona_threshold) reasons.push('Persona fit failed.');
  if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) reasons.push('Missing work email.');
  if (input.email_status !== 'valid') reasons.push('Email must have a valid verification result.');
  const validTimes = Number.isSafeInteger(input.as_of_ms) && input.as_of_ms >= 0 && Number.isSafeInteger(input.verified_at_ms) && input.verified_at_ms >= 0;
  const age = validTimes ? (input.as_of_ms - input.verified_at_ms) / 86400000 : -1;
  if (!Number.isFinite(input.max_verification_age_days) || input.max_verification_age_days <= 0 || !Number.isFinite(age) || age < 0 || age > input.max_verification_age_days) reasons.push('Verification is missing, future-dated or stale.');
  if (input.reviewed !== true) reasons.push('First touch has not been reviewed.');
  if (input.suppressed !== false) reasons.push('Suppression status must be explicitly clear.');
  if (!Number.isInteger(input.remaining_capacity) || input.remaining_capacity < 1) reasons.push('No capacity.');
  for (const key of ['sequence_id','test_round','group_id','variant_id','prompt_version','subject','body']) if (typeof input[key] !== 'string' || !input[key].trim()) reasons.push(key + ' is missing.');
  return { ready: reasons.length === 0, reasons, sequence_id: String(input.sequence_id || ''), email: String(input.email || ''), subject: String(input.subject || ''), body: String(input.body || ''), test_round: String(input.test_round || ''), group_id: String(input.group_id || ''), variant_id: String(input.variant_id || ''), prompt_version: String(input.prompt_version || '') };
}
