# Prompt recipes

## Intake schema

Extract these fields from the request or establish them through repository inspection:

| Field       | Question                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Foundation  | Which accent, surface style, themes, density, and generated sidebar structure must be established first? |
| Outcome     | What should the tool create, inspect, or transform?                                                      |
| Evidence    | What reference demonstrates the intended behaviour?                                                      |
| Controls    | Which parameters need direct control, with what ranges and units?                                        |
| Control map | For each parameter, what is its data shape, interaction, best-fit component, sidebar group, and reason?  |
| Interaction | What should drag, click, type, scrub, play, select, or reorder?                                          |
| Constraints | What must remain unchanged? Which components or patterns are required?                                   |
| Acceptance  | What observable checks define completion?                                                                |

Ask for clarification only when an unknown answer would materially change the product. Otherwise make the smallest reversible assumption and state it.

## Foundation brief

Place this before the feature description. Use an exact preset or hex value rather than asking the agent to choose an accent.

```text
Frame Kit foundation
- Accent: [preset via data-accent="preset" OR #HEX via applyAccent("#HEX")]
- Style: [base OR transparent via data-style="transparent"]
- Themes: [light, dark, or both]
- Density: [compact, default, large, or a per-region decision]
- Sidebar data: [paste JSON from Copy stack in the beta Sidebar Builder]

Treat this as the interface contract. Preserve the sidebar order, labels, and
nested children. Resolve every kind to a public Frame Kit component. Use
semantic tokens and preserve the generated accent foreground contrast.

Before implementation, create a control map for every parameter. Consider the
complete Frame Kit catalogue, choose by data and interaction model, and group
controls by task, dependency, and frequency. Do not default to sliders and do
not force creative controls where their model does not fit.
```

The Sidebar Builder exports portable `kind`, `label`, and `children` data. It is an implementation brief, not a requirement to ship a JSON-driven renderer. Application state, rendering, history, persistence, and export remain product-owned.

## New creative tool

```text
Use the Frame Kit skill to build [tool] that produces [output].

First apply this foundation: [accent, style, themes, density, copied sidebar data].
Create a control map: [parameter, value model, interaction, candidates, choice,
sidebar group, and reason]. Reconsider repeated generic sliders and group the
sidebar around the user's workflow rather than component type.
Expose [controls, ranges, units, presets, and reset behaviour].
Support [direct manipulation, keyboard, playback, and selection behaviour].
Use existing Frame Kit components before proposing a new primitive.
If no existing component or composition fits, state the gap first. Build a product-specific need from the Frame Kit foundations, or add a reusable public component with its complete release contract. For small visual adjustments, use documented props, theme/accent APIs, or scoped semantic tokens rather than restyling component internals.

Done means [themes, responsive states, interaction quality, accessibility,
performance, typecheck, build, browser inspection, and documentation checks].
```

## Reference-led tool

```text
Use the Frame Kit skill. Inspect [image/video/product] and first describe the
underlying visual or interaction behaviour you infer.

Build an original tool informed by that behaviour. Expose only the parameters
that materially change the result: [parameters]. Preserve [constraints].

Compare representative live states with the reference, verify both themes and
pointer response, run repository checks, and refine before handoff.
```

## Existing interface refinement

```text
Use the Frame Kit skill to refine [surface] without changing [stable behaviour].

Inspect the composition and identify the weakest hierarchy, spacing, state,
responsive, accessibility, or interaction issues. Reuse existing primitives.
Do not redesign unrelated areas.

Verify every changed live state and report the outcome, checks, files, and risk.
```

## Public component addition

```text
Use the Frame Kit skill to add [component] for [specific missing role].

First prove the role is not covered by an existing export or composition.
Define controlled and uncontrolled ownership, states, keyboard semantics,
tokens, sizes, light/dark treatment, and reduced-motion behaviour. Match the
closest Frame Kit pattern for density, spacing, radii, elevation, typography,
and interaction feedback. Add the live docs page,
AI-readable spec, exports, styles, catalog entries, and release verification.
```
