---
name: Modulation strip
status: stable
since: 0.1.0
import: import { ModulationStrip } from '@presentstandards/framekit-ui'
---

# Modulation strip

> A compact waveform preview and direct manipulation surface for procedural loops and effects.

## When to use

- Motion or effects inspectors that need a readable loop preview beside exact controls.
- Repeating behaviour such as oscillation, flicker, breathing, drift, or automated transforms.
- Interfaces where phase and intensity benefit from a quick visual adjustment before numeric tuning.

## When not to use

- Use `EasingGraph` for the acceleration of a one-shot transition.
- Use `KeyframeLane` when individual events need to occur at explicit times.
- Do not use this component as a sampled audio editor, oscilloscope, or generic data chart.

## Anatomy

`ModulationStrip` renders a bounded waveform surface, quiet timing guides, a rate-derived cycle density,
and one slider-style handle. Waveform and rate determine the plotted shape; the handle directly adjusts
phase horizontally and intensity vertically. Compose the strip with `SegmentedSwitch` for wave choice,
`NumberInput` for exact rate and phase, and `Slider` for precise intensity.

## Props

| Prop            | Type                                    | Default                      | Description                                                     |
| --------------- | --------------------------------------- | ---------------------------- | --------------------------------------------------------------- |
| `value`         | `ModulationStripValue`                  | —                            | Controlled waveform `{ waveform, phase, rate, intensity }`.     |
| `defaultValue`  | `ModulationStripValue`                  | Sine, `0.18`, `1.25`, `0.72` | Initial uncontrolled value.                                     |
| `onValueChange` | `(value: ModulationStripValue) => void` | —                            | Called after phase or intensity changes in the strip.           |
| `minRate`       | `number`                                | `0.25`                       | Lowest accepted cycles-per-second rate.                         |
| `maxRate`       | `number`                                | `4`                          | Highest accepted cycles-per-second rate.                        |
| `editable`      | `boolean`                               | `true`                       | Enables direct pointer and keyboard phase/intensity adjustment. |
| `disabled`      | `boolean`                               | `false`                      | Prevents direct adjustment and mutes the strip.                 |
| `step`          | `number`                                | `0.01`                       | Arrow-key increment; Shift multiplies it by five.               |
| `label`         | `string`                                | `'Modulation strip'`         | Accessible preview name.                                        |

`ModulationWaveform` is `'sine' | 'triangle' | 'saw' | 'square'`. `phase` and `intensity` are constrained
to 0–1; `rate` is constrained by `minRate` and `maxRate`.

## Tokens used

| Token                                     | Role in this component                                       |
| ----------------------------------------- | ------------------------------------------------------------ |
| `--fk-bg-control` / `--fk-border-control` | Contained waveform surface.                                  |
| `--fk-text-tertiary`                      | Quiet timing and amplitude guides.                           |
| `--fk-accent`                             | Waveform, direct handle, focus indication, and active state. |
| `--fk-bg-raised`                          | Resting handle fill.                                         |

## Keyboard & accessibility

- In editable mode, the direct handle is a focusable button that announces waveform, phase, rate, and intensity.
- Left/Right changes phase; Up/Down changes intensity; Shift multiplies the configured `step` by five.
- Home moves phase to the loop start; End moves it to the final increment before the loop repeats.
- Pointer adjustment maps horizontal travel to phase and vertical distance from the centre line to intensity.
- With `editable={false}`, the component is a labelled static waveform without a focusable handle.

## Example

```tsx
import { ModulationStrip, type ModulationStripValue } from '@presentstandards/framekit-ui';

const [modulation, setModulation] = useState<ModulationStripValue>({
  waveform: 'sine',
  phase: 0.18,
  rate: 1.25,
  intensity: 0.72,
});

<ModulationStrip
  value={modulation}
  onValueChange={setModulation}
  label="Loop modulation waveform"
/>;
```

## Do / Don't

- **Do** use the visible cycle density to give rate a quick, understandable read.
- **Do** keep waveform selection and exact rate controls nearby in the inspector.
- **Do** treat intensity as an amplitude, not a colour or visual emphasis setting.
- **Don't** use the strip to represent one-shot easing or discrete timeline events.
- **Don't** add noisy grid decoration that does not map to a loop decision.
