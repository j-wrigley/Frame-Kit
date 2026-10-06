---
name: Node row
status: stable
since: 0.3.0
import: import { NodeRow, NodeRows } from '@presentstandards/framekit-ui'
---

# Node row

> One setting in a node card: a label | control row, sized like a sidebar row, with its socket in the row it drives or emits.

## When to use

- The body of a node card on a graph canvas, where each setting has its own socket (`placement="edge"`).
- A properties or list view of the same node, with sockets in a leading gutter (`placement="gutter"`).
- Output rows (a live readout beside an output socket), flow rows (In … Out), and through rows (an input and an output on one value).

## When not to use

- Use [SidebarSection](./sidebar.md) rows when nothing on the surface can be wired.
- Use [NodeCanvas](./node-canvas.md) for a small self-contained patch with port lists and built-in dragging.
- Do not add a separate band of sockets above or below the controls. The socket belongs on the row.

## Anatomy

`NodeRows` is the body grid (`.fk-node-rows`). Every `NodeRow` inside it is a CSS subgrid, so the
longest visible label sizes one shared label column for the whole card, up to `maxLabelWidth`.
Any other child (a group heading, a hint) spans the full width.

`NodeRow` (`.fk-node-row`) renders:

- `.fk-node-row__label`: the setting name (11px, secondary). A string label is also its `title`.
- `.fk-node-row__control`: the control column, a flex row with a 6px gap. Controls share it; a lone control spans it. Give a fixed-width companion (such as a 56px field beside a slider) `flex: 0 0 56px`. `ColorField`, which has no `sm` size, is sized to the 24px row here.
- `.fk-node-row__output-label` and `.fk-node-row__meta`: optional output name and mono readout, packed to the end beside the output socket.
- `.fk-node-row__socket--in` / `--out`: zero-width slots that centre the `input` and `output` sockets on the card edge or in the gutter.

Sockets are centred by layout, never by transform, so `offsetTop + offsetHeight / 2` of a socket
is its true centre even inside a `scale(zoom)` workspace. Measure wire anchors that way:

- **y**: sum `offsetTop` from the socket up the `offsetParent` chain to the card, adding each
  parent's `clientTop` on the way (offsets are measured to the parent's padding edge, so the
  card's 1px border would otherwise put every anchor a pixel high).
- **x**: take it from the card edge, not from the DOM. Edge sockets are centred on the 1px
  border, half a pixel inside the card's box (`left + 0.5`, `right − 0.5`), and `offsetLeft`
  rounds that half pixel away. On a zoomed-out canvas (`--fk-node-socket-zoom` below 0.875) the
  grown socket sits further out by `(grow − 1) × 5.5px`, where
  `grow = clamp(1, 0.875 / zoom, 2.5)`: move the wire end out by the same amount.

### Placement

| Placement | Where sockets sit                                                                                        | Body padding                           |
| --------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `edge`    | Centred on the card's 1px border at the row's midline; inputs left, outputs right.                       | `8px 10px 10px` (owned by `NodeRows`). |
| `gutter`  | Centred in a 14px leading gutter (and a trailing one when any row has an output). Every row reserves it. | `0 0 0 20px`.                          |

In `edge` placement the socket centre sits `--fk-node-row-socket-inset` (10.5px: the body padding
plus half the border) outside each row. Override it if your card shell has a different border.
The card shell must not clip: leave it `overflow: visible` and round its header's top corners
itself (clip an inner wrapper if body content needs it). Half of every edge socket, and more of
its hit pad at low zoom, lies outside the card. `overflow: clip` with `overflow-clip-margin`
still paints there, but once the card is positioned with a `transform` Chromium does not
hit-test outside its border box, so the outer half of each socket looks live and is dead.

### Row layouts

| Layout     | How                                                            | Result                                                            |
| ---------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Setting    | `label` + control as children                                  | Label column, control column.                                     |
| Full-width | No `label`                                                     | The control spans both columns.                                   |
| Wide       | `label` + `wide`                                               | Label on its own line; the control spans both columns below it.   |
| Tall       | `tall`                                                         | Label and sockets pin to the first 24px line of a taller control. |
| Output     | `outputLabel`, `meta`, `output` (no `label`)                   | Name and readout packed to the right, beside the output socket.   |
| Flow       | `label="In"`, children, `outputLabel="Out"`, `input`, `output` | `■ In  photo.jpg  Out ■`.                                         |
| Through    | `label`, control, `input`, `output`                            | `● Text [value] ●`: one value with an input and an output.        |

### States

| State       | Prop         | Appearance                                                                                                                                                                                                                                                                            |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hover       | —            | The label turns primary; an open socket in the row takes the accent stroke.                                                                                                                                                                                                           |
| Driven      | `driven`     | The application disables the control; its value and `meta` show in accent text instead of looking unavailable. For a `SegmentedSwitch`, disable only the options that are not current: a disabled option cannot be the selected one, and the current segment already reads in accent. |
| Inactive    | `inactive`   | 40% opacity. For a setting that is wired, animated, or changed but not used with the current settings.                                                                                                                                                                                |
| Animated    | `animated`   | A 5px diamond after the label. Not interactive.                                                                                                                                                                                                                                       |
| Drop target | `dropTarget` | A 1px accent outline and a primary label: the row under the pointer while a compatible wire is dropped.                                                                                                                                                                               |

## Props

### `NodeRows`

| Prop            | Type                 | Default  | Description                                                                  |
| --------------- | -------------------- | -------- | ---------------------------------------------------------------------------- |
| `placement`     | `'edge' \| 'gutter'` | `'edge'` | Socket placement for every row inside.                                       |
| `maxLabelWidth` | `number`             | `96`     | Upper bound of the shared label column in pixels. Use `72` on compact cards. |

Forwards `ref`; spreads rest props onto the root `div`.

### `NodeRow`

| Prop          | Type                 | Default   | Description                                                                                     |
| ------------- | -------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `label`       | `ReactNode`          | —         | Visible setting name. Omit it and the control spans the full row.                               |
| `labelProps`  | `NodeRowLabelProps`  | —         | Props for the label element, such as scrub handlers plus `data-scrub` for the scrub cursor.     |
| `children`    | `ReactNode`          | —         | The control column: Frame Kit `sm` controls.                                                    |
| `outputLabel` | `ReactNode`          | —         | Names the output side, beside the output socket. Never shrinks: text beside it truncates first. |
| `meta`        | `ReactNode`          | —         | Quiet mono readout after the output label.                                                      |
| `input`       | `ReactNode`          | —         | Input socket, normally a `NodeSocket`.                                                          |
| `output`      | `ReactNode`          | —         | Output socket, normally a `NodeSocket`.                                                         |
| `placement`   | `'edge' \| 'gutter'` | inherited | Overrides the placement from `NodeRows`; `'edge'` outside one.                                  |
| `wide`        | `boolean`            | `false`   | Label on its own line, control full width below.                                                |
| `tall`        | `boolean`            | `false`   | Pins the label and sockets to the first 24px line.                                              |
| `driven`      | `boolean`            | `false`   | The value is driven by a wire.                                                                  |
| `inactive`    | `boolean`            | `false`   | The setting is not used with the current settings.                                              |
| `animated`    | `boolean`            | `false`   | The value is animated.                                                                          |
| `dropTarget`  | `boolean`            | `false`   | The pointer is over this row with a compatible wire.                                            |

Forwards `ref`; spreads rest props (including your own `data-*` drop-target attributes) onto the root `div`.

## Tokens used

| Token                                           | Role in this component                      |
| ----------------------------------------------- | ------------------------------------------- |
| `--fk-text-secondary` / `--fk-text-primary`     | Label at rest and on hover.                 |
| `--fk-text-tertiary`                            | `meta` readout.                             |
| `--fk-accent-text`                              | Driven value, animated diamond.             |
| `--fk-accent`                                   | Drop-target outline; hovered socket stroke. |
| `--fk-fs-0`, `--fk-font-sans`, `--fk-font-mono` | Label, output label, and readout type.      |
| `--fk-radius-sm`                                | Drop-target outline corners.                |

## Keyboard & accessibility

- The row is a layout container; it adds no roles or focus stops. Every control keeps its own accessible name. Point a control's `aria-labelledby` at `labelProps.id` when the visible label is its name.
- Source order follows what the row shows: the input slot comes first, then the label and control, then the output slot. A focusable socket (`as="button"`) is therefore reached before its row's control and after the previous row's, never out of step with the card.
- A driven control must be disabled (or read-only) by the application, so it cannot be edited while the wire owns it. Say why in its tooltip ("Driven by Wave 1"). When the application also names the driver in the row (a `Node` tag, for a wire that is not drawn), put the tag before the control: who supplies the value, then the value.
- A list that is an input's contents (a mask's shapes) goes in a `wide` row as boxed items on the control surface, so its items never read as more setting rows. Put the list's count at the end of the label line.
- An inactive row should explain itself in its `title` ("Not used with the current settings").
- A drag-to-scrub label is a pointer convenience. Keep the number field beside it for keyboard entry and arrow-key nudging.

## Examples

```tsx
import {
  Input,
  NodeRow,
  NodeRows,
  NodeSocket,
  SegmentedSwitch,
} from '@presentstandards/framekit-ui';

<NodeRows placement="edge">
  <NodeRow
    label="In"
    outputLabel="Out"
    input={<NodeSocket as="button" lane="pixels" connected aria-label="Connect In" />}
    output={<NodeSocket as="button" lane="pixels" connected aria-label="Drag to connect Out" />}
  >
    <span>photo.jpg</span>
  </NodeRow>
  <NodeRow label="Style" input={<NodeSocket as="button" aria-label="Connect Style" />}>
    <SegmentedSwitch
      size="sm"
      aria-label="Style"
      value={style}
      onValueChange={setStyle}
      options={[
        { value: 'mono', label: 'Mono' },
        { value: 'duotone', label: 'Duotone' },
        { value: 'cmyk', label: 'CMYK' },
      ]}
    />
  </NodeRow>
  <NodeRow
    label="Cell size"
    driven={cellSizeIsWired}
    input={<NodeSocket as="button" connected={cellSizeIsWired} aria-label="Connect Cell size" />}
  >
    <Input size="sm" aria-label="Cell size" value={cellSize} disabled={cellSizeIsWired} />
  </NodeRow>
</NodeRows>;
```

## Do / Don't

- **Do** keep one setting per row, with its socket on that row.
- **Do** use Frame Kit `sm` controls (24px) so cards read like the sidebar.
- **Do** keep rows that are wired, animated, or changed from their default visible, even when a card hides other settings.
- **Don't** fix the label column width; let the longest visible label size it.
- **Don't** position sockets with transforms or measure them with `getBoundingClientRect` inside a zoomed canvas.
