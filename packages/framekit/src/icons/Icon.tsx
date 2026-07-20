import { forwardRef } from 'react';
import type { IconProps } from './create-icon';
import { ICONS, type IconName } from './icons';

export interface DynamicIconProps extends IconProps {
  /** Kebab-case icon name, e.g. "magnifying-glass". Autocompletes via IconName. */
  name: IconName;
}

/** Dynamic icon lookup for names known only at runtime.
 *  Prefer the named per-icon exports (tree-shakeable) in static code. */
export const Icon = /* @__PURE__ */ forwardRef<SVGSVGElement, DynamicIconProps>(function Icon(
  { name, ...props },
  ref
) {
  const Component = ICONS[name];
  if (!Component) {
    // Runtime names can come from user data — fail soft, not with a render crash.
    console.warn(`[framekit] Unknown icon name: "${name}"`);
    return null;
  }
  return <Component ref={ref} {...props} />;
});
