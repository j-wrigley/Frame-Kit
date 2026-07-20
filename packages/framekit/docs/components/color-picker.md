---
name: ColorPicker
status: review
since: 0.1.0
import: import { Button, ColorField, ColorPicker, ColorInput, ColorSwatch, Dropdown, Tabs } from '@presentstandards/framekit-ui'
---

# ColorPicker

> Color controls for design tools: `ColorField` (the closed inspector control
> — swatch button + hex field, opening the full picker in an anchored
> popover), `ColorPicker` (the embeddable panel), `ColorInput` (plain hex
> field with live swatch), and `ColorSwatch` (color chip).

## When to use

- `ColorField` — fill/stroke/effect rows in inspectors and panels. This is
  the default choice.
- `ColorPicker` — embedding the panel directly in a sidebar or custom surface.
- `ColorSwatch` — document colours, palettes, recent-colour rows.
- Accent theming: wire any of them to `applyAccent`.

For a full design-tool colour popup, compose `Tabs`, `Button`, `Dropdown`, and
`ColorSwatch` through `ColorField`'s `renderPicker` prop. This keeps the
colour-selection core familiar while allowing source tabs, fill-type tools, local palette controls,
and colour-library actions to be added where the product needs them.

## When not to use

- Alpha/gradient selection — out of scope for v0.1 (planned).

## Anatomy

`ColorField`: `fk-color-field` shell (30px; swatch button 16px r2 + shared
`Input` hex field) → `fk-color-popover` (236px, anchored 6px below, uppercase
label header) → `fk-color-picker`. The panel: `fk-color-area` (148px 2D
slider, square 12px dual-ring thumb) → `fk-hue-slider` (10px rail, square 10px
thumb) → `fk-color-input` (shared `Input` with a live swatch) → optional
`fk-color-picker__presets`.

Hex displays design-tool style — uppercase, no `#` (parsing accepts `#abc`,
`abc`, `#aabbcc`, any case).

## Props

### ColorField

| Prop              | Type                     | Default     | Description                                              |
| ----------------- | ------------------------ | ----------- | -------------------------------------------------------- |
| `value`           | `string`                 | —           | Controlled hex value.                                    |
| `defaultValue`    | `string`                 | `'#3f3f46'` | Uncontrolled initial value.                              |
| `onChange`        | `(hex: string) => void`  | —           | Normalized `#rrggbb` (typed or picked).                  |
| `presets`         | `string[]`               | —           | Preset swatches in the popover.                          |
| `pickerLabel`     | `string`                 | `'Colour'`  | Popover header label.                                    |
| `pickerClassName` | `string`                 | —           | Extra class on the picker popover.                       |
| `renderPicker`    | `(context) => ReactNode` | —           | Replaces the default panel for composed picker surfaces. |
| `disabled`        | `boolean`                | `false`     | Disables field and swatch.                               |
| `fullWidth`       | `boolean`                | `false`     | Stretches to the container.                              |

### ColorPicker

| Prop           | Type                    | Default     | Description                           |
| -------------- | ----------------------- | ----------- | ------------------------------------- |
| `value`        | `string`                | —           | Controlled hex value.                 |
| `defaultValue` | `string`                | `'#3f3f46'` | Uncontrolled initial value.           |
| `onChange`     | `(hex: string) => void` | —           | Normalized `#rrggbb` on every change. |
| `presets`      | `string[]`              | —           | Preset swatches under the controls.   |

### ColorInput

Same `value` / `defaultValue` / `onChange` contract; commits on Enter/blur,
reverts invalid input, Escape cancels. Use `label` for a visible inspector label
and `size="sm"` when aligning it with compact `Input` or `NumberInput` controls.

| Prop    | Type                   | Default | Description                            |
| ------- | ---------------------- | ------- | -------------------------------------- |
| `label` | `ReactNode`            | —       | Visible label inside the shared field. |
| `size`  | `'sm' \| 'md' \| 'lg'` | `'md'`  | Shared Input control height.           |

### ColorSwatch

| Prop       | Type           | Default | Description                              |
| ---------- | -------------- | ------- | ---------------------------------------- |
| `color`    | `string`       | —       | Displayed color.                         |
| `selected` | `boolean`      | `false` | Current-selection ring + `aria-pressed`. |
| `size`     | `'sm' \| 'md'` | `'md'`  | 16 / 20px, 2px corners, keyline inset.   |

`ColorPicker` and `ColorSwatch` forward `ref` and rest props to their root
element; `ColorInput` forwards both to the inner `<input>` (`className` styles
the wrapper). HSV is the picker's working state, so hue survives passing
through black, white, and greys.

## Tokens used

| Token                                                | Role                             |
| ---------------------------------------------------- | -------------------------------- |
| `--fk-bg-control` / `--fk-border-control` / `-hover` | shared hex-input chrome          |
| `--fk-border-subtle`                                 | hairline insets on area/swatches |
| `--fk-radius-xs/-sm/-md/-full`                       | shapes                           |
| `--fk-focus-outline` / `--fk-accent`                 | focus ring, selected-swatch ring |
| `--fk-font-mono`, `--fk-fs-1`                        | hex value                        |

The area/hue gradients and thumb rings are physical color, not theme tokens —
they represent the spectrum itself.

## Keyboard & accessibility

- `ColorField` swatch: a real button with `aria-haspopup="dialog"` /
  `aria-expanded`; the popover is `role="dialog"`. Escape closes (returning
  focus to the swatch; a first Escape in the hex field cancels the draft),
  outside clicks close.
- Area: focusable 2D slider (`role="slider"` + `aria-valuetext`); ←/→ adjust
  saturation, ↑/↓ brightness, Shift for ×10 steps.
- Hue: native `<input type="range">` — full arrow-key support for free.
- Hex: shared text-input chrome; Enter commits, Escape cancels.
- Swatches: buttons with `aria-pressed`; name defaults to the hex value —
  pass `aria-label` for named colors.

## Examples

```tsx
import { Button, ColorField, ColorPicker, ColorInput, ColorSwatch, Dropdown, Tabs, applyAccent } from '@presentstandards/framekit-ui';

// Inspector row — swatch opens the picker popover
<ColorField value={fill} onChange={setFill} presets={DOCUMENT_COLORS} pickerLabel="Fill" />

// Embed the panel directly (sidebars, custom surfaces)
<ColorPicker value={color} onChange={setColor} />

// Compose an editor-grade popup without creating a second picker API
<ColorField
  value={fill}
  onChange={setFill}
  pickerLabel="Fill colour"
  renderPicker={({ value, onChange, close }) => <>
  <Tabs items={[{ value: 'custom', label: 'Custom' }, { value: 'library', label: 'Libraries' }]} />
  <div role="toolbar" aria-label="Fill tools">{/* icon buttons */}</div>
  <ColorPicker value={value} onChange={onChange} />
  <Dropdown options={paletteOptions} value={source} onValueChange={setSource} fullWidth />
  <div>{DOCUMENT_COLORS.map((color) => <ColorSwatch key={color} color={color} onClick={() => onChange(color)} />)}</div>
  <Button aria-label="Close colour picker" onClick={close} />
</>}
/>

// Hex field alone
<ColorInput value={stroke} onChange={setStroke} />

// Let the user retheme the kit accent
<ColorField defaultValue="#3f3f46" onChange={(hex) => applyAccent(hex)} />
```

## Do / Don't

- **Do** reach for `ColorField` in inspectors — the popover is built in.
- **Do** pass `aria-label` to swatches representing named presets.
- **Don't** store the picker's HSV — persist the emitted hex; HSV is internal.
