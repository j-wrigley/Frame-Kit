import { useState } from 'react';
import {
  Button,
  ModulationStrip,
  NumberInput,
  ResetIcon,
  SegmentedSwitch,
  Slider,
  type ModulationStripValue,
  type ModulationWaveform,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const WAVE_OPTIONS = [
  { value: 'sine', label: 'Sine' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'saw', label: 'Saw' },
  { value: 'square', label: 'Square' },
];

const DEFAULT_MODULATION: ModulationStripValue = {
  waveform: 'sine',
  phase: 0.18,
  rate: 1.25,
  intensity: 0.72,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatWaveform(value: ModulationWaveform) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ModulationStripPage() {
  const [modulation, setModulation] = useState<ModulationStripValue>(DEFAULT_MODULATION);

  const update = (next: Partial<ModulationStripValue>) =>
    setModulation((current) => ({ ...current, ...next }));

  const updateRate = (value: number) => {
    if (Number.isFinite(value)) update({ rate: clamp(value, 0.25, 4) });
  };

  const updatePhaseDegrees = (value: number) => {
    if (Number.isFinite(value)) update({ phase: (((value % 360) + 360) % 360) / 360 });
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Modulation strip"
        lede="A compact waveform field for procedural animation and effects. Keep wave shape, loop rate, offset, and intensity together so a repeating motion can be read before it is played."
      />

      <Section title="Loop modulation inspector">
        <p className="section-intro">
          The waveform shows the same settings the inspector owns: rate changes cycle density, phase
          shifts the loop offset, and intensity controls amplitude. Drag the waveform handle for a
          quick phase-and-intensity pass, then use the nearby fields for exact values.
        </p>
        <div className="demo">
          <div className="modulation-inspector" aria-label="Loop modulation inspector">
            <div className="modulation-inspector__heading">
              <div>
                <span className="fk-tag">Motion</span>
                <strong>Modulate</strong>
              </div>
              <span className="modulation-inspector__state">{modulation.rate.toFixed(2)} Hz</span>
            </div>

            <SegmentedSwitch
              size="sm"
              fullWidth
              aria-label="Modulation waveform"
              options={WAVE_OPTIONS}
              value={modulation.waveform}
              onValueChange={(waveform) => update({ waveform: waveform as ModulationWaveform })}
            />

            <ModulationStrip
              value={modulation}
              onValueChange={setModulation}
              label="Loop modulation waveform"
            />

            <div className="modulation-inspector__readout">
              <span className="fk-tag">Wave</span>
              <output>
                {formatWaveform(modulation.waveform)} · {modulation.rate.toFixed(2)} Hz
              </output>
              <span className="fk-tag">Phase</span>
              <output>
                {Math.round(modulation.phase * 360)}° · {Math.round(modulation.intensity * 100)}%
              </output>
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset loop modulation"
                title="Reset loop modulation"
                onClick={() => setModulation(DEFAULT_MODULATION)}
              />
            </div>

            <div className="modulation-inspector__fine-tuning">
              <div className="modulation-inspector__number-grid">
                <NumberInput
                  size="sm"
                  label="Rate"
                  font="mono"
                  value={modulation.rate.toFixed(2)}
                  decrementLabel="Decrease modulation rate"
                  incrementLabel="Increase modulation rate"
                  onChange={(event) => updateRate(Number.parseFloat(event.target.value))}
                  onDecrement={() => updateRate(modulation.rate - 0.05)}
                  onIncrement={() => updateRate(modulation.rate + 0.05)}
                />
                <NumberInput
                  size="sm"
                  label="Phase"
                  font="mono"
                  value={String(Math.round(modulation.phase * 360))}
                  decrementLabel="Decrease modulation phase"
                  incrementLabel="Increase modulation phase"
                  onChange={(event) => updatePhaseDegrees(Number.parseFloat(event.target.value))}
                  onDecrement={() => updatePhaseDegrees(modulation.phase * 360 - 5)}
                  onIncrement={() => updatePhaseDegrees(modulation.phase * 360 + 5)}
                />
              </div>
              <Slider
                size="sm"
                label="Intensity"
                value={Math.round(modulation.intensity * 100)}
                min={0}
                max={100}
                step={1}
                onValueChange={(intensity) => update({ intensity: intensity / 100 })}
                formatValue={(value) => `${value}%`}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          Focus the waveform handle and use <code>←</code>/<code>→</code> for phase or{' '}
          <code>↑</code>/<code>↓</code> for intensity. Hold <code>Shift</code> for larger steps;
          Home and End jump the phase to its loop bounds.
        </p>
      </Section>

      <Section title="Make the loop legible">
        <div className="modulation-guidance">
          <div>
            <span className="fk-tag spec-label">Wave shape</span>
            <strong>Choose a recognizable rhythm</strong>
            <p>Sine is smooth, triangle is linear, saw resets sharply, and square holds a state.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Rate</span>
            <strong>Let density show speed</strong>
            <p>
              Use cycle density in the strip as the quick visual read, then keep hertz nearby for
              handoff.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Intensity</span>
            <strong>Keep amplitude deliberate</strong>
            <p>
              Lower amplitudes add texture; reserve full intensity for a clearly visible motion
              effect.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { ModulationStrip, type ModulationStripValue } from '@presentstandards/framekit-ui';

const [modulation, setModulation] = useState<ModulationStripValue>({
  waveform: 'sine',
  phase: 0.18,
  rate: 1.25,
  intensity: 0.72,
});

<ModulationStrip
  value={modulation}
  onValueChange={setModulation}
  label="Loop modulation waveform"
/>;

// Compose with SegmentedSwitch, NumberInput, and Slider for a full inspector.`}</code>
        </pre>
      </Section>
    </>
  );
}
