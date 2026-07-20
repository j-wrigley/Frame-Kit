import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface KeyframeLaneKeyframe {
  /** Application-owned stable identifier. */
  id: string;
  /** Position on the timeline, constrained to 0 through `duration`. */
  time: number;
  /** Optional application-owned label announced for the marker. */
  label?: string;
}

export interface KeyframeLaneRange {
  /** First selected time, constrained to 0 through `duration`. */
  start: number;
  /** Final selected time, constrained to 0 through `duration`. */
  end: number;
}

export type KeyframeLaneVariant = 'diamond' | 'bar' | 'dot';
export type KeyframeLaneDensity = 'regular' | 'compact';

export interface KeyframeLaneProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled keyframes. Each keyframe needs a stable unique `id`. */
  value?: readonly KeyframeLaneKeyframe[];
  /** Initial keyframes when uncontrolled. */
  defaultValue?: readonly KeyframeLaneKeyframe[];
  /** Called with the next keyframes after a direct adjustment. */
  onValueChange?: (keyframes: KeyframeLaneKeyframe[]) => void;
  /** Controlled selected keyframe id. */
  activeId?: string | null;
  /** Initial selected keyframe id when uncontrolled. Defaults to the first keyframe. */
  defaultActiveId?: string | null;
  /** Called when a marker becomes selected. */
  onActiveIdChange?: (id: string | null) => void;
  /** Controlled current playhead time. */
  playhead?: number;
  /** Whether the lane renders its local playhead. Set false when a parent provides a shared timeline playhead. @default true */
  showPlayhead?: boolean;
  /** Initial playhead time when uncontrolled. @default 0 */
  defaultPlayhead?: number;
  /** Called after clicking the lane to change the current playhead. */
  onPlayheadChange?: (time: number) => void;
  /** Controlled selected range. Use `null` when no range is selected. */
  range?: KeyframeLaneRange | null;
  /** Initial selected range when uncontrolled. @default null */
  defaultRange?: KeyframeLaneRange | null;
  /** Called after Shift-dragging a selection range. */
  onRangeChange?: (range: KeyframeLaneRange | null) => void;
  /** Total timeline duration. @default 1000 */
  duration?: number;
  /** Optional snapping increment. Set a positive value to snap pointer and keyboard edits. */
  snap?: number;
  /** Visual representation for each keyframe. @default 'diamond' */
  variant?: KeyframeLaneVariant;
  /** Overall lane height. Use `compact` when vertically stacking multiple properties. @default 'regular' */
  density?: KeyframeLaneDensity;
  /** Arrow-key increment when snap is off. Hold Shift for five increments. @default 10 */
  step?: number;
  /** Enables marker movement, playhead changes, and range selection. @default true */
  editable?: boolean;
  /** Disables direct interaction and mutes the lane. @default false */
  disabled?: boolean;
  /** Accessible lane name. @default 'Keyframe timeline' */
  label?: string;
}

const DEFAULT_KEYFRAMES: readonly KeyframeLaneKeyframe[] = [
  { id: 'start', time: 0 },
  { id: 'move', time: 300 },
  { id: 'settle', time: 700 },
  { id: 'end', time: 1000 },
];
const LANE_LAYOUTS = {
  regular: {
    viewBox: { width: 360, height: 112 },
    plot: { x: 16, y: 16, width: 328, height: 70 },
    trackY: 54,
    markerSize: 7,
    tickHalf: 14,
    rangeOffset: 8,
    rangeHeight: 16,
    tickLabelY: 102,
    barHalfHeight: 11,
    barFocusHalfHeight: 14,
    barHalfWidth: 4,
    barFocusHalfWidth: 7,
  },
  compact: {
    viewBox: { width: 720, height: 48 },
    plot: { x: 16, y: 6, width: 688, height: 36 },
    trackY: 24,
    markerSize: 5.5,
    tickHalf: 10,
    rangeOffset: 6,
    rangeHeight: 12,
    tickLabelY: 0,
    barHalfHeight: 8,
    barFocusHalfHeight: 10,
    barHalfWidth: 3.5,
    barFocusHalfWidth: 6,
  },
} as const;

type KeyframeLaneLayout = (typeof LANE_LAYOUTS)[KeyframeLaneDensity];

function clamp(value: number, maximum: number) {
  return Math.min(maximum, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseKeyframes(keyframes: readonly KeyframeLaneKeyframe[], duration: number) {
  return keyframes.map((keyframe) => ({
    ...keyframe,
    time: round(clamp(keyframe.time, duration)),
  }));
}

function normaliseRange(range: KeyframeLaneRange | null | undefined, duration: number) {
  if (!range) return null;
  return {
    start: round(clamp(Math.min(range.start, range.end), duration)),
    end: round(clamp(Math.max(range.start, range.end), duration)),
  };
}

function toCanvasTime(time: number, duration: number, layout: KeyframeLaneLayout) {
  return layout.plot.x + (time / duration) * layout.plot.width;
}

function markerPath(x: number, y: number, size: number) {
  return `M${x} ${y - size}L${x + size} ${y}L${x} ${y + size}L${x - size} ${y}Z`;
}

function formatTime(time: number) {
  return `${Math.round(time)} ms`;
}

/**
 * A compact temporal editor for motion inspectors. It keeps keyframes, a playhead,
 * and an optional range visible without expanding into a full timeline workspace.
 */
export const KeyframeLane = forwardRef<HTMLDivElement, KeyframeLaneProps>(function KeyframeLane(
  {
    value,
    defaultValue = DEFAULT_KEYFRAMES,
    onValueChange,
    activeId: activeIdProp,
    defaultActiveId,
    onActiveIdChange,
    playhead: playheadProp,
    defaultPlayhead = 0,
    onPlayheadChange,
    showPlayhead = true,
    range: rangeProp,
    defaultRange = null,
    onRangeChange,
    duration: durationProp = 1000,
    snap,
    variant = 'diamond',
    density = 'regular',
    step = 10,
    editable = true,
    disabled = false,
    label = 'Keyframe timeline',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingIdRef = useRef<string | null>(null);
  const rangeStartRef = useRef<number | null>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normaliseKeyframes(defaultValue, Math.max(1, durationProp))
  );
  const [uncontrolledActiveId, setUncontrolledActiveId] = useState<string | null>(
    () => defaultActiveId ?? defaultValue[0]?.id ?? null
  );
  const [uncontrolledPlayhead, setUncontrolledPlayhead] = useState(defaultPlayhead);
  const [uncontrolledRange, setUncontrolledRange] = useState<KeyframeLaneRange | null>(
    defaultRange
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const duration = Math.max(1, durationProp);
  const layout = LANE_LAYOUTS[density];
  const keyframes = normaliseKeyframes(value ?? uncontrolledValue, duration);
  const requestedActiveId = activeIdProp === undefined ? uncontrolledActiveId : activeIdProp;
  const activeId = keyframes.some((keyframe) => keyframe.id === requestedActiveId)
    ? requestedActiveId
    : (keyframes[0]?.id ?? null);
  const playhead = round(clamp(playheadProp ?? uncontrolledPlayhead, duration));
  const range = normaliseRange(rangeProp === undefined ? uncontrolledRange : rangeProp, duration);
  const canEdit = editable && !disabled;
  const sortedKeyframes = [...keyframes].sort((first, second) => first.time - second.time);
  const snapTickCount = snap && snap > 0 ? Math.ceil(duration / snap) + 1 : 0;
  const tickTimes =
    snapTickCount > 0 && snapTickCount <= 25
      ? Array.from({ length: snapTickCount }, (_, index) => Math.min(duration, index * snap!))
      : Array.from({ length: 9 }, (_, index) => (duration / 8) * index);
  const classes = [
    'fk-keyframe-lane',
    `fk-keyframe-lane--${variant}`,
    `fk-keyframe-lane--${density}`,
    !canEdit && 'fk-keyframe-lane--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const normaliseTime = useCallback(
    (time: number) => {
      const next = clamp(time, duration);
      const snapStep = Math.max(0, snap ?? 0);
      return round(snapStep > 0 ? clamp(Math.round(next / snapStep) * snapStep, duration) : next);
    },
    [duration, snap]
  );

  const setKeyframes = useCallback(
    (nextKeyframes: readonly KeyframeLaneKeyframe[]) => {
      const next = normaliseKeyframes(nextKeyframes, duration);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [duration, onValueChange, value]
  );

  const selectKeyframe = useCallback(
    (id: string | null) => {
      if (activeIdProp === undefined) setUncontrolledActiveId(id);
      onActiveIdChange?.(id);
    },
    [activeIdProp, onActiveIdChange]
  );

  const setPlayhead = useCallback(
    (nextTime: number) => {
      const next = normaliseTime(nextTime);
      if (playheadProp === undefined) setUncontrolledPlayhead(next);
      onPlayheadChange?.(next);
    },
    [normaliseTime, onPlayheadChange, playheadProp]
  );

  const setRange = useCallback(
    (nextRange: KeyframeLaneRange | null) => {
      const next = normaliseRange(nextRange, duration);
      if (rangeProp === undefined) setUncontrolledRange(next);
      onRangeChange?.(next);
    },
    [duration, onRangeChange, rangeProp]
  );

  const updateKeyframe = useCallback(
    (id: string, time: number) => {
      const nextTime = normaliseTime(time);
      setKeyframes(
        keyframes.map((keyframe) =>
          keyframe.id === id ? { ...keyframe, time: nextTime } : keyframe
        )
      );
    },
    [keyframes, normaliseTime, setKeyframes]
  );

  const timeFromPointer = useCallback(
    (event: ReactPointerEvent<SVGGElement>) => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return null;
      const x = ((event.clientX - bounds.left) / bounds.width) * layout.viewBox.width;
      return ((x - layout.plot.x) / layout.plot.width) * duration;
    },
    [duration, layout]
  );

  const handleLanePointerDown = (event: ReactPointerEvent<SVGGElement>) => {
    if (!canEdit || event.button !== 0) return;
    const nextTime = timeFromPointer(event);
    if (nextTime === null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.shiftKey) {
      const start = normaliseTime(nextTime);
      rangeStartRef.current = start;
      setIsSelectingRange(true);
      setRange({ start, end: start });
      return;
    }
    setPlayhead(nextTime);
  };

  const handleLanePointerMove = (event: ReactPointerEvent<SVGGElement>) => {
    if (!canEdit || rangeStartRef.current === null) return;
    const nextTime = timeFromPointer(event);
    if (nextTime !== null) setRange({ start: rangeStartRef.current, end: normaliseTime(nextTime) });
  };

  const stopLaneInteraction = (event: ReactPointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    rangeStartRef.current = null;
    setIsSelectingRange(false);
  };

  const handleMarkerPointerDown = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingIdRef.current = id;
    setDraggingId(id);
    selectKeyframe(id);
    const nextTime = timeFromPointer(event);
    if (nextTime !== null) updateKeyframe(id, nextTime);
  };

  const handleMarkerPointerMove = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    if (!canEdit || draggingIdRef.current !== id) return;
    const nextTime = timeFromPointer(event);
    if (nextTime !== null) updateKeyframe(id, nextTime);
  };

  const stopMarkerDragging = (event: ReactPointerEvent<SVGGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingIdRef.current = null;
    setDraggingId(null);
  };

  const handleMarkerKeyDown = (
    event: ReactKeyboardEvent<SVGGElement>,
    keyframe: KeyframeLaneKeyframe
  ) => {
    if (!canEdit) return;
    const multiplier = event.shiftKey ? 5 : 1;
    const increment =
      Math.max(0, snap ?? 0) > 0 ? (snap as number) * multiplier : Math.max(step, 1) * multiplier;
    let nextTime = keyframe.time;

    if (event.key === 'ArrowLeft') nextTime -= increment;
    else if (event.key === 'ArrowRight') nextTime += increment;
    else if (event.key === 'Home') nextTime = 0;
    else if (event.key === 'End') nextTime = duration;
    else return;

    event.preventDefault();
    selectKeyframe(keyframe.id);
    updateKeyframe(keyframe.id, nextTime);
  };

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-keyframe-lane__canvas"
        viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label={label}
        data-editable={canEdit || undefined}
        data-disabled={disabled || undefined}
      >
        <rect
          className="fk-keyframe-lane__surface"
          x="0.5"
          y="0.5"
          width={layout.viewBox.width - 1}
          height={layout.viewBox.height - 1}
          rx="6"
        />
        <g className="fk-keyframe-lane__ticks" aria-hidden="true">
          {tickTimes.map((time, index) => {
            const x = toCanvasTime(time, duration, layout);
            return (
              <g key={index}>
                <path
                  d={`M${x} ${layout.trackY - layout.tickHalf}V${layout.trackY + layout.tickHalf}`}
                />
                {density === 'regular' &&
                  (index === 0 || index === tickTimes.length - 1 || index === 4) && (
                    <text x={x} y={layout.tickLabelY}>
                      {Math.round(time)}
                    </text>
                  )}
              </g>
            );
          })}
        </g>
        <g
          className="fk-keyframe-lane__interaction"
          data-selecting-range={isSelectingRange || undefined}
          onPointerDown={handleLanePointerDown}
          onPointerMove={handleLanePointerMove}
          onPointerUp={stopLaneInteraction}
          onPointerCancel={stopLaneInteraction}
        >
          <rect
            className="fk-keyframe-lane__interaction-surface"
            x={layout.plot.x}
            y={layout.plot.y}
            width={layout.plot.width}
            height={layout.plot.height}
          />
          {variant === 'bar' &&
            sortedKeyframes.map((keyframe, index) => {
              const x = toCanvasTime(keyframe.time, duration, layout);
              const nextTime = sortedKeyframes[index + 1]?.time ?? duration;
              return (
                <rect
                  className="fk-keyframe-lane__bar-segment"
                  key={keyframe.id}
                  x={x}
                  y={layout.trackY - layout.rangeOffset}
                  width={Math.max(2, toCanvasTime(nextTime, duration, layout) - x)}
                  height={layout.rangeHeight}
                  rx="3"
                  data-active={activeId === keyframe.id || undefined}
                />
              );
            })}
          {range && (
            <rect
              className="fk-keyframe-lane__range"
              x={toCanvasTime(range.start, duration, layout)}
              y={layout.trackY - layout.rangeOffset}
              width={Math.max(
                1,
                toCanvasTime(range.end, duration, layout) -
                  toCanvasTime(range.start, duration, layout)
              )}
              height={layout.rangeHeight}
              rx="3"
            />
          )}
          <path
            className="fk-keyframe-lane__track"
            d={`M${layout.plot.x} ${layout.trackY}H${layout.plot.x + layout.plot.width}`}
          />
          {showPlayhead && (
            <g className="fk-keyframe-lane__playhead" aria-hidden="true">
              <path
                d={`M${toCanvasTime(playhead, duration, layout)} ${layout.plot.y}V${layout.plot.y + layout.plot.height}`}
              />
              <circle cx={toCanvasTime(playhead, duration, layout)} cy={layout.plot.y} r="2.5" />
            </g>
          )}
          {sortedKeyframes.map((keyframe) => {
            const x = toCanvasTime(keyframe.time, duration, layout);
            const markerLabel = keyframe.label ? `${keyframe.label}, ` : '';
            return (
              <g
                className="fk-keyframe-lane__marker"
                key={keyframe.id}
                role="button"
                tabIndex={canEdit ? 0 : -1}
                aria-label={`${markerLabel}${formatTime(keyframe.time)}. Use arrow keys to adjust.`}
                data-active={activeId === keyframe.id || undefined}
                data-dragging={draggingId === keyframe.id || undefined}
                onPointerDown={(event) => handleMarkerPointerDown(event, keyframe.id)}
                onPointerMove={(event) => handleMarkerPointerMove(event, keyframe.id)}
                onPointerUp={stopMarkerDragging}
                onPointerCancel={stopMarkerDragging}
                onKeyDown={(event) => handleMarkerKeyDown(event, keyframe)}
              >
                <rect
                  className="fk-keyframe-lane__marker-hit"
                  x={x - 12}
                  y={layout.trackY - 16}
                  width="24"
                  height="32"
                />
                {variant === 'diamond' ? (
                  <>
                    <path
                      className="fk-keyframe-lane__marker-focus"
                      d={markerPath(x, layout.trackY, layout.markerSize + 2.5)}
                    />
                    <path
                      className="fk-keyframe-lane__marker-shape"
                      d={markerPath(x, layout.trackY, layout.markerSize)}
                    />
                  </>
                ) : variant === 'bar' ? (
                  <>
                    <rect
                      className="fk-keyframe-lane__marker-focus"
                      x={x - layout.barFocusHalfWidth}
                      y={layout.trackY - layout.barFocusHalfHeight}
                      width={layout.barFocusHalfWidth * 2}
                      height={layout.barFocusHalfHeight * 2}
                      rx="3"
                    />
                    <rect
                      className="fk-keyframe-lane__marker-shape fk-keyframe-lane__marker-shape--bar"
                      x={x - layout.barHalfWidth}
                      y={layout.trackY - layout.barHalfHeight}
                      width={layout.barHalfWidth * 2}
                      height={layout.barHalfHeight * 2}
                      rx="2"
                    />
                  </>
                ) : (
                  <>
                    <circle
                      className="fk-keyframe-lane__marker-focus"
                      cx={x}
                      cy={layout.trackY}
                      r={layout.markerSize + 2.5}
                    />
                    <circle
                      className="fk-keyframe-lane__marker-shape"
                      cx={x}
                      cy={layout.trackY}
                      r={layout.markerSize}
                    />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});
