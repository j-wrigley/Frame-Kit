import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { FloatingPortal, useAnchoredOverlay } from '../floating-overlay';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarVariant = 'solid' | 'ghost';
export type ToolbarSize = 'compact' | 'large';

export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Arrangement and arrow-key direction. @default 'horizontal' */
  orientation?: ToolbarOrientation;
  /** Container treatment. @default 'solid' */
  variant?: ToolbarVariant;
  /** Control density. Large promotes enclosed buttons to 34px targets. @default 'compact' */
  size?: ToolbarSize;
}

/** A grouping surface for tool buttons. Use aria-pressed on mutually
 *  exclusive controls; arrow keys move between enabled controls, while Home
 *  and End jump to the first and last control. */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  {
    orientation = 'horizontal',
    variant = 'solid',
    size = 'compact',
    className,
    onKeyDown,
    ...props
  },
  ref
) {
  const classes = [
    'fk-toolbar',
    `fk-toolbar--${orientation}`,
    `fk-toolbar--${variant}`,
    `fk-toolbar--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const onToolbarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const isNavigationKey =
      event.key === nextKey ||
      event.key === previousKey ||
      event.key === 'Home' ||
      event.key === 'End';

    if (!isNavigationKey) return;

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('button, [role="button"]')
    ).filter((item) => !item.matches(':disabled, [aria-disabled="true"]') && !item.hidden);
    const currentIndex = items.findIndex((item) => item === event.target);

    if (currentIndex < 0 || items.length === 0) return;

    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    else if (event.key === nextKey) nextIndex = (currentIndex + 1) % items.length;
    else nextIndex = (currentIndex - 1 + items.length) % items.length;

    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      role="toolbar"
      aria-orientation={orientation}
      onKeyDown={onToolbarKeyDown}
    />
  );
});

export interface ToolbarSeparatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'role'> {
  /** Direction of the visible rule. @default 'vertical' */
  orientation?: ToolbarOrientation;
}

/** A visual and semantic separator between related toolbar controls. */
export const ToolbarSeparator = forwardRef<HTMLSpanElement, ToolbarSeparatorProps>(
  function ToolbarSeparator({ orientation = 'vertical', className, ...props }, ref) {
    const classes = ['fk-toolbar__separator', `fk-toolbar__separator--${orientation}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <span
        ref={ref}
        {...props}
        className={classes}
        role="separator"
        aria-orientation={orientation}
      />
    );
  }
);

export type ToolbarFlyoutPlacement = 'right' | 'bottom';

export interface ToolbarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The button that reveals the related controls. */
  trigger: ReactElement;
  /** Controls revealed from the grouped tool. */
  children: ReactNode;
  /** Direction in which the flyout opens. @default 'right' */
  placement?: ToolbarFlyoutPlacement;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called whenever the flyout requests a state change. */
  onOpenChange?: (open: boolean) => void;
  /** Pointer hold duration before the flyout opens. @default 400 */
  holdDelay?: number;
}

/** A grouped tool with a compact flyout for related modes. Click to toggle the
 *  flyout, or press and hold to reveal it. Enter/Space toggle; Alt+ArrowDown
 *  opens and moves focus into the first enabled flyout control. */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
  {
    trigger,
    children,
    placement = 'right',
    open,
    defaultOpen = false,
    onOpenChange,
    holdDelay = 400,
    className,
    role,
    ...props
  },
  forwardedRef
) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const groupRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openedByHold = useRef(false);
  const flyoutId = useId();
  const isLarge = groupRef.current?.closest('.fk-toolbar')?.classList.contains('fk-toolbar--large');
  const floatingFlyout = useAnchoredOverlay({
    open: isOpen,
    anchorRef: groupRef,
    panelRef: flyoutRef,
    placement: placement === 'right' ? 'right-start' : 'bottom-start',
    offset: isLarge ? 4 : 2,
  });

  const setGroupRef = (node: HTMLDivElement | null) => {
    groupRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) {
      (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const clearHoldTimer = () => {
    if (holdTimer.current !== undefined) {
      clearTimeout(holdTimer.current);
      holdTimer.current = undefined;
    }
  };

  useEffect(() => clearHoldTimer, []);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!groupRef.current?.contains(target) && !flyoutRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        groupRef.current?.querySelector<HTMLElement>('[data-toolbar-trigger]')?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const focusFirstFlyoutControl = () => {
    requestAnimationFrame(() => {
      flyoutRef.current
        ?.querySelector<HTMLElement>(
          'button:not(:disabled), [role="button"]:not([aria-disabled="true"])'
        )
        ?.focus();
    });
  };

  const triggerProps = trigger.props as {
    onPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel?: (event: ReactPointerEvent<HTMLElement>) => void;
    onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    triggerProps.onPointerDown?.(event);
    if (event.defaultPrevented || event.button !== 0) return;

    openedByHold.current = false;
    clearHoldTimer();
    holdTimer.current = setTimeout(() => {
      openedByHold.current = true;
      setOpen(true);
    }, holdDelay);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLElement>) => {
    triggerProps.onPointerUp?.(event);
    clearHoldTimer();
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLElement>) => {
    triggerProps.onPointerCancel?.(event);
    clearHoldTimer();
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    triggerProps.onPointerLeave?.(event);
    clearHoldTimer();
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (openedByHold.current) {
      openedByHold.current = false;
      event.preventDefault();
      return;
    }

    triggerProps.onClick?.(event);
    if (!event.defaultPrevented) setOpen(!isOpen);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    triggerProps.onKeyDown?.(event);
    if (event.defaultPrevented || !(event.altKey && event.key === 'ArrowDown')) return;

    event.preventDefault();
    setOpen(true);
    focusFirstFlyoutControl();
  };

  const classes = ['fk-toolbar__group', `fk-toolbar__group--${placement}`, className]
    .filter(Boolean)
    .join(' ');

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, {
        'data-toolbar-trigger': '',
        'aria-expanded': isOpen,
        'aria-controls': flyoutId,
        'aria-haspopup': true,
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerEnd,
        onPointerCancel: handlePointerCancel,
        onPointerLeave: handlePointerLeave,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
      } as Record<string, unknown>)
    : trigger;

  return (
    <div
      ref={setGroupRef}
      {...props}
      className={classes}
      role={role ?? 'group'}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {triggerElement}
      {isOpen && (
        <FloatingPortal>
          <div
            ref={flyoutRef}
            id={flyoutId}
            className={['fk-toolbar__flyout', isLarge && 'fk-toolbar__flyout--large']
              .filter(Boolean)
              .join(' ')}
            data-toolbar-flyout
            data-side={floatingFlyout.side}
            data-positioned={floatingFlyout.positioned || undefined}
            role="group"
            style={floatingFlyout.style}
          >
            {children}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
});
