import { useState } from 'react';
import { SegmentedSwitch } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const FRAME_RATE_OPTIONS = [
  { value: '24', label: '24' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
];

const QUALITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'mid', label: 'Mid' },
  { value: 'high', label: 'High' },
];

const ASPECT_OPTIONS = [
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
  { value: '9:16', label: '9:16' },
  { value: '16:9', label: '16:9' },
];

const HOLD_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'on', label: 'On' },
];

export function SegmentedSwitches() {
  const [frameRate, setFrameRate] = useState('60');
  const [quality, setQuality] = useState('high');
  const [aspect, setAspect] = useState('16:9');
  const [hold, setHold] = useState('off');
  const [density, setDensity] = useState('compact');
  const [playback, setPlayback] = useState('loop');

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Segmented switch"
        lede="A compact, mutually exclusive choice control for tool settings such as frame rate, quality, aspect ratio, and hold. Its selected surface moves between short, fixed labels."
      />

      <Section title="Tool settings">
        <p className="section-intro">
          The quiet, thin switch from the original kit, refined as a reusable component. Keep it to
          a small, stable set of short labels so the selected segment remains easy to scan.
        </p>
        <div className="demo">
          <div className="segmented-settings">
            <div className="segmented-setting-row">
              <span>Frame rate</span>
              <SegmentedSwitch
                aria-label="Frame rate"
                options={FRAME_RATE_OPTIONS}
                value={frameRate}
                onValueChange={setFrameRate}
              />
            </div>
            <div className="segmented-setting-row">
              <span>Quality</span>
              <SegmentedSwitch
                aria-label="Quality"
                options={QUALITY_OPTIONS}
                value={quality}
                onValueChange={setQuality}
              />
            </div>
            <div className="segmented-setting-row">
              <span>Aspect</span>
              <SegmentedSwitch
                aria-label="Aspect ratio"
                options={ASPECT_OPTIONS}
                value={aspect}
                onValueChange={setAspect}
              />
            </div>
            <div className="segmented-setting-row">
              <span>Hold video</span>
              <SegmentedSwitch
                aria-label="Hold video"
                options={HOLD_OPTIONS}
                value={hold}
                onValueChange={setHold}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          The selected block is a quiet raised surface, not a filled pill. Accent colour marks only
          the active label.
        </p>
      </Section>

      <Section title="Density and width">
        <p className="section-intro">
          Use <code>sm</code> in compact rows and <code>md</code> alongside standard panel controls.
          Add <code>fullWidth</code> when the choice should share the full width of a narrow
          inspector.
        </p>
        <div className="demo">
          <div className="segmented-density-showcase">
            <div className="segmented-density-sample">
              <span className="fk-tag spec-label">Compact / 24px</span>
              <SegmentedSwitch
                aria-label="Timeline density"
                size="sm"
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'roomy', label: 'Roomy' },
                ]}
                value={density}
                onValueChange={setDensity}
              />
            </div>
            <div className="segmented-density-sample">
              <span className="fk-tag spec-label">Full width / 30px</span>
              <SegmentedSwitch
                aria-label="Playback mode"
                fullWidth
                options={[
                  { value: 'once', label: 'Once' },
                  { value: 'loop', label: 'Loop' },
                  { value: 'ping-pong', label: 'Ping-pong' },
                ]}
                value={playback}
                onValueChange={setPlayback}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { SegmentedSwitch } from '@presentstandards/framekit-ui';

const frameRateOptions = [
  { value: '24', label: '24' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
];

<SegmentedSwitch
  aria-label="Frame rate"
  options={frameRateOptions}
  value={frameRate}
  onValueChange={setFrameRate}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
