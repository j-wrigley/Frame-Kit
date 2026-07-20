---
name: Frame Kit for GPT and Codex
status: stable
since: 0.1.0
---

# Frame Kit for GPT and Codex

> Repository setup and prompt guidance for using the shared Frame Kit skill with Codex.

## Install

Run from the consuming project after installing Frame Kit:

```sh
mkdir -p .agents/skills
cp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .agents/skills/frame-kit
```

Codex discovers repository skills from `.agents/skills`. Commit the copied folder when every contributor and remote task should receive the same Frame Kit workflow.

## Invoke

Mention the skill explicitly in the first build prompt:

```text
$frame-kit Build a compact procedural-pattern tool from the attached reference.
```

The skill description also allows Codex to select it implicitly for matching Frame Kit work. Explicit invocation is preferable when establishing a new tool or auditing a release.

## Separate the context

| Context                                                                               | Location                    |
| ------------------------------------------------------------------------------------- | --------------------------- |
| Durable repository facts, commands, and local conventions                             | `AGENTS.md`                 |
| Reusable Frame Kit workflow and design guidance                                       | `.agents/skills/frame-kit/` |
| Current foundation, outcome, evidence, controls, constraints, and acceptance criteria | The task prompt             |

Do not duplicate the complete skill body in `AGENTS.md`. Keep always-on project facts concise and let the skill load when relevant.

## Prompt shape

```text
$frame-kit Build [tool and output].

Foundation: use [accent preset or exact hex], [themes], and [density].
Sidebar data: [paste JSON copied from the beta Sidebar Builder].
Preserve its kind, label, order, and nested children.
Create a control map: [parameter, value model, interaction, candidates,
component, sidebar group, reason]. Consider the complete Frame Kit catalogue,
reconsider repeated sliders, and use creative controls only when their model fits.

Use [reference or existing screen] to understand [behaviour].
Expose [controls, ranges, presets, and reset behaviour].
Support [pointer, keyboard, selection, and playback interactions].
Preserve [existing behaviour and explicit constraints].
Done means [observable visual, interaction, performance, and build checks].

Inspect the repository, implement the complete result, run its checks,
and visually verify the live interface before handing it back.
```

## Official reference

- [OpenAI: Build skills](https://developers.openai.com/codex/skills/)
