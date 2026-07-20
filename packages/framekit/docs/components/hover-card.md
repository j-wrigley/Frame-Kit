---
name: Hover card & tooltip
status: stable
since: 0.1.0
import: import { HoverCard, Tooltip } from '@presentstandards/framekit-ui'
---

# Hover card & tooltip

> Small, anchored supporting surfaces for dense creative and productivity tools.

## When to use

- Use `Tooltip` for one concise label or helper phrase on hover and focus.
- Use `HoverCard` for optional preview detail that benefits from more than one
  line, but is safe to miss.
- Use `Popover` when the surface contains a deliberate action or setting.

## When not to use

- Do not put a necessary command, validation message, or critical status only
  in a tooltip or hover card.
- Do not use a tooltip as an icon button's accessible name; give the button an
  `aria-label` as well.
- Do not use a hover card where a persistent inspector or inline disclosure is
  easier to scan and compare.

## `Tooltip`

`Tooltip` clones one focusable trigger and renders a non-interactive
`role="tooltip"` surface. It opens immediately on keyboard focus and after a
short pointer-hover delay.

| Prop            | Type                      | Default | Description                                      |
| --------------- | ------------------------- | ------- | ------------------------------------------------ |
| `children`      | `ReactElement`            | —       | Required focusable trigger.                      |
| `content`       | `ReactNode`               | —       | Short helper text or compact supporting content. |
| `placement`     | `OverlayPlacement`        | `'top'` | Preferred anchor side and alignment.             |
| `delayDuration` | `number`                  | `400`   | Pointer-open delay in milliseconds.              |
| `closeDelay`    | `number`                  | `80`    | Pointer-close delay in milliseconds.             |
| `open`          | `boolean`                 | —       | Controlled open state.                           |
| `onOpenChange`  | `(open: boolean) => void` | —       | Reports requested state changes.                 |

```tsx
<Tooltip content="Layer information">
  <Button variant="ghost" iconStart={<InfoCircledIcon />} aria-label="Layer information" />
</Tooltip>
```

## `HoverCard`

`HoverCard` anchors a richer non-modal preview to one trigger. It remains open
while the pointer moves from trigger to panel, can receive focus, responds to
`Escape`, and flips then clamps within the viewport.

| Prop           | Type                      | Default          | Description                          |
| -------------- | ------------------------- | ---------------- | ------------------------------------ |
| `trigger`      | `ReactElement`            | —                | Required focusable trigger.          |
| `children`     | `ReactNode`               | —                | Optional supporting preview content. |
| `placement`    | `OverlayPlacement`        | `'bottom-start'` | Preferred anchor side and alignment. |
| `size`         | `'sm' \| 'md' \| 'lg'`    | `'md'`           | Surface width: 208, 264, or 336px.   |
| `panelLabel`   | `string`                  | `'Preview'`      | Accessible dialog name.              |
| `openDelay`    | `number`                  | `300`            | Pointer-open delay in milliseconds.  |
| `closeDelay`   | `number`                  | `150`            | Pointer-close delay in milliseconds. |
| `open`         | `boolean`                 | —                | Controlled open state.               |
| `onOpenChange` | `(open: boolean) => void` | —                | Reports requested state changes.     |

```tsx
<HoverCard
  trigger={<Button>Preview state</Button>}
  placement="bottom-start"
  panelLabel="Animation preview"
>
  <PreviewDetails />
</HoverCard>
```

## Keyboard & accessibility

- Both components open immediately on keyboard focus.
- `Escape` dismisses either surface and returns focus to its trigger.
- `Tooltip` uses `role="tooltip"` and connects its open content with
  `aria-describedby`.
- `HoverCard` uses a labelled non-modal `role="dialog"` and stays open while
  its content has pointer or keyboard focus.
- All non-tag content uses Inter. Reserve Office Code Pro for explicit tags.

## Do / Don't

- **Do** keep tooltip copy brief, sentence case, and directly relevant.
- **Do** use a hover card only for optional context that does not block work.
- **Do** choose `Popover` for controls or a durable action list.
- **Don't** conceal required workflows or critical feedback in hover-only UI.
