import { hasSpec } from './specs';

export type PageId =
  | 'introduction'
  | 'locally'
  | 'ai-direction'
  | 'frame-kit-skill'
  | 'gpt-codex'
  | 'claude'
  | 'colors'
  | 'typography'
  | 'spacing'
  | 'elevation'
  | 'motion'
  | 'icons'
  | 'components'
  | 'buttons'
  | 'loader'
  | 'drop-zone'
  | 'inputs'
  | 'stepper'
  | 'slider'
  | 'ruler-slider'
  | 'ruler-readouts'
  | 'drag-value'
  | 'scrubber'
  | 'segmented-switch'
  | 'tabs'
  | 'checks-radios'
  | 'toggle-rows'
  | 'layer-rows'
  | 'frames'
  | 'sidebar'
  | 'dropdowns'
  | 'popover'
  | 'context-menu'
  | 'hover-cards-tooltips'
  | 'toolbar'
  | 'color-picker'
  | 'easing-graph'
  | 'camera-path'
  | 'focus-crop'
  | 'modulation-strip'
  | 'loop-composer'
  | 'tone-curve'
  | 'orbit-dial'
  | 'envelope-editor'
  | 'color-balance-wheels'
  | 'perspective-transform'
  | 'value-graph'
  | 'node-canvas'
  | 'axis-field'
  | 'direction-pad'
  | 'keyframe-lane'
  | 'video-timeline'
  | 'gradient-editor'
  | 'histogram-scope'
  | 'spring-response'
  | 'sidebar-builder'
  | 'simple-sidebar'
  | 'frame-canvas'
  | 'photography-sidebar'
  | 'motion-toolbar'
  | 'font-picker';

export interface NavItem {
  id: PageId;
  label: string;
  sidebarLabel?: string;
  badge?: string;
}

export interface NavSection {
  title: string | null;
  badge?: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: null,
    items: [{ id: 'introduction', label: 'Introduction' }],
  },
  {
    title: 'Start up',
    items: [{ id: 'locally', label: 'Locally' }],
  },
  {
    title: 'AI Direction',
    items: [
      { id: 'ai-direction', label: 'Overview' },
      { id: 'frame-kit-skill', label: 'Frame Kit skill' },
      { id: 'gpt-codex', label: 'GPT / Codex' },
      { id: 'claude', label: 'Claude' },
    ],
  },
  {
    title: 'Figma',
    badge: 'Coming soon',
    items: [],
  },
  {
    title: 'Foundations',
    items: [
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'elevation', label: 'Elevation' },
      { id: 'motion', label: 'Motion' },
      { id: 'icons', label: 'Icons' },
    ],
  },
  {
    title: 'Components',
    items: [
      { id: 'components', label: 'Overview' },
      { id: 'buttons', label: 'Button' },
      { id: 'loader', label: 'Loader' },
      { id: 'drop-zone', label: 'Drop zone' },
      { id: 'inputs', label: 'Input' },
      { id: 'stepper', label: 'Stepper' },
      { id: 'slider', label: 'Slider' },
      { id: 'ruler-slider', label: 'Ruler slider' },
      { id: 'ruler-readouts', label: 'Ruler readouts' },
      { id: 'drag-value', label: 'Drag value' },
      { id: 'scrubber', label: 'Scrubber' },
      { id: 'segmented-switch', label: 'Segmented switch' },
      { id: 'tabs', label: 'Tabs' },
      { id: 'checks-radios', label: 'Checks & radios' },
      { id: 'toggle-rows', label: 'Toggle rows' },
      { id: 'layer-rows', label: 'Layer rows' },
      { id: 'frames', label: 'Frame' },
      { id: 'sidebar', label: 'Sidebar' },
      { id: 'dropdowns', label: 'Dropdowns' },
      { id: 'popover', label: 'Popover' },
      { id: 'context-menu', label: 'Context menu' },
      { id: 'hover-cards-tooltips', label: 'Hover cards & tooltips' },
      { id: 'toolbar', label: 'Toolbar' },
      { id: 'color-picker', label: 'Color picker' },
    ],
  },
  {
    title: 'Creative',
    items: [
      { id: 'easing-graph', label: 'Easing graph' },
      { id: 'spring-response', label: 'Spring response' },
      { id: 'camera-path', label: 'Camera path' },
      { id: 'focus-crop', label: 'Focus / crop' },
      { id: 'modulation-strip', label: 'Modulation strip' },
      { id: 'loop-composer', label: 'Loop composer' },
      { id: 'tone-curve', label: 'Tone curve' },
      { id: 'orbit-dial', label: 'Orbit dial' },
      { id: 'envelope-editor', label: 'Envelope editor' },
      { id: 'color-balance-wheels', label: 'Color balance wheels' },
      { id: 'perspective-transform', label: 'Perspective / transform' },
      { id: 'value-graph', label: 'Value graph' },
      { id: 'node-canvas', label: 'Node canvas' },
      { id: 'axis-field', label: 'Axis field' },
      { id: 'direction-pad', label: 'Direction pad' },
      { id: 'keyframe-lane', label: 'Keyframe lane' },
      { id: 'video-timeline', label: 'Video timeline' },
      { id: 'gradient-editor', label: 'Gradient editor' },
      { id: 'histogram-scope', label: 'Histogram scope' },
    ],
  },
  {
    title: 'Ready Made',
    items: [
      {
        id: 'sidebar-builder',
        label: 'Make your own sidebar',
        sidebarLabel: 'Sidebar builder',
        badge: 'Beta',
      },
      { id: 'simple-sidebar', label: 'Simple sidebar' },
      { id: 'frame-canvas', label: 'Frame canvas' },
      { id: 'photography-sidebar', label: 'Photography sidebar' },
      { id: 'motion-toolbar', label: 'Motion toolbar' },
      { id: 'font-picker', label: 'Font picker' },
    ],
  },
];

const PAGE_IDS = NAV.flatMap((s) => s.items.map((i) => i.id));

export interface Route {
  page: PageId;
  /** True when viewing the page's AI-readable Markdown spec (`#/spec/<id>`). */
  spec: boolean;
}

export function routeFromHash(hash: string): Route {
  const id = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  const specMatch = /^spec\/(.+)$/.exec(id);
  if (specMatch && (PAGE_IDS as string[]).includes(specMatch[1])) {
    const page = specMatch[1] as PageId;
    // Only pages with a registered doc get a spec view; others normalize
    // back to the component page itself.
    return { page, spec: hasSpec(page) };
  }
  return {
    page: (PAGE_IDS as string[]).includes(id) ? (id as PageId) : 'introduction',
    spec: false,
  };
}

export function hashForRoute(route: Route): string {
  return route.spec ? `#/spec/${route.page}` : `#/${route.page}`;
}

export function pageTitle(route: Route): string {
  const { page, spec } = route;
  if (page === 'introduction' && !spec) return 'Frame Kit';
  for (const section of NAV) {
    const item = section.items.find((i) => i.id === page);
    if (item) {
      const label = item.label === 'Overview' && section.title ? section.title : item.label;
      return spec ? `${label} spec — Frame Kit` : `${label} — Frame Kit`;
    }
  }
  return 'Frame Kit';
}
