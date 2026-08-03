import { forwardRef, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { defaultValueFormat, valueProgress, type ValueControlSize } from '../value-control/utils';

export type SliderSize = ValueControlSize;

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'min' | 'max' | 'step' | 'onChange'
> {
  /** Visible property name. When omitted, provide aria-label. */
  label?: ReactNode;
  /** Current controlled value. */
  value: number;
  /** Lowest selectable value. @default 0 */
  min?: number;
  /** Highest selectable value. @default 100 */
  max?: number;
  /** Smallest keyboard and pointer increment. @default 1 */
  step?: number;
  /** Called with the next numeric value. */
  onValueChange: (value: number) => void;
  /** Control height. @default 'md' */
  size?: SliderSize;
  /** Shows a quiet formatted value at the right edge. @default true */
  showValue?: boolean;
  /** Formats the value for the visible and accessible value text. */
  formatValue?: (value: number) => string;
}

/** A native range input styled for clear, continuous adjustments. It keeps
 * native keyboard and assistive-technology behavior while fitting tool panels. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    size = 'md',
    showValue = true,
    formatValue = defaultValueFormat,
    className,
    disabled = false,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const formattedValue = formatValue(value);
  const classes = ['fk-slider', `fk-slider--${size}`, disabled && 'fk-slider--disabled', className]
    .filter(Boolean)
    .join(' ');
  const progress = valueProgress(value, min, max);
  const style = {
    '--fk-slider-progress': `${progress}%`,
    '--fk-slider-thumb-offset': `${-progress}%`,
  } as CSSProperties;

  return (
    <div className={classes}>
      {(label != null || showValue) && (
        <div className="fk-slider__header">
          {label != null && <span className="fk-tag fk-slider__label">{label}</span>}
          {showValue && <output className="fk-slider__value">{formattedValue}</output>}
        </div>
      )}
      <div className="fk-slider__control" style={style}>
        <input
          ref={ref}
          {...props}
          style={props.style}
          className="fk-slider__input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
          aria-valuetext={formattedValue}
          onChange={(event) => onValueChange(Number(event.target.value))}
        />
        <span className="fk-slider__capture" aria-hidden="true">
          <span className="fk-slider__capture-track">
            <span className="fk-slider__capture-fill" />
          </span>
          <span className="fk-slider__capture-thumb" />
        </span>
      </div>
    </div>
  );
});
