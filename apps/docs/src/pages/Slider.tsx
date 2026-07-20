import { useState } from 'react';
import { Slider } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const percent = (value: number) => `${Math.round(value)}%`;

export function SliderPage() {
  const [opacity, setOpacity] = useState(72);
  const [scale, setScale] = useState(100);
  const [feather, setFeather] = useState(18);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Slider"
        lede="A familiar native range control, tuned for clear continuous adjustments in creative tool panels. It keeps the browser’s resilient keyboard and assistive-technology behavior."
      />

      <Section title="Everyday range">
        <p className="section-intro">
          Use the standard slider when a value benefits from an obvious track and a predictable
          range. The optional readout makes it work well in property panels without adding another
          separate value field.
        </p>
        <div className="demo">
          <div className="value-control-stack">
            <Slider
              label="Opacity"
              value={opacity}
              onValueChange={setOpacity}
              formatValue={percent}
            />
            <Slider
              label="Scale"
              value={scale}
              min={25}
              max={200}
              step={5}
              onValueChange={setScale}
              formatValue={percent}
            />
          </div>
        </div>
      </Section>

      <Section title="Size scale">
        <p className="section-intro">
          Keep <code>sm</code> for compact popovers, <code>md</code> for regular inspectors, and{' '}
          <code>lg</code> for prominent adjustments or touch-forward surfaces.
        </p>
        <div className="demo">
          <div className="value-control-stack">
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Small</span>
              <Slider
                aria-label="Small feather"
                size="sm"
                value={feather}
                onValueChange={setFeather}
                formatValue={(value) => `${value} PX`}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Medium</span>
              <Slider
                aria-label="Medium feather"
                value={feather}
                onValueChange={setFeather}
                formatValue={(value) => `${value} PX`}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Large</span>
              <Slider
                aria-label="Large feather"
                size="lg"
                value={feather}
                onValueChange={setFeather}
                formatValue={(value) => `${value} PX`}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Slider } from '@presentstandards/framekit-ui';

<Slider
  label="Opacity"
  value={opacity}
  min={0}
  max={100}
  onValueChange={setOpacity}
  formatValue={(value) => \`${'${value}'}%\`}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
