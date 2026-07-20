import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export interface FocusCropValue {
  /** Crop origin from 0 (left/top) to 1 (right/bottom). */
  x: number;
  y: number;
  /** Crop size as a fraction of the available image. */
  width: number;
  height: number;
}

export interface FocusCropFocalPoint {
  /** Horizontal focal point inside the crop from 0 (left) to 1 (right). */
  x: number;
  /** Vertical focal point inside the crop from 0 (top) to 1 (bottom). */
  y: number;
}

export interface FocusCropProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled crop rectangle. All values are constrained to the visible image. */
  value?: FocusCropValue;
  /** Initial crop rectangle when uncontrolled. */
  defaultValue?: FocusCropValue;
  /** Called with the next crop rectangle after moving or resizing the frame. */
  onValueChange?: (value: FocusCropValue) => void;
  /** Controlled focal point relative to the crop rectangle. */
  focalPoint?: FocusCropFocalPoint;
  /** Initial focal point when uncontrolled. @default { x: 0.5, y: 0.5 } */
  defaultFocalPoint?: FocusCropFocalPoint;
  /** Called with the next focal point after direct adjustment. */
  onFocalPointChange?: (value: FocusCropFocalPoint) => void;
  /** Ratio to preserve while resizing, expressed as width / height. Pass null for free crop. @default 16 / 9 */
  aspectRatio?: number | null;
  /** Preserves `aspectRatio` while dragging a corner. @default true */
  aspectLocked?: boolean;
  /** Draws two nested title/action safe-area guides inside the crop. @default true */
  showSafeArea?: boolean;
  /** Safe-area inset as a fraction of the crop. @default 0.1 */
  safeAreaInset?: number;
  /** Enables frame movement, resizing, and focal-point placement. @default true */
  editable?: boolean;
  /** Disables direct manipulation and mutes the field. @default false */
  disabled?: boolean;
  /** Arrow-key increment. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Accessible name for the crop field. @default 'Focus and crop region' */
  label?: string;
}

type CropHandle = 'nw' | 'ne' | 'se' | 'sw';
type DragState =
  | { kind: 'frame'; startPoint: Point; startCrop: FocusCropValue }
  | { kind: 'resize'; handle: CropHandle; startPoint: Point; startCrop: FocusCropValue }
  | { kind: 'focal'; startCrop: FocusCropValue }
  | null;

type Point = { x: number; y: number };

const DEFAULT_VALUE: FocusCropValue = { x: 0.11, y: 0.11, width: 0.78, height: 0.72 };
const DEFAULT_FOCAL_POINT: FocusCropFocalPoint = { x: 0.5, y: 0.5 };
const VIEWBOX = { width: 320, height: 200 };
const PLOT = { x: 12, y: 12, width: 296, height: 176 };
const MIN_SIZE = 0.12;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function validAspectRatio(value: number | null | undefined) {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

function normaliseFreeCrop(value: FocusCropValue): FocusCropValue {
  const width = clamp(
    Number.isFinite(value.width) ? value.width : DEFAULT_VALUE.width,
    MIN_SIZE,
    1
  );
  const height = clamp(
    Number.isFinite(value.height) ? value.height : DEFAULT_VALUE.height,
    MIN_SIZE,
    1
  );
  return {
    x: round(clamp(Number.isFinite(value.x) ? value.x : DEFAULT_VALUE.x, 0, 1 - width)),
    y: round(clamp(Number.isFinite(value.y) ? value.y : DEFAULT_VALUE.y, 0, 1 - height)),
    width: round(width),
    height: round(height),
  };
}

function normaliseCrop(value: FocusCropValue, aspectRatio: number | null, aspectLocked: boolean) {
  const freeCrop = normaliseFreeCrop(value);
  if (!aspectLocked || aspectRatio == null) return freeCrop;

  const ratioFactor = PLOT.width / PLOT.height / aspectRatio;
  const centreX = freeCrop.x + freeCrop.width / 2;
  const centreY = freeCrop.y + freeCrop.height / 2;
  const maxWidth = Math.min(1, 1 / ratioFactor);
  const minWidth = Math.min(maxWidth, Math.max(MIN_SIZE, MIN_SIZE / ratioFactor));
  const width = clamp(freeCrop.width, minWidth, maxWidth);
  const height = width * ratioFactor;

  return {
    x: round(clamp(centreX - width / 2, 0, 1 - width)),
    y: round(clamp(centreY - height / 2, 0, 1 - height)),
    width: round(width),
    height: round(height),
  };
}

function normaliseFocalPoint(value: FocusCropFocalPoint): FocusCropFocalPoint {
  return {
    x: round(clamp(Number.isFinite(value.x) ? value.x : DEFAULT_FOCAL_POINT.x)),
    y: round(clamp(Number.isFinite(value.y) ? value.y : DEFAULT_FOCAL_POINT.y)),
  };
}

function toCanvasRect(value: FocusCropValue) {
  return {
    x: PLOT.x + value.x * PLOT.width,
    y: PLOT.y + value.y * PLOT.height,
    width: value.width * PLOT.width,
    height: value.height * PLOT.height,
  };
}

function formatCoordinate(value: number) {
  return round(value).toFixed(2);
}

function handleName(handle: CropHandle) {
  return {
    nw: 'top left',
    ne: 'top right',
    se: 'bottom right',
    sw: 'bottom left',
  }[handle];
}

function cornerForHandle(rect: ReturnType<typeof toCanvasRect>, handle: CropHandle) {
  if (handle === 'nw') return { x: rect.x, y: rect.y };
  if (handle === 'ne') return { x: rect.x + rect.width, y: rect.y };
  if (handle === 'se') return { x: rect.x + rect.width, y: rect.y + rect.height };
  return { x: rect.x, y: rect.y + rect.height };
}

/**
 * A compact crop-and-focus editor for media, layout, and camera inspectors. The
 * crop is bounded by the visible image; optional aspect lock, safe areas, and a
 * separate focal point make the component useful without becoming an image editor.
 */
export const FocusCrop = forwardRef<HTMLDivElement, FocusCropProps>(function FocusCrop(
  {
    value,
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    focalPoint,
    defaultFocalPoint = DEFAULT_FOCAL_POINT,
    onFocalPointChange,
    aspectRatio: aspectRatioProp = 16 / 9,
    aspectLocked = true,
    showSafeArea = true,
    safeAreaInset = 0.1,
    editable = true,
    disabled = false,
    step = 0.01,
    label = 'Focus and crop region',
    className,
    ...props
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normaliseCrop(defaultValue, validAspectRatio(aspectRatioProp), aspectLocked)
  );
  const [uncontrolledFocalPoint, setUncontrolledFocalPoint] = useState(() =>
    normaliseFocalPoint(defaultFocalPoint)
  );
  const [dragging, setDragging] = useState<Exclude<DragState, null>['kind'] | null>(null);
  const aspectRatio = validAspectRatio(aspectRatioProp);
  const crop = normaliseCrop(value ?? uncontrolledValue, aspectRatio, aspectLocked);
  const focus = normaliseFocalPoint(focalPoint ?? uncontrolledFocalPoint);
  const canEdit = editable && !disabled;
  const safeInset = clamp(safeAreaInset, 0.04, 0.42);
  const cropRect = toCanvasRect(crop);
  const focalCanvasPoint = {
    x: cropRect.x + focus.x * cropRect.width,
    y: cropRect.y + focus.y * cropRect.height,
  };
  const classes = ['fk-focus-crop', !canEdit && 'fk-focus-crop--readonly', className]
    .filter(Boolean)
    .join(' ');

  const setCrop = useCallback(
    (nextValue: FocusCropValue) => {
      const next = normaliseCrop(nextValue, aspectRatio, aspectLocked);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [aspectLocked, aspectRatio, onValueChange, value]
  );

  const setFocalPoint = useCallback(
    (nextValue: FocusCropFocalPoint) => {
      const next = normaliseFocalPoint(nextValue);
      if (focalPoint === undefined) setUncontrolledFocalPoint(next);
      onFocalPointChange?.(next);
    },
    [focalPoint, onFocalPointChange]
  );

  const pointFromPointer = useCallback((event: ReactPointerEvent<SVGSVGElement>): Point | null => {
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

  const pointToNormalised = useCallback(
    (point: Point) => ({
      x: clamp((point.x - PLOT.x) / PLOT.width),
      y: clamp((point.y - PLOT.y) / PLOT.height),
    }),
    []
  );

  const resizeLockedCrop = useCallback(
    (startCrop: FocusCropValue, handle: CropHandle, point: Point) => {
      if (aspectRatio == null) return startCrop;
      const normalisedPoint = pointToNormalised(point);
      const isWest = handle === 'nw' || handle === 'sw';
      const isNorth = handle === 'nw' || handle === 'ne';
      const fixedX = isWest ? startCrop.x + startCrop.width : startCrop.x;
      const fixedY = isNorth ? startCrop.y + startCrop.height : startCrop.y;
      const factor = PLOT.width / PLOT.height / aspectRatio;
      const horizontalLimit = isWest ? fixedX : 1 - fixedX;
      const verticalLimit = (isNorth ? fixedY : 1 - fixedY) / factor;
      const maximum = Math.max(0, Math.min(horizontalLimit, verticalLimit));
      const minimum = Math.min(maximum, Math.max(MIN_SIZE, MIN_SIZE / factor));
      const byX = Math.abs(normalisedPoint.x - fixedX);
      const byY = Math.abs(normalisedPoint.y - fixedY) / factor;
      const pointerDeltaX = Math.abs(
        normalisedPoint.x - (isWest ? startCrop.x : fixedX + startCrop.width)
      );
      const pointerDeltaY = Math.abs(
        normalisedPoint.y - (isNorth ? startCrop.y : fixedY + startCrop.height)
      );
      const width = clamp(pointerDeltaX >= pointerDeltaY / factor ? byX : byY, minimum, maximum);
      const height = width * factor;
      return {
        x: isWest ? fixedX - width : fixedX,
        y: isNorth ? fixedY - height : fixedY,
        width,
        height,
      };
    },
    [aspectRatio, pointToNormalised]
  );

  const resizeFreeCrop = useCallback(
    (startCrop: FocusCropValue, handle: CropHandle, point: Point) => {
      const normalisedPoint = pointToNormalised(point);
      const right = startCrop.x + startCrop.width;
      const bottom = startCrop.y + startCrop.height;
      const isWest = handle === 'nw' || handle === 'sw';
      const isNorth = handle === 'nw' || handle === 'ne';
      const x = isWest ? clamp(normalisedPoint.x, 0, right - MIN_SIZE) : startCrop.x;
      const y = isNorth ? clamp(normalisedPoint.y, 0, bottom - MIN_SIZE) : startCrop.y;
      const width = isWest
        ? right - x
        : clamp(normalisedPoint.x - startCrop.x, MIN_SIZE, 1 - startCrop.x);
      const height = isNorth
        ? bottom - y
        : clamp(normalisedPoint.y - startCrop.y, MIN_SIZE, 1 - startCrop.y);
      return { x, y, width, height };
    },
    [pointToNormalised]
  );

  const startDrag = (event: ReactPointerEvent<SVGElement>, state: Exclude<DragState, null>) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = state;
    setDragging(state.kind);
  };

  const handleFramePointerDown = (event: ReactPointerEvent<SVGRectElement>) => {
    const point = pointFromPointer(event as unknown as ReactPointerEvent<SVGSVGElement>);
    if (!point) return;
    startDrag(event, { kind: 'frame', startPoint: point, startCrop: crop });
  };

  const handleResizePointerDown = (event: ReactPointerEvent<SVGGElement>, handle: CropHandle) => {
    const point = pointFromPointer(event as unknown as ReactPointerEvent<SVGSVGElement>);
    if (!point) return;
    startDrag(event, { kind: 'resize', handle, startPoint: point, startCrop: crop });
  };

  const handleFocalPointerDown = (event: ReactPointerEvent<SVGGElement>) => {
    startDrag(event, { kind: 'focal', startCrop: crop });
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const state = dragRef.current;
    if (!canEdit || state == null) return;
    const point = pointFromPointer(event);
    if (!point) return;

    if (state.kind === 'frame') {
      const start = pointToNormalised(state.startPoint);
      const current = pointToNormalised(point);
      setCrop({
        ...state.startCrop,
        x: state.startCrop.x + current.x - start.x,
        y: state.startCrop.y + current.y - start.y,
      });
      return;
    }

    if (state.kind === 'resize') {
      setCrop(
        aspectLocked && aspectRatio != null
          ? resizeLockedCrop(state.startCrop, state.handle, point)
          : resizeFreeCrop(state.startCrop, state.handle, point)
      );
      return;
    }

    const current = pointToNormalised(point);
    setFocalPoint({
      x: (current.x - state.startCrop.x) / state.startCrop.width,
      y: (current.y - state.startCrop.y) / state.startCrop.height,
    });
  };

  const stopDragging = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragging(null);
  };

  const resizeByKeyboard = (handle: CropHandle, increment: number) => {
    if (aspectLocked && aspectRatio != null) {
      const point = cornerForHandle(toCanvasRect(crop), handle);
      const isWest = handle === 'nw' || handle === 'sw';
      const isNorth = handle === 'nw' || handle === 'ne';
      const direction = increment >= 0 ? 1 : -1;
      const nudge = Math.abs(increment);
      point.x += (isWest ? -1 : 1) * direction * nudge * PLOT.width;
      point.y += (isNorth ? -1 : 1) * direction * nudge * PLOT.height;
      setCrop(resizeLockedCrop(crop, handle, point));
      return;
    }

    const expanding = increment >= 0 ? Math.abs(increment) : -Math.abs(increment);
    setCrop({
      x: crop.x - (handle === 'nw' || handle === 'sw' ? expanding : 0),
      y: crop.y - (handle === 'nw' || handle === 'ne' ? expanding : 0),
      width: crop.width + expanding,
      height: crop.height + expanding,
    });
  };

  const handleFrameKeyDown = (event: ReactKeyboardEvent<SVGRectElement>) => {
    if (!canEdit) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    let xDelta = 0;
    let yDelta = 0;
    if (event.key === 'ArrowLeft') xDelta = -increment;
    else if (event.key === 'ArrowRight') xDelta = increment;
    else if (event.key === 'ArrowUp') yDelta = -increment;
    else if (event.key === 'ArrowDown') yDelta = increment;
    else return;
    event.preventDefault();
    setCrop({ ...crop, x: crop.x + xDelta, y: crop.y + yDelta });
  };

  const handleFocalKeyDown = (event: ReactKeyboardEvent<SVGGElement>) => {
    if (!canEdit) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    let xDelta = 0;
    let yDelta = 0;
    if (event.key === 'ArrowLeft') xDelta = -increment;
    else if (event.key === 'ArrowRight') xDelta = increment;
    else if (event.key === 'ArrowUp') yDelta = -increment;
    else if (event.key === 'ArrowDown') yDelta = increment;
    else if (event.key === 'Home') {
      event.preventDefault();
      setFocalPoint({ x: 0, y: 0 });
      return;
    } else if (event.key === 'End') {
      event.preventDefault();
      setFocalPoint({ x: 1, y: 1 });
      return;
    } else return;
    event.preventDefault();
    setFocalPoint({ x: focus.x + xDelta, y: focus.y + yDelta });
  };

  const handleResizeKeyDown = (event: ReactKeyboardEvent<SVGGElement>, handle: CropHandle) => {
    if (!canEdit) return;
    const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      resizeByKeyboard(handle, increment);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      resizeByKeyboard(handle, -increment);
    }
  };

  const handles: CropHandle[] = ['nw', 'ne', 'se', 'sw'];
  const outerRight = PLOT.x + PLOT.width;
  const outerBottom = PLOT.y + PLOT.height;
  const safeRects = [safeInset, clamp(safeInset * 2, safeInset + 0.04, 0.44)];

  return (
    <div ref={ref} {...props} className={classes}>
      <svg
        ref={svgRef}
        className="fk-focus-crop__canvas"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role={canEdit ? 'group' : 'img'}
        aria-label={label}
        data-disabled={disabled || undefined}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <rect
          className="fk-focus-crop__surface"
          x="0.5"
          y="0.5"
          width={VIEWBOX.width - 1}
          height={VIEWBOX.height - 1}
          rx="6"
        />

        <g className="fk-focus-crop__mask" aria-hidden="true">
          <rect
            x={PLOT.x}
            y={PLOT.y}
            width={PLOT.width}
            height={Math.max(0, cropRect.y - PLOT.y)}
          />
          <rect
            x={PLOT.x}
            y={cropRect.y}
            width={Math.max(0, cropRect.x - PLOT.x)}
            height={cropRect.height}
          />
          <rect
            x={cropRect.x + cropRect.width}
            y={cropRect.y}
            width={Math.max(0, outerRight - (cropRect.x + cropRect.width))}
            height={cropRect.height}
          />
          <rect
            x={PLOT.x}
            y={cropRect.y + cropRect.height}
            width={PLOT.width}
            height={Math.max(0, outerBottom - (cropRect.y + cropRect.height))}
          />
        </g>

        {showSafeArea && (
          <g className="fk-focus-crop__safe-areas" aria-hidden="true">
            {safeRects.map((inset, index) => (
              <rect
                key={inset}
                className={
                  index === 0
                    ? 'fk-focus-crop__safe-area'
                    : 'fk-focus-crop__safe-area fk-focus-crop__safe-area--inner'
                }
                x={cropRect.x + cropRect.width * inset}
                y={cropRect.y + cropRect.height * inset}
                width={cropRect.width * (1 - inset * 2)}
                height={cropRect.height * (1 - inset * 2)}
              />
            ))}
          </g>
        )}

        <g className="fk-focus-crop__frame" data-dragging={dragging || undefined}>
          <rect
            className="fk-focus-crop__frame-hit"
            x={cropRect.x}
            y={cropRect.y}
            width={cropRect.width}
            height={cropRect.height}
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            aria-label={
              canEdit
                ? `Crop frame. X ${formatCoordinate(crop.x)}, Y ${formatCoordinate(crop.y)}, width ${formatCoordinate(crop.width)}, height ${formatCoordinate(crop.height)}. Drag to move; use arrow keys to adjust.`
                : undefined
            }
            onPointerDown={handleFramePointerDown}
            onKeyDown={handleFrameKeyDown}
          />
          <rect
            className="fk-focus-crop__frame-outline"
            x={cropRect.x}
            y={cropRect.y}
            width={cropRect.width}
            height={cropRect.height}
          />

          {handles.map((handle) => {
            const point = cornerForHandle(cropRect, handle);
            return (
              <g
                className="fk-focus-crop__resize-handle"
                key={handle}
                transform={`translate(${point.x} ${point.y})`}
                role={canEdit ? 'button' : undefined}
                tabIndex={canEdit ? 0 : undefined}
                aria-label={
                  canEdit ? `Resize crop from the ${handleName(handle)} corner.` : undefined
                }
                onPointerDown={(event) => handleResizePointerDown(event, handle)}
                onKeyDown={(event) => handleResizeKeyDown(event, handle)}
              >
                <rect className="fk-focus-crop__resize-hit" x="-9" y="-9" width="18" height="18" />
                <rect
                  className="fk-focus-crop__resize-focus"
                  x="-5.5"
                  y="-5.5"
                  width="11"
                  height="11"
                  rx="1"
                />
                <rect
                  className="fk-focus-crop__resize-square"
                  x="-3"
                  y="-3"
                  width="6"
                  height="6"
                  rx="0.75"
                />
              </g>
            );
          })}

          <g
            className="fk-focus-crop__focal-point"
            transform={`translate(${focalCanvasPoint.x} ${focalCanvasPoint.y})`}
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            aria-label={
              canEdit
                ? `Focal point. X ${formatCoordinate(focus.x)}, Y ${formatCoordinate(focus.y)}. Drag or use arrow keys to adjust.`
                : undefined
            }
            onPointerDown={handleFocalPointerDown}
            onKeyDown={handleFocalKeyDown}
          >
            <circle className="fk-focus-crop__focal-hit" r="12" />
            <circle className="fk-focus-crop__focal-focus" r="8" />
            <circle className="fk-focus-crop__focal-ring" r="5.5" />
            <circle className="fk-focus-crop__focal-center" r="1.75" />
          </g>
        </g>
      </svg>
    </div>
  );
});
