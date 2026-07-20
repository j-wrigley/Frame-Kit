---
name: Focus crop
status: stable
since: 0.1.0
import: import { FocusCrop } from '@presentstandards/framekit-ui'
---

# Focus crop

> A bounded crop and focal-point field for media, layout, and camera inspectors.

## When to use

- Media or creative inspectors where a crop, aspect choice, and subject placement belong together.
- Composition controls that benefit from lightweight title/action safe-area guidance.
- Editors that need direct manipulation without growing into a full image-editing workspace.

## When not to use

- Use `Frame` when the application owns all canvas coordinates and selection behavior.
- Use `CameraPath` for ordered motion through space, not one static framing decision.
- Do not use this component to draw masks, perform image transforms, or replace a dedicated image editor.

## Anatomy

`FocusCrop` contains a bounded image surface, dimmed outside area, crop frame, four resize handles,
two optional safe-area guides, and a focal target. The frame is moved by dragging its interior; the
focal target stays relative to the crop so it retains its position when the crop is reframed.

## Props

| Prop                 | Type                                   | Default                   | Description                                                                 |
| -------------------- | -------------------------------------- | ------------------------- | --------------------------------------------------------------------------- |
| `value`              | `FocusCropValue`                       | —                         | Controlled `{ x, y, width, height }` crop region, constrained to the image. |
| `defaultValue`       | `FocusCropValue`                       | 16:9 framed crop          | Initial uncontrolled crop.                                                  |
| `onValueChange`      | `(value: FocusCropValue) => void`      | —                         | Called after frame movement or a resize.                                    |
| `focalPoint`         | `FocusCropFocalPoint`                  | —                         | Controlled `{ x, y }` focal point relative to the crop.                     |
| `defaultFocalPoint`  | `FocusCropFocalPoint`                  | `{ x: 0.5, y: 0.5 }`      | Initial uncontrolled focal point.                                           |
| `onFocalPointChange` | `(value: FocusCropFocalPoint) => void` | —                         | Called after focal-point adjustment.                                        |
| `aspectRatio`        | `number \| null`                       | `16 / 9`                  | Width / height ratio to preserve. Pass `null` for a free crop.              |
| `aspectLocked`       | `boolean`                              | `true`                    | Preserves the supplied ratio while resizing.                                |
| `showSafeArea`       | `boolean`                              | `true`                    | Shows nested composition guides inside the crop.                            |
| `safeAreaInset`      | `number`                               | `0.1`                     | Inset ratio used for the outer safe-area guide.                             |
| `editable`           | `boolean`                              | `true`                    | Enables direct frame, handle, and focal-point manipulation.                 |
| `disabled`           | `boolean`                              | `false`                   | Mutes the field and prevents direct interaction.                            |
| `step`               | `number`                               | `0.01`                    | Arrow-key increment; Shift multiplies it by five.                           |
| `label`              | `string`                               | `'Focus and crop region'` | Accessible field name.                                                      |

The component forwards its ref and standard `<div>` attributes to the root.

## Tokens used

| Token                                     | Role in this component                                     |
| ----------------------------------------- | ---------------------------------------------------------- |
| `--fk-bg-control` / `--fk-border-control` | Image surface and edge.                                    |
| `--fk-bg-overlay`                         | Restrained outside-crop mask.                              |
| `--fk-text-tertiary`                      | Quiet safe-area guides.                                    |
| `--fk-accent`                             | Crop outline, handles, focal target, and focus indication. |
| `--fk-bg-raised`                          | Resting handle and focal target fill.                      |

## Keyboard & accessibility

- The crop frame, every resize handle, and the focal target are focusable in editable mode.
- Arrow keys move the crop frame or focal target. Arrow keys on a resize handle adjust its corner; hold Shift for five increments.
- Home and End move a focused focal target to the top-left and bottom-right of the crop.
- Crop movement and resizing are bounded to the visible image; locked resizing keeps the selected aspect ratio exact.
- With `editable={false}`, the component is a labelled static image without focusable controls.

## Example

```tsx
import { FocusCrop, type FocusCropValue } from '@presentstandards/framekit-ui';

const [crop, setCrop] = useState<FocusCropValue>({
  x: 0.11,
  y: 0.11,
  width: 0.78,
  height: 0.72,
});

<FocusCrop
  value={crop}
  onValueChange={setCrop}
  aspectRatio={16 / 9}
  aspectLocked
  showSafeArea
  label="Feature image crop"
/>;
```

## Do / Don't

- **Do** pair the field with a small aspect-ratio selector and an explicit safe-area toggle.
- **Do** keep the focal point separate from crop position when both need to travel predictably.
- **Do** use safe guides as optional composition help, not as an always-on visual texture.
- **Don't** use the component as a freeform mask or a general image editor.
- **Don't** allow crop values that extend beyond the media surface.
