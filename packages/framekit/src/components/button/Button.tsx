import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { Loader, type LoaderVariant } from '../loader';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. @default 'secondary' */
  variant?: ButtonVariant;
  /** Control height. @default 'md' */
  size?: ButtonSize;
  /** Icon rendered before the label. */
  iconStart?: ReactNode;
  /** Icon rendered after the label. */
  iconEnd?: ReactNode;
  /** Shows a loader and blocks activation while keeping the button's width,
   *  colors, focus, and accessible name. */
  loading?: boolean;
  /** Loading indicator shown while loading. @default 'grid' */
  loader?: LoaderVariant;
  /** Stretches the button to fill its container. */
  fullWidth?: boolean;
}

// Matches React's own emptiness rendering: null/undefined/false/true/'' render
// nothing, so a button with only those as children is icon-only. `0` is a real
// label and is preserved.
function hasContent(children: ReactNode): boolean {
  return children != null && children !== false && children !== true && children !== '';
}

/** The command button — the primary action control across a tool UI.
 *  Forwards its ref and spreads rest props onto the underlying <button>. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    iconStart,
    iconEnd,
    loading = false,
    loader = 'grid',
    fullWidth = false,
    disabled = false,
    type = 'button',
    className,
    children,
    onClick,
    ...props
  },
  ref
) {
  const hasLabel = hasContent(children);
  // No label → square icon button (caller must supply an aria-label).
  const iconOnly = !hasLabel;

  const classes = [
    'fk-button',
    `fk-button--${variant}`,
    `fk-button--${size}`,
    iconOnly && 'fk-button--icon',
    fullWidth && 'fk-button--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Loading blocks activation without native `disabled` — that would blur the
  // button and drop focus mid-interaction. aria-disabled + this guard keep it
  // focusable and in the a11y tree while inert.
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      className={classes}
      {...props}
      type={type}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
    >
      {loading && <Loader variant={loader} className="fk-button__loader" />}
      <span className="fk-button__content">
        {iconStart != null && (
          <span className="fk-button__icon fk-button__icon--start">{iconStart}</span>
        )}
        {hasLabel && <span className="fk-button__label">{children}</span>}
        {iconEnd != null && <span className="fk-button__icon fk-button__icon--end">{iconEnd}</span>}
      </span>
    </button>
  );
});
