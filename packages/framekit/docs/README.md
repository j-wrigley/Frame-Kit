# Frame Kit Documentation

This folder is the source of truth for how Frame Kit looks, behaves, and is used.
It is written for two readers at once:

1. **Humans** — designers and developers building creative/productivity tools.
2. **AI agents** — coding assistants that consume these files to assemble UIs
   correctly without guessing.

## Structure

| File / folder      | Purpose                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `principles.md`    | The design charter. Read first — every decision traces back here.  |
| `tokens.md`        | Design-token reference: names, values, and when to use each.       |
| `customization.md` | Safe product-level theming, token overrides, and extension rules.  |
| `icons.md`         | Icon usage + the full name list (generated — do not edit by hand). |
| `components/`      | One spec per component, following `components/_TEMPLATE.md`.       |
| `ai/`              | Provider-neutral direction plus GPT/Codex and Claude setup.        |
| `../skills/`       | The distributable Frame Kit agent skill and its references.        |
| `../llms.txt`      | Entry point for AI agents (llms.txt convention).                   |

## Component docs contract

Every component that lands in `src/components/` ships **in the same commit** with a
doc in `docs/components/<kebab-name>.md` following the template. A component
without a doc is not done.

Docs use structured frontmatter (name, status, import path) so they can be
indexed, linted, and consumed programmatically.

## Consuming the kit

```tsx
// 1. Styles, once, at the app root
import '@presentstandards/framekit-ui/styles.css';

// 2. Components as they land
import { Button } from '@presentstandards/framekit-ui';
```

Tokens alone (no base reset) are also available: `@presentstandards/framekit-ui/tokens.css`.

## Capturing to Figma

The full stylesheet includes an opt-in compatibility mode for the Figma Chrome
extension and similar element-to-design tools:

```html
<html data-fk-capture="figma"></html>
```

Composite controls normally keep their border and background on an outer
label or container while the nested native input remains borderless. Capture
mode adds a transparent selection surface so the complete component becomes
the browser hit target and its chrome is included. Remove the attribute after
capturing; pointer interaction is intentionally paused while the mode is on.

Frame Kit also expresses translucent semantic control colors as `rgba(...)`.
Avoid replacing these with `color-mix(..., transparent)` in application
overrides intended for capture: Chrome serializes that result as CSS Color 4
`color(srgb … / alpha)`, which some code-to-canvas converters omit.
