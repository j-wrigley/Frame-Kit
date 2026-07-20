---
name: Frame
status: stable
since: 0.1.0
import: import { Frame } from '@presentstandards/framekit-ui'
---

# Frame

> A named canvas boundary for artboards, scenes, pages, and compositions.

## When to use

- A creative workspace needs a clear, named canvas or artboard boundary.
- Designers need to compare multiple page, social, device, or presentation
  surfaces in one open workspace.
- A selected canvas surface should expose a quiet selection edge and resize
  handles before an interaction layer takes over.

## When not to use

- Use a `Card`, panel, or ordinary layout container for application chrome.
- Do not use `Frame` to implement dragging, resizing, zooming, or snapping;
  those interactions belong to the consuming canvas application.
- Do not use a frame label as the only name for an interactive surface; make
  the frame focusable and supply an accessible name when needed.

## `Frame`

`Frame` renders a clipped artboard surface, a visible name, plus a
selected-state outline and corner handles. Its optional recording state adds
an accent outline that tracks capture or render progress.
The recording line sits just outside the frame edge, keeping the canvas surface
clear.
It forwards standard `div` attributes, so applications can attach canvas
selection, keyboard, pointer, and context-menu behavior to the root.

| Prop                | Type                           | Default | Description                                           |
| ------------------- | ------------------------------ | ------- | ----------------------------------------------------- |
| `name`              | `ReactNode`                    | —       | Required visible canvas name.                         |
| `children`          | `ReactNode`                    | —       | Artwork or canvas content within the clipped surface. |
| `selected`          | `boolean`                      | `false` | Adds the accent edge and four resize handles.         |
| `recording`         | `boolean`                      | `false` | Shows an accent progress outline around the frame.    |
| `recordingProgress` | `number`                       | `0`     | Completion from `0` to `1`; values are clamped.       |
| `width`             | `CSSProperties['width']`       | —       | Explicit frame width.                                 |
| `height`            | `CSSProperties['height']`      | —       | Explicit frame height.                                |
| `aspectRatio`       | `CSSProperties['aspectRatio']` | —       | CSS aspect ratio when one dimension is inferred.      |

```tsx
<Frame
  name="Campaign post"
  selected={selectedFrameId === 'campaign-post'}
  width="320px"
  aspectRatio="4 / 5"
  tabIndex={0}
/>
```

### Recording

Use the controlled recording props when the surrounding workflow is capturing,
rendering, or otherwise progressing through a frame. The accent line begins at
the top-left outside edge and travels around the perimeter; the application
owns the action that starts recording and updates progress.

```tsx
<Frame
  name="Interview take"
  recording={isRecording}
  recordingProgress={captureProgress}
  width="244px"
  aspectRatio="4 / 5"
/>
```

## Keyboard & accessibility

- `Frame` is intentionally non-interactive by default.
- Pass `tabIndex={0}` when a frame represents a selectable canvas object; a
  focusable Frame receives `role="group"` automatically. Its string `name`
  becomes the group label, otherwise provide `aria-label`.
- The visible frame name uses Inter with normal casing.
- Selection handles are decorative; they are hidden from assistive technology.

## Do / Don't

- **Do** size frames with `width` and `height` or `aspectRatio`.
- **Do** keep `name` short and recognisable.
- **Do** compose a `ContextMenu` around a focusable frame for object actions.
- **Don't** put application panel styles or controls inside the frame boundary.
- **Don't** use Frame to hide a required workflow behind hover-only behavior.
