# Frame Kit — Design Principles

The charter for every element in the kit. When a decision is unclear, this file
wins. References we measure ourselves against: **Radix UI** (cleanliness, rigor),
**DialKit** (control feel), **Toolcraft** (craft in tool UI).

Voice of the kit: **Inter Variable** for interface text; **Office Code Pro** for
uppercase tags, micro labels, values, and code. Icons are the packaged 15×15
`currentColor` set (`docs/icons.md`) — no third-party icon dependency.

## 1. Built for tools, not marketing pages

Frame Kit targets creative and productivity applications — editors, inspectors,
panels, timelines, canvases. That implies:

- **Density**: primary UI text is 13px (`--fk-fs-2`). Controls are compact
  (28px default height when components land). Whitespace is deliberate, not generous.
- **Persistence**: these UIs are stared at for hours. Contrast is calm, surfaces
  are quiet, nothing vibrates for attention.

## 2. Neutral-first, light by default

- Light is the default theme; dark ships alongside it via `[data-theme='dark']`
  on the root element. Both are first-class — every token pair is designed and
  contrast-checked in both.
- Ramp step meanings are constant across themes (1–2 backgrounds · 3–5 surfaces
  & controls · 6–8 borders · 9–12 text); only the values swap.
- Surfaces come from the 12-step neutral ramp, exposed only through semantic
  tokens (`--fk-bg-*`, `--fk-border-*`, `--fk-text-*`).
- Base is the unchanged default surface style. The optional transparent style
  changes surface and structural-border opacity without changing geometry,
  typography, state, or the solid application canvas.
- **Color is a signal, not decoration.** The accent marks selection, focus, and
  primary actions — nothing else. Status colors (success/warning/danger) appear
  only when they carry meaning.
- The accent itself is restrained: graphite by default, with subtle-tone presets
  (`data-accent`) and arbitrary user colors (`applyAccent()`) as first-class
  options. Components must reference the accent slot, never a specific hue.

## 3. Semantic tokens are the public API

Components and consuming apps reference `--fk-bg-control`, never `--fk-gray-4`
and never a hex value. This keeps theming possible and every surface consistent.

## 4. Precise over clever

- Hairline borders define structure (`--fk-border-subtle`); control chrome
  whispers — resting controls use `--fk-border-control`, a 44% wash of the
  border color, never a full-strength outline. Shadows are reserved for true
  elevation (popovers, dialogs, drag states).
- Control fills are translucent ink tints (3% rest → 6% hover → 8% pressed),
  never opaque greys — they survive any background.
- Radii are sharp and nested: 3/4/6/8px — controls sit at 4, nested elements
  at 3. Nothing pill-shaped except intrinsically rounded working parts such as
  toggle tracks, slider handles, and indicator dots.
- Motion is fast and functional: 120–180ms, one easing curve (`--fk-ease`).
  Animation confirms an action; it never performs. Base styles collapse all
  motion under `prefers-reduced-motion: reduce`.

## 5. Accessible by default

- Every interactive element has a visible focus state (`--fk-focus-outline` —
  outline-based, so it survives Windows forced-colors mode and works on any surface).
- Text colors meet WCAG AA in both themes against every designated background
  through `--fk-bg-control` (measured: primary ≥ 14:1, secondary ≥ 6.2:1,
  tertiary ≥ 4.7:1 — tertiary is for meta text and placeholders only).
- Solid fills carry AA-compliant text partners: `--fk-text-on-accent` pairs with
  the accent slot in every preset and theme (graphite: 10.4:1 light, 13.3:1 dark;
  `applyAccent()` derives an AA pairing for custom colors and gently deepens a
  boundary color when that preserves a white label), white on danger
  (4.8:1), `--fk-text-on-success` / `--fk-text-on-warning` (dark) on green and amber.
- Full keyboard operability is part of a component's definition of done.

## 6. Component API conventions

Fixed vocabulary — the same words mean the same thing everywhere:

- Sizes: `sm` | `md` (default) | `lg`
- Variants: `primary` | `secondary` (default) | `ghost` | `danger`
- Boolean props are positive and unprefixed: `disabled`, `loading` — not `isDisabled`.
- Controlled + uncontrolled: `value`/`onChange` alongside `defaultValue`.
- Every component forwards its `ref` and spreads rest props onto the root element.
- Class hooks: kit classes are prefixed `fk-` (e.g. `fk-button`); consumers may
  target them but the props API is the contract.

## 7. One element at a time

A component ships only when its design is right: spec'd in `docs/components/`,
token-pure, keyboard-complete, and reviewed in the docs app. No batch-generated
filler components.
