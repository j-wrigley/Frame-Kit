import { useState } from 'react';
import {
  AxisField,
  Button,
  Dropdown,
  NumberInput,
  ResetIcon,
  Toggle,
  type AxisFieldValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type FieldPreset = 'fine' | 'balanced' | 'coarse' | 'custom';
type AxisKey = keyof AxisFieldValue;

const PRESET_OPTIONS = [
  { value: 'fine', label: 'Fine', description: 'Low amount, small detail' },
  { value: 'balanced', label: 'Balanced', description: 'Even treatment' },
  { value: 'coarse', label: 'Coarse', description: 'Strong, broad texture' },
];

const PRESET_VALUES: Record<Exclude<FieldPreset, 'custom'>, AxisFieldValue> = {
  fine: { x: 0.3, y: 0.28 },
  balanced: { x: 0.52, y: 0.62 },
  coarse: { x: 0.78, y: 0.84 },
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function formatValue(value: AxisFieldValue) {
  return `Amount ${Math.round(value.x * 100)} · Scale ${Math.round(value.y * 100)}`;
}

export function AxisFieldPage() {
  const [preset, setPreset] = useState<FieldPreset>('balanced');
  const [customValue, setCustomValue] = useState<AxisFieldValue>(PRESET_VALUES.balanced);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const isCustom = preset === 'custom';
  const value = isCustom ? customValue : PRESET_VALUES[preset];

  const startCustom = () => {
    if (!isCustom) setCustomValue(value);
    setPreset('custom');
  };

  const selectPreset = (nextPreset: Exclude<FieldPreset, 'custom'>) => {
    setPreset(nextPreset);
  };

  const updateValue = (key: AxisKey, nextValue: number) => {
    if (!isCustom || !Number.isFinite(nextValue)) return;
    setCustomValue((current) => ({ ...current, [key]: clamp(nextValue) }));
  };

  const renderNumberInput = (label: string, key: AxisKey) => (
    <NumberInput
      key={key}
      size="sm"
      label={label}
      font="mono"
      value={String(Math.round(value[key] * 100))}
      disabled={!isCustom}
      decrementLabel={`Decrease ${label}`}
      incrementLabel={`Increase ${label}`}
      onChange={(event) => updateValue(key, Number.parseFloat(event.target.value) / 100)}
      onDecrement={() => updateValue(key, value[key] - 0.01)}
      onIncrement={() => updateValue(key, value[key] + 0.01)}
    />
  );

  const resetField = () => {
    setCustomValue(PRESET_VALUES.balanced);
    setPreset('balanced');
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Axis field"
        lede="A compact two-axis editor for shaping paired creative values. Its responsive dot field gives texture controls, scatter, diffusion, and similar effects one precise, reusable interaction pattern."
      />

      <Section title="Surface treatment inspector">
        <p className="section-intro">
          This example uses the field for amount and scale, but neither axis is baked into the
          component. Start from a concise preset, then switch to Custom for direct, repeatable
          adjustment.
        </p>
        <div className="demo">
          <div className="axis-field-inspector" aria-label="Surface treatment inspector">
            <div className="axis-field-inspector__heading">
              <div>
                <span className="fk-tag">Surface</span>
                <strong>Texture</strong>
              </div>
              <span className="axis-field-inspector__state">{isCustom ? 'Custom' : 'Preset'}</span>
            </div>

            <div className="axis-field-inspector__controls">
              <Dropdown
                label="Surface texture preset"
                options={PRESET_OPTIONS}
                value={isCustom ? undefined : preset}
                placeholder={isCustom ? 'Custom treatment' : 'Select treatment'}
                onValueChange={(nextPreset) =>
                  selectPreset(nextPreset as Exclude<FieldPreset, 'custom'>)
                }
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

            <AxisField
              value={value}
              onValueChange={setCustomValue}
              editable={isCustom}
              snapToGrid={snapToGrid}
              xLabel="Amount"
              yLabel="Scale"
              label="Surface treatment field"
            />

            <div className="axis-field-inspector__readout">
              <span className="fk-tag">Position</span>
              <output>{formatValue(value)}</output>
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset surface treatment"
                title="Reset surface treatment"
                onClick={resetField}
              />
            </div>

            <div className="axis-field-inspector__editing-strip">
              <div className="axis-field-inspector__value-grid">
                {renderNumberInput('Amount', 'x')}
                {renderNumberInput('Scale', 'y')}
              </div>
              <label className="axis-field-inspector__snap">
                <span>Snap</span>
                <Toggle
                  size="sm"
                  aria-label="Snap axis field value to dot positions"
                  checked={snapToGrid}
                  onChange={(event) => setSnapToGrid(event.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
        <p className="section-note">
          In Custom mode, click or drag anywhere in the field, or focus the handle and use arrow
          keys. Hold <code>Shift</code> for larger movements; Snap makes every visible dot a
          repeatable value pair.
        </p>
      </Section>

      <Section title="Make paired values tangible">
        <div className="axis-field-guidance">
          <div>
            <span className="fk-tag spec-label">Neutral API</span>
            <strong>Let the product name each axis</strong>
            <p>Use the same field for amount and scale, scatter and spread, or any related pair.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Dot response</span>
            <strong>Show the active region</strong>
            <p>
              Quiet dots become denser near the handle, giving the field life without becoming a
              chart.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Precision</span>
            <strong>Keep exact values close</strong>
            <p>
              Pair direct manipulation with compact values and an optional snap grid for handoff.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { AxisField, type AxisFieldValue } from '@presentstandards/framekit-ui';

const [treatment, setTreatment] = useState<AxisFieldValue>({
  x: 0.52,
  y: 0.62,
});

<AxisField
  value={treatment}
  onValueChange={setTreatment}
  xLabel="Amount"
  yLabel="Scale"
  snapToGrid
  label="Surface treatment field"
/>;

// Compose with Dropdown, Toggle, and NumberInput for a full inspector.`}</code>
        </pre>
      </Section>
    </>
  );
}
