---
name: Orbit dial
status: stable
since: 0.1.0
import: import { OrbitDial } from '@presentstandards/framekit-ui'
---

# Orbit dial

> A compass-style dial that edits a yaw + elevation pair — orbit a camera or aim
> a directional light by dragging around the ring, with a live degree readout at
> the centre.

## When to use

- Camera orbit controls in 3D viewports and scene inspectors.
- Directional-light angle (sun position) in lighting panels — use the `light` variant.
- Any spatial parameter that is naturally a heading plus a tilt: wind direction, extrusion angle, projection direction.

## When not to use

- A single linear value — use [Slider](./slider.md) or [Drag value](./drag-value.md).
- A free 2D offset or vector on a flat plane — use [Direction pad](./direction-pad.md).
- Exact numeric angle entry — compose [Axis field](./axis-field.md) or [Stepper](./stepper.md) alongside the dial; the dial itself has no text input.

## Anatomy

Renders a root `<div>` (`fk-orbit-dial`, with `fk-orbit-dial--{size}`,
`fk-orbit-dial--{variant}`, and `fk-orbit-dial--readonly` when read-only or disabled)
wrapping a single interactive SVG (`fk-orbit-dial__canvas`). Inside the SVG:
the dial face (`fk-orbit-dial__surface`), the yaw ring (`fk-orbit-dial__ring`)
and dashed inner ring (`fk-orbit-dial__inner-ring`), 24 ticks at 15° intervals
(`fk-orbit-dial__tick`, majors every 90°), N/E/S/W letters
(`fk-orbit-dial__cardinals`), an accent spoke from centre to handle
(`fk-orbit-dial__spoke`), the handle with its halo (`fk-orbit-dial__handle`,
`fk-orbit-dial__handle-halo`), and a central readout disc
(`fk-orbit-dial__readout-disc`, `fk-orbit-dial__readout`) showing elevation
large and yaw small. The `light` variant adds a subtle accent wash
(`fk-orbit-dial__light-wash`) and a four-line ray glyph on the handle
(`fk-orbit-dial__light-rays`).

The canvas exposes `data-editable`, `data-disabled`, and `data-dragging` state
attributes.

## Props

| Prop             | Type                              | Default                      | Description                                                          |
| ---------------- | --------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| `value`          | `OrbitDialValue`                  | —                            | Controlled yaw and elevation angles.                                 |
| `defaultValue`   | `OrbitDialValue`                  | `{ yaw: 42, elevation: 18 }` | Initial angles when uncontrolled.                                    |
| `onValueChange`  | `(value: OrbitDialValue) => void` | —                            | Called with the next orbit position after a direct adjustment.       |
| `size`           | `OrbitDialSize`                   | `'md'`                       | Dial diameter (136 / 184 / 236px).                                   |
| `variant`        | `OrbitDialVariant`                | `'camera'`                   | Visual treatment: plain compass or directional-light wash plus rays. |
| `editable`       | `boolean`                         | `true`                       | Enables direct compass adjustment and keyboard controls.             |
| `disabled`       | `boolean`                         | `false`                      | Disables direct adjustment and mutes the dial.                       |
| `step`           | `number`                          | `1`                          | Arrow-key increment in degrees; hold Shift for five increments.      |
| `yawLabel`       | `string`                          | `'Yaw'`                      | Human-readable yaw axis name, shown in the readout.                  |
| `elevationLabel` | `string`                          | `'Elevation'`                | Human-readable elevation axis name, shown in the readout.            |
| `label`          | `string`                          | `'Orbit dial'`               | Accessible dial name.                                                |

```ts
type OrbitDialValue = {
  /** Degrees; 0° points north, wraps at 360°. */
  yaw: number;
  /** Degrees, clamped to -90…90. */
  elevation: number;
};

type OrbitDialSize = 'sm' | 'md' | 'lg';
type OrbitDialVariant = 'camera' | 'light';
```

Extends `div` attributes (minus `defaultValue`/`onChange`). Forwards `ref` and
spreads rest props onto the root `<div>`. Incoming values are normalised: yaw
wraps into 0–360, elevation clamps to ±90, both round to 0.1°.

## Tokens used

| Token                                       | Role in this component                                  |
| ------------------------------------------- | ------------------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control`   | Dial face fill and outline; readout disc outline        |
| `--fk-bg-raised`                            | Readout disc fill; handle outline stroke                |
| `--fk-border`                               | Yaw ring, inner ring, minor ticks                       |
| `--fk-text-tertiary`                        | Major ticks, cardinal letters, readout captions         |
| `--fk-text-primary` / `--fk-text-secondary` | Elevation value / yaw value in the readout              |
| `--fk-accent`                               | Spoke, handle, light rays, focus stroke                 |
| `--fk-accent-subtle`                        | Handle halo; `light` variant centre wash                |
| `--fk-accent-muted`                         | Yaw ring in the `light` variant                         |
| `--fk-font-sans`, `--fk-fw-medium`          | Cardinal and readout text                               |
| `--fk-orbit-dial-size`                      | Component-local diameter variable set per size modifier |

## Keyboard & accessibility

- The SVG canvas is the single focusable control: `role="slider"` with `tabIndex={0}` while editable, `role="img"` (not focusable) when read-only or disabled.
- `aria-valuemin={0}` / `aria-valuemax={359}` / `aria-valuenow` track the rounded yaw; `aria-valuetext` announces both axes with their labels plus a usage hint for the arrow keys and Shift-snap.
- <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> adjust yaw and <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> adjust elevation by `step` degrees; hold <kbd>Shift</kbd> for five increments. The increment floors at 0.1°.
- <kbd>Home</kbd> sets yaw to 0° (north); <kbd>End</kbd> sets yaw to 180° (south). Elevation is untouched.
- Pointer drag (primary button, with pointer capture) sets yaw from the pointer's angle around the centre — anywhere on the dial, not just the handle. Hold <kbd>Shift</kbd> while dragging to snap yaw to the 15° ticks. Elevation is keyboard-only.
- Ticks, cardinals, spoke, rays, and the readout are `aria-hidden` decoration; the value is conveyed by the slider semantics.
- `:focus-visible` draws the kit accent as a 2px stroke on the dial face; forced-colors mode remaps the dial to `Canvas`/`CanvasText`/`Highlight` system colors.

## Examples

```tsx
import { useState } from 'react';
import { OrbitDial, type OrbitDialValue } from '@presentstandards/framekit-ui';

export function SunAngleControl() {
  const [orbit, setOrbit] = useState<OrbitDialValue>({ yaw: 135, elevation: 42 });

  return (
    <OrbitDial
      variant="light"
      size="sm"
      value={orbit}
      onValueChange={setOrbit}
      yawLabel="Azimuth"
      elevationLabel="Altitude"
      label="Sun position"
    />
  );
}
```

## Do / Don't

- **Do** relabel the axes for the domain — `Azimuth`/`Altitude` for a sun, `Heading`/`Pitch` for a camera — via `yawLabel` and `elevationLabel`; the labels feed both the readout and the screen-reader text.
- **Do** pair the dial with numeric fields bound to the same value when users need exact degrees.
- **Do** use the `light` variant only for directional-light-style parameters; keep `camera` as the default.
- **Don't** rely on pointer input alone for elevation — dragging only edits yaw, so keep the dial keyboard-reachable or provide a separate elevation control.
- **Don't** store yaw outside 0–360 or elevation outside ±90 expecting round-tripping; the dial normalises on every change.
