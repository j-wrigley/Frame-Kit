import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type ModulationWaveform = 'sine' | 'triangle' | 'saw' | 'square';

export interface ModulationStripValue {
  /** Wave shape used by the looping modulation. */
  waveform: ModulationWaveform;
  /** Loop offset from 0 through 1, where 1 is one full turn. */
  phase: number;
  /** Loop cycles per second. */
  rate: number;
  /** Wave amplitude from 0 through 1. */
  intensity: number;
}

export interface ModulationStripProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled waveform, phase, rate, and intensity values. */
  value?: ModulationStripValue;
  /** Initial values when uncontrolled. */
  defaultValue?: ModulationStripValue;
  /** Called after direct phase or intensity adjustment. */
  onValueChange?: (value: ModulationStripValue) => void;
  /** Lowest accepted rate. @default 0.25 */
  minRate?: number;
  /** Highest accepted rate. @default 4 */
  maxRate?: number;
  /** Enables direct phase and intensity adjustment from the waveform. @default true */
  editable?: boolean;
  /** Disables direct adjustment and mutes the strip. @default false */
  disabled?: boolean;
  /** Arrow-key phase and intensity increment. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible name for the modulation preview. @default 'Modulation strip' */
  label?: string;
}

type Point = { x: number; y: number };

const DEFAULT_VALUE: ModulationStripValue = {
  waveform: 'sine',
  phase: 0.18,
  rate: 1.25,
  intensity: 0.72,
};
const VIEWBOX = { width: 360, height: 112 };
const PLOT = { x: 14, y: 14, width: 332, height: 76 };
const CENTRE_Y = PLOT.y + PLOT.height / 2;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseUnit(value: number) {
  const remainder = Number.isFinite(value) ? value % 1 : 0;
  return round(remainder < 0 ? remainder + 1 : remainder);
}

function normaliseValue(value: ModulationStripValue, minRate: number, maxRate: number) {
  const waveform: ModulationWaveform = ['sine', 'triangle', 'saw', 'square'].includes(
    value.waveform
  )
    ? value.waveform
    : DEFAULT_VALUE.waveform;
  return {
    waveform,
    phase: normaliseUnit(value.phase),
    rate: round(
      clamp(Number.isFinite(value.rate) ? value.rate : DEFAULT_VALUE.rate, minRate, maxRate)
    ),
    intensity: round(
      clamp(Number.isFinite(value.intensity) ? value.intensity : DEFAULT_VALUE.intensity, 0, 1)
    ),
  };
}

function waveformSample(waveform: ModulationWaveform, time: number) {
  const cycle = normaliseUnit(time);
  if (waveform === 'triangle') return 1 - 4 * Math.abs(cycle - 0.5);
  if (waveform === 'saw') return cycle * 2 - 1;
  if (waveform === 'square') return cycle < 0.5 ? 1 : -1;
  return Math.sin(cycle * Math.PI * 2);
}

function pointForSample(value: ModulationStripValue, progress: number): Point {
  const sample = waveformSample(value.waveform, progress * value.rate + value.phase);
  return {
    x: PLOT.x + progress * PLOT.width,
    y: CENTRE_Y - sample * value.intensity * (PLOT.height * 0.41),
  };
}

function waveformPath(value: ModulationStripValue) {
  const steps = 120;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const point = pointForSample(value, index / steps);
    return `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join('');
}

function formatPhase(value: number) {
  return `${Math.round(normaliseUnit(value) * 360)}°`;
}

function formatIntensity(value: number) {
  return `${Math.round(value * 100)}%`;
}

/**
 * A compact waveform preview for procedural motion and effects. It makes rate
 * visible through cycle density and lets a single handle directly adjust phase
 * and intensity, while applications retain ownership of waveform selection and
 * exact numeric inputs.
 */
export const ModulationStrip = forwardRef<HTMLDivElement, ModulationStripProps>(
  function ModulationStrip(
    {
      value,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      minRate: minRateProp = 0.25,
      maxRate: maxRateProp = 4,
      editable = true,
      disabled = false,
      step = 0.01,
      label = 'Modulation strip',
      className,
      ...props
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null);
    const draggingRef = useRef(false);
    const minRate = Math.max(0.01, Math.min(minRateProp, maxRateProp));
    const maxRate = Math.max(minRate, maxRateProp);
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      normaliseValue(defaultValue, minRate, maxRate)
    );
    const [isDragging, setIsDragging] = useState(false);
    const modulation = normaliseValue(value ?? uncontrolledValue, minRate, maxRate);
    const canEdit = editable && !disabled;
    const marker = pointForSample(modulation, modulation.phase);
    const path = waveformPath(modulation);
    const classes = ['fk-modulation-strip', !canEdit && 'fk-modulation-strip--readonly', className]
      .filter(Boolean)
      .join(' ');

    const setValue = useCallback(
      (nextValue: ModulationStripValue) => {
        const next = normaliseValue(nextValue, minRate, maxRate);
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [maxRate, minRate, onValueChange, value]
    );

    const pointFromPointer = useCallback((event: ReactPointerEvent<SVGGElement>): Point | null => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
      return {
        x: clamp(
          ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width,
          PLOT.x,
          PLOT.x + PLOT.width
        ),
        y: clamp(
          ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height,
          PLOT.y,
          PLOT.y + PLOT.height
        ),
      };
    }, []);

    const updateFromPoint = useCallback(
      (point: Point) => {
        const phase = (point.x - PLOT.x) / PLOT.width;
        const intensity = Math.abs((point.y - CENTRE_Y) / (PLOT.height * 0.41));
        setValue({ ...modulation, phase, intensity });
      },
      [modulation, setValue]
    );

    const handlePointerDown = (event: ReactPointerEvent<SVGGElement>) => {
      if (!canEdit || event.button !== 0) return;
      const point = pointFromPointer(event);
      if (!point) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      setIsDragging(true);
      updateFromPoint(point);
    };

    const handlePointerMove = (event: ReactPointerEvent<SVGGElement>) => {
      if (!canEdit || !draggingRef.current) return;
      const point = pointFromPointer(event);
      if (point) updateFromPoint(point);
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
      const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setValue({ ...modulation, phase: modulation.phase - increment });
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setValue({ ...modulation, phase: modulation.phase + increment });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setValue({ ...modulation, intensity: modulation.intensity - increment });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setValue({ ...modulation, intensity: modulation.intensity + increment });
      } else if (event.key === 'Home') {
        event.preventDefault();
        setValue({ ...modulation, phase: 0 });
      } else if (event.key === 'End') {
        event.preventDefault();
        setValue({ ...modulation, phase: 1 - Math.max(step, 0.001) });
      }
    };

    const rateTicks = Math.max(1, Math.min(6, Math.round(modulation.rate)));

    return (
      <div ref={ref} {...props} className={classes}>
        <svg
          ref={svgRef}
          className="fk-modulation-strip__canvas"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          role={canEdit ? 'group' : 'img'}
          aria-label={label}
          data-disabled={disabled || undefined}
        >
          <rect
            className="fk-modulation-strip__surface"
            x="0.5"
            y="0.5"
            width={VIEWBOX.width - 1}
            height={VIEWBOX.height - 1}
            rx="6"
          />
          <g className="fk-modulation-strip__guides" aria-hidden="true">
            <path d={`M${PLOT.x} ${CENTRE_Y - PLOT.height * 0.32}H${PLOT.x + PLOT.width}`} />
            <path d={`M${PLOT.x} ${CENTRE_Y}H${PLOT.x + PLOT.width}`} />
            <path d={`M${PLOT.x} ${CENTRE_Y + PLOT.height * 0.32}H${PLOT.x + PLOT.width}`} />
            {Array.from({ length: rateTicks - 1 }, (_, index) => {
              const x = PLOT.x + ((index + 1) / rateTicks) * PLOT.width;
              return <path key={x} d={`M${x} ${PLOT.y}V${PLOT.y + PLOT.height}`} />;
            })}
          </g>
          <path className="fk-modulation-strip__wave-shadow" d={path} aria-hidden="true" />
          <path className="fk-modulation-strip__wave" d={path} aria-hidden="true" />
          <g
            className="fk-modulation-strip__interaction"
            data-dragging={isDragging || undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <rect
              className="fk-modulation-strip__interaction-surface"
              x={PLOT.x}
              y={PLOT.y}
              width={PLOT.width}
              height={PLOT.height}
            />
            {canEdit && (
              <g
                className="fk-modulation-strip__handle"
                transform={`translate(${marker.x} ${marker.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${modulation.waveform} waveform. Phase ${formatPhase(modulation.phase)}, rate ${modulation.rate.toFixed(2)} hertz, intensity ${formatIntensity(modulation.intensity)}. Drag to adjust phase and intensity; use arrow keys for fine adjustment.`}
                onKeyDown={handleKeyDown}
              >
                <circle className="fk-modulation-strip__handle-hit" r="13" />
                <circle className="fk-modulation-strip__handle-focus" r="9" />
                <circle className="fk-modulation-strip__handle-outer" r="5.5" />
                <circle className="fk-modulation-strip__handle-center" r="1.75" />
              </g>
            )}
          </g>
          <g className="fk-modulation-strip__axis" aria-hidden="true">
            <text x={PLOT.x} y="104">
              0
            </text>
            <text x={PLOT.x + PLOT.width} y="104">
              {modulation.rate.toFixed(2)} Hz
            </text>
          </g>
        </svg>
      </div>
    );
  }
);
