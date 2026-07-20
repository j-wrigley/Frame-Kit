import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ColorSwatchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The color to display (any CSS color; hex for kit workflows). */
  color: string;
  /** Marks the swatch as the current selection. */
  selected?: boolean;
  /** Swatch size. @default 'md' */
  size?: 'sm' | 'md';
}

/** A clickable color chip — preset rows, palette grids, picker triggers.
 *  Accessible name defaults to the color value; pass aria-label for a
 *  friendlier one (e.g. "Sage"). */
export const ColorSwatch = forwardRef<HTMLButtonElement, ColorSwatchProps>(function ColorSwatch(
  { color, selected = false, size = 'md', type = 'button', className, style, ...props },
  ref
) {
  const classes = [
    'fk-color-swatch',
    size === 'sm' && 'fk-color-swatch--sm',
    selected && 'fk-color-swatch--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      style={{ ...style, background: color }}
      aria-label={props['aria-label'] ?? color}
      aria-pressed={selected}
      {...props}
    />
  );
});
