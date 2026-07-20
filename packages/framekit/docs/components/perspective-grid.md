---
name: Perspective grid
status: stable
since: 0.1.0
import: import { PerspectiveGrid } from '@presentstandards/framekit-ui'
---

# Perspective grid

> A direct perspective-correction field: four draggable keystone corner handles
> over a projected grid, with compact straighten, horizontal, and vertical
> correction sliders.

## When to use

- Perspective and keystone correction in photo and video geometry panels —
  converging verticals, tilted horizons, off-axis captures.
- Corner-pin style adjustment where the user should see the projected plane
  while dragging, not read four pairs of numbers.
- Inspector surfaces that want both direct manipulation (handles) and coarse
  parametric correction (the three sliders) over one shared value.

## When not to use

- A single rotation or skew value — use [Slider](./slider.md) or
  [Drag value](./drag-value.md).
- Crop framing and subject placement — use [Focus crop](./focus-crop.md).
- Free-form warping or mesh distortion; this component models one quad whose
  corners are clamped inside the surface.

## Anatomy

Root `<div>` (`fk-perspective-grid`, plus `fk-perspective-grid--default` or
`--compact`, and `--readonly` when not editable) with `role="group"`. Inside:

- `fk-perspective-grid__canvas` — a responsive `<svg>` (340×190 viewBox) holding
  the `__surface` rect, the tinted `__field` polygon, an `aria-hidden` `__lines`
  group of 3×3 interpolated grid lines, the accent `__outline` polygon, and four
  `__handle` groups. Each handle stacks an invisible 22px `__handle-hit` target,
  a `__handle-focus` ring shown on `:focus-visible`, and the visible
  `__handle-square`. A dragging handle sets `data-dragging`.
- `fk-perspective-grid__controls` — an optional three-column row (one column
  under 520px) of `fk-perspective-grid__control` labels, each a name `<span>`,
  a native `<input type="range">`, and a formatted `<output>`. The slider fill
  is drawn from the centre via inline `--fk-perspective-grid-start` / `-end`
  custom properties.

The straighten slider rotates all four corners around the surface centre; the
horizontal and vertical sliders shift opposing corner pairs. All three write
back into the same `PerspectiveGridValue`, so the handles and sliders never
disagree. Corner points are normalised on every change: clamped to
`0.035–0.965` and rounded to three decimals.

## Props

| Prop            | Type                                    | Default                                     | Description                                                            |
| --------------- | --------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| `value`         | `PerspectiveGridValue`                  | —                                           | Controlled grid corners and correction values.                         |
| `defaultValue`  | `PerspectiveGridValue`                  | A slightly skewed quad, all corrections `0` | Initial value when uncontrolled.                                       |
| `onValueChange` | `(value: PerspectiveGridValue) => void` | —                                           | Called after a handle drag, key nudge, or slider adjustment.           |
| `showControls`  | `boolean`                               | `true`                                      | Shows the straighten, horizontal, and vertical sliders below the grid. |
| `density`       | `'default' \| 'compact'`                | `'default'`                                 | Compact control typography for dense inspector surfaces.               |
| `editable`      | `boolean`                               | `true`                                      | Enables direct corner and slider adjustment.                           |
| `disabled`      | `boolean`                               | `false`                                     | Disables interaction and mutes the component.                          |
| `step`          | `number`                                | `0.01`                                      | Arrow-key increment for a corner handle; Shift moves five increments.  |
| `label`         | `string`                                | `'Perspective transform grid'`              | Accessible component name.                                             |

Extends `HTMLAttributes<HTMLDivElement>` (minus `defaultValue` and `onChange`);
forwards `ref` to the root `<div>` and spreads rest props onto it.

### Value types

```ts
type PerspectivePoint = {
  x: number; // 0 (left) to 1 (right)
  y: number; // 0 (top) to 1 (bottom)
};

type PerspectiveCorners = {
  topLeft: PerspectivePoint;
  topRight: PerspectivePoint;
  bottomRight: PerspectivePoint;
  bottomLeft: PerspectivePoint;
};

type PerspectiveGridValue = PerspectiveCorners & {
  straighten: number; // degrees, -45 to 45
  horizontal: number; // keystone correction, -1 to 1
  vertical: number; // keystone correction, -1 to 1
};

type PerspectiveGridDensity = 'default' | 'compact';
```

## Tokens used

| Token                                                                         | Role in this component                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control`                                     | Surface rect fill and stroke                                                                   |
| `--fk-accent-subtle`                                                          | Projected field tint                                                                           |
| `--fk-accent`                                                                 | Quad outline, handle stroke and dragging fill, handle focus ring, slider fill and thumb border |
| `--fk-text-tertiary`                                                          | Interior grid lines; slider centre tick                                                        |
| `--fk-bg-raised`                                                              | Handle and slider-thumb fill                                                                   |
| `--fk-bg-control-hover`                                                       | Slider track base                                                                              |
| `--fk-border-subtle`                                                          | Divider above the controls row                                                                 |
| `--fk-text-secondary`, `--fk-font-sans`, `--fk-fs-0` / `-1`, `--fk-fw-medium` | Control labels and value readouts                                                              |
| `--fk-space-2`                                                                | Grid, control, and divider spacing                                                             |
| `--fk-radius-full` / `--fk-radius-sm`                                         | Slider track/thumb rounding; slider focus radius                                               |
| `--fk-shadow-sm`                                                              | Slider thumb shadow                                                                            |
| `--fk-focus-outline`                                                          | Slider focus-visible outline                                                                   |

## Keyboard & accessibility

- The root is `role="group"` named by `label`; the `<svg>` carries the same
  `aria-label` and sets `data-disabled` when disabled.
- Each corner handle is a focusable `role="slider"` (`tabIndex 0` when
  editable) with `aria-valuemin 0`, `aria-valuemax 1`, `aria-valuenow` set to
  the corner's X, and an `aria-valuetext` announcing both coordinates, e.g.
  "top left. X 0.11, Y 0.14."
- On a focused handle: <kbd>←</kbd> <kbd>→</kbd> move X and <kbd>↑</kbd>
  <kbd>↓</kbd> move Y by `step` (floored at `0.001`); <kbd>Shift</kbd>
  multiplies by five; <kbd>Home</kbd> resets that corner to the kit's default
  position. Positions clamp to `0.035–0.965`, so a handle never leaves the
  surface.
- Dragging uses pointer capture on the SVG; pressing a handle snaps the corner
  to the pointer, and touch scrolling is suppressed (`touch-action: none`).
- The correction sliders are native `<input type="range">` elements, each with
  an `aria-label` and a formatted `aria-valuetext` (`+12.5°`, `-24`).
- When `editable` is `false` or `disabled` is `true`, handles leave the tab
  order and set `aria-disabled`; the sliders use native `disabled`.
- Interior grid lines are `aria-hidden`; a `forced-colors` block keeps the
  quad, handles, and sliders legible in high-contrast modes.

## Examples

```tsx
import { PerspectiveGrid, type PerspectiveGridValue } from '@presentstandards/framekit-ui';
import { useState } from 'react';

export function GeometryPanel() {
  const [transform, setTransform] = useState<PerspectiveGridValue>({
    topLeft: { x: 0.11, y: 0.14 },
    topRight: { x: 0.89, y: 0.1 },
    bottomRight: { x: 0.94, y: 0.91 },
    bottomLeft: { x: 0.06, y: 0.93 },
    straighten: 0,
    horizontal: 0,
    vertical: 0,
  });

  return (
    <PerspectiveGrid
      value={transform}
      onValueChange={setTransform}
      density="compact"
      label="Lens geometry"
    />
  );
}
```

## Do / Don't

- **Do** keep the value in parent state and drive your correction pipeline from
  the four corner points — the sliders are baked into the same corners, not a
  separate transform.
- **Do** pass `showControls={false}` when the owning inspector already exposes
  straighten and keystone as its own value controls.
- **Don't** store `straighten` / `horizontal` / `vertical` as independent
  outputs to re-apply on top of the corners; that double-applies the
  correction.
- **Don't** expect values outside the clamps to survive — corners are clamped
  to `0.035–0.965`, straighten to `±45°`, and corrections to `±1` on every
  change.
