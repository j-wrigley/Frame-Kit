---
name: Checks and radios
status: stable
since: 0.1.0
import: import { Checkbox, RadioGroup } from '@presentstandards/framekit-ui'
---

# Checks and radios

> Native selection controls for independent canvas options and mutually
> exclusive tool modes in compact inspector surfaces.

## When to use

- Use `Checkbox` for independent choices such as Show grid, Snap, or Lock.
- Use `Checkbox` with `indeterminate` when the current selection has mixed
  values.
- Use `RadioGroup` for one required choice such as render mode, fit mode, or a
  short quality setting.

## When not to use

- Use `SegmentedSwitch` for a small number of short, visually equal tool modes
  where the moving selected surface improves scanning.
- Use a Select when choices are numerous or may grow.
- Do not use radio options for independent settings; those are checkboxes.

## `Checkbox`

`Checkbox` renders a native `<input type="checkbox">` inside its visible label.
Its whole row or inline control is therefore clickable while preserving native
checkbox semantics.

| Prop            | Type                    | Default     | Description                                                   |
| --------------- | ----------------------- | ----------- | ------------------------------------------------------------- |
| `label`         | `ReactNode`             | —           | Required visible checkbox label.                              |
| `description`   | `ReactNode`             | —           | Optional supporting detail; omit for the title-only default.  |
| `meta`          | `ReactNode`             | —           | Content at the end of a `row`, such as a count or shortcut.   |
| `variant`       | `'row' \| 'inline'`     | `'row'`     | Full inspector row or compact inline choice.                  |
| `tone`          | `'default' \| 'danger'` | `'default'` | Default selection intent or destructive intent.               |
| `indeterminate` | `boolean`               | `false`     | Shows the native mixed state and sets `aria-checked="mixed"`. |

It also accepts standard native input props such as `checked`, `defaultChecked`,
`disabled`, `name`, and `onChange`. Its ref targets the underlying checkbox.
`className` applies to the visible labelled root.

## `RadioGroup`

`RadioGroup` renders a native radio input for every option inside a
`radiogroup` root. Pass stable, unique values and keep the labels concise.

| Prop            | Type                      | Default       | Description                                                                                            |
| --------------- | ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `options`       | `RadioGroupOption[]`      | —             | Required unique `{ value, label, description?, disabled? }` options; use title-only labels by default. |
| `value`         | `string`                  | —             | Controlled selected value.                                                                             |
| `defaultValue`  | `string`                  | first enabled | Initial uncontrolled value; disabled or unknown values fall back safely.                               |
| `onValueChange` | `(value: string) => void` | —             | Called when an enabled option is selected.                                                             |
| `name`          | `string`                  | generated     | Native name shared by every radio in the group.                                                        |
| `variant`       | `'stack' \| 'inline'`     | `'stack'`     | Inspector list or compact horizontal options.                                                          |

It forwards its ref and standard `<div>` attributes to the `radiogroup` root.
Name that group with `aria-label` or `aria-labelledby`.

## Tokens used

| Token                                           | Role                                              |
| ----------------------------------------------- | ------------------------------------------------- |
| `--fk-bg-control` / `--fk-bg-raised`            | Quiet rows, tracks, and selected surfaces.        |
| `--fk-border-control` / `-hover`                | Thin control boundaries and interaction emphasis. |
| `--fk-accent` / `--fk-accent-text`              | Selected check, radio dot, and active labels.     |
| `--fk-danger` / `--fk-danger-text`              | Destructive inline checkbox intent.               |
| `--fk-text-primary` / `-tertiary` / `-disabled` | Labels, supporting detail, and disabled states.   |
| `--fk-radius-xs` / `--fk-radius-sm`             | Check, radio dot, and compact control geometry.   |
| `--fk-focus-outline`                            | Keyboard-only focus visibility.                   |

## Keyboard & accessibility

- `Checkbox` is a native checkbox. `Space` changes its value; the visible
  label is its accessible name.
- `indeterminate` is a presentational state owned by the caller. Choose the
  next checked or unchecked state in `onChange`.
- `RadioGroup` uses native radios with one shared name. `Tab` enters the group;
  arrow keys move selection and focus according to browser radio behavior.
- Disabled controls are removed from pointer and keyboard interaction.

## Examples

```tsx
import { Checkbox, RadioGroup } from '@presentstandards/framekit-ui';

<Checkbox
  label="Show grid"
  checked={showGrid}
  onChange={(event) => setShowGrid(event.target.checked)}
/>

<Checkbox
  variant="inline"
  label="Partial"
  indeterminate={selectionState === 'mixed'}
  checked={selectionState === 'checked'}
  onChange={selectAll}
/>

<RadioGroup
  aria-label="Render mode"
  options={[
    { value: 'live', label: 'Live' },
    { value: 'draft', label: 'Draft' },
  ]}
  value={mode}
  onValueChange={setMode}
/>
```

## Do / Don't

- **Do** use a checkbox for each independent setting.
- **Do** use `inline` only for short, familiar labels.
- **Do** name every radio group.
- **Don't** imitate a checkbox with an `aria-pressed` button.
- **Don't** add a filled or thick selection container: the check, dot, and
  quiet selected surface already communicate state.
