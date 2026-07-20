import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface CameraPathWaypoint {
  /** Horizontal position from 0 (left) to 1 (right). */
  x: number;
  /** Vertical position from 0 (top) to 1 (bottom). */
  y: number;
  /** Optional application-owned waypoint name. */
  label?: string;
}

export interface CameraPathProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled ordered waypoints for the camera route. */
  value?: readonly CameraPathWaypoint[];
  /** Initial waypoints when uncontrolled. */
  defaultValue?: readonly CameraPathWaypoint[];
  /** Called with the next ordered waypoints after a direct adjustment. */
  onValueChange?: (waypoints: CameraPathWaypoint[]) => void;
  /** Controlled selected waypoint index. */
  activeIndex?: number;
  /** Initial selected waypoint when uncontrolled. @default 0 */
  defaultActiveIndex?: number;
  /** Called when a waypoint becomes selected. */
  onActiveIndexChange?: (index: number) => void;
  /** Enables direct manipulation and keyboard travel between waypoints. @default true */
  editable?: boolean;
  /** Disables direct manipulation and mutes the canvas. @default false */
  disabled?: boolean;
  /** Snaps direct adjustments to the visible snap-dot positions. @default false */
  snapToGrid?: boolean;
  /** Number of snap positions across the canvas. @default 9 */
  gridColumns?: number;
  /** Number of snap positions down the canvas. @default 5 */
  gridRows?: number;
  /** Increment used by Arrow keys. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible canvas name. @default 'Camera path' */
  label?: string;
}

const DEFAULT_WAYPOINTS: readonly CameraPathWaypoint[] = [
  { x: 0.08, y: 0.82 },
  { x: 0.48, y: 0.5 },
  { x: 0.9, y: 0.22 },
];

const VIEWBOX = { width: 280, height: 180 };
const PLOT = { x: 16, y: 14, width: 248, height: 152 };

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function clampIndex(value: number, length: number) {
  return length === 0 ? -1 : Math.min(Math.max(0, value), length - 1);
}

function normaliseWaypoints(waypoints: readonly CameraPathWaypoint[]) {
  return waypoints.map((waypoint) => ({
    ...waypoint,
    x: round(clamp(waypoint.x)),
    y: round(clamp(waypoint.y)),
  }));
}

function toCanvasPoint(point: CameraPathWaypoint) {
  return {
    x: PLOT.x + point.x * PLOT.width,
    y: PLOT.y + point.y * PLOT.height,
  };
}

function snapDots(columns: number, rows: number) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => ({
      x: PLOT.x + (column / (columns - 1)) * PLOT.width,
      y: PLOT.y + (row / (rows - 1)) * PLOT.height,
    }))
  ).flat();
}

function routePath(points: readonly { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join('');
}

function formatCoordinate(value: number) {
  return round(value).toFixed(2);
}

function snap(value: number, divisions: number) {
  return Math.round(value * divisions) / divisions;
}

/** A direct-manipulation route editor for camera moves and framing transitions.
 * It keeps waypoints ordered, visible, keyboard-adjustable, and optionally snapped
 * to quiet spatial dot targets. */
export const CameraPath = forwardRef<HTMLDivElement, CameraPathProps>(function CameraPath(
  {
    value,
    defaultValue = DEFAULT_WAYPOINTS,
    onValueChange,
    activeIndex: activeIndexProp,
    defaultActiveIndex = 0,
    onActiveIndexChange,
    editable = true,
    disabled = false,
    snapToGrid = false,
    gridColumns = 9,
    gridRows = 5,
    step = 0.01,
    label = 'Camera path',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normaliseWaypoints(defaultValue)
  );
  const [uncontrolledActiveIndex, setUncontrolledActiveIndex] = useState(defaultActiveIndex);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const waypoints = normaliseWaypoints(value ?? uncontrolledValue);
  const columns = Math.max(2, Math.round(gridColumns));
  const rows = Math.max(2, Math.round(gridRows));
  const activeIndex = clampIndex(activeIndexProp ?? uncontrolledActiveIndex, waypoints.length);
  const canEdit = editable && !disabled;
  const points = waypoints.map(toCanvasPoint);
  const dots = snapDots(columns, rows);
  const classes = ['fk-camera-path', !canEdit && 'fk-camera-path--readonly', className]
    .filter(Boolean)
    .join(' ');

  const setWaypoints = useCallback(
    (nextWaypoints: readonly CameraPathWaypoint[]) => {
      const next = normaliseWaypoints(nextWaypoints);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const selectWaypoint = useCallback(
    (index: number) => {
      const nextIndex = clampIndex(index, waypoints.length);
      if (nextIndex < 0) return;
      if (activeIndexProp === undefined) setUncontrolledActiveIndex(nextIndex);
      onActiveIndexChange?.(nextIndex);
    },
    [activeIndexProp, onActiveIndexChange, waypoints.length]
  );

  const normalisePoint = useCallback(
    (point: { x: number; y: number }): Pick<CameraPathWaypoint, 'x' | 'y'> => {
      const x = clamp(point.x);
      const y = clamp(point.y);
      return {
        x: round(snapToGrid ? snap(x, columns - 1) : x),
        y: round(snapToGrid ? snap(y, rows - 1) : y),
      };
    },
    [columns, rows, snapToGrid]
  );

  const updateWaypoint = useCallback(
    (index: number, point: { x: number; y: number }) => {
      const nextPoint = normalisePoint(point);
      setWaypoints(
        waypoints.map((waypoint, waypointIndex) =>
          waypointIndex === index ? { ...waypoint, ...nextPoint } : waypoint
        )
      );
    },
    [normalisePoint, setWaypoints, waypoints]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
    const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
    return { x: (x - PLOT.x) / PLOT.width, y: (y - PLOT.y) / PLOT.height };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<SVGGElement>, index: number) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingIndexRef.current = index;
    setDraggingIndex(index);
    selectWaypoint(index);
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updateWaypoint(index, nextPoint);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGGElement>, index: number) => {
    if (!canEdit || draggingIndexRef.current !== index) return;
    const nextPoint = pointFromPointer(event);
    if (nextPoint) updateWaypoint(index, nextPoint);
  };

  const stopDragging = (event: ReactPointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingIndexRef.current = null;
    setDraggingIndex(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<SVGGElement>, index: number) => {
    if (!canEdit) return;
    const waypoint = waypoints[index];
    if (!waypoint) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    let nextX = waypoint.x;
    let nextY = waypoint.y;

    if (event.key === 'ArrowLeft') nextX -= increment;
    else if (event.key === 'ArrowRight') nextX += increment;
    else if (event.key === 'ArrowUp') nextY -= increment;
    else if (event.key === 'ArrowDown') nextY += increment;
    else return;

    event.preventDefault();
    selectWaypoint(index);
    updateWaypoint(index, { x: nextX, y: nextY });
  };

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-camera-path__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label={label}
        data-editable={canEdit || undefined}
        data-disabled={disabled || undefined}
      >
        <rect
          className="fk-camera-path__surface"
          x="0.5"
          y="0.5"
          width={VIEWBOX.width - 1}
          height={VIEWBOX.height - 1}
          rx="6"
        />
        <g className="fk-camera-path__snap-dots" aria-hidden="true">
          {dots.map((dot, index) => (
            <circle
              className="fk-camera-path__snap-dot"
              cx={dot.x}
              cy={dot.y}
              r="1.25"
              key={index}
            />
          ))}
        </g>
        {points.length > 1 && <path className="fk-camera-path__route" d={routePath(points)} />}
        <g className="fk-camera-path__waypoints">
          {points.map((point, index) => {
            const waypoint = waypoints[index];
            const pointName = waypoint.label ?? `Waypoint ${index + 1}`;
            const isActive = index === activeIndex;
            return (
              <g
                className="fk-camera-path__waypoint"
                key={`${waypoint.label ?? 'waypoint'}-${index}`}
                role={canEdit ? 'button' : undefined}
                tabIndex={canEdit ? 0 : undefined}
                aria-label={
                  canEdit
                    ? `${pointName}. X ${formatCoordinate(waypoint.x)}, Y ${formatCoordinate(waypoint.y)}. Use arrow keys to adjust.`
                    : undefined
                }
                aria-pressed={canEdit ? isActive : undefined}
                data-active={isActive || undefined}
                data-dragging={draggingIndex === index || undefined}
                data-start={index === 0 || undefined}
                data-end={index === points.length - 1 || undefined}
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={(event) => handlePointerMove(event, index)}
                onPointerUp={stopDragging}
                onPointerCancel={stopDragging}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <rect
                  className="fk-camera-path__waypoint-hit"
                  x={point.x - 15}
                  y={point.y - 12}
                  width="30"
                  height="24"
                  rx="5"
                />
                <rect
                  className="fk-camera-path__waypoint-focus"
                  x={point.x - 14}
                  y={point.y - 11}
                  width="28"
                  height="22"
                  rx="4"
                />
                <rect
                  className="fk-camera-path__waypoint-outer"
                  x={point.x - 12}
                  y={point.y - 9}
                  width="24"
                  height="18"
                  rx="3"
                />
                <text className="fk-camera-path__waypoint-label" x={point.x} y={point.y}>
                  {index + 1}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});
