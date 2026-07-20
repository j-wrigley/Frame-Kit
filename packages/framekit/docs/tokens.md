# Frame Kit — Token Reference

Source: `src/styles/tokens.css` (+ `accents.css` for accent presets and
`surface-styles.css` for optional surface treatments). Semantic tokens are the
public API — raw ramp steps (`--fk-gray-*`) are internal.

## Theming

Light is the default. Dark is activated with `data-theme="dark"` on the root
element (`<html data-theme="dark">`). Step meanings never change between themes —
only values swap — so components written against semantic tokens work in both
without modification.

## Styles

Base is the default surface treatment and requires no attribute. Activate the
optional transparent treatment with `<html data-style="transparent">` or
`applyFrameKitStyle('transparent')`. `resetFrameKitStyle()` returns to base.

Transparent style changes only semantic surface opacity, structural border
opacity, and the backdrop filter used by raised tool chrome. It does not alter
the solid app canvas, typography, spacing, radii, component geometry, state, or
accent. This keeps UI legible over artwork and media while preserving the same
Frame Kit component contract in both styles and both themes.

## Backgrounds

| Token                    | Use                                     |
| ------------------------ | --------------------------------------- |
| `--fk-bg-app`            | App / page background                   |
| `--fk-bg-surface`        | Panels, sidebars, wells                 |
| `--fk-bg-raised`         | Cards, popovers, menus                  |
| `--fk-bg-control`        | Buttons, inputs (resting — 3% ink tint) |
| `--fk-bg-control-hover`  | Control hover (6% ink tint)             |
| `--fk-bg-control-active` | Control pressed / active (8% ink tint)  |
| `--fk-bg-overlay`        | Scrim behind dialogs                    |

`--fk-surface-backdrop-filter` and `--fk-control-backdrop-filter` are `none` in
base. Transparent style gives large component surfaces the full glass filter
and nested controls a smaller radius so their labels and values stay crisp.

## Borders

| Token                       | Use                                            |
| --------------------------- | ---------------------------------------------- |
| `--fk-border-subtle`        | Hairline structure: dividers, card edges       |
| `--fk-border`               | Structural borders, table grid                 |
| `--fk-border-strong`        | Emphasized separation                          |
| `--fk-border-control`       | Resting control chrome (44% wash — whispers)   |
| `--fk-border-control-hover` | Control hover/focus emphasis (46% accent wash) |

Translucent control fills and borders resolve to classic `rgba(...)` values,
using internal synchronized RGB channels. This keeps their appearance and
alpha intact when a browser-to-design converter does not understand Chrome's
computed CSS Color 4 `color(srgb … / alpha)` serialization. Consumers should
continue to use the semantic tokens above; `applyAccent()` keeps the accent
channel synchronized for custom colours.

## Text

| Token                 | Use                                        |
| --------------------- | ------------------------------------------ |
| `--fk-text-primary`   | Default text                               |
| `--fk-text-secondary` | Supporting copy, descriptions              |
| `--fk-text-tertiary`  | Meta text, placeholders, micro labels only |
| `--fk-text-disabled`  | Disabled labels                            |
| `--fk-text-on-accent` | Text on solid accent fills                 |

## Accent

The accent is a **swappable seven-token slot**, restrained by default:

- **Default** — graphite (light: dark solid + white text; dark: "paper" solid
  with dark text), defined in `tokens.css`.
- **Presets** — `<html data-accent="slate | sage | mauve | sand | blue | teal | violet | rose | coral | amber">`,
  values in `accents.css`. All AA-verified in both themes.
- **Custom** — `applyAccent('#hex')` from `@presentstandards/framekit-ui` derives the full slot
  (states, tints, AA-checked text pairing) for the root's current theme. At
  the narrow white/black crossover, the generated solid is gently deepened to
  retain an AA white label instead of abruptly flipping to black; re-run it
  after a theme change. `resetAccent()` returns to the preset.
  `ACCENT_PRESETS` / `ACCENT_PRESET_COLORS` are exported for building pickers.

| Token                 | Use                                                     |
| --------------------- | ------------------------------------------------------- |
| `--fk-accent`         | Primary action fills, selection indicators              |
| `--fk-accent-hover`   | Accent hover                                            |
| `--fk-accent-active`  | Accent pressed                                          |
| `--fk-accent-subtle`  | Selected-item backgrounds, tinted wells                 |
| `--fk-accent-muted`   | Selection borders, text selection                       |
| `--fk-accent-text`    | Accent-colored text/icons on app surfaces (theme-aware) |
| `--fk-text-on-accent` | Text on solid accent fills (theme- and preset-aware)    |

## Status

`--fk-success`, `--fk-warning`, `--fk-danger` — each with `-subtle` (tint
background) and `-text` (readable on app backgrounds, theme-aware) variants,
plus AA-compliant text partners for solid fills: `--fk-text-on-success`,
`--fk-text-on-warning` (dark), and `--fk-text-on-danger` (white).

Status solids are shared across themes. In **light** mode the success and
warning solids sit below the 3:1 non-text contrast minimum against app
backgrounds — non-text indicators (dots, unbordered badges) must pair them
with a border (`--fk-border`) or use the `-text` colors for glyphs. Filled
badges carrying `--fk-text-on-*` text are always compliant.

Status is intentionally independent from the accent slot, so a custom accent
never changes the contrast pairing for success, warning, or danger. Each solid
keeps its own AA-safe `--fk-text-on-*` foreground.

## Typography

| Token       | Value | Use                       |
| ----------- | ----- | ------------------------- |
| `--fk-fs-0` | 11px  | Micro labels, badges      |
| `--fk-fs-1` | 12px  | Secondary UI, table meta  |
| `--fk-fs-2` | 13px  | Primary UI text (default) |
| `--fk-fs-3` | 15px  | Emphasized body, ledes    |
| `--fk-fs-4` | 18px  | Section headings          |
| `--fk-fs-5` | 22px  | Page headings             |
| `--fk-fs-6` | 28px  | Display                   |
| `--fk-fs-7` | 32px  | Hero display              |

Families: `--fk-font-sans` (Inter Variable — interface text), `--fk-font-mono`
(Office Code Pro — uppercase tags, micro labels, values, code; weights
300/400/500/700). Both are self-hosted and ship inside the package via
`@presentstandards/framekit-ui/fonts.css` (included automatically by `styles.css`). Weights:
400 / 500 / 600 (`--fk-fw-*`). Tracking: `--fk-tracking-label` for uppercase
micro labels, `--fk-tracking-tight` for display sizes.

## Spacing, radii, elevation, motion

- Spacing: 4px grid — `--fk-space-1`(4) → `--fk-space-10`(64).
- Radii: `--fk-radius-xs`(3 — nested) `-sm`(4 — controls) `-md`(6 — menus)
  `-lg`(8 — cards) `-full`(intrinsically round working parts only).
- Shadows: `--fk-shadow-sm|md|lg` — reserved for true elevation.
- Focus: `--fk-focus-outline` + `--fk-focus-outline-offset` (outline-based —
  survives forced-colors mode, composes with any surface or shadow).
- Scrollbars: `--fk-scrollbar-thumb`, `--fk-scrollbar-thumb-hover`.
- Motion: `--fk-ease`, `--fk-duration-fast`(120ms), `--fk-duration`(180ms).
  All motion collapses under `prefers-reduced-motion: reduce` (base.css).
