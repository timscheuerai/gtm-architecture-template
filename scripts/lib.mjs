import { readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const read = path => readFileSync(resolve(root, path), 'utf8');
export const json = path => JSON.parse(read(path));
export const specs = () => readdirSync(resolve(root, 'functions'), {withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>json(`functions/${x.name}/function.json`)).sort((a,b)=>a.id.localeCompare(b.id));
export function oxygen(binary, args) {
  const result = spawnSync(binary, [...args, '--json'], {encoding:'utf8', maxBuffer:8*1024*1024, timeout:120000});
  if (result.error) throw result.error;
  let envelope;
  try { envelope = JSON.parse(result.stdout); } catch { throw new Error(`CLI did not return JSON for ${args.slice(0,2).join(' ')}: ${result.stderr.slice(0,600)}`); }
  if (result.status !== 0 || !envelope.ok) throw new Error(`${args.slice(0,2).join(' ')}: ${JSON.stringify(envelope.error || envelope).slice(0,1800)}`);
  return envelope.data;
}
