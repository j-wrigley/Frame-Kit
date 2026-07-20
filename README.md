# Frame Kit

Frame Kit is a React UI kit for creative and productivity tools. It provides a
coherent, precise interface language for inspectors, sidebars, toolbars,
timelines, graphs, colour controls, and other high-density application UI.

It is designed to help you build professional tools quickly without losing the
small interaction details that make creative software feel considered.

## Install

```sh
npm install @presentstandards/framekit-ui
```

Frame Kit supports React 18 and 19.

## Start building

Import the stylesheet once at your application root. It includes the bundled
fonts, design tokens, base styles, and component styles.

```tsx
import { useState } from 'react';
import '@presentstandards/framekit-ui/styles.css';
import { Button, Sidebar, SidebarSection, Slider } from '@presentstandards/framekit-ui';

export function Inspector() {
  const [exposure, setExposure] = useState(54);

  return (
    <Sidebar title="Adjustments" aria-label="Image adjustments">
      <SidebarSection label="Light">
        <Slider label="Exposure" value={exposure} onValueChange={setExposure} />
      </SidebarSection>
      <Button>Export image</Button>
    </Sidebar>
  );
}
```

Use Frame Kit components as the foundation of your interface, then compose them
around the tasks people need to complete. Group controls by feature or workflow
rather than by component type, keep primary actions visible, and use the more
specialised controls when they better match the value being adjusted.

For example, use an `AxisField` for linked X/Y values, a `ToneCurve` for tonal
work, a `KeyframeLane` for time-based editing, or a `CameraPath` for spatial
movement—instead of reducing every interaction to a generic slider.

## Theme, accent, and surface style

Light mode is the default. Enable dark mode or select a bundled accent at the
document level:

```html
<html data-theme="dark" data-accent="blue"></html>
```

Available accent presets are `slate`, `sage`, `mauve`, `sand`, `blue`, `teal`,
`violet`, `rose`, `coral`, and `amber`.

You can also create a custom accent. Frame Kit derives its supporting colour
tokens and accessible text colour automatically.

```tsx
import { applyAccent, applyFrameKitStyle } from '@presentstandards/framekit-ui';

applyAccent('#DE3B3B');
applyFrameKitStyle('transparent');
```

Use the default surface style for most interfaces. The optional `transparent`
style is useful when your tool has media, a canvas, or artwork behind its UI.

## Use the system well

- Build interface chrome with Frame Kit’s semantic `--fk-*` tokens instead of hard-coded UI colours.
- Use Inter for regular interface text. Office Code Pro is reserved for compact tags, values, and code.
- Preserve the 4px spacing rhythm, restrained radii, and flat surface treatment.
- Test both themes, keyboard interaction, visible focus, long labels, and narrow layouts.
- Prefer composition and documented component props over copying or restyling component internals.

## Documentation

The package includes component specs, token references, examples, and guidance
for working with AI agents:

- [Component documentation](./packages/framekit/docs/components/)
- [Design principles](./packages/framekit/docs/principles.md)
- [Tokens and theming](./packages/framekit/docs/tokens.md)
- [Customisation guidance](./packages/framekit/docs/customization.md)
- [AI Direction](./packages/framekit/docs/ai/direction.md)

When using an AI agent, install the included Frame Kit skill so it can choose
components intelligently, preserve the visual system, and organise sidebars as
real tool interfaces rather than generic control lists. See the
[package guide](./packages/framekit/README.md#build-with-an-ai-agent) for setup.

## Work on this repository

```sh
npm install
npm run dev
```

The documentation site runs at `http://localhost:5180`. Use `npm run typecheck`
and `npm run build` before opening a pull request or publishing a new package
version.

## License

[MIT](./packages/framekit/LICENSE). Inter and Office Code Pro are bundled under
the SIL Open Font License; Radix Icons are bundled under the MIT License.
