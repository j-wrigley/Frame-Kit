import { useState } from 'react';
import {
  Button,
  Dropdown,
  EasingGraph,
  type EasingCurve,
  NumberInput,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type PresetValue = 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'custom';
type CurveKey = keyof EasingCurve;

const PRESET_OPTIONS = [
  { value: 'ease', label: 'Ease', description: 'Balanced default' },
  { value: 'linear', label: 'Linear', description: 'Constant velocity' },
  { value: 'ease-in', label: 'Ease in', description: 'Slow start' },
  { value: 'ease-out', label: 'Ease out', description: 'Gentle landing' },
  { value: 'ease-in-out', label: 'Ease in out', description: 'Soft both ends' },
];

const PRESET_CURVES: Record<Exclude<PresetValue, 'custom'>, EasingCurve> = {
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  linear: { x1: 0, y1: 0, x2: 1, y2: 1 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function formatCurve(curve: EasingCurve) {
  return `cubic-bezier(${curve.x1.toFixed(2)}, ${curve.y1.toFixed(2)}, ${curve.x2.toFixed(2)}, ${curve.y2.toFixed(2)})`;
}

export function EasingGraphPage() {
  const [preset, setPreset] = useState<PresetValue>('ease');
  const [customCurve, setCustomCurve] = useState<EasingCurve>(PRESET_CURVES.ease);
  const isCustom = preset === 'custom';
  const curve = isCustom ? customCurve : PRESET_CURVES[preset];

  const startCustom = () => {
    if (!isCustom) setCustomCurve(curve);
    setPreset('custom');
  };

  const updateCustomValue = (key: CurveKey, value: number) => {
    setCustomCurve((current) => ({ ...current, [key]: clamp(value) }));
  };

  const renderNumberInput = (label: string, key: CurveKey) => (
    <NumberInput
      key={key}
      size="sm"
      label={label}
      font="mono"
      value={curve[key].toFixed(2)}
      disabled={!isCustom}
      decrementLabel={`Decrease ${label}`}
      incrementLabel={`Increase ${label}`}
      onChange={(event) => {
        const next = Number.parseFloat(event.target.value);
        if (Number.isFinite(next)) updateCustomValue(key, next);
      }}
      onDecrement={() => updateCustomValue(key, curve[key] - 0.01)}
      onIncrement={() => updateCustomValue(key, curve[key] + 0.01)}
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Easing graph"
        lede="A compact cubic-bezier editor for motion inspectors. Start from a familiar preset, then expose direct handles and exact values only when a transition needs fine tuning."
      />

      <Section title="Animation easing inspector">
        <p className="section-intro">
          A complete, production-scale panel for a single animation setting. The preset, visual
          curve, readout, and control points stay together so the result is easy to understand and
          adjust.
        </p>
        <div className="demo">
          <div className="easing-inspector" aria-label="Animation easing inspector">
            <div className="easing-inspector__heading">
              <div>
                <span className="fk-tag">Animation</span>
                <strong>Easing</strong>
              </div>
              <span className="easing-inspector__state">{isCustom ? 'Custom' : 'Preset'}</span>
            </div>

            <div className="easing-inspector__controls">
              <Dropdown
                label="Easing preset"
                options={PRESET_OPTIONS}
                value={isCustom ? undefined : preset}
                placeholder={isCustom ? 'Custom curve' : 'Select curve'}
                onValueChange={(nextPreset) => setPreset(nextPreset as PresetValue)}
                fullWidth
              />
              <Button
                variant={isCustom ? 'primary' : 'secondary'}
                size="md"
                aria-pressed={isCustom}
                onClick={startCustom}
              >
                Custom
              </Button>
            </div>

            <EasingGraph
              value={curve}
              onValueChange={setCustomCurve}
              editable={isCustom}
              label="Animation easing curve"
            />

            <div className="easing-inspector__readout">
              <span className="fk-tag">Cubic bezier</span>
              <output>{formatCurve(curve)}</output>
            </div>

            <div className="easing-inspector__fine-tuning">
              <div className="easing-inspector__fine-tuning-heading">
                <span className="fk-tag">Control points</span>
                <span>{isCustom ? 'Fine tuning enabled' : 'Choose Custom to edit'}</span>
              </div>
              <div className="easing-inspector__point-grid">
                {renderNumberInput('P1 X', 'x1')}
                {renderNumberInput('P1 Y', 'y1')}
                {renderNumberInput('P2 X', 'x2')}
                {renderNumberInput('P2 Y', 'y2')}
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Custom mode reveals two handles. Drag them or use arrow keys while a handle is focused;
          hold <code>Shift</code> for larger keyboard increments.
        </p>
      </Section>

      <Section title="Keep motion decisions clear">
        <div className="easing-guidance">
          <div>
            <span className="fk-tag spec-label">Presets</span>
            <strong>Start from a known feel</strong>
            <p>Use named curves for routine motion so timing stays recognizable across the tool.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Custom</span>
            <strong>Edit one clear curve</strong>
            <p>
              Keep one graph visible and show handles only while direct manipulation is enabled.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Values</span>
            <strong>Keep precision nearby</strong>
            <p>
              Pair the visual curve with compact numeric inputs when a handoff needs exact values.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { EasingGraph, type EasingCurve } from '@presentstandards/framekit-ui';

const [curve, setCurve] = useState<EasingCurve>({
  x1: 0.25,
  y1: 0.1,
  x2: 0.25,
  y2: 1,
});

<EasingGraph
  value={curve}
  onValueChange={setCurve}
  editable
  label="Animation easing curve"
/>;

// Compose with Dropdown and NumberInput for presets and exact values.`}</code>
        </pre>
      </Section>
    </>
  );
}
