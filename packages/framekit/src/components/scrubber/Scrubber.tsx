import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import {
  defaultValueFormat,
  useValueControl,
  valueProgress,
  type ValueControlSize,
} from '../value-control/utils';

export type ScrubberSize = ValueControlSize;
export type ScrubberVariant = 'rail' | 'meter' | 'ruler';
export type ScrubberSurface = 'soft' | 'bare';

export interface ScrubberProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Property name and accessible slider name. */
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
  size?: ScrubberSize;
  /** Shows the property label at the start of the row. The accessible name is always retained. @default true */
  showLabel?: boolean;
  /** The information density of the track. @default 'rail' */
  variant?: ScrubberVariant;
  /** Enclosed inspector-row or borderless canvas treatment. @default 'soft' */
  surface?: ScrubberSurface;
  /** Formats the value for display and assistive technology. */
  formatValue?: (value: number) => string;
  /** Disables pointer and keyboard adjustment. @default false */
  disabled?: boolean;
}

/** A compact horizontal adjustment row. Rail is the quiet everyday variant,
 * meter adds stronger level feedback, and ruler keeps a small visual scale. */
export const Scrubber = forwardRef<HTMLDivElement, ScrubberProps>(function Scrubber(
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
    variant = 'rail',
    surface = 'soft',
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
  const formattedValue = formatValue(value);
  const classes = [
    'fk-scrubber',
    `fk-scrubber--${size}`,
    `fk-scrubber--${variant}`,
    `fk-scrubber--${surface}`,
    !showLabel && 'fk-scrubber--label-hidden',
    disabled && 'fk-scrubber--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const style = { '--fk-scrubber-progress': `${progress}%` } as CSSProperties;

  return (
    <div ref={ref} {...props} className={classes} style={{ ...style, ...props.style }}>
      {showLabel && <span className="fk-tag fk-scrubber__label">{label}</span>}
      <div
        className="fk-scrubber__track"
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
        <span className="fk-scrubber__fill" />
        <span className="fk-scrubber__ticks" />
        <span className="fk-scrubber__ticks fk-scrubber__ticks--on-fill" />
        <span className="fk-scrubber__thumb" />
      </div>
      <output className="fk-scrubber__value">{formattedValue}</output>
    </div>
  );
});
