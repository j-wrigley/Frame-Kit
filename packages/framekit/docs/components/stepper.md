---
name: Stepper
status: stable
since: 0.1.0
import: import { Stepper } from '@presentstandards/framekit-ui'
---

# Stepper

> A compact, bounded-value control with explicit decrease and increase actions.

## When to use

- Small numeric values that benefit from deliberate, repeatable increments.
- Timings, frame counts, scales, and canvas adjustments inside tool surfaces.
- A read-only value with two bounded actions by passing `editable={false}`.

## When not to use

- A broad continuous range where direct manipulation is primary — use a slider.
- A freeform text value — use `Input`.

## Props

| Prop                                      | Type                   | Default     | Description                                                               |
| ----------------------------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------- |
| `value`                                   | `string \| number`     | —           | Current value.                                                            |
| `editable`                                | `boolean`              | `true`      | Renders a native editable text input; false renders a display value.      |
| `suffix`                                  | `ReactNode`            | —           | Unit such as `S`, `PX`, `%`, or `FR`.                                     |
| `size`                                    | `'sm' \| 'md' \| 'lg'` | `'md'`      | Control height: 24 / 30 / 34px.                                           |
| `font`                                    | `'mono' \| 'sans'`     | `'mono'`    | Value typeface.                                                           |
| `onDecrement` / `onIncrement`             | `() => void`           | —           | Called by the respective action; a missing callback disables that action. |
| `decrementDisabled` / `incrementDisabled` | `boolean`              | `false`     | Disables a single action at a range boundary.                             |
| `label`                                   | `string`               | `'Stepper'` | Accessible group name.                                                    |

All standard native input attributes apply to the editable center value.
`className` applies to the stepper root.

## Value motion

Values changed through the increase or decrease actions use a compact vertical
counter flip: incrementing moves upward and decrementing moves downward.
Typing into an editable value does not animate, so text entry stays stable.
This motion is included in the packaged stylesheet and respects reduced-motion
preferences.

## Keyboard & accessibility

- The root uses `role="group"` and takes its accessible name from `label`.
- The two actions are native buttons. Give each action a specific accessible
  name when the default `Decrease value` / `Increase value` lacks context.
- The editable center is a native text input. It intentionally does not parse,
  clamp, or round: application state owns those decisions.

## Example

```tsx
<Stepper
  label="Duration"
  value={duration}
  suffix="S"
  onChange={(event) => setDuration(event.target.value)}
  onDecrement={() => setDuration(nudge(duration, -0.25))}
  onIncrement={() => setDuration(nudge(duration, 0.25))}
/>

<Stepper
  editable={false}
  label="Loop count"
  value={loops}
  decrementDisabled={loops <= 1}
  incrementDisabled={loops >= 12}
  onDecrement={() => setLoops((value) => value - 1)}
  onIncrement={() => setLoops((value) => value + 1)}
/>
```

## Do / Don't

- **Do** keep increments predictable and show unavailable range boundaries by
  disabling the relevant action.
- **Do** use display steppers when typed precision does not improve the task.
- **Don't** assume a numeric format, decimal precision, locale, or range in
  the component; keep that behavior in application state.
