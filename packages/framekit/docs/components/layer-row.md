---
name: Layer row
status: stable
since: 0.1.0
import: import { LayerRow } from '@presentstandards/framekit-ui'
---

# Layer row

> A compact selectable row for canvas layers and saved presets, with contextual icon actions.

## When to use

- A canvas, timeline, or inspector list where one layer is currently selected.
- A preset library with named entries and small trailing metadata.
- Contextual row actions such as visibility, duplicate, export, and delete.

## When not to use

- Use `ToggleRow` for one immediate binary setting.
- Use `Dropdown` when choosing a value from a short option list.
- Use `ContextMenu` when actions should be available only from a right-click target.
- Do not put a long description or a primary workflow inside a row action strip.

## Anatomy

`LayerRow` renders a root `div`, one primary native button, and optional sibling action
buttons. The `layer` variation can include a leading type icon. The `preset` variation
uses the same row geometry without an icon.

## Props

| Prop       | Type                  | Default   | Description                                                  |
| ---------- | --------------------- | --------- | ------------------------------------------------------------ |
| `label`    | `ReactNode`           | —         | Required primary row label.                                  |
| `meta`     | `ReactNode`           | —         | Quiet trailing dimensions, type, duration, or preset family. |
| `icon`     | `ReactNode`           | —         | Leading layer-type icon; omit for a preset row.              |
| `variant`  | `'layer' \| 'preset'` | `'layer'` | Icon-led layer or text-led preset treatment.                 |
| `selected` | `boolean`             | `false`   | Marks the current row and keeps its actions visible.         |
| `disabled` | `boolean`             | `false`   | Disables the primary control and all actions.                |
| `actions`  | `LayerRowAction[]`    | `[]`      | Compact contextual actions.                                  |
| `onSelect` | `(event) => void`     | —         | Called when the primary row button is selected.              |

The component forwards its ref and standard `<div>` attributes to the root.

### `LayerRowAction`

| Field      | Type                    | Default     | Description                              |
| ---------- | ----------------------- | ----------- | ---------------------------------------- |
| `id`       | `string`                | —           | Stable, unique action identifier.        |
| `label`    | `string`                | —           | Required accessible action name.         |
| `icon`     | `ReactNode`             | —           | Icon shown in the compact action target. |
| `tone`     | `'default' \| 'danger'` | `'default'` | Standard or destructive intent.          |
| `disabled` | `boolean`               | `false`     | Disables only this action.               |
| `onSelect` | `(event) => void`       | —           | Called when the action is chosen.        |

## Tokens used

| Token                                      | Role in this component                |
| ------------------------------------------ | ------------------------------------- |
| `--fk-bg-control` / `--fk-border-control`  | Hover and keyboard focus row surface. |
| `--fk-accent-subtle` / `--fk-accent`       | Current-row fill and selection edge.  |
| `--fk-text-primary` / `--fk-text-tertiary` | Label and metadata hierarchy.         |
| `--fk-danger-subtle` / `--fk-danger-text`  | Destructive action feedback.          |
| `--fk-focus-outline`                       | Keyboard focus visibility.            |

## Keyboard & accessibility

- The primary control and each action are native buttons; Tab reaches each available control.
- The primary button exposes `aria-current="true"` when `selected`.
- Every action requires a visible-to-assistive-technology `label`; the icon is supplementary.
- Actions become visible when the row is hovered, contains keyboard focus, or is selected.
- Disabled rows disable every interactive target and retain readable, muted content.

## Examples

```tsx
import { EyeOpenIcon, ImageIcon, LayerRow, TrashIcon } from '@presentstandards/framekit-ui';

<LayerRow
  label="Hero image"
  meta="1920 × 1080"
  icon={<ImageIcon />}
  selected={selectedLayer === 'hero'}
  onSelect={() => setSelectedLayer('hero')}
  actions={[
    { id: 'visibility', label: 'Hide hero image', icon: <EyeOpenIcon />, onSelect: hideHero },
    {
      id: 'delete',
      label: 'Delete hero image',
      icon: <TrashIcon />,
      tone: 'danger',
      onSelect: deleteHero,
    },
  ]}
/>;
```

## Do / Don't

- **Do** keep one clear current row in a related collection.
- **Do** use short, mono-friendly values for metadata and accessible labels for every action.
- **Do** use `variant="preset"` for named saved states without an object-type icon.
- **Don't** make the full row and its actions nested interactive elements.
- **Don't** use the danger tone for an action that can be undone without consequence.
