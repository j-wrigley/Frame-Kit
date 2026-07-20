import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type LoopComposerMode = 'repeat' | 'ping-pong';

export interface LoopComposerValue {
  /** Whether each iteration restarts or reverses direction. */
  mode: LoopComposerMode;
  /** Number of iterations in the visible loop. */
  repeats: number;
  /** Portion of each iteration held at its terminal value, from 0 through 1. */
  hold: number;
  /** Normalised loop start offset, from 0 through 1. */
  offset: number;
  /** Whether the final frame connects cleanly back to the first. */
  seamless: boolean;
}

export interface LoopComposerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled loop behaviour. */
  value?: LoopComposerValue;
  /** Initial loop behaviour when uncontrolled. */
  defaultValue?: LoopComposerValue;
  /** Called after a loop control changes. */
  onValueChange?: (value: LoopComposerValue) => void;
  /** Lowest permitted repeat count. @default 1 */
  minRepeats?: number;
  /** Highest permitted repeat count. @default 8 */
  maxRepeats?: number;
  /** Enables loop controls and direct offset adjustment. @default true */
  editable?: boolean;
  /** Disables interaction and mutes the composer. @default false */
  disabled?: boolean;
  /** Arrow-key offset increment. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible component name. @default 'Loop composer' */
  label?: string;
}

type Point = { x: number; y: number };

const DEFAULT_VALUE: LoopComposerValue = {
  mode: 'repeat',
  repeats: 3,
  hold: 0.16,
  offset: 0.12,
  seamless: true,
};
const VIEWBOX = { width: 360, height: 72 };
const PLOT = { x: 14, y: 24, width: 332, height: 18 };
const OFFSET_Y = 12;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseUnit(value: number) {
  return round(clamp(Number.isFinite(value) ? value : 0, 0, 1));
}

function normaliseValue(value: LoopComposerValue, minRepeats: number, maxRepeats: number) {
  return {
    mode: value.mode === 'ping-pong' ? 'ping-pong' : 'repeat',
    repeats: Math.round(
      clamp(
        Number.isFinite(value.repeats) ? value.repeats : DEFAULT_VALUE.repeats,
        minRepeats,
        maxRepeats
      )
    ),
    hold: normaliseUnit(value.hold),
    offset: normaliseUnit(value.offset),
    seamless: Boolean(value.seamless),
  } as LoopComposerValue;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatMode(mode: LoopComposerMode) {
  return mode === 'ping-pong' ? 'Ping-pong' : 'Repeat';
}

function pointFromPointer(
  event: ReactPointerEvent<SVGRectElement>,
  svg: SVGSVGElement | null
): Point | null {
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: clamp(
      ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width,
      PLOT.x,
      PLOT.x + PLOT.width
    ),
    y: clamp(((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height, 0, VIEWBOX.height),
  };
}

/**
 * A compact playback-loop editor for motion, effects, and repeated procedural
 * behaviours. Repeat direction, terminal hold, start offset, and seam closure
 * remain visible in one stable timeline.
 */
export const LoopComposer = forwardRef<HTMLDivElement, LoopComposerProps>(function LoopComposer(
  {
    value,
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    minRepeats: minRepeatsProp = 1,
    maxRepeats: maxRepeatsProp = 8,
    editable = true,
    disabled = false,
    step = 0.01,
    label = 'Loop composer',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingOffsetRef = useRef(false);
  const minRepeats = Math.max(1, Math.round(Math.min(minRepeatsProp, maxRepeatsProp)));
  const maxRepeats = Math.max(minRepeats, Math.round(maxRepeatsProp));
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normaliseValue(defaultValue, minRepeats, maxRepeats)
  );
  const [draggingOffset, setDraggingOffset] = useState(false);
  const loop = normaliseValue(value ?? uncontrolledValue, minRepeats, maxRepeats);
  const canEdit = editable && !disabled;
  const classes = ['fk-loop-composer', !canEdit && 'fk-loop-composer--readonly', className]
    .filter(Boolean)
    .join(' ');
  const segmentWidth = PLOT.width / loop.repeats;
  const offsetX = PLOT.x + loop.offset * PLOT.width;

  const setValue = useCallback(
    (nextValue: LoopComposerValue) => {
      const next = normaliseValue(nextValue, minRepeats, maxRepeats);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [maxRepeats, minRepeats, onValueChange, value]
  );

  const setOffsetFromPoint = useCallback(
    (point: Point) => {
      setValue({ ...loop, offset: (point.x - PLOT.x) / PLOT.width });
    },
    [loop, setValue]
  );

  const handleOffsetPointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!canEdit || event.button !== 0) return;
    const point = pointFromPointer(event, svgRef.current);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingOffsetRef.current = true;
    setDraggingOffset(true);
    setOffsetFromPoint(point);
  };

  const handleOffsetPointerMove = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!canEdit || !draggingOffsetRef.current) return;
    const point = pointFromPointer(event, svgRef.current);
    if (point) setOffsetFromPoint(point);
  };

  const stopOffsetDragging = (event: ReactPointerEvent<SVGRectElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingOffsetRef.current = false;
    setDraggingOffset(false);
  };

  const handleOffsetKeyDown = (event: ReactKeyboardEvent<SVGRectElement>) => {
    if (!canEdit) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setValue({ ...loop, offset: loop.offset - increment });
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setValue({ ...loop, offset: loop.offset + increment });
    } else if (event.key === 'Home') {
      event.preventDefault();
      setValue({ ...loop, offset: 0 });
    } else if (event.key === 'End') {
      event.preventDefault();
      setValue({ ...loop, offset: 1 });
    }
  };

  const update = (next: Partial<LoopComposerValue>) => setValue({ ...loop, ...next });

  return (
    <div ref={ref} {...props} className={classes} role="group" aria-label={label}>
      <div className="fk-loop-composer__toolbar">
        <div className="fk-loop-composer__mode" role="radiogroup" aria-label="Loop direction">
          {(['repeat', 'ping-pong'] as const).map((mode) => (
            <button
              className="fk-loop-composer__mode-button"
              type="button"
              role="radio"
              aria-checked={loop.mode === mode}
              disabled={!canEdit}
              key={mode}
              onClick={() => update({ mode })}
            >
              {formatMode(mode)}
            </button>
          ))}
        </div>
        <button
          className="fk-loop-composer__seamless"
          type="button"
          role="switch"
          aria-checked={loop.seamless}
          disabled={!canEdit}
          onClick={() => update({ seamless: !loop.seamless })}
        >
          <span aria-hidden="true" />
          Seamless
        </button>
      </div>

      <svg
        ref={svgRef}
        className="fk-loop-composer__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label="Loop offset timeline"
        data-disabled={disabled || undefined}
      >
        <rect
          className="fk-loop-composer__surface"
          x="0.5"
          y="0.5"
          width={VIEWBOX.width - 1}
          height={VIEWBOX.height - 1}
          rx="6"
        />
        <g className="fk-loop-composer__offset-track">
          <path d={`M${PLOT.x} ${OFFSET_Y}H${PLOT.x + PLOT.width}`} />
          <circle cx={PLOT.x} cy={OFFSET_Y} r="1.5" />
          <circle cx={PLOT.x + PLOT.width} cy={OFFSET_Y} r="1.5" />
        </g>
        <g className="fk-loop-composer__segments">
          {Array.from({ length: loop.repeats }, (_, index) => {
            const x = PLOT.x + index * segmentWidth;
            const direction = loop.mode === 'ping-pong' && index % 2 === 1 ? -1 : 1;
            const inset = Math.min(8, segmentWidth * 0.22);
            const pathStart = direction === 1 ? x + inset : x + segmentWidth - inset;
            const pathEnd = direction === 1 ? x + segmentWidth - inset : x + inset;
            const holdWidth = Math.max(1, (segmentWidth - inset * 2) * loop.hold);
            const holdX = direction === 1 ? pathEnd - holdWidth : pathEnd;
            const arrowX = direction === 1 ? pathEnd - holdWidth - 4 : pathEnd + holdWidth + 4;
            const arrowPoints =
              direction === 1
                ? `${arrowX - 3.5},${PLOT.y + PLOT.height / 2 - 3} ${arrowX + 3.5},${PLOT.y + PLOT.height / 2} ${arrowX - 3.5},${PLOT.y + PLOT.height / 2 + 3}`
                : `${arrowX + 3.5},${PLOT.y + PLOT.height / 2 - 3} ${arrowX - 3.5},${PLOT.y + PLOT.height / 2} ${arrowX + 3.5},${PLOT.y + PLOT.height / 2 + 3}`;
            return (
              <g
                className="fk-loop-composer__segment"
                data-reverse={direction === -1 || undefined}
                key={index}
              >
                {index > 0 && (
                  <path
                    className="fk-loop-composer__segment-divider"
                    d={`M${x} ${PLOT.y - 3}V${PLOT.y + PLOT.height + 3}`}
                  />
                )}
                <path d={`M${pathStart} ${PLOT.y + PLOT.height / 2}H${pathEnd}`} />
                {loop.hold > 0 && (
                  <rect
                    className="fk-loop-composer__hold"
                    x={holdX}
                    y={PLOT.y + PLOT.height + 4}
                    width={holdWidth}
                    height="2"
                    rx="1"
                  />
                )}
                <polygon className="fk-loop-composer__arrow" points={arrowPoints} />
              </g>
            );
          })}
        </g>
        {loop.seamless ? (
          <path
            className="fk-loop-composer__seam"
            d={`M${PLOT.x} ${PLOT.y + PLOT.height + 9}H${PLOT.x + PLOT.width}`}
          />
        ) : (
          <g className="fk-loop-composer__open-endpoints">
            <circle cx={PLOT.x} cy={PLOT.y + PLOT.height + 9} r="1.75" />
            <circle cx={PLOT.x + PLOT.width} cy={PLOT.y + PLOT.height + 9} r="1.75" />
          </g>
        )}
        <g className="fk-loop-composer__offset" data-dragging={draggingOffset || undefined}>
          <path d={`M${offsetX} ${OFFSET_Y + 4}V${PLOT.y + PLOT.height + 9}`} />
          <circle cx={offsetX} cy={OFFSET_Y} r="4" />
          <circle className="fk-loop-composer__offset-core" cx={offsetX} cy={OFFSET_Y} r="1.25" />
        </g>
        <rect
          className="fk-loop-composer__offset-interaction"
          x={PLOT.x}
          y="1"
          width={PLOT.width}
          height={PLOT.y + PLOT.height + 14}
          role={canEdit ? 'slider' : undefined}
          tabIndex={canEdit ? 0 : undefined}
          aria-label="Loop offset"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(loop.offset * 100)}
          aria-valuetext={`${formatPercent(loop.offset)} offset. Drag horizontally or use arrow keys to adjust.`}
          onPointerDown={handleOffsetPointerDown}
          onPointerMove={handleOffsetPointerMove}
          onPointerUp={stopOffsetDragging}
          onPointerCancel={stopOffsetDragging}
          onKeyDown={handleOffsetKeyDown}
        />
      </svg>

      <div className="fk-loop-composer__controls">
        <label className="fk-loop-composer__field">
          <span>Cycles</span>
          <input
            type="range"
            min={minRepeats}
            max={maxRepeats}
            step="1"
            value={loop.repeats}
            disabled={!canEdit}
            aria-label="Repeat count"
            style={
              {
                '--fk-loop-composer-progress': `${((loop.repeats - minRepeats) / Math.max(maxRepeats - minRepeats, 1)) * 100}%`,
              } as CSSProperties
            }
            onChange={(event) => update({ repeats: Number(event.target.value) })}
          />
          <output>{loop.repeats}×</output>
        </label>
        <label className="fk-loop-composer__field">
          <span>Hold</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={loop.hold}
            disabled={!canEdit}
            aria-label="Loop hold"
            style={{ '--fk-loop-composer-progress': `${loop.hold * 100}%` } as CSSProperties}
            onChange={(event) => update({ hold: Number(event.target.value) })}
          />
          <output>{formatPercent(loop.hold)}</output>
        </label>
        <label className="fk-loop-composer__field">
          <span>Offset</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={loop.offset}
            disabled={!canEdit}
            aria-label="Loop offset value"
            style={{ '--fk-loop-composer-progress': `${loop.offset * 100}%` } as CSSProperties}
            onChange={(event) => update({ offset: Number(event.target.value) })}
          />
          <output>{formatPercent(loop.offset)}</output>
        </label>
      </div>
    </div>
  );
});
