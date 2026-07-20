import { forwardRef, type HTMLAttributes } from 'react';

export type LoaderVariant =
  'grid' | 'bars' | 'steps' | 'pulse' | 'orbit' | 'wave' | 'flip' | 'scan';
export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps extends HTMLAttributes<HTMLSpanElement> {
  /** The visual loading pattern. @default 'grid' */
  variant?: LoaderVariant;
  /** Compact size scale. @default 'md' */
  size?: LoaderSize;
  /** Gives the otherwise decorative indicator an accessible loading label. */
  label?: string;
}

const CELL_COUNT: Record<LoaderVariant, number> = {
  grid: 4,
  bars: 3,
  steps: 3,
  pulse: 0,
  orbit: 0,
  wave: 4,
  flip: 2,
  scan: 0,
};

/** Compact, currentColor-driven activity indicator. Decorative by default;
 *  pass label when it is the only loading status available to assistive tech. */
export const Loader = forwardRef<HTMLSpanElement, LoaderProps>(function Loader(
  { variant = 'grid', size = 'md', label, className, role, 'aria-label': ariaLabel, ...props },
  ref
) {
  const accessibleLabel = label ?? ariaLabel;
  const classes = ['fk-loader', `fk-loader--${variant}`, `fk-loader--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={ref}
      {...props}
      className={classes}
      role={role ?? (accessibleLabel ? 'status' : undefined)}
      aria-label={accessibleLabel}
      aria-hidden={accessibleLabel ? undefined : true}
    >
      {Array.from({ length: CELL_COUNT[variant] }, (_, index) => (
        <span className="fk-loader__cell" aria-hidden="true" key={index} />
      ))}
    </span>
  );
});
