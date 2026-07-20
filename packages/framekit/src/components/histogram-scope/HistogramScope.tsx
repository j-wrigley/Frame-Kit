import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type HistogramScopeMode = 'luminance' | 'rgb';
export type HistogramScopeRegion = 'blacks' | 'shadows' | 'exposure' | 'highlights' | 'whites';

export interface HistogramScopeAdjustments {
  /** Black-point adjustment from -100 to 100. */
  blacks: number;
  /** Shadow adjustment from -100 to 100. */
  shadows: number;
  /** Exposure adjustment in stops from -5 to 5. */
  exposure: number;
  /** Highlight adjustment from -100 to 100. */
  highlights: number;
  /** White-point adjustment from -100 to 100. */
  whites: number;
}

export interface HistogramScopeData {
  /** Relative or raw luminance bin values, ordered from shadow to highlight. */
  luminance?: readonly number[];
  /** Relative or raw red-channel bin values, ordered from shadow to highlight. */
  red?: readonly number[];
  /** Relative or raw green-channel bin values, ordered from shadow to highlight. */
  green?: readonly number[];
  /** Relative or raw blue-channel bin values, ordered from shadow to highlight. */
  blue?: readonly number[];
}

export interface HistogramScopeExposureRange {
  /** Lowest exposure value represented on the horizontal axis. */
  min: number;
  /** Highest exposure value represented on the horizontal axis. */
  max: number;
}

export interface HistogramScopeProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'defaultValue'
> {
  /** Histogram bin data. Bins may be raw sample counts or normalised values. */
  data?: HistogramScopeData;
  /** Shows the luminance distribution or overlapping RGB channel distributions. @default 'luminance' */
  mode?: HistogramScopeMode;
  /** Marks clipped detail at the shadow edge. @default false */
  shadowClipped?: boolean;
  /** Marks clipped detail at the highlight edge. @default false */
  highlightClipped?: boolean;
  /** Labels the visible exposure extent. @default { min: -5, max: 5 } */
  exposureRange?: HistogramScopeExposureRange;
  /** Shows the exposure labels beneath the distribution. @default true */
  showExposureRange?: boolean;
  /** Controlled tonal values emitted by direct histogram adjustments. */
  value?: HistogramScopeAdjustments;
  /** Initial tonal values when the scope manages adjustments. */
  defaultValue?: HistogramScopeAdjustments;
  /** Called after an interactive tonal-zone adjustment. */
  onValueChange?: (value: HistogramScopeAdjustments) => void;
  /** Called when a direct-adjustment zone is hovered, focused, or released. */
  onActiveRegionChange?: (region: HistogramScopeRegion | null) => void;
  /** Enables Lightroom-style drag and keyboard adjustments across the five tonal zones. @default false */
  interactive?: boolean;
  /** Disables direct tonal-zone adjustment and mutes the scope. @default false */
  disabled?: boolean;
  /** Accessible scope name. @default 'Histogram scope' */
  label?: string;
}

const VIEWBOX = { width: 360, height: 180 };
const PLOT = { x: 14, y: 14, width: 332, height: 122 };
const DEFAULT_EXPOSURE_RANGE: HistogramScopeExposureRange = { min: -5, max: 5 };
const DEFAULT_ADJUSTMENTS: HistogramScopeAdjustments = {
  blacks: 0,
  shadows: 0,
  exposure: 0,
  highlights: 0,
  whites: 0,
};
const TONAL_REGIONS: readonly { id: HistogramScopeRegion; label: string }[] = [
  { id: 'blacks', label: 'Blacks' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'exposure', label: 'Exposure' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'whites', label: 'Whites' },
];

function distribution(
  peaks: readonly [centre: number, width: number, strength: number][],
  seed: number
) {
  const bins = 80;
  return Array.from({ length: bins }, (_, index) => {
    const position = index / (bins - 1);
    const envelope = peaks.reduce(
      (total, [centre, width, strength]) =>
        total + Math.exp(-((position - centre) ** 2) / (2 * width ** 2)) * strength,
      0
    );
    // A histogram is discrete source data, not an interpolated curve. This
    // deterministic sample texture keeps the default specimen honest about
    // that binned character without introducing runtime randomness.
    const texture =
      0.58 +
      Math.sin(index * 2.41 + seed) * 0.18 +
      Math.cos(index * 0.73 + seed * 1.7) * 0.12 +
      Math.sin(index * 5.17 + seed * 0.4) * 0.08;
    return Math.max(0, Math.round(envelope * Math.max(texture, 0.16) * 100));
  });
}

const DEFAULT_DATA: HistogramScopeData = {
  luminance: distribution(
    [
      [0.15, 0.07, 0.58],
      [0.38, 0.12, 1],
      [0.68, 0.1, 0.7],
      [0.9, 0.045, 0.22],
    ],
    0.4
  ),
  red: distribution(
    [
      [0.16, 0.08, 0.38],
      [0.44, 0.13, 0.86],
      [0.76, 0.1, 0.54],
    ],
    1.2
  ),
  green: distribution(
    [
      [0.12, 0.06, 0.24],
      [0.34, 0.11, 0.74],
      [0.6, 0.11, 0.88],
      [0.85, 0.06, 0.3],
    ],
    2.4
  ),
  blue: distribution(
    [
      [0.16, 0.08, 0.67],
      [0.42, 0.12, 0.82],
      [0.7, 0.09, 0.36],
    ],
    3.1
  ),
};

function normaliseBins(bins: readonly number[] | undefined) {
  return (bins ?? []).map((value) => (Number.isFinite(value) ? Math.max(0, value) : 0));
}

function normaliseRange(range: HistogramScopeExposureRange | undefined) {
  const min = Number.isFinite(range?.min) ? (range?.min as number) : DEFAULT_EXPOSURE_RANGE.min;
  const max = Number.isFinite(range?.max) ? (range?.max as number) : DEFAULT_EXPOSURE_RANGE.max;
  return min < max ? { min, max } : DEFAULT_EXPOSURE_RANGE;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normaliseAdjustments(
  value: HistogramScopeAdjustments | undefined
): HistogramScopeAdjustments {
  return {
    blacks: clamp(Number.isFinite(value?.blacks) ? (value?.blacks as number) : 0, -100, 100),
    shadows: clamp(Number.isFinite(value?.shadows) ? (value?.shadows as number) : 0, -100, 100),
    exposure: clamp(Number.isFinite(value?.exposure) ? (value?.exposure as number) : 0, -5, 5),
    highlights: clamp(
      Number.isFinite(value?.highlights) ? (value?.highlights as number) : 0,
      -100,
      100
    ),
    whites: clamp(Number.isFinite(value?.whites) ? (value?.whites as number) : 0, -100, 100),
  };
}

function barsFor(bins: readonly number[], maximum: number) {
  if (bins.length === 0) return [];
  const step = PLOT.width / bins.length;
  const gap = Math.min(0.75, Math.max(0.3, step * 0.14));
  const width = Math.max(0.5, step - gap);
  return bins.map((value, index) => {
    const height = (value / maximum) * PLOT.height;
    return {
      x: PLOT.x + index * step + gap / 2,
      y: PLOT.y + PLOT.height - height,
      width,
      height,
    };
  });
}

function influence(position: number, centre: number, width: number) {
  return Math.exp(-((position - centre) ** 2) / (2 * width ** 2));
}

function mapTone(position: number, adjustments: HistogramScopeAdjustments) {
  // Exposure works from a gamma-like luminance remap so each stop shifts
  // middle tones materially while keeping the endpoints stable. The four
  // remaining controls then concentrate their effect in their named range.
  const exposureScale = 2 ** adjustments.exposure;
  let mapped = position ** (1 / exposureScale);
  mapped += (adjustments.blacks / 100) * 0.16 * influence(position, 0.06, 0.11);
  mapped += (adjustments.shadows / 100) * 0.18 * influence(position, 0.28, 0.17);
  mapped += (adjustments.highlights / 100) * 0.18 * influence(position, 0.72, 0.17);
  mapped += (adjustments.whites / 100) * 0.16 * influence(position, 0.94, 0.11);
  return clamp(mapped, 0, 1);
}

function applyToneAdjustments(bins: readonly number[], adjustments: HistogramScopeAdjustments) {
  if (
    adjustments.blacks === 0 &&
    adjustments.shadows === 0 &&
    adjustments.exposure === 0 &&
    adjustments.highlights === 0 &&
    adjustments.whites === 0
  ) {
    return bins;
  }

  const next = Array.from({ length: bins.length }, () => 0);
  const denominator = Math.max(bins.length - 1, 1);
  bins.forEach((value, sourceIndex) => {
    const target = mapTone(sourceIndex / denominator, adjustments) * denominator;
    const lower = Math.floor(target);
    const upper = Math.min(denominator, lower + 1);
    const progress = target - lower;
    next[lower] += value * (1 - progress);
    next[upper] += value * progress;
  });
  return next;
}

function formatExposure(value: number) {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return '0 EV';
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)} EV`;
}

function adjustmentBounds(region: HistogramScopeRegion) {
  return region === 'exposure' ? { min: -5, max: 5, step: 0.05 } : { min: -100, max: 100, step: 1 };
}

function formatAdjustment(region: HistogramScopeRegion, value: number) {
  if (region === 'exposure') return `${value > 0 ? '+' : ''}${value.toFixed(2)} EV`;
  return `${value > 0 ? '+' : ''}${Math.round(value)}`;
}

function channelsFor(data: HistogramScopeData, mode: HistogramScopeMode) {
  if (mode === 'luminance') {
    return [
      {
        id: 'luminance' as const,
        bins: normaliseBins(data.luminance ?? data.green ?? data.red ?? data.blue),
      },
    ];
  }

  return (['red', 'green', 'blue'] as const).map((id) => ({
    id,
    bins: normaliseBins(data[id]),
  }));
}

/**
 * A compact luminance or RGB scope for creative tools. It turns
 * application-owned histogram bins into a calm, scan-friendly exposure view,
 * optionally adding direct tonal-zone adjustment while image processing and
 * refreshed bin data remain explicitly owned by the consumer.
 */
export const HistogramScope = forwardRef<HTMLDivElement, HistogramScopeProps>(
  function HistogramScope(
    {
      data = DEFAULT_DATA,
      mode = 'luminance',
      shadowClipped = false,
      highlightClipped = false,
      exposureRange,
      showExposureRange = true,
      value,
      defaultValue = DEFAULT_ADJUSTMENTS,
      onValueChange,
      onActiveRegionChange,
      interactive = false,
      disabled = false,
      label = 'Histogram scope',
      className,
      role,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) {
    const draggingRegionRef = useRef<{
      region: HistogramScopeRegion;
      startY: number;
      startValue: number;
    } | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      normaliseAdjustments(defaultValue)
    );
    const [activeRegion, setActiveRegion] = useState<HistogramScopeRegion | null>(null);
    const [draggingRegion, setDraggingRegion] = useState<HistogramScopeRegion | null>(null);
    const range = normaliseRange(exposureRange);
    const adjustments = normaliseAdjustments(value ?? uncontrolledValue);
    const channels = channelsFor(data, mode).map((channel) => ({
      ...channel,
      bins: applyToneAdjustments(channel.bins, adjustments),
    }));
    const maximum = Math.max(1, ...channels.flatMap((channel) => channel.bins));
    const canAdjust = interactive && !disabled;
    const classes = [
      'fk-histogram-scope',
      `fk-histogram-scope--${mode}`,
      canAdjust && 'fk-histogram-scope--interactive',
      disabled && 'fk-histogram-scope--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const clippingDescription = [
      shadowClipped && 'shadow clipping',
      highlightClipped && 'highlight clipping',
    ]
      .filter(Boolean)
      .join(', ');
    const accessibleLabel =
      ariaLabel ??
      `${label}. ${mode === 'rgb' ? 'RGB' : 'Luminance'} distribution. Exposure range ${formatExposure(range.min)} to ${formatExposure(range.max)}${clippingDescription ? `. ${clippingDescription}.` : ''}`;

    const setActive = useCallback(
      (region: HistogramScopeRegion | null) => {
        setActiveRegion(region);
        onActiveRegionChange?.(region);
      },
      [onActiveRegionChange]
    );

    const setAdjustment = useCallback(
      (region: HistogramScopeRegion, nextValue: number) => {
        const bounds = adjustmentBounds(region);
        const next = { ...adjustments, [region]: clamp(nextValue, bounds.min, bounds.max) };
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [adjustments, onValueChange, value]
    );

    const handlePointerDown = (
      event: ReactPointerEvent<SVGRectElement>,
      region: HistogramScopeRegion
    ) => {
      if (!canAdjust || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRegionRef.current = {
        region,
        startY: event.clientY,
        startValue: adjustments[region],
      };
      setDraggingRegion(region);
      setActive(region);
    };

    const handlePointerMove = (
      event: ReactPointerEvent<SVGRectElement>,
      region: HistogramScopeRegion
    ) => {
      const drag = draggingRegionRef.current;
      if (!canAdjust || drag?.region !== region) return;
      const multiplier = region === 'exposure' ? 0.02 : 0.7;
      setAdjustment(region, drag.startValue + (drag.startY - event.clientY) * multiplier);
    };

    const stopDragging = (
      event: ReactPointerEvent<SVGRectElement>,
      region: HistogramScopeRegion
    ) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (draggingRegionRef.current?.region !== region) return;
      draggingRegionRef.current = null;
      setDraggingRegion(null);
      setActive(region);
    };

    const handleRegionKeyDown = (
      event: ReactKeyboardEvent<SVGRectElement>,
      region: HistogramScopeRegion
    ) => {
      if (!canAdjust) return;
      const { step, min, max } = adjustmentBounds(region);
      const increment = step * (event.shiftKey ? 5 : 1);
      let next = adjustments[region];
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next += increment;
      else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next -= increment;
      else if (event.key === 'Home') next = min;
      else if (event.key === 'End') next = max;
      else if (event.key === 'Escape') next = 0;
      else return;

      event.preventDefault();
      setAdjustment(region, next);
    };

    return (
      <div
        ref={ref}
        {...props}
        className={classes}
        role={role ?? (canAdjust ? 'group' : 'img')}
        aria-label={accessibleLabel}
        aria-disabled={disabled || undefined}
      >
        <svg
          className="fk-histogram-scope__canvas"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          aria-hidden="true"
        >
          <rect
            className="fk-histogram-scope__surface"
            x="0.5"
            y="0.5"
            width={VIEWBOX.width - 1}
            height={VIEWBOX.height - 1}
            rx="4"
          />
          <g className="fk-histogram-scope__grid">
            {[0.25, 0.5, 0.75].map((position) => (
              <line
                key={position}
                x1={PLOT.x + PLOT.width * position}
                x2={PLOT.x + PLOT.width * position}
                y1={PLOT.y}
                y2={PLOT.y + PLOT.height}
              />
            ))}
            <line
              x1={PLOT.x}
              x2={PLOT.x + PLOT.width}
              y1={PLOT.y + PLOT.height}
              y2={PLOT.y + PLOT.height}
            />
          </g>
          <g className="fk-histogram-scope__distribution">
            {channels.map((channel) => {
              const bars = barsFor(channel.bins, maximum);
              if (bars.length === 0) return null;
              return (
                <g
                  className={`fk-histogram-scope__channel fk-histogram-scope__channel--${channel.id}`}
                  key={channel.id}
                >
                  {bars.map((bar, index) => (
                    <rect
                      className="fk-histogram-scope__bar"
                      key={index}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                    />
                  ))}
                </g>
              );
            })}
          </g>
          {canAdjust && (
            <g className="fk-histogram-scope__interactions">
              {TONAL_REGIONS.map((region, index) => {
                const bounds = adjustmentBounds(region.id);
                const x = PLOT.x + (PLOT.width / TONAL_REGIONS.length) * index;
                const width = PLOT.width / TONAL_REGIONS.length;
                const isActive = activeRegion === region.id;
                const isDragging = draggingRegion === region.id;
                return (
                  <g
                    className="fk-histogram-scope__interaction"
                    data-active={isActive || undefined}
                    data-dragging={isDragging || undefined}
                    key={region.id}
                  >
                    <rect
                      className="fk-histogram-scope__interaction-highlight"
                      x={x}
                      y={PLOT.y}
                      width={width}
                      height={PLOT.height}
                    />
                    <rect
                      className="fk-histogram-scope__interaction-surface"
                      x={x}
                      y={PLOT.y}
                      width={width}
                      height={PLOT.height}
                      role="slider"
                      tabIndex={0}
                      aria-label={`${region.label} adjustment`}
                      aria-valuemin={bounds.min}
                      aria-valuemax={bounds.max}
                      aria-valuenow={adjustments[region.id]}
                      aria-valuetext={formatAdjustment(region.id, adjustments[region.id])}
                      onPointerDown={(event) => handlePointerDown(event, region.id)}
                      onPointerMove={(event) => handlePointerMove(event, region.id)}
                      onPointerUp={(event) => stopDragging(event, region.id)}
                      onPointerCancel={(event) => stopDragging(event, region.id)}
                      onPointerEnter={() => setActive(region.id)}
                      onPointerLeave={() => {
                        if (draggingRegionRef.current == null) setActive(null);
                      }}
                      onFocus={() => setActive(region.id)}
                      onBlur={() => {
                        if (draggingRegionRef.current == null) setActive(null);
                      }}
                      onKeyDown={(event) => handleRegionKeyDown(event, region.id)}
                    />
                  </g>
                );
              })}
            </g>
          )}
          {(shadowClipped || highlightClipped) && (
            <g className="fk-histogram-scope__clipping">
              {shadowClipped && (
                <path
                  className="fk-histogram-scope__clip fk-histogram-scope__clip--shadow"
                  d="M14 25V14H25"
                />
              )}
              {highlightClipped && (
                <path
                  className="fk-histogram-scope__clip fk-histogram-scope__clip--highlight"
                  d="M346 25V14H335"
                />
              )}
            </g>
          )}
          {showExposureRange && (
            <g className="fk-histogram-scope__axis">
              <text x={PLOT.x} y="165">
                {formatExposure(range.min)}
              </text>
              <text x={PLOT.x + PLOT.width / 2} y="165">
                {formatExposure((range.min + range.max) / 2)}
              </text>
              <text x={PLOT.x + PLOT.width} y="165">
                {formatExposure(range.max)}
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }
);
