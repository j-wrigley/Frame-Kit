---
name: ComponentName
status: draft # draft | review | stable
since: 0.0.0
import: import { ComponentName } from '@presentstandards/framekit-ui'
---

# ComponentName

> One sentence: what it is and the job it does in a tool UI.

## When to use

- …

## When not to use

- Use [OtherComponent](./other-component.md) instead when …

## Anatomy

Root element, sub-parts, and the `fk-*` class each renders with.

## Props

| Prop      | Type                                              | Default       | Description |
| --------- | ------------------------------------------------- | ------------- | ----------- |
| `size`    | `'sm' \| 'md' \| 'lg'`                            | `'md'`        | …           |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'secondary'` | …           |

Forwards `ref`; spreads rest props onto the root element.

## Tokens used

| Token             | Role in this component |
| ----------------- | ---------------------- |
| `--fk-bg-control` | Resting fill           |

## Keyboard & accessibility

- Focus behavior, ARIA roles/attributes, keyboard map.

## Examples

```tsx
import { ComponentName } from '@presentstandards/framekit-ui';

export function Example() {
  return <ComponentName />;
}
```

## Do / Don't

- **Do** …
- **Don't** …
