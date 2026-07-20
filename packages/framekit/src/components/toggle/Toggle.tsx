import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export type ToggleSize = 'sm' | 'md';
export type ToggleTone = 'default' | 'danger';
export type ToggleRowVariant = 'default' | 'compact';

export interface ToggleProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size' | 'type'
> {
  /** Track density. @default 'md' */
  size?: ToggleSize;
  /** Default setting intent or a destructive setting. @default 'default' */
  tone?: ToggleTone;
  /** Additional classes on the visible toggle root. */
  className?: string;
}

export interface ToggleRowProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size' | 'type'
> {
  /** Visible setting name associated with the native switch. */
  label: ReactNode;
  /** Quiet supporting detail for inspector rows. */
  description?: ReactNode;
  /** Optional content placed before the toggle, such as a shortcut or state summary. */
  meta?: ReactNode;
  /** Full inspector row or the minimal menu-style row. @default 'default' */
  variant?: ToggleRowVariant;
  /** Track density. Compact rows use `sm` by default. */
  size?: ToggleSize;
  /** Default setting intent or a destructive setting. @default 'default' */
  tone?: ToggleTone;
  /** Additional classes on the visible labelled row. */
  className?: string;
}

/** A native checkbox presented as a switch. Use it for an immediate binary
 * setting, not a choice between two equally weighted modes. */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { size = 'md', tone = 'default', className, disabled = false, ...props },
  ref
) {
  const classes = ['fk-toggle', `fk-toggle--${size}`, `fk-toggle--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} data-disabled={disabled || undefined}>
      <input
        ref={ref}
        {...props}
        className="fk-toggle__input"
        type="checkbox"
        role="switch"
        disabled={disabled}
      />
      <span className="fk-toggle__track" aria-hidden="true">
        <span className="fk-toggle__thumb" />
      </span>
    </span>
  );
});

/** A complete native switch setting for inspector panels and compact menus.
 * The entire row is one implicit label, so either the content or track toggles
 * the setting without simulating checkbox behavior. */
export const ToggleRow = forwardRef<HTMLInputElement, ToggleRowProps>(function ToggleRow(
  {
    label,
    description,
    meta,
    variant = 'default',
    size,
    tone = 'default',
    className,
    disabled = false,
    ...props
  },
  ref
) {
  const classes = [
    'fk-toggle-row',
    `fk-toggle-row--${variant}`,
    `fk-toggle-row--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const toggleSize = size ?? (variant === 'compact' ? 'sm' : 'md');

  return (
    <label className={classes} data-disabled={disabled || undefined}>
      <span className="fk-toggle-row__content">
        <span className="fk-toggle-row__label">{label}</span>
        {description != null && <span className="fk-toggle-row__description">{description}</span>}
      </span>
      {meta != null && <span className="fk-toggle-row__meta">{meta}</span>}
      <Toggle ref={ref} {...props} size={toggleSize} tone={tone} disabled={disabled} />
    </label>
  );
});
