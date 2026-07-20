import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { CheckIcon, MinusIcon } from '../../icons/icons';

export type CheckboxVariant = 'row' | 'inline';
export type CheckboxTone = 'default' | 'danger';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size' | 'type'
> {
  /** Visible label associated with the native checkbox. */
  label: ReactNode;
  /** Quiet supporting detail for the row treatment. */
  description?: ReactNode;
  /** Optional content aligned at the end of a row, such as a shortcut or count. */
  meta?: ReactNode;
  /** Layout treatment. @default 'row' */
  variant?: CheckboxVariant;
  /** Choice intent. @default 'default' */
  tone?: CheckboxTone;
  /** Renders the native checkbox's mixed state. The caller owns the next state. */
  indeterminate?: boolean;
  /** Additional classes on the labelled root. */
  className?: string;
}

/** A native checkbox with compact row and inline treatments. The label, details,
 * and check indicator are one implicit label so the entire control is clickable. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    meta,
    variant = 'row',
    tone = 'default',
    indeterminate = false,
    className,
    disabled = false,
    'aria-checked': ariaChecked,
    ...props
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const classes = ['fk-checkbox', `fk-checkbox--${variant}`, `fk-checkbox--${tone}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes} data-disabled={disabled || undefined}>
      <input
        ref={inputRef}
        className="fk-checkbox__input"
        type="checkbox"
        disabled={disabled}
        {...props}
        aria-checked={indeterminate ? 'mixed' : ariaChecked}
      />
      <span className="fk-checkbox__box" aria-hidden="true">
        {indeterminate ? <MinusIcon /> : <CheckIcon />}
      </span>
      <span className="fk-checkbox__content">
        <span className="fk-checkbox__label">{label}</span>
        {description != null && <span className="fk-checkbox__description">{description}</span>}
      </span>
      {meta != null && <span className="fk-checkbox__meta">{meta}</span>}
    </label>
  );
});

export type RadioGroupVariant = 'stack' | 'inline';

export interface RadioGroupOption {
  /** Stable, unique value reported by `onValueChange`. */
  value: string;
  /** Visible and accessible option label. */
  label: ReactNode;
  /** Quiet supporting detail for a stacked option. */
  description?: ReactNode;
  /** Makes this option unavailable to pointer and keyboard selection. */
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'role'
> {
  /** Mutually exclusive options. Use stable, unique string values. */
  options: readonly RadioGroupOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. Defaults to the first enabled option. */
  defaultValue?: string;
  /** Called whenever an enabled option is selected. */
  onValueChange?: (value: string) => void;
  /** Native radio name. A stable unique name is generated when omitted. */
  name?: string;
  /** Layout treatment. @default 'stack' */
  variant?: RadioGroupVariant;
}

function firstEnabledValue(options: readonly RadioGroupOption[]) {
  return options.find((option) => !option.disabled)?.value;
}

/** A native radio group with stacked inspector rows and compact inline choices.
 * Native radios preserve expected Tab and arrow-key behavior without simulation. */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    variant = 'stack',
    className,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const generatedName = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(() => {
    const defaultOption = options.find(
      (option) => option.value === defaultValue && !option.disabled
    );
    return defaultOption?.value ?? firstEnabledValue(options);
  });
  const selectedValue = value ?? uncontrolledValue;
  const classes = ['fk-radio-group', `fk-radio-group--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const select = (nextValue: string) => {
    if (nextValue === selectedValue) return;
    if (value === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      role="radiogroup"
      aria-label={ariaLabel ?? (props['aria-labelledby'] ? undefined : 'Radio group')}
    >
      {options.map((option) => {
        const selected = option.value === selectedValue && !option.disabled;
        return (
          <label
            className="fk-radio"
            data-disabled={option.disabled || undefined}
            key={option.value}
          >
            <input
              className="fk-radio__input"
              type="radio"
              name={name ?? `fk-radio-${generatedName}`}
              value={option.value}
              checked={selected}
              disabled={option.disabled}
              onChange={() => select(option.value)}
            />
            <span className="fk-radio__dot" aria-hidden="true" />
            <span className="fk-radio__content">
              <span className="fk-radio__label">{option.label}</span>
              {option.description != null && (
                <span className="fk-radio__description">{option.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
});
