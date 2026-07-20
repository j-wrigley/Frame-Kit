# Frame Kit

A precision UI kit for creative and productivity tools — light by default with a
first-class dark theme, token-driven, built one element at a time, and documented
so both humans **and AI agents** can build with it correctly.

**References we measure against:** [Radix UI](https://www.radix-ui.com/) (cleanliness,
rigor), [DialKit](https://joshpuckett.me/dialkit) (control feel),
[Toolcraft](https://github.com/pixel-point/toolcraft) (craft in tool UI).

## Workspace layout

```
Frame Kit/
├── packages/
│   └── framekit/            @presentstandards/framekit-ui — the publishable kit
│       ├── src/
│       │   ├── index.ts     Public exports: icons now, components as they land
│       │   ├── icons/       Icon system (icons.tsx is generated — see scripts/)
│       │   ├── fonts/       Self-hosted woff2: Inter Variable + Office Code Pro
│       │   └── styles/      fonts.css · tokens.css · base.css · index.css
│       ├── icons/           Source SVGs (346, Radix Icons set)
│       ├── scripts/         generate-icons.mjs · copy-styles.mjs
│       ├── docs/            AI-readable docs: principles, tokens, icons, specs
│       └── llms.txt         Entry point for AI agents
└── apps/
    └── docs/                Frame Kit entrance + documentation (Vite + React)
```

## Getting started

```sh
npm install
npm run dev        # docs app → http://localhost:5180
```

| Script              | Does                                      |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Docs app with HMR (kit aliased to source) |
| `npm run build`     | Build kit + docs app                      |
| `npm run build:kit` | Build the publishable package only        |
| `npm run typecheck` | Typecheck all workspaces                  |
| `npm run format`    | Prettier over the whole workspace         |

## Site surfaces

1. **Entrance** (`/`) — the minimal public landing page and live component rail.
   It imports the published component API directly but is not package content.
2. **Documentation** (`#/…`) — single-column reference with sidebar. This is
   the edit-and-preview zone: every element is showcased and refined here first.
   Both routes deploy together as one static Vite build (Hostinger).
3. **Playground** _(planned)_ — a fake tool UI (sidebars, canvas, inspector,
   toolbar) assembled entirely from kit components, to prove them in situ.

## Publishing (when ready)

`@presentstandards/framekit-ui` builds to `dist/` (ESM + types + stylesheets) via
`npm run build:kit`. The package is configured to publish publicly and will
typecheck and rebuild during the publish lifecycle.

Before the first release:

```sh
npm login
npm whoami
npm run typecheck
npm run build
npm pack --dry-run --workspace=@presentstandards/framekit-ui
npm publish --workspace=@presentstandards/framekit-ui
```

`npm whoami` must return `j__wrigley`. The first published version will be
`0.1.0`. For later releases, update the version according to the size of the
change, then publish again:

```sh
npm version patch --workspace=@presentstandards/framekit-ui  # fixes: 0.1.0 → 0.1.1
npm version minor --workspace=@presentstandards/framekit-ui  # features: 0.1.x → 0.2.0
npm version major --workspace=@presentstandards/framekit-ui  # breaking API: 0.x → 1.0.0+
npm publish --workspace=@presentstandards/framekit-ui
```

Run only one appropriate `npm version` command per release. npm versions are
immutable: a published version number cannot be overwritten, so every update
needs a new version.

Consumers install and import the package with:

```tsx
// npm install @presentstandards/framekit-ui
import '@presentstandards/framekit-ui/styles.css'; // once, at app root
import { Button, CameraPath, EasingGraph, LayerRow, Popover } from '@presentstandards/framekit-ui';
```

The docs app aliases the kit to source during development, so components hot-reload
while being designed. A future `npx` scaffolder (create-framekit-app) can
bootstrap tool projects with the kit preinstalled.

## Design rules (short version)

- Light by default, dark via `data-theme="dark"` — both first-class. Semantic
  tokens (`--fk-*`) are the public API — no raw hex anywhere.
- 13px primary UI text in Inter Variable; Office Code Pro for uppercase tags,
  values, and code. Both fonts + the 346-icon set ship inside `@presentstandards/framekit-ui`.
- 4px spacing grid. Small, consistent radii.
- Accent color marks selection, focus, and primary actions — nothing else.
- A component isn't done until it's spec'd in `packages/framekit/docs/components/`,
  keyboard-complete, and reviewed in the docs app.

Full charter: [packages/framekit/docs/principles.md](packages/framekit/docs/principles.md)
