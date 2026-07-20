import type { ReactNode } from 'react';

/** Categories shown as library filters. */
export type BuilderCategory = 'structure' | 'controls' | 'creative';

/** One editable option on a builder node — rendered by the Inspector.
 *  `select` options MUST mirror the component's real prop union verbatim;
 *  never invent variants and never omit a public one. */
export interface OptionSpec {
  /** Key into the node's props record. */
  key: string;
  /** Inspector label, sentence case. */
  label: string;
  type: 'select' | 'toggle' | 'text' | 'number' | 'color';
  /** Required for `select`. Values must be the component's real union members. */
  choices?: readonly { value: string; label: string }[];
  /** For `number`: bounds + step for the inspector stepper. */
  min?: number;
  max?: number;
  step?: number;
  /** Initial value seeded onto new nodes. */
  defaultValue: string | number | boolean;
}

/** Values chosen for one node, keyed by OptionSpec.key. */
export type NodeProps = Record<string, string | number | boolean>;

/** Runtime state handed to entry renderers so interactive components stay
 *  live on the canvas without each entry owning React state. The builder
 *  stores per-node scratch values here (slider positions, toggles, text). */
export interface RenderContext {
  /** Read a live scratch value for this node. */
  get: <T>(key: string, fallback: T) => T;
  /** Write a live scratch value for this node. */
  set: (key: string, value: unknown) => void;
  /** True when the canvas is in interactive View mode (not Edit). */
  viewing: boolean;
}

/** One library entry. `render` MUST compose real kit components — the canvas
 *  is a live instance of the design system, never a mock. */
export interface CatalogEntry {
  kind: string;
  label: string;
  description: string;
  category: BuilderCategory;
  /** Two-letter mark shown on the library card. */
  short: string;
  /** True when the node hosts children (renders a Disclosure destination). */
  container?: boolean;
  /** Editable options, in inspector order. Include a 'label' text option
   *  whenever the component shows a visible label. */
  options: readonly OptionSpec[];
  /** Render the real component with the node's chosen props. */
  render: (props: NodeProps, ctx: RenderContext) => ReactNode;
  /** Emit the JSX a consumer would write for this node with these props.
   *  Return the element only (no imports); indent nested lines two spaces.
   *  Must stay truthful to `render` — same component, same props. */
  code: (props: NodeProps) => string;
  /** Names to add to the generated import statement for this entry. */
  imports: readonly string[];
  /** Docs page id for the "spec" link in the inspector (e.g. 'slider'). */
  specPage?: string;
}

/** Helper: seed a props record from an entry's option defaults. */
export function defaultProps(entry: CatalogEntry): NodeProps {
  const props: NodeProps = {};
  for (const option of entry.options) props[option.key] = option.defaultValue;
  return props;
}

/** Helper: format a string prop for a generated JSX attribute. Plain quoted
 *  text when safe; a braced expression when the value needs escaping (JSX
 *  string literals have no escape sequences, so `label="a \" b"` is invalid). */
export function jsxString(value: unknown): string {
  const text = String(value);
  return /^[^"\\]*$/.test(text) ? JSON.stringify(text) : `{${JSON.stringify(text)}}`;
}

/** Helper: format user text for JSX child position. Plain text when safe;
 *  a braced string expression when it contains JSX-significant characters. */
export function jsxText(value: unknown): string {
  const text = String(value);
  return /^[^{}<>&\\]*$/.test(text) ? text : `{${JSON.stringify(text)}}`;
}
