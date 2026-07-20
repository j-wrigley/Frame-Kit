---
name: DropZone
status: stable
since: 0.1.0
import: import { DropZone } from '@presentstandards/framekit-ui'
---

# DropZone

> A general-purpose transfer target for creative tools. It receives the full
> `DataTransfer` payload rather than assuming files, so it can accept layers,
> clips, URLs, text, assets, or future application-specific data.

## When to use

- Importing or adding content into a canvas, timeline, composition, or panel.
- Replacing a source where the host may accept several payload kinds.
- Giving a drag action a visible, keyboard-equivalent source chooser.

## When not to use

- A one-click command with no transferable payload — use [Button](./button.md).
- A compact single setting — use [Input](./input.md), [Dropdown](./dropdown.md),
  or [Popover](./popover.md) instead.

## Anatomy

`fk-drop-zone` is a dashed, token-driven surface. It centers a small transfer
icon and one quiet instruction; optional supporting detail and an action hint
are available only when the host needs them. `fk-drop-zone--dragging` moves the
surface into the accent state; no payload type is encoded in the visual
treatment.

## Props

| Prop                | Type                               | Default               | Description                                                    |
| ------------------- | ---------------------------------- | --------------------- | -------------------------------------------------------------- |
| `label`             | `ReactNode`                        | `'Drop content here'` | Primary instruction.                                           |
| `description`       | `ReactNode`                        | —                     | Quiet supporting detail.                                       |
| `activeLabel`       | `ReactNode`                        | `'Release to add'`    | Instruction shown while a payload is held over the zone.       |
| `actionLabel`       | `ReactNode`                        | —                     | Optional quiet hint for `onAction`.                            |
| `icon`              | `ReactNode`                        | upload glyph          | Replaces the neutral transfer icon.                            |
| `size`              | `'sm' \| 'md' \| 'lg'`             | `'md'`                | Compact / panel / primary-transfer density.                    |
| `disabled`          | `boolean`                          | `false`               | Blocks dropping and the optional action.                       |
| `busy`              | `boolean`                          | `false`               | Shows progress and temporarily blocks interaction.             |
| `onDrop`            | `(transfer: DataTransfer) => void` | —                     | Receives all browser transfer data, not only `transfer.files`. |
| `onAction`          | `() => void`                       | —                     | Opens the consumer-owned source chooser.                       |
| `onDragStateChange` | `(isDragging: boolean) => void`    | —                     | Coordinates host UI with drag presence.                        |

The component forwards its ref and standard `<div>` attributes to the root.
`onDrop` intentionally replaces the DOM event callback with the complete
`DataTransfer` object. This keeps the API focused on the data the host needs.

## Tokens used

| Token                                              | Role                                 |
| -------------------------------------------------- | ------------------------------------ |
| `--fk-bg-control` / `--fk-bg-control-hover`        | Resting and hover surface            |
| `--fk-border-strong` / `--fk-border-control-hover` | Dashed boundary and hover emphasis   |
| `--fk-accent-subtle` / `--fk-accent`               | Active drag state                    |
| `--fk-bg-raised` / `--fk-border-control`           | Icon tile                            |
| `--fk-focus-outline`                               | Keyboard focus                       |
| `--fk-font-sans` / `--fk-font-mono`                | Instruction and optional action hint |

## Keyboard & accessibility

- With `onAction`, the zone receives `role="button"` and `tabIndex="0"`.
- Enter and Space run `onAction`; click does the same.
- `busy` and `disabled` apply `aria-disabled`; `busy` also applies `aria-busy`.
- Drag-only flows should provide an equivalent `onAction` or adjacent control
  for keyboard and touch users.

## Examples

```tsx
import { DropZone } from '@presentstandards/framekit-ui';

<DropZone
  label="Add to composition"
  onDrop={(transfer) => acceptTransfer(transfer)}
  onAction={() => openSourceChooser()}
/>

<DropZone
  size="sm"
  label="Replace source"
  onAction={() => chooseReplacement()}
/>
```

## Do / Don't

- **Do** inspect `DataTransfer.items`, `files`, and text data in the host—the
  accepted payload belongs to the application.
- **Do** keep `onAction` available when drag is not reachable.
- **Don't** imply that only files are valid unless the host truly requires them.
