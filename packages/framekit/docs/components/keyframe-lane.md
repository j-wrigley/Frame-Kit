---
name: Keyframe lane
status: stable
since: 0.1.0
import: import { KeyframeLane } from '@presentstandards/framekit-ui'
---

# Keyframe lane

> A token-pure timeline row for editing keyframes, current time, and an optional working range.

## When to use

- A property inspector or motion workspace where users need to see and adjust a few time-based events.
- Animation, effects, audio, and generative-motion controls with a single clear value over time.
- Workflows that need a focused range before opening deeper timing controls such as `EasingGraph`.

## When not to use

- Do not treat it as a standalone multi-track video editor, clip timeline, or full transport control.
- Use `EasingGraph` for the shape of one transition, not the placement of events over time.
- Use `Scrubber` for direct playback position without discrete events.

## Anatomy

`KeyframeLane` renders a contained timing surface, quiet ticks, a restrained playhead, optional
range highlight, and draggable keyframes. The default `diamond` variation makes individual events
clear; `bar` gives the holds between frames visual weight; `dot` keeps dense events secondary. The
component represents time as a number; the consuming product supplies the unit and nearby exact
values. `regular` density gives an inspector row comfortable labels; `compact` removes those labels
and shortens the surface for vertically stacked properties with a shared playhead and range. Compose
it with `EasingGraph` for the selected transition's curve and `NumberInput` for an exact timestamp.

## Props

| Prop               | Type                              | Default               | Description                                                                                                   |
| ------------------ | --------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `value`            | `readonly KeyframeLaneKeyframe[]` | —                     | Controlled keyframes with stable unique ids.                                                                  |
| `defaultValue`     | `readonly KeyframeLaneKeyframe[]` | Four keys, 0–1000     | Initial uncontrolled keyframes.                                                                               |
| `onValueChange`    | `(keyframes) => void`             | —                     | Called after a pointer or keyboard marker adjustment.                                                         |
| `activeId`         | `string \| null`                  | —                     | Controlled selected keyframe id.                                                                              |
| `defaultActiveId`  | `string \| null`                  | First keyframe        | Initial uncontrolled selected keyframe id.                                                                    |
| `onActiveIdChange` | `(id) => void`                    | —                     | Called when a marker becomes selected.                                                                        |
| `playhead`         | `number`                          | —                     | Controlled current playhead time.                                                                             |
| `showPlayhead`     | `boolean`                         | `true`                | Renders the lane’s local playhead; turn off for a parent-owned timeline playhead.                             |
| `defaultPlayhead`  | `number`                          | `0`                   | Initial uncontrolled playhead time.                                                                           |
| `onPlayheadChange` | `(time) => void`                  | —                     | Called after clicking an empty part of the lane.                                                              |
| `range`            | `KeyframeLaneRange \| null`       | —                     | Controlled working range, or `null` for no range.                                                             |
| `defaultRange`     | `KeyframeLaneRange \| null`       | `null`                | Initial uncontrolled working range.                                                                           |
| `onRangeChange`    | `(range) => void`                 | —                     | Called after Shift-dragging an empty part of the lane.                                                        |
| `duration`         | `number`                          | `1000`                | Upper timeline bound. Values lower than one are constrained to one.                                           |
| `snap`             | `number`                          | —                     | Positive snapping increment for direct pointer and keyboard adjustments; grid ticks follow it when practical. |
| `variant`          | `'diamond' \| 'bar' \| 'dot'`     | `'diamond'`           | Visual keyframe representation; data and interactions stay unchanged.                                         |
| `density`          | `'regular' \| 'compact'`          | `'regular'`           | Compact removes tick labels and reduces height for stacked timeline rows.                                     |
| `step`             | `number`                          | `10`                  | Arrow-key increment when snap is off; Shift moves five increments.                                            |
| `editable`         | `boolean`                         | `true`                | Enables marker movement, playhead changes, and range selection.                                               |
| `disabled`         | `boolean`                         | `false`               | Prevents direct interaction and mutes the lane.                                                               |
| `label`            | `string`                          | `'Keyframe timeline'` | Accessible lane name.                                                                                         |

`KeyframeLaneKeyframe` is `{ id: string; time: number; label?: string }`.
`KeyframeLaneRange` is `{ start: number; end: number }`. The component forwards its ref and
standard `<div>` attributes to the root.

### Variants

| Variant   | Read                                             | Best for                                          |
| --------- | ------------------------------------------------ | ------------------------------------------------- |
| `diamond` | Distinct point events and transition boundaries. | Motion, transforms, and visible property changes. |
| `bar`     | Duration and holds between neighboring frames.   | Clips, states, and sustained effect values.       |
| `dot`     | Dense events without a prominent marker shape.   | Compact inspector rows and supporting timelines.  |

## Tokens used

| Token                                     | Role in this component                             |
| ----------------------------------------- | -------------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control` | Timing surface and edge.                           |
| `--fk-border`                             | Quiet timing ticks.                                |
| `--fk-accent-subtle`                      | Selected working-range highlight.                  |
| `--fk-accent`                             | Playhead, active keyframe, drag, and focus signal. |
| `--fk-bg-raised`                          | Resting keyframe fill.                             |

## Keyboard & accessibility

- Each keyframe is a focusable button that announces its optional label and current time.
- Arrow keys move a focused keyframe. With `snap`, they advance one snap increment; Shift moves five.
- <kbd>Home</kbd> and <kbd>End</kbd> move a focused keyframe to the first and final time.
- Clicking an empty part of the lane moves the playhead; Shift-dragging it creates a working range.
- Marker movement, playhead changes, and ranges are constrained to 0 through `duration`.
- With `editable={false}`, the lane becomes a labelled static image without focusable markers.

## Example

```tsx
import { KeyframeLane, type KeyframeLaneKeyframe } from '@presentstandards/framekit-ui';

const [keyframes, setKeyframes] = useState<KeyframeLaneKeyframe[]>([
  { id: 'start', time: 0, label: 'Start' },
  { id: 'move', time: 300, label: 'Move' },
  { id: 'settle', time: 700, label: 'Settle' },
]);

<KeyframeLane
  density="compact"
  value={keyframes}
  onValueChange={setKeyframes}
  duration={1200}
  snap={100}
  variant="bar"
  label="Position animation keyframes"
/>;
```

## Do / Don't

- **Do** scope each lane to one understandable property or effect.
- **Do** keep the selected keyframe's exact time and easing control nearby.
- **Do** use range selection for focused work, loops, and review intervals.
- **Do** choose `bar` when duration between frames is the information users need to scan.
- **Do** stack `compact` lanes with a shared `playhead` and `range` when a motion workspace needs multiple properties.
- **Don't** expect the lane itself to provide clip editing, layer management, or transport controls.
- **Don't** use keyframe placement to edit easing; hand that decision to `EasingGraph`.
