---
name: Color balance wheels
status: stable
since: 0.1.0
import: import { ColorBalanceWheels } from '@presentstandards/framekit-ui'
---

# Color balance wheels

> Three-way colour balance for tonal grading — shadows, midtones, and highlights wheels with
> direct two-axis chroma bias, backed by lift, gamma, and gain luminance sliders.

## When to use

- Colour-correction surfaces in video grading, photo develop modules, and LUT tools where
  chroma bias is adjusted per tonal range.
- Panels that need chroma and luminance grading together: each wheel pairs with its
  luminance control (shadows/lift, midtones/gamma, highlights/gain) in one value.

## When not to use

- Choosing one exact colour — use [Color picker](./color-picker.md).
- A single one-dimensional adjustment — use [Slider](./slider.md) or
  [Drag value](./drag-value.md).
- Per-channel curve shaping — use [Tone curve](./tone-curve.md).
- General-purpose 2D input unrelated to grading — use [Axis field](./axis-field.md).

## Anatomy

Root `<div>` (`fk-color-balance`, `role="group"`) with a density modifier
(`fk-color-balance--compact`) and a muted read-only state (`fk-color-balance--readonly`).
A three-column grid (`fk-color-balance__wheels`) holds one `fk-color-balance__tone` block
per range: a circular `fk-color-balance__wheel` slider — hue conic ring fading to a neutral
centre, a fixed centre dot (`fk-color-balance__neutral`), an accent-ringed
`fk-color-balance__handle`, and two hidden axis guides (`fk-color-balance__axis`) — over a
capitalised `fk-color-balance__tone-label`.

Below a subtle divider, `fk-color-balance__levels` lays out three `fk-color-balance__level`
labels, each wrapping the level name, a restyled native `<input type="range">` (0–2, centred
on 1), and an `<output>` readout to two decimals.

Wheels are 112px by default, 82px in `compact`, and 80px under a 440px viewport, where the
level row also stacks to a single column.

## Props

| Prop            | Type                                 | Default                              | Description                                                                           |
| --------------- | ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------- |
| `value`         | `ColorBalanceValue`                  | —                                    | Controlled three-way balance plus lift/gamma/gain.                                    |
| `defaultValue`  | `ColorBalanceValue`                  | Neutral (all biases `0`, levels `1`) | Initial uncontrolled value.                                                           |
| `onValueChange` | `(value: ColorBalanceValue) => void` | —                                    | Called after every wheel or level adjustment with the normalised value.               |
| `density`       | `'default' \| 'compact'`             | `'default'`                          | Compact 82px wheels and tighter gaps for dense inspector surfaces.                    |
| `editable`      | `boolean`                            | `true`                               | Enables wheel and slider interaction.                                                 |
| `disabled`      | `boolean`                            | `false`                              | Prevents interaction and mutes the surface.                                           |
| `step`          | `number`                             | `0.01`                               | Arrow-key increment for wheel bias (floored at `0.001`); Shift moves five increments. |
| `label`         | `string`                             | `'Color balance wheels'`             | Accessible group name.                                                                |

Extends the native `<div>` attributes (minus `defaultValue`/`onChange`); forwards `ref` to
the root and spreads rest props onto it.

### Value types

```ts
type ColorBalanceToneValue = {
  x: number; // horizontal colour bias, -1 to 1
  y: number; // vertical colour bias, -1 to 1
};

type ColorBalanceValue = {
  shadows: ColorBalanceToneValue;
  midtones: ColorBalanceToneValue;
  highlights: ColorBalanceToneValue;
  lift: number; // 0 to 2, 1 is neutral
  gamma: number; // 0 to 2, 1 is neutral
  gain: number; // 0 to 2, 1 is neutral
};
```

Every change is normalised before it is stored or reported: each axis is clamped to ±1, the
combined bias is limited to the unit circle, levels are clamped to 0–2, and everything is
rounded to three decimals.

## Tokens used

| Token                                                          | Role in this component                                               |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| `--fk-bg-raised` / `--fk-bg-control` / `--fk-bg-control-hover` | Wheel centre scrim, handle and neutral-dot fills, slider track       |
| `--fk-accent` / `--fk-accent-muted`                            | Handle ring and hover fill; slider fill, thumb ring, active thumb    |
| `--fk-border-control` / `--fk-border-subtle`                   | Wheel outline; divider above the level row                           |
| `--fk-text-primary` / `-secondary` / `-tertiary`               | Inner-ring and marker mixes; labels and readouts; slider centre mark |
| `--fk-focus-outline`                                           | Focus ring on wheels and sliders                                     |
| `--fk-radius-full` / `--fk-radius-sm`                          | Circular geometry; slider focus radius                               |
| `--fk-space-2` / `--fk-space-3`                                | Grid gaps and level-row padding                                      |
| `--fk-font-sans`, `--fk-fs-0` / `--fk-fs-1`, `--fk-fw-medium`  | Tone labels and value readouts                                       |
| `--fk-duration-fast` / `--fk-ease`                             | Handle hover and press motion                                        |
| `--fk-shadow-sm`                                               | Slider thumb shadow                                                  |

The hue ring itself is a fixed conic gradient of six muted hues — deliberately not
tokenised, so it reads identically in light and dark themes.

## Keyboard & accessibility

- The root is a `role="group"` named by `label`; each wheel is a focusable `role="slider"`
  with `aria-valuemin={-1}` / `aria-valuemax={1}`. `aria-valuenow` reports the X bias, and
  `aria-valuetext` announces both axes plus a usage hint (e.g. "shadows color balance.
  X 0.25, Y -0.10. Use arrow keys to adjust.").
- <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> adjust a wheel's X bias and
  <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> its Y bias by `step`; hold <kbd>Shift</kbd> for
  five increments. <kbd>Home</kbd> recentres the wheel to neutral.
- Pointer drag captures the pointer and focuses the wheel; position maps directly to bias.
  Holding <kbd>Shift</kbd> while dragging snaps to 45° angles and quarter-magnitude steps,
  with a small dead zone that snaps to neutral.
- Lift, gamma, and gain are native `<input type="range">` controls (0–2, step 0.01), each
  with its own `aria-label`, so platform slider keys apply; the `<output>` readout tracks
  the value.
- When not editable, wheels drop from the tab order and gain `aria-disabled`; the sliders
  use native `disabled`.
- Forced-colors mode restyles wheels, handles, and slider parts with system
  `Canvas`/`Highlight` colours.

## Examples

```tsx
import { useState } from 'react';
import { ColorBalanceWheels, type ColorBalanceValue } from '@presentstandards/framekit-ui';

const NEUTRAL: ColorBalanceValue = {
  shadows: { x: 0, y: 0 },
  midtones: { x: 0, y: 0 },
  highlights: { x: 0, y: 0 },
  lift: 1,
  gamma: 1,
  gain: 1,
};

export function GradePanel() {
  const [balance, setBalance] = useState(NEUTRAL);
  return (
    <ColorBalanceWheels
      value={balance}
      onValueChange={setBalance}
      density="compact"
      label="Primary color balance"
    />
  );
}
```

## Do / Don't

- **Do** map the value straight onto a lift/gamma/gain grading model — `{ x: 0, y: 0 }` and
  `1` are the neutral points, so a freshly mounted component is a no-op grade.
- **Do** use `density="compact"` in narrow inspectors and popovers.
- **Don't** re-clamp or re-round values in `onValueChange` — the component already
  normalises bias to the unit circle and levels to 0–2.
- **Don't** use a wheel to pick a display colour; bias is a correction offset, not a
  colour value.
- **Don't** separate the wheels from their luminance sliders — the pairing per tonal range
  is the point of the control.
