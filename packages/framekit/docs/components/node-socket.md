---
name: Node socket
status: stable
since: 0.3.0
import: import { NodeSocket } from '@presentstandards/framekit-ui'
---

# Node socket

> A node-graph connection socket: one of four lane glyphs, in its open, connected, and patching states. Purely visual; the application owns wiring.

## When to use

- A socket on a node card or properties row that a wire can attach to.
- A legacy port dot that should show its lane (inside an existing port button, as a `span`).
- Anywhere the kind of signal a connection carries must be readable before a drag.

## When not to use

- Use [NodeCanvas](./node-canvas.md) when you need a complete, contained patching surface with its own drag behaviour.
- Use [NodeRow](./node-row.md) to place a socket in the row of the setting it drives; do not hand-position sockets in a card.
- Do not use a socket as a generic status dot. It always means "a wire can attach here".

## Anatomy

`NodeSocket` renders a root (`span` by default, or `button`) with class `fk-node-socket`. The
root is the hit pad: a square sized by the inherited `--fk-node-socket-hit` custom property
(12px by default). Inside it, `.fk-node-socket__glyph` draws the 8px glyph with a 1.5px stroke.

### On a zoomable canvas

Set two properties once, on the workspace that is scaled: `--fk-node-socket-zoom` (the canvas
scale) and the hit pad rule `--fk-node-socket-hit: max(12px, calc(16px / var(--zoom)))`.

| Zoom | Glyph on the card | Glyph on screen | Hit pad on the card | Hit pad on screen | `NodeRow` slot outset |
| ---- | ----------------- | --------------- | ------------------- | ----------------- | --------------------- |
| 200% | 8px               | 16px            | 12px                | 24px              | 0                     |
| 100% | 8px               | 8px             | 16px                | 16px              | 0                     |
| 40%  | 17.5px            | 7px             | 40px                | 16px              | 6.53px                |

- The glyph never draws smaller than **7px on screen**, so the four lane shapes stay readable when
  zoomed out. One growth factor scales the stroke, the inner mark and the state ring with it, so a
  zoomed-out socket is the 100% socket drawn smaller, never a thinner one. The 1.5px gap between
  the glyph and its ring does not grow. Growth stops at 2.5× (below 35% zoom the glyph shrinks
  rather than collide with the next row).
- In a [NodeRow](./node-row.md) the grown socket moves **outward**, by what its half and its ring
  grew: `(grow − 1) × 5.5px`. Its footprint inside the card never changes (glyph and ring end
  7px inside the edge at every zoom), so it never crowds the row's label. Draw a wire's end to the
  socket centre, moved out by the same amount.
- Without `--fk-node-socket-zoom` the glyph is a fixed 8px, as on a sidebar or properties list,
  and nothing moves.

The root carries `data-lane`, `data-connected`, and `data-state`, so an application can read a
socket's lane and state from the DOM (for example, for one delegated tooltip per surface).

### Lanes

Shape carries the lane; colour carries the state. Frame Kit has no categorical palette, so the
glyphs are monochrome.

| Lane      | Glyph                            | Carries                                                                            |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `value`   | Circle                           | Numbers, text, booleans, choices, colours, axes, media, easing, curves, gradients. |
| `pixels`  | Square (1.5px radius)            | Image flow.                                                                        |
| `element` | Ring with a 2px centre dot       | A target element or layer.                                                         |
| `mask`    | Square with the left half filled | A matte.                                                                           |

An input that accepts two lanes shows the glyph of its first kind; name both in its tooltip.

### States

| State               | How to set it                           | Appearance                                                                                                                                                                                                |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open                | default                                 | Tertiary outline on the card surface.                                                                                                                                                                     |
| Connected           | `connected`                             | Accent. `value` and `pixels` fill solid; `element` and `mask` fill their ring gap / empty half with a 40% accent tint, so the inner mark still shows.                                                     |
| Compatible          | `state="compatible"`                    | Accent stroke and an accent ring: a legal target while a wire is being dragged.                                                                                                                           |
| Hint                | `state="hint"`, or `data-compat="hint"` | A 60% accent ring: a legal partner previewed on hover, before any drag starts. The attribute form lets one delegated hover handler mark partners without re-rendering any socket; a `state` wins over it. |
| Source              | `state="source"`                        | Accent fill (per the lane rules) with an accent ring: the socket a wire is being drawn from.                                                                                                              |
| Incompatible        | `state="incompatible"`                  | 30% opacity; does not react to hover.                                                                                                                                                                     |
| Hover (button only) | pointer over the button                 | Accent stroke and ring. A compatible socket under the pointer also scales up slightly.                                                                                                                    |

`state` layers over `connected`: a connected socket can also be a compatible target or a source.

## Props

| Prop        | Type                                                   | Default   | Description                                                                 |
| ----------- | ------------------------------------------------------ | --------- | --------------------------------------------------------------------------- |
| `lane`      | `'value' \| 'pixels' \| 'element' \| 'mask'`           | `'value'` | Signal kind; the glyph shape names it.                                      |
| `connected` | `boolean`                                              | `false`   | A wire is attached.                                                         |
| `state`     | `'compatible' \| 'hint' \| 'source' \| 'incompatible'` | —         | Live patching state, layered over `connected`.                              |
| `as`        | `'span' \| 'button'`                                   | `'span'`  | `button` when the socket is the press target; `span` when it decorates one. |

Forwards `ref` to the root and spreads the remaining attributes onto it, so the application
attaches its own `onPointerDown`, `onClick`, `aria-label`, and data attributes. As a `button` it
defaults to `type="button"`. A `span` socket is `aria-hidden` unless you give it an
`aria-label` or `role`.

### Custom properties

| Property                   | Default          | Set it on                | Purpose                                                                                                |
| -------------------------- | ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `--fk-node-socket-zoom`    | `1`              | The scaled workspace     | The canvas zoom. Grows the glyph so it never draws below 7px on screen (and moves a row's socket out). |
| `--fk-node-socket-hit`     | `12px`           | Any ancestor (inherited) | Hit pad size. A zoomable canvas can set `max(12px, calc(16px / var(--zoom)))` once on its workspace.   |
| `--fk-node-socket-surface` | `--fk-bg-raised` | Any ancestor (inherited) | Fill behind an open glyph and the gap inside its ring. Match the surface the socket sits on.           |
| `--fk-node-socket-ring`    | `transparent`    | The socket itself        | State ring colour. With `color`, lets a parent target light a `span` socket from its own `:hover`.     |

A `span` socket inside a larger target (a legacy port button, a whole row) does not see that
target's hover. Light it from the target instead:

```css
.port:hover .fk-node-socket {
  --fk-node-socket-ring: var(--fk-accent);
  color: var(--fk-accent);
}
```

## Tokens used

| Token                             | Role in this component                                    |
| --------------------------------- | --------------------------------------------------------- |
| `--fk-text-tertiary`              | Open stroke.                                              |
| `--fk-accent` / `--fk-accent-rgb` | Connected, compatible, source, hover; the hint ring.      |
| `--fk-bg-raised`                  | Glyph fill and ring gap (via `--fk-node-socket-surface`). |
| `--fk-text-disabled`              | Disabled button socket.                                   |
| `--fk-focus-outline`              | Keyboard focus around the glyph.                          |

## Keyboard & accessibility

- A `button` socket is a native button: it is focusable and shows the kit focus outline around the glyph. Give it an `aria-label` that names the socket and direction, for example "Connect Cell size" or "Drag to connect Pixels".
- A `span` socket is decorative and hidden from assistive technology; the row or port button it sits in must carry the name.
- The lane is conveyed by shape only. Put the lane in words in the socket's tooltip or accessible description ("Pixels", "Element · vector shapes only").
- Never rely on hover for the only explanation of a refused connection; show the reason in text.

## Examples

```tsx
import { NodeSocket } from '@presentstandards/framekit-ui';

// The press target on a node card edge.
<NodeSocket
  as="button"
  lane="pixels"
  connected={hasWire}
  state={dragState}
  aria-label="Connect In"
  onPointerDown={startWireDrag}
  onClick={openChooser}
/>;

// A lane glyph inside an existing port button.
<button className="port" type="button">
  <NodeSocket lane="mask" connected />
  <span>Mask</span>
</button>;
```

```css
/* Zoom compensation for every socket on a canvas, set once beside the scale. */
.workspace {
  transform: scale(var(--zoom));
  --fk-node-socket-zoom: var(--zoom);
  --fk-node-socket-hit: max(12px, calc(16px / var(--zoom)));
}
```

## Do / Don't

- **Do** set the lane from the port's declared kind, never from its current connection.
- **Do** compute `state` once per drag (at start, on target change, at end), not on every pointer move.
- **Do** centre the socket by layout. `NodeRow` already does; transforms make `offsetTop` measurements drift.
- **Do** set `--fk-node-socket-zoom` on a zoomable canvas, so lane shapes stay readable when it is zoomed out.
- **Don't** colour sockets by lane. Colour is reserved for state.
- **Don't** fill a connected `element` or `mask` glyph solid; its inner shape is what makes the lane readable.
- **Don't** rely on colour alone for the connected state. Under a grey accent (graphite) the stroke barely changes; the fill change is what reads.
