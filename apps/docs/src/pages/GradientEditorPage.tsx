import { useState, type CSSProperties } from 'react';
import {
  Button,
  ColorInput,
  ColorPicker,
  GradientEditor,
  GradientPicker,
  NumberInput,
  Popover,
  ResetIcon,
  SegmentedSwitch,
  Tabs,
  type GradientEditorActiveStop,
  type GradientEditorValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type GradientType = 'linear' | 'radial' | 'conic';

const INITIAL_GRADIENT: GradientEditorValue = {
  colorStops: [
    { id: 'navy', color: '#111827', position: 0 },
    { id: 'blue', color: '#2563eb', position: 0.42 },
    { id: 'violet', color: '#8b5cf6', position: 0.7 },
    { id: 'rose', color: '#f43f5e', position: 1 },
  ],
  alphaStops: [
    { id: 'alpha-start', opacity: 1, position: 0 },
    { id: 'alpha-body', opacity: 0.86, position: 0.68 },
    { id: 'alpha-end', opacity: 0.28, position: 1 },
  ],
};

const INITIAL_ACTIVE_STOP: GradientEditorActiveStop = { kind: 'color', id: 'blue' };

const PICKER_GRADIENT: GradientEditorValue = {
  colorStops: [
    { id: 'deep', color: '#172554', position: 0 },
    { id: 'cyan', color: '#0ea5e9', position: 0.46 },
    { id: 'mint', color: '#5eead4', position: 1 },
  ],
  alphaStops: [
    { id: 'solid', opacity: 1, position: 0 },
    { id: 'soft', opacity: 0.74, position: 1 },
  ],
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function copyGradient(value: GradientEditorValue): GradientEditorValue {
  return {
    colorStops: value.colorStops.map((stop) => ({ ...stop })),
    alphaStops: value.alphaStops.map((stop) => ({ ...stop })),
  };
}

function sortedStops<T extends { position: number }>(stops: readonly T[]) {
  return [...stops].sort((first, second) => first.position - second.position);
}

function gradientFunction(type: GradientType, angle: number, stops: string) {
  if (type === 'radial') return `radial-gradient(circle at 50% 50%, ${stops})`;
  if (type === 'conic') return `conic-gradient(from ${angle}deg at 50% 50%, ${stops})`;
  return `linear-gradient(${angle}deg, ${stops})`;
}

function gradientLayers(
  value: GradientEditorValue,
  type: GradientType,
  angle: number,
  activeStop?: GradientEditorActiveStop,
  midpoint = 0.5
) {
  const colors = sortedStops(value.colorStops);
  const activeIndex =
    activeStop?.kind === 'color' ? colors.findIndex((stop) => stop.id === activeStop.id) : 0;
  const segmentIndex =
    colors.length > 1 ? Math.max(0, Math.min(activeIndex, colors.length - 2)) : -1;
  const start = colors[segmentIndex];
  const end = colors[segmentIndex + 1];
  const hintPosition =
    start && end ? start.position + (end.position - start.position) * clamp(midpoint) : null;
  const colorParts: string[] = [];
  colors.forEach((stop, index) => {
    colorParts.push(`${stop.color} ${Math.round(stop.position * 1000) / 10}%`);
    if (index === segmentIndex && hintPosition != null) {
      colorParts.push(`${Math.round(hintPosition * 1000) / 10}%`);
    }
  });
  const alphaParts = sortedStops(value.alphaStops).map(
    (stop) => `rgb(0 0 0 / ${clamp(stop.opacity)}) ${Math.round(stop.position * 1000) / 10}%`
  );
  return {
    backgroundImage: gradientFunction(type, angle, colorParts.join(', ')),
    WebkitMaskImage: gradientFunction(type, angle, alphaParts.join(', ')),
    maskImage: gradientFunction(type, angle, alphaParts.join(', ')),
  } as CSSProperties;
}

function colorRamp(value: GradientEditorValue) {
  return gradientFunction(
    'linear',
    90,
    sortedStops(value.colorStops)
      .map((stop) => `${stop.color} ${Math.round(stop.position * 100)}%`)
      .join(', ')
  );
}

export function GradientEditorPage() {
  const [gradient, setGradient] = useState<GradientEditorValue>(() =>
    copyGradient(INITIAL_GRADIENT)
  );
  const [activeStop, setActiveStop] = useState<GradientEditorActiveStop>(INITIAL_ACTIVE_STOP);
  const [midpoint, setMidpoint] = useState(0.5);
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(32);
  const [pickerMode, setPickerMode] = useState<'colour' | 'gradient'>('gradient');
  const [pickerColour, setPickerColour] = useState('#2563eb');
  const [pickerGradient, setPickerGradient] = useState<GradientEditorValue>(() =>
    copyGradient(PICKER_GRADIENT)
  );

  const activeColor =
    activeStop.kind === 'color'
      ? gradient.colorStops.find((stop) => stop.id === activeStop.id)
      : undefined;
  const activeAlpha =
    activeStop.kind === 'alpha'
      ? gradient.alphaStops.find((stop) => stop.id === activeStop.id)
      : undefined;
  const activePosition = activeColor?.position ?? activeAlpha?.position ?? 0;

  const updateActiveColor = (color: string) => {
    if (!activeColor) return;
    setGradient((current) => ({
      ...current,
      colorStops: current.colorStops.map((stop) =>
        stop.id === activeColor.id ? { ...stop, color } : stop
      ),
    }));
  };

  const updateActiveOpacity = (opacity: number) => {
    if (!activeAlpha || !Number.isFinite(opacity)) return;
    setGradient((current) => ({
      ...current,
      alphaStops: current.alphaStops.map((stop) =>
        stop.id === activeAlpha.id ? { ...stop, opacity: clamp(opacity) } : stop
      ),
    }));
  };

  const updateActivePosition = (position: number) => {
    if (!Number.isFinite(position)) return;
    const nextPosition = clamp(position);
    setGradient((current) =>
      activeStop.kind === 'color'
        ? {
            ...current,
            colorStops: current.colorStops.map((stop) =>
              stop.id === activeStop.id ? { ...stop, position: nextPosition } : stop
            ),
          }
        : {
            ...current,
            alphaStops: current.alphaStops.map((stop) =>
              stop.id === activeStop.id ? { ...stop, position: nextPosition } : stop
            ),
          }
    );
  };

  const resetGradient = () => {
    setGradient(copyGradient(INITIAL_GRADIENT));
    setActiveStop(INITIAL_ACTIVE_STOP);
    setMidpoint(0.5);
    setGradientType('linear');
    setAngle(32);
  };

  const activeLabel = activeColor
    ? `${activeColor.color.toUpperCase()} · ${Math.round(activeColor.position * 100)}%`
    : activeAlpha
      ? `${Math.round(activeAlpha.opacity * 100)}% opacity · ${Math.round(activeAlpha.position * 100)}%`
      : 'Select a stop';
  const previewStyle = gradientLayers(gradient, gradientType, angle, activeStop, midpoint);
  const pickerPreview = pickerMode === 'colour' ? pickerColour : colorRamp(pickerGradient);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Gradient editor"
        lede="A professional stop editor for fills, effects, and motion graphics. Build colour and opacity ramps independently, tune exact values, and use the same editor inside an inspector or popover."
      />

      <Section title="Gradient workbench">
        <p className="section-intro">
          This is the complete editing pattern: a live output, fill type controls, independent stop
          lanes, and exact values for the current selection. Every visible control changes the
          gradient.
        </p>
        <div className="demo demo--gradient-workbench">
          <div className="gradient-workbench" aria-label="Gradient fill workbench">
            <div className="gradient-workbench__heading">
              <div>
                <span className="fk-tag">Fill</span>
                <strong>Atmosphere</strong>
              </div>
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset gradient"
                title="Reset gradient"
                onClick={resetGradient}
              />
            </div>

            <div className="gradient-workbench__modebar">
              <SegmentedSwitch
                size="sm"
                fullWidth
                aria-label="Gradient type"
                value={gradientType}
                onValueChange={(value) => setGradientType(value as GradientType)}
                options={[
                  { value: 'linear', label: 'Linear' },
                  { value: 'radial', label: 'Radial' },
                  { value: 'conic', label: 'Conic' },
                ]}
              />
              <NumberInput
                className="gradient-workbench__angle"
                size="sm"
                label="Angle"
                suffix="°"
                font="mono"
                value={String(angle)}
                disabled={gradientType === 'radial'}
                decrementLabel="Decrease gradient angle"
                incrementLabel="Increase gradient angle"
                onChange={(event) => {
                  const next = Number.parseFloat(event.target.value);
                  if (Number.isFinite(next)) setAngle(next);
                }}
                onDecrement={() => setAngle((current) => current - 1)}
                onIncrement={() => setAngle((current) => current + 1)}
              />
            </div>

            <div className="gradient-workbench__preview">
              <div className="gradient-workbench__preview-fill" style={previewStyle} />
              <div className="gradient-workbench__preview-meta">
                <span className="fk-tag">Live output</span>
                <output>
                  {gradientType === 'radial' ? 'Radial' : `${gradientType} · ${angle}°`}
                </output>
              </div>
            </div>

            <GradientEditor
              value={gradient}
              onValueChange={setGradient}
              activeStop={activeStop}
              onActiveStopChange={(stop) => stop && setActiveStop(stop)}
              midpoint={midpoint}
              onMidpointChange={setMidpoint}
              label="Atmosphere gradient stops"
            />

            <div className="gradient-stop-inspector">
              <div className="gradient-stop-inspector__selection">
                <span className="fk-tag">{activeColor ? 'Colour stop' : 'Opacity stop'}</span>
                <output>{activeLabel}</output>
              </div>
              <div className="gradient-stop-inspector__controls">
                {activeColor ? (
                  <ColorInput
                    size="sm"
                    label="Colour"
                    value={activeColor.color}
                    onChange={updateActiveColor}
                    aria-label="Selected colour stop hex value"
                  />
                ) : (
                  <NumberInput
                    size="sm"
                    label="Opacity"
                    suffix="%"
                    font="mono"
                    value={String(Math.round((activeAlpha?.opacity ?? 0) * 100))}
                    decrementLabel="Decrease selected opacity"
                    incrementLabel="Increase selected opacity"
                    onChange={(event) =>
                      updateActiveOpacity(Number.parseFloat(event.target.value) / 100)
                    }
                    onDecrement={() => updateActiveOpacity((activeAlpha?.opacity ?? 0) - 0.01)}
                    onIncrement={() => updateActiveOpacity((activeAlpha?.opacity ?? 0) + 0.01)}
                  />
                )}
                <NumberInput
                  size="sm"
                  label="Position"
                  suffix="%"
                  font="mono"
                  value={String(Math.round(activePosition * 100))}
                  decrementLabel="Move selected stop left"
                  incrementLabel="Move selected stop right"
                  onChange={(event) =>
                    updateActivePosition(Number.parseFloat(event.target.value) / 100)
                  }
                  onDecrement={() => updateActivePosition(activePosition - 0.01)}
                  onIncrement={() => updateActivePosition(activePosition + 0.01)}
                />
                <NumberInput
                  size="sm"
                  label="Midpoint"
                  suffix="%"
                  font="mono"
                  value={String(Math.round(midpoint * 100))}
                  disabled={!activeColor}
                  decrementLabel="Move blend midpoint left"
                  incrementLabel="Move blend midpoint right"
                  onChange={(event) => {
                    const next = Number.parseFloat(event.target.value);
                    if (Number.isFinite(next)) setMidpoint(clamp(next / 100));
                  }}
                  onDecrement={() => setMidpoint((current) => clamp(current - 0.01))}
                  onIncrement={() => setMidpoint((current) => clamp(current + 0.01))}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Double-click either lane to insert an interpolated stop. Drag to move; use arrow keys for
          1% increments, <code>Shift</code> for 5%, and <code>Delete</code> to remove a selected
          stop. Two stops per lane are always preserved.
        </p>
      </Section>

      <Section title="Colour and gradient popover">
        <p className="section-intro">
          Gradient picker shares Color picker’s 220px footprint, control scale, and exact-value row.
          The popover uses content sizing, so neither tab inherits unnecessary width from the other.
        </p>
        <div className="demo">
          <div className="gradient-picker-demo">
            <div className="gradient-picker-demo__preview" style={{ background: pickerPreview }}>
              <span className="fk-tag">Fill preview</span>
            </div>
            <Popover
              size="auto"
              panelLabel="Fill picker"
              autoFocus
              trigger={
                <Button
                  size="sm"
                  className="gradient-picker-trigger"
                  iconStart={
                    <span
                      className="gradient-picker-trigger__preview"
                      style={{ background: pickerPreview }}
                      aria-hidden="true"
                    />
                  }
                >
                  Edit fill
                </Button>
              }
            >
              <div className="gradient-picker-popover">
                <div className="gradient-picker-popover__heading">
                  <div>
                    <span className="fk-tag">Appearance</span>
                    <strong>Fill</strong>
                  </div>
                  <span className="gradient-picker-popover__value">
                    {pickerMode === 'colour' ? pickerColour.toUpperCase() : 'Gradient'}
                  </span>
                </div>
                <Tabs
                  value={pickerMode}
                  onValueChange={(mode) =>
                    setPickerMode(mode === 'gradient' ? 'gradient' : 'colour')
                  }
                  variant="contained"
                  size="sm"
                  fullWidth
                  aria-label="Fill type"
                  items={[
                    {
                      value: 'colour',
                      label: 'Colour',
                      content: (
                        <ColorPicker
                          value={pickerColour}
                          onChange={setPickerColour}
                          presets={['#172554', '#2563eb', '#0ea5e9', '#5eead4']}
                        />
                      ),
                    },
                    {
                      value: 'gradient',
                      label: 'Gradient',
                      content: (
                        <GradientPicker
                          value={pickerGradient}
                          onValueChange={setPickerGradient}
                          label="Fill gradient"
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </Popover>
          </div>
        </div>
      </Section>

      <Section title="Built for real editing">
        <div className="gradient-editor-guidance">
          <div>
            <span className="fk-tag spec-label">Stops</span>
            <strong>Add, select, move, remove</strong>
            <p>
              The editor owns the full stop workflow, including interpolation when a new stop is
              inserted.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Opacity</span>
            <strong>A separate, visible lane</strong>
            <p>
              Transparency is edited independently and shown in both the opacity rail and
              checkerboard ramp.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Precision</span>
            <strong>Drag or enter exact values</strong>
            <p>
              The ramp handles fast exploration while the composed inspector handles exact position
              and midpoint values.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { GradientEditor, type GradientEditorValue } from '@presentstandards/framekit-ui';

const [gradient, setGradient] = useState<GradientEditorValue>({
  colorStops: [
    { id: 'start', color: '#111827', position: 0 },
    { id: 'end', color: '#f43f5e', position: 1 },
  ],
  alphaStops: [
    { id: 'visible', opacity: 1, position: 0 },
    { id: 'fade', opacity: 0.3, position: 1 },
  ],
});

<GradientEditor
  value={gradient}
  onValueChange={setGradient}
  label="Background gradient"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
