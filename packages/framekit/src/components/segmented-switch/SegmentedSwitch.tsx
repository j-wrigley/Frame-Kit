import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export type SegmentedSwitchSize = 'sm' | 'md';

export interface SegmentedSwitchOption {
  /** Stable, unique value reported by `onValueChange`. */
  value: string;
  /** Visible and accessible label for the option. */
  label: ReactNode;
  /** Makes this option unavailable to pointer and keyboard selection. */
  disabled?: boolean;
}

export interface SegmentedSwitchProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'role'
> {
  /** Mutually exclusive options. Use stable, unique string values. */
  options: readonly SegmentedSwitchOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. Defaults to the first enabled option. */
  defaultValue?: string;
  /** Called whenever an enabled option is selected. */
  onValueChange?: (value: string) => void;
  /** Track density. @default 'md' */
  size?: SegmentedSwitchSize;
  /** Stretches each segment evenly across the available width. */
  fullWidth?: boolean;
}

function firstEnabledIndex(options: readonly SegmentedSwitchOption[]) {
  return options.findIndex((option) => !option.disabled);
}

/** A quiet, mutually exclusive text control for compact mode choices such as
 * frame rate, quality, aspect ratio, or an On/Off setting. Arrow keys select
 * and move through enabled options like a native radio group. */
export const SegmentedSwitch = forwardRef<HTMLDivElement, SegmentedSwitchProps>(
  function SegmentedSwitch(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      size = 'md',
      fullWidth = false,
      className,
      style,
      onKeyDown,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) {
    const firstEnabled = firstEnabledIndex(options);
    const initialValue = useMemo(() => {
      if (
        defaultValue != null &&
        options.some((option) => option.value === defaultValue && !option.disabled)
      ) {
        return defaultValue;
      }
      return options[firstEnabled]?.value;
    }, [defaultValue, firstEnabled, options]);
    const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const selectedValue = value ?? uncontrolledValue;
    const matchedSelectedIndex = options.findIndex(
      (option) => option.value === selectedValue && !option.disabled
    );
    const selectedIndex = matchedSelectedIndex >= 0 ? matchedSelectedIndex : firstEnabled;

    const select = (nextValue: string) => {
      const nextOption = options.find((option) => option.value === nextValue);
      if (!nextOption || nextOption.disabled || nextValue === selectedValue) return;
      if (value === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };

    const selectByIndex = (index: number) => {
      const option = options[index];
      if (!option || option.disabled) return;
      select(option.value);
      buttonRefs.current[index]?.focus();
    };

    const findEnabledFrom = (start: number, direction: 1 | -1) => {
      for (let offset = 1; offset <= options.length; offset += 1) {
        const index = (start + direction * offset + options.length) % options.length;
        if (!options[index]?.disabled) return index;
      }
      return start;
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || options.length === 0) return;

      const targetButton =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLButtonElement>('.fk-segmented-switch__option')
          : null;
      const targetIndex = buttonRefs.current.findIndex((button) => button === targetButton);
      const currentIndex = targetIndex >= 0 ? targetIndex : selectedIndex;
      let nextIndex: number | undefined;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = findEnabledFrom(currentIndex, 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = findEnabledFrom(currentIndex, -1);
      } else if (event.key === 'Home') {
        nextIndex = firstEnabled;
      } else if (event.key === 'End') {
        nextIndex = [...options].reverse().findIndex((option) => !option.disabled);
        nextIndex = nextIndex < 0 ? -1 : options.length - 1 - nextIndex;
      } else {
        return;
      }

      if (nextIndex == null || nextIndex < 0) return;
      event.preventDefault();
      selectByIndex(nextIndex);
    };

    const classes = [
      'fk-segmented-switch',
      `fk-segmented-switch--${size}`,
      fullWidth && 'fk-segmented-switch--full',
      options.length === 0 && 'fk-segmented-switch--empty',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const optionCount = Math.max(options.length, 1);
    const segmentStyle = {
      ...style,
      '--fk-segmented-selected-width': `calc(${100 / optionCount}% - ${2 + 2 / optionCount}px)`,
      '--fk-segmented-selected-left': `calc(${(100 * Math.max(0, selectedIndex)) / optionCount}% + ${2 - (2 * Math.max(0, selectedIndex)) / optionCount}px)`,
      gridTemplateColumns: `repeat(${optionCount}, minmax(0, 1fr))`,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        {...props}
        className={classes}
        style={segmentStyle}
        role="radiogroup"
        aria-label={ariaLabel ?? (props['aria-labelledby'] ? undefined : 'Segmented switch')}
        onKeyDown={handleKeyDown}
      >
        {options.map((option, index) => {
          const selected = index === selectedIndex;
          return (
            <button
              key={option.value}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              className="fk-tag fk-segmented-switch__option"
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (selectedIndex < 0 && index === firstEnabled) ? 0 : -1}
              disabled={option.disabled}
              onClick={() => select(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);
