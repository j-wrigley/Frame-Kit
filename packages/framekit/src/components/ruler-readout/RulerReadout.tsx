import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { defaultValueFormat, valueProgress, type ValueControlSize } from '../value-control/utils';

export type RulerReadoutSize = ValueControlSize;

export interface RulerReadoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Measurement name shown above the scale. */
  label: string;
  /** Current measurement value. */
  value: number;
  /** Lowest point on the reference scale. @default 0 */
  min?: number;
  /** Highest point on the reference scale. @default 100 */
  max?: number;
  /** Optional reference origin, such as zero for an offset. */
  origin?: number;
  /** Readout density. @default 'md' */
  size?: RulerReadoutSize;
  /** Formats the highlighted current value. */
  formatValue?: (value: number) => string;
  /** Formats the reference labels beneath the scale. */
  formatRangeValue?: (value: number) => string;
  /** Hides the min, origin, and max labels beneath the scale. @default false */
  hideRangeLabels?: boolean;
}

/** A non-interactive spatial reference for a number shown or edited elsewhere.
 * Pair it with a drag value, scrubber, or numeric input when an always-visible
 * range makes the current value easier to understand. */
export const RulerReadout = forwardRef<HTMLDivElement, RulerReadoutProps>(function RulerReadout(
  {
    label,
    value,
    min = 0,
    max = 100,
    origin,
    size = 'md',
    formatValue = defaultValueFormat,
    formatRangeValue = defaultValueFormat,
    hideRangeLabels = false,
    className,
    ...props
  },
  ref
) {
  const progress = valueProgress(value, min, max);
  const hasOrigin = origin != null && origin >= min && origin <= max;
  const originProgress = hasOrigin ? valueProgress(origin, min, max) : 0;
  const formattedValue = formatValue(value);
  const marks = Array.from({ length: 11 }, (_, index) => index);
  const classes = [
    'fk-ruler-readout',
    `fk-ruler-readout--${size}`,
    hasOrigin && 'fk-ruler-readout--origin',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const style = {
    '--fk-ruler-readout-progress': `${progress}%`,
    '--fk-ruler-readout-origin': `${originProgress}%`,
  } as CSSProperties;

  return (
    <div ref={ref} {...props} className={classes} style={{ ...style, ...props.style }}>
      <div className="fk-ruler-readout__header">
        <span className="fk-tag fk-ruler-readout__label">{label}</span>
        <output className="fk-ruler-readout__value">{formattedValue}</output>
      </div>
      <div className="fk-ruler-readout__scale" aria-hidden="true">
        <span className="fk-ruler-readout__axis" />
        <span className="fk-ruler-readout__marks">
          {marks.map((mark) => (
            <span
              key={mark}
              className={
                mark % 5 === 0
                  ? 'fk-ruler-readout__mark fk-ruler-readout__mark--major'
                  : 'fk-ruler-readout__mark'
              }
              style={{ left: `${mark * 10}%` }}
            />
          ))}
        </span>
        {hasOrigin && <span className="fk-ruler-readout__origin" />}
        <span className="fk-ruler-readout__indicator" />
      </div>
      {!hideRangeLabels && (
        <div className="fk-ruler-readout__range">
          <span>{formatRangeValue(min)}</span>
          {hasOrigin && <span>{formatRangeValue(origin!)}</span>}
          <span>{formatRangeValue(max)}</span>
        </div>
      )}
    </div>
  );
});
