#!/usr/bin/env node
/**
 * Generates the site's AI-retrieval surface from the package's canonical docs:
 *   public/ai/**.md      raw markdown mirrors (stable URLs for agents)
 *   public/llms.txt      llms.txt-convention index (H1 + summary + linked sections)
 *   public/llms-full.txt every doc concatenated for single-fetch ingestion
 * Runs on every docs build so the site never drifts from the package.
 */
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = resolve(HERE, '../../../packages/framekit');
const PUBLIC = resolve(HERE, '../public');
const SITE = 'https://framekit.presentstandards.studio';

const AI_DIR = join(PUBLIC, 'ai');
rmSync(AI_DIR, { recursive: true, force: true });
mkdirSync(join(AI_DIR, 'components'), { recursive: true });

const title = (path) => {
  const text = readFileSync(path, 'utf8');
  const name = /^name:\s*(.+)$/m.exec(text)?.[1];
  const h1 = /^#\s+(.+)$/m.exec(text)?.[1];
  return (name ?? h1 ?? 'Untitled').replace(/^Frame Kit — /, '');
};
const lede = (path) => {
  const text = readFileSync(path, 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const lines = text.split('\n');
  // First blockquote, all consecutive lines joined.
  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith('>')) continue;
    const quote = [];
    while (i < lines.length && lines[i].startsWith('>')) {
      quote.push(lines[i].replace(/^>\s?/, '').trim());
      i += 1;
    }
    const joined = quote.join(' ').trim();
    if (!/GENERATED FILE/i.test(joined)) return joined;
  }
  // Fall back to the first body paragraph after the H1.
  const afterH1 = text.slice(text.indexOf('\n', text.indexOf('# ')) + 1);
  const paragraph = afterH1
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#') && !p.startsWith('|') && !p.startsWith('```'));
  return (paragraph ?? '').replace(/\n/g, ' ').slice(0, 200);
};

const linkLine = (label, url, path) => {
  const description = lede(path);
  return description ? `- [${label}](${url}): ${description}` : `- [${label}](${url})`;
};

// Mirror the canonical markdown.
const rootDocs = ['principles.md', 'tokens.md', 'typography.md', 'spacing.md', 'elevation.md', 'motion.md', 'icons.md', 'customization.md'].filter((f) => {
  try { readFileSync(join(KIT, 'docs', f)); return true; } catch { return false; }
});
for (const f of rootDocs) cpSync(join(KIT, 'docs', f), join(AI_DIR, f));

const componentDocs = readdirSync(join(KIT, 'docs', 'components'))
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .sort();
for (const f of componentDocs) cpSync(join(KIT, 'docs', 'components', f), join(AI_DIR, 'components', f));

const routing = readFileSync(join(KIT, 'llms.txt'), 'utf8');
writeFileSync(
  join(AI_DIR, 'routing.txt'),
  `> Hosted mirror path map: \`docs/<f>.md\` → \`/ai/<f>.md\`, \`docs/components/<f>.md\` →\n> \`/ai/components/<f>.md\`, \`docs/ai/<f>.md\` → \`/ai/agents/<f>.md\`, skill references →\n> \`/ai/references/<f>.md\`.\n\n${routing}`
);
cpSync(join(KIT, 'skills', 'frame-kit', 'SKILL.md'), join(AI_DIR, 'SKILL.md'));
cpSync(join(KIT, 'skills', 'frame-kit', 'references'), join(AI_DIR, 'references'), { recursive: true });
mkdirSync(join(AI_DIR, 'agents'), { recursive: true });
for (const f of readdirSync(join(KIT, 'docs', 'ai')).filter((f) => f.endsWith('.md'))) {
  cpSync(join(KIT, 'docs', 'ai', f), join(AI_DIR, 'agents', f));
}

// llms.txt — index per the llms.txt convention.
const index = [
  '# Frame Kit',
  '',
  '> A precision React UI kit for creative and productivity tools — `@presentstandards/framekit-ui` on npm.',
  '> Light + dark themes, semantic `--fk-*` tokens, 375 icons, and AI-readable specs for every component.',
  '',
  'Working in a repo? Run `npm i @presentstandards/framekit-ui && npx framekit-agents` — it installs the',
  'agent skill for Claude Code and Codex and writes CLAUDE.md/AGENTS.md context. The npm package ships',
  'these same docs under `node_modules/@presentstandards/framekit-ui/docs/`.',
  '',
  '## Start here',
  '',
  `- [Agent skill (SKILL.md)](${SITE}/ai/SKILL.md): the working method for building Frame Kit interfaces`,
  `- [Component routing](${SITE}/ai/routing.txt): which component fits which value model + full catalogue notes`,
  `- [Design principles](${SITE}/ai/principles.md): ${lede(join(AI_DIR, 'principles.md')) || 'the charter every element follows'}`,
  '',
  '## Foundations',
  '',
  ...rootDocs
    .filter((f) => f !== 'principles.md')
    .map((f) => linkLine(title(join(AI_DIR, f)), `${SITE}/ai/${f}`, join(AI_DIR, f))),
  '',
  '## Components',
  '',
  ...componentDocs.map((f) =>
    linkLine(title(join(AI_DIR, 'components', f)), `${SITE}/ai/components/${f}`, join(AI_DIR, 'components', f))
  ),
  '',
  '## Optional',
  '',
  `- [Full documentation in one file](${SITE}/llms-full.txt): every doc above concatenated`,
  `- [Live docs site](${SITE}/): human-facing pages with interactive examples`,
  '',
].join('\n');
writeFileSync(join(PUBLIC, 'llms.txt'), index);

// llms-full.txt — one-fetch ingestion.
const sections = [];
const pushDoc = (label, path) => {
  sections.push(`\n\n════════ ${label} ════════\n\n${readFileSync(path, 'utf8').trim()}`);
};
pushDoc('SKILL.md (agent working method)', join(AI_DIR, 'SKILL.md'));
for (const f of readdirSync(join(AI_DIR, 'references')).sort()) {
  pushDoc(`skill references/${f}`, join(AI_DIR, 'references', f));
}
pushDoc('Component routing (llms.txt)', join(AI_DIR, 'routing.txt'));
for (const f of rootDocs) pushDoc(`docs/${f}`, join(AI_DIR, f));
for (const f of componentDocs) pushDoc(`docs/components/${f}`, join(AI_DIR, 'components', f));
writeFileSync(
  join(PUBLIC, 'llms-full.txt'),
  `# Frame Kit — full documentation (@presentstandards/framekit-ui)\n# Generated from the npm package docs. Index: ${SITE}/llms.txt${sections.join('')}\n`
);

console.log(
  `llms surface generated: ${rootDocs.length + componentDocs.length + 2} docs → public/ai, llms.txt, llms-full.txt`
);
