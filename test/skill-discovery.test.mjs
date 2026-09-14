import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { root } from '../scripts/lib.mjs';

function fixture(t) {
  const folder = mkdtempSync(resolve(tmpdir(),'gtm-skill-discovery-'));
  t.after(() => rmSync(folder,{recursive:true,force:true}));
  for (const name of ['scripts','skills','.agents/skills','.claude']) mkdirSync(resolve(folder,name),{recursive:true});
  for (const name of ['scripts/skills.mjs','scripts/lib.mjs','skills/catalog.json']) copyFileSync(resolve(root,name),resolve(folder,name));
  const run = () => spawnSync(process.execPath,[resolve(folder,'scripts/skills.mjs'),'--claude'],{encoding:'utf8'});
  return {folder,run};
}

test('Claude discovery creates and reuses the shared library link', t => {
  const {folder,run} = fixture(t);
  assert.equal(run().status,0);
  assert.equal(realpathSync(resolve(folder,'.claude/skills')),realpathSync(resolve(folder,'.agents/skills')));
  assert.equal(run().status,0);
});

test('Claude discovery repairs the exact ZIP placeholder and preserves unrelated files', t => {
  const {folder,run} = fixture(t);
  const link = resolve(folder,'.claude/skills');
  writeFileSync(link,'existing personal content');
  assert.equal(run().status,1);
  assert.equal(readFileSync(link,'utf8'),'existing personal content');
  writeFileSync(link,'../.agents/skills');
  assert.equal(run().status,0);
  assert.equal(realpathSync(link),realpathSync(resolve(folder,'.agents/skills')));
});

test('Claude discovery preserves an existing skill directory', t => {
  const {folder,run} = fixture(t);
  mkdirSync(resolve(folder,'.claude/skills'));
  writeFileSync(resolve(folder,'.claude/skills/mine.md'),'keep me');
  assert.equal(run().status,1);
  assert.equal(readFileSync(resolve(folder,'.claude/skills/mine.md'),'utf8'),'keep me');
});
