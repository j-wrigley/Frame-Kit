---
name: Envelope editor
status: stable
since: 0.1.0
import: import { EnvelopeEditor } from '@presentstandards/framekit-ui'
---

# Envelope editor

> A direct-manipulation AHDSR envelope — attack, hold, decay, sustain, release —
> drawn as a draggable curve for audio, effects, and generative motion tools.

## When to use

- Shaping a parameter over a lifetime: amplitude or filter envelopes, effect
  intensity, particle energy, generative-motion response.
- Inspector panels where the whole envelope should stay visible and every stage
  is grabbable in place — no mode switching, no separate per-stage sliders.

## When not to use

- Interpolation between two keyframes — use [Easing graph](./easing-graph.md).
- Physics-feel motion tuned by stiffness and damping — use
  [Spring response](./spring-response.md).
- A single static level — use [Slider](./slider.md) or
  [Drag value](./drag-value.md).

## Anatomy

Renders a root `<div>` (`fk-envelope-editor`, plus
`fk-envelope-editor--{variant}`, `fk-envelope-editor--{density}`, and
`fk-envelope-editor--readonly` when read-only or disabled) wrapping a single responsive
SVG canvas (`fk-envelope-editor__canvas`). Inside: a bordered surface rect
(`__surface`), a quiet third-line grid (`__grid`), a baseline (`__baseline`),
the filled region under the curve (`__area`), and the envelope polyline itself
(`__curve`).

When editable and enabled, four handles (`__handles` > `__handle`) sit on the
curve — attack end, hold end, decay end, and release start. Each is a group of
three circles: an invisible enlarged hit circle (`__handle-hit`, radius 9 viewBox units), a focus ring
(`__handle-focus`), and the visible dot (`__handle-outer`). Dragging a handle
adjusts its stage's duration; the decay handle also sets the sustain level
vertically. Handles are not rendered at all when the editor is read-only or
disabled.

The `audio` variant tints the area under the curve; the `motion` variant tints
it and dashes the curve. The `compact` density shortens the canvas from a
360 / 128 to a 360 / 96 aspect ratio.

## Props

| Prop            | Type                               | Default                                                                 | Description                                                         |
| --------------- | ---------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `value`         | `EnvelopeValue`                    | —                                                                       | Controlled ADSR-style envelope values.                              |
| `defaultValue`  | `EnvelopeValue`                    | `{ attack: 0.1, hold: 0.12, decay: 0.18, sustain: 0.62, release: 0.2 }` | Initial envelope when uncontrolled.                                 |
| `onValueChange` | `(value: EnvelopeValue) => void`   | —                                                                       | Called with the normalised next envelope after a direct adjustment. |
| `variant`       | `'default' \| 'audio' \| 'motion'` | `'default'`                                                             | Visual treatment for general, audio, or motion tools.               |
| `density`       | `'default' \| 'compact'`           | `'default'`                                                             | Compresses the editor for inspector-width compositions.             |
| `editable`      | `boolean`                          | `true`                                                                  | Enables direct manipulation and keyboard adjustment.                |
| `disabled`      | `boolean`                          | `false`                                                                 | Disables direct manipulation and mutes the editor.                  |
| `step`          | `number`                           | `0.01`                                                                  | Arrow-key increment. Hold Shift for five increments.                |
| `label`         | `string`                           | `'Envelope editor'`                                                     | Accessible editor name.                                             |

Extends the native `<div>` attributes (minus `defaultValue` and `onChange`).
Forwards `ref` to the root `<div>`; spreads rest props onto it.

```ts
type EnvelopeValue = {
  attack: number; // normalized attack duration
  hold: number; // normalized hold duration at peak level
  decay: number; // normalized decay duration
  sustain: number; // sustained level from 0 to 1
  release: number; // normalized release duration
};

type EnvelopeEditorVariant = 'default' | 'audio' | 'motion';
type EnvelopeEditorDensity = 'default' | 'compact';
```

All five fields are fractions of the plot. Every incoming and outgoing value is
normalised: each duration is kept at a minimum of `0.02`, the four durations
together are scaled down to fit within `0.94` so the sustain plateau never
collapses, `sustain` is clamped to `0–1`, and everything is rounded to three
decimals. Store exactly what `onValueChange` hands you.

## Tokens used

| Token                                     | Role in this component                           |
| ----------------------------------------- | ------------------------------------------------ |
| `--fk-bg-control` / `--fk-border-control` | Plot surface fill and outline                    |
| `--fk-border`                             | Third-line grid (at 18% opacity)                 |
| `--fk-text-tertiary`                      | Baseline and resting handle outline              |
| `--fk-bg-raised`                          | Resting handle fill                              |
| `--fk-accent`                             | Curve stroke, focus ring, dragging handle fill   |
| `--fk-accent-subtle`                      | Area fill under the curve (`audio` and `motion`) |

## Keyboard & accessibility

- Each handle is a focusable `role="button"` SVG group whose `aria-label`
  announces the stage ("Attack end"), its duration as a percentage, and — on
  the decay and release handles — the current sustain level.
- <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> move the focused handle's timing
  point by `step` (floored at `0.001`); hold <kbd>Shift</kbd> for five increments.
- <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> on the decay handle raise or lower
  the sustain level by the same increment. The release handle also captures
  these keys (suppressing page scroll) but leaves the value unchanged.
- Dragging uses pointer capture, so movement keeps tracking outside the plot;
  hold <kbd>Shift</kbd> while dragging to snap timing points to a 5% grid.
  Keyboard adjustments are always exact.
- The SVG is `role="group"` with the `label` as its accessible name while
  editable, and downgrades to `role="img"` when read-only or disabled — handles
  are removed entirely, so nothing inert receives focus.
- Grid, baseline, area, and curve are `aria-hidden`; in forced-colors mode the
  curve and handles map to `Highlight` and the surface to `Canvas`.

## Examples

```tsx
import { useState } from 'react';
import { EnvelopeEditor, type EnvelopeValue } from '@presentstandards/framekit-ui';

export function AmpEnvelope() {
  const [envelope, setEnvelope] = useState<EnvelopeValue>({
    attack: 0.06,
    hold: 0.1,
    decay: 0.22,
    sustain: 0.55,
    release: 0.3,
  });

  return (
    <EnvelopeEditor
      variant="audio"
      value={envelope}
      onValueChange={setEnvelope}
      label="Amplitude envelope"
    />
  );
}
```

## Do / Don't

- **Do** pick the variant that matches the tool: `audio` for sound envelopes,
  `motion` for animation-energy curves, `default` elsewhere.
- **Do** pair the plot with [Drag value](./drag-value.md) fields when users
  need exact per-stage numbers; keep the editor as the direct surface.
- **Do** map the normalized durations to real time in your own model — the
  editor deliberately owns proportions, not seconds.
- **Don't** reach for it to edit a keyframe interpolation curve; that is
  [Easing graph](./easing-graph.md)'s job.
- **Don't** feed it un-normalised values and expect them back verbatim —
  minimum segment widths, the total-duration cap, and rounding are applied on
  every change.
