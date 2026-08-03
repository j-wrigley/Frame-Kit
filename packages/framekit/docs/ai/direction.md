---
name: Frame Kit AI Direction
status: stable
since: 0.1.0
---

# Frame Kit AI Direction

> Required operating guidance for an AI agent building or modifying a creative-tool interface with Frame Kit.

## Mission

Build the requested tool as a coherent Frame Kit interface. Use the kit as the source of truth for UI language, components, tokens, states, and interaction quality. Use the product brief as the source of truth for domain logic, rendering, data, persistence, and export.

Do not treat a visually plausible screenshot as completion. A result is complete only when the live interactions, responsive layout, themes, accessibility, repository checks, and public documentation are verified in proportion to the change.

## Setup channels

Frame Kit reaches agents through three channels; use whichever the environment supports:

1. **Project setup (best):** `npx framekit-agents` in the consuming repo installs the skill for
   Claude Code (`.claude/skills/frame-kit`) and Codex (`.agents/skills/frame-kit`) and writes
   managed Frame Kit sections into `CLAUDE.md` and `AGENTS.md`. Those files are read at session
   start with no invocation, so the agent starts on Frame Kit rails unprompted.
2. **Package files:** everything ships in the npm package — `llms.txt`, `docs/`, and
   `skills/frame-kit/` under `node_modules/@presentstandards/framekit-ui/`.
3. **Hosted mirrors (no file access):** `https://framekit.presentstandards.studio/llms.txt`
   (index), `/llms-full.txt` (single fetch), `/ai/components/<name>.md` (per-component specs) —
   regenerated from the package docs on every release. Works for Cursor, Windsurf, ChatGPT
   browsing, and any retrieval-capable agent.

## Source order

Read sources in this order before implementing:

1. The repository's `AGENTS.md`, `CLAUDE.md`, README, package scripts, or equivalent local instructions.
2. `@presentstandards/framekit-ui/llms.txt`.
3. `@presentstandards/framekit-ui/docs/principles.md` and the relevant foundation docs.
4. The spec for every Frame Kit component being considered.
5. Existing application code and the closest complete Frame Kit example.

If the package is a workspace dependency, locate its source package rather than assuming it is under `node_modules`.

## Responsibility boundary

| Frame Kit governs                                                         | The application governs                                    |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Interface typography, density, spacing, surfaces, radii, and elevation    | The creative output and its domain model                   |
| Semantic colours, accent behaviour, contrast, light theme, and dark theme | Rendering technology and performance architecture          |
| Component APIs, control roles, states, and keyboard behaviour             | Application state, persistence, history, and collaboration |
| Overlays, menus, toolbars, value controls, and creative UI primitives     | Import, processing, playback, export, and delivery formats |
| Documentation and public-component release requirements                   | Product-specific validation and error handling             |

Do not claim that Frame Kit provides a canvas runtime, renderer, state manager, persistence layer, or export engine. Select those based on the tool and verify them separately.

## Foundation brief

Establish the visual and structural foundation before feature work. The user's first prompt should identify:

| Foundation input | Required direction                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accent           | Name the exact Frame Kit preset or custom hex. Use `data-accent="preset"` or `applyAccent("#HEX")`, not hard-coded interface colours.                             |
| Style            | Choose base or transparent. Base is unchanged; transparent uses `data-style="transparent"` or `applyFrameKitStyle('transparent')` and keeps the app canvas solid. |
| Themes           | State whether the tool supports light, dark, or both. For custom colours, reapply the accent after a theme change.                                                |
| Density          | State the intended component size or density for the sidebar, canvas controls, toolbars, and other distinct regions.                                              |
| Sidebar          | Paste the JSON produced by Copy stack in the beta Sidebar Builder when an inspector structure has been designed.                                                  |
| Ownership        | State which product layer owns domain state, rendering, history, persistence, and export.                                                                         |

Treat Sidebar Builder JSON as an implementation contract. Preserve its `kind`, `label`, order, and nested `children`, and resolve each kind to a public Frame Kit component. Do not build a runtime JSON renderer unless the product explicitly requires editable layout data.

```text
Frame Kit foundation
Accent: blue preset via data-accent="blue"
Style: transparent via data-style="transparent"
Themes: light + dark
Density: compact inspector
Sidebar data: [paste Copy stack JSON here]

Preserve the sidebar order, labels, and nesting. Resolve each kind to the
public Frame Kit component and use semantic tokens so accent contrast remains
automatic. Keep rendering, history, persistence, and export product-owned.
```

## Component reasoning

Do not translate every numeric parameter into a Slider. Before composing the sidebar, create a control map for every adjustment:

| Record      | Decision                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Parameter   | User-facing adjustment, range, units, default, and reset behaviour.                                         |
| Value model | Scalar, exact, discrete, paired, directional, spatial, tonal, temporal, physical, procedural, or connected. |
| Interaction | Click, type, drag, scrub, draw, select, play, reorder, or direct manipulation.                              |
| Candidates  | Relevant Frame Kit components considered after checking the full catalogue and specs.                       |
| Choice      | Best-fit component or intentional composition.                                                              |
| Group       | User task or feature relationship that owns the control.                                                    |
| Reason      | Why the choice makes the adjustment clearer, faster, or more legible.                                       |

Choose broadly, then use narrowly. An `AxisField` can express a linked X/Y or amount/scale relationship better than two unrelated sliders. `DirectionPad`, `OrbitDial`, `ToneCurve`, `EasingGraph`, `SpringResponse`, `ModulationStrip`, `KeyframeLane`, `ValueGraph`, and `NodeCanvas` similarly expose spatial, tonal, physical, procedural, temporal, or connected models that generic sliders cannot. Pair a graphical control with exact entry when precision is useful.

This is not a requirement to maximize component variety. Retain a `Slider` when a familiar bounded scalar is genuinely the clearest model. Creative components must earn their place through semantic fit.

Treat three or more consecutive generic sliders as a review trigger. Re-check the relevant catalogue and specs, then keep or replace each control deliberately.

## Gaps and small adjustments

Frame Kit should remain useful when a product needs something not yet in the catalogue. First search the exports, specs, and closest complete patterns. If an existing component or deliberate composition does not fit the required value model or interaction, state the gap before adding anything.

- **Product-specific gap** — build a small private component or composition in the application. It must use semantic tokens and follow Frame Kit typography roles, 4px spacing, radius vocabulary, restrained elevation, light/dark themes, visible focus, semantic HTML, and keyboard behaviour.
- **Reusable gap** — add a public Frame Kit component, then complete its source, types, export, styles, live example, AI-readable spec, catalogue, and release checks together.
- **Small adjustment** — prefer documented props and composition. Then use theme/accent APIs or scoped semantic `--fk-*` token overrides. Keep the override local, preserve contrast and keyboard/focus behaviour in both themes, and make a documented variant when the adjustment recurs.

Do not copy or heavily restyle internal component markup to make a one-off design language. A new control should feel like the closest existing Frame Kit control before it is considered complete.

## Professional sidebar structure

- Group controls by the user's task or feature, such as Appearance, Transform, Motion, Input, and Output, rather than by component type.
- Keep dependent values together and order groups in the sequence the user works.
- Order controls within a group by frequency, consequence, and dependency.
- Keep primary controls visible. Use purposeful `Disclosure`, `Popover`, tabs, or secondary views for advanced and conditional controls.
- Avoid excessive labels, repeated readouts, and decorative components that do not improve operation.
- Preserve a clear hierarchy from workspace or selection context, through feature group, to individual adjustment.

## Prompt intake

Extract or establish the following before building:

| Input       | Required answer                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Foundation  | Which accent, style, themes, density, sidebar structure, and application ownership boundaries are fixed? |
| Outcome     | What does the tool create, inspect, transform, or export?                                                |
| Evidence    | Which image, video, product behaviour, existing screen, or data sample grounds the work?                 |
| Controls    | Which values matter, with what ranges, units, defaults, presets, and reset behaviour?                    |
| Control map | Which component best expresses each value and interaction model, in which sidebar group, and why?        |
| Interaction | What can be dragged, selected, typed, played, scrubbed, reordered, or keyboard-adjusted?                 |
| Constraints | Which existing behaviour, components, layout, or visual decisions must remain stable?                    |
| Acceptance  | Which observable visual, interaction, performance, accessibility, and build checks define done?          |

If an answer is absent, inspect the repository and make the smallest reversible assumption that preserves the stated intent. Ask only when a missing decision would materially change the product.

## Required workflow

1. **Discover.** Locate Frame Kit, read its entry document and relevant specs, inspect existing composition, and inventory reusable components.
2. **Foundation.** Confirm the accent, surface style, themes, density, copied sidebar structure, and application ownership boundary.
3. **Model.** Translate the brief into output, state, controls, interaction paths, edge cases, and acceptance criteria.
4. **Compose.** Create the control map, consider the complete catalogue, choose components by semantic fit, and organise the sidebar around user tasks before implementing layout.
5. **Implement.** Keep state ownership explicit, pointer-driven values synchronized, overlays portalled, and public APIs controlled where the surrounding application owns the value.
6. **Inspect.** Use the live application. Exercise pointer, keyboard, focus, hover, active, dragging, loading, disabled, empty, error, and long-content states that apply.
7. **Verify.** Check light and dark themes, narrow and wide layouts, typecheck, build, and relevant performance behaviour.
8. **Refine.** Correct hierarchy, optical spacing, clipping, layout shift, lag, contrast, and inconsistent motion found during inspection.
9. **Handoff.** State the outcome, changed files, checks run, assumptions, and any remaining risk. Do not report a check as passing unless it ran successfully.

## Composition rules

- Import `@presentstandards/framekit-ui/styles.css` exactly once at the application root.
- Import components and icons from `@presentstandards/framekit-ui`.
- Search the exports and component docs before authoring a new primitive.
- Prefer composition over copying or restyling Frame Kit internals.
- When a genuine component gap exists, build it from the Frame Kit foundations; promote reusable primitives through the full public component contract.
- Allow small requested visual adjustments through documented props, theme/accent/style APIs, and scoped semantic tokens while retaining theme, contrast, focus, and keyboard behaviour.
- Choose components by value and interaction model. Do not default to repeated sliders or force creative components for variety.
- Use semantic `--fk-*` tokens for application UI chrome. Do not use raw scale steps or hard-coded colours for interface styling.
- Use the accent slots as a signal. Preserve their derived foreground contrast rather than selecting text colour manually.
- Use Inter for normal interface language. Use Office Code Pro only for compact tags, values, code, and branded metadata; render those uses small and uppercase. Tokens and literal code remain lowercase.
- Use Frame Kit icons on their 15 by 15 grid. Give icon-only actions an accessible name.
- Preserve the kit's flat visual language. Do not add decorative gradients, large shadows, or unrelated scaling effects.
- Keep dense controls readable through hierarchy and optical spacing rather than oversized targets or excess labelling.

## Interaction rules

- Keep the visible fill, handle, value, and dependent preview synchronized during pointer movement.
- Avoid CSS transitions on rapidly updated position or fill properties when they create visible drag lag.
- Do not allow value width changes to shift adjacent controls; reserve stable readout space.
- Keep hover feedback subtle and persistent during active dragging.
- Support the keyboard semantics documented by the chosen component. Do not remove visible focus.
- Keep required information and commands out of hover-only surfaces.
- Portal floating overlays above canvas, transformed parents, and scroll containers; verify viewport flip and clamp behaviour.
- Respect reduced motion for non-essential animation.
- Use correct HTML semantics, labels, roles, state attributes, and announcements before adding ARIA.

## Reference-led work

When the brief includes an image, video, or existing product:

1. Describe the behaviour inferred from the evidence before implementing it.
2. Separate the underlying system from incidental styling.
3. Build an original result informed by the behaviour, not a one-to-one copy.
4. Expose only parameters that produce meaningful creative control.
5. Verify the result against the evidence at multiple representative states, not one still frame.

## Quality gates

| Gate            | Pass condition                                                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation      | Exact accent, style, themes, density, sidebar structure, and product ownership boundary are honoured.                                                      |
| Reuse           | Relevant Frame Kit exports and specs were checked before new UI was written.                                                                               |
| Extension       | A missing component was a genuine gap, and any new private or public control follows the Frame Kit foundations and closest existing pattern.               |
| Adjustment      | Small visual changes use public props, theme/accent/style APIs, or scoped semantic tokens without breaking themes, contrast, focus, or keyboard operation. |
| Selection       | Every control has a defensible semantic fit; repeated generic sliders were deliberately reconsidered.                                                      |
| Structure       | Sidebar groups follow user tasks, dependencies, frequency, and workflow order with purposeful progressive disclosure.                                      |
| Visual language | Semantic tokens, typography roles, density, radii, elevation, and flat styling match the system.                                                           |
| State           | Controlled values, derived previews, fills, handles, and readouts remain synchronized.                                                                     |
| Pointer         | Dragging and scrubbing remain smooth and do not exhibit delayed animation or layout shift.                                                                 |
| Keyboard        | Interactive controls are named, reachable, operable, and visibly focused.                                                                                  |
| Overlays        | Menus, pickers, tooltips, and popovers appear above content and remain within the viewport.                                                                |
| Themes          | Light and dark themes were both inspected, including accent contrast.                                                                                      |
| Layout          | Narrow and wide widths, long labels, double-digit values, empty states, and overflow were checked as relevant.                                             |
| Repository      | The repository's typecheck, build, and targeted tests pass.                                                                                                |
| Browser         | The changed live interface was visually inspected; source review alone is insufficient for UI changes.                                                     |

## Public component contract

When adding or changing a public Frame Kit component, keep these surfaces synchronized in the same change:

- component source and exported types;
- package export barrel;
- component stylesheet and style entry import;
- human docs example and sidebar navigation where applicable;
- AI-readable component spec under `docs/components/`;
- `llms.txt` routing guidance when the component changes how agents should choose controls;
- Ready Made or component-catalog entries that promise access to every component;
- package typecheck and build output.

A public component without a spec and a live example is not complete.

## Handoff format

Return a concise handoff containing:

1. **Outcome** — what now works.
2. **Key decisions** — important composition or architecture choices.
3. **Verification** — exact checks and live states inspected.
4. **Files** — the main changed files.
5. **Open risk** — only genuine unresolved limitations or assumptions.

## Agent setup

- [Shared Frame Kit skill](./skill.md)
- [GPT and Codex](./gpt-codex.md)
- [Claude Code](./claude.md)
