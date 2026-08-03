#!/usr/bin/env node
/**
 * framekit-agents — one-command AI setup for a consuming project.
 *
 *   npx framekit-agents            install/update the skill for Claude Code + Codex
 *                                  and write the Frame Kit sections of CLAUDE.md +
 *                                  AGENTS.md (created if missing)
 *   npx framekit-agents --skills   skill folders only, no instruction files
 *   npx framekit-agents --check    report what is installed and whether it is stale
 *
 * Everything is idempotent: skill folders are replaced wholesale, instruction
 * files are edited only between the FRAMEKIT markers.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(HERE, '..');
const SKILL_SRC = join(PKG_ROOT, 'skills', 'frame-kit');
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version;

const cwd = process.cwd();
const args = new Set(process.argv.slice(2));
const skillsOnly = args.has('--skills');
const checkOnly = args.has('--check');

const SKILL_TARGETS = [
  { agent: 'Claude Code', dir: join(cwd, '.claude', 'skills', 'frame-kit') },
  { agent: 'Codex', dir: join(cwd, '.agents', 'skills', 'frame-kit') },
];

const BEGIN = '<!-- FRAMEKIT:BEGIN (managed by npx framekit-agents — edits inside are overwritten) -->';
const END = '<!-- FRAMEKIT:END -->';

const section = `${BEGIN}
## Frame Kit

This project's interface is built with Frame Kit (\`@presentstandards/framekit-ui\` v${VERSION}).
Treat the kit as the source of truth for the interface language:

- Before any UI work, read \`node_modules/@presentstandards/framekit-ui/skills/frame-kit/SKILL.md\`
  and follow it (a copy is installed at \`.claude/skills/frame-kit\` and \`.agents/skills/frame-kit\`).
- Component truth lives in \`node_modules/@presentstandards/framekit-ui/llms.txt\` and
  \`node_modules/@presentstandards/framekit-ui/docs/\` (AI-readable specs per component).
- Import components, icons, and \`@presentstandards/framekit-ui/styles.css\` from the package.
  Never restyle component internals; style with semantic \`--fk-*\` tokens only.
- When no component fits, follow the skill's extension policy instead of adding a
  third-party component or one-off styles.
- Full docs for retrieval: https://framekit.presentstandards.studio/llms.txt
${END}`;

function upsertSection(file) {
  const path = join(cwd, file);
  if (existsSync(path) && !statSync(path).isFile()) {
    console.error(`framekit-agents: ${file} exists but is not a file — skipped.`);
    return null;
  }
  let text = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const begin = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (begin !== -1 && end !== -1) {
    text = text.slice(0, begin) + section + text.slice(end + END.length);
  } else {
    text = text.length ? `${text.trimEnd()}\n\n${section}\n` : `${section}\n`;
  }
  writeFileSync(path, text);
  return path;
}

function skillVersion(dir) {
  try {
    return readFileSync(join(dir, '.framekit-version'), 'utf8').trim();
  } catch {
    return null;
  }
}

if (!existsSync(SKILL_SRC)) {
  console.error('framekit-agents: skill source not found — is @presentstandards/framekit-ui installed?');
  process.exit(1);
}

if (checkOnly) {
  for (const target of SKILL_TARGETS) {
    const installed = skillVersion(target.dir);
    const state = !installed
      ? existsSync(target.dir)
        ? 'installed (unversioned copy — rerun npx framekit-agents)'
        : 'not installed'
      : installed === VERSION
        ? `up to date (v${installed})`
        : `stale (v${installed} installed, v${VERSION} in node_modules)`;
    console.log(`${target.agent.padEnd(12)} ${relative(cwd, target.dir)}  ${state}`);
  }
  for (const file of ['CLAUDE.md', 'AGENTS.md']) {
    const path = join(cwd, file);
    const has = existsSync(path) && readFileSync(path, 'utf8').includes(BEGIN);
    console.log(`${file.padEnd(12)} ${has ? 'has the Frame Kit section' : 'no Frame Kit section'}`);
  }
  process.exit(0);
}

for (const target of SKILL_TARGETS) {
  rmSync(target.dir, { recursive: true, force: true });
  mkdirSync(dirname(target.dir), { recursive: true });
  cpSync(SKILL_SRC, target.dir, { recursive: true });
  writeFileSync(join(target.dir, '.framekit-version'), `${VERSION}\n`);
  console.log(`✓ ${target.agent}: skill installed at ${relative(cwd, target.dir)} (v${VERSION})`);
}

if (!skillsOnly) {
  for (const file of ['CLAUDE.md', 'AGENTS.md']) {
    const path = upsertSection(file);
    if (path) console.log(`✓ ${file}: Frame Kit section written (${relative(cwd, path)})`);
  }
} else {
  console.log('· skipped CLAUDE.md / AGENTS.md (--skills)');
}

console.log(`
Frame Kit agents are set up. What each agent now gets:
  Claude Code   .claude/skills/frame-kit (auto-discovered) + CLAUDE.md context
  Codex / GPT   .agents/skills/frame-kit + AGENTS.md read before every task
  Other agents  point them at https://framekit.presentstandards.studio/llms.txt

Rerun after upgrading @presentstandards/framekit-ui to refresh the copies.`);
