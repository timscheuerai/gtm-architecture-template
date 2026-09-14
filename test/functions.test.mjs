import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import normalise from '../functions/normalise_sources.mjs';
import prioritise from '../functions/prioritise.mjs';
import assign from '../functions/assign_test_variant.mjs';
import prepare from '../functions/prepare_sequence.mjs';
import analyse from '../functions/analyse_results.mjs';
import { json, read, specs } from '../scripts/lib.mjs';

test('sources collapse accounts without losing distinct signals',()=>{
  const input=json('examples/normalise_sources.json');input.records.push(input.records[0]);
  const out=normalise(input);
  assert.equal(out.accounts.length,1);assert.equal(out.accounts[0].signals.length,2);assert.equal(out.rejected.length,1);
  assert.equal(normalise({records:[{company_domain:'https://user:password@evil.example',source:'x',signal_type:'x',observed_at_ms:1789344000000}]}).accounts.length,0);
});
test('contact selection requires independent fit gates and respects capacity and suppression',()=>{
  const input={...json('examples/prioritise_contacts.json'),mode:'contacts'};
  const out=prioritise(input);
  assert.ok(out.held.some(x=>x.id==='company-2'));
  assert.ok(out.held.some(x=>x.id==='company-6'));
  assert.ok(out.selected.length<=5);
  assert.equal(prioritise({...input,capacity:0}).selected.length,0);
  assert.throws(()=>prioritise({...input,capacity:-1}));
});
test('missing, stale and future-dated signals receive zero intent',()=>{
  const input={...json('examples/prioritise_accounts.json'),mode:'accounts',capacity:10};
  input.candidates=[{id:'old',company_score:90,company_disqualified:false,signal_strength:100,observed_at_ms:1577836800000},{id:'future',company_score:90,company_disqualified:false,signal_strength:100,observed_at_ms:4070908800000},{id:'missing',company_score:90,company_disqualified:false}];
  assert.ok(prioritise(input).selected.every(x=>x.intent_score===0));
  assert.throws(()=>prioritise({...input,candidates:[input.candidates[0],input.candidates[0]]}));
});
test('assignment stays stable across reruns and accounts get one treatment',()=>{
  const input=json('examples/assign_test_variant.json');
  const expected=assign(input);
  assert.deepEqual(assign(input),expected);
  assert.equal(assign({...input,account_key:'WWW.COMPANY-0.EXAMPLE'}).variant_id,expected.variant_id);
  const counts={A:0,B:0};for(let i=0;i<1000;i++)counts[assign({...input,account_key:`account-${i}.example`}).variant_id]++;
  assert.ok(counts.A>400 && counts.B>400);
  assert.throws(()=>assign({...input,variants:['A','A']}));
});
test('sequence handoff holds unreviewed, unverified, suppressed, stale and over-cap contacts',()=>{
  const input=json('examples/prepare_sequence.json');assert.equal(prepare(input).ready,false);
  const ready={...input,reviewed:true};assert.equal(prepare(ready).ready,true);
  for(const change of [{company_disqualified:true},{persona_disqualified:true},{persona_disqualified:null},{persona_score:31},{company_score:null},{email_status:'catch_all'},{email_status:'unknown'},{suppressed:true},{suppressed:null},{remaining_capacity:0},{verified_at_ms:1577836800000},{verified_at_ms:4070908800000},{prompt_version:''}])assert.equal(prepare({...ready,...change}).ready,false,JSON.stringify(change));
});
test('results dedupe deliveries and outcomes and never pool variants or prompt versions',()=>{
  const input=json('examples/analyse_results.json');
  const d=input.events[0],r=input.events[1];
  input.events.push({...r},{...r,event_id:'another-positive'}, {...d,event_id:'delivered-2',enrollment_id:'enrollment-2',variant_id:'B'});
  const out=analyse(input);
  assert.equal(out.cohorts.length,2);assert.equal(out.cohorts[0].delivered,1);assert.equal(out.cohorts[0].positive_replies,1);assert.equal(out.cohorts[0].enough_data,false);assert.equal(out.review_required,true);
  assert.throws(()=>analyse({...input,events:[d,{...d,variant_id:'B'}]}),/Conflicting duplicate/);
  assert.throws(()=>analyse({...input,events:[d,{...r,variant_id:'B'}]}),/changed treatment/);
  const orphan=analyse({minimum_delivered:100,events:[r]});assert.equal(orphan.cohorts[0].positive_reply_rate,null);assert.equal(orphan.cohorts[0].orphan_outcomes,1);
});

function validate(schema,value,path='output') {
  const types=Array.isArray(schema.type)?schema.type:[schema.type];
  const actual=value===null?'null':Array.isArray(value)?'array':typeof value;
  assert.ok(types.includes(actual)||(types.includes('integer')&&Number.isInteger(value)),`${path}: expected ${types}, got ${actual}`);
  if(actual==='object') {
    for(const key of schema.required||[])assert.ok(Object.hasOwn(value,key),`${path}.${key} required`);
    if(schema.additionalProperties===false)for(const key of Object.keys(value))assert.ok(Object.hasOwn(schema.properties,key),`${path}.${key} unexpected`);
    for(const [key,s] of Object.entries(schema.properties||{}))if(Object.hasOwn(value,key))validate(s,value[key],`${path}.${key}`);
  }
  if(actual==='array')for(const [i,v] of value.entries())validate(schema.items,v,`${path}[${i}]`);
}
for(const spec of specs().filter(s=>s.runtime==='workflow'))test(`deployed source and output contract: ${spec.id}`,()=>{
  const graph=json(`workflows/${spec.id}.workflow.json`);
  const node=graph.nodes.find(n=>n.kind==='code');
  const input={...json(`examples/${spec.id}.json`),...spec.defaults};
  // Exercise the exact generated code shipped to OXYGEN in an isolated VM.
  const result=runInNewContext(`(${node.code.source})(payload)`,{payload:input},{timeout:1000});
  validate(node.code.output_schema,result);
  assert.equal(graph.workflow.status,'disabled');assert.equal(graph.trigger.status,'disabled');
});
test('every prompt references declared inputs and every function has an example',()=>{
  for(const spec of specs()) {
    json(`examples/${spec.id}.json`);
    if(spec.prompt)for(const token of read(spec.prompt).matchAll(/{{\s*(\w+)\s*}}/g))assert.ok(Object.hasOwn(spec.inputs,token[1]),`${spec.id}: ${token[1]}`);
  }
});
