import { useState } from 'react';
import { RulerSlider } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const degrees = (value: number) => `${Math.round(value)}°`;
const signedPixels = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} PX`;

export function RulerSliderPage() {
  const [rotation, setRotation] = useState(28);
  const [offset, setOffset] = useState(-12);
  const [duration, setDuration] = useState(460);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Ruler slider"
        lede="A precision, pointer-first slider with an embedded measurement scale. It makes continuous creative values feel spatial without becoming visually heavy."
      />

      <Section title="Measured adjustment">
        <p className="section-intro">
          The ruler gives a value useful context for transform, timing, and spatial controls. Drag
          anywhere on the scale, use the arrow keys for one increment, Shift+arrow for fine moves,
          and Alt+arrow or Page Up/Down for coarse moves.
        </p>
        <div className="demo">
          <div className="value-control-stack">
            <RulerSlider
              label="Rotation"
              value={rotation}
              min={-180}
              max={180}
              step={1}
              fineStep={0.1}
              coarseStep={15}
              onValueChange={setRotation}
              formatValue={degrees}
            />
            <RulerSlider
              label="Vertical offset"
              value={offset}
              min={-64}
              max={64}
              step={1}
              fineStep={0.1}
              coarseStep={8}
              onValueChange={setOffset}
              formatValue={signedPixels}
            />
          </div>
        </div>
      </Section>

      <Section title="Size scale">
        <p className="section-intro">
          The same ruler language holds up from tight inspector rows through larger, focused
          controls. Labels can be omitted when surrounding interface context already names the
          value.
        </p>
        <div className="demo">
          <div className="value-control-stack">
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Small</span>
              <RulerSlider
                label="Small duration"
                size="sm"
                showLabel={false}
                value={duration}
                min={0}
                max={1200}
                step={10}
                fineStep={1}
                coarseStep={100}
                onValueChange={setDuration}
                formatValue={(value) => `${value} MS`}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Medium</span>
              <RulerSlider
                label="Medium duration"
                showLabel={false}
                value={duration}
                min={0}
                max={1200}
                step={10}
                fineStep={1}
                coarseStep={100}
                onValueChange={setDuration}
                formatValue={(value) => `${value} MS`}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Large</span>
              <RulerSlider
                label="Large duration"
                size="lg"
                showLabel={false}
                value={duration}
                min={0}
                max={1200}
                step={10}
                fineStep={1}
                coarseStep={100}
                onValueChange={setDuration}
                formatValue={(value) => `${value} MS`}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { RulerSlider } from '@presentstandards/framekit-ui';

<RulerSlider
  label="Rotation"
  value={rotation}
  min={-180}
  max={180}
  fineStep={0.1}
  coarseStep={15}
  onValueChange={setRotation}
  formatValue={(value) => \`${'${value}'}°\`}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
