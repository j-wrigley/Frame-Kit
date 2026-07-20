---
name: Popover
status: stable
since: 0.1.0
import: import { Popover } from '@presentstandards/framekit-ui'
---

# Popover

> A viewport-aware, non-modal panel for compact actions, settings, and supporting information.

## When to use

- A small, contextual group of actions that belongs beside one trigger.
- A temporary setting panel that benefits from keeping its trigger visible.
- Supporting information that should remain connected to the control that requested it.

## When not to use

- Use `Dropdown` when a user is selecting one value from a short option list.
- Use `NestedDropdown` or `Disclosure` for persistent inspector settings with a visible summary.
- Use `ContextMenu` for right-click object actions and `Tooltip` for short, non-interactive help.
- Do not put an entire form, workflow, or confirmation step in a popover.

## Anatomy

`Popover` wraps one trigger and renders a fixed, non-modal `dialog` surface when open. The
surface keeps a deliberate gap from its trigger and uses the standard raised Frame Kit panel
treatment.

## Props

| Prop           | Type                             | Default          | Description                                                             |
| -------------- | -------------------------------- | ---------------- | ----------------------------------------------------------------------- |
| `trigger`      | `ReactElement`                   | —                | Required interactive element that opens and anchors the surface.        |
| `children`     | `ReactNode`                      | —                | Panel content; use regular Frame Kit controls where appropriate.        |
| `open`         | `boolean`                        | —                | Controlled open state.                                                  |
| `defaultOpen`  | `boolean`                        | `false`          | Initial uncontrolled state.                                             |
| `onOpenChange` | `(open: boolean) => void`        | —                | Called when the popover requests opening or closing.                    |
| `placement`    | `PopoverPlacement`               | `'bottom-start'` | Preferred side and alignment. It flips, then clamps, at viewport edges. |
| `size`         | `'sm' \| 'md' \| 'lg' \| 'auto'` | `'md'`           | Fixed 192px, 264px, or 340px width; `auto` fits compact child content.  |
| `offset`       | `number`                         | `8`              | Pixel gap between anchor and surface.                                   |
| `panelLabel`   | `string`                         | `'Popover'`      | Accessible name for the non-modal dialog.                               |
| `autoFocus`    | `boolean`                        | `false`          | Moves focus to the first enabled control after opening.                 |

`PopoverPlacement` accepts `top`, `right`, `bottom`, or `left`, each with optional
`-start` and `-end` alignment. The component forwards its ref and standard `<span>`
attributes to the root.

## Tokens used

| Token                         | Role in this component             |
| ----------------------------- | ---------------------------------- |
| `--fk-bg-raised`              | Popover surface fill.              |
| `--fk-border-control`         | Surface edge.                      |
| `--fk-shadow-md`              | Temporary elevated depth.          |
| `--fk-radius-md`              | Panel corner radius.               |
| `--fk-space-3`                | Panel padding and internal rhythm. |
| `--fk-duration` / `--fk-ease` | Entrance motion.                   |

## Keyboard & accessibility

- The cloned trigger exposes `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`.
- A trigger that is already a native button keeps its normal Enter and Space activation.
- Escape closes the panel and returns focus to the trigger.
- Pointer interaction outside the trigger and panel closes it.
- The surface has `role="dialog"` and `aria-modal="false"`; use `panelLabel` to name it.
- `autoFocus` is opt-in so the trigger remains the active element for lightweight information.

## Examples

```tsx
import { Button, Popover, Slider } from '@presentstandards/framekit-ui';

<Popover trigger={<Button>Layer effects</Button>} placement="bottom-end" panelLabel="Layer effects">
  <Slider
    label="Opacity"
    value={opacity}
    onValueChange={setOpacity}
    formatValue={(value) => `${value}%`}
  />
</Popover>;
```

## Do / Don't

- **Do** keep panel content compact, focused, and directly related to the trigger.
- **Do** use a clear `panelLabel`, especially when the panel contains controls.
- **Do** control `open` when another surface in the same region must close first.
- **Don't** use a popover as a substitute for a persistent inspector or full dialog.
- **Don't** force focus into a read-only help panel; leave `autoFocus` off.
