---
name: Direction pad
status: stable
since: 0.1.0
import: import { DirectionPad } from '@presentstandards/framekit-ui'
---

# Direction pad

> A token-pure compass selector for clear, discrete spatial decisions.

## When to use

- Motion, alignment, placement, or directional-effect inspectors.
- Eight-way controls where diagonals are meaningful choices.
- Cardinal-only controls for axis-constrained actions such as alignment or nudging.

## When not to use

- Use `AxisField` for two continuous values shaped together.
- Use `CameraPath` for an ordered spatial route.
- Use a `Slider`, `RulerSlider`, or `NumberInput` for continuous magnitude, strength, or distance.

## Anatomy

`DirectionPad` renders a compact 3 × 3 compass surface: four cardinal directions, optional
diagonals, and a neutral center cell. The selected direction receives the restrained accent
treatment. The component expresses a discrete direction only; compose it with a nearby continuous
control when magnitude or strength is needed.

## Props

| Prop            | Type                        | Default       | Description                                                                     |
| --------------- | --------------------------- | ------------- | ------------------------------------------------------------------------------- |
| `value`         | `DirectionPadDirection`     | —             | Controlled selected direction.                                                  |
| `defaultValue`  | `DirectionPadDirection`     | `'center'`    | Initial uncontrolled direction. Diagonals normalize to center in cardinal mode. |
| `onValueChange` | `(direction) => void`       | —             | Called after selecting a direction or the neutral center.                       |
| `mode`          | `'eight-way' \| 'cardinal'` | `'eight-way'` | Shows all eight compass directions or the four cardinal directions.             |
| `size`          | `'sm' \| 'md'`              | `'md'`        | Pad density. Use small in tightly constrained surfaces.                         |
| `disabled`      | `boolean`                   | `false`       | Disables every direction action.                                                |
| `label`         | `string`                    | `'Direction'` | Accessible pad name.                                                            |
| `centerLabel`   | `string`                    | `'Center'`    | Accessible label for the neutral center action.                                 |

`DirectionPadDirection` is `'center'`, `'up'`, `'up-right'`, `'right'`, `'down-right'`, `'down'`,
`'down-left'`, `'left'`, or `'up-left'`. The component forwards its ref and standard `<div>`
attributes to the root.

## Tokens used

| Token                 | Role in this component          |
| --------------------- | ------------------------------- |
| `--fk-bg-control`     | Pad surface.                    |
| `--fk-border-control` | Outer pad edge.                 |
| `--fk-text-tertiary`  | Resting directional icons.      |
| `--fk-accent-subtle`  | Selected direction background.  |
| `--fk-accent`         | Selected icon and focus signal. |

## Keyboard & accessibility

- Every available direction is a native pressed button with an explicit accessible label.
- <kbd>Tab</kbd> moves among available cells; <kbd>Space</kbd> and <kbd>Enter</kbd> select one.
- Arrow keys choose the matching cardinal direction. From a cardinal direction, an adjacent arrow chooses the matching diagonal in eight-way mode.
- <kbd>Home</kbd> selects the neutral center cell.
- In cardinal mode, corner placeholders are omitted from the accessibility tree and tab order.
- The root group announces its current selected direction.

## Example

```tsx
import { DirectionPad, type DirectionPadDirection } from '@presentstandards/framekit-ui';

const [direction, setDirection] = useState<DirectionPadDirection>('up-right');

<DirectionPad
  value={direction}
  onValueChange={setDirection}
  label="Motion direction"
  centerLabel="Reset direction to center"
/>;
```

## Do / Don't

- **Do** use a direct cell for each meaningful directional choice.
- **Do** use the center action for neutral or reset.
- **Do** pair the pad with a nearby strength or distance control when needed.
- **Don't** use diagonal cells where only cardinal actions are meaningful; choose `mode="cardinal"`.
- **Don't** use the pad to imply continuous x/y coordinates; use `AxisField` instead.
