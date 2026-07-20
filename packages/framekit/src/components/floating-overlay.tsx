import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export type FloatingSide = 'top' | 'right' | 'bottom' | 'left';
export type FloatingAlign = 'start' | 'center' | 'end';
export type FloatingPlacement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'right-start'
  | 'right'
  | 'right-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'left-start'
  | 'left'
  | 'left-end';

interface FloatingPortalProps {
  children: ReactNode;
}

/** Keeps transient UI out of clipped component trees and in the document's
 * shared overlay layer. The child remains in its original React tree, so
 * context and synthetic event propagation are preserved. */
export function FloatingPortal({ children }: FloatingPortalProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

interface AnchoredOverlayOptions<TAnchor extends HTMLElement, TPanel extends HTMLElement> {
  open: boolean;
  anchorRef: RefObject<TAnchor | null>;
  panelRef: RefObject<TPanel | null>;
  placement?: FloatingPlacement;
  offset?: number;
  viewportInset?: number;
}

interface FloatingPosition {
  x: number;
  y: number;
  side: FloatingSide;
  anchorWidth: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function oppositeSide(side: FloatingSide): FloatingSide {
  if (side === 'top') return 'bottom';
  if (side === 'bottom') return 'top';
  if (side === 'left') return 'right';
  return 'left';
}

function parsePlacement(placement: FloatingPlacement): {
  side: FloatingSide;
  align: FloatingAlign;
} {
  const [side, align] = placement.split('-') as [FloatingSide, FloatingAlign | undefined];
  return { side, align: align ?? 'center' };
}

function coordinatesFor(
  anchor: DOMRect,
  panel: DOMRect,
  side: FloatingSide,
  align: FloatingAlign,
  offset: number
) {
  const alignedX =
    align === 'start'
      ? anchor.left
      : align === 'end'
        ? anchor.right - panel.width
        : anchor.left + (anchor.width - panel.width) / 2;
  const alignedY =
    align === 'start'
      ? anchor.top
      : align === 'end'
        ? anchor.bottom - panel.height
        : anchor.top + (anchor.height - panel.height) / 2;

  if (side === 'top') return { x: alignedX, y: anchor.top - panel.height - offset };
  if (side === 'bottom') return { x: alignedX, y: anchor.bottom + offset };
  if (side === 'left') return { x: anchor.left - panel.width - offset, y: alignedY };
  return { x: anchor.right + offset, y: alignedY };
}

export function useAnchoredOverlay<TAnchor extends HTMLElement, TPanel extends HTMLElement>({
  open,
  anchorRef,
  panelRef,
  placement = 'bottom-start',
  offset = 4,
  viewportInset = 12,
}: AnchoredOverlayOptions<TAnchor, TPanel>) {
  const [position, setPosition] = useState<FloatingPosition | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const anchorBounds = anchor.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    const { side: requestedSide, align } = parsePlacement(placement);
    let side = requestedSide;
    let next = coordinatesFor(anchorBounds, panelBounds, side, align, offset);

    if (
      (side === 'top' && next.y < viewportInset) ||
      (side === 'bottom' && next.y + panelBounds.height > window.innerHeight - viewportInset) ||
      (side === 'left' && next.x < viewportInset) ||
      (side === 'right' && next.x + panelBounds.width > window.innerWidth - viewportInset)
    ) {
      side = oppositeSide(side);
      next = coordinatesFor(anchorBounds, panelBounds, side, align, offset);
    }

    const maxX = Math.max(viewportInset, window.innerWidth - panelBounds.width - viewportInset);
    const maxY = Math.max(viewportInset, window.innerHeight - panelBounds.height - viewportInset);
    const nextPosition = {
      x: Math.round(clamp(next.x, viewportInset, maxX)),
      y: Math.round(clamp(next.y, viewportInset, maxY)),
      side,
      anchorWidth: Math.round(anchorBounds.width),
    };

    setPosition((current) =>
      current &&
      current.x === nextPosition.x &&
      current.y === nextPosition.y &&
      current.side === nextPosition.side &&
      current.anchorWidth === nextPosition.anchorWidth
        ? current
        : nextPosition
    );
  }, [anchorRef, offset, panelRef, placement, viewportInset]);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return undefined;
    }

    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updatePosition);
    if (observer) {
      if (anchorRef.current) observer.observe(anchorRef.current);
      if (panelRef.current) observer.observe(panelRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      observer?.disconnect();
    };
  }, [anchorRef, open, panelRef, updatePosition]);

  const style: CSSProperties = {
    position: 'fixed',
    left: position?.x ?? 0,
    top: position?.y ?? 0,
    visibility: position ? 'visible' : 'hidden',
  };

  return {
    style,
    side: position?.side ?? parsePlacement(placement).side,
    anchorWidth: position?.anchorWidth,
    positioned: position != null,
  };
}
