---
name: Slider
status: stable
since: 0.1.0
import: import { Slider } from '@presentstandards/framekit-ui'
---

# Slider

> A native range input, styled for deliberate continuous adjustments in tool panels.

The packaged handle expands through a soft 180ms ease into an accent-muted fill
with a quiet halo on fine-pointer hover, then settles into a compact solid
accent state while dragging. Keyboard use and reduced-motion preferences retain
the native, stable interaction.

## When to use

- Familiar continuous values such as opacity, zoom, feather, or scale.
- Situations where native range semantics and keyboard handling are the best fit.
- Values that benefit from a visible readout but do not need a drawn scale.

## When not to use

- Use [Ruler slider](./ruler-slider.md) when a measurement scale improves precision.
- Use [Drag value](./drag-value.md) when the field itself should act as a direct-manipulation control.
- Use [Stepper](./stepper.md) for bounded, repeatable increments.

## Anatomy

- `.fk-slider` is the layout root.
- `.fk-slider__header` holds the optional label and formatted output.
- `.fk-slider__input` is the native `input[type="range"]`.

## Props

| Prop                   | Type                        | Default           | Description                                              |
| ---------------------- | --------------------------- | ----------------- | -------------------------------------------------------- |
| `value`                | `number`                    | —                 | Current controlled value.                                |
| `onValueChange`        | `(value: number) => void`   | —                 | Receives the next numeric value.                         |
| `min` / `max` / `step` | `number`                    | `0` / `100` / `1` | Native range bounds and increment.                       |
| `label`                | `ReactNode`                 | —                 | Visible property label. Provide `aria-label` if omitted. |
| `size`                 | `'sm' \| 'md' \| 'lg'`      | `'md'`            | Compact, standard, or prominent control size.            |
| `showValue`            | `boolean`                   | `true`            | Shows the formatted value in the header.                 |
| `formatValue`          | `(value: number) => string` | `String`          | Formats the visual and accessible value.                 |

Forwards standard native input attributes to the range input. `className` applies to the root.

## Tokens used

| Token                    | Role                           |
| ------------------------ | ------------------------------ |
| `--fk-accent`            | Filled track and thumb border. |
| `--fk-bg-control-active` | Unfilled track.                |
| `--fk-bg-raised`         | Resting thumb fill.            |
| `--fk-focus-outline`     | Keyboard focus indicator.      |

## Keyboard & accessibility

- Uses a native range input, including its standard Arrow, Home, End, and Page key behavior.
- `formatValue` becomes `aria-valuetext`; provide a meaningful unit when it improves comprehension.
- A string `label` names the range. For non-string or omitted labels, pass `aria-label` or `aria-labelledby`.

## Example

```tsx
<Slider
  label="Opacity"
  value={opacity}
  min={0}
  max={100}
  onValueChange={setOpacity}
  formatValue={(value) => `${value}%`}
/>
```

## Do / Don't

- **Do** match the visible range to the useful range of the task.
- **Do** format units in the value readout when a number alone is ambiguous.
- **Don't** use it as a substitute for a precise numeric text input when typed entry is essential.
