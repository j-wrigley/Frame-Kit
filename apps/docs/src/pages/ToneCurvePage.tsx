import { useState } from 'react';
import {
  Button,
  Dropdown,
  NumberInput,
  ResetIcon,
  SegmentedSwitch,
  ToneCurve,
  type ToneCurveChannel,
  type ToneCurvePoint,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type TonePreset = 'linear' | 'contrast' | 'lifted' | 'filmic' | 'custom';

const CHANNEL_OPTIONS = [
  { value: 'luminance', label: 'Luma' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

const PRESET_OPTIONS = [
  { value: 'linear', label: 'Linear', description: 'No tonal change' },
  { value: 'contrast', label: 'Soft contrast', description: 'Gently deepen and lift' },
  { value: 'lifted', label: 'Lifted blacks', description: 'Matte shadow detail' },
  { value: 'filmic', label: 'Filmic', description: 'Compressed highlights' },
];

const PRESET_VALUES: Record<
  Exclude<TonePreset, 'custom'>,
  ReadonlyArray<readonly [number, number]>
> = {
  linear: [
    [0, 0],
    [1, 1],
  ],
  contrast: [
    [0, 0],
    [0.24, 0.18],
    [0.74, 0.82],
    [1, 1],
  ],
  lifted: [
    [0, 0.08],
    [0.28, 0.28],
    [0.72, 0.76],
    [1, 0.96],
  ],
  filmic: [
    [0, 0.03],
    [0.3, 0.2],
    [0.66, 0.76],
    [1, 0.94],
  ],
};

function pointsForPreset(preset: Exclude<TonePreset, 'custom'>, key: string): ToneCurvePoint[] {
  return PRESET_VALUES[preset].map(([x, y], index) => ({ id: `${key}-${preset}-${index}`, x, y }));
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function formatChannel(channel: ToneCurveChannel) {
  return channel === 'luminance' ? 'Luminance' : `${channel[0].toUpperCase()}${channel.slice(1)}`;
}

export function ToneCurvePage() {
  const [preset, setPreset] = useState<TonePreset>('contrast');
  const [channel, setChannel] = useState<ToneCurveChannel>('luminance');
  const [curves, setCurves] = useState<Record<ToneCurveChannel, ToneCurvePoint[]>>(() => ({
    luminance: pointsForPreset('contrast', 'luma'),
    red: pointsForPreset('linear', 'red'),
    green: pointsForPreset('linear', 'green'),
    blue: pointsForPreset('linear', 'blue'),
  }));
  const [activeId, setActiveId] = useState<string | null>('luma-contrast-1');
  const points = curves[channel];
  const activeIndex = Math.max(
    0,
    points.findIndex((point) => point.id === activeId)
  );
  const activePoint = points[activeIndex] ?? points[0];

  const setCurrentPoints = (nextPoints: ToneCurvePoint[]) => {
    setCurves((current) => ({ ...current, [channel]: nextPoints }));
    setPreset('custom');
  };

  const selectChannel = (next: string) => {
    const nextChannel = next as ToneCurveChannel;
    setChannel(nextChannel);
    setActiveId(curves[nextChannel][Math.min(1, curves[nextChannel].length - 1)]?.id ?? null);
  };

  const selectPreset = (next: string) => {
    const nextPreset = next as Exclude<TonePreset, 'custom'>;
    const nextPoints = pointsForPreset(nextPreset, channel);
    setCurves((current) => ({ ...current, [channel]: nextPoints }));
    setActiveId(nextPoints[Math.min(1, nextPoints.length - 1)]?.id ?? null);
    setPreset(nextPreset);
  };

  const updateActivePoint = (key: 'x' | 'y', value: number) => {
    if (!activePoint || !Number.isFinite(value)) return;
    setCurrentPoints(
      points.map((point, index) =>
        index === activeIndex
          ? { ...point, [key]: index === 0 || index === points.length - 1 ? point.x : clamp(value) }
          : point
      )
    );
  };

  const reset = () => {
    const nextPoints = pointsForPreset('contrast', channel);
    setCurves((current) => ({ ...current, [channel]: nextPoints }));
    setActiveId(nextPoints[1]?.id ?? null);
    setPreset(channel === 'luminance' ? 'contrast' : 'custom');
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Tone curve"
        lede="A compact tonal transfer editor for photography and colour workflows. Shape luminance or individual channels against a restrained histogram, then keep the selected point precise in the inspector."
      />

      <Section title="Tone curve inspector">
        <p className="section-intro">
          Presets establish a dependable tonal starting point. Drag a curve point or double-click
          the graph to add one; every adjustment changes the transfer curve while keeping the
          histogram quietly in context.
        </p>
        <div className="demo">
          <div className="tone-curve-inspector" aria-label="Tone curve inspector">
            <div className="tone-curve-inspector__heading">
              <div>
                <strong>Tone curve</strong>
              </div>
              <span className="tone-curve-inspector__state">
                {preset === 'custom' ? 'Custom' : 'Preset'}
              </span>
            </div>

            <div className="tone-curve-inspector__controls">
              <Dropdown
                size="sm"
                label="Tone curve preset"
                options={PRESET_OPTIONS}
                value={preset === 'custom' ? undefined : preset}
                placeholder="Custom curve"
                onValueChange={selectPreset}
                fullWidth
              />
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset tone curve"
                title="Reset tone curve"
                onClick={reset}
              />
            </div>

            <SegmentedSwitch
              size="sm"
              fullWidth
              aria-label="Tone curve channel"
              options={CHANNEL_OPTIONS}
              value={channel}
              onValueChange={selectChannel}
            />

            <ToneCurve
              value={points}
              onValueChange={setCurrentPoints}
              activeId={activeId}
              onActiveIdChange={setActiveId}
              channel={channel}
              label={`${formatChannel(channel)} tone curve`}
            />

            <div className="tone-curve-inspector__readout">
              <span className="fk-tag">Point {String(activeIndex + 1).padStart(2, '0')}</span>
              <output>
                Input {Math.round((activePoint?.x ?? 0) * 255)} → Output{' '}
                {Math.round((activePoint?.y ?? 0) * 255)}
              </output>
            </div>

            <div className="tone-curve-inspector__fine-tuning">
              <NumberInput
                size="sm"
                label="Input"
                font="mono"
                value={String(Math.round((activePoint?.x ?? 0) * 255))}
                disabled={activeIndex === 0 || activeIndex === points.length - 1}
                decrementLabel="Decrease tone curve input"
                incrementLabel="Increase tone curve input"
                onChange={(event) =>
                  updateActivePoint('x', Number.parseFloat(event.target.value) / 255)
                }
                onDecrement={() => updateActivePoint('x', (activePoint?.x ?? 0) - 1 / 255)}
                onIncrement={() => updateActivePoint('x', (activePoint?.x ?? 0) + 1 / 255)}
              />
              <NumberInput
                size="sm"
                label="Output"
                font="mono"
                value={String(Math.round((activePoint?.y ?? 0) * 255))}
                decrementLabel="Decrease tone curve output"
                incrementLabel="Increase tone curve output"
                onChange={(event) =>
                  updateActivePoint('y', Number.parseFloat(event.target.value) / 255)
                }
                onDecrement={() => updateActivePoint('y', (activePoint?.y ?? 0) - 1 / 255)}
                onIncrement={() => updateActivePoint('y', (activePoint?.y ?? 0) + 1 / 255)}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag a point or focus it and use arrow keys; hold <code>Shift</code> for larger
          adjustments. Double-click the graph to insert a point, and press <code>Delete</code> on a
          middle point to remove it. Endpoints retain their input positions.
        </p>
      </Section>

      <Section title="Shape the tonal range deliberately">
        <div className="tone-curve-guidance">
          <div>
            <span className="fk-tag spec-label">Luminance</span>
            <strong>Start with light</strong>
            <p>
              Use the Luma curve for broad contrast before making individual channel corrections.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Histogram</span>
            <strong>Keep context quiet</strong>
            <p>
              The backdrop indicates where image detail lives without competing with the editable
              curve.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Points</span>
            <strong>Add only meaningful bends</strong>
            <p>
              Two to four deliberate points are usually easier to tune and hand off than a dense
              curve.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { ToneCurve, type ToneCurvePoint } from '@presentstandards/framekit-ui';

const [points, setPoints] = useState<ToneCurvePoint[]>([
  { id: 'black', x: 0, y: 0 },
  { id: 'shadow', x: 0.24, y: 0.18 },
  { id: 'highlight', x: 0.74, y: 0.82 },
  { id: 'white', x: 1, y: 1 },
]);

<ToneCurve value={points} onValueChange={setPoints} channel="luminance" />;`}</code>
        </pre>
      </Section>
    </>
  );
}
