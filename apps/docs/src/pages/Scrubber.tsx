import { useState } from 'react';
import { Scrubber } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const percent = (value: number) => `${Math.round(value)}%`;
const pixels = (value: number) => `${Math.round(value)} PX`;

export function ScrubberPage() {
  const [exposure, setExposure] = useState(54);
  const [mix, setMix] = useState(68);
  const [spacing, setSpacing] = useState(24);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Scrubber"
        lede="Compact, value-led adjustment rows for dense inspector surfaces. Choose the amount of scale and feedback each task needs instead of forcing every value into the same slider."
      />

      <Section title="Track styles">
        <p className="section-intro">
          <code>rail</code> is the quiet everyday choice. <code>meter</code> makes amount and
          intensity more legible, while <code>ruler</code> keeps a small spatial scale close to the
          value. All three support direct pointer adjustment and the same keyboard shortcuts.
        </p>
        <div className="demo">
          <div className="scrubber-inspector">
            <Scrubber
              label="Exposure"
              variant="rail"
              value={exposure}
              onValueChange={setExposure}
              formatValue={percent}
            />
            <Scrubber
              label="Blend"
              variant="meter"
              value={mix}
              onValueChange={setMix}
              formatValue={percent}
            />
            <Scrubber
              label="Spacing"
              variant="ruler"
              value={spacing}
              min={0}
              max={64}
              fineStep={0.5}
              coarseStep={8}
              onValueChange={setSpacing}
              formatValue={pixels}
            />
          </div>
        </div>
      </Section>

      <Section title="Size and surface">
        <p className="section-intro">
          The size scale matches the rest of Frame Kit. Use the bare surface when the row lives in
          an already delineated inspector or an on-canvas HUD.
        </p>
        <div className="demo">
          <div className="value-control-stack">
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Small</span>
              <Scrubber
                label="Spacing"
                size="sm"
                value={spacing}
                min={0}
                max={64}
                onValueChange={setSpacing}
                formatValue={pixels}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Medium bare</span>
              <Scrubber
                label="Spacing"
                surface="bare"
                value={spacing}
                min={0}
                max={64}
                onValueChange={setSpacing}
                formatValue={pixels}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Large</span>
              <Scrubber
                label="Spacing"
                size="lg"
                value={spacing}
                min={0}
                max={64}
                onValueChange={setSpacing}
                formatValue={pixels}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Scrubber } from '@presentstandards/framekit-ui';

<Scrubber
  label="Blend"
  variant="meter"
  value={mix}
  fineStep={0.5}
  coarseStep={10}
  onValueChange={setMix}
  formatValue={(value) => \`${'${value}'}%\`}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
