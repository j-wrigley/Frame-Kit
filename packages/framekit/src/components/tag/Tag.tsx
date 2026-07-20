import { forwardRef, type ElementType, type HTMLAttributes } from 'react';

export type TagTone = 'tertiary' | 'secondary' | 'primary' | 'accent';

export interface TagProps extends HTMLAttributes<HTMLElement> {
  /** Text color. @default 'tertiary' */
  tone?: TagTone;
  /** Element to render. @default 'span' */
  as?: ElementType;
}

/** The kit's uppercase micro-label — the single "tag" treatment (Office Code
 *  Pro, uppercase, tracked, 11px) used for eyebrows, field labels, badges,
 *  and section headers. Change `.fk-tag` once and every tag in the kit
 *  follows. */
export const Tag = forwardRef<HTMLElement, TagProps>(function Tag(
  { tone = 'tertiary', as, className, ...props },
  ref
) {
  const Component = (as ?? 'span') as ElementType;
  const classes = ['fk-tag', tone !== 'tertiary' && `fk-tag--${tone}`, className]
    .filter(Boolean)
    .join(' ');
  return <Component ref={ref} className={classes} {...props} />;
});
