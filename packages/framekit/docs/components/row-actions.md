---
name: Row actions
status: stable
since: 0.3.0
import: import { RowActions, RowInfoButton, RowAddButton } from '@presentstandards/framekit-ui'
---

# Row actions

> The trailing 'i' then '+' pair for library rows, list rows, and card headers: explain the item, then add it or add more to it.

## When to use

- A library or catalogue row whose item can be explained (an 'i' with a hover card) and added (a '+').
- A card or section header whose '+' opens an add-more menu, with an 'i' before it that explains the card.
- A list where only some rows have an explanation, and the '+' column must still line up.

## When not to use

- Use [LayerRow](./layer-row.md) actions for contextual actions on a selected layer (visibility, duplicate, delete).
- Use a [SidebarSection](./sidebar.md) `actions` button for a single section action with no explanation.
- Use a [Tooltip](./hover-card.md) on the control itself for a one-line name; the 'i' is for a richer explanation.

## Anatomy

- `RowActions` (`.fk-row-actions`): an inline row of two cells with a 2px gap. The 'i' cell always comes before the '+' cell.
- `RowInfoButton` (`.fk-row-info`): a 16px button with a 12px `InfoCircledIcon`, tertiary at rest, primary on hover and while its card is open.
- `RowAddButton` (`.fk-row-add`): the kit's ghost `sm` `Button`, sized to the 20px sidebar section action with a 12px `PlusIcon`. It shows a pressed state while its menu is open.

Both buttons forward their ref and accept trigger props, so they work as `HoverCard` and `Popover`
triggers. Those overlays set `aria-expanded` on the trigger, which drives the open styling.

With `reserve`, an empty cell still takes its 16px or 20px, so the '+' column stays aligned down a
list in which only some rows have an 'i'.

## Props

### `RowActions`

| Prop      | Type        | Default | Description                                                                       |
| --------- | ----------- | ------- | --------------------------------------------------------------------------------- |
| `info`    | `ReactNode` | —       | The 'i' cell, normally a `RowInfoButton` as a `HoverCard` trigger.                |
| `add`     | `ReactNode` | —       | The '+' cell, normally a `RowAddButton`, alone or as a `Popover` trigger.         |
| `reserve` | `boolean`   | `false` | Keep both cells when one is empty. Use it in lists; leave it off in card headers. |

Forwards `ref`; spreads rest props onto the root `span`.

### `RowInfoButton`

| Prop    | Type     | Default | Description                                         |
| ------- | -------- | ------- | --------------------------------------------------- |
| `label` | `string` | —       | Required accessible name, such as "About Halftone". |

Forwards `ref`; spreads native button attributes. Defaults to `type="button"`.

### `RowAddButton`

| Prop    | Type     | Default | Description                                                         |
| ------- | -------- | ------- | ------------------------------------------------------------------- |
| `label` | `string` | —       | Required accessible name, such as "Add Halftone" or "Add settings". |

Forwards `ref`; spreads native button attributes (for example `onClick`, `tabIndex`, `disabled`).

## Tokens used

| Token                                         | Role in this component             |
| --------------------------------------------- | ---------------------------------- |
| `--fk-text-tertiary` / `--fk-text-primary`    | Icon at rest and on hover.         |
| `--fk-bg-control-hover`                       | Hover and open surface of the 'i'. |
| `--fk-bg-control-active` / `--fk-accent-text` | '+' while its menu is open.        |
| `--fk-radius-xs`                              | Both targets.                      |
| `--fk-focus-outline`                          | Keyboard focus.                    |

## Keyboard & accessibility

- Both are native buttons with required accessible names.
- The 'i' opens its `HoverCard` on hover and on keyboard focus, so the explanation is not pointer-only. The card is supporting detail; never put the only route to an action inside it.
- When a library row's main button already performs the add, the trailing '+' may repeat it with `tabIndex={-1}` so keyboard users are not given two stops for one action.
- A '+' that opens a menu is a `Popover` trigger and exposes `aria-expanded`.

## Examples

```tsx
import {
  Button,
  HoverCard,
  MagicWandIcon,
  Popover,
  RowActions,
  RowAddButton,
  RowInfoButton,
} from '@presentstandards/framekit-ui';

// A library row: the main button and the '+' both add; the 'i' explains.
<div className="library-row">
  <Button variant="ghost" size="sm" fullWidth iconStart={<MagicWandIcon />} onClick={addHalftone}>
    Halftone
  </Button>
  <RowActions
    reserve
    info={
      <HoverCard
        trigger={<RowInfoButton label="About Halftone" />}
        size="md"
        placement="right-start"
        offset={30}
        panelLabel="About Halftone"
      >
        Turns an image into a printed dot pattern.
      </HoverCard>
    }
    add={<RowAddButton label="Add Halftone" tabIndex={-1} onClick={addHalftone} />}
  />
</div>;

// A card header: the '+' opens an add-more menu.
<RowActions
  info={<HoverCard trigger={<RowInfoButton label="About Halftone" />}>…</HoverCard>}
  add={
    <Popover trigger={<RowAddButton label="Add settings" />} size="sm" placement="bottom-end">
      …
    </Popover>
  }
/>;
```

## Do / Don't

- **Do** place the 'i' immediately before the '+', and only where a real explanation exists.
- **Do** give a right-placed hover card `offset={30}` when a '+' follows the 'i' (8px gap + 2px + the 20px '+'), so the card never covers the '+'.
- **Do** use `reserve` in lists so rows with and without an 'i' align.
- **Do** keep the '+' meaning "add" everywhere: add this item, or add more to this card.
- **Don't** put the 'i' after the '+', or use it as a generic help icon on every row.
- **Don't** use the 'i' hover card for actions; it is an explanation surface.
