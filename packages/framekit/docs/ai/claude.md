---
name: Frame Kit for Claude
status: stable
since: 0.1.0
---

# Frame Kit for Claude

> Project setup and prompt guidance for using the shared Frame Kit skill with Claude Code.

## Install

Run from the consuming project after installing Frame Kit:

```sh
mkdir -p .claude/skills
cp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .claude/skills/frame-kit
```

Claude Code discovers project skills from `.claude/skills`. Copy the complete folder so the progressive reference files remain available beside `SKILL.md`.

## Invoke

Invoke the skill directly when beginning a new tool or a systematic refinement:

```text
/frame-kit Build a compact procedural-pattern tool from the attached reference.
```

Claude may also select the skill automatically when the task matches its description.

## Separate the context

| Context                                                                               | Location                    |
| ------------------------------------------------------------------------------------- | --------------------------- |
| Durable repository facts, commands, and local conventions                             | `CLAUDE.md`                 |
| Reusable Frame Kit workflow and design guidance                                       | `.claude/skills/frame-kit/` |
| Current foundation, outcome, evidence, controls, constraints, and acceptance criteria | The task prompt             |

Keep the reusable procedure in the skill instead of turning `CLAUDE.md` into a long workflow manual.

## Prompt shape

```text
/frame-kit Build [tool and output].

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

- [Anthropic: Extend Claude with skills](https://code.claude.com/docs/en/slash-commands)
