import { forwardRef, type ButtonHTMLAttributes } from 'react';

export type ChipSize = 'sm' | 'md';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Makes it a toggle chip — Auto, Loop, a filter — announced as pressed or
   *  not. Omit for an action chip: a token that inserts itself, a quick pick. */
  pressed?: boolean;
  /** Code-face text, for tokens such as `{value}` or `#tag`. @default false */
  mono?: boolean;
  /** `sm` (18px) sits in a run of chips under a field; `md` (24px) sits beside
   *  `sm` controls in a row. @default 'sm' */
  size?: ChipSize;
}

/** A small bordered button for one short word or token: a placeholder that
 *  inserts itself, or a one-word mode such as Auto that toggles. Lighter
 *  than a Button, and it states its pressed state in the accent. Forwards
 *  its ref and spreads rest props onto the <button>. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { pressed, mono = false, size = 'sm', type = 'button', className, children, ...props },
  ref
) {
  const classes = ['fk-chip', `fk-chip--${size}`, mono && 'fk-chip--mono', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button ref={ref} type={type} className={classes} aria-pressed={pressed} {...props}>
      <span className="fk-chip__label">{children}</span>
    </button>
  );
});
