import { useState } from 'react';
import { DragValue, RulerReadout, Scrubber } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const percent = (value: number) => `${Math.round(value)}%`;
const pixels = (value: number) => `${Math.round(value)} PX`;
const signedPixels = (value: number) => `${value > 0 ? '+' : ''}${Math.round(value)} PX`;
const frames = (value: number) => `${Math.round(value)} FR`;

export function RulerReadoutsPage() {
  const [offset, setOffset] = useState(-18);
  const [trimStart, setTrimStart] = useState(42);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Ruler readouts"
        lede="A compact, non-interactive measurement reference for values adjusted elsewhere. Keep the range visible when spatial context matters, without turning every display into another slider."
      />

      <Section title="Measurement reference">
        <p className="section-intro">
          A ruler readout is a display, not an input. It keeps the active position, range, and an
          optional origin legible in a small footprint — ideal beside a canvas, inside an inspector,
          or in a timeline HUD.
        </p>
        <div className="demo">
          <div className="ruler-readout-grid">
            <RulerReadout
              label="Exposure"
              value={38}
              formatValue={percent}
              formatRangeValue={percent}
            />
            <RulerReadout
              label="Horizontal offset"
              value={-18}
              min={-80}
              max={80}
              origin={0}
              formatValue={signedPixels}
              formatRangeValue={pixels}
            />
            <RulerReadout
              label="Clip duration"
              value={72}
              min={0}
              max={120}
              formatValue={frames}
              formatRangeValue={frames}
            />
          </div>
        </div>
      </Section>

      <Section title="With value controls">
        <p className="section-intro">
          Pair a readout with a <code>DragValue</code> when direct manipulation needs a persistent
          spatial reference, or with a <code>Scrubber</code> when a compact inspector row benefits
          from a separate, always-visible range. The readout owns the property label and scale; the
          adjustment below stays number-led.
        </p>
        <div className="demo">
          <div className="ruler-readout-workbench">
            <div className="ruler-readout-workbench__panel">
              <RulerReadout
                label="Horizontal offset"
                value={offset}
                min={-80}
                max={80}
                origin={0}
                formatValue={signedPixels}
                formatRangeValue={pixels}
              />
              <DragValue
                label="Horizontal offset"
                showLabel={false}
                value={offset}
                min={-80}
                max={80}
                step={1}
                fineStep={0.1}
                coarseStep={10}
                variant="bipolar"
                decoration="zero"
                resetValue={0}
                onValueChange={setOffset}
                formatValue={signedPixels}
              />
            </div>
            <div className="ruler-readout-workbench__panel">
              <RulerReadout
                label="Clip in point"
                value={trimStart}
                min={0}
                max={120}
                formatValue={frames}
                formatRangeValue={frames}
              />
              <Scrubber
                label="Clip in point"
                showLabel={false}
                variant="ruler"
                value={trimStart}
                min={0}
                max={120}
                step={1}
                fineStep={0.5}
                coarseStep={10}
                onValueChange={setTrimStart}
                formatValue={frames}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Compact display">
        <p className="section-intro">
          Use the small size without range labels where surrounding UI already establishes the
          bounds, such as an on-canvas heads-up display.
        </p>
        <div className="demo">
          <div className="ruler-readout-compact">
            <RulerReadout
              label="Rotation"
              size="sm"
              value={28}
              min={-180}
              max={180}
              origin={0}
              hideRangeLabels
              formatValue={(value) => `${Math.round(value)}°`}
            />
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { RulerReadout } from '@presentstandards/framekit-ui';

<RulerReadout
  label="Horizontal offset"
  value={offset}
  min={-80}
  max={80}
  origin={0}
  formatValue={(value) => \`${'${value}'} PX\`}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
