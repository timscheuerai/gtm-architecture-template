export default function analyseResults(input) {
  if (!Array.isArray(input.events) || input.events.length > 5000) throw new Error('Supply at most 5000 normalised outcome events.');
  if (!Number.isInteger(input.minimum_delivered) || input.minimum_delivered < 1) throw new Error('Set minimum_delivered before examining results.');
  const groups = new Map(), people = new Map(), seen = new Map();
  for (const e of input.events) {
    for (const key of ['event_id','enrollment_id','test_round','group_id','variant_id','prompt_version','event']) if (typeof e[key] !== 'string' || !e[key]) throw new Error('Event missing ' + key);
    if (!['delivered','positive_reply','meeting_booked'].includes(e.event)) throw new Error('Unsupported event: ' + e.event);
    const canonical = JSON.stringify([e.enrollment_id,e.test_round,e.group_id,e.variant_id,e.prompt_version,e.event]);
    if (seen.has(e.event_id)) { if (seen.get(e.event_id) !== canonical) throw new Error('Conflicting duplicate event ID.'); continue; }
    seen.set(e.event_id, canonical);
    const key = JSON.stringify([e.test_round,e.group_id,e.variant_id,e.prompt_version]);
    if (people.has(e.enrollment_id) && people.get(e.enrollment_id) !== key) throw new Error('Enrollment changed treatment inside the supplied results.');
    people.set(e.enrollment_id,key);
    if (!groups.has(key)) groups.set(key,{test_round:e.test_round,group_id:e.group_id,variant_id:e.variant_id,prompt_version:e.prompt_version,delivered:new Set(),positive_reply:new Set(),meeting_booked:new Set()});
    groups.get(key)[e.event].add(e.enrollment_id);
  }
  const cohorts = [...groups.values()].map(g => {
    // Count outcomes only for delivered enrollments in this same cohort.
    const positives = [...g.positive_reply].filter(id => g.delivered.has(id)).length;
    const meetings = [...g.meeting_booked].filter(id => g.delivered.has(id)).length;
    const delivered = g.delivered.size;
    return {test_round:g.test_round,group_id:g.group_id,variant_id:g.variant_id,prompt_version:g.prompt_version,delivered,positive_replies:positives,meetings,positive_reply_rate:delivered ? positives / delivered : null,meeting_rate:delivered ? meetings / delivered : null,enough_data:delivered >= input.minimum_delivered,orphan_outcomes:[...new Set([...g.positive_reply,...g.meeting_booked])].filter(id => !g.delivered.has(id)).length};
  });
  return {cohorts,review_required:true,note:'Rates are descriptive. A sample floor is not statistical significance. Compare within round, group and prompt version; review a proposed rule change before changing ICP, offer or copy.'};
}
