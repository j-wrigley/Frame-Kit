---
name: Axis field
status: stable
since: 0.1.0
import: import { AxisField } from '@presentstandards/framekit-ui'
---

# Axis field

> A token-pure two-axis editor for shaping a related pair of creative values.

## When to use

- Creative inspectors where two continuous settings are understood best together.
- Surface treatments such as grain, texture, diffusion, scatter, or spatial spread.
- Workflows that need direct manipulation alongside precise, visible values.

## When not to use

- Use `Slider` or `RulerSlider` for one continuous value.
- Use `EasingGraph` for temporal acceleration and `CameraPath` for an ordered spatial route.
- Do not use this component as a chart, color picker, data visualization, or a choice among modes.

## Anatomy

`AxisField` renders a contained dot field, responsive dot emphasis, dashed crosshair, and one
slider-style handle. The component deliberately uses neutral `x` and `y` values; the consuming
product assigns their meaning through `xLabel`, `yLabel`, nearby values, and inspector labels.
When `snapToGrid` is enabled, every visible dot is a valid value pair.

## Props

| Prop            | Type                              | Default                | Description                                                                    |
| --------------- | --------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `value`         | `AxisFieldValue`                  | —                      | Controlled `{ x, y }` value. Both values are constrained to 0–1.               |
| `defaultValue`  | `AxisFieldValue`                  | `{ x: 0.52, y: 0.62 }` | Initial uncontrolled value.                                                    |
| `onValueChange` | `(value: AxisFieldValue) => void` | —                      | Called after a pointer or keyboard adjustment.                                 |
| `editable`      | `boolean`                         | `true`                 | Enables clicking, dragging, and keyboard adjustment of the handle.             |
| `disabled`      | `boolean`                         | `false`                | Prevents direct manipulation and mutes the field.                              |
| `snapToGrid`    | `boolean`                         | `false`                | Snaps direct adjustments to visible dot positions.                             |
| `gridColumns`   | `number`                          | `13`                   | Number of snap positions across. Values lower than two are constrained to two. |
| `gridRows`      | `number`                          | `9`                    | Number of snap positions down. Values lower than two are constrained to two.   |
| `step`          | `number`                          | `0.01`                 | Arrow-key increment when snap is off; Shift moves five increments.             |
| `xLabel`        | `string`                          | `'X'`                  | Horizontal value name announced for the focused handle.                        |
| `yLabel`        | `string`                          | `'Y'`                  | Vertical value name announced for the focused handle.                          |
| `label`         | `string`                          | `'Axis field'`         | Accessible field name.                                                         |

`AxisFieldValue` is `{ x: number; y: number }`. The component forwards its ref and standard
`<div>` attributes to the root.

## Tokens used

| Token                                     | Role in this component                       |
| ----------------------------------------- | -------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control` | Field surface and edge.                      |
| `--fk-text-tertiary`                      | Quiet dots and crosshair.                    |
| `--fk-accent`                             | Slider-style handle, active fill, and focus. |
| `--fk-bg-raised`                          | Resting handle fill.                         |

## Keyboard & accessibility

- With `editable`, the handle is a focusable button that announces both labelled values.
- Arrow keys adjust the focused value pair; with snap on they advance one dot, and Shift advances five.
- Home moves to `{ x: 0, y: 0 }`; End moves to `{ x: 1, y: 1 }`.
- Pointer dragging and keyboard movement are constrained to the visible 0–1 field range.
- `snapToGrid` applies to pointer and keyboard adjustments, so every edit lands on a visible dot.
- With `editable={false}`, the field is a labelled static image without a focusable handle.
- Pair it with nearby exact values whenever a handoff needs precision.

## Example

```tsx
import { AxisField, type AxisFieldValue } from '@presentstandards/framekit-ui';

const [treatment, setTreatment] = useState<AxisFieldValue>({ x: 0.52, y: 0.62 });

<AxisField
  value={treatment}
  onValueChange={setTreatment}
  xLabel="Amount"
  yLabel="Scale"
  snapToGrid
  label="Surface treatment field"
/>;
```

## Do / Don't

- **Do** name both axes in the surrounding product context and the accessibility labels.
- **Do** use the field for one coherent pair such as amount/scale or scatter/spread.
- **Do** offer a named preset before exposing direct custom editing when routine values exist.
- **Don't** make the dots decorative; enabling snap means each dot must represent a valid pair.
- **Don't** use an axis field for two unrelated settings or a data visualization.
