---
name: Easing graph
status: stable
since: 0.1.0
import: import { EasingGraph } from '@presentstandards/framekit-ui'
---

# Easing graph

> A token-pure cubic-bezier graph for inspecting and directly shaping animation timing.

## When to use

- Motion inspectors where a cubic-bezier curve needs a visual companion.
- Animation presets that occasionally need a custom curve.
- Creative tools where a compact graph and precise control-point values belong together.

## When not to use

- Use `SegmentedSwitch` for a short categorical timing mode, not a continuous curve.
- Use `Slider` for a single continuous value such as duration or opacity.
- Do not use this graph to represent a data series, timeline, or chart.

## Anatomy

`EasingGraph` renders a contained graph surface, quiet interior grid, linear reference,
cubic-bezier path, and—when editable—two circular slider-style control handles with guide lines.
Compose it with `Dropdown` for presets and `NumberInput` for exact control-point values.

## Props

| Prop            | Type                           | Default          | Description                                                               |
| --------------- | ------------------------------ | ---------------- | ------------------------------------------------------------------------- |
| `value`         | `EasingCurve`                  | —                | Controlled `{ x1, y1, x2, y2 }` curve. Every value is constrained to 0–1. |
| `defaultValue`  | `EasingCurve`                  | `ease`           | Initial uncontrolled curve.                                               |
| `onValueChange` | `(curve: EasingCurve) => void` | —                | Called after a pointer or keyboard adjustment.                            |
| `editable`      | `boolean`                      | `true`           | Shows and enables both direct-manipulation handles.                       |
| `disabled`      | `boolean`                      | `false`          | Prevents editing and mutes the graph.                                     |
| `step`          | `number`                       | `0.01`           | Arrow-key increment; Shift moves five increments.                         |
| `label`         | `string`                       | `'Easing curve'` | Accessible graph name.                                                    |

`EasingCurve` contains numeric `x1`, `y1`, `x2`, and `y2` values. The component forwards its
ref and standard `<div>` attributes to the root.

## Tokens used

| Token                                     | Role in this component                             |
| ----------------------------------------- | -------------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control` | Graph surface and edge.                            |
| `--fk-border`                             | Quiet interior grid.                               |
| `--fk-text-tertiary`                      | Linear reference and control-handle guide lines.   |
| `--fk-accent`                             | Cubic curve, slider-style handles, and focus ring. |
| `--fk-bg-raised`                          | Handle fill.                                       |

## Keyboard & accessibility

- With `editable`, each control point is focusable and announces its x/y values and adjustment hint.
- Arrow keys adjust the focused point; Shift multiplies the configured `step` by five.
- Pointer dragging and keyboard movement are constrained to the visible 0–1 graph range.
- With `editable={false}`, the graph is exposed as a labelled static image without focusable handles.
- Use a nearby `Dropdown` and `NumberInput` when users need named presets or exact visible values.

## Examples

```tsx
import { EasingGraph, type EasingCurve } from '@presentstandards/framekit-ui';

const [curve, setCurve] = useState<EasingCurve>({
  x1: 0.25,
  y1: 0.1,
  x2: 0.25,
  y2: 1,
});

<EasingGraph value={curve} onValueChange={setCurve} editable label="Animation easing curve" />;
```

## Do / Don't

- **Do** compose the graph with a preset selector and exact value controls when both are useful.
- **Do** hide direct handles for a named preset until a user explicitly enters custom mode.
- **Do** keep the graph square-ish and visibly constrained to a single curve.
- **Don't** use an easing graph as a general data visualization or replace a duration control with it.
- **Don't** hardcode curve colours; use the accent slot supplied by the kit.
