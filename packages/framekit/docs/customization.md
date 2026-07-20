---
name: Frame Kit Customization
status: stable
since: 0.1.0
---

# Customizing Frame Kit

Frame Kit is designed to be adjusted without losing its visual language. Use the smallest public extension that expresses the change, and keep customisation local to the product surface that needs it.

## Preferred order

1. **Component API and composition** — choose the documented `variant`, `size`, `density`, controlled value, and layout props that fit the task.
2. **Theme, accent, and style** — use `data-theme`, an accent preset through `data-accent`, `applyAccent('#hex')`, or the base/transparent surface style through `data-style` and `applyFrameKitStyle()`. These keep the package's paired foreground contrast and surface treatment coherent.
3. **Scoped semantic tokens** — change only semantic `--fk-*` values on a wrapper when a product surface needs a small, consistent adjustment.
4. **New variant or component** — when the adjustment carries a new interaction model or repeats across the product, make it a documented public extension instead of repeating local overrides.

```tsx
import '@presentstandards/framekit-ui/styles.css';
import { Button, applyAccent, applyFrameKitStyle } from '@presentstandards/framekit-ui';

applyAccent('#3366cc');
applyFrameKitStyle('transparent');

export function Inspector() {
  return (
    <aside className="project-inspector" data-theme="dark">
      <Button size="sm" variant="secondary">
        Reset
      </Button>
    </aside>
  );
}
```

```css
.project-inspector {
  /* A local density adjustment that stays on Frame Kit's 4px scale. */
  --fk-space-5: var(--fk-space-4);
}
```

## Keep the system intact

- Use semantic tokens, never raw `--fk-gray-*` steps or hard-coded interface colours.
- Preserve Inter for normal interface text and Office Code Pro only for tags, values, and code.
- Keep spacing on the 4px grid, use the existing radius vocabulary, and reserve shadows for raised surfaces.
- Test light and dark themes, contrast, visible focus, keyboard paths, and narrow widths after an override.
- Do not copy component source or rely on private descendant `fk-*` classes to create a different design language.

The package exposes `className` and standard element props on component roots for placement and product-level layout. The documented props and semantic tokens are the durable customization API; create a new variant or public component when a design change should become a repeatable system rule.
