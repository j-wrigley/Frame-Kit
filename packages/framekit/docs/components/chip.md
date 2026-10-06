---
name: Chip
status: stable
since: 0.3.0
import: import { Chip } from '@presentstandards/framekit-ui'
---

# Chip

> A small bordered button for one short word or token: a placeholder that
> inserts itself, or a one-word mode such as Auto that toggles on and off.

## When to use

- A run of tokens under a field that each insert themselves — `{value}`,
  `{index}`, `#tag` (action chips, `mono`).
- A one-word mode beside a field that the field's value depends on — **Auto**
  before an index, **Loop** before a range (toggle chips, `pressed`).
- Quick picks that are lighter than a row of buttons.

## When not to use

- Use [Button](./button.md) for commands and anything longer than a word or two.
- Use [Segmented switch](./segmented-switch.md) to choose between two to four
  named states; a chip is on or off.
- Use [Toggle rows](./toggle.md) for a labelled setting in a list.

## Anatomy

Renders one `<button class="fk-chip fk-chip--sm">` around a
`<span class="fk-chip__label">`, which ends in an ellipsis when space runs out.
`fk-chip--md` sets the 24px height that lines up with `sm` controls in a row,
`fk-chip--mono` the code face. A toggle chip carries `aria-pressed`, which is
also its styling hook.

## Props

| Prop      | Type           | Default | Description                                                              |
| --------- | -------------- | ------- | ------------------------------------------------------------------------ |
| `pressed` | `boolean`      | —       | Makes it a toggle chip, announced as pressed or not. Omit for an action. |
| `mono`    | `boolean`      | `false` | Office Code Pro, for tokens.                                             |
| `size`    | `'sm' \| 'md'` | `'sm'`  | `sm` is 18px, for a run of chips; `md` is 24px, beside `sm` controls.    |

Forwards `ref`; spreads native button attributes (`onClick`, `disabled`,
`aria-label`, `title`…) onto the `<button>`, which defaults to `type="button"`.

## Tokens used

| Token                       | Role           |
| --------------------------- | -------------- |
| `--fk-bg-control`           | Resting fill   |
| `--fk-border-control`       | Resting border |
| `--fk-border-control-hover` | Hover border   |
| `--fk-text-secondary`       | Resting text   |
| `--fk-accent-subtle`        | Pressed fill   |
| `--fk-accent-muted`         | Pressed border |
| `--fk-accent-text`          | Pressed text   |
| `--fk-focus-outline`        | Keyboard focus |

## Keyboard & accessibility

- A native button: Tab to focus, Enter or Space to activate.
- A toggle chip exposes `aria-pressed`; give it a name that says what it
  automates when the word alone does not (`aria-label="Automatic index"`).
- Action chips that insert text should say what they insert in `title`.

## Examples

```tsx
import { Chip } from '@presentstandards/framekit-ui';

// Tokens that insert themselves.
{
  ['value', 'index', 'name'].map((token) => (
    <Chip key={token} mono title={`Add {${token}}`} onClick={() => insert(`{${token}}`)}>
      {`{${token}}`}
    </Chip>
  ));
}

// A mode beside a field.
<Chip size="md" pressed={auto} aria-label="Automatic index" onClick={() => setAuto(!auto)}>
  Auto
</Chip>;
```

## Do / Don't

- **Do** keep a chip to one word or one token.
- **Do** use `size="md"` beside 24px controls so the row's heights agree.
- **Don't** use a chip as the only way to reach a command — it is a shortcut.
- **Don't** colour a chip by meaning; the accent marks pressed, nothing else.
