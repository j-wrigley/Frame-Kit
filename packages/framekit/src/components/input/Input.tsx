import {
  forwardRef,
  useState,
  type FormHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { CheckIcon, ImageIcon, MagnifyingGlassIcon, MinusIcon, PlusIcon } from '../../icons/icons';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'surface' | 'bare';
export type InputFont = 'sans' | 'mono';
export type InputAlign = 'start' | 'end';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Visible label rendered inside the control and associated with the input. */
  label?: ReactNode;
  /** Content before the input value, such as an icon or coordinate axis. */
  prefix?: ReactNode;
  /** Content after the input value, usually a unit. */
  suffix?: ReactNode;
  /** Control height. @default 'md' */
  size?: InputSize;
  /** Surface treatment. @default 'surface' */
  variant?: InputVariant;
  /** Value font. Labels always use the kit mono face. @default 'sans' */
  font?: InputFont;
  /** Value alignment. @default 'start' */
  align?: InputAlign;
}

/** A compact single-line field for inspector rows, properties, and names.
 * The visible label is wrapped with the input, so it remains a native label. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    prefix,
    suffix,
    size = 'md',
    variant = 'surface',
    font = 'sans',
    align = 'start',
    className,
    disabled = false,
    type = 'text',
    ...props
  },
  ref
) {
  const classes = [
    'fk-input',
    `fk-input--${size}`,
    `fk-input--${variant}`,
    `fk-input--${font}`,
    `fk-input--align-${align}`,
    disabled && 'fk-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      {label != null && <span className="fk-tag fk-input__label">{label}</span>}
      {prefix != null && <span className="fk-tag fk-input__prefix">{prefix}</span>}
      <input ref={ref} type={type} disabled={disabled} {...props} />
      {suffix != null && <span className="fk-tag fk-tag--accent fk-input__suffix">{suffix}</span>}
    </label>
  );
});

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Search icon or another leading visual. @default MagnifyingGlassIcon */
  icon?: ReactNode;
  /** Control height. @default 'md' */
  size?: InputSize;
  /** Surface treatment. @default 'surface' */
  variant?: InputVariant;
}

/** An icon-led native search field for filtering layers, files, and tools.
 * There is no persistent visible label, so provide aria-label or aria-labelledby. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    icon = <MagnifyingGlassIcon />,
    size = 'md',
    variant = 'surface',
    className,
    disabled = false,
    ...props
  },
  ref
) {
  const classes = [
    'fk-input',
    'fk-search-field',
    `fk-input--${size}`,
    `fk-input--${variant}`,
    disabled && 'fk-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      <span className="fk-search-field__icon" aria-hidden="true">
        {icon}
      </span>
      <input ref={ref} type="search" disabled={disabled} {...props} />
    </label>
  );
});

export interface InlineRenameProps {
  /** Current row name. */
  value: string;
  /** Invoked when the name is committed with Enter or by leaving the field. */
  onCommit: (value: string) => void;
  /** Invoked when editing is cancelled with Escape. */
  onCancel?: () => void;
  /** Leading visual. @default ImageIcon */
  icon?: ReactNode;
  /** Quiet supporting detail at the end of the row, such as dimensions or type. */
  meta?: ReactNode;
  /** Placeholder shown while an empty name is being edited. */
  placeholder?: string;
  /** Accessible name for the edit action and text field. */
  label?: string;
  /** Prevents entering edit mode. @default false */
  disabled?: boolean;
  /** Additional classes on the row. */
  className?: string;
}

/** A layer-style, inline rename row. Click its name to edit in place; Enter or
 * blur commits the new value, while Escape restores the previous value. */
export function InlineRename({
  value,
  onCommit,
  onCancel,
  icon = <ImageIcon />,
  meta,
  placeholder = 'Untitled',
  label,
  disabled = false,
  className,
}: InlineRenameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const accessibleLabel = label ?? `Rename ${value || placeholder}`;
  const classes = ['fk-inline-rename', editing && 'fk-inline-rename--editing', className]
    .filter(Boolean)
    .join(' ');

  const beginEditing = () => {
    if (disabled) return;
    setDraft(value);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
    onCancel?.();
  };

  if (editing) {
    return (
      <form
        className={classes}
        onSubmit={(event) => {
          event.preventDefault();
          commit();
        }}
      >
        <span className="fk-inline-rename__icon" aria-hidden="true">
          {icon}
        </span>
        <input
          autoFocus
          value={draft}
          placeholder={placeholder}
          aria-label={accessibleLabel}
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              cancel();
            }
          }}
        />
        {meta != null && <span className="fk-inline-rename__meta">{meta}</span>}
      </form>
    );
  }

  return (
    <button
      className={classes}
      type="button"
      disabled={disabled}
      aria-label={accessibleLabel}
      onClick={beginEditing}
    >
      <span className="fk-inline-rename__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="fk-inline-rename__value">{value || placeholder}</span>
      {meta != null && <span className="fk-inline-rename__meta">{meta}</span>}
    </button>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label rendered inside the field and associated with the textarea. */
  label?: ReactNode;
  /** Surface treatment. @default 'surface' */
  variant?: InputVariant;
  /** Text font. Labels always use the kit mono face. @default 'sans' */
  font?: InputFont;
}

/** A labelled multiline field for notes, captions, and longer property values. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, variant = 'surface', font = 'sans', className, disabled = false, rows = 3, ...props },
  ref
) {
  const classes = [
    'fk-textarea',
    `fk-textarea--${variant}`,
    `fk-textarea--${font}`,
    disabled && 'fk-textarea--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      {label != null && <span className="fk-tag fk-textarea__label">{label}</span>}
      <textarea ref={ref} disabled={disabled} rows={rows} {...props} />
    </label>
  );
});

export interface NumberInputProps extends Omit<InputProps, 'type' | 'inputMode' | 'align'> {
  /** Invoked when the decrease button is activated. Value parsing stays with the consumer. */
  onDecrement?: () => void;
  /** Invoked when the increase button is activated. Value parsing stays with the consumer. */
  onIncrement?: () => void;
  /** Disables only the decrease button. @default false */
  decrementDisabled?: boolean;
  /** Disables only the increase button. @default false */
  incrementDisabled?: boolean;
  /** Accessible label for the decrease button. @default 'Decrease value' */
  decrementLabel?: string;
  /** Accessible label for the increase button. @default 'Increase value' */
  incrementLabel?: string;
}

/** A numeric value field with explicit decrease and increase actions. The input
 * deliberately remains text + decimal input mode: applications retain full
 * control over parsing, precision, locale, clamping, and empty values. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    onDecrement,
    onIncrement,
    decrementDisabled = false,
    incrementDisabled = false,
    decrementLabel = 'Decrease value',
    incrementLabel = 'Increase value',
    className,
    disabled = false,
    size = 'md',
    ...props
  },
  ref
) {
  const classes = [
    'fk-number-input',
    `fk-number-input--${size}`,
    disabled && 'fk-number-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <button
        className="fk-affix-button fk-number-input__button"
        type="button"
        aria-label={decrementLabel}
        disabled={disabled || decrementDisabled || onDecrement == null}
        onClick={onDecrement}
      >
        <MinusIcon />
      </button>
      <Input
        ref={ref}
        {...props}
        size={size}
        className="fk-number-input__field"
        type="text"
        inputMode="decimal"
        align="end"
        disabled={disabled}
      />
      <button
        className="fk-affix-button fk-number-input__button"
        type="button"
        aria-label={incrementLabel}
        disabled={disabled || incrementDisabled || onIncrement == null}
        onClick={onIncrement}
      >
        <PlusIcon />
      </button>
    </div>
  );
});

export interface InputComposerProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children'> {
  /** Props passed to the composer input. Supply an `aria-label` if the form has no visible label. */
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  /** Accessible label for the submit action. @default 'Submit' */
  submitLabel?: string;
  /** Content rendered in the submit action. @default CheckIcon */
  submitIcon?: ReactNode;
  /** Disables both the input and submit action. @default false */
  disabled?: boolean;
}

/** A one-line value composer with an attached submit action — useful for names,
 * saved views, presets, and compact add flows. Handle `onSubmit` to commit. */
export const InputComposer = forwardRef<HTMLFormElement, InputComposerProps>(function InputComposer(
  {
    inputProps,
    submitLabel = 'Submit',
    submitIcon = <CheckIcon />,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  const classes = ['fk-input-composer', disabled && 'fk-input-composer--disabled', className]
    .filter(Boolean)
    .join(' ');
  const {
    className: inputClassName,
    disabled: inputDisabled,
    ...restInputProps
  } = inputProps ?? {};

  return (
    <form ref={ref} className={classes} {...props}>
      <Input
        className={['fk-input-composer__field', inputClassName].filter(Boolean).join(' ')}
        type="text"
        disabled={disabled || inputDisabled}
        {...restInputProps}
        size="lg"
      />
      <button
        className="fk-affix-button fk-input-composer__button"
        type="submit"
        aria-label={submitLabel}
        disabled={disabled || inputDisabled}
      >
        <span aria-hidden="true">{submitIcon}</span>
      </button>
    </form>
  );
});
