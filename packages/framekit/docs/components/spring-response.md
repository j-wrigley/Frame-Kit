---
name: Spring response
status: stable
since: 0.1.0
import: import { SpringResponse } from '@presentstandards/framekit-ui'
---

# Spring response

> A physical motion inspector with mass, stiffness, damping, velocity, and a live settling graph.

## When to use

- Motion settings where natural, interruptible response needs an understandable visual reference.
- Inspector panels that should expose physical spring parameters instead of only named easing presets.
- Creative tools where overshoot, momentum, and settling are meaningful parts of the interaction.

## When not to use

- Use `EasingGraph` for a duration-bound cubic-bezier transition.
- Use `Slider` or `DragValue` when only one continuous value is being adjusted.
- Do not use a spring preview as a general time-series chart.

## Anatomy

`SpringResponse` keeps one physical model together: a contained graph, dashed target, filled
response curve, settling summary, and four direct `NumberInput` fields. Its graph is calculated
from the current parameter values; it is not a decorative animation.

## Props

| Prop            | Type                                   | Default             | Description                                                |
| --------------- | -------------------------------------- | ------------------- | ---------------------------------------------------------- |
| `value`         | `SpringResponseValue`                  | —                   | Controlled mass, stiffness, damping, and velocity values.  |
| `defaultValue`  | `SpringResponseValue`                  | `{ 1, 170, 18, 0 }` | Initial uncontrolled values.                               |
| `onValueChange` | `(value: SpringResponseValue) => void` | —                   | Called after one of the built-in parameter fields changes. |
| `density`       | `'default' \| 'compact'`               | `'default'`         | Compacts graph labels and internal spacing.                |
| `showControls`  | `boolean`                              | `true`              | Shows the four built-in direct parameter fields.           |
| `editable`      | `boolean`                              | `true`              | Enables or disables the direct parameter fields.           |
| `disabled`      | `boolean`                              | `false`             | Disables the component and mutes its response.             |
| `label`         | `string`                               | `'Spring response'` | Accessible description used for the response graph.        |

`SpringResponseValue` contains:

| Value       | Range        | Meaning                                              |
| ----------- | ------------ | ---------------------------------------------------- |
| `mass`      | `0.1`–`8`    | The apparent weight of the moving element.           |
| `stiffness` | `1`–`600`    | The restoring force that pulls it to the target.     |
| `damping`   | `0`–`100`    | The resistance that removes energy from the motion.  |
| `velocity`  | `-200`–`200` | Initial movement applied before the spring responds. |

The component forwards its ref and standard `<div>` attributes to its root.

## Accessibility

- The graph is exposed as a labelled image describing response character, settling time, damping ratio, and visible overshoot.
- Each physical parameter has a visible label and explicit decrease/increase button labels.
- Use `editable={false}` for a static comparison or saved-motion preview.

## Examples

```tsx
import { SpringResponse, type SpringResponseValue } from '@presentstandards/framekit-ui';

const [spring, setSpring] = useState<SpringResponseValue>({
  mass: 1,
  stiffness: 170,
  damping: 18,
  velocity: 0,
});

<SpringResponse value={spring} onValueChange={setSpring} label="Panel response spring" />;
```

## Do / Don't

- **Do** keep the graph and values together so a motion choice stays explainable.
- **Do** use a small overshoot for direct manipulation when it helps the response feel physical.
- **Do** use a critically or overdamped response when a clean landing matters more than expression.
- **Don't** use a spring preview to imply a behaviour that the shipped interaction does not actually use.
- **Don't** duplicate mass, stiffness, damping, and velocity controls outside the component without a clear reason.
