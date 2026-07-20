import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface AxisFieldValue {
  /** Horizontal value from 0 (left) to 1 (right). */
  x: number;
  /** Vertical value from 0 (bottom) to 1 (top). */
  y: number;
}

export interface AxisFieldProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled horizontal and vertical values. */
  value?: AxisFieldValue;
  /** Initial value when uncontrolled. @default { x: 0.52, y: 0.62 } */
  defaultValue?: AxisFieldValue;
  /** Called with the next value after a pointer or keyboard adjustment. */
  onValueChange?: (value: AxisFieldValue) => void;
  /** Enables direct manipulation of the field handle. @default true */
  editable?: boolean;
  /** Disables direct manipulation and mutes the field. @default false */
  disabled?: boolean;
  /** Snaps direct adjustments to the visible dot positions. @default false */
  snapToGrid?: boolean;
  /** Number of visible snap positions across the field. @default 13 */
  gridColumns?: number;
  /** Number of visible snap positions down the field. @default 9 */
  gridRows?: number;
  /** Increment used by Arrow keys while snap is off. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Human-readable horizontal axis name used in the handle label. @default 'X' */
  xLabel?: string;
  /** Human-readable vertical axis name used in the handle label. @default 'Y' */
  yLabel?: string;
  /** Accessible field name. @default 'Axis field' */
  label?: string;
}

const DEFAULT_VALUE: AxisFieldValue = { x: 0.52, y: 0.62 };
const VIEWBOX = { width: 280, height: 190 };
const PLOT = { x: 16, y: 14, width: 248, height: 162 };

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseValue(value: AxisFieldValue): AxisFieldValue {
  return { x: round(clamp(value.x)), y: round(clamp(value.y)) };
}

function toCanvasPoint(value: AxisFieldValue) {
  return {
    x: PLOT.x + value.x * PLOT.width,
    y: PLOT.y + (1 - value.y) * PLOT.height,
  };
}

function snap(value: number, divisions: number) {
  return Math.round(value * divisions) / divisions;
}

function formatCoordinate(value: number) {
  return round(value).toFixed(2);
}

function fieldDots(columns: number, rows: number, value: AxisFieldValue) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => {
      const x = column / (columns - 1);
      const y = 1 - row / (rows - 1);
      const influence = Math.max(0, 1 - Math.hypot(x - value.x, y - value.y) / 0.58);
      return {
        x: PLOT.x + x * PLOT.width,
        y: PLOT.y + (1 - y) * PLOT.height,
        radius: 0.85 + influence * 0.7,
        opacity: 0.2 + influence * 0.42,
      };
    })
  ).flat();
}

/**
 * A compact two-axis editor for shaping paired creative values. It keeps a quiet,
 * responsive dot field and one slider-style handle without assigning meaning to either axis.
 */
export const AxisField = forwardRef<HTMLDivElement, AxisFieldProps>(function AxisField(
  {
    value,
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    editable = true,
    disabled = false,
    snapToGrid = false,
    gridColumns = 13,
    gridRows = 9,
    step = 0.01,
    xLabel = 'X',
    yLabel = 'Y',
    label = 'Axis field',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
  const [isDragging, setIsDragging] = useState(false);
  const fieldValue = normaliseValue(value ?? uncontrolledValue);
  const columns = Math.max(2, Math.round(gridColumns));
  const rows = Math.max(2, Math.round(gridRows));
  const canEdit = editable && !disabled;
  const point = toCanvasPoint(fieldValue);
  const dots = fieldDots(columns, rows, fieldValue);
  const classes = ['fk-axis-field', !canEdit && 'fk-axis-field--readonly', className]
    .filter(Boolean)
    .join(' ');

  const setValue = useCallback(
    (nextValue: AxisFieldValue) => {
      const next = normaliseValue(nextValue);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const normalisePoint = useCallback(
    (nextPoint: AxisFieldValue): AxisFieldValue => {
      const x = clamp(nextPoint.x);
      const y = clamp(nextPoint.y);
      return {
        x: round(snapToGrid ? snap(x, columns - 1) : x),
        y: round(snapToGrid ? snap(y, rows - 1) : y),
      };
    },
    [columns, rows, snapToGrid]
  );

  const updateValue = useCallback(
    (nextPoint: AxisFieldValue) => setValue(normalisePoint(nextPoint)),
    [normalisePoint, setValue]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
    const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
    return { x: (x - PLOT.x) / PLOT.width, y: 1 - (y - PLOT.y) / PLOT.height };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<SVGGElement>) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updateValue(nextPoint);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGGElement>) => {
    if (!canEdit || !draggingRef.current) return;
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updateValue(nextPoint);
  };

  const stopDragging = (event: ReactPointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    setIsDragging(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<SVGGElement>) => {
    if (!canEdit) return;
    const multiplier = event.shiftKey ? 5 : 1;
    const xIncrement = snapToGrid ? multiplier / (columns - 1) : Math.max(step, 0.001) * multiplier;
    const yIncrement = snapToGrid ? multiplier / (rows - 1) : Math.max(step, 0.001) * multiplier;
    let nextX = fieldValue.x;
    let nextY = fieldValue.y;

    if (event.key === 'ArrowLeft') nextX -= xIncrement;
    else if (event.key === 'ArrowRight') nextX += xIncrement;
    else if (event.key === 'ArrowDown') nextY -= yIncrement;
    else if (event.key === 'ArrowUp') nextY += yIncrement;
    else if (event.key === 'Home') {
      nextX = 0;
      nextY = 0;
    } else if (event.key === 'End') {
      nextX = 1;
      nextY = 1;
    } else return;

    event.preventDefault();
    updateValue({ x: nextX, y: nextY });
  };

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-axis-field__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label={label}
        data-editable={canEdit || undefined}
        data-disabled={disabled || undefined}
      >
        <rect
          className="fk-axis-field__surface"
          x="0.5"
          y="0.5"
          width={VIEWBOX.width - 1}
          height={VIEWBOX.height - 1}
          rx="6"
        />
        <g className="fk-axis-field__dots" aria-hidden="true">
          {dots.map((dot, index) => (
            <circle
              className="fk-axis-field__dot"
              cx={dot.x}
              cy={dot.y}
              fillOpacity={dot.opacity}
              key={index}
              r={dot.radius}
            />
          ))}
        </g>
        <g
          className="fk-axis-field__interaction"
          data-dragging={isDragging || undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <rect
            className="fk-axis-field__interaction-surface"
            x={PLOT.x}
            y={PLOT.y}
            width={PLOT.width}
            height={PLOT.height}
          />
          <path
            className="fk-axis-field__crosshair fk-axis-field__crosshair--horizontal"
            d={`M${PLOT.x} ${point.y}H${PLOT.x + PLOT.width}`}
          />
          <path
            className="fk-axis-field__crosshair fk-axis-field__crosshair--vertical"
            d={`M${point.x} ${PLOT.y}V${PLOT.y + PLOT.height}`}
          />
          {canEdit && (
            <g
              className="fk-axis-field__handle"
              role="button"
              tabIndex={0}
              aria-label={`${xLabel} ${formatCoordinate(fieldValue.x)}, ${yLabel} ${formatCoordinate(fieldValue.y)}. Use arrow keys to adjust.`}
              onKeyDown={handleKeyDown}
            >
              <circle className="fk-axis-field__handle-hit" cx={point.x} cy={point.y} r="14" />
              <circle className="fk-axis-field__handle-focus" cx={point.x} cy={point.y} r="9" />
              <circle className="fk-axis-field__handle-outer" cx={point.x} cy={point.y} r="5.5" />
              <circle className="fk-axis-field__handle-center" cx={point.x} cy={point.y} r="1.75" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
});
