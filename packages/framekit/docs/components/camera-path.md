---
name: Camera path
status: stable
since: 0.1.0
import: import { CameraPath } from '@presentstandards/framekit-ui'
---

# Camera path

> A token-pure spatial waypoint editor for camera moves and framing transitions.

## When to use

- Camera or viewport inspectors where a route needs a concise visual companion.
- Creative tools that pair named camera moves with occasional direct adjustment.
- Motion workflows that need an ordered set of clear spatial framing decisions.

## When not to use

- Use `EasingGraph` for temporal acceleration, not spatial camera position.
- Use `Slider` or `RulerSlider` for a single continuous value such as zoom.
- Do not use this component as a detailed map, an animation timeline, or a general chart.

## Anatomy

`CameraPath` renders a contained canvas, quiet snap dots, connected route, and ordered circular
waypoints. Every dot is a valid snap position. In editable mode, a waypoint can be selected,
dragged, or adjusted by keyboard. Compose it with `Dropdown` for named routes, `Toggle` for snap,
and `NumberInput` for exact values.

## Props

| Prop                  | Type                                        | Default           | Description                                                                    |
| --------------------- | ------------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| `value`               | `readonly CameraPathWaypoint[]`             | —                 | Controlled ordered waypoints. Coordinates are constrained to 0–1.              |
| `defaultValue`        | `readonly CameraPathWaypoint[]`             | Three-point sweep | Initial uncontrolled route.                                                    |
| `onValueChange`       | `(waypoints: CameraPathWaypoint[]) => void` | —                 | Called after a pointer or keyboard adjustment.                                 |
| `activeIndex`         | `number`                                    | —                 | Controlled selected waypoint index.                                            |
| `defaultActiveIndex`  | `number`                                    | `0`               | Initial selected waypoint for uncontrolled selection.                          |
| `onActiveIndexChange` | `(index: number) => void`                   | —                 | Called when a waypoint is selected.                                            |
| `editable`            | `boolean`                                   | `true`            | Enables focus, dragging, and keyboard movement for each waypoint.              |
| `disabled`            | `boolean`                                   | `false`           | Prevents direct manipulation and mutes the canvas.                             |
| `snapToGrid`          | `boolean`                                   | `false`           | Snaps direct adjustments to visible snap dots.                                 |
| `gridColumns`         | `number`                                    | `9`               | Number of snap positions across. Values lower than two are constrained to two. |
| `gridRows`            | `number`                                    | `5`               | Number of snap positions down. Values lower than two are constrained to two.   |
| `step`                | `number`                                    | `0.01`            | Arrow-key coordinate increment; Shift moves five increments.                   |
| `label`               | `string`                                    | `'Camera path'`   | Accessible canvas name.                                                        |

`CameraPathWaypoint` is `{ x: number; y: number; label?: string }`. The component forwards its
ref and standard `<div>` attributes to the root.

## Tokens used

| Token                                     | Role in this component                      |
| ----------------------------------------- | ------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control` | Camera-path surface and edge.               |
| `--fk-border`                             | Quiet snap-dot positions.                   |
| `--fk-accent`                             | Route, active waypoint, outline, and focus. |
| `--fk-bg-raised`                          | Inactive waypoint fill.                     |
| `--fk-text-secondary`                     | Waypoint numbers.                           |

## Keyboard & accessibility

- With `editable`, every waypoint is a focusable button with its order and x/y coordinates announced.
- Arrow keys adjust the focused waypoint; Shift multiplies the configured `step` by five.
- Pointer dragging and keyboard movement are constrained to the visible 0–1 canvas range.
- `snapToGrid` applies to direct pointer and keyboard adjustments, so every edit lands on a visible dot.
- With `editable={false}`, the component is a labelled static image without focusable waypoints.
- Keep the selected waypoint’s values nearby when an exact handoff is important.

## Example

```tsx
import { CameraPath, type CameraPathWaypoint } from '@presentstandards/framekit-ui';

const [path, setPath] = useState<CameraPathWaypoint[]>([
  { x: 0.08, y: 0.82 },
  { x: 0.48, y: 0.5 },
  { x: 0.9, y: 0.22 },
]);

<CameraPath
  value={path}
  onValueChange={setPath}
  activeIndex={1}
  editable
  snapToGrid
  label="Camera move path"
/>;
```

## Do / Don't

- **Do** use a few deliberate waypoints to describe one understandable camera journey.
- **Do** provide a named preset before exposing custom direct manipulation.
- **Do** pair the selected waypoint with exact nearby values when precision matters.
- **Don't** add a dense coordinate grid or use the component as a general visualisation.
- **Don't** use camera-path points to represent temporal easing; use `EasingGraph` for that.
