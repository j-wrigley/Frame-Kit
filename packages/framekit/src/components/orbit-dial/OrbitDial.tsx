import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface OrbitDialValue {
  /** Horizontal orbit angle in degrees. 0° points north and values wrap at 360°. */
  yaw: number;
  /** Vertical orbit angle in degrees from -90° to 90°. */
  elevation: number;
}

export type OrbitDialSize = 'sm' | 'md' | 'lg';
export type OrbitDialVariant = 'camera' | 'light';

export interface OrbitDialProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled yaw and elevation angles. */
  value?: OrbitDialValue;
  /** Initial yaw and elevation when uncontrolled. @default { yaw: 42, elevation: 18 } */
  defaultValue?: OrbitDialValue;
  /** Called with the next orbit position after a direct adjustment. */
  onValueChange?: (value: OrbitDialValue) => void;
  /** Display size. @default 'md' */
  size?: OrbitDialSize;
  /** Visual treatment for camera or directional-light controls. @default 'camera' */
  variant?: OrbitDialVariant;
  /** Enables direct compass adjustment and keyboard controls. @default true */
  editable?: boolean;
  /** Disables direct adjustment and mutes the dial. @default false */
  disabled?: boolean;
  /** Increment used by Arrow keys. Hold Shift for five increments. @default 1 */
  step?: number;
  /** Human-readable yaw axis name. @default 'Yaw' */
  yawLabel?: string;
  /** Human-readable elevation axis name. @default 'Elevation' */
  elevationLabel?: string;
  /** Accessible dial name. @default 'Orbit dial' */
  label?: string;
}

const DEFAULT_VALUE: OrbitDialValue = { yaw: 42, elevation: 18 };
const CENTER = 120;
const RING_RADIUS = 82;
const VIEWBOX_SIZE = 240;

const CARDINALS = [
  { label: 'N', yaw: 0 },
  { label: 'E', yaw: 90 },
  { label: 'S', yaw: 180 },
  { label: 'W', yaw: 270 },
];

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function normaliseYaw(value: number) {
  const wrapped = value % 360;
  return round(wrapped < 0 ? wrapped + 360 : wrapped);
}

function snapYaw(value: number, increment: number) {
  return normaliseYaw(Math.round(value / increment) * increment);
}

function clampElevation(value: number) {
  return round(Math.min(90, Math.max(-90, value)));
}

function normaliseValue(value: OrbitDialValue): OrbitDialValue {
  return {
    yaw: normaliseYaw(value.yaw),
    elevation: clampElevation(value.elevation),
  };
}

function pointForYaw(yaw: number, radius = RING_RADIUS) {
  const angle = (yaw * Math.PI) / 180;
  return {
    x: CENTER + Math.sin(angle) * radius,
    y: CENTER - Math.cos(angle) * radius,
  };
}

function yawFromPoint(point: { x: number; y: number }) {
  const angle = (Math.atan2(point.x - CENTER, CENTER - point.y) * 180) / Math.PI;
  return normaliseYaw(angle);
}

function formatDegrees(value: number, signed = false) {
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${Math.round(value)}°`;
}

/**
 * A compass-style yaw and elevation control for cameras, lights, and directional creative tools.
 * Drag anywhere around the ring to set yaw; Arrow Up and Arrow Down adjust elevation.
 */
export const OrbitDial = forwardRef<HTMLDivElement, OrbitDialProps>(function OrbitDial(
  {
    value,
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    size = 'md',
    variant = 'camera',
    editable = true,
    disabled = false,
    step = 1,
    yawLabel = 'Yaw',
    elevationLabel = 'Elevation',
    label = 'Orbit dial',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
  const [isDragging, setIsDragging] = useState(false);
  const orbit = normaliseValue(value ?? uncontrolledValue);
  const canEdit = editable && !disabled;
  const handle = pointForYaw(orbit.yaw);
  const classes = [
    'fk-orbit-dial',
    `fk-orbit-dial--${size}`,
    `fk-orbit-dial--${variant}`,
    !canEdit && 'fk-orbit-dial--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const setValue = useCallback(
    (nextValue: OrbitDialValue) => {
      const next = normaliseValue(nextValue);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [onValueChange, value]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * VIEWBOX_SIZE,
      y: ((event.clientY - bounds.top) / bounds.height) * VIEWBOX_SIZE,
    };
  }, []);

  const updateYawFromPointer = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const point = pointFromPointer(event);
      if (!point) return;
      const yaw = yawFromPoint(point);
      setValue({ ...orbit, yaw: event.shiftKey ? snapYaw(yaw, 15) : yaw });
    },
    [orbit, pointFromPointer, setValue]
  );

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    updateYawFromPointer(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!canEdit || !draggingRef.current) return;
    updateYawFromPointer(event);
  };

  const stopDragging = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = false;
    setIsDragging(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    if (!canEdit) return;
    const increment = Math.max(step, 0.1) * (event.shiftKey ? 5 : 1);
    let nextYaw = orbit.yaw;
    let nextElevation = orbit.elevation;

    if (event.key === 'ArrowLeft') nextYaw -= increment;
    else if (event.key === 'ArrowRight') nextYaw += increment;
    else if (event.key === 'ArrowDown') nextElevation -= increment;
    else if (event.key === 'ArrowUp') nextElevation += increment;
    else if (event.key === 'Home') nextYaw = 0;
    else if (event.key === 'End') nextYaw = 180;
    else return;

    event.preventDefault();
    setValue({ yaw: nextYaw, elevation: nextElevation });
  };

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-orbit-dial__canvas"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        role={canEdit ? 'slider' : 'img'}
        tabIndex={canEdit ? 0 : undefined}
        aria-label={label}
        aria-valuemin={canEdit ? 0 : undefined}
        aria-valuemax={canEdit ? 359 : undefined}
        aria-valuenow={canEdit ? Math.round(orbit.yaw) : undefined}
        aria-valuetext={
          canEdit
            ? `${yawLabel} ${formatDegrees(orbit.yaw)}, ${elevationLabel} ${formatDegrees(orbit.elevation, true)}. Use left and right arrow keys for ${yawLabel.toLowerCase()}, up and down for ${elevationLabel.toLowerCase()}. Hold Shift while dragging to snap ${yawLabel.toLowerCase()} to compass ticks.`
            : undefined
        }
        data-editable={canEdit || undefined}
        data-disabled={disabled || undefined}
        data-dragging={isDragging || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={handleKeyDown}
      >
        <circle className="fk-orbit-dial__surface" cx={CENTER} cy={CENTER} r={112} />
        {variant === 'light' && (
          <circle className="fk-orbit-dial__light-wash" cx={CENTER} cy={CENTER} r={58} />
        )}
        <circle className="fk-orbit-dial__ring" cx={CENTER} cy={CENTER} r={RING_RADIUS} />
        <circle className="fk-orbit-dial__inner-ring" cx={CENTER} cy={CENTER} r={54} />

        <g className="fk-orbit-dial__ticks" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => {
            const yaw = index * 15;
            const outer = pointForYaw(yaw, index % 6 === 0 ? 91 : 87);
            const inner = pointForYaw(yaw, index % 6 === 0 ? 80 : 83);
            return (
              <line
                className="fk-orbit-dial__tick"
                data-major={index % 6 === 0 || undefined}
                x1={inner.x}
                x2={outer.x}
                y1={inner.y}
                y2={outer.y}
                key={yaw}
              />
            );
          })}
        </g>

        <g className="fk-orbit-dial__cardinals" aria-hidden="true">
          {CARDINALS.map((cardinal) => {
            const point = pointForYaw(cardinal.yaw, 104);
            return (
              <text x={point.x} y={point.y} key={cardinal.label}>
                {cardinal.label}
              </text>
            );
          })}
        </g>

        <line
          className="fk-orbit-dial__spoke"
          x1={CENTER}
          x2={handle.x}
          y1={CENTER}
          y2={handle.y}
          aria-hidden="true"
        />
        {variant === 'light' && (
          <g
            className="fk-orbit-dial__light-rays"
            transform={`translate(${handle.x} ${handle.y})`}
            aria-hidden="true"
          >
            <line x1="0" x2="0" y1="-15" y2="-10" />
            <line x1="0" x2="0" y1="10" y2="15" />
            <line x1="-15" x2="-10" y1="0" y2="0" />
            <line x1="10" x2="15" y1="0" y2="0" />
          </g>
        )}
        <circle className="fk-orbit-dial__handle-halo" cx={handle.x} cy={handle.y} r={11} />
        <circle className="fk-orbit-dial__handle" cx={handle.x} cy={handle.y} r={5.5} />

        <circle className="fk-orbit-dial__readout-disc" cx={CENTER} cy={CENTER} r={37} />
        <g className="fk-orbit-dial__readout" aria-hidden="true">
          <text x={CENTER} y={106}>
            {elevationLabel}
          </text>
          <text className="fk-orbit-dial__elevation-value" x={CENTER} y={126}>
            {formatDegrees(orbit.elevation, true)}
          </text>
          <text className="fk-orbit-dial__yaw-value" x={CENTER} y={142}>
            {yawLabel} {formatDegrees(orbit.yaw)}
          </text>
        </g>
      </svg>
    </div>
  );
});
