---
name: Value graph
status: stable
since: 0.1.0
import: import { ValueGraph } from '@presentstandards/framekit-ui'
---

# Value graph

> A multi-channel animation curve editor. One channel — position, scale, rotation, or opacity —
> stays directly editable while the other channels render behind it as quiet timing context.

## When to use

- Graph-editor views where a property's keyed values need shaping over normalised time.
- Motion inspectors that show how one channel's curve relates to the others on the same layer.
- Anywhere key points need direct manipulation: drag to move, double-click to add, keyboard to nudge.

## When not to use

- A single easing between two keyframes — use [Easing graph](./easing-graph.md).
- Keyframe timing without values — use [Keyframe lane](./keyframe-lane.md).
- Tonal or colour response curves — use [Tone curve](./tone-curve.md).

## Anatomy

Renders a root `<div>` (`fk-value-graph`, `role="group"`) containing one responsive SVG canvas
(`fk-value-graph__canvas`, 360×188 viewBox). Inside the canvas: a plot surface
(`fk-value-graph__surface`), a 5×5 gridline layer (`fk-value-graph__grid`), a dashed zero line
(`fk-value-graph__zero`), the non-active channel curves
(`fk-value-graph__curve--context`), the active channel curve
(`fk-value-graph__curve--active`), and one focusable group per active-channel point
(`fk-value-graph__point`) holding a hit circle, focus ring, and marker
(`fk-value-graph__point-hit` / `__point-focus` / `__point-marker`). When `editable` is off or
`disabled` is on, the root gains `fk-value-graph--readonly`.

Curves are drawn as smooth cubic segments between points. First and last points are pinned to
time `0` and `1` — only their values move. Interior points keep a minimum time gap of `0.055`
from their neighbours, both while dragging and when input data is normalised.

## Props

| Prop                   | Type                                  | Default                   | Description                                                 |
| ---------------------- | ------------------------------------- | ------------------------- | ----------------------------------------------------------- |
| `value`                | `ValueGraphChannels`                  | —                         | Controlled key points for every animation channel.          |
| `defaultValue`         | `ValueGraphChannels`                  | Built-in demo curves      | Initial key points for every channel when uncontrolled.     |
| `onValueChange`        | `(value: ValueGraphChannels) => void` | —                         | Called after moving, adding, or removing a key point.       |
| `activeChannel`        | `ValueGraphChannel`                   | —                         | Channel that receives direct point edits.                   |
| `defaultActiveChannel` | `ValueGraphChannel`                   | `'position'`              | Channel that receives direct point edits when uncontrolled. |
| `activePointId`        | `string \| null`                      | —                         | Controlled selected point identifier in the active channel. |
| `defaultActivePointId` | `string \| null`                      | `null`                    | Initial selected point identifier when uncontrolled.        |
| `onActivePointChange`  | `(id: string \| null) => void`        | —                         | Called after the active point changes.                      |
| `showOtherChannels`    | `boolean`                             | `true`                    | Shows non-active channel curves in the background.          |
| `editable`             | `boolean`                             | `true`                    | Enables direct point editing.                               |
| `disabled`             | `boolean`                             | `false`                   | Disables interaction and mutes the graph.                   |
| `step`                 | `number`                              | `0.01`                    | Arrow-key increment. Hold Shift for five increments.        |
| `label`                | `string`                              | `'Animation value graph'` | Accessible component name.                                  |

Extends `HTMLAttributes<HTMLDivElement>` (minus `defaultValue` and `onChange`); forwards `ref`
and spreads rest props onto the root `<div>`. The component never changes the channel itself —
switch channels from a parent control via `activeChannel`.

```ts
type ValueGraphChannel = 'position' | 'scale' | 'rotation' | 'opacity';

type ValueGraphPoint = {
  id: string; // stable identifier
  time: number; // normalised 0 to 1
  value: number; // normalised -1 to 1
};

type ValueGraphChannels = Record<ValueGraphChannel, ValueGraphPoint[]>;
```

Incoming data is normalised: points are clamped and sorted by time, endpoints are pinned to
`0`/`1`, and a channel with fewer than two points falls back to the built-in demo curve for
that channel. Emitted values are rounded to three decimal places.

## Tokens used

| Token                 | Role in this component                              |
| --------------------- | --------------------------------------------------- |
| `--fk-bg-control`     | Plot surface fill                                   |
| `--fk-border-control` | Plot surface outline                                |
| `--fk-text-tertiary`  | Gridlines, zero line, and context curves (faded)    |
| `--fk-accent`         | Active curve, point outlines, selection, focus ring |
| `--fk-bg-raised`      | Resting point marker fill                           |

## Keyboard & accessibility

- Root is `role="group"` named by `label`; the SVG carries the same `aria-label`.
- Each active-channel point is a focusable `role="slider"` (`tabIndex={0}` while editable and not disabled)
  named by `aria-label` ("Position key point 2"), with `aria-valuemin={-1}`,
  `aria-valuemax={1}`, `aria-valuenow`, and an `aria-valuetext` that reads time
  and value (`Time 0.24, value 0.46`). Non-editable points get `aria-disabled`.
- <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> move the focused point in time;
  <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> move its value. Hold <kbd>Shift</kbd> for five
  increments of `step`.
- <kbd>Home</kbd> snaps the focused point's value to `0` (the zero line).
- <kbd>Delete</kbd> or <kbd>Backspace</kbd> removes the focused point; endpoints cannot be
  removed. Selection moves to the previous point.
- Pointer: drag a point to move it (pointer capture keeps the drag alive outside the handle);
  double-click empty plot space to add a point at the pointer. Adds that would violate the
  minimum time gap or land outside the interior are ignored.
- Decorative layers — grid, zero line, curves — are `aria-hidden`.

## Examples

```tsx
import { useState } from 'react';
import { ValueGraph, type ValueGraphChannels } from '@presentstandards/framekit-ui';

export function MotionCurves() {
  const [channels, setChannels] = useState<ValueGraphChannels>({
    position: [
      { id: 'p0', time: 0, value: -0.2 },
      { id: 'p1', time: 0.5, value: 0.6 },
      { id: 'p2', time: 1, value: 0 },
    ],
    scale: [
      { id: 's0', time: 0, value: -0.4 },
      { id: 's1', time: 1, value: 0.4 },
    ],
    rotation: [
      { id: 'r0', time: 0, value: 0 },
      { id: 'r1', time: 1, value: 0.3 },
    ],
    opacity: [
      { id: 'o0', time: 0, value: -0.9 },
      { id: 'o1', time: 1, value: 0.9 },
    ],
  });

  return (
    <ValueGraph
      value={channels}
      onValueChange={setChannels}
      activeChannel="position"
      label="Layer motion curves"
    />
  );
}
```

## Do / Don't

- **Do** pair the graph with a channel switcher (tabs or a segmented switch) driving
  `activeChannel` — the graph edits one channel at a time by design.
- **Do** map your real units into the normalised `-1`–`1` range in the parent; the graph
  deliberately has no unit awareness.
- **Do** keep `showOtherChannels` on when curves are being timed against each other; turn it
  off only when the context layer reads as noise.
- **Don't** pass channels with fewer than two points — they silently fall back to the
  built-in demo curve.
- **Don't** use it for easing shape between two keys; that is
  [Easing graph](./easing-graph.md)'s job.
