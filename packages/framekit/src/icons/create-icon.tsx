import { forwardRef, type ReactNode, type SVGAttributes } from 'react';

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /** Square size in px. Icons are drawn on a 15×15 grid. @default 15 */
  size?: number | string;
}

/** Wraps raw icon markup in a consistent, accessible SVG shell.
 *  Icons are decorative (aria-hidden) unless labelled via aria-label or
 *  aria-labelledby — a labelled icon renders role="img" so assistive
 *  technology reliably announces it. */
export function createIcon(displayName: string, children: ReactNode) {
  const Component = forwardRef<SVGSVGElement, IconProps>(function IconBase(
    { size = 15, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, ...props },
    ref
  ) {
    const labelled = ariaLabel != null || ariaLabelledby != null;
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role={labelled ? 'img' : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-hidden={labelled ? undefined : true}
        focusable="false"
        {...props}
      >
        {children}
      </svg>
    );
  });
  Component.displayName = displayName;
  return Component;
}
