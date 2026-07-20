---
name: Dropdowns
status: stable
since: 0.1.0
import: import { Disclosure, Dropdown, NestedDropdown } from '@presentstandards/framekit-ui'
---

# Dropdowns

> Compact custom selection lists, anchored setting panels, and inline
> disclosures for precise tool interfaces.

## When to use

- Use `Dropdown` for a short single-select list such as metric, view, or mode.
- Use `NestedDropdown` for a small related group of controls behind a concise
  trigger summary.
- Use `Disclosure` for optional settings that should expand in the current
  inspector flow.

## When not to use

- Use `SegmentedSwitch` when there are only two to four short, equal modes.
- Use `RadioGroup` when all choices need to remain visible with descriptions.
- Do not put a long form or multi-step task inside `NestedDropdown`.

## `Dropdown`

`Dropdown` renders a custom button, listbox, and option controls. It supports
controlled or uncontrolled selection, description lines, disabled options, and
outside dismissal.

| Prop            | Type                      | Default           | Description                                                          |
| --------------- | ------------------------- | ----------------- | -------------------------------------------------------------------- |
| `options`       | `DropdownOption[]`        | —                 | Required unique `{ value, label, description?, disabled? }` options. |
| `value`         | `string`                  | —                 | Controlled selected value.                                           |
| `defaultValue`  | `string`                  | —                 | Initial uncontrolled value.                                          |
| `onValueChange` | `(value: string) => void` | —                 | Called when an enabled option is selected.                           |
| `placeholder`   | `ReactNode`               | `'Select option'` | Text when no value is selected.                                      |
| `label`         | `string`                  | —                 | Accessible trigger and listbox name.                                 |
| `size`          | `'sm' \| 'md'`            | `'md'`            | Trigger density.                                                     |
| `fullWidth`     | `boolean`                 | `false`           | Stretches trigger and list to the parent width.                      |

## `NestedDropdown`

`NestedDropdown` opens a normal dialog-like panel anchored to its trigger.
Compose its children from Frame Kit controls such as `SegmentedSwitch`,
`ToggleRow`, and inputs.

| Prop           | Type                      | Default            | Description                                 |
| -------------- | ------------------------- | ------------------ | ------------------------------------------- |
| `label`        | `ReactNode`               | —                  | Required trigger name.                      |
| `summary`      | `ReactNode`               | —                  | Optional current-value summary.             |
| `open`         | `boolean`                 | —                  | Controlled panel state.                     |
| `defaultOpen`  | `boolean`                 | `false`            | Initial uncontrolled panel state.           |
| `onOpenChange` | `(open: boolean) => void` | —                  | Called after a requested open-state change. |
| `align`        | `'start' \| 'end'`        | `'start'`          | Panel edge aligned with the trigger.        |
| `panelLabel`   | `string`                  | `'Dropdown panel'` | Accessible panel name.                      |
| `fullWidth`    | `boolean`                 | `false`            | Stretches the trigger to the parent width.  |

## `Disclosure`

`Disclosure` expands optional content in place; no outside-dismissal occurs.

| Prop           | Type                      | Default | Description                            |
| -------------- | ------------------------- | ------- | -------------------------------------- |
| `label`        | `ReactNode`               | —       | Required disclosure name.              |
| `summary`      | `ReactNode`               | —       | Optional end-aligned state summary.    |
| `open`         | `boolean`                 | —       | Controlled disclosure state.           |
| `defaultOpen`  | `boolean`                 | `false` | Initial uncontrolled disclosure state. |
| `onOpenChange` | `(open: boolean) => void` | —       | Called after a requested state change. |

## Keyboard & accessibility

- `Dropdown`: Arrow keys open and travel options; `Home` and `End` move to the
  first and last enabled choices; `Escape` closes and returns focus to trigger.
- `NestedDropdown`: `Escape` and outside clicks close the anchored panel.
- `Disclosure`: its button exposes `aria-expanded` and `aria-controls`; content
  remains in normal reading and tab order when open.

## Examples

```tsx
import { Disclosure, Dropdown, NestedDropdown } from '@presentstandards/framekit-ui';

<Dropdown
  label="Animation metric"
  options={[
    { value: 'duration', label: 'Duration' },
    { value: 'distance', label: 'Distance' },
  ]}
  value={metric}
  onValueChange={setMetric}
/>

<NestedDropdown label="Animation" summary="Auto · Snap" panelLabel="Animation controls">
  <PlaybackSettings />
</NestedDropdown>

<Disclosure label="Response" summary="Open" defaultOpen>
  <ResponseSettings />
</Disclosure>
```

## Do / Don't

- **Do** keep custom option labels concise and descriptions supplemental.
- **Do** keep an anchored panel shallow and focused on one related setting area.
- **Do** use disclosure when layout continuity matters more than overlay space.
- **Don't** use a dropdown for a binary setting; use `Toggle` or `ToggleRow`.
- **Don't** make a menu look like a persistent card while it is closed.
