# @presentstandards/framekit-ui

Precision UI kit for creative and productivity tools — panels, inspectors,
canvases, timelines. Light by default with a first-class dark theme,
token-driven, and documented for humans and AI agents alike.

**[Documentation](https://framekit.presentstandards.studio/)** · **[GitHub](https://github.com/j-wrigley/Frame-Kit)** ·
**[llms.txt for agents](https://framekit.presentstandards.studio/llms.txt)**

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

Frame Kit ships one provider-neutral skill for GPT/Codex and Claude, plus a
setup command that wires everything at once:

```sh
npx framekit-agents
```

That installs the skill into `.claude/skills/frame-kit` (Claude Code) and
`.agents/skills/frame-kit` (Codex), and writes managed Frame Kit sections into
`CLAUDE.md` and `AGENTS.md` — both agents then start on Frame Kit rails with no
prompting. Rerun it after upgrading (`npx framekit-agents --check` reports
staleness). Manual fallback:

```sh
# GPT / Codex
mkdir -p .agents/skills
cp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .agents/skills/frame-kit

# Claude Code
mkdir -p .claude/skills
cp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .claude/skills/frame-kit
```

Invoke it with `$frame-kit` in Codex or `/frame-kit` in Claude Code. Agents
without repository access can use the hosted mirrors instead:
[framekit.presentstandards.studio/llms.txt](https://framekit.presentstandards.studio/llms.txt) (index) and
[/llms-full.txt](https://framekit.presentstandards.studio/llms-full.txt) (all docs in one fetch). Start with
[the AI Direction guide](https://framekit.presentstandards.studio/#/ai-direction), establish the exact
accent, style, themes, density, and optional JSON copied from the beta Sidebar Builder,
then ask the agent to map every parameter to the best-fit Frame Kit component
and professional sidebar group before using the provider setup notes below.

## Documentation

Everything below also ships inside this package under `docs/` and `skills/`.

- [Documentation site](https://framekit.presentstandards.studio/) — every component, live and themeable
- [Design principles](https://framekit.presentstandards.studio/#/spec/introduction) — the design charter
- [Token reference](https://framekit.presentstandards.studio/#/spec/colors) — the full `--fk-*` token API
- [Icons](https://framekit.presentstandards.studio/#/icons) — all 375, searchable
- [AI Direction](https://framekit.presentstandards.studio/#/ai-direction) — foundation brief, agent workflow, prompt intake, and quality gates
- [GPT / Codex setup](https://framekit.presentstandards.studio/#/gpt-codex) · [Claude Code setup](https://framekit.presentstandards.studio/#/claude)
- [The shared skill](https://framekit.presentstandards.studio/#/frame-kit-skill) — what agents receive ([raw SKILL.md](https://framekit.presentstandards.studio/ai/SKILL.md))
- [llms.txt](https://framekit.presentstandards.studio/llms.txt) — entry point for AI agents ([llms-full.txt](https://framekit.presentstandards.studio/llms-full.txt) for one-fetch ingestion)
- [Repository docs layout](https://github.com/j-wrigley/Frame-Kit/blob/main/packages/framekit/docs/README.md)

## License

[MIT](https://github.com/j-wrigley/Frame-Kit/blob/main/packages/framekit/LICENSE). Bundled assets: Inter and Office Code Pro (SIL OFL — licenses
ship in `dist/fonts/`), icon artwork from Radix Icons (MIT © WorkOS).
