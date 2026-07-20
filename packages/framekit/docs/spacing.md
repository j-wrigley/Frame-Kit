# Frame Kit — Spacing

> Usage rules for the 4px spacing grid and the radius scale: which step goes
> where, the metrics shipped controls share, and how radii nest. Raw values
> live in [the token reference](./tokens.md).

## The grid

Every gap sits on a 4px base grid — ten steps, `--fk-space-1` (4px) through
`--fk-space-10` (64px). If a gap isn't on the grid, it's wrong.

The grid disciplines _space between things_: gaps, stack rhythm, panel and page
padding. A control's internal metrics — its height, its optical inline padding —
are tuned per component spec and may sit off-grid (the default
[Button](./components/button.md) is 30px tall with 10px inline padding). Those
are deliberate component constants, not layout values; never borrow them as
spacing.

## Step roles

The scale splits into three registers. Small steps live inside components,
middle steps lay out panels, large steps set page rhythm.

| Token           | px  | Reach for it when                                                                                                                                      |
| --------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--fk-space-1`  | 4   | Tightest gaps inside a control: `sm` icon–label gaps, segments of a composite field                                                                    |
| `--fk-space-2`  | 8   | The workhorse — inline padding of compact controls (`padding: 0 var(--fk-space-2)`), gaps between icon and label, between controls in a cluster or row |
| `--fk-space-3`  | 12  | Panel-interior padding (popover and hover-card bodies), `lg` control padding, gaps between groups inside a panel                                       |
| `--fk-space-4`  | 16  | Panel padding at comfortable density; gaps between sibling groups                                                                                      |
| `--fk-space-5`  | 20  | Roomier panel padding; separation between unrelated clusters                                                                                           |
| `--fk-space-6`  | 24  | Section separation; the viewport clamp for floating surfaces                                                                                           |
| `--fk-space-7`  | 32  | Gaps between major page regions                                                                                                                        |
| `--fk-space-8`  | 40  | Page-level rhythm between large sections                                                                                                               |
| `--fk-space-9`  | 48  | Page gutters, generous section spacing                                                                                                                 |
| `--fk-space-10` | 64  | The largest break — hero spacing, page-scale breathing room                                                                                            |

In shipped component CSS, `--fk-space-1` through `--fk-space-3` do nearly all
the work — density is the point ([principles](./principles.md) §1). Steps 4–10
belong to the consuming app's layout, not to controls.

## Control metrics

Sized components share one height vocabulary, set through per-component custom
properties (`--fk-button-height`, `--fk-input-height`, …):

| Size | Height |
| ---- | ------ |
| `sm` | 24px   |
| `md` | 30px   |
| `lg` | 34px   |

[Button](./components/button.md), [Input](./components/input.md), and
[Stepper](./components/stepper.md) ship all three heights;
[Segmented Switch](./components/segmented-switch.md) stops at `sm`/`md`
(24/30px). Inline padding is optical, per component spec — Button md is 10px,
Button sm `--fk-space-2`, Input sm 6px — so borrow heights, never paddings.
[Toolbar](./components/toolbar.md)'s `large` variant promotes nested buttons to
the 34px height so they fill the bar (the default `compact` bar leaves them at
their own height). [Context Menu](./components/context-menu.md) items rest at a
30px minimum — the same md line. Mixed rows of md controls align by
construction; don't stretch one control to match another.

## Radii

Sharp and nested — 3/4/6/8px. The step you pick states what the element _is_:

| Token              | px   | Use                                                                                            |
| ------------------ | ---- | ---------------------------------------------------------------------------------------------- |
| `--fk-radius-xs`   | 3    | Nested elements: menu items, checkboxes, chips, tracks, thumbs                                 |
| `--fk-radius-sm`   | 4    | Controls: buttons, fields, tabs, toolbars                                                      |
| `--fk-radius-md`   | 6    | Menus, popovers, picker panels                                                                 |
| `--fk-radius-lg`   | 8    | Cards, dialogs                                                                                 |
| `--fk-radius-full` | 9999 | Working parts that are genuinely round: toggle and slider tracks, drag handles, indicator dots |

Pill shape is never decoration ([principles](./principles.md)): in shipped CSS
`--fk-radius-full` appears only where the element is intrinsically a pill or a
circle — the [Toggle](./components/toggle.md) track, slider tracks and thumbs,
wheel handles, dots — plus badge chrome when a design calls for it.

## Nesting radii

Inner corners are always tighter than the surface that holds them, so nested
elements read as seated, not stacked:

- One step down is the default: a `--fk-radius-sm` control holds
  `--fk-radius-xs` inner elements — the Segmented Switch thumb inside its
  frame, contained [Tabs](./components/tabs.md) (`xs` tab buttons inside the
  `sm` track), a `--fk-radius-md` menu panel (4px padding) holding
  `--fk-radius-xs` items.
- When a full step is too coarse, derive concentrically from the parent:
  `border-radius: calc(var(--fk-radius-sm) - 2px)`
  ([Loop Composer](./components/loop-composer.md) chips inside a `sm` well).

## Floating surfaces

[Popover](./components/popover.md) and
[Hover Card](./components/hover-card.md) clamp themselves to the viewport with
`--fk-space-6`:

```css
width: min(var(--fk-popover-width), calc(100vw - var(--fk-space-6)));
max-height: calc(100vh - var(--fk-space-6));
```

That reserves 12px of breathing room per edge. Their body padding is
`--fk-space-3` — panel-interior scale, consistent with every other panel.
