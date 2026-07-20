# Frame Kit — Motion

> One easing curve, two durations. Animation confirms an action — it never
> performs. This is the usage reference; raw values live in
> [the token reference](./tokens.md).

## Tokens

| Token                | Use                                      |
| -------------------- | ---------------------------------------- |
| `--fk-ease`          | Every transition — one curve             |
| `--fk-duration-fast` | Hover, press, and state feedback (120ms) |
| `--fk-duration`      | Reveals, popovers, thumb travel (180ms)  |

Consuming apps use the same three tokens. If a surface needs a transition, it
is `var(--fk-duration-fast) var(--fk-ease)` for state feedback or
`var(--fk-duration) var(--fk-ease)` for a reveal — there is no third speed and
no second public curve.

## Which duration

- **Fast (120ms)** — anything answering the pointer or keyboard right now:
  control hover, press, focus emphasis, checkmark reveal, icon flips
  (e.g. the [Dropdown](./components/dropdown.md) caret).
- **Base (180ms)** — anything appearing or traveling: overlay entrances
  ([Popover](./components/popover.md), [Toolbar](./components/toolbar.md)
  flyouts), the [Segmented Switch](./components/segmented-switch.md) thumb.
  One 180ms move, in and out.

Concise overlays cheat toward immediacy: the
[Context Menu](./components/context-menu.md) and
[Hover Card](./components/hover-card.md) enter at `--fk-duration-fast` because
they follow the cursor and must feel instant.

## What animates — and what never does

Component styles transition **named properties, never `all`**. The recurring
set, always at `--fk-duration-fast` with `--fk-ease`: `background`,
`border-color`, `color`, `opacity` — control chrome answering a state change.
`transform` and `box-shadow` join for press/hover feel
([Button](./components/button.md) scales to 0.985 on press). Overlay entrances
are `@keyframes`, not transitions, so they play on mount — opacity plus a 2px
translate and ~0.98 scale for popovers, menus, and hover cards; the toolbar
flyout slides in with a 4px horizontal translate and no scale.

**Pointer-driven values never transition.** A dragged handle renders at the
pointer, immediately: the [Scrubber](./components/scrubber.md) thumb position
updates without a transition (hover/drag intent is signalled through
transform, fill, and halo instead), and a
[Node Canvas](./components/node-canvas.md) node sets `transition: none` while
`[data-dragging]`. In a creative tool, lag between input and value is a bug,
not polish.

## Component-internal exceptions

A few components carry private motion variables tuned for their mechanic.
They are internal — not API, not for reuse:

| Component                          | Internal motion                                                                                                                                                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Button](./components/button.md)   | `--fk-button-hover-ease` — a snappier curve for transform/shadow only                                                                                                                                                                                                                        |
| [Stepper](./components/stepper.md) | 160ms value-flip animation with its own ease                                                                                                                                                                                                                                                 |
| [Loader](./components/loader.md)   | Continuous loops at 720ms–1s — indicators, not transitions                                                                                                                                                                                                                                   |
| Value-control handles              | `--fk-slider/ruler/drag/scrubber-handle-duration/-ease` — per-handle 160–180ms curves for transform/fill/halo feedback in [Slider](./components/slider.md), [Ruler Slider](./components/ruler-slider.md), [Drag Value](./components/drag-value.md), and [Scrubber](./components/scrubber.md) |

Everything else uses the three public tokens directly.

## Reduced motion

Motion is a courtesy, never a requirement. The policy has two layers:

- **Global collapse** — `base.css` ships a
  `@media (prefers-reduced-motion: reduce)` block that forces
  `animation-duration` and `transition-duration` to `0.01ms`,
  `animation-iteration-count` to `1`, and `scroll-behavior` to `auto` on every
  element (`!important`). End states still apply; nothing moves to get there.
- **Explicit opt-outs** — components with entrance animations or traveling
  parts (popover, toolbar, context menu, hover card, dropdown, segmented
  switch, toggle, frame, layer row, value controls) additionally set
  `animation: none` / `transition: none` under the same query, so their motion
  is removed rather than merely instant. The [Stepper](./components/stepper.md)
  goes further and removes its flip layer entirely (`display: none`) under the
  same query.

Script-driven motion must check the same preference:
`window.matchMedia('(prefers-reduced-motion: reduce)')` before starting, as
the docs app's Frames page does.
