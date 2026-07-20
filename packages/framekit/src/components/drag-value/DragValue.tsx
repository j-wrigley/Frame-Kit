import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import {
  defaultValueFormat,
  useValueControl,
  valueProgress,
  type ValueControlSize,
} from '../value-control/utils';

export type DragValueSize = ValueControlSize;
export type DragValueVariant = 'fill' | 'bipolar' | 'bare';
export type DragValueDecoration = 'none' | 'handle' | 'ticks' | 'zero';
export type DragValueLabelAlign = 'left' | 'center' | 'right';

export interface DragValueProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
  size?: DragValueSize;
  /** Shows the property label beside the value. The accessible name is always retained. @default true */
  showLabel?: boolean;
  /** Horizontal alignment for the visible label and value readout. @default 'center' */
  labelAlign?: DragValueLabelAlign;
  /** Visual treatment. `bipolar` grows from the zero point. @default 'fill' */
  variant?: DragValueVariant;
  /** Optional visual reference layered into the filled control. @default 'none' */
  decoration?: DragValueDecoration;
  /** Value used by a double click reset. Omit to disable reset. */
  resetValue?: number;
  /** Formats the value for display and assistive technology. */
  formatValue?: (value: number) => string;
  /** Disables pointer and keyboard adjustment. @default false */
  disabled?: boolean;
}

/** A direct-manipulation value field for creative tools. Drag horizontally to
 * scrub, use Arrow keys for increments, hold Shift for fine movement, and
 * double click to restore resetValue when supplied. */
export const DragValue = forwardRef<HTMLDivElement, DragValueProps>(function DragValue(
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
    labelAlign = 'center',
    variant = 'fill',
    decoration = 'none',
    resetValue,
    formatValue = defaultValueFormat,
    disabled = false,
    className,
    onKeyDown: onKeyDownProp,
    onPointerDown: onPointerDownProp,
    onPointerMove: onPointerMoveProp,
    onDoubleClick: onDoubleClickProp,
    ...props
  },
  ref
) {
  const progress = valueProgress(value, min, max);
  const zeroProgress = valueProgress(0, min, max);
  const fillStart = variant === 'bipolar' ? Math.min(progress, zeroProgress) : 0;
  const fillEnd = variant === 'bipolar' ? Math.max(progress, zeroProgress) : progress;
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
    'fk-drag-value',
    `fk-drag-value--${size}`,
    `fk-drag-value--${variant}`,
    `fk-drag-value--label-${labelAlign}`,
    disabled && 'fk-drag-value--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const style = {
    '--fk-drag-fill-start': `${fillStart}%`,
    '--fk-drag-fill-width': `${fillEnd - fillStart}%`,
    '--fk-drag-fill-end': `${fillEnd}%`,
  } as CSSProperties;
  const renderReadout = () => (
    <>
      {showLabel && <span className="fk-tag fk-drag-value__label">{label}</span>}
      <span className="fk-drag-value__value">{formattedValue}</span>
    </>
  );

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      style={{ ...style, ...props.style }}
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
      onDoubleClick={(event) => {
        onDoubleClickProp?.(event);
        if (!event.defaultPrevented && !disabled && resetValue != null) onValueChange(resetValue);
      }}
    >
      <span className="fk-drag-value__fill" aria-hidden="true" />
      {decoration !== 'none' && (
        <>
          <span
            className={`fk-drag-value__decoration fk-drag-value__decoration--${decoration}`}
            aria-hidden="true"
          />
          {decoration === 'ticks' && (
            <span
              className="fk-drag-value__decoration fk-drag-value__decoration--ticks fk-drag-value__decoration--on-fill"
              aria-hidden="true"
            />
          )}
        </>
      )}
      <span
        className="fk-drag-value__readout fk-drag-value__readout--before-fill"
        aria-hidden="true"
      >
        {renderReadout()}
      </span>
      <span className="fk-drag-value__readout fk-drag-value__readout--on-fill" aria-hidden="true">
        {renderReadout()}
      </span>
      <span
        className="fk-drag-value__readout fk-drag-value__readout--after-fill"
        aria-hidden="true"
      >
        {renderReadout()}
      </span>
    </div>
  );
});
