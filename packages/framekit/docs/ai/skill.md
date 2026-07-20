---
name: Frame Kit shared skill
status: stable
since: 0.1.0
---

# Frame Kit shared skill

> One provider-neutral agent skill that teaches GPT, Codex, and Claude how to build and refine interfaces with Frame Kit.

## Canonical source

The npm package ships the complete skill at:

```text
node_modules/@presentstandards/framekit-ui/skills/frame-kit/
```

Copy the complete folder, including `references/` and `agents/`, into the project discovery path for the active agent.

| Agent       | Project destination         | Explicit invocation |
| ----------- | --------------------------- | ------------------- |
| GPT / Codex | `.agents/skills/frame-kit/` | `$frame-kit`        |
| Claude Code | `.claude/skills/frame-kit/` | `/frame-kit`        |

The `SKILL.md` body is shared. `agents/openai.yaml` adds optional Codex presentation metadata and does not change the workflow Claude receives.

## Skill contents

| File                              | Purpose                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `SKILL.md`                        | Trigger description, required reading order, workflow, and non-negotiable rules.                                   |
| `references/component-routing.md` | Routes a UI need to the most relevant Frame Kit component specs.                                                   |
| `references/prompt-recipes.md`    | Foundation brief, intake schema, and reusable prompt structures for new tools, reference-led work, and refinement. |
| `references/quality-gates.md`     | Foundation, visual, interaction, accessibility, performance, documentation, and release verification.              |
| `agents/openai.yaml`              | Optional Codex display name, description, and default prompt.                                                      |

## Trigger scope

Use the skill when a task asks an agent to:

- build a creative or productivity tool using Frame Kit;
- compose an inspector, toolbar, canvas-adjacent control surface, timeline, or sidebar;
- refine an existing Frame Kit interface;
- choose between Frame Kit value or creative controls;
- add or change a public Frame Kit component;
- audit a Frame Kit UI for consistency or release readiness.

When no existing component or composition fits a requested control, the skill identifies the gap and builds the smallest appropriate extension from Frame Kit's foundations. Small visual adjustments remain possible through documented props, theme/accent APIs, and scoped semantic tokens; reusable extensions graduate to the public component contract.

Do not use it as a generic React framework guide when Frame Kit is absent from the project.

## Minimal invocation

```text
Use the Frame Kit skill to build a compact masking inspector from the attached reference.
Foundation: blue accent, light + dark, compact density, and this copied Sidebar
Builder JSON: [paste stack]. Preserve its order, labels, and nesting.
Create a control map for every parameter, consider the full catalogue, and
justify the component and sidebar group. Do not default to repeated sliders.
Compose existing controls first, verify pointer response and both themes, then run the
repository checks and inspect the completed interface in the browser.
```

## Versioning

The skill is part of the Frame Kit package contract. Update it when a new component, token rule, verification requirement, or public release step changes how an agent should work.
