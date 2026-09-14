import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { root, specs, json, read } from './lib.mjs';

const config = json('config.example.json');
const write = (path,value) => { mkdirSync(resolve(root,path,'..'),{recursive:true}); writeFileSync(resolve(root,path), JSON.stringify(value,null,2)+'\n'); };
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const workflows = [];
const tables = [];
for (const spec of specs()) {
  if (spec.runtime === 'workflow') {
    const fn = (await import(pathToFileURL(resolve(root,spec.source)))).default;
    const inputs = Object.fromEntries(Object.keys(spec.input_schema.properties).map(key=>[key, key in spec.defaults ? {type:'literal',value:spec.defaults[key]} : {type:'ref',path:`trigger.input.${key}`} ]));
    const input_schema = structuredClone(spec.input_schema);
    for (const key of Object.keys(spec.defaults)) { delete input_schema.properties[key]; input_schema.required = input_schema.required.filter(x=>x!==key); }
    const source = fn.toString().replace(/^function[^()]*\(input\)\s*\{/, '(inputs) => { const input = inputs;');
    const manifest = {manifest_version:2,workflow:{id:`${config.prefix}-${spec.id.replaceAll('_','-')}`,name:spec.id,status:'disabled'},trigger:{type:'api',status:'disabled'},input_schema,nodes:[{id:'trigger',name:'Function input',kind:'trigger',ui:{x:0,y:0}},{id:'execute',name:spec.id,description:spec.description,kind:'code',ui:{x:320,y:0},code:{version:1,language:'javascript',runtime:'oxygen-js-v1',source,inputs,output_schema:spec.output_schema,limits:{timeout_ms:1000,max_input_bytes:250000,max_output_bytes:250000}}}],edges:[{id:'trigger-execute',source:'trigger',target:'execute'}],compiler_version:'oxygen-workflows-v2'};
    manifest.source_hash = hash(manifest);
    write(`workflows/${spec.id}.workflow.json`,manifest);
    workflows.push({manifest,table_refs:{},prompt_template_slugs:[]});
  } else if (spec.runtime === 'table') {
    const columns = [{key:'example_id',label:'Example ID',dataType:'text',kind:'source'},...Object.entries(spec.inputs).map(([key,dataType])=>({key,label:key,dataType,kind:'source'}))];
    columns.push({key:'result',label:spec.id,dataType:'jsonb',kind:spec.kind,definition:{version:1,prompt:read(spec.prompt),outputSchema:spec.output_schema,inputMapping:Object.fromEntries(Object.keys(spec.inputs).map(key=>[key,{type:'column',columnKey:key}])),...(spec.kind==='research'?{webSearch:{enabled:true,queryTemplate:spec.research_query,evidenceMode:'strict',maxResults:5}}:{})}});
    tables.push({ref:spec.id,name:`${config.prefix} / ${spec.id}`,columns});
  }
}
const blueprint = {blueprint_version:1,compiler_version:'oxygen-blueprints-v1',id:config.prefix,name:'GTM Architecture — function templates',summary:'Six callable-table foundations and six deterministic workflows. Setup publishes callables and resolves the email waterfall separately.',tags:['gtm','template','architecture'],audience:['founder','gtm-operator'],requires:{integrations:[],context_keys:[]},input_schema:{type:'object',properties:{}},tables,prompt_templates:[],workflows,exported_at:'2026-09-14T00:00:00.000Z'};
blueprint.source_hash=hash(blueprint);
write('blueprints/functions.json',blueprint);
console.log(`Built ${workflows.length} disabled workflow definitions and a ${tables.length}-table blueprint.`);
