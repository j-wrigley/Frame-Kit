import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

const RECORDING_PERIMETER = 400;
const useFrameLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface FrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible name shown just above the canvas boundary. */
  name: ReactNode;
  /** Children rendered inside the clipped frame surface. */
  children?: ReactNode;
  /** Marks this as the selected canvas frame and reveals resize handles. @default false */
  selected?: boolean;
  /** Shows an accent outline that tracks capture or render progress. @default false */
  recording?: boolean;
  /** Recording outline completion from 0 to 1. @default 0 */
  recordingProgress?: number;
  /** Explicit frame width. Pair with `height` or `aspectRatio` for a canvas-sized surface. */
  width?: CSSProperties['width'];
  /** Explicit frame height. Pair with `width` or `aspectRatio` for a canvas-sized surface. */
  height?: CSSProperties['height'];
  /** CSS aspect ratio used when one dimension is inferred. */
  aspectRatio?: CSSProperties['aspectRatio'];
}

/**
 * A named design surface for canvas-style creative tools. Frame deliberately
 * handles only the visual boundary and selection affordance; consumers own
 * canvas coordinates, dragging, resizing, selection, and context actions.
 */
export const Frame = forwardRef<HTMLDivElement, FrameProps>(function Frame(
  {
    name,
    children,
    selected = false,
    recording = false,
    recordingProgress = 0,
    width,
    height,
    aspectRatio,
    className,
    style,
    role,
    tabIndex,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const recordingOutlineRef = useRef<SVGSVGElement>(null);
  const [recordingPerimeter, setRecordingPerimeter] = useState(RECORDING_PERIMETER);
  const classes = ['fk-frame', className].filter(Boolean).join(' ');
  const frameStyle: CSSProperties = { ...style };
  if (width != null) frameStyle.width = width;
  if (height != null) frameStyle.height = height;
  if (aspectRatio != null) frameStyle.aspectRatio = aspectRatio;
  const accessibleName = ariaLabel ?? (typeof name === 'string' ? name : undefined);
  const progress = Math.min(Math.max(recordingProgress, 0), 1);
  const progressPercent = Math.round(progress * 100);

  useFrameLayoutEffect(() => {
    if (!recording) return undefined;

    const outline = recordingOutlineRef.current;
    if (!outline) return undefined;

    const updatePerimeter = () => {
      const { width: outlineWidth, height: outlineHeight } = outline.getBoundingClientRect();
      const nextPerimeter = 2 * (outlineWidth + outlineHeight);
      setRecordingPerimeter((currentPerimeter) =>
        Math.abs(currentPerimeter - nextPerimeter) < 0.5 ? currentPerimeter : nextPerimeter
      );
    };

    updatePerimeter();
    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(updatePerimeter);
    observer.observe(outline);
    return () => observer.disconnect();
  }, [recording]);

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      style={frameStyle}
      role={role ?? (tabIndex != null ? 'group' : undefined)}
      tabIndex={tabIndex}
      aria-label={accessibleName}
      data-selected={selected || undefined}
      data-recording={recording || undefined}
    >
      <div className="fk-frame__label">
        <span className="fk-frame__name">{name}</span>
      </div>
      <div className="fk-frame__content">{children}</div>
      {recording && (
        <svg
          ref={recordingOutlineRef}
          className="fk-frame__recording"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Recording progress ${progressPercent}%`}
        >
          <rect
            className="fk-frame__recording-progress"
            x="0"
            y="0"
            width="100"
            height="100"
            strokeDasharray={recordingPerimeter}
            strokeDashoffset={recordingPerimeter * (1 - progress)}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {selected && (
        <span className="fk-frame__handles" aria-hidden="true">
          <span className="fk-frame__handle fk-frame__handle--top-left" />
          <span className="fk-frame__handle fk-frame__handle--top-right" />
          <span className="fk-frame__handle fk-frame__handle--bottom-right" />
          <span className="fk-frame__handle fk-frame__handle--bottom-left" />
        </span>
      )}
    </div>
  );
});
