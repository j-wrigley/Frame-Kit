import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type ToneCurveChannel = 'luminance' | 'red' | 'green' | 'blue';

export interface ToneCurvePoint {
  /** Stable application-owned identifier. */
  id: string;
  /** Input value from 0 (shadows) to 1 (highlights). */
  x: number;
  /** Output value from 0 (shadows) to 1 (highlights). */
  y: number;
}

export interface ToneCurveProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled points. Endpoints are kept at input 0 and 1. */
  value?: readonly ToneCurvePoint[];
  /** Initial points when uncontrolled. */
  defaultValue?: readonly ToneCurvePoint[];
  /** Called after a point is added, moved, or removed. */
  onValueChange?: (points: ToneCurvePoint[]) => void;
  /** Controlled selected point id. */
  activeId?: string | null;
  /** Initial selected point id when uncontrolled. */
  defaultActiveId?: string | null;
  /** Called when a point becomes selected. */
  onActiveIdChange?: (id: string | null) => void;
  /** Semantic curve channel used in accessible labels. @default 'luminance' */
  channel?: ToneCurveChannel;
  /** Normalised 0–1 histogram samples rendered behind the curve. */
  histogram?: readonly number[];
  /** Enables point selection, dragging, double-click insertion, and deletion. @default true */
  editable?: boolean;
  /** Disables direct manipulation and mutes the graph. @default false */
  disabled?: boolean;
  /** Arrow-key increment. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible graph name. @default 'Tone curve' */
  label?: string;
}

const DEFAULT_POINTS: readonly ToneCurvePoint[] = [
  { id: 'black', x: 0, y: 0 },
  { id: 'shadow', x: 0.24, y: 0.18 },
  { id: 'highlight', x: 0.74, y: 0.82 },
  { id: 'white', x: 1, y: 1 },
];
const DEFAULT_HISTOGRAM = Array.from({ length: 44 }, (_, index) => {
  const x = index / 43;
  const shadows = Math.exp(-((x - 0.22) ** 2) / 0.018) * 0.7;
  const mids = Math.exp(-((x - 0.55) ** 2) / 0.06) * 0.95;
  const highs = Math.exp(-((x - 0.82) ** 2) / 0.012) * 0.46;
  return Math.min(1, 0.08 + shadows + mids + highs);
});
const VIEWBOX = { width: 300, height: 184 };
const PLOT = { x: 14, y: 14, width: 272, height: 142 };
const MIN_GAP = 0.035;
let pointSerial = 0;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function nextPointId() {
  pointSerial += 1;
  return `tone-point-${pointSerial}`;
}

function normalisePoints(value: readonly ToneCurvePoint[]) {
  const source = value.length >= 2 ? value : DEFAULT_POINTS;
  const ids = new Set<string>();
  const points = source
    .map((point) => ({
      id: point.id && !ids.has(point.id) ? point.id : nextPointId(),
      x: round(clamp(point.x)),
      y: round(clamp(point.y)),
    }))
    .map((point) => {
      ids.add(point.id);
      return point;
    })
    .sort((first, second) => first.x - second.x);

  const first = points[0] ?? { id: 'black', x: 0, y: 0 };
  const last = points[points.length - 1] ?? { id: 'white', x: 1, y: 1 };
  first.x = 0;
  last.x = 1;
  return points.map((point, index) => ({
    ...point,
    x: index === 0 ? 0 : index === points.length - 1 ? 1 : point.x,
  }));
}

function toCanvasPoint(point: Pick<ToneCurvePoint, 'x' | 'y'>) {
  return {
    x: PLOT.x + point.x * PLOT.width,
    y: PLOT.y + (1 - point.y) * PLOT.height,
  };
}

function smoothCurvePath(points: readonly ToneCurvePoint[]) {
  const canvasPoints = points.map(toCanvasPoint);
  if (canvasPoints.length === 0) return '';
  if (canvasPoints.length === 1) return `M${canvasPoints[0].x} ${canvasPoints[0].y}`;
  let path = `M${canvasPoints[0].x} ${canvasPoints[0].y}`;
  for (let index = 0; index < canvasPoints.length - 1; index += 1) {
    const previous = canvasPoints[index - 1] ?? canvasPoints[index];
    const current = canvasPoints[index];
    const next = canvasPoints[index + 1];
    const following = canvasPoints[index + 2] ?? next;
    const firstControl = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const secondControl = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    };
    path += `C${firstControl.x} ${firstControl.y} ${secondControl.x} ${secondControl.y} ${next.x} ${next.y}`;
  }
  return path;
}

function formatCoordinate(value: number) {
  return Math.round(value * 255);
}

/** A compact tonal transfer-curve editor with a quiet histogram backdrop. */
export const ToneCurve = forwardRef<HTMLDivElement, ToneCurveProps>(function ToneCurve(
  {
    value,
    defaultValue = DEFAULT_POINTS,
    onValueChange,
    activeId: activeIdProp,
    defaultActiveId,
    onActiveIdChange,
    channel = 'luminance',
    histogram = DEFAULT_HISTOGRAM,
    editable = true,
    disabled = false,
    step = 0.01,
    label = 'Tone curve',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingIdRef = useRef<string | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normalisePoints(defaultValue));
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string | null>(
    () => defaultActiveId ?? defaultValue[1]?.id ?? defaultValue[0]?.id ?? null
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const points = normalisePoints(value ?? uncontrolledValue);
  const requestedActiveId = activeIdProp ?? uncontrolledActiveId;
  const activeId = points.some((point) => point.id === requestedActiveId)
    ? requestedActiveId
    : (points[0]?.id ?? null);
  const canEdit = editable && !disabled;
  const curvePath = smoothCurvePath(points);
  const classes = ['fk-tone-curve', !canEdit && 'fk-tone-curve--readonly', className]
    .filter(Boolean)
    .join(' ');

  const setPoints = useCallback(
    (nextPoints: readonly ToneCurvePoint[]) => {
      const next = normalisePoints(nextPoints);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const selectPoint = useCallback(
    (id: string | null) => {
      if (activeIdProp === undefined) setUncontrolledActiveId(id);
      onActiveIdChange?.(id);
    },
    [activeIdProp, onActiveIdChange]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
    const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
    return {
      x: clamp((x - PLOT.x) / PLOT.width),
      y: clamp(1 - (y - PLOT.y) / PLOT.height),
    };
  }, []);

  const updatePoint = useCallback(
    (id: string, nextPoint: { x: number; y: number }) => {
      const index = points.findIndex((point) => point.id === id);
      if (index < 0) return;
      const previous = points[index - 1];
      const following = points[index + 1];
      const x = index === 0 ? 0 : index === points.length - 1 ? 1 : clamp(nextPoint.x);
      const boundedX = Math.min(
        following ? following.x - MIN_GAP : 1,
        Math.max(previous ? previous.x + MIN_GAP : 0, x)
      );
      setPoints(
        points.map((point, pointIndex) =>
          pointIndex === index
            ? { ...point, x: round(boundedX), y: round(clamp(nextPoint.y)) }
            : point
        )
      );
    },
    [points, setPoints]
  );

  const removePoint = useCallback(
    (id: string) => {
      const index = points.findIndex((point) => point.id === id);
      if (index <= 0 || index >= points.length - 1) return;
      const nextActive = points[index - 1]?.id ?? null;
      setPoints(points.filter((point) => point.id !== id));
      selectPoint(nextActive);
    },
    [points, selectPoint, setPoints]
  );

  const handlePointerDown = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingIdRef.current = id;
    setDraggingId(id);
    selectPoint(id);
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updatePoint(id, nextPoint);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    if (!canEdit || draggingIdRef.current !== id) return;
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updatePoint(id, nextPoint);
  };

  const stopDragging = (event: ReactPointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingIdRef.current = null;
    setDraggingId(null);
  };

  const handlePointKeyDown = (event: ReactKeyboardEvent<SVGGElement>, point: ToneCurvePoint) => {
    if (!canEdit) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      updatePoint(point.id, { x: point.x - increment, y: point.y });
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      updatePoint(point.id, { x: point.x + increment, y: point.y });
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      updatePoint(point.id, { x: point.x, y: point.y - increment });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      updatePoint(point.id, { x: point.x, y: point.y + increment });
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      removePoint(point.id);
    }
  };

  const addPoint = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!canEdit) return;
    const nextPoint = pointFromPointer(event);
    if (!nextPoint) return;
    const id = nextPointId();
    setPoints([...points, { id, x: nextPoint.x, y: nextPoint.y }]);
    selectPoint(id);
  };

  const samples = histogram.length > 0 ? histogram : DEFAULT_HISTOGRAM;
  const barWidth = PLOT.width / samples.length;

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-tone-curve__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label={label}
        data-disabled={disabled || undefined}
      >
        <rect
          className="fk-tone-curve__surface"
          x="0.5"
          y="0.5"
          width={VIEWBOX.width - 1}
          height={VIEWBOX.height - 1}
          rx="6"
        />
        <g className="fk-tone-curve__histogram" aria-hidden="true">
          {samples.map((sample, index) => {
            const height = clamp(sample) * (PLOT.height * 0.82);
            return (
              <rect
                key={index}
                x={PLOT.x + index * barWidth}
                y={PLOT.y + PLOT.height - height}
                width={Math.max(1, barWidth - 1)}
                height={height}
              />
            );
          })}
        </g>
        <g className="fk-tone-curve__grid" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((ratio) => (
            <path
              key={`v-${ratio}`}
              d={`M${PLOT.x + PLOT.width * ratio} ${PLOT.y}V${PLOT.y + PLOT.height}`}
            />
          ))}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <path
              key={`h-${ratio}`}
              d={`M${PLOT.x} ${PLOT.y + PLOT.height * ratio}H${PLOT.x + PLOT.width}`}
            />
          ))}
        </g>
        <path
          className="fk-tone-curve__identity"
          d={`M${PLOT.x} ${PLOT.y + PLOT.height}L${PLOT.x + PLOT.width} ${PLOT.y}`}
          aria-hidden="true"
        />
        <rect
          className="fk-tone-curve__add-surface"
          x={PLOT.x}
          y={PLOT.y}
          width={PLOT.width}
          height={PLOT.height}
          onDoubleClick={addPoint}
        />
        <path className="fk-tone-curve__curve-shadow" d={curvePath} aria-hidden="true" />
        <path className="fk-tone-curve__curve" d={curvePath} aria-hidden="true" />
        {canEdit && (
          <g className="fk-tone-curve__points">
            {points.map((point, index) => {
              const position = toCanvasPoint(point);
              const endpoint = index === 0 || index === points.length - 1;
              const pointName = endpoint
                ? index === 0
                  ? 'Black point'
                  : 'White point'
                : `Curve point ${index}`;
              return (
                <g
                  className="fk-tone-curve__point"
                  key={point.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${pointName}. Input ${formatCoordinate(point.x)}, output ${formatCoordinate(point.y)}. Use arrow keys to adjust${endpoint ? ' output' : ''}; press Delete to remove a middle point.`}
                  data-active={point.id === activeId || undefined}
                  data-dragging={point.id === draggingId || undefined}
                  onPointerDown={(event) => handlePointerDown(event, point.id)}
                  onPointerMove={(event) => handlePointerMove(event, point.id)}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onKeyDown={(event) => handlePointKeyDown(event, point)}
                >
                  <circle
                    className="fk-tone-curve__point-hit"
                    cx={position.x}
                    cy={position.y}
                    r="11"
                  />
                  <circle
                    className="fk-tone-curve__point-focus"
                    cx={position.x}
                    cy={position.y}
                    r="7"
                  />
                  <circle
                    className="fk-tone-curve__point-outer"
                    cx={position.x}
                    cy={position.y}
                    r="3.75"
                  />
                  <circle
                    className="fk-tone-curve__point-center"
                    cx={position.x}
                    cy={position.y}
                    r="1.2"
                  />
                </g>
              );
            })}
          </g>
        )}
        <g className="fk-tone-curve__axis" aria-hidden="true">
          <text x={PLOT.x} y="174">
            0
          </text>
          <text x={PLOT.x + PLOT.width} y="174">
            255
          </text>
        </g>
      </svg>
    </div>
  );
});
