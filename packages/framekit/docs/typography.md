# Frame Kit — Typography

> Usage reference for the two-family type system: when to use each scale step,
> weight, and tracking token, and the conventions the kit enforces. Raw token
> values live in [the token reference](./tokens.md).

## Families

Two families, two jobs — never mixed within a role:

| Token            | Family          | Role                                                |
| ---------------- | --------------- | --------------------------------------------------- |
| `--fk-font-sans` | Inter Variable  | All interface text — body, controls, headings       |
| `--fk-font-mono` | Office Code Pro | Uppercase UI labels; lowercase tokens, values, code |

Both are self-hosted and ship inside the package (`fonts.css`, included
automatically by `styles.css`), licensed SIL OFL with license files alongside
the woff2s in `src/fonts/`. Inter loads as a variable font (weight axis
100–900, split latin / latin-ext subsets); Office Code Pro ships four static
faces: 300, 400, 500, 700. All faces use `font-display: swap`. Each token
carries a system fallback stack, so nothing breaks before the webfonts arrive.

## Base defaults

`base.css` styles the document so plain markup is already correct:

- `body` — `--fk-font-sans` at `--fk-fs-2` (13px), `line-height: 1.5`,
  `--fk-text-primary` on `--fk-bg-app`, antialiased.
- `code`, `kbd`, `pre`, `samp` — `--fk-font-mono` automatically.
- Form controls (`button`, `input`, `select`, `textarea`) inherit font and color.
- Links — `--fk-accent-text`. Unclassed links (flowing text) are underlined for
  a non-color cue (WCAG 1.4.1); any link carrying a class (nav item,
  button-as-link) opts out.
- `::selection` — `--fk-accent-muted` behind `--fk-text-primary`.

## Scale

Eight steps, tuned for dense tool UIs. Use the steps as-is — no in-between
sizes.

Roles and pixel values live in [the token reference](./tokens.md); what this
doc adds is the convention attached to each step:

| Token       | Convention                                           |
| ----------- | ---------------------------------------------------- |
| `--fk-fs-0` | Mono territory — always via the Tag recipe (below)   |
| `--fk-fs-1` | Also the size for mono values                        |
| `--fk-fs-2` | The workhorse — the body default                     |
| `--fk-fs-3` | Regular weight; emphasis comes from size, not weight |
| `--fk-fs-4` | Semibold                                             |
| `--fk-fs-5` | Semibold + `--fk-tracking-tight`                     |
| `--fk-fs-6` | Semibold + `--fk-tracking-tight`                     |
| `--fk-fs-7` | Semibold + `--fk-tracking-tight`                     |

Two rules fall out of the specimens:

- Headings from `--fk-fs-4` (18px) up take `--fk-fw-semibold`.
- Sizes from `--fk-fs-5` (22px) up also take `--fk-tracking-tight`.

## Weights

| Token              | Value | Use                                     |
| ------------------ | ----- | --------------------------------------- |
| `--fk-fw-regular`  | 400   | Body and interface text — the default   |
| `--fk-fw-medium`   | 500   | Emphasis within UI text; the Tag recipe |
| `--fk-fw-semibold` | 600   | Headings (`--fk-fs-4` and up)           |

The weight tokens describe Inter. Office Code Pro ships 300 (Light), 400
(Regular), 500 (Medium), and 700 (Bold) as static faces — `--fk-fw-regular`
and `--fk-fw-medium` resolve to real faces there too; 300 and 700 have no
token and are reached with literal values when a specimen calls for them.
Bold (700) is not part of any kit recipe — tags sit at medium, values at
regular.

## Tracking

| Token                 | Use                                                      |
| --------------------- | -------------------------------------------------------- |
| `--fk-tracking-label` | Uppercase micro labels — inseparable from the Tag recipe |
| `--fk-tracking-tight` | Display sizes, `--fk-fs-5` and up                        |

Everything else uses the font's default tracking. Never track lowercase body
text.

## The Tag recipe — uppercase micro-labels

The canonical uppercase treatment is the [Tag](./components/tag.md) primitive
(`.fk-tag`): `--fk-font-mono` + `--fk-fs-0` + `--fk-fw-medium` +
`--fk-tracking-label` + `uppercase` + `line-height: 1`, tertiary color by
default plus `secondary`, `primary`, and `accent` tones.

**When text must be a Tag:** every uppercase micro-label — section eyebrows and
kickers, field/inspector labels, unit suffixes, small metadata, panel
micro-headers. In new work, route them through `<Tag>` or the bare `.fk-tag`
class rather than re-declaring the mono/uppercase/tracking recipe inline. Kit
components compose it internally ([Input](./components/input.md) labels,
ColorField popover header, [SegmentedSwitch](./components/segmented-switch.md)
options). A handful of shipped micro-labels still hand-roll the recipe (for
example the Stepper unit suffix and Layer-row meta) — treat those as migration
debt, not precedent.

**When text stays plain:** body and interface copy — Inter at the scale, never
uppercase. Real headings are `<h*>` elements at `--fk-fs-4`+, not Tags. If the
text is a sentence, it is not a tag.

## Mono conventions

Office Code Pro's case signals what the text _is_:

- **Uppercase** — UI labels and branding (the Tag recipe).
- **Lowercase preserved** — tokens, values, and code. Never uppercase a literal.

Established mono specimens from the docs app:

| Specimen    | Recipe                                                                        |
| ----------- | ----------------------------------------------------------------------------- |
| Eyebrow     | Tag, `accent` tone                                                            |
| Micro label | Tag, default `tertiary` tone                                                  |
| Badge       | mono 8px, 16px high, `--fk-accent-subtle`, hairline accent border, 3px radius |
| Value       | mono · `--fk-fs-1` · regular · `--fk-text-secondary`                          |

Pill radius (`--fk-radius-full`) is reserved for intrinsically rounded working
parts — toggle tracks, slider and scrubber handles — never for labels or
decoration (see [principles](./principles.md)). Status badges use the compact
square `--fk-radius-xs` treatment shared by Beta and Coming soon. Values
(dimensions, frame counts, settings readouts) sit one step up from tags at
`--fk-fs-1`, lowercase, untracked.
