import { forwardRef, useCallback, useMemo, useState, type HTMLAttributes } from 'react';
import { NumberInput } from '../input';

export interface SpringResponseValue {
  /** Object mass. Constrained from 0.1 through 8. */
  mass: number;
  /** Spring stiffness. Constrained from 1 through 600. */
  stiffness: number;
  /** Damping coefficient. Constrained from 0 through 100. */
  damping: number;
  /** Initial velocity in pixels per second. Constrained from -200 through 200. */
  velocity: number;
}

export type SpringResponseDensity = 'default' | 'compact';

export interface SpringResponseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue' | 'onChange'
> {
  /** Controlled physical spring values. */
  value?: SpringResponseValue;
  /** Initial physical spring values when uncontrolled. */
  defaultValue?: SpringResponseValue;
  /** Called whenever a built-in parameter field changes. */
  onValueChange?: (value: SpringResponseValue) => void;
  /** Overall graph and control density. @default 'default' */
  density?: SpringResponseDensity;
  /** Renders the four direct parameter fields. @default true */
  showControls?: boolean;
  /** Enables the built-in parameter fields. @default true */
  editable?: boolean;
  /** Disables the component and mutes its response. @default false */
  disabled?: boolean;
  /** Accessible response name. @default 'Spring response' */
  label?: string;
}

type SpringParameter = keyof SpringResponseValue;
type ResponsePoint = { time: number; value: number };

const VIEWBOX = { width: 360, height: 180 };
const PLOT = { x: 14, y: 14, width: 332, height: 120 };
const DEFAULT_VALUE: SpringResponseValue = {
  mass: 1,
  stiffness: 170,
  damping: 18,
  velocity: 0,
};

const PARAMETERS: readonly {
  key: SpringParameter;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}[] = [
  { key: 'mass', label: 'Mass', min: 0.1, max: 8, step: 0.1 },
  { key: 'stiffness', label: 'Stiffness', min: 1, max: 600, step: 1 },
  { key: 'damping', label: 'Damping', min: 0, max: 100, step: 1 },
  { key: 'velocity', label: 'Velocity', min: -200, max: 200, step: 1, suffix: 'PX/S' },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, precision = 1000) {
  return Math.round(value * precision) / precision;
}

function normaliseValue(value: SpringResponseValue | undefined): SpringResponseValue {
  return {
    mass: round(clamp(Number.isFinite(value?.mass) ? (value?.mass as number) : 1, 0.1, 8), 10),
    stiffness: round(
      clamp(Number.isFinite(value?.stiffness) ? (value?.stiffness as number) : 170, 1, 600)
    ),
    damping: round(
      clamp(Number.isFinite(value?.damping) ? (value?.damping as number) : 18, 0, 100)
    ),
    velocity: round(
      clamp(Number.isFinite(value?.velocity) ? (value?.velocity as number) : 0, -200, 200)
    ),
  };
}

function responseAt(time: number, spring: SpringResponseValue) {
  const naturalFrequency = Math.sqrt(spring.stiffness / spring.mass);
  const dampingRatio = spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
  const initialVelocity = spring.velocity / 100;

  if (dampingRatio < 0.999) {
    const dampedFrequency = naturalFrequency * Math.sqrt(1 - dampingRatio ** 2);
    const envelope = Math.exp(-dampingRatio * naturalFrequency * time);
    return (
      1 +
      envelope *
        (-Math.cos(dampedFrequency * time) +
          ((initialVelocity - dampingRatio * naturalFrequency) / dampedFrequency) *
            Math.sin(dampedFrequency * time))
    );
  }

  if (dampingRatio <= 1.001) {
    return (
      1 + (-1 + (initialVelocity - naturalFrequency) * time) * Math.exp(-naturalFrequency * time)
    );
  }

  const root = Math.sqrt(dampingRatio ** 2 - 1);
  const slowRoot = -naturalFrequency * (dampingRatio - root);
  const fastRoot = -naturalFrequency * (dampingRatio + root);
  const slowWeight = (initialVelocity + fastRoot) / (slowRoot - fastRoot);
  const fastWeight = -1 - slowWeight;
  return 1 + slowWeight * Math.exp(slowRoot * time) + fastWeight * Math.exp(fastRoot * time);
}

function estimateDuration(spring: SpringResponseValue) {
  const naturalFrequency = Math.sqrt(spring.stiffness / spring.mass);
  const dampingRatio = spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
  if (dampingRatio < 0.08) return 3.2;
  if (dampingRatio <= 1) return clamp(5 / (dampingRatio * naturalFrequency), 0.45, 3.2);
  const slowRoot = naturalFrequency * (dampingRatio - Math.sqrt(dampingRatio ** 2 - 1));
  return clamp(5 / Math.max(slowRoot, 0.01), 0.45, 3.2);
}

function responseData(spring: SpringResponseValue) {
  const duration = estimateDuration(spring);
  const points = Array.from({ length: 161 }, (_, index): ResponsePoint => {
    const time = (index / 160) * duration;
    return { time, value: responseAt(time, spring) };
  });
  const settleIndex = points.findIndex((_, index) =>
    points.slice(index).every((point) => Math.abs(point.value - 1) < 0.02)
  );
  const settlingTime = points[settleIndex >= 0 ? settleIndex : points.length - 1]?.time ?? duration;
  const peak = Math.max(...points.map((point) => point.value));
  const yMinimum = Math.min(-0.12, ...points.map((point) => point.value)) - 0.04;
  const yMaximum = Math.max(1.12, peak) + 0.04;
  return { duration, points, settlingTime, peak, yMinimum, yMaximum };
}

function pointForResponse(
  point: ResponsePoint,
  duration: number,
  yMinimum: number,
  yMaximum: number
) {
  return {
    x: PLOT.x + (point.time / duration) * PLOT.width,
    y: PLOT.y + ((yMaximum - point.value) / (yMaximum - yMinimum)) * PLOT.height,
  };
}

function formatMilliseconds(seconds: number) {
  return `${Math.round(seconds * 1000)} MS`;
}

function formatParameter(key: SpringParameter, value: number) {
  return key === 'mass' ? value.toFixed(1) : String(Math.round(value));
}

function responseCharacter(dampingRatio: number, overshoot: number) {
  if (dampingRatio < 0.96) return overshoot > 1 ? 'Bouncy' : 'Underdamped';
  if (dampingRatio <= 1.04) return 'Critical';
  return 'Overdamped';
}

/**
 * A physics-based spring editor for motion tools. It combines direct physical
 * parameters with a live, analytic settling preview, so design systems can
 * use one understandable model for natural interaction.
 */
export const SpringResponse = forwardRef<HTMLDivElement, SpringResponseProps>(
  function SpringResponse(
    {
      value,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      density = 'default',
      showControls = true,
      editable = true,
      disabled = false,
      label = 'Spring response',
      className,
      ...props
    },
    ref
  ) {
    const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
    const spring = normaliseValue(value ?? uncontrolledValue);
    const canEdit = editable && !disabled;
    const response = useMemo(
      () => responseData(spring),
      [spring.damping, spring.mass, spring.stiffness, spring.velocity]
    );
    const dampingRatio = spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
    const overshoot = Math.max(0, response.peak - 1) * 100;
    const graphPoints = response.points.map((point) =>
      pointForResponse(point, response.duration, response.yMinimum, response.yMaximum)
    );
    const graphPath = graphPoints
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      )
      .join('');
    const graphArea = `${graphPath}L${PLOT.x + PLOT.width} ${PLOT.y + PLOT.height}L${PLOT.x} ${PLOT.y + PLOT.height}Z`;
    const targetY = pointForResponse(
      { time: 0, value: 1 },
      response.duration,
      response.yMinimum,
      response.yMaximum
    ).y;
    const classes = [
      'fk-spring-response',
      `fk-spring-response--${density}`,
      !canEdit && 'fk-spring-response--readonly',
      disabled && 'fk-spring-response--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setSpring = useCallback(
      (nextValue: SpringResponseValue) => {
        const next = normaliseValue(nextValue);
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [onValueChange, value]
    );

    const updateParameter = (key: SpringParameter, nextValue: number) => {
      if (!Number.isFinite(nextValue) || !canEdit) return;
      setSpring({ ...spring, [key]: nextValue });
    };

    return (
      <div ref={ref} {...props} className={classes} aria-disabled={disabled || undefined}>
        <svg
          className="fk-spring-response__canvas"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          role="img"
          aria-label={`${label}. ${responseCharacter(dampingRatio, overshoot)} response, settles in ${formatMilliseconds(response.settlingTime)}, damping ratio ${dampingRatio.toFixed(2)}${overshoot > 0.5 ? `, ${overshoot.toFixed(1)}% overshoot` : ''}.`}
        >
          <rect
            className="fk-spring-response__surface"
            x="0.5"
            y="0.5"
            width={VIEWBOX.width - 1}
            height={VIEWBOX.height - 1}
            rx="4"
          />
          <g className="fk-spring-response__grid">
            {[0.25, 0.5, 0.75].map((position) => (
              <line
                key={position}
                x1={PLOT.x + PLOT.width * position}
                x2={PLOT.x + PLOT.width * position}
                y1={PLOT.y}
                y2={PLOT.y + PLOT.height}
              />
            ))}
          </g>
          <line
            className="fk-spring-response__target"
            x1={PLOT.x}
            x2={PLOT.x + PLOT.width}
            y1={targetY}
            y2={targetY}
          />
          <path className="fk-spring-response__area" d={graphArea} />
          <path className="fk-spring-response__curve" d={graphPath} />
          <g className="fk-spring-response__axis">
            <text x={PLOT.x} y="165">
              0 MS
            </text>
            <text x={PLOT.x + PLOT.width} y="165">
              {formatMilliseconds(response.duration)}
            </text>
          </g>
        </svg>

        <div className="fk-spring-response__summary" aria-live="polite">
          <span className="fk-tag">{responseCharacter(dampingRatio, overshoot)}</span>
          <output>{formatMilliseconds(response.settlingTime)} settle</output>
          <span>ζ {dampingRatio.toFixed(2)}</span>
          <span>{overshoot > 0.5 ? `${overshoot.toFixed(1)}% overshoot` : 'No overshoot'}</span>
        </div>

        {showControls && (
          <div className="fk-spring-response__controls">
            {PARAMETERS.map((parameter) => {
              const currentValue = spring[parameter.key];
              return (
                <NumberInput
                  key={parameter.key}
                  size="sm"
                  label={parameter.label}
                  suffix={parameter.suffix}
                  font="mono"
                  value={formatParameter(parameter.key, currentValue)}
                  disabled={!canEdit}
                  decrementDisabled={currentValue <= parameter.min}
                  incrementDisabled={currentValue >= parameter.max}
                  decrementLabel={`Decrease ${parameter.label}`}
                  incrementLabel={`Increase ${parameter.label}`}
                  onChange={(event) =>
                    updateParameter(parameter.key, Number.parseFloat(event.target.value))
                  }
                  onDecrement={() => updateParameter(parameter.key, currentValue - parameter.step)}
                  onIncrement={() => updateParameter(parameter.key, currentValue + parameter.step)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
