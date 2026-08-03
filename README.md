# Frame Kit

Frame Kit is a React UI kit for creative and productivity tools. Use it to build
sidebars, inspectors, toolbars, timelines, graphs, colour controls, and other
precise interface elements without having to create a new visual system first.

It includes light and dark themes, accessible colour contrast, bundled fonts,
semantic design tokens, and components made for dense professional tool UI.

## Add it to your app

Install the package:

```sh
npm install @presentstandards/framekit-ui
```

Then import the stylesheet once, at your app root. It contains the fonts,
tokens, base styles, and component styles.

```tsx
import '@presentstandards/framekit-ui/styles.css';
```

Now you can use components in your interface:

```tsx
import { useState } from 'react';
import { Button, Slider } from '@presentstandards/framekit-ui';

export function Adjustments() {
  const [exposure, setExposure] = useState(54);

  return (
    <section>
      <Slider label="Exposure" value={exposure} onValueChange={setExposure} />
      <Button>Export image</Button>
    </section>
  );
}
```

## Choose your appearance

Frame Kit uses light mode by default. Set dark mode or an accent preset on your
root HTML element:

```html
<html data-theme="dark" data-accent="blue"></html>
```

The available presets are `slate`, `sage`, `mauve`, `sand`, `blue`, `teal`,
`violet`, `rose`, `coral`, and `amber`.

For a custom colour, use `applyAccent`. Frame Kit automatically creates the
supporting tokens and selects a readable text colour for solid accent actions.

```tsx
import { applyAccent } from '@presentstandards/framekit-ui';

applyAccent('#DE3B3B');
```

## Make a good tool interface

- Start with the component that best matches the task, not just the most familiar control. For example, use `AxisField` for linked X/Y values, `ToneCurve` for colour work, and `KeyframeLane` for animation timing.
- Group controls by the task people are doing—such as Appearance, Transform, or Motion—not by component type.
- Use Frame Kit’s `--fk-*` tokens for your application UI instead of hard-coded interface colours.
- Keep spacing on the 4px grid and use Inter for normal UI text. Office Code Pro is for compact values, tags, and code.
- Check both light and dark themes, keyboard use, visible focus, long labels, and narrow layouts before shipping.

## Learn more

- [Documentation site](https://framekit.presentstandards.studio/) — every component, live and themeable
- [Component documentation](https://framekit.presentstandards.studio/#/components)
- [Tokens and theming](https://framekit.presentstandards.studio/#/spec/colors)
- [Customisation guide](https://framekit.presentstandards.studio/ai/customization.md)
- [AI Direction](https://framekit.presentstandards.studio/#/ai-direction)

Frame Kit also includes a skill for Claude and GPT/Codex. It helps an AI agent
choose suitable components and compose a professional tool UI. One command sets
it up in a consuming project:

```sh
npx framekit-agents
```

See the [AI Direction guide](https://framekit.presentstandards.studio/#/ai-direction) for the full workflow, or
point file-less agents at [llms.txt](https://framekit.presentstandards.studio/llms.txt).

## Work on Frame Kit

If you are working from this repository:

```sh
npm install
npm run dev
```

The documentation site starts at `http://localhost:5180`.

## License

[MIT](https://github.com/j-wrigley/Frame-Kit/blob/main/packages/framekit/LICENSE). Inter and Office Code Pro are bundled under
the SIL Open Font License; Radix Icons are bundled under the MIT License.
