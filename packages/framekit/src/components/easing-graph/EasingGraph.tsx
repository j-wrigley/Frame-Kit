import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface EasingCurve {
  /** First cubic-bezier control-point x coordinate, from 0 to 1. */
  x1: number;
  /** First cubic-bezier control-point y coordinate, from 0 to 1. */
  y1: number;
  /** Second cubic-bezier control-point x coordinate, from 0 to 1. */
  x2: number;
  /** Second cubic-bezier control-point y coordinate, from 0 to 1. */
  y2: number;
}

export interface EasingGraphProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled cubic-bezier curve. */
  value?: EasingCurve;
  /** Initial curve when uncontrolled. @default { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 } */
  defaultValue?: EasingCurve;
  /** Called with the next curve after a pointer or keyboard adjustment. */
  onValueChange?: (curve: EasingCurve) => void;
  /** Enables direct manipulation of both control points. @default true */
  editable?: boolean;
  /** Disables direct manipulation and mutes the graph. @default false */
  disabled?: boolean;
  /** Increment used by Arrow keys. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible graph name. @default 'Easing curve' */
  label?: string;
}

type ControlPoint = 1 | 2;

const DEFAULT_CURVE: EasingCurve = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 };
const VIEWBOX = { width: 260, height: 220 };
const PLOT = { x: 12, y: 12, width: 236, height: 196 };
const START = { x: PLOT.x, y: PLOT.y + PLOT.height };
const END = { x: PLOT.x + PLOT.width, y: PLOT.y };
const GRID_COLUMNS = 5;
const GRID_ROWS = 4;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseCurve(curve: EasingCurve): EasingCurve {
  return {
    x1: clamp(curve.x1),
    y1: clamp(curve.y1),
    x2: clamp(curve.x2),
    y2: clamp(curve.y2),
  };
}

function toCanvasPoint(point: { x: number; y: number }) {
  return {
    x: PLOT.x + point.x * PLOT.width,
    y: PLOT.y + (1 - point.y) * PLOT.height,
  };
}

function gridPath(axis: 'horizontal' | 'vertical') {
  const count = axis === 'vertical' ? GRID_COLUMNS : GRID_ROWS;
  return Array.from({ length: count - 1 }, (_, index) => {
    const step = (index + 1) / count;
    const x = PLOT.x + PLOT.width * step;
    const y = PLOT.y + PLOT.height * step;
    return axis === 'vertical'
      ? `M${x} ${PLOT.y}V${PLOT.y + PLOT.height}`
      : `M${PLOT.x} ${y}H${PLOT.x + PLOT.width}`;
  }).join('');
}

function formatCoordinate(value: number) {
  return round(value).toFixed(2);
}

/**
 * A cubic-bezier editor for creative tools. The graph retains a quiet grid at
 * rest and exposes draggable, keyboard-adjustable handles only when editable.
 */
export const EasingGraph = forwardRef<HTMLDivElement, EasingGraphProps>(function EasingGraph(
  {
    value,
    defaultValue = DEFAULT_CURVE,
    onValueChange,
    editable = true,
    disabled = false,
    step = 0.01,
    label = 'Easing curve',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingPointRef = useRef<ControlPoint | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseCurve(defaultValue));
  const [draggingPoint, setDraggingPoint] = useState<ControlPoint | null>(null);
  const curve = normaliseCurve(value ?? uncontrolledValue);
  const canEdit = editable && !disabled;
  const first = toCanvasPoint({ x: curve.x1, y: curve.y1 });
  const second = toCanvasPoint({ x: curve.x2, y: curve.y2 });
  const curvePath = `M${START.x} ${START.y}C${first.x} ${first.y} ${second.x} ${second.y} ${END.x} ${END.y}`;
  const handlePath = `M${START.x} ${START.y}L${first.x} ${first.y}M${second.x} ${second.y}L${END.x} ${END.y}`;
  const classes = ['fk-easing-graph', !canEdit && 'fk-easing-graph--readonly', className]
    .filter(Boolean)
    .join(' ');

  const setCurve = useCallback(
    (nextCurve: EasingCurve) => {
      const next = normaliseCurve(nextCurve);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const updatePoint = useCallback(
    (point: ControlPoint, nextPoint: { x: number; y: number }) => {
      const next = { x: round(clamp(nextPoint.x)), y: round(clamp(nextPoint.y)) };
      setCurve(
        point === 1 ? { ...curve, x1: next.x, y1: next.y } : { ...curve, x2: next.x, y2: next.y }
      );
    },
    [curve, setCurve]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
    const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
    return {
      x: (x - PLOT.x) / PLOT.width,
      y: 1 - (y - PLOT.y) / PLOT.height,
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<SVGGElement>, point: ControlPoint) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingPointRef.current = point;
    setDraggingPoint(point);
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updatePoint(point, nextPoint);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGGElement>, point: ControlPoint) => {
    if (!canEdit || draggingPointRef.current !== point) return;
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updatePoint(point, nextPoint);
  };

  const stopDragging = (event: ReactPointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingPointRef.current = null;
    setDraggingPoint(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<SVGGElement>, point: ControlPoint) => {
    if (!canEdit) return;
    const xKey: 'x1' | 'x2' = point === 1 ? 'x1' : 'x2';
    const yKey: 'y1' | 'y2' = point === 1 ? 'y1' : 'y2';
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    let nextX = curve[xKey];
    let nextY = curve[yKey];

    if (event.key === 'ArrowLeft') nextX -= increment;
    else if (event.key === 'ArrowRight') nextX += increment;
    else if (event.key === 'ArrowDown') nextY -= increment;
    else if (event.key === 'ArrowUp') nextY += increment;
    else return;

    event.preventDefault();
    updatePoint(point, { x: nextX, y: nextY });
  };

  const renderHandle = (point: ControlPoint, position: { x: number; y: number }) => {
    const xKey = point === 1 ? 'x1' : 'x2';
    const yKey = point === 1 ? 'y1' : 'y2';
    const pointName = point === 1 ? 'First' : 'Second';
    return (
      <g
        className="fk-easing-graph__handle"
        role="button"
        tabIndex={0}
        aria-label={`${pointName} control point. X ${formatCoordinate(curve[xKey])}, Y ${formatCoordinate(curve[yKey])}. Use arrow keys to adjust.`}
        data-dragging={draggingPoint === point || undefined}
        onPointerDown={(event) => handlePointerDown(event, point)}
        onPointerMove={(event) => handlePointerMove(event, point)}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={(event) => handleKeyDown(event, point)}
      >
        <circle className="fk-easing-graph__handle-hit" cx={position.x} cy={position.y} r="11" />
        <circle className="fk-easing-graph__handle-focus" cx={position.x} cy={position.y} r="8" />
        <circle className="fk-easing-graph__handle-outer" cx={position.x} cy={position.y} r="5" />
      </g>
    );
  };

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-easing-graph__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label={label}
        data-editable={canEdit || undefined}
        data-disabled={disabled || undefined}
      >
        <rect
          className="fk-easing-graph__surface"
          x="0.5"
          y="0.5"
          width={VIEWBOX.width - 1}
          height={VIEWBOX.height - 1}
          rx="6"
        />
        <path className="fk-easing-graph__grid" d={gridPath('vertical')} />
        <path className="fk-easing-graph__grid" d={gridPath('horizontal')} />
        <path
          className="fk-easing-graph__diagonal"
          d={`M${START.x} ${START.y}L${END.x} ${END.y}`}
        />
        {canEdit && <path className="fk-easing-graph__handle-line" d={handlePath} />}
        <path className="fk-easing-graph__curve" d={curvePath} />
        {canEdit && (
          <g className="fk-easing-graph__handles">
            {renderHandle(1, first)}
            {renderHandle(2, second)}
          </g>
        )}
      </svg>
    </div>
  );
});
