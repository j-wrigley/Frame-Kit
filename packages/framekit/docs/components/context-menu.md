---
name: Context menu
status: stable
since: 0.1.0
import: import { ContextMenu, type ContextMenuItem } from '@presentstandards/framekit-ui'
---

# Context menu

> Precise right-click actions for layers, objects, rows, and canvas surfaces.

## When to use

- Use `ContextMenu` for actions tied to the currently targeted object.
- Include shortcuts when they are already part of the application’s keyboard
  language.
- Use one shallow submenu to keep related secondary actions out of the main
  action list.

## When not to use

- Use a `Dropdown` when the user is choosing one value from a short list.
- Use a `NestedDropdown` for persistent settings that need a visible summary.
- Do not hide a primary workflow only inside a context menu.

## `ContextMenu`

`ContextMenu` clones one focusable target element and opens from right-click,
the Context Menu key, or `Shift+F10`. It positions itself in the viewport,
avoids the screen edges, returns focus when dismissed by keyboard, and closes
after an action runs.

| Prop           | Type                      | Default          | Description                                          |
| -------------- | ------------------------- | ---------------- | ---------------------------------------------------- |
| `children`     | `ReactElement`            | —                | Required focusable target to receive context events. |
| `items`        | `ContextMenuItem[]`       | —                | Ordered actions, separators, and one-level submenus. |
| `label`        | `string`                  | `'Context menu'` | Accessible menu name.                                |
| `onOpenChange` | `(open: boolean) => void` | —                | Called after the menu opens or closes.               |

### Items

Use an action object for a normal menu item:

```tsx
{
  id: 'duplicate',
  label: 'Duplicate',
  icon: <CopyIcon />,
  shortcut: '⌘D',
  onSelect: duplicate,
}
```

Use `{ type: 'separator', id: 'divider' }` between unrelated groups. Use a
single `type: 'submenu'` object for a shallow nested action list; submenu
items may be actions and separators.

## Keyboard & accessibility

- Right-click, `Shift+F10`, and the Context Menu key open the menu.
- `ArrowUp` / `ArrowDown`, `Home`, and `End` move focus through available
  actions.
- `ArrowRight` opens a submenu; `ArrowLeft` returns to its parent action.
- `Escape` closes the menu and returns focus to the original target.
- Actions use `role="menuitem"`; submenu triggers expose `aria-haspopup` and
  `aria-expanded`.

## Examples

```tsx
import { ContextMenu, type ContextMenuItem } from '@presentstandards/framekit-ui';

const items: readonly ContextMenuItem[] = [
  { id: 'rename', label: 'Rename layer', shortcut: '⌘R', onSelect: renameLayer },
  { type: 'separator', id: 'primary-divider' },
  {
    type: 'submenu',
    id: 'arrange',
    label: 'Arrange',
    items: [{ id: 'front', label: 'Bring to front', onSelect: bringToFront }],
  },
  { id: 'delete', label: 'Delete layer', tone: 'danger', onSelect: deleteLayer },
];

<ContextMenu items={items} label="Layer actions">
  <div tabIndex={0}>Right-click this layer</div>
</ContextMenu>;
```

## Do / Don't

- **Do** order actions by likely use and separate only distinct groups.
- **Do** keep submenu depth to one level.
- **Do** reserve `danger` for the final destructive action.
- **Don't** use a context menu for a main or discoverability-critical task.
- **Don't** use Office Code Pro for menu content; it is reserved for tags.
