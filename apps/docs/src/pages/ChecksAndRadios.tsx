import { useState } from 'react';
import { Checkbox, RadioGroup } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const MODE_OPTIONS = [
  { value: 'live', label: 'Live' },
  { value: 'draft', label: 'Draft' },
  { value: 'safe', label: 'Safe' },
  { value: 'locked', label: 'Locked', disabled: true },
];

const FIT_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'fill', label: 'Fill' },
  { value: 'crop', label: 'Crop' },
  { value: 'lock', label: 'Lock', disabled: true },
];

type PartialState = 'mixed' | 'checked' | 'unchecked';

export function ChecksAndRadios() {
  const [checks, setChecks] = useState({ grid: true, guides: false, bounds: true, snap: true });
  const [partial, setPartial] = useState<PartialState>('mixed');
  const [clear, setClear] = useState(false);
  const [mode, setMode] = useState('live');
  const [fit, setFit] = useState('fit');

  const updateCheck = (key: keyof typeof checks) => {
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  };

  const cyclePartial = () => {
    setPartial((current) => {
      if (current === 'mixed') return 'checked';
      if (current === 'checked') return 'unchecked';
      return 'checked';
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Checks & radios"
        lede="Native selection controls for independent canvas options and mutually exclusive tool modes. Compact rows preserve the original kit’s inspector rhythm without heavy surfaces."
      />

      <Section title="Check rows">
        <p className="section-intro">
          Use title-only rows for independent options. The whole row remains the native checkbox
          label, so it is easy to scan and easy to activate.
        </p>
        <div className="demo">
          <div className="choice-showcase choice-showcase--rows">
            <Checkbox
              label="Show grid"
              checked={checks.grid}
              onChange={() => updateCheck('grid')}
            />
            <Checkbox
              label="Smart guides"
              checked={checks.guides}
              onChange={() => updateCheck('guides')}
            />
            <Checkbox
              label="Export bounds"
              checked={checks.bounds}
              onChange={() => updateCheck('bounds')}
            />
            <Checkbox label="Locked preset" disabled />
          </div>
        </div>
        <p className="section-note">
          Checked rows use a quiet raised surface and accent label. They do not become filled
          buttons.
        </p>
      </Section>

      <Section title="Inline checks">
        <p className="section-intro">
          Use the inline treatment for familiar, independent tool toggles. It supports checked,
          mixed, disabled, and destructive intent without changing the native checkbox behavior.
        </p>
        <div className="demo">
          <div className="choice-inline-row">
            <Checkbox
              variant="inline"
              label="Snap"
              checked={checks.snap}
              onChange={() => updateCheck('snap')}
            />
            <Checkbox
              variant="inline"
              label="Lock"
              checked={checks.guides}
              onChange={() => updateCheck('guides')}
            />
            <Checkbox
              variant="inline"
              label="Partial"
              checked={partial === 'checked'}
              indeterminate={partial === 'mixed'}
              onChange={cyclePartial}
            />
            <Checkbox
              variant="inline"
              tone="danger"
              label="Clear"
              checked={clear}
              onChange={(event) => setClear(event.target.checked)}
            />
            <Checkbox variant="inline" label="Locked" disabled />
          </div>
        </div>
      </Section>

      <Section title="Radio groups">
        <p className="section-intro">
          Radios make a single choice. The stacked treatment fits inspector settings; use inline
          radios when the options are short, known modes.
        </p>
        <div className="demo">
          <div className="choice-showcase">
            <div className="choice-showcase__group">
              <span className="fk-tag spec-label">Stacked</span>
              <RadioGroup
                aria-label="Render mode"
                options={MODE_OPTIONS}
                value={mode}
                onValueChange={setMode}
              />
            </div>
            <div className="choice-showcase__group">
              <span className="fk-tag spec-label">Inline</span>
              <RadioGroup
                aria-label="Fit mode"
                variant="inline"
                options={FIT_OPTIONS}
                value={fit}
                onValueChange={setFit}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          Radio groups retain native Tab and Arrow-key behavior. Give every group an{' '}
          <code>aria-label</code> or <code>aria-labelledby</code>.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Checkbox, RadioGroup } from '@presentstandards/framekit-ui';

<Checkbox
  label="Show grid"
  checked={showGrid}
  onChange={(event) => setShowGrid(event.target.checked)}
/>

<Checkbox
  variant="inline"
  label="Partial"
  indeterminate={selectionState === 'mixed'}
  checked={selectionState === 'checked'}
  onChange={selectAll}
/>

<RadioGroup
  aria-label="Render mode"
  options={[
    { value: 'live', label: 'Live' },
    { value: 'draft', label: 'Draft' },
  ]}
  value={mode}
  onValueChange={setMode}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
