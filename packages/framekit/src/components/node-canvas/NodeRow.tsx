import {
  createContext,
  forwardRef,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

/** Where a row's sockets sit: centred on the card's border (`edge`, graph
 *  cards) or in a 14px leading gutter (`gutter`, list and properties views). */
export type NodeRowPlacement = 'edge' | 'gutter';

/** Props spread onto the visible label, including `data-*` hooks such as
 *  `data-scrub` for a drag-to-scrub label. */
export type NodeRowLabelProps = HTMLAttributes<HTMLSpanElement> &
  Partial<Record<`data-${string}`, string | number | boolean | undefined>>;

export interface NodeRowsProps extends HTMLAttributes<HTMLDivElement> {
  /** Socket placement for every row inside. @default 'edge' */
  placement?: NodeRowPlacement;
  /** Upper bound of the shared label column in pixels. The longest visible
   *  label sizes the column once for the whole body, up to this width.
   *  Use 72 on compact cards. @default 96 */
  maxLabelWidth?: number;
}

export interface NodeRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible setting name in the label column. A string label also becomes
   *  the label's `title`, so a truncated name stays readable. Omit it and the
   *  control spans the full row. */
  label?: ReactNode;
  /** Props for the label element — for example the application's scrub
   *  handlers plus `data-scrub` for the scrub cursor. */
  labelProps?: NodeRowLabelProps;
  /** The control column: Frame Kit `sm` controls, unchanged. */
  children?: ReactNode;
  /** Names the output side of a row that also has an input, such as `Out`
   *  on a flow row, or the output name on a row with no input. Sits at the
   *  row's end, beside the output socket. */
  outputLabel?: ReactNode;
  /** Quiet trailing readout (mono, tertiary) after the output label — a live
   *  value, a count, or a size. */
  meta?: ReactNode;
  /** Input socket, normally a `NodeSocket`, placed on the left edge or gutter. */
  input?: ReactNode;
  /** Output socket, normally a `NodeSocket`, placed on the right edge. */
  output?: ReactNode;
  /** Overrides the placement inherited from `NodeRows`. @default 'edge' */
  placement?: NodeRowPlacement;
  /** A labelled row whose control spans both columns on its own line below
   *  the label, for editors and lists. Sockets stay on the label line. @default false */
  wide?: boolean;
  /** Pins the label and sockets to the first 24px line when the control is
   *  taller than one line. @default false */
  tall?: boolean;
  /** The value is driven by a wire: the application disables the control and
   *  the row shows the live value in accent text. @default false */
  driven?: boolean;
  /** The setting is not used with the current settings; the row recedes.
   *  @default false */
  inactive?: boolean;
  /** The value is animated; a small diamond follows the label. @default false */
  animated?: boolean;
  /** The pointer is over this row while a compatible wire is being dropped.
   *  @default false */
  dropTarget?: boolean;
}

const PlacementContext = createContext<NodeRowPlacement | null>(null);

/** The body grid for a node card or a properties section. Rows inside share
 *  one label column (CSS subgrid), so labels align down the card without a
 *  fixed width. In `edge` placement it also owns the card body padding the
 *  edge sockets are measured against. */
export const NodeRows = forwardRef<HTMLDivElement, NodeRowsProps>(function NodeRows(
  { placement = 'edge', maxLabelWidth = 96, className, style, children, ...props },
  ref
) {
  const classes = ['fk-node-rows', className].filter(Boolean).join(' ');
  const rootStyle = {
    ...style,
    '--fk-node-rows-label-max': `${maxLabelWidth}px`,
  } as CSSProperties;

  return (
    <div ref={ref} {...props} className={classes} style={rootStyle} data-placement={placement}>
      <PlacementContext.Provider value={placement}>{children}</PlacementContext.Provider>
    </div>
  );
});

/** One setting in a node card: label | control, with its socket in the row
 *  it drives or emits. Purely visual — the application owns wiring, drop
 *  targets, history, and the control's behaviour. Sockets are centred by
 *  layout rather than transforms, so offsetTop/offsetHeight measure their
 *  centre exactly under a scaled canvas. */
export const NodeRow = forwardRef<HTMLDivElement, NodeRowProps>(function NodeRow(
  {
    label,
    labelProps,
    children,
    outputLabel,
    meta,
    input,
    output,
    placement,
    wide = false,
    tall = false,
    driven = false,
    inactive = false,
    animated = false,
    dropTarget = false,
    className,
    ...props
  },
  ref
) {
  const inherited = useContext(PlacementContext);
  const resolvedPlacement = placement ?? inherited ?? 'edge';
  const hasLabel = label != null && label !== false;
  const classes = ['fk-node-row', className].filter(Boolean).join(' ');
  const { className: labelClassName, ...restLabelProps } = labelProps ?? {};
  const labelClasses = ['fk-node-row__label', labelClassName].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      data-placement={resolvedPlacement}
      data-labelled={hasLabel || undefined}
      data-wide={(wide && hasLabel) || undefined}
      data-tall={tall || undefined}
      data-driven={driven || undefined}
      data-inactive={inactive || undefined}
      data-drop-target={dropTarget || undefined}
    >
      {/* Slots are placed by layout, not by source order, so the input
          socket comes first in the DOM: keyboard focus then follows what
          the row shows — input socket, control, output socket. */}
      {input != null && (
        <span className="fk-node-row__socket fk-node-row__socket--in">{input}</span>
      )}
      {hasLabel && (
        <span
          title={typeof label === 'string' ? label : undefined}
          {...restLabelProps}
          className={labelClasses}
        >
          <span className="fk-node-row__label-text">{label}</span>
          {animated && <span className="fk-node-row__animated" aria-hidden="true" />}
        </span>
      )}
      <div className="fk-node-row__control">
        {children}
        {outputLabel != null && <span className="fk-node-row__output-label">{outputLabel}</span>}
        {meta != null && <span className="fk-node-row__meta">{meta}</span>}
      </div>
      {output != null && (
        <span className="fk-node-row__socket fk-node-row__socket--out">{output}</span>
      )}
    </div>
  );
});
