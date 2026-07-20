---
name: DragValue
status: stable
since: 0.1.0
import: import { DragValue } from '@presentstandards/framekit-ui'
---

# Drag value

> A value field that can be dragged directly, scrubbed with keys, and optionally reset on double click.

## When to use

- Canvas and inspector properties where speed and flow matter more than a traditional thumb.
- Values such as opacity, blur, offsets, tracking, and transform properties.
- Signed values using `variant="bipolar"`, which grows the fill from zero.

## When not to use

- Use [Slider](./slider.md) when users need the familiar affordance of a track and thumb.
- Use [Stepper](./stepper.md) when repeatable discrete increments are the primary interaction.
- Use an `Input` when users must regularly type exact values.

## Anatomy

- `.fk-drag-value` is the focusable `role="slider"` root.
- `.fk-drag-value__label` is the property label.
- `.fk-drag-value__fill` shows range progress or the signed offset from zero.
- `.fk-drag-value__decoration` optionally adds a handle, ticks, or a zero reference without changing the interaction.
- The label-and-value readout can align left, centre, or right while retaining correct contrast as the full-height fill passes behind it.

The `handle` decoration subtly widens and gains opacity on fine-pointer hover,
then holds that expanded state while dragging. Other decorations remain static
visual references.

## Props

| Prop                      | Type                                      | Default                   | Description                                                                 |
| ------------------------- | ----------------------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| `label`                   | `string`                                  | —                         | Property label and accessible slider name.                                  |
| `value`                   | `number`                                  | —                         | Current controlled value.                                                   |
| `onValueChange`           | `(value: number) => void`                 | —                         | Receives the next numeric value.                                            |
| `min` / `max` / `step`    | `number`                                  | `0` / `100` / `1`         | Bounds and normal increment.                                                |
| `fineStep` / `coarseStep` | `number`                                  | `step / 10` / `step * 10` | Precision increments for keyboard adjustment.                               |
| `variant`                 | `'fill' \| 'bipolar' \| 'bare'`           | `'fill'`                  | Progress fill, zero-centered fill, or quiet row treatment.                  |
| `decoration`              | `'none' \| 'handle' \| 'ticks' \| 'zero'` | `'none'`                  | Optional active-edge handle, measurement ticks, or zero reference.          |
| `resetValue`              | `number`                                  | —                         | Value restored with double click; omit to disable reset.                    |
| `size`                    | `'sm' \| 'md' \| 'lg'`                    | `'md'`                    | Control height and type scale.                                              |
| `showLabel`               | `boolean`                                 | `true`                    | Hides the visual property label while retaining the accessible slider name. |
| `labelAlign`              | `'left' \| 'center' \| 'right'`           | `'center'`                | Aligns the visible label-and-value readout inside the control.              |
| `formatValue`             | `(value: number) => string`               | `String`                  | Formats the visible and accessible value.                                   |

Forwards rest props and `className` to the root.

## Graphic variations

All graphic treatments are opt-in through `decoration`; the default is `none`.

| Treatment      | Props                                 | Best for                                                   |
| -------------- | ------------------------------------- | ---------------------------------------------------------- |
| Active edge    | `decoration="handle"`                 | Showing the live end of a one-directional filled value.    |
| Measured scale | `decoration="ticks"`                  | Values where repeated intervals add useful visual context. |
| Zero reference | `variant="bipolar" decoration="zero"` | Signed transform values that grow outward from zero.       |

```tsx
<DragValue label="Corner radius" decoration="handle" {...radiusProps} />
<DragValue label="Rotation" decoration="ticks" {...rotationProps} />
<DragValue label="Horizontal offset" variant="bipolar" decoration="zero" {...offsetProps} />
```

## Label alignment

Use `labelAlign` when the readout needs to follow an adjacent inspector or canvas edge. It positions both the visible property label and the formatted value, including their clipped high-contrast counterpart over the active fill.

```tsx
<DragValue label="Opacity" labelAlign="left" {...opacityProps} />
<DragValue label="Opacity" labelAlign="center" {...opacityProps} />
<DragValue label="Opacity" labelAlign="right" {...opacityProps} />
```

## Keyboard & accessibility

- Uses `role="slider"` and complete numeric ARIA values.
- Drag horizontally across the control to set the value.
- Arrow keys use `step`; Shift+Arrow is fine; Alt+Arrow and Page keys are coarse; Home/End set range boundaries.
- A double click calls `onValueChange(resetValue)` when `resetValue` is supplied.

## Example

```tsx
<DragValue
  label="Horizontal offset"
  variant="bipolar"
  value={offset}
  min={-80}
  max={80}
  fineStep={0.1}
  coarseStep={10}
  resetValue={0}
  onValueChange={setOffset}
/>
```

## Do / Don't

- **Do** supply a natural reset point for transform-like values.
- **Do** use a bipolar range only when zero is semantically meaningful.
- **Don't** hide a required unit; use `formatValue` to make the value self-explanatory.
