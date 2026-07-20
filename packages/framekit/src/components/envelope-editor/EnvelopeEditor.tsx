import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface EnvelopeValue {
  /** Normalized attack duration. */
  attack: number;
  /** Normalized hold duration at peak level. */
  hold: number;
  /** Normalized decay duration. */
  decay: number;
  /** Sustained level from 0 to 1. */
  sustain: number;
  /** Normalized release duration. */
  release: number;
}

export type EnvelopeEditorDensity = 'default' | 'compact';
export type EnvelopeEditorVariant = 'default' | 'audio' | 'motion';

export interface EnvelopeEditorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled ADSR-style envelope values. */
  value?: EnvelopeValue;
  /** Initial envelope when uncontrolled. */
  defaultValue?: EnvelopeValue;
  /** Called with the next envelope after a direct adjustment. */
  onValueChange?: (value: EnvelopeValue) => void;
  /** Visual treatment for general, audio, or motion tools. @default 'default' */
  variant?: EnvelopeEditorVariant;
  /** Compresses the editor for inspector-width compositions. @default 'default' */
  density?: EnvelopeEditorDensity;
  /** Enables direct manipulation and keyboard adjustment. @default true */
  editable?: boolean;
  /** Disables direct manipulation and mutes the editor. @default false */
  disabled?: boolean;
  /** Arrow-key increment. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible editor name. @default 'Envelope editor' */
  label?: string;
}

type EnvelopeHandle = 'attack' | 'hold' | 'decay' | 'release';

const DEFAULT_VALUE: EnvelopeValue = {
  attack: 0.1,
  hold: 0.12,
  decay: 0.18,
  sustain: 0.62,
  release: 0.2,
};

const VIEWBOX = { width: 360, height: 128 };
const PLOT = { x: 10, y: 10, width: 340, height: 108 };
const MIN_SEGMENT = 0.02;
const MAX_DURATION = 0.94;

const HANDLE_LABELS: Record<EnvelopeHandle, string> = {
  attack: 'Attack end',
  hold: 'Hold end',
  decay: 'Decay end',
  release: 'Release start',
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseValue(value: EnvelopeValue): EnvelopeValue {
  const durations = {
    attack: clamp(value.attack, MIN_SEGMENT),
    hold: clamp(value.hold, MIN_SEGMENT),
    decay: clamp(value.decay, MIN_SEGMENT),
    release: clamp(value.release, MIN_SEGMENT),
  };
  const total = durations.attack + durations.hold + durations.decay + durations.release;
  const scale = total > MAX_DURATION ? MAX_DURATION / total : 1;

  return {
    attack: round(durations.attack * scale),
    hold: round(durations.hold * scale),
    decay: round(durations.decay * scale),
    sustain: round(clamp(value.sustain)),
    release: round(durations.release * scale),
  };
}

function pointsForEnvelope(value: EnvelopeValue) {
  const attackEnd = value.attack;
  const holdEnd = attackEnd + value.hold;
  const decayEnd = holdEnd + value.decay;
  const releaseStart = 1 - value.release;
  const toPoint = (x: number, y: number) => ({
    x: PLOT.x + x * PLOT.width,
    y: PLOT.y + (1 - y) * PLOT.height,
  });

  return {
    start: toPoint(0, 0),
    attack: toPoint(attackEnd, 1),
    hold: toPoint(holdEnd, 1),
    decay: toPoint(decayEnd, value.sustain),
    release: toPoint(releaseStart, value.sustain),
    end: toPoint(1, 0),
    normalized: { attackEnd, holdEnd, decayEnd, releaseStart },
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function snapPosition(value: number) {
  return round(Math.round(value / 0.05) * 0.05);
}

/**
 * A direct ADSR-style editor for audio, effects, and generative motion.
 * Drag the stage handles for timing and sustain level; hold Shift while dragging
 * to align timing points with the quiet 5% grid.
 */
export const EnvelopeEditor = forwardRef<HTMLDivElement, EnvelopeEditorProps>(
  function EnvelopeEditor(
    {
      value,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      variant = 'default',
      density = 'default',
      editable = true,
      disabled = false,
      step = 0.01,
      label = 'Envelope editor',
      className,
      ...props
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null);
    const draggingHandleRef = useRef<EnvelopeHandle | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
    const [draggingHandle, setDraggingHandle] = useState<EnvelopeHandle | null>(null);
    const envelope = normaliseValue(value ?? uncontrolledValue);
    const canEdit = editable && !disabled;
    const points = pointsForEnvelope(envelope);
    const curvePath = [
      `M${points.start.x} ${points.start.y}`,
      `L${points.attack.x} ${points.attack.y}`,
      `L${points.hold.x} ${points.hold.y}`,
      `L${points.decay.x} ${points.decay.y}`,
      `L${points.release.x} ${points.release.y}`,
      `L${points.end.x} ${points.end.y}`,
    ].join('');
    const areaPath = `${curvePath}L${points.start.x} ${points.start.y}Z`;
    const classes = [
      'fk-envelope-editor',
      `fk-envelope-editor--${variant}`,
      `fk-envelope-editor--${density}`,
      !canEdit && 'fk-envelope-editor--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setValue = useCallback(
      (nextValue: EnvelopeValue) => {
        const next = normaliseValue(nextValue);
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [onValueChange, value]
    );

    const pointFromPointer = useCallback((event: ReactPointerEvent<SVGGElement>) => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
      const x = ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width;
      const y = ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height;
      return {
        x: clamp((x - PLOT.x) / PLOT.width),
        y: clamp(1 - (y - PLOT.y) / PLOT.height),
      };
    }, []);

    const updateHandle = useCallback(
      (handle: EnvelopeHandle, point: { x: number; y: number }, snap = false) => {
        const x = snap ? snapPosition(point.x) : point.x;
        const { attackEnd, holdEnd, decayEnd, releaseStart } = points.normalized;
        let next = envelope;

        if (handle === 'attack') {
          next = { ...envelope, attack: clamp(x, MIN_SEGMENT, holdEnd - MIN_SEGMENT) };
        } else if (handle === 'hold') {
          next = {
            ...envelope,
            hold: clamp(x - attackEnd, MIN_SEGMENT, decayEnd - attackEnd - MIN_SEGMENT),
          };
        } else if (handle === 'decay') {
          next = {
            ...envelope,
            decay: clamp(x - holdEnd, MIN_SEGMENT, releaseStart - holdEnd - MIN_SEGMENT),
            sustain: point.y,
          };
        } else {
          next = {
            ...envelope,
            release: clamp(1 - x, MIN_SEGMENT, 1 - decayEnd - MIN_SEGMENT),
          };
        }

        setValue(next);
      },
      [envelope, points.normalized, setValue]
    );

    const handlePointerDown = (event: ReactPointerEvent<SVGGElement>, handle: EnvelopeHandle) => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingHandleRef.current = handle;
      setDraggingHandle(handle);
      const point = pointFromPointer(event);
      if (point) updateHandle(handle, point, event.shiftKey);
    };

    const handlePointerMove = (event: ReactPointerEvent<SVGGElement>, handle: EnvelopeHandle) => {
      if (!canEdit || draggingHandleRef.current !== handle) return;
      const point = pointFromPointer(event);
      if (point) updateHandle(handle, point, event.shiftKey);
    };

    const stopDragging = (event: ReactPointerEvent<SVGGElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingHandleRef.current = null;
      setDraggingHandle(null);
    };

    const handleKeyDown = (event: ReactKeyboardEvent<SVGGElement>, handle: EnvelopeHandle) => {
      if (!canEdit) return;
      const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
      const point =
        handle === 'attack'
          ? { x: points.normalized.attackEnd, y: 1 }
          : handle === 'hold'
            ? { x: points.normalized.holdEnd, y: 1 }
            : handle === 'decay'
              ? { x: points.normalized.decayEnd, y: envelope.sustain }
              : { x: points.normalized.releaseStart, y: envelope.sustain };
      let nextX = point.x;
      let nextY = point.y;

      if (event.key === 'ArrowLeft') nextX -= increment;
      else if (event.key === 'ArrowRight') nextX += increment;
      else if (event.key === 'ArrowDown' && (handle === 'decay' || handle === 'release')) {
        nextY -= increment;
      } else if (event.key === 'ArrowUp' && (handle === 'decay' || handle === 'release')) {
        nextY += increment;
      } else return;

      event.preventDefault();
      updateHandle(handle, { x: nextX, y: nextY });
    };

    const renderHandle = (handle: EnvelopeHandle, point: { x: number; y: number }) => {
      const duration = envelope[handle];
      const sustainDescription =
        handle === 'decay' || handle === 'release'
          ? ` Sustain ${formatPercent(envelope.sustain)}.`
          : '';
      return (
        <g
          className="fk-envelope-editor__handle"
          role="button"
          tabIndex={0}
          aria-label={`${HANDLE_LABELS[handle]}. ${formatPercent(duration)} duration.${sustainDescription} Use arrow keys to adjust.`}
          data-dragging={draggingHandle === handle || undefined}
          onPointerDown={(event) => handlePointerDown(event, handle)}
          onPointerMove={(event) => handlePointerMove(event, handle)}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onKeyDown={(event) => handleKeyDown(event, handle)}
        >
          <circle className="fk-envelope-editor__handle-hit" cx={point.x} cy={point.y} r="9" />
          <circle className="fk-envelope-editor__handle-focus" cx={point.x} cy={point.y} r="4.5" />
          <circle className="fk-envelope-editor__handle-outer" cx={point.x} cy={point.y} r="2.5" />
        </g>
      );
    };

    return (
      <div ref={ref} {...props} className={classes}>
        <svg
          ref={svgRef}
          className="fk-envelope-editor__canvas"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          role={canEdit ? 'group' : 'img'}
          aria-label={label}
          data-editable={canEdit || undefined}
          data-disabled={disabled || undefined}
        >
          <rect
            className="fk-envelope-editor__surface"
            x="0.5"
            y="0.5"
            width={VIEWBOX.width - 1}
            height={VIEWBOX.height - 1}
            rx="6"
          />
          <g className="fk-envelope-editor__grid" aria-hidden="true">
            {[1 / 3, 2 / 3].map((position) => {
              const x = PLOT.x + position * PLOT.width;
              const y = PLOT.y + (1 - position) * PLOT.height;
              return (
                <g key={position}>
                  <line x1={x} x2={x} y1={PLOT.y} y2={PLOT.y + PLOT.height} />
                  <line x1={PLOT.x} x2={PLOT.x + PLOT.width} y1={y} y2={y} />
                </g>
              );
            })}
          </g>
          <line
            className="fk-envelope-editor__baseline"
            x1={PLOT.x}
            x2={PLOT.x + PLOT.width}
            y1={PLOT.y + PLOT.height}
            y2={PLOT.y + PLOT.height}
            aria-hidden="true"
          />
          <path className="fk-envelope-editor__area" d={areaPath} aria-hidden="true" />
          <path className="fk-envelope-editor__curve" d={curvePath} aria-hidden="true" />
          {canEdit && (
            <g className="fk-envelope-editor__handles">
              {renderHandle('attack', points.attack)}
              {renderHandle('hold', points.hold)}
              {renderHandle('decay', points.decay)}
              {renderHandle('release', points.release)}
            </g>
          )}
        </svg>
      </div>
    );
  }
);
