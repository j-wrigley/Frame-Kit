---
name: Loop composer
status: stable
since: 0.1.0
import: import { LoopComposer } from '@presentstandards/framekit-ui'
---

# Loop composer

> A compact playback-loop editor for motion and effects: repeat or ping-pong direction, terminal
> hold, start offset, and seam closure stay visible in one stable timeline.

## When to use

- Loop behaviour on an animation, effect, or procedural preset where direction, repeat count,
  hold, and start offset are one combined decision.
- Inspector panels for exported clips — boomerang toggles, seamless-loop checks, cycle counts.
- Anywhere the seam matters: the timeline shows a dashed accent seam when the loop closes and
  red endpoint dots when it does not.

## When not to use

- One numeric parameter on its own — use [Slider](./slider.md) or [Stepper](./stepper.md).
- Scrubbing a playhead through time — use [Scrubber](./scrubber.md).
- Editing keyframe timing — use [Keyframe lane](./keyframe-lane.md); shaping acceleration — use
  [Easing graph](./easing-graph.md).

## Anatomy

Root `<div>` (`fk-loop-composer`, `role="group"`) stacking three rows. The toolbar
(`fk-loop-composer__toolbar`) holds a two-option direction radio group (`fk-loop-composer__mode`
of `fk-loop-composer__mode-button` radios: **Repeat** / **Ping-pong**) and a **Seamless** switch
(`fk-loop-composer__seamless`).

The canvas is an SVG timeline (`fk-loop-composer__canvas`) on a bordered surface
(`fk-loop-composer__surface`). It draws one segment per repeat (`fk-loop-composer__segment`) with
a direction arrow (`fk-loop-composer__arrow`); in ping-pong mode every second segment is marked
`data-reverse` and rendered in accent. Segments with `hold > 0` carry a hold bar (`fk-loop-composer__hold`)
sized by `hold`. Beneath the segments, a dashed accent seam line (`fk-loop-composer__seam`)
appears when `seamless` is on, or red open-endpoint dots (`fk-loop-composer__open-endpoints`)
when it is off. The accent offset handle (`fk-loop-composer__offset`) rides the top track
(`fk-loop-composer__offset-track`) and is dragged through a full-width invisible hit rect
(`fk-loop-composer__offset-interaction`).

Below the canvas, three labelled range fields (`fk-loop-composer__controls` /
`fk-loop-composer__field`) edit **Cycles**, **Hold**, and **Offset**, each with a live mono
readout. When `editable` is false or `disabled` is true the root takes
`fk-loop-composer--readonly` and mutes to 62% opacity.

## Props

| Prop            | Type                                 | Default                                   | Description                                                                   |
| --------------- | ------------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------- |
| `value`         | `LoopComposerValue`                  | —                                         | Controlled loop behaviour.                                                    |
| `defaultValue`  | `LoopComposerValue`                  | Repeat ×3, 16% hold, 12% offset, seamless | Initial loop behaviour when uncontrolled.                                     |
| `onValueChange` | `(value: LoopComposerValue) => void` | —                                         | Called after any loop control changes, with the normalised value.             |
| `minRepeats`    | `number`                             | `1`                                       | Lowest permitted repeat count (floored at 1).                                 |
| `maxRepeats`    | `number`                             | `8`                                       | Highest permitted repeat count.                                               |
| `editable`      | `boolean`                            | `true`                                    | Enables loop controls and direct offset adjustment.                           |
| `disabled`      | `boolean`                            | `false`                                   | Disables interaction and mutes the composer.                                  |
| `step`          | `number`                             | `0.01`                                    | Arrow-key offset increment (floored at `0.001`); Shift moves five increments. |
| `label`         | `string`                             | `'Loop composer'`                         | Accessible component name.                                                    |

Extends the native `<div>` attributes except `defaultValue` and `onChange`. Forwards `ref` to the
root `<div>`; spreads rest props onto it.

### LoopComposerValue

```ts
type LoopComposerMode = 'repeat' | 'ping-pong';

interface LoopComposerValue {
  mode: LoopComposerMode; // each iteration restarts, or reverses direction
  repeats: number; // iterations in the visible loop
  hold: number; // portion of each iteration held at its terminal value, 0–1
  offset: number; // normalised loop start offset, 0–1
  seamless: boolean; // final frame connects cleanly back to the first
}
```

Every incoming and outgoing value is normalised: `repeats` rounds and clamps into
`minRepeats`–`maxRepeats`, `hold` and `offset` clamp to `0`–`1` and round to three decimals, and
an unknown `mode` falls back to `'repeat'`.

## Tokens used

| Token                                                             | Role in this component                                                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `--fk-bg-control` / `-hover`, `--fk-bg-raised`                    | Canvas surface, mode group fill, slider tracks, thumbs, handle core                            |
| `--fk-border-control`                                             | Canvas outline, mode group border, segment dividers                                            |
| `--fk-accent` / `--fk-accent-subtle` / `--fk-accent-muted`        | Offset handle, hold bars, seam line, ping-pong return passes, slider progress, switch on-state |
| `--fk-danger`                                                     | Open-endpoint dots when `seamless` is off                                                      |
| `--fk-text-primary` / `-secondary` / `-tertiary`                  | Field labels and readouts, segment strokes and arrows, offset track                            |
| `--fk-font-sans`, `--fk-font-mono`, `--fk-fs-0`, `--fk-fw-medium` | Control type; readouts are mono                                                                |
| `--fk-radius-sm`, `--fk-radius-full`                              | Mode group and slider shape                                                                    |
| `--fk-space-2`, `--fk-space-3`                                    | Row, field, and toolbar gaps                                                                   |
| `--fk-shadow-sm`                                                  | Selected mode button, slider thumbs                                                            |
| `--fk-duration-fast`, `--fk-ease`                                 | Seamless switch motion                                                                         |
| `--fk-focus-outline`                                              | Focus ring on buttons, switch, and range inputs                                                |

The component also writes a private `--fk-loop-composer-progress` variable inline on each range
input to paint the filled portion of its track.

## Keyboard & accessibility

- Root is `role="group"` named by `label`.
- Direction options are native buttons with `role="radio"` and `aria-checked` inside a
  `role="radiogroup"` labelled "Loop direction"; each is its own tab stop and
  <kbd>Enter</kbd> / <kbd>Space</kbd> selects.
- Seamless is a native button with `role="switch"` and `aria-checked`; its track visual is
  `aria-hidden`.
- The timeline's offset hit area is a `role="slider"` (`tabIndex 0`) reporting `0`–`100` with an
  `aria-valuetext` that names the percentage and how to adjust it. <kbd>←</kbd> / <kbd>→</kbd>
  move by `step` (<kbd>Shift</kbd> for five increments); <kbd>Home</kbd> / <kbd>End</kbd> jump
  to 0% / 100%. Dragging uses pointer capture and responds to the primary button only.
- The SVG is always named "Loop offset timeline" — `role="group"` while editable,
  downgrading to `role="img"` when not, at which point the offset rect also loses
  its slider role and tab stop.
- Cycles, Hold, and Offset are native `type="range"` inputs labelled "Repeat count", "Loop hold",
  and "Loop offset value", so platform slider keys apply.
- `disabled` disables every toolbar button and range input natively.
- Forced-colors mode keeps the timeline legible: accent marks map to `Highlight`, strokes to
  `CanvasText`.

## Examples

```tsx
import { useState } from 'react';
import { LoopComposer, type LoopComposerValue } from '@presentstandards/framekit-ui';

export function PlaybackLoopSection() {
  const [loop, setLoop] = useState<LoopComposerValue>({
    mode: 'ping-pong',
    repeats: 4,
    hold: 0.2,
    offset: 0,
    seamless: true,
  });

  return <LoopComposer value={loop} onValueChange={setLoop} maxRepeats={6} label="Playback loop" />;
}
```

## Do / Don't

- **Do** make this the single home for loop behaviour in an inspector — direction, repeats,
  hold, offset, and seam belong together, not spread across separate controls.
- **Do** persist `LoopComposerValue` directly; it is normalised on every change, so stored
  values are already clamped and rounded.
- **Don't** add a second offset control next to it — the timeline handle and the Offset field
  already edit the same value.
- **Don't** raise `maxRepeats` far beyond the default; segments share a fixed-width timeline
  and compress as the count grows.
- **Don't** put transport controls such as play or pause inside it; it composes loop behaviour,
  it does not drive playback.
