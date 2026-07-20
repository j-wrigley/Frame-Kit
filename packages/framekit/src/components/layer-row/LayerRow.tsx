import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';

export type LayerRowVariant = 'layer' | 'preset';
export type LayerRowActionTone = 'default' | 'danger';

export interface LayerRowAction {
  /** Stable identifier for this row action. */
  id: string;
  /** Accessible name for the icon action. */
  label: string;
  /** Icon rendered inside the compact action target. */
  icon: ReactNode;
  /** Default action or a destructive action. @default 'default' */
  tone?: LayerRowActionTone;
  /** Makes this individual action unavailable. */
  disabled?: boolean;
  /** Called when the action is chosen. */
  onSelect?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

export interface LayerRowProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onSelect'
> {
  /** Primary row label. */
  label: ReactNode;
  /** Quiet trailing metadata such as dimensions, type, or a preset family. */
  meta?: ReactNode;
  /** Leading layer-type icon. Omit for the text-led preset variation. */
  icon?: ReactNode;
  /** Icon-led layer or text-led preset treatment. @default 'layer' */
  variant?: LayerRowVariant;
  /** Marks this row as the current item and reveals its actions. @default false */
  selected?: boolean;
  /** Makes the primary control and every action unavailable. @default false */
  disabled?: boolean;
  /** Compact contextual actions, revealed on hover, focus, or selection. */
  actions?: readonly LayerRowAction[];
  /** Called when the row’s primary control is selected. */
  onSelect?: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}

/**
 * A compact selectable row for layer panels and preset libraries. The layer
 * variation accepts a leading type icon; the preset variation keeps the same
 * selection and action rhythm without one.
 */
export const LayerRow = forwardRef<HTMLDivElement, LayerRowProps>(function LayerRow(
  {
    label,
    meta,
    icon,
    variant = 'layer',
    selected = false,
    disabled = false,
    actions = [],
    onSelect,
    className,
    ...props
  },
  ref
) {
  const classes = ['fk-layer-row', `fk-layer-row--${variant}`, className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      data-actions={actions.length > 0 || undefined}
    >
      <button
        className="fk-layer-row__primary"
        type="button"
        disabled={disabled}
        aria-current={selected ? 'true' : undefined}
        onClick={onSelect}
      >
        {icon != null && (
          <span className="fk-layer-row__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="fk-layer-row__label">{label}</span>
        {meta != null && <span className="fk-layer-row__meta">{meta}</span>}
      </button>
      {actions.length > 0 && (
        <span className="fk-layer-row__actions">
          {actions.map((action) => (
            <button
              className={`fk-layer-row__action fk-layer-row__action--${action.tone ?? 'default'}`}
              type="button"
              key={action.id}
              aria-label={action.label}
              disabled={disabled || action.disabled}
              onClick={action.onSelect}
            >
              {action.icon}
            </button>
          ))}
        </span>
      )}
    </div>
  );
});
