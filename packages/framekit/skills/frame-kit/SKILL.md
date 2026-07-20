---
name: frame-kit
description: Build, refine, or audit creative and productivity tool interfaces with @presentstandards/framekit-ui. Use for Frame Kit components, inspectors, toolbars, sidebars, timelines, creative controls, design-system consistency, and public component changes. Do not use as a generic React guide when Frame Kit is not present.
---

# Frame Kit

Use Frame Kit as the source of truth for the interface language and the user's brief as the source of truth for the tool's product behaviour.

## Locate the kit

Find the active Frame Kit package before editing. Prefer the workspace package when the repository contains one; otherwise locate `node_modules/@presentstandards/framekit-ui/package.json`. Treat that directory as `FRAMEKIT_ROOT`.

Read these files before implementation:

1. Repository instructions and package scripts.
2. `FRAMEKIT_ROOT/llms.txt`.
3. `FRAMEKIT_ROOT/docs/principles.md`.
4. The foundation and component specs relevant to the task.
5. The closest existing complete interface in the consuming project.

Read [component routing](references/component-routing.md) when choosing controls. Read [prompt recipes](references/prompt-recipes.md) when the requested outcome or acceptance criteria are underspecified. Read [quality gates](references/quality-gates.md) before verification or any public package change.

## Translate the brief

Establish:

- the Frame Kit foundation: exact accent preset or custom hex, base or transparent style, supported themes, density, and any Sidebar Builder data;
- the creative or productivity outcome;
- reference evidence and what behaviour it demonstrates;
- application state and domain logic;
- controls, ranges, units, defaults, presets, and reset behaviour;
- a control map connecting each parameter to its data shape, interaction, best-fit Frame Kit component, sidebar group, and reason;
- pointer, keyboard, selection, playback, and editing paths;
- constraints and existing behaviour that must remain stable;
- observable acceptance criteria.

Frame Kit does not provide the application's renderer, data model, persistence, history, or export engine. Choose and verify those for the specific tool.

## Establish the foundation

Before feature UI, turn the user's visual choices into an explicit contract:

1. Record the exact accent. Use `data-accent="<preset>"` for a Frame Kit preset or `applyAccent("#HEX")` for a custom colour. Reapply a custom accent after theme changes and preserve the generated `--fk-text-on-accent` foreground.
2. Record the surface style: base is the unchanged default; transparent uses `data-style="transparent"` or `applyFrameKitStyle('transparent')`. Keep the application canvas solid.
3. Record supported themes and intended density or size variants.
4. When the user supplies JSON from the beta Sidebar Builder, preserve its `kind`, `label`, order, and nested `children`. Resolve each `kind` to the corresponding public Frame Kit component. Treat the JSON as an implementation brief, not a required runtime format.
5. Keep application state, domain data, rendering, history, persistence, and export outside the Frame Kit component layer.

Read [prompt recipes](references/prompt-recipes.md) for a copyable foundation schema.

## Choose components deliberately

Before implementation, read [component routing](references/component-routing.md) and consider the complete relevant Frame Kit catalogue. Do not stop at the first familiar control.

For every parameter:

1. Identify the value model: scalar, exact, discrete, paired, directional, spatial, tonal, temporal, physical, procedural, or connected.
2. Identify the interaction: click, type, drag, scrub, draw, select, play, reorder, or direct manipulation.
3. Compare candidate Frame Kit components and choose the smallest component whose model makes the adjustment clearer.
4. Record the chosen component, sidebar group, and a short reason before composing the interface.
5. Pair a visual or creative control with exact entry when both direct manipulation and precision matter.

Do not default every numeric parameter to `Slider`. If a sidebar contains three or more similar sliders, explicitly reconsider `AxisField`, `DragValue`, `Scrubber`, `RulerSlider`, `DirectionPad`, `OrbitDial`, `ToneCurve`, `EasingGraph`, `SpringResponse`, `ModulationStrip`, `KeyframeLane`, `ValueGraph`, and other relevant models. This is a review trigger, not a diversity quota: keep a Slider when it remains the clearest fit.

Group controls around user tasks and feature relationships such as Appearance, Transform, Motion, Input, and Output. Keep frequent controls visible, nest advanced or conditional settings with purposeful disclosure, keep dependent values together, and order groups in the sequence the user works. Do not group controls merely because they share a component type.

## Extend without drifting

When a requested control, pattern, or visual treatment is not already in Frame Kit, do not fill the gap with an unrelated third-party component or a one-off visual style.

1. First prove that no documented public component or intentional composition covers the required value model and interaction.
2. State the gap and decide whether it is product-specific or reusable.
3. For a product-specific need, build a small private component or composition in the application. It must follow the relevant foundation rules: semantic tokens, Inter and Office Code Pro roles, 4px spacing, sharp radius vocabulary, restrained elevation, accessible semantics, visible focus, documented keyboard behaviour, and light/dark support.
4. For a reusable need, add a public Frame Kit component and complete the public component contract below. Do not leave a reusable primitive as an undocumented local fork.
5. Compare the result with the closest existing Frame Kit control or pattern. Refine density, states, interaction response, and optical spacing until it belongs beside it.

Small design adjustments are allowed when the user asks for them. Use this order: documented component props and composition first; theme or accent APIs second; scoped semantic `--fk-*` token overrides third; a new documented variant or component when the adjustment becomes a recurring product need. Keep overrides local to the application surface, preserve both themes and accessible contrast, and do not restyle private component internals to force a new design language.

## Work in this order

1. **Discover:** Inspect exports, specs, and existing compositions before proposing new UI.
2. **Foundation:** Confirm accent, surface style, themes, density, sidebar structure, and application ownership boundaries.
3. **Model:** Define state ownership, interactions, edge cases, and acceptance criteria.
4. **Compose:** Build the control map, choose components deliberately, and group the sidebar around user tasks before implementing layout.
5. **Implement:** Keep values controlled where the application owns them and synchronize every derived visual during interaction.
6. **Inspect:** Exercise the live interface with pointer and keyboard in every relevant state.
7. **Verify:** Check themes, widths, accessibility, performance, typecheck, build, and targeted tests.
8. **Refine:** Fix hierarchy, optical spacing, clipping, contrast, lag, layout shift, and inconsistent motion.
9. **Handoff:** Report the outcome, decisions, exact verification, changed files, and genuine remaining risks.

## Non-negotiable UI rules

- Import `@presentstandards/framekit-ui/styles.css` once at the application root.
- Import components and icons from `@presentstandards/framekit-ui`.
- Search Frame Kit exports and specs before building a new primitive.
- Compose existing components instead of copying or restyling their internals.
- When no component fits, follow the extension policy: explain the gap, build from the foundations, and promote recurring primitives through the public component contract.
- Use documented props, theme/accent/style APIs, and scoped semantic tokens for small adjustments; preserve theme, contrast, focus, and keyboard behaviour.
- Choose controls by value model and interaction rather than defaulting to generic sliders or forcing decorative variety.
- Use semantic `--fk-*` tokens for UI chrome. Do not hardcode interface colours or use raw scale tokens.
- Preserve accent-derived foreground contrast in light and dark themes.
- Use Inter for normal UI copy. Use Office Code Pro only for small uppercase tags, values, code, and branded metadata. Keep literal tokens and code lowercase.
- Keep the visual language flat: restrained borders and elevation, no decorative gradients, no oversized shadow, and no unrelated flourish.
- Use Frame Kit icons and accessible names for icon-only actions.
- Keep overlays above canvases and transformed or scrolling content; verify viewport placement.
- Preserve documented keyboard semantics and visible focus.
- Respect reduced motion for non-essential animation.

## Interaction quality

- Update handles, fills, readouts, and dependent previews in the same interaction frame.
- Do not animate rapidly changing position or fill properties in a way that causes drag lag.
- Reserve stable width for changing values so controls do not shift at double digits or longer units.
- Make hover feedback subtle and keep it active while dragging.
- Verify loading, disabled, empty, error, long-label, and overflow states when relevant.
- Test pointer-driven creative controls for unnecessary rerenders and visible response delay.

## Public component changes

When adding or changing a public Frame Kit component, update together:

- component source and types;
- public export barrel;
- component stylesheet and style entry;
- live docs page and navigation;
- `docs/components/<component>.md` AI-readable spec;
- `llms.txt` routing when agent choice changes;
- complete component catalogs or Ready Made builders that promise all components;
- package typecheck and build.

A public component without a live example and AI-readable spec is incomplete.

## Completion

Do not stop at source review for a UI task. Run the repository's checks and inspect the live result. Never state that a check passed unless it ran successfully.
