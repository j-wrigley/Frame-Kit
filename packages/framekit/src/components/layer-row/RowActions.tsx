import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { InfoCircledIcon, PlusIcon } from '../../icons/icons';
import { Button } from '../button';

export interface RowActionsProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The 'i' cell, normally a `RowInfoButton` used as a `HoverCard` trigger. */
  info?: ReactNode;
  /** The '+' cell, normally a `RowAddButton`, alone or as a `Popover` trigger. */
  add?: ReactNode;
  /** Keeps both cells when one is empty, so a column of list rows lines up
   *  whether or not each row has an 'i'. Leave off in card headers, where an
   *  absent '+' should give its space back to the title. @default false */
  reserve?: boolean;
}

export interface RowInfoButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** Accessible name, such as `About Halftone`. */
  label: string;
}

export interface RowAddButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /** Accessible name, such as `Add Halftone` or `Add settings`. */
  label: string;
}

/** The trailing 'i' then '+' pair for library rows, list rows, and card
 *  headers. The 'i' always sits immediately before the '+'. */
export const RowActions = forwardRef<HTMLSpanElement, RowActionsProps>(function RowActions(
  { info, add, reserve = false, className, ...props },
  ref
) {
  const classes = ['fk-row-actions', className].filter(Boolean).join(' ');
  const showInfo = info != null || reserve;
  const showAdd = add != null || reserve;

  return (
    <span ref={ref} {...props} className={classes} data-reserve={reserve || undefined}>
      {showInfo && <span className="fk-row-actions__info">{info}</span>}
      {showAdd && <span className="fk-row-actions__add">{add}</span>}
    </span>
  );
});

/** The 16px 'i' that opens a node or item explanation. Pair it with a
 *  `HoverCard`; the card's open state shows through `aria-expanded`. */
export const RowInfoButton = forwardRef<HTMLButtonElement, RowInfoButtonProps>(
  function RowInfoButton({ label, type = 'button', className, ...props }, ref) {
    const classes = ['fk-row-info', className].filter(Boolean).join(' ');
    return (
      <button ref={ref} type={type} aria-label={label} {...props} className={classes}>
        <InfoCircledIcon size={12} />
      </button>
    );
  }
);

/** The 20px ghost '+' — the sidebar section-action treatment. Use it as a
 *  plain add action or as a `Popover` trigger for an add-more menu. */
export const RowAddButton = forwardRef<HTMLButtonElement, RowAddButtonProps>(function RowAddButton(
  { label, className, ...props },
  ref
) {
  const classes = ['fk-row-add', className].filter(Boolean).join(' ');
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      aria-label={label}
      iconStart={<PlusIcon />}
      {...props}
      className={classes}
    />
  );
});
