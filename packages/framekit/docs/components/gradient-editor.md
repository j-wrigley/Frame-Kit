---
name: Gradient editor
status: stable
since: 0.1.0
import: import { GradientEditor, GradientPicker } from '@presentstandards/framekit-ui'
---

# Gradient editor

> A production-style ramp editor with independent colour and opacity lanes, add/remove commands, reversal, and a focused midpoint.

## When to use

- Fills, overlays, masks, motion backgrounds, and effect ramps that need more than one exact colour.
- Inspector and popover workflows where colour and transparency must be edited independently.
- Creative tools that need both direct manipulation and exact application-owned value controls.

## When not to use

- Use `ColorPicker` or `ColorField` to choose one solid colour.
- Do not use it as a palette library or a large gradient canvas.
- Keep gradient geometry such as type, angle, position, and scale in the owning fill inspector.

## Anatomy

`GradientEditor` uses one consistent horizontal interaction model. Its command bar adds colour or
opacity stops, reverses the complete gradient, and removes the current selection. The upper lane
edits opacity, the central checkerboard ramp previews their combined result, the lower lane edits
colour, and a diamond biases the active colour transition.

New stops are interpolated from their neighbours. Double-click a lane to add at an exact pointer
position, or use its add command to insert a stop in the widest available gap. At least two stops
per lane are preserved.

`GradientPicker` composes the same model into a 220px surface that pairs directly with
`ColorPicker`. It uses a taller unboxed ramp, smaller square stops, and two equal exact-value
fields without carrying the inspector command bar into the popup. Use it inside a fill popover;
keep `GradientEditor` in wider inspectors.

## Props

| Prop                 | Type                               | Default                          | Description                                                      |
| -------------------- | ---------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| `value`              | `GradientEditorValue`              | —                                | Controlled colour and opacity stops.                             |
| `defaultValue`       | `GradientEditorValue`              | Three colours, two opacity stops | Initial uncontrolled stops.                                      |
| `onValueChange`      | `(value) => void`                  | —                                | Called after adding, moving, reversing, or removing a stop.      |
| `activeStop`         | `GradientEditorActiveStop \| null` | —                                | Controlled selected stop.                                        |
| `defaultActiveStop`  | `GradientEditorActiveStop \| null` | First colour stop                | Initial selected stop.                                           |
| `onActiveStopChange` | `(stop) => void`                   | —                                | Called when a stop becomes selected.                             |
| `midpoint`           | `number`                           | —                                | Relative midpoint of the active colour segment, from `0` to `1`. |
| `defaultMidpoint`    | `number`                           | `0.5`                            | Initial uncontrolled midpoint.                                   |
| `onMidpointChange`   | `(midpoint) => void`               | —                                | Called after dragging or key-adjusting the midpoint.             |
| `step`               | `number`                           | `0.01`                           | Arrow-key increment; Shift moves five increments.                |
| `showActions`        | `boolean`                          | `true`                           | Shows add, reverse, and remove commands above the lanes.         |
| `density`            | `'default' \| 'compact'`           | `'default'`                      | Compresses lane and command geometry for narrow composition.     |
| `editable`           | `boolean`                          | `true`                           | Enables direct editing and commands.                             |
| `disabled`           | `boolean`                          | `false`                          | Prevents interaction and mutes the editor.                       |
| `label`              | `string`                           | `'Gradient editor'`              | Accessible editor name.                                          |

```ts
type GradientEditorValue = {
  colorStops: readonly { id: string; color: string; position: number }[];
  alphaStops: readonly { id: string; opacity: number; position: number }[];
};

type GradientEditorActiveStop = {
  kind: 'color' | 'alpha';
  id: string;
};
```

## Keyboard & accessibility

- Every colour stop, opacity stop, and midpoint is a focusable direct-manipulation control.
- Arrow keys move the focused control; hold <kbd>Shift</kbd> for larger edits.
- <kbd>Home</kbd> and <kbd>End</kbd> move a stop to the ramp bounds.
- <kbd>Delete</kbd> or <kbd>Backspace</kbd> removes the selected stop when its lane has more than two stops.
- Each handle announces its type, value, and position; icon-only commands have accessible names.

## Example

```tsx
import { GradientEditor, type GradientEditorValue } from '@presentstandards/framekit-ui';

const [gradient, setGradient] = useState<GradientEditorValue>({
  colorStops: [
    { id: 'start', color: '#111827', position: 0 },
    { id: 'end', color: '#f43f5e', position: 1 },
  ],
  alphaStops: [
    { id: 'visible', opacity: 1, position: 0 },
    { id: 'fade', opacity: 0.3, position: 1 },
  ],
});

<GradientEditor value={gradient} onValueChange={setGradient} label="Background gradient" />;
```

## Pairing with Color picker

Use `Tabs` inside an auto-sized `Popover` when one fill can be either a solid colour or a gradient.
Keep the solid colour, gradient, and selected fill mode in parent state; the tabs only switch the
editing surface. `ColorPicker` and `GradientPicker` share a 220px width, so the panel has no dead
space in either mode.

```tsx
<Popover size="auto" panelLabel="Fill picker" trigger={<Button>Edit fill</Button>}>
  <Tabs
    value={fillMode}
    onValueChange={setFillMode}
    variant="contained"
    fullWidth
    items={[
      {
        value: 'colour',
        label: 'Colour',
        content: <ColorPicker value={fill} onChange={setFill} />,
      },
      {
        value: 'gradient',
        label: 'Gradient',
        content: <GradientPicker value={gradient} onValueChange={setGradient} />,
      },
    ]}
  />
</Popover>
```

## Do / Don't

- **Do** keep opacity in its own upper lane.
- **Do** compose `ColorInput`, `NumberInput`, or `ColorPicker` around the selected stop when exact values are required.
- **Do** use `showActions={false}` only when equivalent commands already exist in the parent surface.
- **Don't** create different editor shapes for different contexts; preserve the horizontal ramp model.
- **Don't** put geometry such as gradient angle into the stop value; it belongs to the owning fill.
