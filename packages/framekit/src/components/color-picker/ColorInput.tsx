import { forwardRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Input, type InputSize } from '../input';
import { useHexField } from './use-hex-field';

export interface ColorInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'prefix'
> {
  /** Controlled hex value (e.g. "#3f3f46"). */
  value?: string;
  /** Uncontrolled initial hex value. @default '#3f3f46' */
  defaultValue?: string;
  /** Visible label inside the field. */
  label?: ReactNode;
  /** Control height. @default 'md' */
  size?: InputSize;
  /** Fires with a normalized "#rrggbb" when a valid hex is committed
   *  (Enter or blur). Invalid input reverts; Escape cancels editing. */
  onChange?: (hex: string) => void;
}

/** A hex color field with a live swatch — commit on Enter/blur, revert on
 *  invalid input, Escape cancels. Displays design-tool style (uppercase, no
 *  '#'); parsing accepts #abc, abc, #aabbcc in any case. For a field that
 *  opens the full picker in a popover, use ColorField. */
export const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(function ColorInput(
  { value, defaultValue = '#3f3f46', onChange, label, size = 'md', className, disabled, ...props },
  ref
) {
  const field = useHexField(value, defaultValue, onChange);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      field.commit();
    } else if (event.key === 'Escape') {
      field.cancel();
    }
    props.onKeyDown?.(event);
  };

  return (
    <Input
      ref={ref}
      className={['fk-color-input', className].filter(Boolean).join(' ')}
      label={label}
      size={size}
      prefix={
        <span
          className="fk-color-input__swatch"
          style={{ background: field.current }}
          aria-hidden="true"
        />
      }
      type="text"
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      aria-label={props['aria-label'] ?? (label == null ? 'Hex color' : undefined)}
      {...props}
      value={field.display}
      onChange={(event) => field.setDraft(event.target.value)}
      onBlur={(event) => {
        field.commit();
        props.onBlur?.(event);
      }}
      onKeyDown={onKeyDown}
      font="mono"
    />
  );
});
