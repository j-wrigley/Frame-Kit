import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ColorPicker } from './ColorPicker';
import { Input } from '../input';
import { Popover } from '../popover';
import { useHexField } from './use-hex-field';

export interface ColorFieldPickerContext {
  /** Current normalized hex value. */
  value: string;
  /** Updates the field with a normalized hex value. */
  onChange: (hex: string) => void;
  /** Dismisses the anchored picker popover. */
  close: () => void;
}

export interface ColorFieldProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'onChange' | 'defaultValue'
> {
  /** Controlled hex value (e.g. "#3f3f46"). */
  value?: string;
  /** Uncontrolled initial hex value. @default '#3f3f46' */
  defaultValue?: string;
  /** Fires with a normalized "#rrggbb" on every change (typed or picked). */
  onChange?: (hex: string) => void;
  /** Preset swatches inside the popover picker. */
  presets?: string[];
  /** Popover header label. @default 'Colour' */
  pickerLabel?: string;
  /** Extra class applied to the picker popover surface. */
  pickerClassName?: string;
  /** Replaces the default label and picker panel to compose an extended colour surface. */
  renderPicker?: (context: ColorFieldPickerContext) => ReactNode;
  /** Disables the field and swatch button. */
  disabled?: boolean;
  /** Stretches the field to fill its container. */
  fullWidth?: boolean;
}

/** The closed color control for inspectors and panels: a swatch button plus
 *  a hex field. Clicking the swatch opens the full picker in an anchored
 *  popover — Escape or an outside click closes it and focus returns to the
 *  swatch. */
export const ColorField = forwardRef<HTMLSpanElement, ColorFieldProps>(function ColorField(
  {
    value,
    defaultValue = '#3f3f46',
    onChange,
    presets,
    pickerLabel = 'Colour',
    pickerClassName,
    renderPicker,
    disabled = false,
    fullWidth = false,
    className,
    ...props
  },
  ref
) {
  const field = useHexField(value, defaultValue, onChange);
  const [open, setOpen] = useState(false);

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') field.commit();
    else if (event.key === 'Escape' && field.draft !== null) {
      // Cancel the draft first; a second Escape closes the popover via the shell.
      event.stopPropagation();
      field.cancel();
    }
  };

  const classes = [
    'fk-color-field',
    open && 'fk-color-field--open',
    disabled && 'fk-color-field--disabled',
    fullWidth && 'fk-color-field--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...props} ref={ref} className={classes}>
      <Popover
        className="fk-color-field__popover-shell"
        trigger={
          <button
            type="button"
            className="fk-color-field__swatch"
            disabled={disabled}
            aria-label="Open colour picker"
          >
            <span
              className="fk-color-input__swatch"
              style={{ background: field.current }}
              aria-hidden="true"
            />
          </button>
        }
        open={open}
        onOpenChange={setOpen}
        placement="bottom-start"
        size="auto"
        offset={6}
        panelLabel={pickerLabel}
        panelClassName={['fk-color-popover', pickerClassName].filter(Boolean).join(' ')}
      >
        {renderPicker ? (
          renderPicker({ value: field.current, onChange: field.apply, close: () => setOpen(false) })
        ) : (
          <>
            <span className="fk-tag fk-color-popover__label">{pickerLabel}</span>
            <ColorPicker value={field.current} onChange={field.apply} presets={presets} />
          </>
        )}
      </Popover>
      <Input
        className="fk-color-field__input"
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        aria-label="Hex color"
        value={field.display}
        onChange={(event) => field.setDraft(event.target.value)}
        onBlur={field.commit}
        onKeyDown={onInputKeyDown}
        font="mono"
        align="end"
      />
    </span>
  );
});
