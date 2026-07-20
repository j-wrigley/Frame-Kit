# Frame Kit — Elevation

> How the kit expresses depth: a three-tier surface stack, hairline borders for
> structure, and three shadow steps reserved for surfaces that truly float.

## The model

Structure comes from borders; elevation comes from shadow — and the two are
never interchangeable. A panel beside another panel is separated by
`--fk-border-subtle`, not a shadow. A shadow appears only when a surface
genuinely floats above the plane: popovers, menus, dialogs, drag states.
Surface color carries most of the depth story; the shadow confirms it.

Raw values for every token named here live in
[the token reference](./tokens.md).

## Surface stack

Three background tiers cover every layout — `--fk-bg-app` (the canvas) →
`--fk-bg-surface` (panels, sidebars, wells) → `--fk-bg-raised` (anything that
floats) — plus the `--fk-bg-overlay` scrim for modal moments. Per-token
descriptions live in [the token reference](./tokens.md).

Every floating surface is built on `--fk-bg-raised`; components never invent a
fourth tier. The tier's meaning is constant across themes, but its derivation
flips:

- **Light** — raised goes off-ramp to pure white: no gray step sits above the
  near-white app background, so cards and popovers lift to `#ffffff`.
- **Dark** — raised returns to the ramp, stepping lighter than the surface
  tier. In the dark, elevation = lighter.

## Shadow steps

Three steps, tuned per theme, applied only to true elevation:

| Token            | Use                        |
| ---------------- | -------------------------- |
| `--fk-shadow-sm` | Raised cards, subtle lift  |
| `--fk-shadow-md` | Popovers, menus, dropdowns |
| `--fk-shadow-lg` | Dialogs, drag states       |

Light-mode shadows are faint washes of ink (5–12% opacity); dark-mode shadows
swap to heavier pure black (35–55%) because borders alone can't separate
overlapping dark surfaces. Always reference the tokens — a hand-rolled `rgba`
shadow will read correctly in one theme and vanish or bruise in the other.

## Pairing rules

The kit's floating surfaces share one recipe — shadow accompanies, never
replaces, the hairline border:

```css
background: var(--fk-bg-raised);
border: 1px solid var(--fk-border-control);
border-radius: var(--fk-radius-md);
box-shadow: var(--fk-shadow-md);
```

Who carries what:

- **`--fk-shadow-md`** — the floating-surface default:
  [Popover](./components/popover.md), [Dropdown](./components/dropdown.md)
  menus, [Context Menu](./components/context-menu.md),
  [Hover Card](./components/hover-card.md) and tooltip surfaces (tooltips
  tighten to `--fk-radius-sm`), and [Toolbar](./components/toolbar.md) flyouts
  (also `--fk-radius-sm`).
- **`--fk-shadow-lg`** — the heaviest float: the
  [Color Picker](./components/color-picker.md) panel upgrades its popover
  surface to `--fk-shadow-lg` with a `--fk-border-subtle` edge; dialogs and
  drag previews sit here too.
- **`--fk-shadow-sm`** — transient lift, not resting chrome:
  [Button](./components/button.md) hover, the selected contained
  [Tabs](./components/tabs.md) tab, the checked
  [Loop Composer](./components/loop-composer.md) mode toggle, and drag thumbs
  in [Slider](./components/slider.md),
  [Ruler Slider](./components/ruler-slider.md),
  [Color Balance Wheels](./components/color-balance-wheels.md),
  [Perspective Grid](./components/perspective-grid.md), and
  [Loop Composer](./components/loop-composer.md).

Drag thumbs follow their own small recipe — `--fk-bg-raised` fill, a 2px
`--fk-accent` border (1px on the slimmer Ruler Slider thumb), `--fk-shadow-sm`.
Slider and Ruler Slider thumbs additionally compose a
`0 0 0 2px var(--fk-accent-subtle)` ring on hover with the same shadow rather
than escalating to a heavier step; the canvas-style thumbs (wheels, grid
corners, loop handles) go straight from rest to their active state.

Resting controls never carry a shadow. Control chrome whispers — the
`--fk-border-control` wash plus translucent ink-tint fills — and a shadow on a
resting button or input reads as a mistake.

## Stacking

Portal surfaces share a small z-index vocabulary so overlays from different
components interleave predictably:

| Token            | Value | Layer                       |
| ---------------- | ----- | --------------------------- |
| `--fk-z-menu`    | 1000  | Menus, dropdowns, flyouts   |
| `--fk-z-popover` | 1100  | Popovers, context menus     |
| `--fk-z-tooltip` | 1200  | Tooltips — above everything |

Concise transient surfaces (tooltips) always win over rich ones; rich ones win
over menus. Components reference the tokens with a literal fallback
(`var(--fk-z-menu, 1000)`) so portals survive rendering outside a tokened root.

## Overlay

Dialogs pair the top of both scales: `--fk-bg-overlay` dims the canvas and the
dialog surface rides `--fk-shadow-lg` on `--fk-bg-raised`. The scrim is tuned
per theme like the shadows — a 40% ink wash in light, a heavier 65% near-black
wash in dark.
