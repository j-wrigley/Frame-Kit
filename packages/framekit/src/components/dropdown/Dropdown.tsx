import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ChevronDownIcon } from '../../icons/icons';
import { FloatingPortal, useAnchoredOverlay } from '../floating-overlay';

export type DropdownSize = 'sm' | 'md';
export type DropdownAlign = 'start' | 'end';

export interface DropdownOption {
  /** Stable, unique value reported by `onValueChange`. */
  value: string;
  /** Visible and accessible option label. */
  label: ReactNode;
  /** Quiet supporting detail rendered inside the option. */
  description?: ReactNode;
  /** Makes this option unavailable to pointer and keyboard selection. */
  disabled?: boolean;
}

export interface DropdownProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'role'
> {
  /** Available single-select options. Use stable, unique values. */
  options: readonly DropdownOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Called when an enabled option is chosen. */
  onValueChange?: (value: string) => void;
  /** Text shown when no option is selected. @default 'Select option' */
  placeholder?: ReactNode;
  /** Accessible trigger name when its visible value is not enough. */
  label?: string;
  /** Trigger density. @default 'md' */
  size?: DropdownSize;
  /** Stretches the trigger and menu to the available width. */
  fullWidth?: boolean;
}

export interface NestedDropdownProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange'
> {
  /** Visible trigger name. */
  label: ReactNode;
  /** Quiet current-value summary beside the trigger label. */
  summary?: ReactNode;
  /** Controls displayed inside the anchored panel. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Panel edge that aligns to the trigger. @default 'start' */
  align?: DropdownAlign;
  /** Accessible name for the panel. @default 'Dropdown panel' */
  panelLabel?: string;
  /** Stretches the trigger to the available width. */
  fullWidth?: boolean;
}

export interface DisclosureProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange'
> {
  /** Visible disclosure name. */
  label: ReactNode;
  /** Quiet current-value summary at the end of the disclosure row. */
  summary?: ReactNode;
  /** Content revealed in the current layout flow. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the disclosure opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

function firstEnabledIndex(options: readonly DropdownOption[]) {
  return options.findIndex((option) => !option.disabled);
}

function findEnabledIndex(options: readonly DropdownOption[], start: number, direction: 1 | -1) {
  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (start + direction * offset + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return start;
}

/** A custom single-select list for compact tool settings. It retains a real
 * button, listbox, option semantics, outside-dismissal, and keyboard travel. */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = 'Select option',
    label,
    size = 'md',
    fullWidth = false,
    className,
    onKeyDown,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  const [uncontrolledValue, setUncontrolledValue] = useState(() => {
    const initial = options.find((option) => option.value === defaultValue && !option.disabled);
    return initial?.value;
  });
  const selectedValue = value ?? uncontrolledValue;
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedValue && !option.disabled
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);
  const menuId = `fk-dropdown-${generatedId}`;
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  // Menus render in a portal. When one is composed inside a Popover, it must
  // sit one layer above its parent surface rather than below it in the global
  // menu layer.
  const menuZIndex =
    open && rootRef.current?.closest('.fk-popover__surface')
      ? 'calc(var(--fk-z-popover, 1100) + 1)'
      : undefined;
  const floatingMenu = useAnchoredOverlay({
    open,
    anchorRef: rootRef,
    panelRef: menuRef,
    placement: 'bottom-start',
    offset: 4,
  });

  const classes = [
    'fk-dropdown',
    `fk-dropdown--${size}`,
    fullWidth && 'fk-dropdown--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const setMenuOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex(options));
  };

  const focusOption = (index: number) => {
    window.requestAnimationFrame(() => optionRefs.current[index]?.focus());
  };

  const closeMenu = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const select = (nextValue: string) => {
    const option = options.find((candidate) => candidate.value === nextValue);
    if (!option || option.disabled || option.value === selectedValue) return;
    if (value === undefined) setUncontrolledValue(option.value);
    onValueChange?.(option.value);
  };

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const nextIndex =
      event.key === 'ArrowDown'
        ? selectedIndex >= 0
          ? selectedIndex
          : firstEnabledIndex(options)
        : selectedIndex >= 0
          ? selectedIndex
          : options.length - 1 - firstEnabledIndex([...options].reverse());
    if (nextIndex < 0) return;
    setMenuOpen(true);
    focusOption(nextIndex);
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowDown') nextIndex = findEnabledIndex(options, index, 1);
    if (event.key === 'ArrowUp') nextIndex = findEnabledIndex(options, index, -1);
    if (event.key === 'Home') nextIndex = firstEnabledIndex(options);
    if (event.key === 'End')
      nextIndex = options.length - 1 - firstEnabledIndex([...options].reverse());

    if (nextIndex != null && nextIndex >= 0) {
      event.preventDefault();
      setActiveIndex(nextIndex);
      focusOption(nextIndex);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    }
  };

  const handleRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Escape' || !open) return;
    event.preventDefault();
    closeMenu(true);
  };

  return (
    <div ref={rootRef} {...props} className={classes} onKeyDown={handleRootKeyDown}>
      <button
        ref={triggerRef}
        className="fk-dropdown__trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setMenuOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="fk-dropdown__value">{selectedOption?.label ?? placeholder}</span>
        <ChevronDownIcon className="fk-dropdown__chevron" aria-hidden="true" />
      </button>
      {open && (
        <FloatingPortal>
          <div
            ref={menuRef}
            className="fk-dropdown__menu"
            id={menuId}
            role="listbox"
            aria-label={label}
            data-side={floatingMenu.side}
            data-positioned={floatingMenu.positioned || undefined}
            style={{ ...floatingMenu.style, width: floatingMenu.anchorWidth, zIndex: menuZIndex }}
          >
            {options.map((option, index) => {
              const selected = option.value === selectedValue && !option.disabled;
              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  className="fk-dropdown__option"
                  type="button"
                  id={`${menuId}-option-${index}`}
                  role="option"
                  aria-selected={selected}
                  disabled={option.disabled}
                  tabIndex={activeIndex === index ? 0 : -1}
                  onClick={() => {
                    select(option.value);
                    closeMenu(true);
                  }}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                >
                  <span className="fk-dropdown__option-label">{option.label}</span>
                  {option.description != null && (
                    <span className="fk-dropdown__option-description">{option.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
});

/** An anchored dropdown panel for a short, related group of controls. The
 * content stays composed from normal Frame Kit components, rather than being
 * forced into a menu-item abstraction. */
export const NestedDropdown = forwardRef<HTMLDivElement, NestedDropdownProps>(
  function NestedDropdown(
    {
      label,
      summary,
      children,
      open,
      defaultOpen = false,
      onOpenChange,
      align = 'start',
      panelLabel = 'Dropdown panel',
      fullWidth = false,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const isOpen = open ?? uncontrolledOpen;
    const panelId = `fk-nested-dropdown-${generatedId}`;
    const classes = [
      'fk-nested-dropdown',
      `fk-nested-dropdown--${align}`,
      fullWidth && 'fk-nested-dropdown--full',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const floatingPanel = useAnchoredOverlay({
      open: isOpen,
      anchorRef: rootRef,
      panelRef,
      placement: align === 'end' ? 'bottom-end' : 'bottom-start',
      offset: 4,
    });

    const setPanelOpen = (nextOpen: boolean) => {
      if (open === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    };

    useEffect(() => {
      if (!isOpen) return undefined;
      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
        setPanelOpen(false);
      };
      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [isOpen]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.key !== 'Escape' || !isOpen) return;
      event.preventDefault();
      setPanelOpen(false);
      triggerRef.current?.focus();
    };

    return (
      <div ref={rootRef} {...props} className={classes} onKeyDown={handleKeyDown}>
        <button
          ref={triggerRef}
          className="fk-nested-dropdown__trigger"
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-haspopup="dialog"
          onClick={() => setPanelOpen(!isOpen)}
        >
          <span className="fk-nested-dropdown__label">{label}</span>
          {summary != null && <span className="fk-nested-dropdown__summary">{summary}</span>}
          <ChevronDownIcon className="fk-nested-dropdown__chevron" aria-hidden="true" />
        </button>
        {isOpen && (
          <FloatingPortal>
            <div
              ref={panelRef}
              className="fk-nested-dropdown__panel"
              id={panelId}
              role="dialog"
              aria-label={panelLabel}
              data-side={floatingPanel.side}
              data-positioned={floatingPanel.positioned || undefined}
              style={floatingPanel.style}
            >
              {children}
            </div>
          </FloatingPortal>
        )}
      </div>
    );
  }
);

/** An inline disclosure for optional settings that should remain in the current
 * inspector flow. Unlike `NestedDropdown`, its content is never an overlay. */
export const Disclosure = forwardRef<HTMLDivElement, DisclosureProps>(function Disclosure(
  { label, summary, children, open, defaultOpen = false, onOpenChange, className, ...props },
  ref
) {
  const generatedId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const contentId = `fk-disclosure-${generatedId}`;
  const classes = ['fk-disclosure', isOpen && 'fk-disclosure--open', className]
    .filter(Boolean)
    .join(' ');

  const setDisclosureOpen = (nextOpen: boolean) => {
    if (open === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <div ref={ref} {...props} className={classes}>
      <button
        className="fk-disclosure__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setDisclosureOpen(!isOpen)}
      >
        <ChevronDownIcon className="fk-disclosure__chevron" aria-hidden="true" />
        <span className="fk-disclosure__label">{label}</span>
        {summary != null && <span className="fk-disclosure__summary">{summary}</span>}
      </button>
      {isOpen && (
        <div className="fk-disclosure__content" id={contentId}>
          {children}
        </div>
      )}
    </div>
  );
});
