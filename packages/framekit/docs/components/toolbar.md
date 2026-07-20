---
name: Toolbar
status: stable
since: 0.1.0
import: import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@presentstandards/framekit-ui'
---

# Toolbar

> Keyboard-navigable groups for canvas tools, inspector actions, and vertical rails.

## When to use

- A short set of related command buttons or persistent tool modes.
- A vertical canvas rail, including a grouped tool with alternate modes.
- A roomier tool surface that needs larger pointer targets.

## When not to use

- A group of text actions with long labels — use a menu or command list.
- A set of unrelated page actions — compose individual Buttons instead.

## Props

### `Toolbar`

| Prop          | Type                         | Default        | Description                                                     |
| ------------- | ---------------------------- | -------------- | --------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction and arrow-key direction.                       |
| `variant`     | `'solid' \| 'ghost'`         | `'solid'`      | A contained control well or transparent treatment.              |
| `size`        | `'compact' \| 'large'`       | `'compact'`    | Dense original targets or roomier 34px enclosed button targets. |

### `ToolbarGroup`

| Prop           | Type                  | Default   | Description                                   |
| -------------- | --------------------- | --------- | --------------------------------------------- |
| `trigger`      | `ReactElement`        | —         | The button that reveals the related controls. |
| `placement`    | `'right' \| 'bottom'` | `'right'` | Flyout direction.                             |
| `holdDelay`    | `number`              | `400`     | Press-and-hold duration in milliseconds.      |
| `open`         | `boolean`             | —         | Controlled flyout state.                      |
| `onOpenChange` | `(open) => void`      | —         | Reports requested flyout state changes.       |

`ToolbarSeparator` renders a semantic separator. Its `orientation` defaults to
`'vertical'`; pass `'horizontal'` inside a vertical toolbar.

## Keyboard & accessibility

- The root has `role="toolbar"`. Name it with `aria-label` or `aria-labelledby`.
- Left/Right move horizontally; Up/Down move vertically. Home and End jump to
  the first and last enabled buttons.
- Mark mutually exclusive tools with `aria-pressed`.
- A `ToolbarGroup` opens on click or press-and-hold. `Alt+ArrowDown` opens it
  from a keyboard; Escape closes it and restores focus to its trigger.

## Example

```tsx
<Toolbar size="large" aria-label="Canvas tools">
  <Button
    variant="ghost"
    size="sm"
    iconStart={<CursorArrowIcon />}
    aria-label="Select"
    aria-pressed
  />
  <Button variant="ghost" size="sm" iconStart={<MoveIcon />} aria-label="Move" />
  <ToolbarSeparator />
  <Button variant="ghost" size="sm" iconStart={<MixerHorizontalIcon />} aria-label="Settings" />
</Toolbar>
```

Use the unchanged default `size="compact"` for dense inspector and canvas
surfaces. The toolbar promotes its enclosed Button targets automatically when
you choose `large`.
