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

export interface ColorBalanceToneValue {
  /** Horizontal colour bias from -1 to 1. */
  x: number;
  /** Vertical colour bias from -1 to 1. */
  y: number;
}

export interface ColorBalanceValue {
  shadows: ColorBalanceToneValue;
  midtones: ColorBalanceToneValue;
  highlights: ColorBalanceToneValue;
  /** Shadow luminance adjustment from 0 to 2, where 1 is neutral. */
  lift: number;
  /** Midtone luminance adjustment from 0 to 2, where 1 is neutral. */
  gamma: number;
  /** Highlight luminance adjustment from 0 to 2, where 1 is neutral. */
  gain: number;
}

export type ColorBalanceDensity = 'default' | 'compact';

export interface ColorBalanceWheelsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled three-way colour balance and lift/gamma/gain values. */
  value?: ColorBalanceValue;
  /** Initial colour-balance values when uncontrolled. */
  defaultValue?: ColorBalanceValue;
  /** Called after a wheel or tonal control adjustment. */
  onValueChange?: (value: ColorBalanceValue) => void;
  /** Compact layout for dense inspector surfaces. @default 'default' */
  density?: ColorBalanceDensity;
  /** Enables wheel and tonal control interaction. @default true */
  editable?: boolean;
  /** Disables interaction and mutes the controls. @default false */
  disabled?: boolean;
  /** Arrow-key increment for wheel bias. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible component name. @default 'Color balance wheels' */
  label?: string;
}

type Tone = 'shadows' | 'midtones' | 'highlights';
type Level = 'lift' | 'gamma' | 'gain';

const TONES: readonly Tone[] = ['shadows', 'midtones', 'highlights'];
const LEVELS: readonly Level[] = ['lift', 'gamma', 'gain'];

const DEFAULT_VALUE: ColorBalanceValue = {
  shadows: { x: 0, y: 0 },
  midtones: { x: 0, y: 0 },
  highlights: { x: 0, y: 0 },
  lift: 1,
  gamma: 1,
  gain: 1,
};

function clamp(value: number, minimum = -1, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseTone(value: ColorBalanceToneValue): ColorBalanceToneValue {
  const x = clamp(value.x);
  const y = clamp(value.y);
  const magnitude = Math.hypot(x, y);
  const scale = magnitude > 1 ? 1 / magnitude : 1;
  return { x: round(x * scale), y: round(y * scale) };
}

function normaliseValue(value: ColorBalanceValue): ColorBalanceValue {
  return {
    shadows: normaliseTone(value.shadows),
    midtones: normaliseTone(value.midtones),
    highlights: normaliseTone(value.highlights),
    lift: round(clamp(value.lift, 0, 2)),
    gamma: round(clamp(value.gamma, 0, 2)),
    gain: round(clamp(value.gain, 0, 2)),
  };
}

function snapTone(value: ColorBalanceToneValue): ColorBalanceToneValue {
  const magnitude = Math.hypot(value.x, value.y);
  if (magnitude < 0.12) return { x: 0, y: 0 };
  const angle = Math.atan2(value.y, value.x);
  const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
  const snappedMagnitude = Math.min(1, Math.round(magnitude / 0.25) * 0.25);
  return normaliseTone({
    x: Math.cos(snappedAngle) * snappedMagnitude,
    y: Math.sin(snappedAngle) * snappedMagnitude,
  });
}

function formatBias(value: ColorBalanceToneValue) {
  return `X ${value.x.toFixed(2)}, Y ${value.y.toFixed(2)}`;
}

/**
 * A three-way colour balance editor for tonal grading. Each wheel carries a
 * neutral centre and direct two-axis chroma bias. Lift, Gamma, and Gain stay
 * nearby as independent luminance controls for the matching tonal ranges.
 */
export const ColorBalanceWheels = forwardRef<HTMLDivElement, ColorBalanceWheelsProps>(
  function ColorBalanceWheels(
    {
      value,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      density = 'default',
      editable = true,
      disabled = false,
      step = 0.01,
      label = 'Color balance wheels',
      className,
      ...props
    },
    ref
  ) {
    const wheelRefs = useRef<Partial<Record<Tone, HTMLDivElement | null>>>({});
    const draggingToneRef = useRef<Tone | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
    const [draggingTone, setDraggingTone] = useState<Tone | null>(null);
    const balance = normaliseValue(value ?? uncontrolledValue);
    const canEdit = editable && !disabled;
    const classes = [
      'fk-color-balance',
      `fk-color-balance--${density}`,
      !canEdit && 'fk-color-balance--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setValue = useCallback(
      (nextValue: ColorBalanceValue) => {
        const next = normaliseValue(nextValue);
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [onValueChange, value]
    );

    const updateTone = useCallback(
      (tone: Tone, nextTone: ColorBalanceToneValue, snap = false) => {
        setValue({ ...balance, [tone]: snap ? snapTone(nextTone) : normaliseTone(nextTone) });
      },
      [balance, setValue]
    );

    const updateToneFromPointer = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>, tone: Tone) => {
        const bounds = wheelRefs.current[tone]?.getBoundingClientRect();
        if (!bounds || bounds.width === 0 || bounds.height === 0) return;
        const radius = Math.min(bounds.width, bounds.height) / 2;
        updateTone(
          tone,
          {
            x: (event.clientX - (bounds.left + bounds.width / 2)) / radius,
            y: (bounds.top + bounds.height / 2 - event.clientY) / radius,
          },
          event.shiftKey
        );
      },
      [updateTone]
    );

    const handleWheelPointerDown = (event: ReactPointerEvent<HTMLDivElement>, tone: Tone) => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingToneRef.current = tone;
      setDraggingTone(tone);
      event.currentTarget.focus();
      updateToneFromPointer(event, tone);
    };

    const handleWheelPointerMove = (event: ReactPointerEvent<HTMLDivElement>, tone: Tone) => {
      if (!canEdit || draggingToneRef.current !== tone) return;
      updateToneFromPointer(event, tone);
    };

    const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingToneRef.current = null;
      setDraggingTone(null);
    };

    const handleWheelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, tone: Tone) => {
      if (!canEdit) return;
      const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
      const current = balance[tone];
      let next = current;

      if (event.key === 'ArrowLeft') next = { ...current, x: current.x - increment };
      else if (event.key === 'ArrowRight') next = { ...current, x: current.x + increment };
      else if (event.key === 'ArrowDown') next = { ...current, y: current.y - increment };
      else if (event.key === 'ArrowUp') next = { ...current, y: current.y + increment };
      else if (event.key === 'Home') next = { x: 0, y: 0 };
      else return;

      event.preventDefault();
      updateTone(tone, next);
    };

    const updateLevel = (level: Level, nextLevel: number) => {
      setValue({ ...balance, [level]: nextLevel });
    };

    const renderWheel = (tone: Tone) => {
      const toneValue = balance[tone];
      return (
        <div className="fk-color-balance__tone" key={tone}>
          <div
            ref={(node) => {
              wheelRefs.current[tone] = node;
            }}
            className="fk-color-balance__wheel"
            role="slider"
            tabIndex={canEdit ? 0 : undefined}
            aria-label={`${tone} color balance`}
            aria-valuemin={-1}
            aria-valuemax={1}
            aria-valuenow={toneValue.x}
            aria-valuetext={`${tone} color balance. ${formatBias(toneValue)}. Use arrow keys to adjust.`}
            aria-disabled={!canEdit || undefined}
            data-dragging={draggingTone === tone || undefined}
            data-disabled={disabled || undefined}
            style={
              {
                '--fk-color-balance-x': `${50 + toneValue.x * 45}%`,
                '--fk-color-balance-y': `${50 - toneValue.y * 45}%`,
              } as CSSProperties
            }
            onPointerDown={(event) => handleWheelPointerDown(event, tone)}
            onPointerMove={(event) => handleWheelPointerMove(event, tone)}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onKeyDown={(event) => handleWheelKeyDown(event, tone)}
          >
            <span
              className="fk-color-balance__axis fk-color-balance__axis--horizontal"
              aria-hidden="true"
            />
            <span
              className="fk-color-balance__axis fk-color-balance__axis--vertical"
              aria-hidden="true"
            />
            <span className="fk-color-balance__neutral" aria-hidden="true" />
            <span className="fk-color-balance__handle" aria-hidden="true" />
          </div>
          <span className="fk-color-balance__tone-label">{tone}</span>
        </div>
      );
    };

    return (
      <div ref={ref} {...props} className={classes} role="group" aria-label={label}>
        <div className="fk-color-balance__wheels">{TONES.map(renderWheel)}</div>
        <div className="fk-color-balance__levels">
          {LEVELS.map((level) => {
            const levelValue = balance[level];
            return (
              <label className="fk-color-balance__level" key={level}>
                <span>{level}</span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={levelValue}
                  disabled={!canEdit}
                  aria-label={level}
                  style={
                    {
                      '--fk-color-balance-level-start': `${Math.min(levelValue / 2, 0.5) * 100}%`,
                      '--fk-color-balance-level-end': `${Math.max(levelValue / 2, 0.5) * 100}%`,
                    } as CSSProperties
                  }
                  onChange={(event) => updateLevel(level, Number(event.target.value))}
                />
                <output>{levelValue.toFixed(2)}</output>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
);
