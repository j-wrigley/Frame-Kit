import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { hexToRgb, normalizeHex, rgbToHex } from '../../color/color';
import { ColorWheelIcon, OpacityIcon, PlusIcon, ReloadIcon, TrashIcon } from '../../icons/icons';
import { Button } from '../button';

export interface GradientColorStop {
  /** Application-owned stable identifier. */
  id: string;
  /** Stop colour as a hex value. */
  color: string;
  /** Normalized position from 0 through 1. */
  position: number;
}

export interface GradientAlphaStop {
  /** Application-owned stable identifier. */
  id: string;
  /** Opacity from 0 through 1. */
  opacity: number;
  /** Normalized position from 0 through 1. */
  position: number;
}

export interface GradientEditorValue {
  colorStops: readonly GradientColorStop[];
  alphaStops: readonly GradientAlphaStop[];
}

export type GradientEditorStopKind = 'color' | 'alpha';
export type GradientEditorDensity = 'default' | 'compact';

export interface GradientEditorActiveStop {
  kind: GradientEditorStopKind;
  id: string;
}

export interface GradientEditorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled colour and alpha stops. */
  value?: GradientEditorValue;
  /** Initial stops when uncontrolled. */
  defaultValue?: GradientEditorValue;
  /** Called after adding, removing, reversing, or repositioning a stop. */
  onValueChange?: (value: GradientEditorValue) => void;
  /** Controlled selected stop. */
  activeStop?: GradientEditorActiveStop | null;
  /** Initial selected stop when uncontrolled. Defaults to the first colour stop. */
  defaultActiveStop?: GradientEditorActiveStop | null;
  /** Called when a colour or alpha stop becomes selected. */
  onActiveStopChange?: (stop: GradientEditorActiveStop | null) => void;
  /** Controlled relative midpoint between the active colour stop and its neighbor, from 0 through 1. */
  midpoint?: number;
  /** Initial relative midpoint when uncontrolled. @default 0.5 */
  defaultMidpoint?: number;
  /** Called after dragging or keyboard-adjusting the blend midpoint. */
  onMidpointChange?: (midpoint: number) => void;
  /** Arrow-key increment for stop positions and the midpoint. Hold Shift for five increments. @default 0.01 */
  step?: number;
  /** Shows add, reverse, and remove commands above the lanes. @default true */
  showActions?: boolean;
  /** Compresses the command bar for narrow picker surfaces. @default 'default' */
  density?: GradientEditorDensity;
  /** Enables direct editing and commands. @default true */
  editable?: boolean;
  /** Disables interaction and mutes the editor. @default false */
  disabled?: boolean;
  /** Accessible editor name. @default 'Gradient editor' */
  label?: string;
}

const DEFAULT_VALUE: GradientEditorValue = {
  colorStops: [
    { id: 'ink', color: '#1f2937', position: 0 },
    { id: 'blue', color: '#2563eb', position: 0.46 },
    { id: 'rose', color: '#ec4899', position: 1 },
  ],
  alphaStops: [
    { id: 'opaque-start', opacity: 1, position: 0 },
    { id: 'opaque-end', opacity: 1, position: 1 },
  ],
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseColorStop(stop: GradientColorStop): GradientColorStop {
  return {
    ...stop,
    color: normalizeHex(stop.color) ?? '#000000',
    position: round(clamp(stop.position)),
  };
}

function normaliseAlphaStop(stop: GradientAlphaStop): GradientAlphaStop {
  return {
    ...stop,
    opacity: round(clamp(stop.opacity)),
    position: round(clamp(stop.position)),
  };
}

function normaliseValue(value: GradientEditorValue): GradientEditorValue {
  return {
    colorStops: value.colorStops.map(normaliseColorStop),
    alphaStops: value.alphaStops.map(normaliseAlphaStop),
  };
}

function sortStops<T extends { position: number }>(stops: readonly T[]) {
  return [...stops].sort((first, second) => first.position - second.position);
}

function percent(value: number) {
  return `${round(clamp(value) * 100)}%`;
}

function colorGradient(
  stops: readonly GradientColorStop[],
  hintIndex: number | null,
  midpoint: number
) {
  const parts: string[] = [];
  stops.forEach((stop, index) => {
    parts.push(`${stop.color} ${percent(stop.position)}`);
    if (index === hintIndex) parts.push(percent(midpoint));
  });
  return parts.length > 0 ? `linear-gradient(90deg, ${parts.join(', ')})` : 'transparent';
}

function alphaGradient(stops: readonly GradientAlphaStop[]) {
  const parts = stops.map(
    (stop) => `rgb(0 0 0 / ${round(clamp(stop.opacity))}) ${percent(stop.position)}`
  );
  return parts.length > 0 ? `linear-gradient(90deg, ${parts.join(', ')})` : 'none';
}

function interpolateColor(stops: readonly GradientColorStop[], position: number) {
  const sorted = sortStops(stops);
  if (sorted.length === 0) return '#808080';
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last || position <= first.position) return first?.color ?? '#808080';
  if (position >= last.position) return last.color;

  const endIndex = sorted.findIndex((stop) => stop.position >= position);
  const start = sorted[Math.max(0, endIndex - 1)];
  const end = sorted[endIndex];
  if (!start || !end || start.position === end.position)
    return end?.color ?? start?.color ?? '#808080';

  const amount = (position - start.position) / (end.position - start.position);
  const startRgb = hexToRgb(start.color);
  const endRgb = hexToRgb(end.color);
  return rgbToHex({
    r: startRgb.r + (endRgb.r - startRgb.r) * amount,
    g: startRgb.g + (endRgb.g - startRgb.g) * amount,
    b: startRgb.b + (endRgb.b - startRgb.b) * amount,
  });
}

function interpolateAlpha(stops: readonly GradientAlphaStop[], position: number) {
  const sorted = sortStops(stops);
  if (sorted.length === 0) return 1;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last || position <= first.position) return first?.opacity ?? 1;
  if (position >= last.position) return last.opacity;

  const endIndex = sorted.findIndex((stop) => stop.position >= position);
  const start = sorted[Math.max(0, endIndex - 1)];
  const end = sorted[endIndex];
  if (!start || !end || start.position === end.position) return end?.opacity ?? start?.opacity ?? 1;
  const amount = (position - start.position) / (end.position - start.position);
  return round(start.opacity + (end.opacity - start.opacity) * amount);
}

function widestGapPosition(stops: readonly { position: number }[]) {
  const positions = sortStops(stops).map((stop) => stop.position);
  if (positions.length === 0) return 0.5;
  const anchors = [0, ...positions, 1];
  let largestStart = 0;
  let largestGap = -1;
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const start = anchors[index] ?? 0;
    const end = anchors[index + 1] ?? 1;
    if (end - start > largestGap) {
      largestGap = end - start;
      largestStart = start;
    }
  }
  return round(largestStart + Math.max(largestGap, 0) / 2);
}

function isActiveStop(
  activeStop: GradientEditorActiveStop | null,
  kind: GradientEditorStopKind,
  id: string
) {
  return activeStop?.kind === kind && activeStop.id === id;
}

/**
 * A production-style stop editor with independent opacity and colour lanes.
 * Stops can be added from the command bar or by double-clicking a lane, moved
 * directly, reversed as a group, and removed without leaving the component.
 */
export const GradientEditor = forwardRef<HTMLDivElement, GradientEditorProps>(
  function GradientEditor(
    {
      value,
      defaultValue = DEFAULT_VALUE,
      onValueChange,
      activeStop: activeStopProp,
      defaultActiveStop,
      onActiveStopChange,
      midpoint: midpointProp,
      defaultMidpoint = 0.5,
      onMidpointChange,
      step = 0.01,
      showActions = true,
      density = 'default',
      editable = true,
      disabled = false,
      label = 'Gradient editor',
      className,
      ...props
    },
    ref
  ) {
    const rampRef = useRef<HTMLDivElement>(null);
    const draggingStopRef = useRef<GradientEditorActiveStop | null>(null);
    const draggingMidpointRef = useRef(false);
    const generatedId = useId().replace(/:/g, '');
    const nextStopId = useRef(0);
    const [uncontrolledValue, setUncontrolledValue] = useState(() => normaliseValue(defaultValue));
    const [uncontrolledActiveStop, setUncontrolledActiveStop] =
      useState<GradientEditorActiveStop | null>(
        () =>
          defaultActiveStop ??
          (defaultValue.colorStops[0] ? { kind: 'color', id: defaultValue.colorStops[0].id } : null)
      );
    const [uncontrolledMidpoint, setUncontrolledMidpoint] = useState(defaultMidpoint);
    const [draggingStop, setDraggingStop] = useState<GradientEditorActiveStop | null>(null);
    const [draggingMidpoint, setDraggingMidpoint] = useState(false);

    const gradient = normaliseValue(value ?? uncontrolledValue);
    const colorStops = sortStops(gradient.colorStops);
    const alphaStops = sortStops(gradient.alphaStops);
    const requestedActiveStop =
      activeStopProp === undefined ? uncontrolledActiveStop : activeStopProp;
    const activeStop =
      requestedActiveStop &&
      (requestedActiveStop.kind === 'color'
        ? colorStops.some((stop) => stop.id === requestedActiveStop.id)
        : alphaStops.some((stop) => stop.id === requestedActiveStop.id))
        ? requestedActiveStop
        : colorStops[0]
          ? { kind: 'color' as const, id: colorStops[0].id }
          : null;
    const canEdit = editable && !disabled;
    const canRemoveActive = activeStop
      ? activeStop.kind === 'color'
        ? colorStops.length > 2
        : alphaStops.length > 2
      : false;
    const activeColorIndex =
      activeStop?.kind === 'color' ? colorStops.findIndex((stop) => stop.id === activeStop.id) : 0;
    const segmentStartIndex =
      colorStops.length > 1 ? Math.max(0, Math.min(activeColorIndex, colorStops.length - 2)) : -1;
    const segmentStart = segmentStartIndex >= 0 ? colorStops[segmentStartIndex] : undefined;
    const segmentEnd = segmentStartIndex >= 0 ? colorStops[segmentStartIndex + 1] : undefined;
    const rawMidpoint = midpointProp ?? uncontrolledMidpoint;
    const midpoint = round(clamp(rawMidpoint));
    const midpointPosition =
      segmentStart && segmentEnd
        ? segmentStart.position + (segmentEnd.position - segmentStart.position) * midpoint
        : midpoint;
    const classes = [
      'fk-gradient-editor',
      `fk-gradient-editor--${density}`,
      !canEdit && 'fk-gradient-editor--readonly',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const rampStyle = {
      '--fk-gradient-editor-colors': colorGradient(colorStops, segmentStartIndex, midpointPosition),
      '--fk-gradient-editor-alpha': alphaGradient(alphaStops),
    } as CSSProperties;

    const setGradient = useCallback(
      (nextGradient: GradientEditorValue) => {
        const next = normaliseValue(nextGradient);
        if (value === undefined) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [onValueChange, value]
    );

    const selectStop = useCallback(
      (nextStop: GradientEditorActiveStop | null) => {
        if (activeStopProp === undefined) setUncontrolledActiveStop(nextStop);
        onActiveStopChange?.(nextStop);
      },
      [activeStopProp, onActiveStopChange]
    );

    const setMidpoint = useCallback(
      (nextMidpoint: number) => {
        const next = round(clamp(nextMidpoint));
        if (midpointProp === undefined) setUncontrolledMidpoint(next);
        onMidpointChange?.(next);
      },
      [midpointProp, onMidpointChange]
    );

    const positionFromClientX = useCallback((clientX: number) => {
      const bounds = rampRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return null;
      return round(clamp((clientX - bounds.left) / bounds.width));
    }, []);

    const updateStopPosition = useCallback(
      (stop: GradientEditorActiveStop, nextPosition: number) => {
        if (stop.kind === 'color') {
          setGradient({
            ...gradient,
            colorStops: gradient.colorStops.map((colorStop) =>
              colorStop.id === stop.id
                ? { ...colorStop, position: round(clamp(nextPosition)) }
                : colorStop
            ),
          });
          return;
        }
        setGradient({
          ...gradient,
          alphaStops: gradient.alphaStops.map((alphaStop) =>
            alphaStop.id === stop.id
              ? { ...alphaStop, position: round(clamp(nextPosition)) }
              : alphaStop
          ),
        });
      },
      [gradient, setGradient]
    );

    const addColorStop = useCallback(
      (position = widestGapPosition(colorStops)) => {
        if (!canEdit) return;
        const nextPosition = round(clamp(position));
        const id = `${generatedId}-color-${nextStopId.current++}`;
        setGradient({
          ...gradient,
          colorStops: [
            ...gradient.colorStops,
            { id, color: interpolateColor(colorStops, nextPosition), position: nextPosition },
          ],
        });
        selectStop({ kind: 'color', id });
      },
      [canEdit, colorStops, generatedId, gradient, selectStop, setGradient]
    );

    const addAlphaStop = useCallback(
      (position = widestGapPosition(alphaStops)) => {
        if (!canEdit) return;
        const nextPosition = round(clamp(position));
        const id = `${generatedId}-alpha-${nextStopId.current++}`;
        setGradient({
          ...gradient,
          alphaStops: [
            ...gradient.alphaStops,
            { id, opacity: interpolateAlpha(alphaStops, nextPosition), position: nextPosition },
          ],
        });
        selectStop({ kind: 'alpha', id });
      },
      [alphaStops, canEdit, generatedId, gradient, selectStop, setGradient]
    );

    const removeStop = useCallback(
      (targetStop: GradientEditorActiveStop | null) => {
        if (!canEdit || !targetStop) return;
        const canRemove =
          targetStop.kind === 'color' ? colorStops.length > 2 : alphaStops.length > 2;
        if (!canRemove) return;
        const activePosition =
          targetStop.kind === 'color'
            ? colorStops.find((stop) => stop.id === targetStop.id)?.position
            : alphaStops.find((stop) => stop.id === targetStop.id)?.position;
        const remaining =
          targetStop.kind === 'color'
            ? colorStops.filter((stop) => stop.id !== targetStop.id)
            : alphaStops.filter((stop) => stop.id !== targetStop.id);
        const nearest = [...remaining].sort(
          (first, second) =>
            Math.abs(first.position - (activePosition ?? 0)) -
            Math.abs(second.position - (activePosition ?? 0))
        )[0];
        setGradient(
          targetStop.kind === 'color'
            ? {
                ...gradient,
                colorStops: gradient.colorStops.filter((stop) => stop.id !== targetStop.id),
              }
            : {
                ...gradient,
                alphaStops: gradient.alphaStops.filter((stop) => stop.id !== targetStop.id),
              }
        );
        selectStop(nearest ? { kind: targetStop.kind, id: nearest.id } : null);
      },
      [alphaStops, canEdit, colorStops, gradient, selectStop, setGradient]
    );

    const removeActiveStop = useCallback(() => {
      removeStop(activeStop);
    }, [activeStop, removeStop]);

    const reverseGradient = useCallback(() => {
      if (!canEdit) return;
      setGradient({
        colorStops: gradient.colorStops.map((stop) => ({
          ...stop,
          position: round(1 - stop.position),
        })),
        alphaStops: gradient.alphaStops.map((stop) => ({
          ...stop,
          position: round(1 - stop.position),
        })),
      });
      setMidpoint(1 - midpoint);
    }, [canEdit, gradient, midpoint, setGradient, setMidpoint]);

    const handleLaneDoubleClick = (
      event: ReactMouseEvent<HTMLDivElement>,
      kind: GradientEditorStopKind
    ) => {
      if (!canEdit || (event.target as HTMLElement).closest('button')) return;
      const position = positionFromClientX(event.clientX);
      if (position === null) return;
      if (kind === 'color') addColorStop(position);
      else addAlphaStop(position);
    };

    const handleStopPointerDown = (
      event: ReactPointerEvent<HTMLButtonElement>,
      stop: GradientEditorActiveStop
    ) => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingStopRef.current = stop;
      setDraggingStop(stop);
      selectStop(stop);
      const nextPosition = positionFromClientX(event.clientX);
      if (nextPosition !== null) updateStopPosition(stop, nextPosition);
    };

    const handleStopPointerMove = (
      event: ReactPointerEvent<HTMLButtonElement>,
      stop: GradientEditorActiveStop
    ) => {
      if (
        !canEdit ||
        draggingStopRef.current?.kind !== stop.kind ||
        draggingStopRef.current.id !== stop.id
      )
        return;
      const nextPosition = positionFromClientX(event.clientX);
      if (nextPosition !== null) updateStopPosition(stop, nextPosition);
    };

    const stopDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingStopRef.current = null;
      setDraggingStop(null);
    };

    const handleStopKeyDown = (
      event: ReactKeyboardEvent<HTMLButtonElement>,
      stop: GradientEditorActiveStop,
      position: number
    ) => {
      if (!canEdit) return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        selectStop(stop);
        removeStop(stop);
        return;
      }

      const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
      let nextPosition = position;
      if (event.key === 'ArrowLeft') nextPosition -= increment;
      else if (event.key === 'ArrowRight') nextPosition += increment;
      else if (event.key === 'Home') nextPosition = 0;
      else if (event.key === 'End') nextPosition = 1;
      else return;

      event.preventDefault();
      selectStop(stop);
      updateStopPosition(stop, nextPosition);
    };

    const handleMidpointPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!canEdit || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingMidpointRef.current = true;
      setDraggingMidpoint(true);
      const nextPosition = positionFromClientX(event.clientX);
      if (
        nextPosition !== null &&
        segmentStart &&
        segmentEnd &&
        segmentEnd.position !== segmentStart.position
      ) {
        setMidpoint(
          (nextPosition - segmentStart.position) / (segmentEnd.position - segmentStart.position)
        );
      }
    };

    const handleMidpointPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!canEdit || !draggingMidpointRef.current) return;
      const nextPosition = positionFromClientX(event.clientX);
      if (
        nextPosition !== null &&
        segmentStart &&
        segmentEnd &&
        segmentEnd.position !== segmentStart.position
      ) {
        setMidpoint(
          (nextPosition - segmentStart.position) / (segmentEnd.position - segmentStart.position)
        );
      }
    };

    const stopMidpointDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingMidpointRef.current = false;
      setDraggingMidpoint(false);
    };

    const handleMidpointKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (!canEdit) return;
      const increment = Math.max(step, 0.001) * (event.shiftKey ? 5 : 1);
      let nextMidpoint = midpoint;
      if (event.key === 'ArrowLeft') nextMidpoint -= increment;
      else if (event.key === 'ArrowRight') nextMidpoint += increment;
      else if (event.key === 'Home') nextMidpoint = 0;
      else if (event.key === 'End') nextMidpoint = 1;
      else return;
      event.preventDefault();
      setMidpoint(nextMidpoint);
    };

    return (
      <div ref={ref} {...props} className={classes} role="group" aria-label={label}>
        {showActions && (
          <div className="fk-gradient-editor__toolbar">
            <div className="fk-gradient-editor__summary">
              <span>Stops</span>
              <output>
                {colorStops.length} colour · {alphaStops.length} opacity
              </output>
            </div>
            <div className="fk-gradient-editor__actions">
              {density === 'compact' ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<ColorWheelIcon />}
                    disabled={!canEdit}
                    aria-label="Add colour stop"
                    title="Add colour stop"
                    onClick={() => addColorStop()}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<OpacityIcon />}
                    disabled={!canEdit}
                    aria-label="Add opacity stop"
                    title="Add opacity stop"
                    onClick={() => addAlphaStop()}
                  />
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<PlusIcon />}
                    disabled={!canEdit}
                    onClick={() => addColorStop()}
                  >
                    Colour
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<PlusIcon />}
                    disabled={!canEdit}
                    onClick={() => addAlphaStop()}
                  >
                    Opacity
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ReloadIcon />}
                disabled={!canEdit}
                aria-label="Reverse gradient"
                title="Reverse gradient"
                onClick={reverseGradient}
              />
              <Button
                size="sm"
                variant="ghost"
                iconStart={<TrashIcon />}
                disabled={!canEdit || !canRemoveActive}
                aria-label="Remove selected stop"
                title="Remove selected stop"
                onClick={removeActiveStop}
              />
            </div>
          </div>
        )}

        <div className="fk-gradient-editor__workspace" style={rampStyle}>
          <div className="fk-gradient-editor__lane-heading">
            <span>Opacity</span>
            <span>Double-click lane to add</span>
          </div>
          <div
            className="fk-gradient-editor__alpha-lane"
            aria-label="Opacity stops"
            onDoubleClick={(event) => handleLaneDoubleClick(event, 'alpha')}
          >
            <span className="fk-gradient-editor__alpha-track" aria-hidden="true" />
            {alphaStops.map((stop) => {
              const active = isActiveStop(activeStop, 'alpha', stop.id);
              const dragging = draggingStop?.kind === 'alpha' && draggingStop.id === stop.id;
              return (
                <button
                  className="fk-gradient-editor__stop fk-gradient-editor__stop--alpha"
                  key={stop.id}
                  type="button"
                  tabIndex={canEdit ? 0 : -1}
                  aria-label={`Opacity stop, ${Math.round(stop.opacity * 100)}% at ${Math.round(stop.position * 100)}%. Use arrow keys to adjust.`}
                  aria-pressed={active}
                  data-active={active || undefined}
                  data-dragging={dragging || undefined}
                  style={
                    {
                      '--fk-gradient-editor-position': percent(stop.position),
                      '--fk-gradient-editor-stop-opacity': stop.opacity,
                    } as CSSProperties
                  }
                  onFocus={() => selectStop({ kind: 'alpha', id: stop.id })}
                  onPointerDown={(event) =>
                    handleStopPointerDown(event, { kind: 'alpha', id: stop.id })
                  }
                  onPointerMove={(event) =>
                    handleStopPointerMove(event, { kind: 'alpha', id: stop.id })
                  }
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onKeyDown={(event) =>
                    handleStopKeyDown(event, { kind: 'alpha', id: stop.id }, stop.position)
                  }
                >
                  <span aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div className="fk-gradient-editor__ramp" ref={rampRef}>
            <span className="fk-gradient-editor__ramp-colors" aria-hidden="true" />
            {segmentStart && segmentEnd && segmentEnd.position !== segmentStart.position && (
              <button
                className="fk-gradient-editor__midpoint"
                type="button"
                tabIndex={canEdit ? 0 : -1}
                aria-label={`Blend midpoint at ${Math.round(midpoint * 100)}% of the active segment. Use arrow keys to adjust.`}
                data-dragging={draggingMidpoint || undefined}
                style={
                  { '--fk-gradient-editor-position': percent(midpointPosition) } as CSSProperties
                }
                onPointerDown={handleMidpointPointerDown}
                onPointerMove={handleMidpointPointerMove}
                onPointerUp={stopMidpointDragging}
                onPointerCancel={stopMidpointDragging}
                onKeyDown={handleMidpointKeyDown}
              />
            )}
          </div>

          <div
            className="fk-gradient-editor__color-lane"
            aria-label="Colour stops"
            onDoubleClick={(event) => handleLaneDoubleClick(event, 'color')}
          >
            {colorStops.map((stop) => {
              const active = isActiveStop(activeStop, 'color', stop.id);
              const dragging = draggingStop?.kind === 'color' && draggingStop.id === stop.id;
              return (
                <button
                  className="fk-gradient-editor__stop fk-gradient-editor__stop--color"
                  key={stop.id}
                  type="button"
                  tabIndex={canEdit ? 0 : -1}
                  aria-label={`Colour stop ${stop.color} at ${Math.round(stop.position * 100)}%. Use arrow keys to adjust.`}
                  aria-pressed={active}
                  data-active={active || undefined}
                  data-dragging={dragging || undefined}
                  style={
                    {
                      '--fk-gradient-editor-position': percent(stop.position),
                      '--fk-gradient-editor-stop-color': stop.color,
                    } as CSSProperties
                  }
                  onFocus={() => selectStop({ kind: 'color', id: stop.id })}
                  onPointerDown={(event) =>
                    handleStopPointerDown(event, { kind: 'color', id: stop.id })
                  }
                  onPointerMove={(event) =>
                    handleStopPointerMove(event, { kind: 'color', id: stop.id })
                  }
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onKeyDown={(event) =>
                    handleStopKeyDown(event, { kind: 'color', id: stop.id }, stop.position)
                  }
                >
                  <span aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="fk-gradient-editor__axis" aria-hidden="true">
            <span>Colour</span>
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>
    );
  }
);
