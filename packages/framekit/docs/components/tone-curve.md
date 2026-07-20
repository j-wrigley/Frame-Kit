---
name: Tone curve
status: stable
since: 0.1.0
import: import { ToneCurve } from '@presentstandards/framekit-ui'
---

# Tone curve

> A compact tonal transfer-curve editor with direct points and a quiet histogram backdrop.

## When to use

- Photography, compositing, and colour inspectors where tonal remapping needs an immediate visual read.
- Luminance or individual RGB-channel adjustments that benefit from named presets and exact selected values.
- Compact media workflows that need more precision than exposure and contrast sliders alone.

## When not to use

- Use `GradientEditor` to create a colour ramp, not to remap image tones.
- Use `ColorPicker` for choosing a colour or `ColorInput` for an exact hex value.
- Do not use the histogram as a general analytical chart or the curve as a freeform drawing surface.

## Anatomy

`ToneCurve` contains a bounded graph, low-contrast histogram samples, a diagonal identity guide, a smooth transfer curve, and direct point handles. The first and final points stay fixed at input 0 and 1; middle points can be added with double-click and removed with Delete.

## Props

| Prop               | Type                                        | Default          | Description                                                                      |
| ------------------ | ------------------------------------------- | ---------------- | -------------------------------------------------------------------------------- |
| `value`            | `readonly ToneCurvePoint[]`                 | —                | Controlled points with stable `id`, `x`, and `y` values.                         |
| `defaultValue`     | `readonly ToneCurvePoint[]`                 | Soft contrast    | Initial uncontrolled curve.                                                      |
| `onValueChange`    | `(points: ToneCurvePoint[]) => void`        | —                | Called after a point is added, moved, or removed.                                |
| `activeId`         | `string \| null`                            | —                | Controlled selected point id.                                                    |
| `defaultActiveId`  | `string \| null`                            | —                | Initial uncontrolled selected point id.                                          |
| `onActiveIdChange` | `(id: string \| null) => void`              | —                | Called when point selection changes.                                             |
| `channel`          | `'luminance' \| 'red' \| 'green' \| 'blue'` | `'luminance'`    | Semantic channel name used for accessible context.                               |
| `histogram`        | `readonly number[]`                         | Built-in samples | Normalised histogram bars rendered behind the curve.                             |
| `editable`         | `boolean`                                   | `true`           | Enables selection, drag, double-click insertion, keyboard movement, and removal. |
| `disabled`         | `boolean`                                   | `false`          | Prevents direct manipulation and mutes the graph.                                |
| `step`             | `number`                                    | `0.01`           | Arrow-key increment; Shift multiplies it by five.                                |
| `label`            | `string`                                    | `'Tone curve'`   | Accessible graph name.                                                           |

## Keyboard & accessibility

- Every point is a focusable button that announces its input and output values.
- Arrow keys move a focused point; Shift multiplies the configured increment by five.
- Delete or Backspace removes a middle point while retaining the black and white endpoints.
- Dragged points cannot cross their neighbours, preserving a clear ordered curve.
- With `editable={false}`, the component is a labelled static graph without focusable point handles.

## Example

```tsx
import { ToneCurve, type ToneCurvePoint } from '@presentstandards/framekit-ui';

const [points, setPoints] = useState<ToneCurvePoint[]>([
  { id: 'black', x: 0, y: 0 },
  { id: 'shadow', x: 0.24, y: 0.18 },
  { id: 'highlight', x: 0.74, y: 0.82 },
  { id: 'white', x: 1, y: 1 },
]);

<ToneCurve value={points} onValueChange={setPoints} channel="luminance" />;
```

## Do / Don't

- **Do** begin with luminance and add individual channel curves only for a deliberate colour correction.
- **Do** keep the histogram understated; it is context for the curve, not the primary control.
- **Do** use two to four meaningful curve points before considering a more specialised correction.
- **Don't** remove or re-purpose the stable black and white endpoints.
- **Don't** turn the graph into a dense decorative grid or a general-purpose chart.
