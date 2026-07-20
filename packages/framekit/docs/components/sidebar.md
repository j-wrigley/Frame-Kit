---
name: Sidebar
status: stable
since: 0.1.0
import: import { Sidebar, SidebarSection } from '@presentstandards/framekit-ui'
---

# Sidebar

> A structured inspector shell for creative tools. It can sit as a simple
> panel, attach to either workspace edge, or become a bounded floating panel
> with pointer and keyboard movement.

## When to use

- Building a persistent layer list, property inspector, tool configuration, or
  utility panel.
- Reusing the same header, scroll body, section-divider, and footer rhythm
  across several tools.
- Letting users reposition a small floating inspector without interfering with
  the controls inside it.

## When not to use

- Short contextual settings attached to one control — use
  [Popover](./popover.md) or `NestedDropdown`.
- Commands that belong together without a panel — use
  [Toolbar](./toolbar.md).
- A canvas object or artboard boundary — use [Frame](./frame.md).

## Anatomy

`Sidebar` owns the panel surface, identity header, scrollable body, and optional
persistent footer. `SidebarSection` owns full-width dividers and the density of
each labelled group. Application controls remain normal Frame Kit components;
the sidebar does not copy or restyle their interaction model.

The `panel` variant is an inset standalone surface. `docked` removes the outer
card treatment and keeps one divider on the workspace-facing edge selected by
`side`. `floating` adds elevation and supports positioning. Set `draggable`
only when the user should be able to move a floating sidebar.

## Sidebar props

| Prop               | Type                                | Default            | Description                                         |
| ------------------ | ----------------------------------- | ------------------ | --------------------------------------------------- |
| `title`            | `ReactNode`                         | required           | Primary sidebar name and fallback accessible name.  |
| `eyebrow`          | `ReactNode`                         | —                  | Quiet Office Code Pro category above the title.     |
| `description`      | `ReactNode`                         | —                  | Short supporting context below the title.           |
| `actions`          | `ReactNode`                         | —                  | Compact header actions.                             |
| `children`         | `ReactNode`                         | —                  | Usually one or more `SidebarSection` elements.      |
| `footer`           | `ReactNode`                         | —                  | Persistent action area below the scrolling body.    |
| `variant`          | `'panel' \| 'docked' \| 'floating'` | `'panel'`          | Relationship to the surrounding workspace.          |
| `side`             | `'left' \| 'right'`                 | `'left'`           | Workspace-facing divider for a docked sidebar.      |
| `density`          | `'default' \| 'compact'`            | `'default'`        | Header, section, and footer spacing.                |
| `width`            | `CSSProperties['width']`            | `288`              | Numeric pixel width or any CSS width value.         |
| `draggable`        | `boolean`                           | `false`            | Shows the move handle on a floating sidebar.        |
| `position`         | `{ x: number; y: number }`          | —                  | Controlled floating position in pixels.             |
| `defaultPosition`  | `{ x: number; y: number }`          | `{ x: 16, y: 16 }` | Initial uncontrolled floating position.             |
| `onPositionChange` | `(position) => void`                | —                  | Receives constrained pointer and keyboard movement. |
| `bounds`           | `'parent' \| 'viewport'`            | `'parent'`         | Boundary used to constrain floating movement.       |
| `boundaryPadding`  | `number`                            | `8`                | Minimum retained distance from the boundary.        |
| `dragLabel`        | `string`                            | `'Move sidebar'`   | Accessible drag-handle name.                        |

The component forwards its ref and standard `<aside>` attributes. A parent-
bounded floating sidebar is absolutely positioned; viewport bounds switch it
to fixed positioning. Both use CSS transforms for immediate movement, so
application styles should not replace the root `transform`.

## SidebarSection props

| Prop       | Type        | Default | Description                                   |
| ---------- | ----------- | ------- | --------------------------------------------- |
| `label`    | `ReactNode` | —       | Optional uppercase section label.             |
| `actions`  | `ReactNode` | —       | Optional compact action opposite the label.   |
| `children` | `ReactNode` | —       | Controls or application content in the group. |

`SidebarSection` forwards standard `<section>` attributes. Consecutive
sections draw their divider across the full panel width.

## Positioning and bounds

For `bounds="parent"`, place the floating sidebar inside a positioned element
with a definite size:

```css
.workspace-region {
  position: relative;
  min-height: 480px;
}
```

Use controlled position when it must be saved, reset, synchronized, or copied
into application state. Use `defaultPosition` for a self-contained utility
panel. The component re-clamps itself when its boundary or own size changes.

## Docking an individual tool

Treat docking as an application-owned composition state, not as a second copy
of the creative control. Keep the tool's value in one controlled state and
render it in exactly one of two places:

1. Inside its normal `SidebarSection` while docked.
2. Inside a compact `Sidebar variant="floating"` while undocked.

The section `actions` slot is the correct place for the pop-out command. Put a
dock action in the floating sidebar's `actions` slot, give the floating panel a
dedicated controlled position, and keep it within the workspace with
`bounds="parent"`. When the transition replaces the focused button, move focus
to the floating drag handle or the restored pop-out action and announce the
new layout with an `aria-live` status.

```tsx
const [detached, setDetached] = useState(false);
const [position, setPosition] = useState({ x: 320, y: 48 });
const [curve, setCurve] = useState<ToneCurvePoint[]>(initialCurve);

<Sidebar variant="docked" title="Grade inspector">
  <SidebarSection
    label="Tone curve"
    actions={
      !detached && (
        <Button
          variant="ghost"
          iconStart={<OpenInNewWindowIcon />}
          aria-label="Pop out Tone curve"
          onClick={() => setDetached(true)}
        />
      )
    }
  >
    {!detached && <ToneCurve value={curve} onValueChange={setCurve} />}
  </SidebarSection>
</Sidebar>;

{
  detached && (
    <Sidebar
      variant="floating"
      draggable
      title="Tone curve"
      position={position}
      onPositionChange={setPosition}
      actions={
        <Button
          variant="ghost"
          iconStart={<PinLeftIcon />}
          aria-label="Dock Tone curve"
          onClick={() => setDetached(false)}
        />
      }
    >
      <SidebarSection>
        <ToneCurve value={curve} onValueChange={setCurve} />
      </SidebarSection>
    </Sidebar>
  );
}
```

## Keyboard and accessibility

- `Sidebar` renders an `<aside>` landmark and derives its accessible name from
  a string `title` unless `aria-label` is supplied.
- The dedicated move handle is a native button. Inputs, header actions, and
  body controls never start a panel drag.
- Arrow keys move a focused handle by 1px. Shift + Arrow moves by 10px.
- Home restores `defaultPosition`. Pointer movement is tracked at the window
  boundary so the drag continues when the pointer leaves the handle.
- Movement is bounded for pointer and keyboard users. It is not animated behind
  the pointer.

## Examples

```tsx
import { Button, ColorField, Sidebar, SidebarSection, Slider } from '@presentstandards/framekit-ui';

<Sidebar
  eyebrow="Selected layer"
  title="Hero card"
  description="Shape"
  footer={<Button fullWidth>Apply</Button>}
>
  <SidebarSection label="Appearance">
    <ColorField value={colour} onChange={setColour} fullWidth />
    <Slider label="Opacity" value={opacity} onValueChange={setOpacity} />
  </SidebarSection>
</Sidebar>;
```

```tsx
const [position, setPosition] = useState({ x: 24, y: 24 });

<div className="workspace-region">
  <Sidebar
    variant="floating"
    density="compact"
    draggable
    title="Properties"
    position={position}
    defaultPosition={{ x: 24, y: 24 }}
    onPositionChange={setPosition}
    bounds="parent"
  >
    <SidebarSection label="Transform">…</SidebarSection>
  </Sidebar>
</div>;
```

## Do / Don't

- **Do** group controls by task, dependency, and workflow order.
- **Do** use `compact` for dense persistent inspectors and `default` where the
  panel has more breathing room.
- **Do** constrain floating panels so their title and move handle remain
  reachable.
- **Do** keep a dockable tool's value and floating position application-owned
  so it survives every layout transition.
- **Don't** make the whole header draggable; dedicated movement prevents
  accidental drags from actions.
- **Don't** render active copies in the dock and the floating panel at the same
  time; one controlled tool should have one interactive instance.
- **Don't** put a Sidebar inside every sidebar section. Use `Disclosure`,
  `Tabs`, or `Popover` for local hierarchy.
