# Quality gates

Apply the gates relevant to the change. For UI work, source inspection alone is never sufficient.

## Visual system

- The requested accent preset or custom hex, surface style, themes, density, and Sidebar Builder structure were implemented as one explicit foundation contract.
- Copied sidebar data preserves `kind`, `label`, order, and nested `children`, with every kind resolved to a public Frame Kit component.
- Existing Frame Kit components and complete patterns were checked first.
- A missing control was identified as a genuine gap before a private or public component was added; the result follows Frame Kit foundations rather than an unrelated visual style.
- Small visual adjustments use documented props, theme/accent/style APIs, or scoped semantic tokens and retain theme, contrast, focus, and keyboard behaviour.
- Each parameter has a defensible component choice based on its value and interaction model.
- Repeated generic sliders were reconsidered against paired, spatial, temporal, tonal, physical, and graphical controls.
- Creative components are used because their model improves the task, not as decoration or a variety quota.
- Sidebar groups follow user tasks, dependencies, frequency, and workflow order rather than component type.
- Primary controls remain visible while advanced and conditional controls use purposeful progressive disclosure.
- UI chrome uses semantic `--fk-*` tokens.
- Typography follows Inter and Office Code Pro roles.
- Surfaces, borders, radii, spacing, and elevation match surrounding Frame Kit work.
- Accent foreground contrast is correct in light and dark themes.
- Custom accents are reapplied after theme changes and continue to use the derived `--fk-text-on-accent` value.
- The result remains flat and restrained without decorative gradients or excessive shadow.

## Interaction

- Hover, focus, active, dragging, selected, disabled, loading, empty, and error states are correct when relevant.
- Pointer-driven fills, handles, readouts, and previews update together.
- Changing number width or unit length does not shift nearby controls.
- Hover feedback remains present while dragging.
- Overlays portal above content, flip or clamp within the viewport, and close correctly.
- Animation is purposeful, interruption-safe, and respects reduced motion.

## Accessibility

- Every control has an accessible name.
- Native semantics are used before ARIA.
- Keyboard behaviour matches the component spec.
- Focus is visible and follows a sensible order.
- Status and asynchronous feedback are announced when needed.
- Information required to complete the task is not available only on hover.

## Layout

- Inspect wide and narrow layouts.
- Test long labels, long values, double digits, units, empty lists, and overflow.
- Confirm no text overlaps controls and no content is hidden behind fixed UI.
- Check overlays near every viewport edge.

## Performance

- Drag and scrub gestures remain visually synchronized.
- Continuous updates avoid unnecessary React tree rerenders.
- Expensive rendering is profiled or isolated when interaction suggests lag.
- Reference media and generated data do not block control response.

## Repository and release

- Run the repository typecheck.
- Run the production build.
- Run relevant targeted tests.
- Inspect the live result in a browser or application runtime.
- For public components, verify source, types, exports, styles, human docs, AI spec, `llms.txt`, and complete catalogs.
- Verify package contents when shipping new docs, skills, assets, or other non-build files.

## Application boundary

- Frame Kit owns interface composition and visual behaviour; the application owns domain state, rendering, history, persistence, and export.
- Sidebar Builder JSON is treated as an implementation brief unless the product explicitly needs a runtime-editable schema.

Report exact commands and outcomes. Do not describe an unrun check as passing.
