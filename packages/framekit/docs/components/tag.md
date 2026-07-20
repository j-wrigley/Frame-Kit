---
name: Tag
status: stable
since: 0.1.0
import: import { Tag } from '@presentstandards/framekit-ui'
---

# Tag

> The kit's one uppercase micro-label — Office Code Pro, tracked, 11px. Eyebrows,
> field labels, badges, and section headers all share this single treatment, so
> the tag voice changes in exactly one place.

## When to use

- Section eyebrows and kickers above a heading.
- Field/inspector labels, unit suffixes, small metadata.
- Status tags and badges (as the text layer).

## When not to use

- Body or interface copy — that's Inter (`--fk-font-sans`) at the type scale.
- A heading — use a real `<h*>` at the appropriate `--fk-fs-*`.

## Anatomy

Renders `<span class="fk-tag">` (element configurable via `as`). The class is
the single source of the treatment: `--fk-font-mono` + `--fk-fs-0` +
`--fk-fw-medium` + `--fk-tracking-label` + `uppercase`. Kit components compose
it internally (Input/Textarea labels, ColorField popover header, SegmentedSwitch
options), so it is also usable as a bare class.

## Props

| Prop   | Type                                                 | Default      | Description        |
| ------ | ---------------------------------------------------- | ------------ | ------------------ |
| `tone` | `'tertiary' \| 'secondary' \| 'primary' \| 'accent'` | `'tertiary'` | Text color.        |
| `as`   | `ElementType`                                        | `'span'`     | Element to render. |

Forwards `ref` and spreads rest props onto the root element.

## Tokens used

| Token                                                                 | Role           |
| --------------------------------------------------------------------- | -------------- |
| `--fk-font-mono`                                                      | Family         |
| `--fk-fs-0`                                                           | Size (11px)    |
| `--fk-fw-medium`                                                      | Weight         |
| `--fk-tracking-label`                                                 | Letter-spacing |
| `--fk-text-tertiary` / `-secondary` / `-primary` / `--fk-accent-text` | Tone           |

## Examples

```tsx
import { Tag } from '@presentstandards/framekit-ui';

<Tag as="p" tone="accent">Foundations</Tag>   // eyebrow
<Tag>Export settings</Tag>                      // field label
<Tag as="h3" tone="primary">Appearance</Tag>    // panel header
```

## Do / Don't

- **Do** route every uppercase micro-label through `Tag` / `.fk-tag` — never
  re-declare the mono/uppercase/tracking recipe inline.
- **Don't** use `Tag` for sentence-case UI text; uppercase is reserved for tags.
