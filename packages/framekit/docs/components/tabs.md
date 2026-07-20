---
name: Tabs
status: stable
since: 0.1.0
import: import { Tabs } from '@presentstandards/framekit-ui'
---

# Tabs

> A keyboard-navigable view switcher for related workspace, panel, and inspector content.

## When to use

- Switching between a short, stable set of related views in one region.
- Workspace areas such as storyboard, layers, and assets.
- Inspector views such as Design, Prototype, and Inspect.

## When not to use

- A mutually exclusive setting such as frame rate or aspect ratio — use
  [SegmentedSwitch](./segmented-switch.md).
- Independent selection — use [Checks & radios](./checks-and-radios.md).
- A long, changing, or deeply nested navigation structure — use a sidebar or menu.

## Anatomy

`Tabs` renders a `tablist` of native buttons. Each item may have a leading icon,
label, and trailing meta value. When every item supplies `content`, the component
also renders linked `tabpanel` elements immediately after the strip.

## Props

| Prop             | Type                                   | Default       | Description                                                                   |
| ---------------- | -------------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `items`          | `TabItem[]`                            | —             | Required, unique `{ value, label, icon?, meta?, content?, disabled? }` items. |
| `value`          | `string`                               | —             | Controlled selected value.                                                    |
| `defaultValue`   | `string`                               | first enabled | Initial uncontrolled selected value.                                          |
| `onValueChange`  | `(value: string) => void`              | —             | Called when an enabled tab is selected.                                       |
| `variant`        | `'underline' \| 'contained' \| 'soft'` | `'underline'` | Workspace line, compact panel well, or light existing-surface treatment.      |
| `size`           | `'sm' \| 'md'`                         | `'md'`        | Tab height: 28 / 34px.                                                        |
| `fullWidth`      | `boolean`                              | `false`       | Divides the available width equally between tabs.                             |
| `activationMode` | `'automatic' \| 'manual'`              | `'automatic'` | Whether arrow-key focus changes the selected view immediately.                |

The component forwards its ref and standard `<div>` attributes to the `tablist`.
Name it with `aria-label` or `aria-labelledby`.

## Tokens used

| Token                                        | Role in this component               |
| -------------------------------------------- | ------------------------------------ |
| `--fk-bg-control` / `--fk-bg-control-hover`  | Contained shell and hover feedback.  |
| `--fk-bg-raised`                             | Selected contained tab.              |
| `--fk-border-subtle` / `--fk-border-control` | Underline track and contained shell. |
| `--fk-accent` / `--fk-accent-text`           | Selected underline and text signal.  |
| `--fk-accent-subtle`                         | Selected soft tab.                   |
| `--fk-focus-outline`                         | Keyboard focus visibility.           |

## Keyboard & accessibility

- The root is a `tablist`; items are native buttons with `role="tab"` and a
  roving Tab stop.
- Left/Right (and Up/Down) move between enabled tabs. Home and End jump to the
  first and last enabled tabs.
- `activationMode="automatic"` selects on arrow-key focus. With
  `activationMode="manual"`, use Enter or Space to select the focused tab.
- Disabled tabs cannot be selected or focused.
- When all items provide `content`, each tab receives `aria-controls` and its
  linked `tabpanel` receives `aria-labelledby`.

## Examples

```tsx
import { Tabs } from '@presentstandards/framekit-ui';

<Tabs
  aria-label="Project workspace"
  items={[
    {
      value: 'storyboard',
      label: 'Storyboard',
      meta: '12',
      content: <StoryboardPanel />,
    },
    {
      value: 'layers',
      label: 'Layers',
      meta: '48',
      content: <LayersPanel />,
    },
  ]}
  value={view}
  onValueChange={setView}
/>;
```

## Do / Don't

- **Do** use stable, short labels for a small set of related views.
- **Do** use `underline` for workspace views, `contained` in dense panels, and
  `soft` inside existing cards or inspector headers.
- **Do** use manual activation when a panel takes noticeable time to render.
- **Don't** use tabs as a general setting control or for a large, changing list.
