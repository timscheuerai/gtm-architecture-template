export default function assignTestVariant(input) {
  const { account_key, test_round, group_id, prompt_version, variants } = input;
  for (const [key, value] of Object.entries({account_key,test_round,group_id,prompt_version})) if (typeof value !== 'string' || !value.trim()) throw new Error(key + ' is required.');
  if (!Array.isArray(variants) || variants.length !== 2 || variants.some(v => typeof v !== 'string' || !v.trim()) || variants[0] === variants[1]) throw new Error('Exactly two distinct variant IDs are required.');
  // Frozen, deterministic FNV-1a bucketing. The company is the randomisation unit:
  // colleagues in one account receive the same treatment. Never change salt/order mid-round.
  const key = JSON.stringify([test_round.trim(), group_id.trim(), account_key.trim().toLowerCase().replace(/^www\./, '')]);
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) { hash ^= key.charCodeAt(i); hash = Math.imul(hash, 16777619) >>> 0; }
  return { test_round, group_id, variant_id: variants[hash % 2], prompt_version, assignment_key: key, algorithm: 'fnv1a-account-v1' };
}
