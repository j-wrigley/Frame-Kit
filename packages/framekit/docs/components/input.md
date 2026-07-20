---
name: Input
status: stable
since: 0.1.0
import: import { InlineRename, Input, SearchField, Textarea, NumberInput, InputComposer } from '@presentstandards/framekit-ui'
---

# Input family

> Dense, label-aware input controls for property inspectors, tool panels, and
> compact create flows.

## When to use

- Editable names, IDs, and property values in a dense tool surface.
- Measurements with an inline axis or unit, such as **X / 124 / PX**.
- Short note fields, explicit numeric stepping, and add/save patterns.
- Renaming a layer, file, frame, or saved view without leaving its context.

## When not to use

- A fixed set of mutually exclusive values — use a Select or segmented control.
- A binary setting — use a switch or checkbox.
- A destructive or irreversible confirmation — use a Button and confirmation flow.

## Components

### `Input`

Renders a native `<input>` inside a native `<label>`. The optional `label`,
`prefix`, and `suffix` form a compact property row; all standard input props go
to the `<input>`, while `className` applies to the labelled root.

| Prop                | Type                   | Default     | Description                                                        |
| ------------------- | ---------------------- | ----------- | ------------------------------------------------------------------ |
| `label`             | `ReactNode`            | —           | Visible inline label, associated natively with the input.          |
| `prefix` / `suffix` | `ReactNode`            | —           | Content before / after the editable value. Use `suffix` for units. |
| `size`              | `'sm' \| 'md' \| 'lg'` | `'md'`      | Control height: 24 / 30 / 34px.                                    |
| `variant`           | `'surface' \| 'bare'`  | `'surface'` | Filled control or transparent property-row treatment.              |
| `font`              | `'sans' \| 'mono'`     | `'sans'`    | Value typeface; inline labels always use the mono face.            |
| `align`             | `'start' \| 'end'`     | `'start'`   | Value alignment; end-align measurements and numbers.               |

### `Textarea`

Renders a native `<textarea>` inside a native `<label>`. It takes all standard
textarea props plus `label`, `variant`, and `font`. It defaults to three rows
and remains vertically resizable.

### `SearchField`

Renders an icon-led native `type="search"` field for filtering layers, files,
and projects. It uses the same compact field shell as `Input` but has no
persistent visible label; always provide `aria-label` or `aria-labelledby`.

| Prop      | Type                   | Default     | Description                                           |
| --------- | ---------------------- | ----------- | ----------------------------------------------------- |
| `icon`    | `ReactNode`            | search icon | Leading visual.                                       |
| `size`    | `'sm' \| 'md' \| 'lg'` | `'md'`      | Control height: 24 / 30 / 34px.                       |
| `variant` | `'surface' \| 'bare'`  | `'surface'` | Filled control or transparent property-row treatment. |

Search values are always Sans, preserving user-entered casing.

### `InlineRename`

Renders a compact Sans row that turns into a text field on click. `Enter` and
blur commit the draft; `Escape` cancels it. Use the controlled `value` and
`onCommit` pair to keep the application as the source of truth.

| Prop       | Type                      | Default     | Description                                                 |
| ---------- | ------------------------- | ----------- | ----------------------------------------------------------- |
| `value`    | `string`                  | —           | Current name.                                               |
| `onCommit` | `(value: string) => void` | —           | Receives a changed name when the field is committed.        |
| `icon`     | `ReactNode`               | `ImageIcon` | Leading object visual.                                      |
| `meta`     | `ReactNode`               | —           | Quiet supporting detail, such as object type or dimensions. |
| `label`    | `string`                  | —           | Accessible name for the edit action and text field.         |
| `onCancel` | `() => void`              | —           | Called when the draft is cancelled with Escape.             |

### `NumberInput`

Wraps `Input` with explicit decrease and increase buttons. It uses
`type="text"` and `inputMode="decimal"` deliberately: numeric formats, locale,
precision, empty values, and clamping remain application decisions.

| Prop                                      | Type         | Default                   | Description                                                                |
| ----------------------------------------- | ------------ | ------------------------- | -------------------------------------------------------------------------- |
| `onDecrement` / `onIncrement`             | `() => void` | —                         | Called by the respective step action. The action is disabled when omitted. |
| `decrementDisabled` / `incrementDisabled` | `boolean`    | `false`                   | Disables one step action without disabling the editable value.             |
| `decrementLabel` / `incrementLabel`       | `string`     | `Decrease/Increase value` | Accessible names for the step actions.                                     |

It also accepts `Input` props except `type`, `inputMode`, and `align`. The
value is always end-aligned.

### `InputComposer`

Renders a native `<form>` with one input and an attached submit button. Pass
the underlying input attributes through `inputProps`; use `onSubmit` on the
composer to commit the value.

| Prop          | Type                                    | Default     | Description                                                                                            |
| ------------- | --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `inputProps`  | `InputHTMLAttributes<HTMLInputElement>` | —           | Native input attributes and event handlers. Provide `aria-label` unless another label names the field. |
| `submitLabel` | `string`                                | `'Submit'`  | Accessible name for the submit action.                                                                 |
| `submitIcon`  | `ReactNode`                             | `CheckIcon` | Visual submit affordance.                                                                              |
| `disabled`    | `boolean`                               | `false`     | Disables both form controls.                                                                           |

## Tokens used

| Token                                                  | Role                                              |
| ------------------------------------------------------ | ------------------------------------------------- |
| `--fk-bg-control` / `-hover`                           | Resting and interaction fills.                    |
| `--fk-border-control` / `-hover`                       | Quiet chrome and focus-within emphasis.           |
| `--fk-text-primary` / `-tertiary` / `-disabled`        | Value, label, and unavailable states.             |
| `--fk-accent-text`                                     | Unit labels and interactive step-action feedback. |
| `--fk-font-sans` / `--fk-font-mono`                    | Readable text vs. measurements and labels.        |
| `--fk-space-*`, `--fk-radius-sm`, `--fk-focus-outline` | Geometry and keyboard focus.                      |

## Keyboard & accessibility

- `Input` and `Textarea` use native controls. A `label` prop creates an implicit
  native label; when omitted, provide `aria-label` or `aria-labelledby`.
- `NumberInput` uses real buttons: `Enter` and `Space` trigger a step action.
  Supply specific button labels such as `Decrease duration` when the generic
  names lack enough context.
- `InputComposer` is a native form; pressing `Enter` submits. Prevent default
  in `onSubmit` when saving happens in JavaScript.
- `InlineRename` uses a real button before editing, then a native text field.
  Give it a specific `label` when the visible name alone does not convey which
  object will be renamed.
- Every focusable part uses the shared focus token, including forced-colors
  mode.

## Examples

```tsx
import { InlineRename, Input, NumberInput, SearchField, Textarea, InputComposer } from '@presentstandards/framekit-ui';

<Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />

<SearchField
  placeholder="Search layers"
  aria-label="Search layers"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
/>

<InlineRename
  value={layerName}
  meta="1080 × 1350"
  onCommit={setLayerName}
/>

<Input
  variant="bare"
  font="mono"
  label="X"
  suffix="PX"
  align="end"
  value={positionX}
/>

<NumberInput
  label="Duration"
  suffix="S"
  value={duration}
  onDecrement={() => setDuration((value) => value - 0.25)}
  onIncrement={() => setDuration((value) => value + 0.25)}
/>

<Textarea label="Note" value={note} onChange={(event) => setNote(event.target.value)} />

<InputComposer
  inputProps={{ value: presetName, 'aria-label': 'Preset name' }}
  submitLabel="Save preset"
  onSubmit={savePreset}
/>
```

## Do / Don't

- **Do** use mono + end alignment for properties, measurements, and units.
- **Do** let application state own numeric parsing and increment behavior.
- **Do** give a label or accessible name to every editable field.
- **Don't** use an input placeholder as the only label for a persistent property.
- **Don't** use `NumberInput` when an adjacent slider or direct numeric input is
  the clearer editing model.
