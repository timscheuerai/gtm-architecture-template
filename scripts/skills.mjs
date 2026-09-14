import { existsSync, lstatSync, readFileSync, realpathSync, mkdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, json } from './lib.mjs';

const catalog = json('skills/catalog.json').skills;
const groups = ['Start','Context','GTM','OXYGEN','Content','Visuals','Media'];
const args = process.argv.slice(2);
try {
  if (args.length > 1 || args.length === 1 && !['--build','--claude'].includes(args[0])) throw new Error('Usage: npm run skills -- [--build|--claude]');
  if (args[0] === '--claude') {
    const link = resolve(root, '.claude/skills');
    const source = resolve(root, '.agents/skills');
    let stat;
    try { stat = lstatSync(link); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat?.isSymbolicLink()) {
      if (realpathSync(link) !== realpathSync(source)) throw new Error('Existing Claude skills link points elsewhere; preserved it.');
    } else if (stat) {
      // Some ZIP/Git configurations turn this exact repository symlink into text.
      if (!stat.isFile() || stat.size > 100 || readFileSync(link,'utf8').trim() !== '../.agents/skills') throw new Error('Existing Claude skills directory/file preserved; no automatic overwrite.');
      unlinkSync(link);
    }
    mkdirSync(resolve(root,'.claude'),{recursive:true});
    if (!existsSync(link)) symlinkSync(process.platform === 'win32' ? source : '../.agents/skills',link,process.platform === 'win32' ? 'junction' : 'dir');
    console.log('Claude Code and the kit use the same .agents/skills directory.');
  } else if (args[0] === '--build') {
    let doc = `# Skills catalog\n\n${catalog.length} skills share one library in .agents/skills/. Open the whole repository in your coding agent and ask for a skill by name. Context and function references are part of the package; these skills are not standalone single-file installs.\n\nStart with **gtm-start** for an account batch, or **setup-workspace → capture-context → voice-calibration → linkedin-copywriter** for content. You do not need to configure every skill before starting.\n\nThe offline demo needs Node.js 22+. Hosted functions need an OXYGEN account and CLI. Flowchart helpers and context checks use Python 3. Video renderers, image tools, QMD, Notion, YouTube and OXYGEN sender connections are optional and not installed by this kit. Provider procedures discover the actual current tool/schema before operating.\n\n`;
    for (const group of groups) {
      doc += `## ${group}\n\n| Skill | Use it for |\n|---|---|\n`;
      for (const item of catalog.filter(s => s.group === group)) doc += `| [${item.name}](../${item.path}) | ${item.description.replaceAll('|','\\|')} |\n`;
      doc += '\n';
    }
    doc += '## Consolidation\n\nLinkedIn writing, graphics and repurposing use the generic content-engine versions; the older repurpose skill maps to repurpose-content. The two outbound-copywriter versions are merged into one procedure. The formerly nested manim-video skill is directly discoverable. Machine-readable provenance is in [the catalog](../skills/catalog.json); scope and validation limits are in [the source notes](sources.md).\n';
    writeFileSync(resolve(root,'docs/skills.md'),doc);
    console.log(`Built catalog for ${catalog.length} skills.`);
  } else {
    for (const group of groups) console.log(`${group}: ${catalog.filter(s => s.group === group).map(s => s.name).join(', ')}`);
    console.log(`\n${catalog.length} skills. Read docs/skills.md for descriptions and prerequisites.`);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
