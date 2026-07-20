import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type ValueGraphChannel = 'position' | 'scale' | 'rotation' | 'opacity';

export interface ValueGraphPoint {
  /** Stable identifier for the key point. */
  id: string;
  /** Normalised time from 0 to 1. */
  time: number;
  /** Normalised value from -1 to 1. */
  value: number;
}

export type ValueGraphChannels = Record<ValueGraphChannel, ValueGraphPoint[]>;

export interface ValueGraphProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled key points for every animation channel. */
  value?: ValueGraphChannels;
  /** Initial key points for every animation channel when uncontrolled. */
  defaultValue?: ValueGraphChannels;
  /** Called after moving, adding, or removing a key point. */
  onValueChange?: (value: ValueGraphChannels) => void;
  /** Channel that receives direct point edits. @default 'position' */
  activeChannel?: ValueGraphChannel;
  /** Channel that receives direct point edits when uncontrolled. */
  defaultActiveChannel?: ValueGraphChannel;
  /** Controlled selected point identifier in the active channel. */
  activePointId?: string | null;
  /** Initial selected point identifier when uncontrolled. */
  defaultActivePointId?: string | null;
  /** Called after the active point changes. */
  onActivePointChange?: (id: string | null) => void;
  /** Shows non-active channel curves in the background. @default true */
  showOtherChannels?: boolean;
  /** Enables direct point editing. @default true */
  editable?: boolean;
  /** Disables interaction and mutes the graph. @default false */
  disabled?: boolean;
  /** Arrow-key increment. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible component name. @default 'Animation value graph' */
  label?: string;
}

const CHANNELS: readonly ValueGraphChannel[] = ['position', 'scale', 'rotation', 'opacity'];
const VIEWBOX = { width: 360, height: 188 };
const PLOT = { x: 6, y: 6, width: 348, height: 176 };
const VALUE_RANGE = 0.42;
const MIN_TIME_GAP = 0.055;

const DEFAULT_VALUE: ValueGraphChannels = {
  position: [
    { id: 'position-start', time: 0, value: -0.08 },
    { id: 'position-rise', time: 0.24, value: 0.46 },
    { id: 'position-drift', time: 0.57, value: -0.22 },
    { id: 'position-peak', time: 0.82, value: 0.62 },
    { id: 'position-end', time: 1, value: 0.16 },
  ],
  scale: [
    { id: 'scale-start', time: 0, value: -0.42 },
    { id: 'scale-settle', time: 0.3, value: 0.14 },
    { id: 'scale-peak', time: 0.68, value: 0.48 },
    { id: 'scale-end', time: 1, value: 0.08 },
  ],
  rotation: [
    { id: 'rotation-start', time: 0, value: 0.3 },
    { id: 'rotation-turn', time: 0.38, value: -0.22 },
    { id: 'rotation-settle', time: 0.74, value: 0.26 },
    { id: 'rotation-end', time: 1, value: -0.1 },
  ],
  opacity: [
    { id: 'opacity-start', time: 0, value: -0.88 },
    { id: 'opacity-in', time: 0.16, value: 0.1 },
    { id: 'opacity-hold', time: 0.52, value: 0.72 },
    { id: 'opacity-out', time: 0.82, value: 0.28 },
    { id: 'opacity-end', time: 1, value: 0.92 },
  ],
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normalisePoints(
  points: readonly ValueGraphPoint[] | undefined,
  channel: ValueGraphChannel
) {
  const fallback = DEFAULT_VALUE[channel];
  const candidates = Array.isArray(points) && points.length >= 2 ? points : fallback;
  return candidates
    .map((point, index) => ({
      id: point.id || `${channel}-${index}`,
      time: round(
        clamp(Number.isFinite(point.time) ? point.time : index / (candidates.length - 1))
      ),
      value: round(clamp(Number.isFinite(point.value) ? point.value : 0, -1, 1)),
    }))
    .sort((first, second) => first.time - second.time)
    .map((point, index, all) => ({
      ...point,
      time:
        index === 0
          ? 0
          : index === all.length - 1
            ? 1
            : clamp(
                point.time,
                all[index - 1].time + MIN_TIME_GAP,
                1 - (all.length - index - 1) * MIN_TIME_GAP
              ),
    }));
}

function normaliseValue(value: ValueGraphChannels): ValueGraphChannels {
  return Object.fromEntries(
    CHANNELS.map((channel) => [channel, normalisePoints(value[channel], channel)])
  ) as ValueGraphChannels;
}

function toCanvasPoint(point: ValueGraphPoint) {
  return {
    x: PLOT.x + point.time * PLOT.width,
    y: PLOT.y + PLOT.height / 2 - point.value * PLOT.height * VALUE_RANGE,
  };
}

function curvePath(points: readonly ValueGraphPoint[]) {
  const canvasPoints = points.map(toCanvasPoint);
  if (canvasPoints.length === 0) return '';
  if (canvasPoints.length === 1) return `M ${canvasPoints[0].x} ${canvasPoints[0].y}`;

  return canvasPoints.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    const previous = canvasPoints[index - 1];
    const handle = (point.x - previous.x) * 0.42;
    return `${path} C ${(previous.x + handle).toFixed(2)} ${previous.y.toFixed(2)}, ${(point.x - handle).toFixed(2)} ${point.y.toFixed(2)}, ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, '');
}

function formatChannel(channel: ValueGraphChannel) {
  return `${channel[0].toUpperCase()}${channel.slice(1)}`;
}

function formatPoint(point: ValueGraphPoint) {
  return `Time ${point.time.toFixed(2)}, value ${point.value.toFixed(2)}`;
}

/**
 * A multi-channel value graph for animation curves. The active channel stays
 * editable while the remaining channels provide quiet timing context.
 */
export const ValueGraph = forwardRef<HTMLDivElement, ValueGraphProps>(function ValueGraph(
  {
    value,
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    activeChannel: activeChannelProp,
    defaultActiveChannel = 'position',
    activePointId: activePointIdProp,
    defaultActivePointId = null,
    onActivePointChange,
    showOtherChannels = true,
    editable = true,
    disabled = false,
    step = 0.01,
    label = 'Animation value graph',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingPointRef = useRef<string | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
  const [uncontrolledPointId, setUncontrolledPointId] = useState<string | null>(
    defaultActivePointId
  );
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null);
  const graph = normaliseValue(value ?? uncontrolledValue);
  const activeChannel = activeChannelProp ?? defaultActiveChannel;
  const activePointId = activePointIdProp ?? uncontrolledPointId;
  const activePoints = graph[activeChannel];
  const canEdit = editable && !disabled;
  const classes = ['fk-value-graph', !canEdit && 'fk-value-graph--readonly', className]
    .filter(Boolean)
    .join(' ');

  const setGraph = useCallback(
    (nextValue: ValueGraphChannels) => {
      const next = normaliseValue(nextValue);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const setActivePoint = useCallback(
    (nextId: string | null) => {
      if (activePointIdProp === undefined) setUncontrolledPointId(nextId);
      onActivePointChange?.(nextId);
    },
    [activePointIdProp, onActivePointChange]
  );

  const updateActivePoints = useCallback(
    (nextPoints: ValueGraphPoint[]) => setGraph({ ...graph, [activeChannel]: nextPoints }),
    [activeChannel, graph, setGraph]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
    const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
    return {
      time: clamp((x - PLOT.x) / PLOT.width),
      value: clamp((PLOT.y + PLOT.height / 2 - y) / (PLOT.height * VALUE_RANGE), -1, 1),
    };
  }, []);

  const updatePoint = useCallback(
    (pointId: string, nextPoint: Pick<ValueGraphPoint, 'time' | 'value'>) => {
      const pointIndex = activePoints.findIndex((point) => point.id === pointId);
      if (pointIndex === -1) return;
      const isEndpoint = pointIndex === 0 || pointIndex === activePoints.length - 1;
      const minimumTime = pointIndex === 0 ? 0 : activePoints[pointIndex - 1].time + MIN_TIME_GAP;
      const maximumTime =
        pointIndex === activePoints.length - 1
          ? 1
          : activePoints[pointIndex + 1].time - MIN_TIME_GAP;
      updateActivePoints(
        activePoints.map((point, index) =>
          index === pointIndex
            ? {
                ...point,
                time: round(
                  isEndpoint ? point.time : clamp(nextPoint.time, minimumTime, maximumTime)
                ),
                value: round(clamp(nextPoint.value, -1, 1)),
              }
            : point
        )
      );
    },
    [activePoints, updateActivePoints]
  );

  const startPointDrag = (event: ReactPointerEvent<SVGGElement>, pointId: string) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    draggingPointRef.current = pointId;
    setDraggingPoint(pointId);
    setActivePoint(pointId);
    const nextPoint = pointFromPointer(event as unknown as ReactPointerEvent<SVGSVGElement>);
    if (nextPoint) updatePoint(pointId, nextPoint);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const pointId = draggingPointRef.current;
    if (!canEdit || pointId == null) return;
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updatePoint(pointId, nextPoint);
  };

  const stopDragging = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingPointRef.current = null;
    setDraggingPoint(null);
  };

  const addPoint = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!canEdit) return;
    const nextPoint = pointFromPointer(event as unknown as ReactPointerEvent<SVGSVGElement>);
    if (!nextPoint) return;
    const id = `${activeChannel}-${Math.random().toString(36).slice(2, 8)}`;
    const points = [
      ...activePoints,
      { id, time: round(nextPoint.time), value: round(nextPoint.value) },
    ].sort((first, second) => first.time - second.time);
    const insertionIndex = points.findIndex((point) => point.id === id);
    if (
      insertionIndex === 0 ||
      insertionIndex === points.length - 1 ||
      points[insertionIndex].time - points[insertionIndex - 1].time < MIN_TIME_GAP ||
      points[insertionIndex + 1].time - points[insertionIndex].time < MIN_TIME_GAP
    ) {
      return;
    }
    updateActivePoints(points);
    setActivePoint(id);
  };

  const handlePointKeyDown = (event: ReactKeyboardEvent<SVGGElement>, pointId: string) => {
    if (!canEdit) return;
    const pointIndex = activePoints.findIndex((point) => point.id === pointId);
    const point = activePoints[pointIndex];
    if (!point) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);

    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      pointIndex > 0 &&
      pointIndex < activePoints.length - 1
    ) {
      event.preventDefault();
      const nextPoints = activePoints.filter((candidate) => candidate.id !== pointId);
      updateActivePoints(nextPoints);
      setActivePoint(nextPoints[Math.max(0, pointIndex - 1)]?.id ?? null);
      return;
    }

    let nextTime = point.time;
    let nextValue = point.value;
    if (event.key === 'ArrowLeft') nextTime -= increment;
    else if (event.key === 'ArrowRight') nextTime += increment;
    else if (event.key === 'ArrowDown') nextValue -= increment;
    else if (event.key === 'ArrowUp') nextValue += increment;
    else if (event.key === 'Home') nextValue = 0;
    else return;

    event.preventDefault();
    updatePoint(pointId, { time: nextTime, value: nextValue });
  };

  return (
    <div ref={ref} {...props} className={classes} role="group" aria-label={label}>
      <svg
        ref={svgRef}
        className="fk-value-graph__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        aria-label={label}
        data-disabled={disabled || undefined}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onDoubleClick={addPoint}
      >
        <rect
          className="fk-value-graph__surface"
          x={PLOT.x}
          y={PLOT.y}
          width={PLOT.width}
          height={PLOT.height}
          rx="4"
        />
        <g className="fk-value-graph__grid" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => {
            const x = PLOT.x + ((index + 1) / 5) * PLOT.width;
            return (
              <line key={`vertical-${index}`} x1={x} x2={x} y1={PLOT.y} y2={PLOT.y + PLOT.height} />
            );
          })}
          {Array.from({ length: 4 }, (_, index) => {
            const y = PLOT.y + ((index + 1) / 5) * PLOT.height;
            return (
              <line
                key={`horizontal-${index}`}
                x1={PLOT.x}
                x2={PLOT.x + PLOT.width}
                y1={y}
                y2={y}
              />
            );
          })}
        </g>
        <line
          className="fk-value-graph__zero"
          x1={PLOT.x}
          x2={PLOT.x + PLOT.width}
          y1={PLOT.y + PLOT.height / 2}
          y2={PLOT.y + PLOT.height / 2}
          aria-hidden="true"
        />
        {CHANNELS.filter((channel) => channel !== activeChannel && showOtherChannels).map(
          (channel) => (
            <path
              className="fk-value-graph__curve fk-value-graph__curve--context"
              d={curvePath(graph[channel])}
              key={channel}
              aria-hidden="true"
            />
          )
        )}
        <path
          className="fk-value-graph__curve fk-value-graph__curve--active"
          d={curvePath(activePoints)}
          aria-hidden="true"
        />
        {activePoints.map((point, index) => {
          const canvasPoint = toCanvasPoint(point);
          const selected = activePointId === point.id;
          return (
            <g
              className="fk-value-graph__point"
              data-dragging={draggingPoint === point.id || undefined}
              data-selected={selected || undefined}
              key={point.id}
              role="slider"
              tabIndex={canEdit ? 0 : undefined}
              aria-label={`${formatChannel(activeChannel)} key point ${index + 1}`}
              aria-valuemin={-1}
              aria-valuemax={1}
              aria-valuenow={point.value}
              aria-valuetext={formatPoint(point)}
              aria-disabled={!canEdit || undefined}
              onPointerDown={(event) => startPointDrag(event, point.id)}
              onKeyDown={(event) => handlePointKeyDown(event, point.id)}
            >
              <circle
                className="fk-value-graph__point-hit"
                cx={canvasPoint.x}
                cy={canvasPoint.y}
                r="9"
              />
              <circle
                className="fk-value-graph__point-focus"
                cx={canvasPoint.x}
                cy={canvasPoint.y}
                r="5.5"
              />
              <circle
                className="fk-value-graph__point-marker"
                cx={canvasPoint.x}
                cy={canvasPoint.y}
                r="2.8"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
});
