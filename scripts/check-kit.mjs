import { readdirSync, readFileSync, existsSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { root, json } from './lib.mjs';

const errors = [];
const entries = json('skills/catalog.json').skills;
const names = new Set();
for (const entry of entries) {
  if (names.has(entry.name)) errors.push(`duplicate catalog entry: ${entry.name}`);
  names.add(entry.name);
  if (entry.path !== `.agents/skills/${entry.name}/SKILL.md`) errors.push(`unexpected skill path: ${entry.name}`);
  const path = resolve(root,entry.path);
  if (!existsSync(path)) { errors.push(`missing skill: ${entry.path}`); continue; }
  const source = readFileSync(path,'utf8');
  const front = source.match(/^---\nname: ([a-z0-9]+(?:-[a-z0-9]+)*)\ndescription: ([^\n]+)\n---\n/);
  if (!front || front[1] !== entry.name || front[2] !== entry.description) errors.push(`frontmatter/catalog mismatch: ${entry.name}`);
  if (entry.description.length > 1024 || /[<>]/.test(entry.description)) errors.push(`invalid skill description: ${entry.name}`);
}
for (const dir of readdirSync(resolve(root,'.agents/skills'),{withFileTypes:true})) if (dir.isDirectory() && !names.has(dir.name)) errors.push(`uncataloged skill: ${dir.name}`);
if (realpathSync(resolve(root,'.claude/skills')) !== realpathSync(resolve(root,'.agents/skills'))) errors.push('Claude skills do not share the canonical library');
const ignored = new Set(['.git','.oxygen','node_modules','output','data','private','__pycache__']);
function checkLinks(dir) {
  for (const item of readdirSync(dir,{withFileTypes:true})) {
    if (ignored.has(item.name) || item.isSymbolicLink()) continue;
    const path = resolve(dir,item.name);
    if (item.isDirectory()) { checkLinks(path); continue; }
    if (!item.name.endsWith('.md')) continue;
    const body = readFileSync(path,'utf8').replace(/```[\s\S]*?```/g,'');
    for (const match of body.matchAll(/\[[^\]\n]*\]\(([^\s)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      if (!existsSync(resolve(dirname(path),decodeURIComponent(target)))) errors.push(`${relative(root,path)}: missing link ${target}`);
    }
  }
}
checkLinks(root);
const readme = readFileSync(resolve(root,'README.md'),'utf8');
if (!readme.includes(`${entries.length} agent skills`)) errors.push('README skill count differs from catalog');
for (const error of errors) console.error(error);
if (errors.length) process.exitCode = 1;
else console.log(`Kit check passed: ${entries.length} cataloged skills, shared Claude discovery and local Markdown links.`);
