import { forwardRef, type ButtonHTMLAttributes, type ElementType } from 'react';

/** The kind of signal a socket carries. Each lane has its own glyph shape. */
export type NodeSocketLane = 'value' | 'pixels' | 'element' | 'mask';

/** Transient patching state, layered over `connected`. */
export type NodeSocketState = 'compatible' | 'hint' | 'source' | 'incompatible';

export interface NodeSocketProps extends Omit<ButtonHTMLAttributes<HTMLElement>, 'children'> {
  /** Signal kind; the glyph shape names it. @default 'value' */
  lane?: NodeSocketLane;
  /** A wire is attached. Colour carries the state, so the glyph turns accent
   *  while keeping its shape. @default false */
  connected?: boolean;
  /** Live patching state: a legal target during a drag (`compatible`), a
   *  legal partner previewed before a drag (`hint`), the socket a wire is
   *  being drawn from (`source`), or not a legal target (`incompatible`). */
  state?: NodeSocketState;
  /** Element to render. Use `button` when the socket is itself the press
   *  target; keep `span` when it decorates a larger target such as a row.
   *  @default 'span' */
  as?: 'span' | 'button';
}

/** A node-graph connection socket: one of four lane glyphs (Value circle,
 *  Pixels square, Element ring-with-dot, Mask half-filled square) in its
 *  open, connected, and patching states. Purely visual — the application
 *  owns wiring, legality, and every pointer behaviour. */
export const NodeSocket = forwardRef<HTMLElement, NodeSocketProps>(function NodeSocket(
  { lane = 'value', connected = false, state, as = 'span', type, className, ...props },
  ref
) {
  const Component = as as ElementType;
  const isButton = as === 'button';
  // A span socket is decoration on a target that already has a name; hide it
  // from assistive technology unless the caller explicitly names it.
  const decorative = !isButton && props['aria-label'] == null && props.role == null;
  const classes = ['fk-node-socket', className].filter(Boolean).join(' ');

  return (
    <Component
      ref={ref}
      type={isButton ? (type ?? 'button') : undefined}
      aria-hidden={decorative || undefined}
      {...props}
      className={classes}
      data-lane={lane}
      data-connected={connected || undefined}
      data-state={state}
    >
      <span className="fk-node-socket__glyph" aria-hidden="true" />
    </Component>
  );
});
