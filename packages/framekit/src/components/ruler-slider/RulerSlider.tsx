import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import {
  defaultValueFormat,
  useValueControl,
  valueProgress,
  type ValueControlSize,
} from '../value-control/utils';

export type RulerSliderSize = ValueControlSize;

export interface RulerSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible property name and accessible slider name. */
  label: string;
  /** Current controlled value. */
  value: number;
  /** Lowest selectable value. @default 0 */
  min?: number;
  /** Highest selectable value. @default 100 */
  max?: number;
  /** Smallest increment. @default 1 */
  step?: number;
  /** Shift+arrow increment. @default step / 10 */
  fineStep?: number;
  /** Alt+arrow and PageUp/PageDown increment. @default step * 10 */
  coarseStep?: number;
  /** Called with the next numeric value. */
  onValueChange: (value: number) => void;
  /** Control height. @default 'md' */
  size?: RulerSliderSize;
  /** Shows the property label above the ruler. @default true */
  showLabel?: boolean;
  /** Formats the value for display and assistive technology. */
  formatValue?: (value: number) => string;
  /** Disables pointer and keyboard adjustment. @default false */
  disabled?: boolean;
}

/** A pointer-first precision slider with a compact measurement ruler. Use it
 * for spatial, temporal, or transform values where the scale itself is useful context. */
export const RulerSlider = forwardRef<HTMLDivElement, RulerSliderProps>(function RulerSlider(
  {
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    fineStep,
    coarseStep,
    onValueChange,
    size = 'md',
    showLabel = true,
    formatValue = defaultValueFormat,
    disabled = false,
    className,
    onKeyDown: onKeyDownProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    ...props
  },
  ref
) {
  const progress = valueProgress(value, min, max);
  const { onKeyDown, onPointerDown, onPointerMove } = useValueControl({
    value,
    min,
    max,
    step,
    fineStep,
    coarseStep,
    onValueChange,
    disabled,
  });
  const classes = [
    'fk-ruler-slider',
    `fk-ruler-slider--${size}`,
    disabled && 'fk-ruler-slider--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const style = { '--fk-ruler-progress': `${progress}%` } as CSSProperties;
  const marks = Array.from({ length: 11 }, (_, index) => index);
  const formattedValue = formatValue(value);

  return (
    <div ref={ref} className={classes} {...props}>
      {showLabel && (
        <div className="fk-ruler-slider__header">
          <span className="fk-tag fk-ruler-slider__label">{label}</span>
          <output className="fk-ruler-slider__value">{formattedValue}</output>
        </div>
      )}
      <div
        className="fk-ruler-slider__control"
        style={style}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={formattedValue}
        aria-disabled={disabled || undefined}
        onKeyDown={(event) => {
          onKeyDownProp?.(event);
          if (!event.defaultPrevented) onKeyDown(event);
        }}
        onPointerDown={(event) => {
          onPointerDownProp?.(event);
          if (!event.defaultPrevented) onPointerDown(event);
        }}
        onPointerMove={(event) => {
          onPointerMoveProp?.(event);
          if (!event.defaultPrevented) onPointerMove(event);
        }}
      >
        <span className="fk-ruler-slider__rail" aria-hidden="true" />
        <span className="fk-ruler-slider__fill" aria-hidden="true" />
        <span className="fk-ruler-slider__marks" aria-hidden="true">
          {marks.map((mark) => (
            <span
              key={mark}
              className={
                mark % 5 === 0
                  ? 'fk-ruler-slider__mark fk-ruler-slider__mark--major'
                  : 'fk-ruler-slider__mark'
              }
              style={{ left: `${mark * 10}%` }}
            />
          ))}
        </span>
        <span className="fk-ruler-slider__thumb" aria-hidden="true" />
      </div>
    </div>
  );
});
