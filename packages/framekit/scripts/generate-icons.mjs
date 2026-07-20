// Generates src/icons/icons.tsx and docs/icons.md from icons/*.svg.
// Source SVGs are the Radix Icons set (MIT © WorkOS) — 15×15 grid, currentColor.
// Re-run after adding/removing SVGs: node scripts/generate-icons.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ICONS_DIR = fileURLToPath(new URL('../icons', import.meta.url));
const OUT_TSX = fileURLToPath(new URL('../src/icons/icons.tsx', import.meta.url));
const OUT_MD = fileURLToPath(new URL('../docs/icons.md', import.meta.url));

const pascal = (kebab) =>
  kebab
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');

// The set only uses these kebab-case SVG attributes.
const toJsx = (markup) =>
  markup
    .replaceAll('fill-rule=', 'fillRule=')
    .replaceAll('clip-rule=', 'clipRule=');

// A few icons embed <mask id="a"> etc. — namespace ids per icon so different
// icons on the same page can't resolve each other's defs.
const namespaceIds = (markup, name) =>
  markup
    .replace(/id="([^"]+)"/g, (_, id) => `id="fk-${name}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#fk-${name}-${id})`);

const files = (await readdir(ICONS_DIR)).filter((f) => f.endsWith('.svg')).sort();

const entries = [];
for (const file of files) {
  const svg = await readFile(`${ICONS_DIR}/${file}`, 'utf8');
  const name = file.replace(/\.svg$/, '');
  const match = svg.match(/<svg[^>]*viewBox="0 0 15 15"[^>]*>([\s\S]*)<\/svg>/);
  if (!match) throw new Error(`${file}: expected a 15×15 viewBox`);
  const inner = toJsx(namespaceIds(match[1].trim(), name));
  const single = /^<(path|rect|circle)\b[^>]*\/>$/.test(inner);
  entries.push({ name, component: `${pascal(name)}Icon`, jsx: single ? inner : `<>${inner}</>` });
}

const tsx = `// GENERATED FILE — do not edit by hand.
// Source: icons/*.svg (Radix Icons, MIT © WorkOS). Regenerate: node scripts/generate-icons.mjs
import { createIcon } from './create-icon';

${entries
  .map((e) => `export const ${e.component} = /* @__PURE__ */ createIcon('${e.component}', ${e.jsx});`)
  .join('\n')}

/** Every icon, keyed by kebab-case name — powers the dynamic \`<Icon name />\` component. */
export const ICONS = {
${entries.map((e) => `  '${e.name}': ${e.component},`).join('\n')}
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = /* @__PURE__ */ (Object.keys(ICONS) as IconName[]);
`;

const md = `# Frame Kit — Icons

${entries.length} icons on a 15×15 grid, drawn with \`currentColor\` so they inherit
the surrounding text color. Based on the Radix Icons set (MIT © WorkOS), packaged
directly in \`@presentstandards/framekit-ui\` — no extra dependency.

> GENERATED FILE — regenerate with \`node scripts/generate-icons.mjs\`.

## Usage

\`\`\`tsx
// Preferred: named per-icon components (tree-shakeable)
import { MagnifyingGlassIcon } from '@presentstandards/framekit-ui';
<MagnifyingGlassIcon />                      // 15px, decorative by default (aria-hidden)
<MagnifyingGlassIcon size={18} />            // any square size
<MagnifyingGlassIcon aria-label="Search" />  // labelled → role="img", announced by AT

// Dynamic, when the name arrives at runtime (renders null + warns on unknown names)
import { Icon } from '@presentstandards/framekit-ui';
<Icon name="magnifying-glass" />
\`\`\`

Also exported: \`ICONS\` (name → component map), \`ICON_NAMES\`, and the \`IconName\` type.

## All icons

| Name | Component |
| ---- | --------- |
${entries.map((e) => `| \`${e.name}\` | \`${e.component}\` |`).join('\n')}
`;

await writeFile(OUT_TSX, tsx);
await writeFile(OUT_MD, md);
console.log(`${entries.length} icons → src/icons/icons.tsx, docs/icons.md`);
