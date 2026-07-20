/** Frame Kit's surface treatments. Base is the unchanged default. */
export const FRAMEKIT_STYLES = ['base', 'transparent'] as const;

export type FrameKitStyle = (typeof FRAMEKIT_STYLES)[number];

/** Read the active surface treatment from a root element. */
export function getFrameKitStyle(root: HTMLElement = document.documentElement): FrameKitStyle {
  return root.dataset.style === 'transparent' ? 'transparent' : 'base';
}

/**
 * Apply a Frame Kit surface treatment to a root element. The base treatment is
 * represented by no attribute so existing applications remain unchanged.
 */
export function applyFrameKitStyle(
  style: FrameKitStyle,
  root: HTMLElement = document.documentElement
): FrameKitStyle {
  if (style === 'transparent') {
    root.dataset.style = 'transparent';
  } else {
    delete root.dataset.style;
  }

  return style;
}

/** Restore Frame Kit's unchanged base surface treatment. */
export function resetFrameKitStyle(root: HTMLElement = document.documentElement): void {
  delete root.dataset.style;
}
