import { useState } from 'react';
import { Stepper } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function nudge(value: string, amount: number, min: number, max: number, precision = 0) {
  const current = Number.parseFloat(value);
  const next = clamp((Number.isFinite(current) ? current : min) + amount, min, max);
  return next.toFixed(precision);
}

export function StepperPage() {
  const [loops, setLoops] = useState('6');
  const [scale, setScale] = useState('2');
  const [duration, setDuration] = useState('1.25');
  const [frames, setFrames] = useState('30');
  const [zoom, setZoom] = useState('75');

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Stepper"
        lede="Small, precise increment controls for bounded tool values. Use a display stepper when direct typing would be unnecessary, or keep the center value editable when precision matters."
      />

      <Section title="Compact display">
        <p className="section-intro">
          Display steppers keep a tightly bounded setting legible without introducing another text
          field. Each stepped change flips through the value, while direct text entry remains still.
          The app owns the limits and the increment amount; the component only presents the actions
          and their disabled state.
        </p>
        <div className="demo">
          <div className="stepper-showcase__group">
            <span className="fk-tag spec-label">Bounded values</span>
            <div className="stepper-showcase__compact-row">
              <Stepper
                editable={false}
                label="Loop count"
                value={loops}
                decrementLabel="Decrease loops"
                incrementLabel="Increase loops"
                decrementDisabled={Number(loops) <= 1}
                incrementDisabled={Number(loops) >= 12}
                onDecrement={() => setLoops(nudge(loops, -1, 1, 12))}
                onIncrement={() => setLoops(nudge(loops, 1, 1, 12))}
              />
              <Stepper
                editable={false}
                label="Export scale"
                value={scale}
                suffix="×"
                decrementLabel="Decrease export scale"
                incrementLabel="Increase export scale"
                decrementDisabled={Number(scale) <= 1}
                incrementDisabled={Number(scale) >= 4}
                onDecrement={() => setScale(nudge(scale, -1, 1, 4))}
                onIncrement={() => setScale(nudge(scale, 1, 1, 4))}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Editable values">
        <p className="section-intro">
          Keep the middle value editable for timings, frame counts, and other values where a step is
          useful but not sufficient. <code>Stepper</code> deliberately uses a text input, so your
          application retains control over parsing, precision, and temporary input states.
        </p>
        <div className="demo">
          <div className="stepper-showcase__edit-grid">
            <div className="stepper-showcase__group">
              <span className="fk-tag spec-label">Duration</span>
              <Stepper
                label="Duration"
                value={duration}
                suffix="S"
                onChange={(event) => setDuration(event.target.value)}
                decrementDisabled={Number(duration) <= 0}
                incrementDisabled={Number(duration) >= 4}
                onDecrement={() => setDuration(nudge(duration, -0.25, 0, 4, 2))}
                onIncrement={() => setDuration(nudge(duration, 0.25, 0, 4, 2))}
              />
            </div>
            <div className="stepper-showcase__group">
              <span className="fk-tag spec-label">Frames</span>
              <Stepper
                label="Frame count"
                value={frames}
                suffix="FR"
                inputMode="numeric"
                onChange={(event) => setFrames(event.target.value)}
                decrementDisabled={Number(frames) <= 12}
                incrementDisabled={Number(frames) >= 60}
                onDecrement={() => setFrames(nudge(frames, -6, 12, 60))}
                onIncrement={() => setFrames(nudge(frames, 6, 12, 60))}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Property row">
        <p className="section-intro">
          A wide property row combines the stepper with an inspector label, keeping common canvas
          adjustments compact and in context.
        </p>
        <div className="demo">
          <div className="stepper-property-row">
            <span className="fk-tag">Zoom</span>
            <Stepper
              editable={false}
              label="Zoom amount"
              value={zoom}
              suffix="%"
              decrementDisabled={Number(zoom) <= 50}
              incrementDisabled={Number(zoom) >= 150}
              onDecrement={() => setZoom(nudge(zoom, -5, 50, 150))}
              onIncrement={() => setZoom(nudge(zoom, 5, 50, 150))}
            />
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Stepper } from '@presentstandards/framekit-ui';

<Stepper
  label="Duration"
  value={duration}
  suffix="S"
  onChange={(event) => setDuration(event.target.value)}
  onDecrement={() => setDuration(nudge(duration, -0.25))}
  onIncrement={() => setDuration(nudge(duration, 0.25))}
/>

<Stepper
  editable={false}
  label="Loop count"
  value={loops}
  decrementDisabled={loops <= 1}
  incrementDisabled={loops >= 12}
  onDecrement={() => setLoops((value) => value - 1)}
  onIncrement={() => setLoops((value) => value + 1)}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
