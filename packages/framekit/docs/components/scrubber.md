---
name: Scrubber
status: stable
since: 0.1.0
import: import { Scrubber } from '@presentstandards/framekit-ui'
---

# Scrubber

> A compact value adjustment row with rail, meter, and ruler feedback styles for dense tool surfaces.

## When to use

- Inspector rows where a label, compact scale, and formatted value belong together.
- Exposure, blend, spacing, or other adjustments that need more feedback than a stepper.
- Dense canvases and panels using the `bare` surface treatment.

## When not to use

- Use [Ruler slider](./ruler-slider.md) when the scale itself needs more visual prominence.
- Use [Drag value](./drag-value.md) when the whole field should be a value-first direct manipulation control.

## Anatomy

- `.fk-scrubber` is the inspector-row layout root.
- `.fk-scrubber__track` is the focusable `role="slider"` interaction area.
- Label, track, and formatted value form one aligned inspector row.
- The track includes fill, optional ticks, and a thumb appropriate to the chosen variant.

## Interaction motion

The formatted value uses tabular numerals in a reserved readout column, so a
single-digit value never shifts the track when it becomes double-digit. On fine
pointers, the handle eases into a filled, haloed hover state and holds that
state while dragging. Position and fill widths are deliberately unanimated, so
they remain directly locked to the pointer. Override `--fk-scrubber-value-width`
when a custom formatter needs more than the default eight-character column.

## Props

| Prop                      | Type                           | Default                   | Description                                                                 |
| ------------------------- | ------------------------------ | ------------------------- | --------------------------------------------------------------------------- |
| `label`                   | `string`                       | —                         | Property label and accessible slider name.                                  |
| `value`                   | `number`                       | —                         | Current controlled value.                                                   |
| `onValueChange`           | `(value: number) => void`      | —                         | Receives the next numeric value.                                            |
| `min` / `max` / `step`    | `number`                       | `0` / `100` / `1`         | Bounds and normal increment.                                                |
| `fineStep` / `coarseStep` | `number`                       | `step / 10` / `step * 10` | Precision increments for keyboard adjustment.                               |
| `variant`                 | `'rail' \| 'meter' \| 'ruler'` | `'rail'`                  | Track information density.                                                  |
| `surface`                 | `'soft' \| 'bare'`             | `'soft'`                  | Enclosed inspector row or borderless treatment.                             |
| `size`                    | `'sm' \| 'md' \| 'lg'`         | `'md'`                    | Control height and track scale.                                             |
| `showLabel`               | `boolean`                      | `true`                    | Hides the visual property label while retaining the accessible slider name. |
| `formatValue`             | `(value: number) => string`    | `String`                  | Formats the visible and accessible value.                                   |

## Keyboard & accessibility

- Uses `role="slider"` with complete range ARIA attributes.
- Drag horizontally across the track to set the value precisely.
- Arrow keys use `step`; Shift+Arrow is fine; Alt+Arrow and Page keys are coarse; Home/End set range boundaries.

## Example

```tsx
<Scrubber
  label="Blend"
  variant="meter"
  value={mix}
  fineStep={0.5}
  coarseStep={10}
  onValueChange={setMix}
  formatValue={(value) => `${value}%`}
/>
```

## Do / Don't

- **Do** reserve `meter` for values where intensity is meaningful.
- **Do** use `bare` only when a surrounding panel already defines the row boundary.
- **Don't** use ruler ticks as decoration; select `ruler` when spatial scale adds real context.
