---
name: FieldNote
status: stable
since: 0.4.0
import: import { FieldNote } from '@presentstandards/framekit-ui'
---

# FieldNote

> A one-line quiet readout under a control row: the facts a setting produces,
> or — in `danger` — why it can't be done.

## When to use

- Terse results of the settings above it: `3840×2160 · HEVC · ~42 MB`,
  `1920×1080 · 90 frames`.
- The reason a row can't be used: `Too large · max 8192×4320`, with
  `tone="danger"`.
- The explanation a [Combobox](./combobox.md) or [Input](./input.md) points to
  with `aria-describedby`.

## When not to use

- Use a toast for the outcome of an action that has finished.
- Use a [HoverCard or Tooltip](./hover-card.md) for optional explanation.
- Don't use it for a sentence of guidance or a label — it is a readout.

## Anatomy

One `<p class="fk-field-note">`, `fk-field-note--danger` for the danger tone.
It is a single line: long text ends in an ellipsis, so give it a `title` when
the full text could be cut. Figures are tabular, so a live number (bytes,
percent) never shifts the line.

## Props

| Prop   | Type                    | Default     | Description                                                |
| ------ | ----------------------- | ----------- | ---------------------------------------------------------- |
| `tone` | `'default' \| 'danger'` | `'default'` | `danger` for a line that says why something can't be done. |

Forwards `ref`; spreads native paragraph attributes (`id`, `title`, `role`,
`aria-live`…) onto the `<p>`.

## Tokens used

| Token                 | Role         |
| --------------------- | ------------ |
| `--fk-text-secondary` | Default text |
| `--fk-danger-text`    | Danger text  |
| `--fk-font-sans`      | Face         |
| `--fk-fs-0`           | Size (11px)  |

## Keyboard & accessibility

- Not focusable. Give it an `id` and point the control it describes at it with
  `aria-describedby`, so screen readers read the readout or the reason with
  the control.
- A danger line must say what is wrong in words; the colour only reinforces
  it.
- When the line changes on its own (a live size during a render), add
  `aria-live="polite"` only if the change matters to someone not looking.

## Examples

```tsx
import { FieldNote } from '@presentstandards/framekit-ui';

<FieldNote id="export-1-note">3840×2160 · HEVC · ~42 MB</FieldNote>

<FieldNote id="export-2-note" tone="danger">
  Too large · max 8192×4320
</FieldNote>
```

## Do / Don't

- **Do** keep it to facts joined with `·`, short nouns and numbers.
- **Do** use `danger` only for something that blocks; a notice stays default.
- **Don't** add icons, a second style, or bold text — one quiet line.
- **Don't** stack several notes under one row; join the facts into one line.
