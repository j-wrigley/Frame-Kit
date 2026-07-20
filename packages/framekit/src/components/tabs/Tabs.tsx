import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export type TabsVariant = 'underline' | 'contained' | 'soft';
export type TabsSize = 'sm' | 'md';
export type TabsActivationMode = 'automatic' | 'manual';

export interface TabItem {
  /** Stable, unique value reported by `onValueChange`. */
  value: string;
  /** Visible, accessible label for the tab. */
  label: ReactNode;
  /** Optional leading visual, typically a Frame Kit icon. */
  icon?: ReactNode;
  /** Optional trailing meta such as an item count or unsaved-state marker. */
  meta?: ReactNode;
  /** Content for this tab's linked panel. Supply it for every item to render panels. */
  content?: ReactNode;
  /** Makes this tab unavailable to pointer and keyboard selection. */
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** Ordered tabs. Values must be unique and should remain stable across renders. */
  items: readonly TabItem[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. Defaults to the first enabled tab. */
  defaultValue?: string;
  /** Called whenever an enabled tab is selected. */
  onValueChange?: (value: string) => void;
  /** Visual treatment. @default 'underline' */
  variant?: TabsVariant;
  /** Tab density. @default 'md' */
  size?: TabsSize;
  /** Makes tabs share the available horizontal width equally. */
  fullWidth?: boolean;
  /** Whether arrow keys select immediately or wait for Enter/Space. @default 'automatic' */
  activationMode?: TabsActivationMode;
}

function firstEnabledIndex(items: readonly TabItem[]) {
  return items.findIndex((item) => !item.disabled);
}

/**
 * A keyboard-navigable tab strip for switching related views. Supply `content`
 * for every item to render linked tab panels automatically; omit it from every
 * item when this component only controls externally rendered views.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    variant = 'underline',
    size = 'md',
    fullWidth = false,
    activationMode = 'automatic',
    className,
    onKeyDown,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const firstEnabled = firstEnabledIndex(items);
  const initialValue = useMemo(() => {
    const defaultItem = items.find((item) => item.value === defaultValue && !item.disabled);
    return defaultItem?.value ?? items[firstEnabled]?.value;
  }, [defaultValue, firstEnabled, items]);
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedValue = value ?? uncontrolledValue;
  const matchedSelectedIndex = items.findIndex(
    (item) => item.value === selectedValue && !item.disabled
  );
  const selectedIndex = matchedSelectedIndex >= 0 ? matchedSelectedIndex : firstEnabled;
  const rendersPanels = items.length > 0 && items.every((item) => item.content !== undefined);

  const select = (nextValue: string) => {
    const nextItem = items.find((item) => item.value === nextValue);
    if (!nextItem || nextItem.disabled || nextValue === selectedValue) return;
    if (value === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  };

  const findEnabledFrom = (start: number, direction: 1 | -1) => {
    for (let offset = 1; offset <= items.length; offset += 1) {
      const index = (start + direction * offset + items.length) % items.length;
      if (!items[index]?.disabled) return index;
    }
    return start;
  };

  const focusTab = (index: number, selectOnFocus: boolean) => {
    const item = items[index];
    if (!item || item.disabled) return;
    if (selectOnFocus) select(item.value);
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || items.length === 0) return;

    const target =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLButtonElement>('.fk-tabs__tab')
        : null;
    const targetIndex = buttonRefs.current.findIndex((button) => button === target);
    const currentIndex = targetIndex >= 0 ? targetIndex : selectedIndex;
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = findEnabledFrom(currentIndex, 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = findEnabledFrom(currentIndex, -1);
    } else if (event.key === 'Home') {
      nextIndex = firstEnabled;
    } else if (event.key === 'End') {
      nextIndex = [...items].reverse().findIndex((item) => !item.disabled);
      nextIndex = nextIndex < 0 ? -1 : items.length - 1 - nextIndex;
    } else if (
      activationMode === 'manual' &&
      (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar')
    ) {
      if (currentIndex >= 0) {
        event.preventDefault();
        select(items[currentIndex]?.value ?? '');
      }
      return;
    } else {
      return;
    }

    if (nextIndex == null || nextIndex < 0) return;
    event.preventDefault();
    focusTab(nextIndex, activationMode === 'automatic');
  };

  const classes = [
    'fk-tabs',
    `fk-tabs--${variant}`,
    `fk-tabs--${size}`,
    fullWidth && 'fk-tabs--full',
    items.length === 0 && 'fk-tabs--empty',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const panelId = (index: number) => `${generatedId}-panel-${index}`;
  const tabId = (index: number) => `${generatedId}-tab-${index}`;

  return (
    <>
      <div
        ref={ref}
        {...props}
        className={classes}
        role="tablist"
        aria-label={ariaLabel ?? (props['aria-labelledby'] ? undefined : 'Tabs')}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={item.value}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              className="fk-tabs__tab"
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={selected}
              aria-controls={rendersPanels ? panelId(index) : undefined}
              tabIndex={selected || (selectedIndex < 0 && index === firstEnabled) ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.value)}
            >
              {item.icon != null && (
                <span className="fk-tabs__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="fk-tabs__label">{item.label}</span>
              {item.meta != null && <span className="fk-tabs__meta">{item.meta}</span>}
            </button>
          );
        })}
      </div>
      {rendersPanels &&
        items.map((item, index) => (
          <div
            className="fk-tabs__panel"
            key={item.value}
            role="tabpanel"
            id={panelId(index)}
            aria-labelledby={tabId(index)}
            hidden={index !== selectedIndex}
            tabIndex={0}
          >
            {item.content}
          </div>
        ))}
    </>
  );
});
