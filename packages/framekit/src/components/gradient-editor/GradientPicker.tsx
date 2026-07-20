import { forwardRef, useState, type HTMLAttributes } from 'react';
import { normalizeHex } from '../../color/color';
import { ColorInput } from '../color-picker';
import { Input } from '../input';
import {
  GradientEditor,
  type GradientEditorActiveStop,
  type GradientEditorProps,
  type GradientEditorValue,
} from './GradientEditor';

export interface GradientPickerProps extends Omit<GradientEditorProps, 'density' | 'showActions'> {}

const DEFAULT_PICKER_VALUE: GradientEditorValue = {
  colorStops: [
    { id: 'picker-start', color: '#172554', position: 0 },
    { id: 'picker-accent', color: '#0ea5e9', position: 0.48 },
    { id: 'picker-end', color: '#5eead4', position: 1 },
  ],
  alphaStops: [
    { id: 'picker-alpha-start', opacity: 1, position: 0 },
    { id: 'picker-alpha-end', opacity: 0.74, position: 1 },
  ],
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function stopExists(value: GradientEditorValue, stop: GradientEditorActiveStop | null) {
  if (!stop) return false;
  return stop.kind === 'color'
    ? value.colorStops.some((candidate) => candidate.id === stop.id)
    : value.alphaStops.some((candidate) => candidate.id === stop.id);
}

/**
 * A 220px gradient-picking surface designed to pair directly with ColorPicker.
 * It keeps GradientEditor’s stop model, enlarges the live ramp, removes the
 * inspector command bar, and adds exact value fields for the selected stop.
 */
export const GradientPicker = forwardRef<HTMLDivElement, GradientPickerProps>(
  function GradientPicker(
    {
      value,
      defaultValue = DEFAULT_PICKER_VALUE,
      onValueChange,
      activeStop: activeStopProp,
      defaultActiveStop,
      onActiveStopChange,
      midpoint: midpointProp,
      defaultMidpoint = 0.5,
      onMidpointChange,
      step = 0.01,
      editable = true,
      disabled = false,
      label = 'Gradient picker',
      className,
      ...props
    },
    ref
  ) {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [uncontrolledActiveStop, setUncontrolledActiveStop] =
      useState<GradientEditorActiveStop | null>(
        () =>
          defaultActiveStop ??
          (defaultValue.colorStops[0] ? { kind: 'color', id: defaultValue.colorStops[0].id } : null)
      );
    const [uncontrolledMidpoint, setUncontrolledMidpoint] = useState(defaultMidpoint);
    const gradient = value ?? uncontrolledValue;
    const requestedActiveStop =
      activeStopProp === undefined ? uncontrolledActiveStop : activeStopProp;
    const activeStop = stopExists(gradient, requestedActiveStop)
      ? requestedActiveStop
      : gradient.colorStops[0]
        ? { kind: 'color' as const, id: gradient.colorStops[0].id }
        : gradient.alphaStops[0]
          ? { kind: 'alpha' as const, id: gradient.alphaStops[0].id }
          : null;
    const midpoint = clamp(midpointProp ?? uncontrolledMidpoint);
    const activeColor =
      activeStop?.kind === 'color'
        ? gradient.colorStops.find((stop) => stop.id === activeStop.id)
        : undefined;
    const activeAlpha =
      activeStop?.kind === 'alpha'
        ? gradient.alphaStops.find((stop) => stop.id === activeStop.id)
        : undefined;
    const activePosition = activeColor?.position ?? activeAlpha?.position ?? 0;
    const canEdit = editable && !disabled;
    const classes = ['fk-gradient-picker', className].filter(Boolean).join(' ');

    const commitValue = (next: GradientEditorValue) => {
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    };

    const selectStop = (next: GradientEditorActiveStop | null) => {
      if (activeStopProp === undefined) setUncontrolledActiveStop(next);
      onActiveStopChange?.(next);
    };

    const setMidpoint = (next: number) => {
      const clamped = clamp(next);
      if (midpointProp === undefined) setUncontrolledMidpoint(clamped);
      onMidpointChange?.(clamped);
    };

    const updateColor = (color: string) => {
      if (!activeColor) return;
      const normalized = normalizeHex(color);
      if (!normalized) return;
      commitValue({
        ...gradient,
        colorStops: gradient.colorStops.map((stop) =>
          stop.id === activeColor.id ? { ...stop, color: normalized } : stop
        ),
      });
    };

    const updateOpacity = (opacity: number) => {
      if (!activeAlpha || !Number.isFinite(opacity)) return;
      commitValue({
        ...gradient,
        alphaStops: gradient.alphaStops.map((stop) =>
          stop.id === activeAlpha.id ? { ...stop, opacity: clamp(opacity) } : stop
        ),
      });
    };

    const updatePosition = (position: number) => {
      if (!activeStop || !Number.isFinite(position)) return;
      const nextPosition = clamp(position);
      commitValue(
        activeStop.kind === 'color'
          ? {
              ...gradient,
              colorStops: gradient.colorStops.map((stop) =>
                stop.id === activeStop.id ? { ...stop, position: nextPosition } : stop
              ),
            }
          : {
              ...gradient,
              alphaStops: gradient.alphaStops.map((stop) =>
                stop.id === activeStop.id ? { ...stop, position: nextPosition } : stop
              ),
            }
      );
    };

    return (
      <div
        ref={ref}
        {...(props as HTMLAttributes<HTMLDivElement>)}
        className={classes}
        role="group"
        aria-label={label}
      >
        <GradientEditor
          value={gradient}
          onValueChange={commitValue}
          activeStop={activeStop}
          onActiveStopChange={selectStop}
          midpoint={midpoint}
          onMidpointChange={setMidpoint}
          step={step}
          density="compact"
          showActions={false}
          editable={editable}
          disabled={disabled}
          label={`${label} stops`}
        />
        <div className="fk-gradient-picker__fields">
          {activeColor ? (
            <ColorInput
              size="sm"
              label="Hex"
              value={activeColor.color}
              onChange={updateColor}
              disabled={!canEdit}
              aria-label="Selected colour stop"
            />
          ) : (
            <Input
              size="sm"
              label="Alpha"
              suffix="%"
              font="mono"
              value={String(Math.round((activeAlpha?.opacity ?? 0) * 100))}
              disabled={!canEdit || !activeAlpha}
              inputMode="decimal"
              onChange={(event) => updateOpacity(Number.parseFloat(event.target.value) / 100)}
            />
          )}
          <Input
            size="sm"
            label="Pos"
            suffix="%"
            font="mono"
            value={String(Math.round(activePosition * 100))}
            disabled={!canEdit || !activeStop}
            inputMode="decimal"
            onChange={(event) => updatePosition(Number.parseFloat(event.target.value) / 100)}
          />
        </div>
      </div>
    );
  }
);
