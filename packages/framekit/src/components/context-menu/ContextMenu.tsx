import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ChevronRightIcon } from '../../icons/icons';
import { FloatingPortal } from '../floating-overlay';

export type ContextMenuTone = 'default' | 'danger';

export interface ContextMenuAction {
  /** Stable, unique item identifier. */
  id: string;
  /** Visible and accessible action name. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Quiet keyboard shortcut or trailing hint. */
  shortcut?: ReactNode;
  /** Default or destructive intent. @default 'default' */
  tone?: ContextMenuTone;
  /** Makes this action unavailable to pointer and keyboard interaction. */
  disabled?: boolean;
  /** Invoked when the action is chosen. */
  onSelect?: () => void;
}

export interface ContextMenuSeparator {
  /** Discriminant for a visual and semantic separator. */
  type: 'separator';
  /** Stable, unique separator identifier. */
  id: string;
}

export interface ContextMenuSubmenu {
  /** Discriminant for a one-level nested action menu. */
  type: 'submenu';
  /** Stable, unique submenu identifier. */
  id: string;
  /** Visible and accessible submenu name. */
  label: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Makes the submenu unavailable to pointer and keyboard interaction. */
  disabled?: boolean;
  /** A short, shallow list of actions and separators. */
  items: readonly ContextMenuSubmenuItem[];
}

export type ContextMenuSubmenuItem = ContextMenuAction | ContextMenuSeparator;
export type ContextMenuItem = ContextMenuAction | ContextMenuSeparator | ContextMenuSubmenu;

export interface ContextMenuProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onContextMenu'
> {
  /** Focusable target that receives right-click and keyboard context-menu events. */
  children: ReactElement;
  /** Actions, separators, and one-level submenus. */
  items: readonly ContextMenuItem[];
  /** Accessible menu name. @default 'Context menu' */
  label?: string;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

interface MenuPosition {
  x: number;
  y: number;
}

function isSeparator(item: ContextMenuItem | ContextMenuSubmenuItem): item is ContextMenuSeparator {
  return 'type' in item && item.type === 'separator';
}

function isSubmenu(item: ContextMenuItem): item is ContextMenuSubmenu {
  return 'type' in item && item.type === 'submenu';
}

function focusFirstMenuItem(menu: HTMLElement | null) {
  menu
    ?.querySelector<HTMLButtonElement>(':scope > [data-context-menu-item] button:not(:disabled)')
    ?.focus();
}

/** A custom right-click menu for canvas, layer, and list targets. It keeps
 * mouse and keyboard entry points aligned and supports grouped, destructive,
 * disabled, and one-level nested actions. */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { children, items, label = 'Context menu', onOpenChange, className, ...props },
  ref
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const isOpen = position != null;
  const classes = ['fk-context-menu', className].filter(Boolean).join(' ');

  const closeMenu = (returnFocus = false) => {
    setPosition(null);
    setOpenSubmenuId(null);
    onOpenChange?.(false);
    if (returnFocus) returnFocusRef.current?.focus();
  };

  const openMenu = (nextPosition: MenuPosition, target: HTMLElement) => {
    if (items.length === 0) return;
    returnFocusRef.current = target;
    setOpenSubmenuId(null);
    setPosition(nextPosition);
    onOpenChange?.(true);
  };

  useEffect(() => {
    if (!position) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    window.requestAnimationFrame(() => focusFirstMenuItem(menuRef.current));
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [position]);

  useEffect(() => {
    if (!position || !menuRef.current) return undefined;
    const frame = window.requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (!menu) return;
      const bounds = menu.getBoundingClientRect();
      const inset = 8;
      const x = Math.max(inset, Math.min(position.x, window.innerWidth - bounds.width - inset));
      const y = Math.max(inset, Math.min(position.y, window.innerHeight - bounds.height - inset));
      if (x !== position.x || y !== position.y) setPosition({ x, y });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [position]);

  const selectAction = (action: ContextMenuAction) => {
    if (action.disabled) return;
    action.onSelect?.();
    closeMenu(true);
  };

  const focusSubmenu = (id: string) => {
    setOpenSubmenuId(id);
    window.requestAnimationFrame(() => {
      const submenu = menuRef.current?.querySelector<HTMLElement>(
        `[data-context-menu-submenu-panel="${id}"]`
      );
      focusFirstMenuItem(submenu ?? null);
    });
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    const target = event.target instanceof HTMLElement ? event.target : null;
    const currentItem = target?.closest<HTMLElement>('[data-context-menu-item]');
    const currentMenu = target?.closest<HTMLElement>('[data-context-menu-list]');
    if (!currentItem || !currentMenu) return;

    const menuItems = Array.from(
      currentMenu.querySelectorAll<HTMLElement>(':scope > [data-context-menu-item]')
    ).filter((item) => !item.querySelector('button')?.disabled);
    const currentIndex = menuItems.indexOf(currentItem);
    if (currentIndex < 0 || menuItems.length === 0) return;

    const focusAt = (index: number) => {
      const item = menuItems[index];
      item?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    };

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusAt((currentIndex + 1) % menuItems.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusAt((currentIndex - 1 + menuItems.length) % menuItems.length);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusAt(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusAt(menuItems.length - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      const submenuId = currentItem.dataset.contextMenuSubmenu;
      if (!submenuId) return;
      event.preventDefault();
      focusSubmenu(submenuId);
      return;
    }

    if (event.key === 'ArrowLeft') {
      const parentSubmenu = currentMenu.dataset.contextMenuSubmenuPanel;
      if (!parentSubmenu) return;
      event.preventDefault();
      setOpenSubmenuId(null);
      menuRef.current
        ?.querySelector<HTMLButtonElement>(`[data-context-menu-submenu-trigger="${parentSubmenu}"]`)
        ?.focus();
    }
  };

  const triggerProps = children.props as {
    onContextMenu?: (event: ReactMouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  };

  const handleContextMenu = (event: ReactMouseEvent<HTMLElement>) => {
    triggerProps.onContextMenu?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    openMenu({ x: event.clientX, y: event.clientY }, event.currentTarget);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    triggerProps.onKeyDown?.(event);
    const isContextMenuKey = event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
    if (event.defaultPrevented || !isContextMenuKey) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    openMenu(
      {
        x: bounds.left + Math.min(bounds.width / 2, 40),
        y: bounds.top + Math.min(bounds.height / 2, 28),
      },
      event.currentTarget
    );
  };

  const renderAction = (action: ContextMenuAction) => (
    <button
      className={[
        'fk-context-menu__item',
        action.tone === 'danger' && 'fk-context-menu__item--danger',
      ]
        .filter(Boolean)
        .join(' ')}
      type="button"
      role="menuitem"
      disabled={action.disabled}
      onClick={() => selectAction(action)}
    >
      {action.icon != null && (
        <span className="fk-context-menu__icon" aria-hidden="true">
          {action.icon}
        </span>
      )}
      <span className="fk-context-menu__item-label">{action.label}</span>
      {action.shortcut != null && (
        <span className="fk-context-menu__shortcut">{action.shortcut}</span>
      )}
    </button>
  );

  const renderSubmenuItems = (submenu: ContextMenuSubmenu) =>
    submenu.items.map((item) => {
      if (isSeparator(item)) {
        return <span className="fk-context-menu__separator" key={item.id} role="separator" />;
      }
      return (
        <span className="fk-context-menu__item-wrap" data-context-menu-item key={item.id}>
          {renderAction(item)}
        </span>
      );
    });

  const renderItems = () =>
    items.map((item) => {
      if (isSeparator(item)) {
        return <span className="fk-context-menu__separator" key={item.id} role="separator" />;
      }

      if (isSubmenu(item)) {
        const submenuOpen = openSubmenuId === item.id;
        return (
          <span
            className="fk-context-menu__submenu"
            data-context-menu-item
            data-context-menu-submenu={item.id}
            key={item.id}
            onPointerEnter={() => {
              if (!item.disabled) setOpenSubmenuId(item.id);
            }}
          >
            <button
              className="fk-context-menu__item fk-context-menu__item--submenu"
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={submenuOpen}
              disabled={item.disabled}
              data-context-menu-submenu-trigger={item.id}
              onClick={() => setOpenSubmenuId(submenuOpen ? null : item.id)}
            >
              {item.icon != null && (
                <span className="fk-context-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="fk-context-menu__item-label">{item.label}</span>
              <ChevronRightIcon className="fk-context-menu__submenu-chevron" aria-hidden="true" />
            </button>
            {submenuOpen && (
              <div
                className="fk-context-menu__submenu-panel"
                data-context-menu-list
                data-context-menu-submenu-panel={item.id}
                role="menu"
                aria-label={`${label}: ${typeof item.label === 'string' ? item.label : 'submenu'}`}
                onKeyDown={handleMenuKeyDown}
              >
                {renderSubmenuItems(item)}
              </div>
            )}
          </span>
        );
      }

      return (
        <span className="fk-context-menu__item-wrap" data-context-menu-item key={item.id}>
          {renderAction(item)}
        </span>
      );
    });

  const triggerElement = isValidElement(children)
    ? cloneElement(children, {
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        onContextMenu: handleContextMenu,
        onKeyDown: handleTriggerKeyDown,
      } as Record<string, unknown>)
    : children;

  return (
    <div ref={rootRef} {...props} className={classes}>
      {triggerElement}
      {position && (
        <FloatingPortal>
          <div
            ref={menuRef}
            className="fk-context-menu__surface"
            data-context-menu-list
            role="menu"
            aria-label={label}
            style={{ left: position.x, top: position.y }}
            onKeyDown={handleMenuKeyDown}
          >
            {renderItems()}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
});
