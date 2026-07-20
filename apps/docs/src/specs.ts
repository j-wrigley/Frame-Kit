import type { PageId } from './nav';

/** Pages that ship an AI-readable Markdown spec, mapped to the doc's
 *  basename inside `packages/framekit/docs/`. Component specs live in
 *  `components/`, foundation references at the docs root. */
const COMPONENT_SPECS: Partial<Record<PageId, string>> = {
  buttons: 'button',
  loader: 'loader',
  'drop-zone': 'drop-zone',
  inputs: 'input',
  stepper: 'stepper',
  slider: 'slider',
  'ruler-slider': 'ruler-slider',
  'ruler-readouts': 'ruler-readout',
  'drag-value': 'drag-value',
  scrubber: 'scrubber',
  'segmented-switch': 'segmented-switch',
  tabs: 'tabs',
  'checks-radios': 'checks-and-radios',
  'toggle-rows': 'toggle',
  'layer-rows': 'layer-row',
  frames: 'frame',
  sidebar: 'sidebar',
  dropdowns: 'dropdown',
  popover: 'popover',
  'context-menu': 'context-menu',
  'hover-cards-tooltips': 'hover-card',
  toolbar: 'toolbar',
  'color-picker': 'color-picker',
  'easing-graph': 'easing-graph',
  'spring-response': 'spring-response',
  'camera-path': 'camera-path',
  'focus-crop': 'focus-crop',
  'modulation-strip': 'modulation-strip',
  'loop-composer': 'loop-composer',
  'tone-curve': 'tone-curve',
  'orbit-dial': 'orbit-dial',
  'envelope-editor': 'envelope-editor',
  'color-balance-wheels': 'color-balance-wheels',
  'perspective-transform': 'perspective-grid',
  'value-graph': 'value-graph',
  'node-canvas': 'node-canvas',
  'axis-field': 'axis-field',
  'direction-pad': 'direction-pad',
  'keyframe-lane': 'keyframe-lane',
  'video-timeline': 'video-timeline',
  'gradient-editor': 'gradient-editor',
  'histogram-scope': 'histogram-scope',
};

const ROOT_SPECS: Partial<Record<PageId, string>> = {
  introduction: 'principles',
  colors: 'tokens',
  typography: 'typography',
  spacing: 'spacing',
  elevation: 'elevation',
  motion: 'motion',
  icons: 'icons',
};

const AI_SPECS: Partial<Record<PageId, string>> = {
  'ai-direction': 'direction',
  'frame-kit-skill': 'skill',
  'gpt-codex': 'gpt-codex',
  claude: 'claude',
};

/** Lazy raw-text imports — each spec becomes its own chunk, fetched on demand. */
const componentFiles = import.meta.glob('../../../packages/framekit/docs/components/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const rootFiles = import.meta.glob('../../../packages/framekit/docs/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const aiFiles = import.meta.glob('../../../packages/framekit/docs/ai/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

export function hasSpec(page: PageId): boolean {
  return page in COMPONENT_SPECS || page in ROOT_SPECS || page in AI_SPECS;
}

/** Repo-relative path of a page's spec, shown in the spec header. */
export function specPath(page: PageId): string | null {
  if (COMPONENT_SPECS[page]) return `packages/framekit/docs/components/${COMPONENT_SPECS[page]}.md`;
  if (ROOT_SPECS[page]) return `packages/framekit/docs/${ROOT_SPECS[page]}.md`;
  if (AI_SPECS[page]) return `packages/framekit/docs/ai/${AI_SPECS[page]}.md`;
  return null;
}

export function loadSpec(page: PageId): Promise<string> | null {
  const component = COMPONENT_SPECS[page];
  if (component) {
    const load = componentFiles[`../../../packages/framekit/docs/components/${component}.md`];
    return load ? load() : null;
  }
  const root = ROOT_SPECS[page];
  if (root) {
    const load = rootFiles[`../../../packages/framekit/docs/${root}.md`];
    return load ? load() : null;
  }
  const ai = AI_SPECS[page];
  if (ai) {
    const load = aiFiles[`../../../packages/framekit/docs/ai/${ai}.md`];
    return load ? load() : null;
  }
  return null;
}

/** Resolve a relative `./name.md` cross-link inside a spec to the page
 *  whose spec it is — lets rendered docs link between spec views. */
export function pageForSpecFile(basename: string): PageId | null {
  for (const [page, file] of Object.entries(COMPONENT_SPECS)) {
    if (file === basename) return page as PageId;
  }
  for (const [page, file] of Object.entries(ROOT_SPECS)) {
    if (file === basename) return page as PageId;
  }
  for (const [page, file] of Object.entries(AI_SPECS)) {
    if (file === basename) return page as PageId;
  }
  return null;
}
