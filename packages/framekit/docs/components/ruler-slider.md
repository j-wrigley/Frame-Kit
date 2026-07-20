---
name: RulerSlider
status: stable
since: 0.1.0
import: import { RulerSlider } from '@presentstandards/framekit-ui'
---

# Ruler slider

> A direct-manipulation slider with an embedded visual scale for spatial, temporal, and transform values.

Its vertical position bar widens and grows slightly taller into an accent-muted
fill and quiet halo on fine pointers, then holds a compact solid accent state
while adjusting.

## When to use

- Rotation, offset, duration, and other values where a ruler gives useful context.
- Precision-facing controls where one coarse track would feel under-specified.
- Canvas tool properties that support pointer, keyboard, and fine/coarse adjustment.

## When not to use

- Use [Slider](./slider.md) for an everyday native range control.
- Use [Scrubber](./scrubber.md) for a compact row that needs less visual scale.

## Anatomy

- `.fk-ruler-slider` is the layout root.
- `.fk-ruler-slider__control` is the focusable `role="slider"` interaction area.
- Rail, fill, ruler marks, and a vertical position bar are separate visual layers.

## Props

| Prop                   | Type                        | Default           | Description                                                   |
| ---------------------- | --------------------------- | ----------------- | ------------------------------------------------------------- |
| `label`                | `string`                    | —                 | Visible label and accessible slider name.                     |
| `value`                | `number`                    | —                 | Current controlled value.                                     |
| `onValueChange`        | `(value: number) => void`   | —                 | Receives the next numeric value.                              |
| `min` / `max` / `step` | `number`                    | `0` / `100` / `1` | Bounds and normal pointer/arrow increment.                    |
| `fineStep`             | `number`                    | `step / 10`       | Increment used by Shift+Arrow.                                |
| `coarseStep`           | `number`                    | `step * 10`       | Increment used by Alt+Arrow and Page keys.                    |
| `size`                 | `'sm' \| 'md' \| 'lg'`      | `'md'`            | Ruler height and thumb scale.                                 |
| `showLabel`            | `boolean`                   | `true`            | Hides the visual header while retaining the accessible label. |
| `formatValue`          | `(value: number) => string` | `String`          | Formats the visible and accessible value.                     |

Forwards rest props and `className` to the root.

## Keyboard & accessibility

- The interactive area uses `role="slider"` with complete min, max, now, and text value attributes.
- Arrow keys use `step`; Shift+Arrow uses `fineStep`; Alt+Arrow and Page Up/Down use `coarseStep`.
- Home and End jump to the declared range boundaries.
- Drag anywhere on the scale to set the value directly.

## Example

```tsx
<RulerSlider
  label="Rotation"
  value={rotation}
  min={-180}
  max={180}
  fineStep={0.1}
  coarseStep={15}
  onValueChange={setRotation}
  formatValue={(value) => `${value}°`}
/>
```

## Do / Don't

- **Do** pair it with a formatter that includes units.
- **Do** choose fine and coarse steps that make sense for the tool.
- **Don't** use it for a binary or very small fixed choice; use a switch, segmented control, or stepper instead.
