---
name: Toggle rows
status: stable
since: 0.1.0
import: import { Toggle, ToggleRow } from '@presentstandards/framekit-ui'
---

# Toggle rows

> Native checkbox switches for immediate binary settings in inspector panels,
> menus, and tool surfaces.

## When to use

- Use `Toggle` when an adjacent label already names a binary setting.
- Use `ToggleRow` for inspector settings that need a label, description, or
  quiet state summary.
- Use `ToggleRow variant="compact"` inside menu and dropdown surfaces.

## When not to use

- Use `Checkbox` when users may select several independent items from a list.
- Use `SegmentedSwitch` or `RadioGroup` when the user chooses between modes.
- Do not use a switch for a setting that requires a separate confirmation step.

## `Toggle`

`Toggle` renders a native `<input type="checkbox" role="switch">`. Give a
standalone control an `aria-label` or connect it to a visible external label.

| Prop   | Type                    | Default     | Description                             |
| ------ | ----------------------- | ----------- | --------------------------------------- |
| `size` | `'sm' \| 'md'`          | `'md'`      | Compact or standard track geometry.     |
| `tone` | `'default' \| 'danger'` | `'default'` | Default setting or destructive setting. |

It also accepts standard native checkbox props such as `checked`,
`defaultChecked`, `disabled`, `name`, and `onChange`. Its ref targets the
underlying checkbox.

## `ToggleRow`

`ToggleRow` puts the same native switch inside one implicit label. The entire
row activates the setting while preserving browser checkbox behavior.

| Prop          | Type                     | Default     | Description                                    |
| ------------- | ------------------------ | ----------- | ---------------------------------------------- |
| `label`       | `ReactNode`              | —           | Required visible setting label.                |
| `description` | `ReactNode`              | —           | Quiet supporting detail under the label.       |
| `meta`        | `ReactNode`              | —           | Optional short content before the switch.      |
| `variant`     | `'default' \| 'compact'` | `'default'` | Inspector row or minimal menu-style row.       |
| `size`        | `'sm' \| 'md'`           | variant     | Track size; compact rows otherwise use `'sm'`. |
| `tone`        | `'default' \| 'danger'`  | `'default'` | Default setting or destructive setting.        |

It accepts the same native checkbox props as `Toggle`; its ref also targets
the underlying checkbox.

## Tokens used

| Token                                           | Role                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `--fk-bg-control` / `--fk-bg-raised`            | Quiet tracks, inspector rows, and hover surfaces.       |
| `--fk-border-control` / `-hover`                | Thin track and row boundaries.                          |
| `--fk-accent` / `--fk-accent-text`              | Enabled switch track and selected row text.             |
| `--fk-danger` / `--fk-danger-text`              | Destructive settings.                                   |
| `--fk-text-primary` / `-tertiary` / `-disabled` | Row content, supporting detail, and unavailable states. |
| `--fk-focus-outline`                            | Keyboard-only switch focus visibility.                  |

## Keyboard & accessibility

- `Toggle` and `ToggleRow` are native checkboxes with `role="switch"`.
  `Space` changes their value.
- A standalone `Toggle` needs an accessible name. Provide `aria-label` when a
  visible external label is not programmatically associated.
- `ToggleRow` uses its visible `label` as the checkbox's accessible name.
- Disabled switches are removed from pointer and keyboard interaction.

## Examples

```tsx
import { Toggle, ToggleRow } from '@presentstandards/framekit-ui';

<Toggle
  aria-label="Show guides"
  checked={showGuides}
  onChange={(event) => setShowGuides(event.target.checked)}
/>

<ToggleRow
  label="Smart guides"
  description="Canvas"
  checked={showGuides}
  onChange={(event) => setShowGuides(event.target.checked)}
/>

<ToggleRow
  variant="compact"
  label="Play sound"
  checked={playSound}
  onChange={(event) => setPlaySound(event.target.checked)}
/>
```

## Do / Don't

- **Do** use toggles for immediate, binary settings.
- **Do** reserve `danger` for a genuinely destructive preference.
- **Do** use the compact row in menus where persistent card chrome is noisy.
- **Don't** use a toggle to choose among multiple modes.
- **Don't** repeat an On/Off label unless it adds meaningful context.
