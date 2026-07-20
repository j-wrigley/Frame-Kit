import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { DragHandleDots2Icon } from '../../icons/icons';

export type SidebarVariant = 'panel' | 'docked' | 'floating';
export type SidebarSide = 'left' | 'right';
export type SidebarDensity = 'default' | 'compact';
export type SidebarBounds = 'parent' | 'viewport';

export interface SidebarPosition {
  x: number;
  y: number;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /**
   * Quiet category shown above the title. When a description is also supplied,
   * the header favours title and description to preserve a two-level hierarchy.
   */
  eyebrow?: ReactNode;
  /** Primary sidebar name. */
  title: ReactNode;
  /** Optional supporting context below the title. Prefer this over an eyebrow when both repeat context. */
  description?: ReactNode;
  /** Header actions aligned opposite the title. */
  actions?: ReactNode;
  /** Sidebar sections or application-owned content. */
  children?: ReactNode;
  /** Optional persistent action area below the scrolling body. */
  footer?: ReactNode;
  /** Surface relationship to the surrounding workspace. @default 'panel' */
  variant?: SidebarVariant;
  /** Attached edge for a docked sidebar. @default 'left' */
  side?: SidebarSide;
  /** Internal spacing density. @default 'default' */
  density?: SidebarDensity;
  /** Sidebar width. @default 288 */
  width?: CSSProperties['width'];
  /** Enables the drag handle for a floating sidebar. @default false */
  draggable?: boolean;
  /** Controlled floating position in pixels. */
  position?: SidebarPosition;
  /** Initial floating position when uncontrolled. @default { x: 16, y: 16 } */
  defaultPosition?: SidebarPosition;
  /** Called whenever pointer or keyboard movement changes the position. */
  onPositionChange?: (position: SidebarPosition) => void;
  /** Boundary used to constrain floating movement. @default 'parent' */
  bounds?: SidebarBounds;
  /** Minimum distance retained from the selected boundary. @default 8 */
  boundaryPadding?: number;
  /** Accessible name for the icon-only drag handle. @default 'Move sidebar' */
  dragLabel?: string;
}

export interface SidebarSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Optional Office Code Pro section label. */
  label?: ReactNode;
  /** Optional compact action aligned with the label. */
  actions?: ReactNode;
  children?: ReactNode;
}

interface DragState {
  startX: number;
  startY: number;
  origin: SidebarPosition;
}

const DEFAULT_POSITION: SidebarPosition = { x: 16, y: 16 };

function finitePosition(position: SidebarPosition | undefined): SidebarPosition {
  return {
    x: Number.isFinite(position?.x) ? Number(position?.x) : DEFAULT_POSITION.x,
    y: Number.isFinite(position?.y) ? Number(position?.y) : DEFAULT_POSITION.y,
  };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function positionsMatch(a: SidebarPosition, b: SidebarPosition) {
  return Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;
}

/** A token-driven inspector shell with panel, docked, and optionally draggable
 *  floating treatments. Floating sidebars can be moved by pointer or keyboard
 *  and remain constrained to their parent or the viewport. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    eyebrow,
    title,
    description,
    actions,
    children,
    footer,
    variant = 'panel',
    side = 'left',
    density = 'default',
    width = 288,
    draggable = false,
    position,
    defaultPosition = DEFAULT_POSITION,
    onPositionChange,
    bounds = 'parent',
    boundaryPadding = 8,
    dragLabel = 'Move sidebar',
    className,
    style,
    'aria-label': ariaLabel,
    ...props
  },
  forwardedRef
) {
  const rootRef = useRef<HTMLElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const removeDragListenersRef = useRef<(() => void) | null>(null);
  const [internalPosition, setInternalPosition] = useState(() => finitePosition(defaultPosition));
  const [isDragging, setIsDragging] = useState(false);
  const isControlled = position !== undefined;
  const currentPosition = finitePosition(position ?? internalPosition);
  const currentPositionRef = useRef(currentPosition);
  const isControlledRef = useRef(isControlled);
  const onPositionChangeRef = useRef(onPositionChange);
  const instructionId = useId();
  const canDrag = variant === 'floating' && draggable;

  currentPositionRef.current = currentPosition;
  isControlledRef.current = isControlled;
  onPositionChangeRef.current = onPositionChange;

  const setRootRef = (node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) {
      (forwardedRef as MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  const clampPosition = useCallback(
    (next: SidebarPosition): SidebarPosition => {
      const root = rootRef.current;
      if (!root || variant !== 'floating') return finitePosition(next);

      const inset = Math.max(0, Number.isFinite(boundaryPadding) ? boundaryPadding : 0);
      const rootBounds = root.getBoundingClientRect();
      let availableWidth = window.innerWidth;
      let availableHeight = window.innerHeight;

      if (bounds === 'parent') {
        const boundary = root.offsetParent as HTMLElement | null;
        if (boundary) {
          availableWidth = boundary.clientWidth;
          availableHeight = boundary.clientHeight;
        }
      }

      return {
        x: clamp(next.x, inset, availableWidth - rootBounds.width - inset),
        y: clamp(next.y, inset, availableHeight - rootBounds.height - inset),
      };
    },
    [boundaryPadding, bounds, variant]
  );

  const commitPosition = useCallback(
    (next: SidebarPosition) => {
      const constrained = clampPosition(finitePosition(next));
      if (positionsMatch(currentPositionRef.current, constrained)) return;

      currentPositionRef.current = constrained;
      if (!isControlledRef.current) setInternalPosition(constrained);
      onPositionChangeRef.current?.(constrained);
    },
    [clampPosition]
  );

  useEffect(() => {
    if (variant !== 'floating') return undefined;

    const keepInsideBounds = () => commitPosition(currentPositionRef.current);
    keepInsideBounds();
    window.addEventListener('resize', keepInsideBounds);

    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', keepInsideBounds);
    }

    const observer = new ResizeObserver(keepInsideBounds);
    if (rootRef.current) observer.observe(rootRef.current);
    const boundary = rootRef.current?.offsetParent;
    if (bounds === 'parent' && boundary instanceof Element) observer.observe(boundary);

    return () => {
      window.removeEventListener('resize', keepInsideBounds);
      observer.disconnect();
    };
  }, [bounds, commitPosition, variant]);

  const finishDrag = useCallback(() => {
    removeDragListenersRef.current?.();
    removeDragListenersRef.current = null;
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(
    () => () => {
      removeDragListenersRef.current?.();
    },
    []
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    finishDrag();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...currentPositionRef.current },
    };

    const handleWindowPointerMove = (pointerEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (pointerEvent.pointerType === 'mouse' && pointerEvent.buttons === 0) {
        finishDrag();
        return;
      }
      pointerEvent.preventDefault();
      commitPosition({
        x: drag.origin.x + pointerEvent.clientX - drag.startX,
        y: drag.origin.y + pointerEvent.clientY - drag.startY,
      });
    };
    const handleWindowPointerEnd = () => finishDrag();
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);
    removeDragListenersRef.current = () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
    };
    setIsDragging(true);
  };

  const handleDragKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && dragRef.current) {
      event.preventDefault();
      commitPosition(dragRef.current.origin);
      finishDrag();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      commitPosition(finitePosition(defaultPosition));
      return;
    }

    const amount = event.shiftKey ? 10 : 1;
    let deltaX = 0;
    let deltaY = 0;
    if (event.key === 'ArrowLeft') deltaX = -amount;
    if (event.key === 'ArrowRight') deltaX = amount;
    if (event.key === 'ArrowUp') deltaY = -amount;
    if (event.key === 'ArrowDown') deltaY = amount;
    if (!deltaX && !deltaY) return;

    event.preventDefault();
    commitPosition({
      x: currentPositionRef.current.x + deltaX,
      y: currentPositionRef.current.y + deltaY,
    });
  };

  const classes = [
    'fk-sidebar',
    `fk-sidebar--${variant}`,
    `fk-sidebar--${side}`,
    `fk-sidebar--${density}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const rootStyle = {
    ...style,
    '--fk-sidebar-width': typeof width === 'number' ? `${width}px` : width,
    '--fk-sidebar-x': `${currentPosition.x}px`,
    '--fk-sidebar-y': `${currentPosition.y}px`,
  } as CSSProperties;
  const accessibleName = ariaLabel ?? (typeof title === 'string' ? title : undefined);
  const headerEyebrow = description == null ? eyebrow : null;

  return (
    <aside
      ref={setRootRef}
      {...props}
      className={classes}
      style={rootStyle}
      aria-label={accessibleName}
      data-variant={variant}
      data-side={side}
      data-density={density}
      data-draggable={canDrag || undefined}
      data-dragging={isDragging || undefined}
      data-bounds={variant === 'floating' ? bounds : undefined}
      data-x={variant === 'floating' ? Math.round(currentPosition.x) : undefined}
      data-y={variant === 'floating' ? Math.round(currentPosition.y) : undefined}
    >
      <header className="fk-sidebar__header">
        {canDrag && (
          <button
            type="button"
            className="fk-sidebar__drag-handle"
            aria-label={dragLabel}
            aria-describedby={instructionId}
            onPointerDown={handlePointerDown}
            onKeyDown={handleDragKeyDown}
          >
            <DragHandleDots2Icon size={14} aria-hidden="true" />
          </button>
        )}
        <div className="fk-sidebar__identity">
          {headerEyebrow != null && <span className="fk-sidebar__eyebrow">{headerEyebrow}</span>}
          <strong className="fk-sidebar__title">{title}</strong>
          {description != null && <span className="fk-sidebar__description">{description}</span>}
        </div>
        {actions != null && <div className="fk-sidebar__actions">{actions}</div>}
      </header>
      <div className="fk-sidebar__body">{children}</div>
      {footer != null && <footer className="fk-sidebar__footer">{footer}</footer>}
      {canDrag && (
        <span id={instructionId} className="fk-sidebar__drag-instructions">
          Drag with a pointer. Use arrow keys for one pixel steps, Shift and arrow keys for ten
          pixel steps, or Home to restore the starting position.
        </span>
      )}
    </aside>
  );
});

/** A full-width content group whose divider, label, and spacing follow the
 *  containing Sidebar density. */
export const SidebarSection = forwardRef<HTMLElement, SidebarSectionProps>(function SidebarSection(
  { label, actions, children, className, ...props },
  ref
) {
  const classes = ['fk-sidebar__section', className].filter(Boolean).join(' ');
  return (
    <section ref={ref} {...props} className={classes}>
      {(label != null || actions != null) && (
        <header className="fk-sidebar__section-header">
          {label != null && <span className="fk-tag">{label}</span>}
          {actions != null && <div className="fk-sidebar__section-actions">{actions}</div>}
        </header>
      )}
      <div className="fk-sidebar__section-content">{children}</div>
    </section>
  );
});
