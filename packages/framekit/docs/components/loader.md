---
name: Loader
status: stable
since: 0.1.0
import: import { Loader } from '@presentstandards/framekit-ui'
---

# Loader

> Small currentColor-driven activity indicators for controls, toolbars, and
> compact asynchronous states. Grid is the default block-based indicator.

## Props

| Prop      | Type                                                                              | Default  | Description                                                |
| --------- | --------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `variant` | `'grid' \| 'bars' \| 'steps' \| 'pulse' \| 'orbit' \| 'wave' \| 'flip' \| 'scan'` | `'grid'` | Loading pattern.                                           |
| `size`    | `'sm' \| 'md' \| 'lg'`                                                            | `'md'`   | Compact size scale (12 / 16 / 20px).                       |
| `label`   | `string`                                                                          | —        | Makes the otherwise decorative loader a labelled `status`. |

The component accepts standard `<span>` attributes and forwards its ref to the
outer element. It inherits `currentColor`, so it fits any button or status
color without local overrides.

## Button loading

`Button` uses `grid` by default while `loading`. Choose another pattern with
the `loader` prop; its text label remains accessible and `aria-busy` is set on
the button.

```tsx
<Loader variant="orbit" label="Loading canvas" />
<Button loading>Saving</Button>
<Button loading loader="bars">Processing</Button>
```

## Accessibility

- Decorative by default (`aria-hidden`).
- Use `label` when no adjacent loading text or busy control supplies context.
- All animation collapses under `prefers-reduced-motion` through the kit base
  stylesheet.
