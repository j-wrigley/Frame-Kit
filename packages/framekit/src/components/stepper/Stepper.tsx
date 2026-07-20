import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { MinusIcon, PlusIcon } from '../../icons/icons';

export type StepperSize = 'sm' | 'md' | 'lg';
export type StepperFont = 'sans' | 'mono';

type FlipDirection = 'up' | 'down';

interface ValueFlip {
  id: number;
  from: string;
  to: string;
  direction: FlipDirection;
}

export interface StepperProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type' | 'value'
> {
  /** Current value. Applications retain ownership of parsing and precision. */
  value: string | number;
  /** Accessible group name. @default 'Stepper' */
  label?: string;
  /** Renders an editable text input. Set false for a compact display-only value. @default true */
  editable?: boolean;
  /** Quiet unit or supporting value, such as %, PX, S, or FR. */
  suffix?: ReactNode;
  /** Control height. @default 'md' */
  size?: StepperSize;
  /** Value typeface. @default 'mono' */
  font?: StepperFont;
  /** Invoked by the decrease action. */
  onDecrement?: () => void;
  /** Invoked by the increase action. */
  onIncrement?: () => void;
  /** Disables only the decrease action. @default false */
  decrementDisabled?: boolean;
  /** Disables only the increase action. @default false */
  incrementDisabled?: boolean;
  /** Accessible name for the decrease action. @default 'Decrease value' */
  decrementLabel?: string;
  /** Accessible name for the increase action. @default 'Increase value' */
  incrementLabel?: string;
}

/** A compact numeric increment control for bounded values. It can show a
 * read-only value or an editable text value; parsing, range limits, precision,
 * and increment policy intentionally remain with the consuming application. */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    value,
    label = 'Stepper',
    editable = true,
    suffix,
    size = 'md',
    font = 'mono',
    onDecrement,
    onIncrement,
    decrementDisabled = false,
    incrementDisabled = false,
    decrementLabel = 'Decrease value',
    incrementLabel = 'Increase value',
    className,
    disabled = false,
    'aria-label': inputAriaLabel,
    ...inputProps
  },
  ref
) {
  const valueText = String(value);
  const previousValue = useRef(valueText);
  const pendingDirection = useRef<FlipDirection | null>(null);
  const flipId = useRef(0);
  const [flip, setFlip] = useState<ValueFlip | null>(null);

  // A value can also change through direct text entry or an external update.
  // Only values that follow an explicit step action receive the counter flip.
  // Layout timing lets the outgoing and incoming values mount before paint.
  useLayoutEffect(() => {
    const previous = previousValue.current;
    const direction = pendingDirection.current;

    if (previous !== valueText && direction != null) {
      flipId.current += 1;
      setFlip({ id: flipId.current, from: previous, to: valueText, direction });
    }

    previousValue.current = valueText;
    pendingDirection.current = null;
  }, [valueText]);

  const classes = [
    'fk-stepper',
    `fk-stepper--${size}`,
    `fk-stepper--${font}`,
    !editable && 'fk-stepper--display',
    disabled && 'fk-stepper--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const requestStep = (direction: FlipDirection, action?: () => void) => {
    pendingDirection.current = direction;
    action?.();
  };

  const flipLayer = flip ? (
    <span
      key={flip.id}
      className={`fk-stepper__value-flip fk-stepper__value-flip--${flip.direction}`}
      aria-hidden="true"
    >
      <span className="fk-stepper__value-flip-out">{flip.from}</span>
      <span
        className="fk-stepper__value-flip-in"
        onAnimationEnd={() => {
          setFlip((current) => (current?.id === flip.id ? null : current));
        }}
      >
        {flip.to}
      </span>
    </span>
  ) : null;

  return (
    <div
      ref={ref}
      className={classes}
      role="group"
      aria-label={label}
      data-flipping={flip ? '' : undefined}
    >
      <button
        className="fk-stepper__button fk-stepper__button--decrement"
        type="button"
        aria-label={decrementLabel}
        disabled={disabled || decrementDisabled || onDecrement == null}
        onClick={() => requestStep('down', onDecrement)}
      >
        <MinusIcon />
      </button>
      <div className="fk-stepper__value-slot">
        {editable ? (
          <input
            {...inputProps}
            className="fk-stepper__value"
            type="text"
            inputMode={inputProps.inputMode ?? 'decimal'}
            value={value}
            disabled={disabled}
            aria-label={inputAriaLabel ?? `${label} value`}
          />
        ) : (
          <span className="fk-stepper__value fk-stepper__value--display">{value}</span>
        )}
        {flipLayer}
      </div>
      {suffix != null && <span className="fk-stepper__suffix">{suffix}</span>}
      <button
        className="fk-stepper__button fk-stepper__button--increment"
        type="button"
        aria-label={incrementLabel}
        disabled={disabled || incrementDisabled || onIncrement == null}
        onClick={() => requestStep('up', onIncrement)}
      >
        <PlusIcon />
      </button>
    </div>
  );
});
