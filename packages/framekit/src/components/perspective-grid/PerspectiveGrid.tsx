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

export interface PerspectivePoint {
  /** Horizontal position from 0 (left) to 1 (right). */
  x: number;
  /** Vertical position from 0 (top) to 1 (bottom). */
  y: number;
}

export interface PerspectiveCorners {
  topLeft: PerspectivePoint;
  topRight: PerspectivePoint;
  bottomRight: PerspectivePoint;
  bottomLeft: PerspectivePoint;
}

export interface PerspectiveGridValue extends PerspectiveCorners {
  /** Straightening rotation in degrees, from -45 to 45. */
  straighten: number;
  /** Horizontal keystone correction from -1 to 1. */
  horizontal: number;
  /** Vertical keystone correction from -1 to 1. */
  vertical: number;
}

export type PerspectiveGridDensity = 'default' | 'compact';

export interface PerspectiveGridProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled grid corners and correction values. */
  value?: PerspectiveGridValue;
  /** Initial grid corners and correction values when uncontrolled. */
  defaultValue?: PerspectiveGridValue;
  /** Called after a direct or slider-based perspective adjustment. */
  onValueChange?: (value: PerspectiveGridValue) => void;
  /** Shows the compact straighten and keystone correction controls. @default true */
  showControls?: boolean;
  /** Reduces grid and control spacing for dense inspector surfaces. @default 'default' */
  density?: PerspectiveGridDensity;
  /** Enables direct corner and correction adjustment. @default true */
  editable?: boolean;
  /** Disables interaction and mutes the component. @default false */
  disabled?: boolean;
  /** Arrow-key increment for a corner handle. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible component name. @default 'Perspective transform grid' */
  label?: string;
}

type Corner = keyof PerspectiveCorners;

const CORNERS: readonly Corner[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
const VIEWBOX = { width: 340, height: 190 };
const PLOT = { x: 6, y: 6, width: 328, height: 178 };
const GRID_DIVISIONS = 4;

const DEFAULT_VALUE: PerspectiveGridValue = {
  topLeft: { x: 0.11, y: 0.14 },
  topRight: { x: 0.89, y: 0.1 },
  bottomRight: { x: 0.94, y: 0.91 },
  bottomLeft: { x: 0.06, y: 0.93 },
  straighten: 0,
  horizontal: 0,
  vertical: 0,
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normalisePoint(point: PerspectivePoint): PerspectivePoint {
  return {
    x: round(clamp(Number.isFinite(point.x) ? point.x : 0.5, 0.035, 0.965)),
    y: round(clamp(Number.isFinite(point.y) ? point.y : 0.5, 0.035, 0.965)),
  };
}

function normaliseValue(value: PerspectiveGridValue): PerspectiveGridValue {
  return {
    topLeft: normalisePoint(value.topLeft),
    topRight: normalisePoint(value.topRight),
    bottomRight: normalisePoint(value.bottomRight),
    bottomLeft: normalisePoint(value.bottomLeft),
    straighten: round(clamp(Number.isFinite(value.straighten) ? value.straighten : 0, -45, 45)),
    horizontal: round(clamp(Number.isFinite(value.horizontal) ? value.horizontal : 0, -1, 1)),
    vertical: round(clamp(Number.isFinite(value.vertical) ? value.vertical : 0, -1, 1)),
  };
}

function toCanvasPoint(point: PerspectivePoint) {
  return { x: PLOT.x + point.x * PLOT.width, y: PLOT.y + point.y * PLOT.height };
}

function toNormalisedPoint(point: { x: number; y: number }): PerspectivePoint {
  return normalisePoint({
    x: (point.x - PLOT.x) / PLOT.width,
    y: (point.y - PLOT.y) / PLOT.height,
  });
}

function interpolate(
  first: PerspectivePoint,
  second: PerspectivePoint,
  amount: number
): PerspectivePoint {
  return {
    x: first.x + (second.x - first.x) * amount,
    y: first.y + (second.y - first.y) * amount,
  };
}

function rotatePoint(point: PerspectivePoint, degrees: number): PerspectivePoint {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const canvas = toCanvasPoint(point);
  const centreX = PLOT.x + PLOT.width / 2;
  const centreY = PLOT.y + PLOT.height / 2;
  return toNormalisedPoint({
    x: centreX + (canvas.x - centreX) * cosine - (canvas.y - centreY) * sine,
    y: centreY + (canvas.x - centreX) * sine + (canvas.y - centreY) * cosine,
  });
}

function applyStraighten(
  value: PerspectiveGridValue,
  nextStraighten: number
): PerspectiveGridValue {
  const delta = nextStraighten - value.straighten;
  return {
    ...value,
    topLeft: rotatePoint(value.topLeft, delta),
    topRight: rotatePoint(value.topRight, delta),
    bottomRight: rotatePoint(value.bottomRight, delta),
    bottomLeft: rotatePoint(value.bottomLeft, delta),
    straighten: nextStraighten,
  };
}

function applyHorizontal(
  value: PerspectiveGridValue,
  nextHorizontal: number
): PerspectiveGridValue {
  const delta = (nextHorizontal - value.horizontal) * 0.16;
  return {
    ...value,
    topLeft: normalisePoint({ ...value.topLeft, x: value.topLeft.x + delta }),
    topRight: normalisePoint({ ...value.topRight, x: value.topRight.x + delta }),
    bottomRight: normalisePoint({ ...value.bottomRight, x: value.bottomRight.x - delta }),
    bottomLeft: normalisePoint({ ...value.bottomLeft, x: value.bottomLeft.x - delta }),
    horizontal: nextHorizontal,
  };
}

function applyVertical(value: PerspectiveGridValue, nextVertical: number): PerspectiveGridValue {
  const delta = (nextVertical - value.vertical) * 0.16;
  return {
    ...value,
    topLeft: normalisePoint({ ...value.topLeft, y: value.topLeft.y + delta }),
    topRight: normalisePoint({ ...value.topRight, y: value.topRight.y - delta }),
    bottomRight: normalisePoint({ ...value.bottomRight, y: value.bottomRight.y - delta }),
    bottomLeft: normalisePoint({ ...value.bottomLeft, y: value.bottomLeft.y + delta }),
    vertical: nextVertical,
  };
}

function cornerName(corner: Corner) {
  return {
    topLeft: 'top left',
    topRight: 'top right',
    bottomRight: 'bottom right',
    bottomLeft: 'bottom left',
  }[corner];
}

function formatDegrees(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}°`;
}

function formatCorrection(value: number) {
  return `${value > 0 ? '+' : ''}${Math.round(value * 100)}`;
}

/**
 * A direct perspective correction field with four keystone handles and compact
 * straighten, horizontal, and vertical correction controls.
 */
export const PerspectiveGrid = forwardRef<HTMLDivElement, PerspectiveGridProps>(
  function PerspectiveGrid(
    {
      value,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      showControls = true,
      density = 'default',
      editable = true,
      disabled = false,
      step = 0.01,
      label = 'Perspective transform grid',
      className,
      ...props
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null);
    const draggingCornerRef = useRef<Corner | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
    const [draggingCorner, setDraggingCorner] = useState<Corner | null>(null);
    const transform = normaliseValue(value ?? uncontrolledValue);
    const canEdit = editable && !disabled;
    const classes = [
      'fk-perspective-grid',
      `fk-perspective-grid--${density}`,
      !canEdit && 'fk-perspective-grid--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setTransform = useCallback(
      (nextValue: PerspectiveGridValue) => {
        const next = normaliseValue(nextValue);
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [onValueChange, value]
    );

    const pointFromPointer = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
      return toNormalisedPoint({
        x: ((event.clientX - bounds.left) / bounds.width) * VIEWBOX.width,
        y: ((event.clientY - bounds.top) / bounds.height) * VIEWBOX.height,
      });
    }, []);

    const updateCornerFromPointer = useCallback(
      (event: ReactPointerEvent<SVGSVGElement>, corner: Corner) => {
        const point = pointFromPointer(event);
        if (point) setTransform({ ...transform, [corner]: point });
      },
      [pointFromPointer, setTransform, transform]
    );

    const startCornerDrag = (event: ReactPointerEvent<SVGGElement>, corner: Corner) => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      svgRef.current?.setPointerCapture(event.pointerId);
      draggingCornerRef.current = corner;
      setDraggingCorner(corner);
      updateCornerFromPointer(event as unknown as ReactPointerEvent<SVGSVGElement>, corner);
    };

    const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
      const corner = draggingCornerRef.current;
      if (!canEdit || corner == null) return;
      updateCornerFromPointer(event, corner);
    };

    const stopDragging = (event: ReactPointerEvent<SVGSVGElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingCornerRef.current = null;
      setDraggingCorner(null);
    };

    const handleCornerKeyDown = (event: ReactKeyboardEvent<SVGGElement>, corner: Corner) => {
      if (!canEdit) return;
      const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
      const current = transform[corner];
      let next = current;

      if (event.key === 'ArrowLeft') next = { ...current, x: current.x - increment };
      else if (event.key === 'ArrowRight') next = { ...current, x: current.x + increment };
      else if (event.key === 'ArrowUp') next = { ...current, y: current.y - increment };
      else if (event.key === 'ArrowDown') next = { ...current, y: current.y + increment };
      else if (event.key === 'Home') next = DEFAULT_VALUE[corner];
      else return;

      event.preventDefault();
      setTransform({ ...transform, [corner]: next });
    };

    const updateStraighten = (next: number) => setTransform(applyStraighten(transform, next));
    const updateHorizontal = (next: number) => setTransform(applyHorizontal(transform, next));
    const updateVertical = (next: number) => setTransform(applyVertical(transform, next));
    const corners = transform as PerspectiveCorners;
    const polygonPoints = CORNERS.map((corner) => {
      const point = toCanvasPoint(corners[corner]);
      return `${point.x},${point.y}`;
    }).join(' ');
    const verticalLines = Array.from({ length: GRID_DIVISIONS - 1 }, (_, index) => {
      const amount = (index + 1) / GRID_DIVISIONS;
      return [
        toCanvasPoint(interpolate(corners.topLeft, corners.topRight, amount)),
        toCanvasPoint(interpolate(corners.bottomLeft, corners.bottomRight, amount)),
      ];
    });
    const horizontalLines = Array.from({ length: GRID_DIVISIONS - 1 }, (_, index) => {
      const amount = (index + 1) / GRID_DIVISIONS;
      return [
        toCanvasPoint(interpolate(corners.topLeft, corners.bottomLeft, amount)),
        toCanvasPoint(interpolate(corners.topRight, corners.bottomRight, amount)),
      ];
    });

    const controls = [
      {
        label: 'Straighten',
        value: transform.straighten,
        min: -45,
        max: 45,
        step: 0.1,
        format: formatDegrees,
        onChange: updateStraighten,
      },
      {
        label: 'Horizontal',
        value: transform.horizontal,
        min: -1,
        max: 1,
        step: 0.01,
        format: formatCorrection,
        onChange: updateHorizontal,
      },
      {
        label: 'Vertical',
        value: transform.vertical,
        min: -1,
        max: 1,
        step: 0.01,
        format: formatCorrection,
        onChange: updateVertical,
      },
    ];

    return (
      <div ref={ref} {...props} className={classes} role="group" aria-label={label}>
        <svg
          ref={svgRef}
          className="fk-perspective-grid__canvas"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          aria-label={label}
          data-disabled={disabled || undefined}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <rect
            className="fk-perspective-grid__surface"
            x={PLOT.x}
            y={PLOT.y}
            width={PLOT.width}
            height={PLOT.height}
            rx="4"
          />
          <polygon className="fk-perspective-grid__field" points={polygonPoints} />
          <g className="fk-perspective-grid__lines" aria-hidden="true">
            {[...verticalLines, ...horizontalLines].map(([start, end], index) => (
              <line key={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            ))}
          </g>
          <polygon className="fk-perspective-grid__outline" points={polygonPoints} />
          {CORNERS.map((corner) => {
            const point = toCanvasPoint(corners[corner]);
            return (
              <g
                className="fk-perspective-grid__handle"
                data-dragging={draggingCorner === corner || undefined}
                key={corner}
                role="slider"
                tabIndex={canEdit ? 0 : undefined}
                aria-label={`${cornerName(corner)} keystone handle`}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={corners[corner].x}
                aria-valuetext={`${cornerName(corner)}. X ${corners[corner].x.toFixed(2)}, Y ${corners[corner].y.toFixed(2)}.`}
                aria-disabled={!canEdit || undefined}
                onPointerDown={(event) => startCornerDrag(event, corner)}
                onKeyDown={(event) => handleCornerKeyDown(event, corner)}
              >
                <rect
                  className="fk-perspective-grid__handle-hit"
                  x={point.x - 11}
                  y={point.y - 11}
                  width="22"
                  height="22"
                />
                <rect
                  className="fk-perspective-grid__handle-focus"
                  x={point.x - 5}
                  y={point.y - 5}
                  width="10"
                  height="10"
                  rx="1"
                />
                <rect
                  className="fk-perspective-grid__handle-square"
                  x={point.x - 2.75}
                  y={point.y - 2.75}
                  width="5.5"
                  height="5.5"
                  rx="0.5"
                />
              </g>
            );
          })}
        </svg>

        {showControls && (
          <div className="fk-perspective-grid__controls">
            {controls.map((control) => {
              const progress = ((control.value - control.min) / (control.max - control.min)) * 100;
              return (
                <label className="fk-perspective-grid__control" key={control.label}>
                  <span>{control.label}</span>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={control.value}
                    disabled={!canEdit}
                    aria-label={control.label}
                    aria-valuetext={control.format(control.value)}
                    style={
                      {
                        '--fk-perspective-grid-start': `${Math.min(progress, 50)}%`,
                        '--fk-perspective-grid-end': `${Math.max(progress, 50)}%`,
                      } as CSSProperties
                    }
                    onChange={(event) => control.onChange(Number(event.target.value))}
                  />
                  <output>{control.format(control.value)}</output>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
