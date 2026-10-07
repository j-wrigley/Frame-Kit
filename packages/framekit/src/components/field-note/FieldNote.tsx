import { forwardRef, type HTMLAttributes } from 'react';

export type FieldNoteTone = 'default' | 'danger';

export interface FieldNoteProps extends HTMLAttributes<HTMLParagraphElement> {
  /** `danger` for a line that says why something can't be done. @default 'default' */
  tone?: FieldNoteTone;
}

/** A one-line quiet readout under a control row — the facts a setting
 *  produces (`3840×2160 · HEVC · ~42 MB`) or, in `danger`, why it can't.
 *  One text style, no icon; long text ends in an ellipsis. Forwards its ref
 *  and spreads rest props (`id` for `aria-describedby`, `title`) onto the <p>. */
export const FieldNote = forwardRef<HTMLParagraphElement, FieldNoteProps>(function FieldNote(
  { tone = 'default', className, ...props },
  ref
) {
  const classes = ['fk-field-note', tone === 'danger' && 'fk-field-note--danger', className]
    .filter(Boolean)
    .join(' ');
  return <p ref={ref} className={classes} {...props} />;
});
