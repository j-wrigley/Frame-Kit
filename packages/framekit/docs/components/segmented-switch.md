---
name: Segmented switch
status: stable
since: 0.1.0
import: import { SegmentedSwitch } from '@presentstandards/framekit-ui'
---

# Segmented switch

> A quiet, compact radio group for a small fixed set of mutually exclusive tool
> settings.

## When to use

- Frame rate, quality, aspect ratio, or short playback-mode choices.
- A binary setting where **Off / On** communicates the values more clearly than
  a standalone switch.
- Dense inspector rows with two to four stable, short labels.

## When not to use

- More than a few choices, long labels, or choices that may grow — use a
  Select.
- Independent, multi-select options — use checkboxes.
- A true immediate boolean state without named alternatives — use a switch.

## Anatomy

`SegmentedSwitch` renders a `radiogroup` root, a thin shared track, a moving
raised selected surface, and native button segments with `role="radio"`.
Options have a mono, uppercase label treatment to match compact tool controls.

## Props

| Prop            | Type                      | Default       | Description                                                                        |
| --------------- | ------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `options`       | `SegmentedSwitchOption[]` | —             | Required, unique `{ value, label, disabled? }` options.                            |
| `value`         | `string`                  | —             | Controlled selected value.                                                         |
| `defaultValue`  | `string`                  | first enabled | Initial uncontrolled value. Disabled or unknown values fall back to first enabled. |
| `onValueChange` | `(value: string) => void` | —             | Called when an enabled option is chosen.                                           |
| `size`          | `'sm' \| 'md'`            | `'md'`        | Track height: 24 / 30px.                                                           |
| `fullWidth`     | `boolean`                 | `false`       | Stretches the track and divides its available width evenly between segments.       |

The component forwards its ref and standard `<div>` attributes to the
`radiogroup` root. Give it an `aria-label` or `aria-labelledby` to name the
choice group.

## Tokens used

| Token                                                | Role                                 |
| ---------------------------------------------------- | ------------------------------------ |
| `--fk-bg-control` / `--fk-bg-raised`                 | Track and selected segment surfaces. |
| `--fk-border-control`                                | Quiet 1px track boundary.            |
| `--fk-text-tertiary` / `--fk-text-secondary`         | Resting and hover labels.            |
| `--fk-accent-text`                                   | Selected label only.                 |
| `--fk-font-mono`, `--fk-fs-0`, `--fk-tracking-label` | Compact technical label treatment.   |
| `--fk-radius-sm` / `--fk-radius-xs`                  | Track and selected-surface geometry. |
| `--fk-focus-outline`                                 | Keyboard-only focus visibility.      |

## Keyboard & accessibility

- The root has `role="radiogroup"`; each segment is a native button with
  `role="radio"` and `aria-checked`.
- `Tab` enters the selected segment. Arrow keys move selection and focus across
  enabled options; `Home` and `End` choose the first and last enabled option.
- Disabled segments are unavailable to both pointer and keyboard interaction.
- Labels inside an option name that option; always name the group with
  `aria-label` or `aria-labelledby`.

## Examples

```tsx
import { SegmentedSwitch } from '@presentstandards/framekit-ui';

const frameRateOptions = [
  { value: '24', label: '24' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
];

<SegmentedSwitch
  aria-label="Frame rate"
  options={frameRateOptions}
  value={frameRate}
  onValueChange={setFrameRate}
/>

<SegmentedSwitch
  aria-label="Playback mode"
  fullWidth
  options={[
    { value: 'once', label: 'Once' },
    { value: 'loop', label: 'Loop' },
    { value: 'ping-pong', label: 'Ping-pong' },
  ]}
  value={playback}
  onValueChange={setPlayback}
/>
```

## Do / Don't

- **Do** use two to four short labels for one setting.
- **Do** use `sm` in dense rows and `fullWidth` in narrow inspectors.
- **Do** make the options' values stable strings.
- **Don't** use it for verbose labels or a changing set of options.
- **Don't** add filled pills or a strong outline: the selected surface and
  accent label provide the state signal.
