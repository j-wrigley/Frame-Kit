---
name: Combobox
status: stable
since: 0.4.0
import: import { Combobox } from '@presentstandards/framekit-ui'
---

# Combobox

> An editable field with a suggestion list: type any value the application can
> read, or choose a suggestion. Built from the Input field chrome and the
> Dropdown listbox.

## When to use

- A value with a few common choices that also accepts typed values — an export
  size (`1×`, `2×`, or a typed `1.5x`, `1920w`, `1080h`), a zoom level, a
  font size.
- When each suggestion benefits from a quiet description, such as the output
  size it makes (`2×` / `3840×2160`).

## When not to use

- Use [Dropdown](./dropdown.md) when only the listed choices are valid.
- Use [Input](./input.md) when there is nothing worth suggesting.
- Use [SearchField](./input.md) to filter a list elsewhere on screen; the
  Combobox list never filters.

## Anatomy

Renders a `<div class="fk-combobox fk-combobox--md">` field holding an
`<input class="fk-combobox__input" role="combobox">` and a chevron
`<button class="fk-combobox__toggle">` (pointer only, `tabIndex={-1}`). The open
list is portaled to `document.body` and reuses the Dropdown listbox:
`.fk-dropdown__menu.fk-combobox__menu` with `.fk-dropdown__option.fk-combobox__option`
rows (`-label`, `-description`). Modifiers: `fk-combobox--sm`, `--mono`,
`--full`, `--invalid`, `--disabled`; `data-open` while the list shows.

## Behaviour

- The field shows `format(value)` until it is edited. Focusing it selects the
  whole value, so typing replaces it.
- **Enter** or **blur** after an edit commits: `onCommit(parse(text), text)`.
- Text that `parse` rejects commits as `onCommit(null, text)`. The field keeps
  that text and turns invalid, so it can be corrected; **Escape** restores the
  committed value and reports it again (`onCommit(value, format(value))`).
- Choosing a suggestion commits `onCommit(option.value, format(option.value))`.
- The list opens from the chevron, **Arrow Down** or **Arrow Up**. It shows
  every suggestion and does not filter while typing. Typing clears the list's
  active row, so Enter commits the typed text, not a suggestion.
- The suggestion whose `format(option.value)` equals the field's committed text
  is the current one (`aria-selected`, accent text); the keyboard or pointer
  position carries the fill.

## Props

| Prop        | Type                                       | Default         | Description                                                                    |
| ----------- | ------------------------------------------ | --------------- | ------------------------------------------------------------------------------ |
| `options`   | `ComboboxOption<T>[]`                      | —               | `{ value, label?, description?, disabled? }`; values must format uniquely.     |
| `value`     | `T`                                        | —               | Controlled committed value.                                                    |
| `onCommit`  | `(value: T \| null, text: string) => void` | —               | Enter, blur after an edit, or a suggestion. `null`: the text did not parse.    |
| `parse`     | `(text: string) => T \| null`              | trimmed text    | Reads typed text. Return `null` when it cannot be used.                        |
| `format`    | `(value: T) => string`                     | `String(value)` | The field text for a value; also matches the current suggestion.               |
| `invalid`   | `boolean`                                  | `false`         | Danger border and `aria-invalid`, e.g. for a value that parses but can't work. |
| `label`     | `string`                                   | —               | Accessible name for the field and its list.                                    |
| `size`      | `'sm' \| 'md'`                             | `'md'`          | 24px or 30px, matching Dropdown and Input.                                     |
| `font`      | `'sans' \| 'mono'`                         | `'sans'`        | Value face.                                                                    |
| `fullWidth` | `boolean`                                  | `false`         | Stretches the field to the available width.                                    |

Forwards `ref` to the `<input>` and spreads the remaining native input
attributes (`placeholder`, `disabled`, `aria-describedby`, `id`, `onFocus`…)
onto it. `value`, `onChange` and `type` are owned by the component.

## Tokens used

| Token                       | Role                                         |
| --------------------------- | -------------------------------------------- |
| `--fk-bg-control`           | Field fill; active suggestion fill           |
| `--fk-border-control`       | Field border at rest                         |
| `--fk-border-control-hover` | Hover, focus and open border                 |
| `--fk-danger`               | Invalid border                               |
| `--fk-text-primary`         | Value text                                   |
| `--fk-text-tertiary`        | Chevron, placeholder, suggestion description |
| `--fk-accent-text`          | Current and active suggestion, open chevron  |
| `--fk-bg-raised`            | List surface (from the Dropdown listbox)     |
| `--fk-shadow-md`            | List elevation                               |

## Keyboard & accessibility

- The `<input>` has `role="combobox"`, `aria-expanded`, `aria-controls` and
  `aria-activedescendant`; the list is a `listbox` of `option`s. Focus stays in
  the field throughout.
- **Arrow Down / Up** open the list at the current suggestion, then move
  through enabled suggestions (wrapping). **Enter** commits the active
  suggestion, or the typed text. **Escape** closes the list; pressed again it
  restores the committed value. **Tab** commits and moves on.
- Invalid text sets `aria-invalid`. Explain it in a
  [FieldNote](./field-note.md) `tone="danger"` and link the two with
  `aria-describedby`, so the reason is read, not only shown in colour.

## Examples

```tsx
import { Combobox, FieldNote } from '@presentstandards/framekit-ui';

type Size = { scale: number } | { width: number } | { height: number };

const PRESETS = [0.5, 1, 2, 3, 4].map((scale) => ({
  value: { scale },
  description: `${1920 * scale}×${1080 * scale}`,
}));

<Combobox<Size>
  label="Size"
  size="sm"
  options={PRESETS}
  value={size}
  format={formatSize} // { scale: 2 } → "2×", { width: 1920 } → "1920w"
  parse={parseSize} // "1.5x", "1920w", "1080h" → a size; anything else → null
  invalid={bad}
  aria-describedby="size-note"
  onCommit={(next) => {
    setBad(next === null);
    if (next) setSize(next);
  }}
/>
<FieldNote id="size-note" tone={bad ? 'danger' : 'default'}>
  {bad ? 'Use 2x, 1920w or 1080h' : `${width}×${height}`}
</FieldNote>
```

## Do / Don't

- **Do** keep suggestions to the common values; the field takes the rest.
- **Do** put the size, count or result a suggestion makes in its `description`.
- **Do** keep typed text the user got wrong, mark it invalid, and say why.
- **Don't** use a Combobox to filter a long list — it never filters.
- **Don't** silently clamp or rewrite a typed value into something else.
