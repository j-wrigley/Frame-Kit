---
name: RulerReadout
status: stable
since: 0.1.0
import: import { RulerReadout } from '@presentstandards/framekit-ui'
---

# Ruler readout

> A compact, display-only range reference for spatial, temporal, and measured values adjusted elsewhere.

## When to use

- Next to a drag value or scrubber when the current value needs a persistent reference range.
- In canvas HUDs, inspectors, and timeline panels where a measurement must remain visible.
- For signed values such as offsets: supply `origin={0}` to show the zero reference.

## When not to use

- Use [Ruler slider](./ruler-slider.md) when the scale itself should be directly adjustable.
- Use [Scrubber](./scrubber.md) for compact pointer adjustment.

## Anatomy

- `.fk-ruler-readout` is a display-only container.
- Header pairs the property label with the formatted current value.
- Scale combines reference marks, optional origin, and the accent indicator.
- Optional range labels describe the scale boundaries.

## Props

| Prop               | Type                        | Default     | Description                                      |
| ------------------ | --------------------------- | ----------- | ------------------------------------------------ |
| `label`            | `string`                    | —           | Measurement name.                                |
| `value`            | `number`                    | —           | Current measured value.                          |
| `min` / `max`      | `number`                    | `0` / `100` | Scale boundaries.                                |
| `origin`           | `number`                    | —           | Optional reference point, commonly `0`.          |
| `size`             | `'sm' \| 'md' \| 'lg'`      | `'md'`      | Readout density.                                 |
| `formatValue`      | `(value: number) => string` | `String`    | Formats the highlighted value.                   |
| `formatRangeValue` | `(value: number) => string` | `String`    | Formats the range labels.                        |
| `hideRangeLabels`  | `boolean`                   | `false`     | Removes the boundary labels for compact HUD use. |

## Example

```tsx
<RulerReadout
  label="Horizontal offset"
  value={offset}
  min={-80}
  max={80}
  origin={0}
  formatValue={(value) => `${value} PX`}
/>
```

## Do / Don't

- **Do** pair it with an input that changes the same value.
- **Do** show an origin for center-based ranges.
- **Don't** use it as an interactive slider; it communicates reference only.
