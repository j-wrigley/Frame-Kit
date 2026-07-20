import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { FloatingPortal } from '../floating-overlay';

export type PopoverSize = 'sm' | 'md' | 'lg' | 'auto';
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverPlacement =
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

export interface PopoverProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** One interactive element that opens and anchors the popover. */
  trigger: ReactElement;
  /** Arbitrary Frame Kit controls or supporting content rendered in the panel. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the popover requests a state change. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement. The panel flips and clamps to remain in the viewport. @default 'bottom-start' */
  placement?: PopoverPlacement;
  /** Surface width. Use auto to fit compact child content. @default 'md' */
  size?: PopoverSize;
  /** Gap between the anchor and panel in pixels. @default 8 */
  offset?: number;
  /** Accessible label for the non-modal dialog panel. @default 'Popover' */
  panelLabel?: string;
  /** Moves focus to the first enabled control when the panel opens. @default false */
  autoFocus?: boolean;
  /** Additional class applied to the floating panel surface. */
  panelClassName?: string;
}

interface PopoverPosition {
  x: number;
  y: number;
  side: PopoverSide;
}

const VIEWPORT_INSET = 12;
const FOCUSABLE_SELECTOR = [
  'button:not(:disabled)',
  '[href]',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function oppositeSide(side: PopoverSide): PopoverSide {
  if (side === 'top') return 'bottom';
  if (side === 'bottom') return 'top';
  if (side === 'left') return 'right';
  return 'left';
}

function parsePlacement(placement: PopoverPlacement): {
  side: PopoverSide;
  align: PopoverAlign;
} {
  const [side, align] = placement.split('-') as [PopoverSide, PopoverAlign | undefined];
  return { side, align: align ?? 'center' };
}

function coordinatesFor(
  anchor: DOMRect,
  panel: DOMRect,
  side: PopoverSide,
  align: PopoverAlign,
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

/**
 * A non-modal, viewport-aware popover for compact controls and supporting
 * information. It anchors to one trigger, dismisses on outside interaction or
 * Escape, and flips away from viewport edges before clamping as a last resort.
 */
export const Popover = forwardRef<HTMLSpanElement, PopoverProps>(function Popover(
  {
    trigger,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottom-start',
    size = 'md',
    offset = 8,
    panelLabel = 'Popover',
    autoFocus = false,
    panelClassName,
    className,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLSpanElement);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const isOpen = open ?? uncontrolledOpen;
  const panelId = `fk-popover-${generatedId}`;
  const classes = ['fk-popover', className].filter(Boolean).join(' ');

  const setPopoverOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open]
  );

  const focusTrigger = useCallback(() => {
    anchorRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, []);

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
      (side === 'top' && next.y < VIEWPORT_INSET) ||
      (side === 'bottom' && next.y + panelBounds.height > window.innerHeight - VIEWPORT_INSET) ||
      (side === 'left' && next.x < VIEWPORT_INSET) ||
      (side === 'right' && next.x + panelBounds.width > window.innerWidth - VIEWPORT_INSET)
    ) {
      side = oppositeSide(side);
      next = coordinatesFor(anchorBounds, panelBounds, side, align, offset);
    }

    const maxX = Math.max(VIEWPORT_INSET, window.innerWidth - panelBounds.width - VIEWPORT_INSET);
    const maxY = Math.max(VIEWPORT_INSET, window.innerHeight - panelBounds.height - VIEWPORT_INSET);
    setPosition({
      x: Math.round(clamp(next.x, VIEWPORT_INSET, maxX)),
      y: Math.round(clamp(next.y, VIEWPORT_INSET, maxY)),
      side,
    });
  }, [offset, placement]);

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setPopoverOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      event.preventDefault();
      setPopoverOpen(false);
      window.requestAnimationFrame(focusTrigger);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusTrigger, isOpen, setPopoverOpen]);

  useEffect(() => {
    if (!isOpen || !autoFocus) return undefined;
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [autoFocus, isOpen]);

  const triggerProps = trigger.props as {
    onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  };
  const triggerElement = cloneElement(trigger, {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? panelId : undefined,
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) setPopoverOpen(!isOpen);
    },
  } as Record<string, unknown>);
  const panelStyle = {
    left: position?.x ?? 0,
    top: position?.y ?? 0,
    visibility: position ? 'visible' : 'hidden',
  } as CSSProperties;

  return (
    <span ref={rootRef} {...props} className={classes}>
      <span className="fk-popover__anchor" ref={anchorRef}>
        {triggerElement}
      </span>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={panelRef}
            className={['fk-popover__surface', `fk-popover__surface--${size}`, panelClassName]
              .filter(Boolean)
              .join(' ')}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label={panelLabel}
            data-side={position?.side ?? parsePlacement(placement).side}
            data-positioned={position ? 'true' : undefined}
            style={panelStyle}
          >
            {children}
          </div>
        </FloatingPortal>
      )}
    </span>
  );
});
