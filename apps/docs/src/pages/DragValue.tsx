import { useState } from 'react';
import { DragValue } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const percent = (value: number) => `${Math.round(value)}%`;
const pixels = (value: number) => `${value.toFixed(1)} PX`;
const signedPixels = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} PX`;

export function DragValuePage() {
  const [opacity, setOpacity] = useState(74);
  const [blur, setBlur] = useState(16);
  const [offset, setOffset] = useState(-18);
  const [radius, setRadius] = useState(18);
  const [rotation, setRotation] = useState(42);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Drag value"
        lede="A direct-manipulation value field for canvas and inspector work. It turns the value itself into the control: drag, scrub with keys, reset, and keep the interface moving."
      />

      <Section title="Direct manipulation">
        <p className="section-intro">
          Drag horizontally anywhere on the control to set the value. Arrow keys make predictable
          steps; hold Shift for a fine increment or Alt for a coarse increment. A double click
          restores <code>resetValue</code>, which makes common creative adjustments delightfully
          quick.
        </p>
        <div className="demo">
          <div className="drag-value-inspector">
            <DragValue
              label="Opacity"
              value={opacity}
              resetValue={100}
              onValueChange={setOpacity}
              formatValue={percent}
            />
            <DragValue
              label="Blur"
              value={blur}
              min={0}
              max={64}
              step={1}
              fineStep={0.1}
              coarseStep={8}
              resetValue={0}
              onValueChange={setBlur}
              formatValue={pixels}
            />
          </div>
          <p className="value-control-hint">Double click either value to reset it.</p>
        </div>
      </Section>

      <Section title="Graphic variations">
        <p className="section-intro">
          Keep the same filled drag surface, then add a visual reference only when it makes a
          creative adjustment easier to read: an active handle, measured ticks, or a zero point.
        </p>
        <div className="demo">
          <div className="drag-value-inspector">
            <div className="drag-value-variation">
              <div className="drag-value-variation__meta">
                <span className="fk-tag spec-label">Zero reference</span>
                <code>variant="bipolar" · decoration="zero"</code>
              </div>
              <DragValue
                label="Horizontal offset"
                variant="bipolar"
                decoration="zero"
                value={offset}
                min={-80}
                max={80}
                step={1}
                fineStep={0.1}
                coarseStep={10}
                resetValue={0}
                onValueChange={setOffset}
                formatValue={signedPixels}
              />
            </div>
            <div className="drag-value-variation">
              <div className="drag-value-variation__meta">
                <span className="fk-tag spec-label">Active edge</span>
                <code>decoration="handle"</code>
              </div>
              <DragValue
                label="Corner radius"
                decoration="handle"
                value={radius}
                min={0}
                max={64}
                step={1}
                fineStep={0.5}
                coarseStep={8}
                resetValue={0}
                onValueChange={setRadius}
                formatValue={pixels}
              />
            </div>
            <div className="drag-value-variation">
              <div className="drag-value-variation__meta">
                <span className="fk-tag spec-label">Measured scale</span>
                <code>decoration="ticks"</code>
              </div>
              <DragValue
                label="Rotation"
                decoration="ticks"
                value={rotation}
                min={0}
                max={360}
                step={1}
                fineStep={0.5}
                coarseStep={15}
                resetValue={0}
                onValueChange={setRotation}
                formatValue={(value) => `${Math.round(value)}°`}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Label alignment">
        <p className="section-intro">
          Align the label-and-value readout with the surrounding inspector or canvas layout. The
          default is centred; left and right keep the same contrast treatment as the fill moves
          beneath the text.
        </p>
        <div className="demo">
          <div className="value-control-stack">
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Left</span>
              <DragValue
                label="Opacity"
                labelAlign="left"
                value={opacity}
                resetValue={100}
                onValueChange={setOpacity}
                formatValue={percent}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Centre</span>
              <DragValue
                label="Opacity"
                labelAlign="center"
                value={opacity}
                resetValue={100}
                onValueChange={setOpacity}
                formatValue={percent}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Right</span>
              <DragValue
                label="Opacity"
                labelAlign="right"
                value={opacity}
                resetValue={100}
                onValueChange={setOpacity}
                formatValue={percent}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Size scale">
        <div className="demo">
          <div className="value-control-stack">
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Small</span>
              <DragValue
                label="Blur"
                size="sm"
                value={blur}
                min={0}
                max={64}
                onValueChange={setBlur}
                formatValue={pixels}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Medium</span>
              <DragValue
                label="Blur"
                value={blur}
                min={0}
                max={64}
                onValueChange={setBlur}
                formatValue={pixels}
              />
            </div>
            <div className="value-control-sample">
              <span className="fk-tag spec-label">Large</span>
              <DragValue
                label="Blur"
                size="lg"
                value={blur}
                min={0}
                max={64}
                onValueChange={setBlur}
                formatValue={pixels}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { DragValue } from '@presentstandards/framekit-ui';

<DragValue
  label="Horizontal offset"
  variant="bipolar"
  decoration="zero"
  value={offset}
  min={-80}
  max={80}
  fineStep={0.1}
  coarseStep={10}
  resetValue={0}
  onValueChange={setOffset}
 />

<DragValue
  label="Corner radius"
  labelAlign="right"
  decoration="handle"
  value={radius}
  min={0}
  max={64}
  onValueChange={setRadius}
 />

<DragValue
  label="Rotation"
  decoration="ticks"
  value={rotation}
  min={0}
  max={360}
  onValueChange={setRotation}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
