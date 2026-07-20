---
name: Button
status: stable
since: 0.1.0
import: import { Button } from '@presentstandards/framekit-ui'
---

# Button

> The command button — the primary action control across a tool UI. Text, with
> optional icons, in four weights and three sizes.

## When to use

- Any discrete command: **Export**, **Add layer**, **Delete**, **Cancel**.
- Toolbar and panel actions, dialog footers, empty-state calls to action.

## When not to use

- Navigation between pages/views — use a link.
- A binary on/off setting — use a switch or checkbox.

## Icon-only

Pass an icon with no label and the button renders square (height × height). It
**requires** an `aria-label`, since there is no text to name it:

```tsx
<Button variant="ghost" iconStart={<GearIcon />} aria-label="Settings" />
```

## Anatomy

Renders a native `<button>` (`fk-button`) wrapping a content row
(`fk-button__content`) of optional start icon, label, and optional end icon.
While `loading`, a centered `Loader` overlays the hidden content so
width never shifts.

## Interaction motion

Button motion is included in the packaged stylesheet. On a fine pointer, an
available button scales by 1% with the kit's smallest neutral shadow; pressing
settles it by 1.5%. The treatment is deliberately uniform across variants, so
the interface remains flat and calm. Loading content cross-fades to a centered
loader without changing the button width. All motion observes the kit's
reduced-motion setting.

## Props

| Prop        | Type                                              | Default       | Description                                          |
| ----------- | ------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `variant`   | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'secondary'` | Visual weight.                                       |
| `size`      | `'sm' \| 'md' \| 'lg'`                            | `'md'`        | Control height (24 / 30 / 34px).                     |
| `iconStart` | `ReactNode`                                       | —             | Icon before the label.                               |
| `iconEnd`   | `ReactNode`                                       | —             | Icon after the label.                                |
| `loading`   | `boolean`                                         | `false`       | Shows a loader and blocks activation; width is kept. |
| `loader`    | `LoaderVariant`                                   | `'grid'`      | Loader pattern while `loading`.                      |
| `fullWidth` | `boolean`                                         | `false`       | Stretches to fill the container.                     |
| `disabled`  | `boolean`                                         | `false`       | Native disabled state.                               |

Extends all native `<button>` attributes (`onClick`, `type`, `form`, …).
Forwards `ref` to the `<button>`; `type` defaults to `"button"`.

## Variants

- **primary** — the one affirmative action in a view (accent fill).
- **secondary** — the default; standard commands (neutral control fill + border).
- **ghost** — low-emphasis actions, toolbar and row actions (transparent).
- **danger** — destructive confirmation (solid red).

Use exactly one `primary` per view. Everything else is `secondary` or `ghost`.

## Tokens used

| Token                                                            | Role                           |
| ---------------------------------------------------------------- | ------------------------------ |
| `--fk-accent` / `-hover` / `-active`                             | primary fill states            |
| `--fk-bg-control` / `-hover` / `-active`                         | secondary & ghost fill states  |
| `--fk-danger` / `-hover` / `-active`                             | danger fill states             |
| `--fk-border-control` / `--fk-border-control-hover`              | secondary outline (rest/hover) |
| `--fk-text-primary` / `-secondary` / `-on-accent` / `-on-danger` | labels                         |
| `--fk-text-disabled` / `--fk-bg-control` / `--fk-border-subtle`  | disabled state                 |
| `--fk-radius-sm`, `--fk-fs-2`, `--fk-space-*`                    | shape, type, spacing           |

## Keyboard & accessibility

- Native `<button>`: `Enter` / `Space` activate; focus ring is the kit's
  outline (`--fk-focus-outline`).
- `loading` blocks activation via `aria-disabled` + `aria-busy` (not native
  `disabled`), so the button stays focusable and keeps its accessible name —
  focus is never dropped mid-interaction. Announce completion from your own
  live region if the result isn't otherwise visible.
- Icon-only usage requires an `aria-label`; passed icons are `aria-hidden` by
  default (see the Icons foundation).

## Examples

```tsx
import { Button, PlusIcon, TrashIcon, ArrowRightIcon } from '@presentstandards/framekit-ui';

<Button variant="primary">Export</Button>
<Button iconStart={<PlusIcon />}>Add layer</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger" iconStart={<TrashIcon />}>Delete</Button>
<Button variant="primary" loading>Saving</Button>
<Button loading loader="bars">Processing</Button>
<Button fullWidth iconEnd={<ArrowRightIcon />}>Continue</Button>
```

## Do / Don't

- **Do** keep one `primary` per view; reach for `secondary`/`ghost` otherwise.
- **Do** pair `danger` with a confirmation step for irreversible actions.
- **Don't** use uppercase button labels — sentence case in Inter. Uppercase is
  reserved for tags and micro-labels (Office Code Pro).
- **Don't** disable a button as the only feedback for a pending action — use
  `loading`.
