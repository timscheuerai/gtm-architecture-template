import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { root, read, json, specs, oxygen } from './lib.mjs';

const [command, ...args] = process.argv.slice(2);
const value = flag => { const i=args.indexOf(flag); if(i<0)return undefined; if(!args[i+1]||args[i+1].startsWith('--'))throw new Error(`${flag} requires a value`); return args[i+1]; };
const binary = value('--cli') || process.env.OXYGEN_BIN || 'oxygen';
const config = json(value('--config') || 'config.example.json');
if(!/^[a-z][a-z0-9-]{2,45}$/.test(config.prefix))throw new Error('Use a 3–46 character lowercase prefix.');
if(!Number.isInteger(config.max_items)||config.max_items<1||config.max_items>100)throw new Error('max_items must be 1..100');
if(!Number.isFinite(config.callable_credit_ceiling)||config.callable_credit_ceiling<=0)throw new Error('Set a positive callable credit ceiling.');
const definitions = specs();
const digest = createHash('sha256').update(JSON.stringify([config,definitions,definitions.filter(s=>s.prompt).map(s=>read(s.prompt)),definitions.filter(s=>s.source).map(s=>read(s.source))])).digest('hex');
const configHash = createHash('sha256').update(JSON.stringify(config)).digest('hex');
const specHashes = Object.fromEntries(definitions.map(s=>[s.id,createHash('sha256').update(JSON.stringify([s,s.prompt?read(s.prompt):null,s.source?read(s.source):null])).digest('hex')]));
const statePath = resolve(root,'.oxygen',`${config.prefix}.json`);
let state = existsSync(statePath) ? JSON.parse(read(statePath)) : {tables:{},workflows:{},functions:{}};
const save = () => { mkdirSync(resolve(root,'.oxygen'),{recursive:true});writeFileSync(statePath,JSON.stringify(state,null,2)+'\n',{mode:0o600}); };
const call = (...args) => oxygen(binary,args);
const show = x => console.log(JSON.stringify(x,null,2));
const identity = () => {
  const me=call('whoami');
  if(state.org && (state.org!==me.organization.id || state.profile!==me.profile))throw new Error('Install belongs to a different workspace/profile. Use a different config prefix.');
  if(state.configHash && state.configHash!==configHash)throw new Error('Config changed since installation. Use a new prefix for a new version.');
  for(const [id,hash] of Object.entries(state.specHashes||{}))if(hash!==specHashes[id])throw new Error(id+' changed since installation. Use a new prefix for a new version; existing functions are left intact.');
  return me;
};
const selected = () => {const id=value('--function');const spec=definitions.find(s=>s.id===id);if(!spec)throw new Error('Choose --function: '+definitions.map(s=>s.id).join(', '));return spec;};

try {
  if(command==='setup') {
    const me=identity();
    if(!args.includes('--apply')) {
      show({workspace:me.organization.name,profile:me.profile,prefix:config.prefix,tables:definitions.filter(s=>s.runtime!=='workflow').map(s=>s.id),disabled_workflows:definitions.filter(s=>s.runtime==='workflow').map(s=>s.id),credits:0,next:'Run again with --apply to create these resources. No functions execute during setup.'});
      process.exit(0);
    }
    Object.assign(state,{org:me.organization.id,profile:me.profile,digest,configHash});state.specHashes||={};save();
    for(const spec of definitions) {
      if(spec.runtime==='workflow') {
        if(state.workflows[spec.id])continue;
        const graph=json(`workflows/${spec.id}.workflow.json`);
        graph.workflow.id=`${config.prefix}-${spec.id.replaceAll('_','-')}`;
        const path=resolve(root,'.oxygen',`${graph.workflow.id}.workflow.json`);
        writeFileSync(path,JSON.stringify(graph,null,2)+'\n');
        const lint=call('workflows','lint','--file',path);
        if(lint.canPublish===false || lint.validation?.canPublish===false)throw new Error(JSON.stringify(lint));
        const applied=call('workflows','apply','--file',path);
        state.workflows[spec.id]={id:graph.workflow.id,web_url:applied.web_url};state.specHashes[spec.id]=specHashes[spec.id];save();
        console.log('Installed disabled workflow: '+spec.id);continue;
      }
      if(!state.tables[spec.id]) {
        const columns=[{key:'example_id',label:'Example ID',dataType:'text'},...Object.entries(spec.inputs).map(([key,dataType])=>({key,label:key,dataType}))];
        const created=call('tables','create',`${config.prefix} / ${spec.id}`,'--columns-json',JSON.stringify(columns));
        if(!created.table?.id)throw new Error('Table create did not return table.id');
        state.tables[spec.id]={id:created.table.id,slug:created.table.slug,web_url:created.web_url};state.specHashes[spec.id]=specHashes[spec.id];save();
      }
      const table=state.tables[spec.id].id;
      const described=call('tables','describe',table);
      if(!(described.columns||[]).some(c=>c.key==='result')) {
        if(spec.runtime==='enrichment') {
          const preview=call('enrich-column','preview',table,'--capability','work_email','--full-name-column','full_name','--company-domain-column','company_domain','--linkedin-url-column','linkedin_url','--provider-order',spec.provider_order.join(','),'--email-waterfall-profile',spec.profile,'--limit','1');
          if(!preview.column_definition)throw new Error('Enrichment preview has no definition.');
          call('columns','add',table,'--key','result','--label',spec.id,'--kind','enrichment','--data-type','jsonb','--definition-json',JSON.stringify(preview.column_definition));
        } else {
          const flags=['columns','add',table,'--key','result','--label',spec.id,'--kind',spec.kind,'--data-type','jsonb','--prompt',resolve(root,spec.prompt),'--output-schema-json',JSON.stringify(spec.output_schema)];
          if(spec.kind==='research')flags.push('--research-query',spec.research_query,'--research-mode','strict','--research-results','5');
          call(...flags);
        }
      }
      if(!state.functions[spec.id]) {
        const published=call('callables','publish',table,'--inputs-json',JSON.stringify(Object.keys(spec.inputs).map(column=>({column,required:true}))),'--actions-json','["result"]','--outputs-json','[{"column":"result","required":true}]','--max-credits-per-item',String(config.callable_credit_ceiling),'--max-items',String(config.max_items),'--slug',`${config.prefix}-${spec.id.replaceAll('_','-')}`,'--name',spec.id,'--description',spec.description);
        state.functions[spec.id]={slug:`${config.prefix}-${spec.id.replaceAll('_','-')}`,web_url:published.web_url};save();
      }
      console.log('Installed callable: '+spec.id);
    }
    show({installed:true,state_file:'.oxygen/'+config.prefix+'.json',credits:0});
  } else if(command==='status') {identity();show(state);}
  else if(command==='example') {
    identity();const spec=selected();
    if(spec.runtime==='workflow')throw new Error('Workflow examples are JSON inputs: use npm run preview -- --function '+spec.id);
    const table=state.tables[spec.id]?.id;if(!table)throw new Error('Run setup --apply first.');
    const rows=json(`examples/${spec.id}.json`);
    show(call('tables','upsert',table,'--key','example_id','--rows-json',JSON.stringify(rows),'--return','ids'));
  } else if(command==='preview') {
    identity();const spec=selected();
    if(spec.runtime==='workflow') {
      const workflow=state.workflows[spec.id]?.id;if(!workflow)throw new Error('Run setup --apply first.');
      const input=json(value('--input')||`examples/${spec.id}.json`);
      show(call('workflows','call',workflow,'--input-json',JSON.stringify(input),'--mode','dry_run'));
    } else {
      const table=state.tables[spec.id]?.id;if(!table)throw new Error('Run setup --apply first.');
      show(call('columns','run',table,'result','--limit','1','--dry-run'));
    }
  } else throw new Error('Commands: setup [--apply], status, example --function NAME, preview --function NAME. Options: --cli oxygen-dev, --config FILE, --input FILE.');
} catch(error) {console.error(error.message);process.exitCode=1;}
