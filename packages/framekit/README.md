# @presentstandards/framekit-ui

Precision UI kit for creative and productivity tools — panels, inspectors,
canvases, timelines. Light by default with a first-class dark theme,
token-driven, and documented for humans and AI agents alike.

> **Status: v0.1 baseline.** The current foundations, components, creative
> controls, Ready Made examples, human documentation, and AI direction form
> the stable base standard. Work beyond this baseline targets v0.2.

## Install

```sh
npm install @presentstandards/framekit-ui
```

## Use

```tsx
// Styles, once, at the app root (fonts + tokens + base)
import '@presentstandards/framekit-ui/styles.css';

// Icons — 375 named components, tree-shakeable
import { MagnifyingGlassIcon, Icon } from '@presentstandards/framekit-ui';
<MagnifyingGlassIcon />
<Icon name="magnifying-glass" />

// Components
import {
  Button,
  AxisField,
  CameraPath,
  DirectionPad,
  GradientEditor,
  KeyframeLane,
  Checkbox,
  ContextMenu,
  Disclosure,
  Dropdown,
  Frame,
  HoverCard,
  Input,
  NestedDropdown,
  NumberInput,
  RadioGroup,
  SegmentedSwitch,
  Tabs,
  Toggle,
  ToggleRow,
  Textarea,
  Tooltip,
  InputComposer,
} from '@presentstandards/framekit-ui';
```

Dark theme: `<html data-theme="dark">`. Light is the default.
Base surfaces are unchanged by default. For translucent tool chrome, use
`<html data-style="transparent">` or call
`applyFrameKitStyle('transparent')`; `resetFrameKitStyle()` restores base.
À la carte: `@presentstandards/framekit-ui/tokens.css` (tokens only) · `@presentstandards/framekit-ui/fonts.css`
(font-faces only).

## Capture components to Figma

Frame Kit includes an optional capture mode for element-to-design tools such
as the Figma Chrome extension. It makes composite controls select as one
complete component, so outer borders, fills, labels, and nested native inputs
arrive together. Set the attribute only while capturing; the overlay
deliberately pauses interaction with those controls.

The shipped translucent control and border tokens resolve to classic
`rgba(...)` colors. This is intentional: code-to-canvas converters can drop
the CSS Color 4 `color(srgb … / alpha)` value Chrome computes from
`color-mix(..., transparent)`, even when the border is visible in the browser.

```html
<html data-fk-capture="figma"></html>
```

Remove `data-fk-capture` to return to normal interaction. The documentation
site exposes the same mode through the cursor button beside the theme switch.

## Build with an AI agent

Frame Kit ships one provider-neutral skill for GPT/Codex and Claude. After
installing the package, copy the complete skill folder to the location your
agent discovers:

```sh
# GPT / Codex
mkdir -p .agents/skills
cp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .agents/skills/frame-kit

# Claude Code
mkdir -p .claude/skills
cp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .claude/skills/frame-kit
```

Invoke it with `$frame-kit` in Codex or `/frame-kit` in Claude Code. Start with
[the human AI Direction guide](./docs/ai/direction.md), establish the exact
accent, style, themes, density, and optional JSON copied from the beta Sidebar Builder,
then ask the agent to map every parameter to the best-fit Frame Kit component
and professional sidebar group before using the provider setup notes below.

## Documentation

- [docs/README.md](./docs/README.md) — how the docs are organized
- [docs/principles.md](./docs/principles.md) — the design charter
- [docs/tokens.md](./docs/tokens.md) — full token reference
- [docs/icons.md](./docs/icons.md) — icon usage + the full name list
- [docs/ai/direction.md](./docs/ai/direction.md) — foundation brief, agent workflow, prompt intake, and quality gates
- [docs/ai/gpt-codex.md](./docs/ai/gpt-codex.md) — GPT / Codex setup
- [docs/ai/claude.md](./docs/ai/claude.md) — Claude Code setup
- [skills/frame-kit/SKILL.md](./skills/frame-kit/SKILL.md) — packaged shared skill
- [llms.txt](./llms.txt) — entry point for AI agents

## License

[MIT](./LICENSE). Bundled assets: Inter and Office Code Pro (SIL OFL — licenses
ship in `dist/fonts/`), icon artwork from Radix Icons (MIT © WorkOS).
