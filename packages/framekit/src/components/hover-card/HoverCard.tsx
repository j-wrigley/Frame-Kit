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
  type FocusEvent,
  type ForwardedRef,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { FloatingPortal } from '../floating-overlay';

export type OverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayPlacement =
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

export type HoverCardSize = 'sm' | 'md' | 'lg';

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'content'
> {
  /** One focusable element that receives the concise helper text. */
  children: ReactElement;
  /** Short, non-essential supporting text. */
  content: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the tooltip requests a state change. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement. The tooltip flips and clamps at viewport edges. @default 'top' */
  placement?: OverlayPlacement;
  /** Gap between trigger and tooltip in pixels. @default 6 */
  offset?: number;
  /** Delay before pointer hover opens the tooltip in milliseconds. @default 400 */
  delayDuration?: number;
  /** Delay before a pointer departure closes the tooltip in milliseconds. @default 80 */
  closeDelay?: number;
}

export interface HoverCardProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'content'
> {
  /** One focusable element that opens and anchors the preview. */
  trigger: ReactElement;
  /** Supporting, non-essential preview content. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the hover card requests a state change. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement. The card flips and clamps at viewport edges. @default 'bottom-start' */
  placement?: OverlayPlacement;
  /** Surface width. @default 'md' */
  size?: HoverCardSize;
  /** Gap between trigger and card in pixels. @default 8 */
  offset?: number;
  /** Accessible label for the preview panel. @default 'Preview' */
  panelLabel?: string;
  /** Delay before pointer hover opens the card in milliseconds. @default 300 */
  openDelay?: number;
  /** Delay before pointer departure closes the card in milliseconds. @default 150 */
  closeDelay?: number;
}

interface OverlayPosition {
  x: number;
  y: number;
  side: OverlaySide;
}

interface FloatingOverlayProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'content'
> {
  trigger: ReactElement;
  content: ReactNode;
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  placement: OverlayPlacement;
  offset: number;
  openDelay: number;
  closeDelay: number;
  rootClassName: string;
  surfaceClassName: string;
  panelLabel?: string;
  role: 'dialog' | 'tooltip';
  interactive: boolean;
  forwardedRef: ForwardedRef<HTMLSpanElement>;
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

function oppositeSide(side: OverlaySide): OverlaySide {
  if (side === 'top') return 'bottom';
  if (side === 'bottom') return 'top';
  if (side === 'left') return 'right';
  return 'left';
}

function parsePlacement(placement: OverlayPlacement): {
  side: OverlaySide;
  align: OverlayAlign;
} {
  const [side, align] = placement.split('-') as [OverlaySide, OverlayAlign | undefined];
  return { side, align: align ?? 'center' };
}

function coordinatesFor(
  anchor: DOMRect,
  panel: DOMRect,
  side: OverlaySide,
  align: OverlayAlign,
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

function FloatingOverlay({
  trigger,
  content,
  open,
  defaultOpen,
  onOpenChange,
  placement,
  offset,
  openDelay,
  closeDelay,
  rootClassName,
  surfaceClassName,
  panelLabel,
  role,
  interactive,
  forwardedRef,
  ...props
}: FloatingOverlayProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<OverlayPosition | null>(null);
  const isOpen = open ?? uncontrolledOpen;
  const panelId = `fk-overlay-${generatedId}`;

  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLSpanElement);

  const clearTimers = useCallback(() => {
    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);
  }, []);

  const setOverlayOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open]
  );

  const scheduleOpen = useCallback(
    (delay = openDelay) => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(openTimerRef.current);
      if (isOpen) return;
      openTimerRef.current = setTimeout(() => setOverlayOpen(true), delay);
    },
    [isOpen, openDelay, setOverlayOpen]
  );

  const scheduleClose = useCallback(
    (delay = closeDelay) => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
      if (!isOpen) return;
      closeTimerRef.current = setTimeout(() => setOverlayOpen(false), delay);
    },
    [closeDelay, isOpen, setOverlayOpen]
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
    return () => clearTimers();
  }, [clearTimers]);

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      event.preventDefault();
      clearTimers();
      setOverlayOpen(false);
      window.requestAnimationFrame(focusTrigger);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!interactive) return;
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      clearTimers();
      setOverlayOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [clearTimers, focusTrigger, interactive, isOpen, setOverlayOpen]);

  const containsRelatedTarget = (target: EventTarget | null) => {
    if (!(target instanceof Node)) return false;
    return Boolean(rootRef.current?.contains(target) || panelRef.current?.contains(target));
  };

  const triggerProps = trigger.props as {
    onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
    'aria-describedby'?: string;
  };
  const triggerElement = cloneElement(trigger, {
    ...(role === 'tooltip'
      ? {
          'aria-describedby': isOpen
            ? [triggerProps['aria-describedby'], panelId].filter(Boolean).join(' ')
            : triggerProps['aria-describedby'],
        }
      : {
          'aria-haspopup': 'dialog',
          'aria-expanded': isOpen,
          'aria-controls': isOpen ? panelId : undefined,
        }),
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
      triggerProps.onPointerEnter?.(event);
      if (!event.defaultPrevented) scheduleOpen();
    },
    onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
      triggerProps.onPointerLeave?.(event);
      if (!event.defaultPrevented) scheduleClose();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      triggerProps.onFocus?.(event);
      if (!event.defaultPrevented) scheduleOpen(0);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      triggerProps.onBlur?.(event);
      if (!event.defaultPrevented && !containsRelatedTarget(event.relatedTarget)) scheduleClose();
    },
  } as Record<string, unknown>);
  const panelStyle = {
    left: position?.x ?? 0,
    top: position?.y ?? 0,
    visibility: position ? 'visible' : 'hidden',
  } as CSSProperties;

  return (
    <span ref={rootRef} {...props} className={rootClassName}>
      <span className="fk-floating-overlay__anchor" ref={anchorRef}>
        {triggerElement}
      </span>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={panelRef}
            className={surfaceClassName}
            id={panelId}
            role={role}
            aria-label={role === 'dialog' ? panelLabel : undefined}
            data-side={position?.side ?? parsePlacement(placement).side}
            data-positioned={position ? 'true' : undefined}
            style={panelStyle}
            onPointerEnter={interactive ? () => clearTimeout(closeTimerRef.current) : undefined}
            onPointerLeave={interactive ? () => scheduleClose() : undefined}
            onFocus={interactive ? () => scheduleOpen(0) : undefined}
            onBlur={
              interactive
                ? (event) => {
                    if (!containsRelatedTarget(event.relatedTarget)) scheduleClose();
                  }
                : undefined
            }
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </span>
  );
}

/** A concise label or helper phrase that appears on hover and keyboard focus. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    children,
    content,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = 'top',
    offset = 6,
    delayDuration = 400,
    closeDelay = 80,
    className,
    ...props
  },
  ref
) {
  const classes = ['fk-tooltip', className].filter(Boolean).join(' ');
  return (
    <FloatingOverlay
      {...props}
      trigger={children}
      content={content}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement}
      offset={offset}
      openDelay={delayDuration}
      closeDelay={closeDelay}
      rootClassName={classes}
      surfaceClassName="fk-tooltip__surface"
      role="tooltip"
      interactive={false}
      forwardedRef={ref}
    />
  );
});

/** A richer, non-essential preview that remains available while it is explored. */
export const HoverCard = forwardRef<HTMLSpanElement, HoverCardProps>(function HoverCard(
  {
    trigger,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = 'bottom-start',
    size = 'md',
    offset = 8,
    panelLabel = 'Preview',
    openDelay = 300,
    closeDelay = 150,
    className,
    ...props
  },
  ref
) {
  const classes = ['fk-hover-card', className].filter(Boolean).join(' ');
  return (
    <FloatingOverlay
      {...props}
      trigger={trigger}
      content={children}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement}
      offset={offset}
      openDelay={openDelay}
      closeDelay={closeDelay}
      rootClassName={classes}
      surfaceClassName={`fk-hover-card__surface fk-hover-card__surface--${size}`}
      panelLabel={panelLabel}
      role="dialog"
      interactive
      forwardedRef={ref}
    />
  );
});
