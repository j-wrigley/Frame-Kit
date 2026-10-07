import { useState } from 'react';
import { Dropdown, FieldNote } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const QUALITY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
  { value: 'max', label: 'Max' },
];

const FPS_OPTIONS = [
  { value: '24', label: '24 fps' },
  { value: '30', label: '30 fps' },
  { value: '60', label: '60 fps' },
];

const SCALE_OPTIONS = [
  { value: '1', label: '1×' },
  { value: '2', label: '2×' },
  { value: '3', label: '3×' },
  { value: '4', label: '4×' },
];

/** Megabits per second for a 3 s clip at 1920×1080 — a docs stand-in. */
const MBPS: Record<string, number> = { standard: 5.6, high: 9.5, max: 14 };

export function FieldNotePage() {
  const [quality, setQuality] = useState('high');
  const [fps, setFps] = useState('30');
  const [scale, setScale] = useState('3');

  const megabytes = (MBPS[quality]! * Math.pow(Number(fps) / 30, 0.6) * 3) / 8;
  const tooLarge = Number(scale) * 3840 > 8192;

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Field note"
        lede="One quiet line under a control row: the facts a setting produces, or — in danger — why it can't be done. One text style, no icon."
      />

      <Section title="Readout">
        <p className="section-intro">
          Terse facts joined with <code>·</code>: size, codec, an estimate. Figures are tabular, so
          a live number never shifts the line.
        </p>
        <div className="demo">
          <div className="docs-field-note-demo">
            <div className="docs-field-note-row">
              <Dropdown
                label="Quality"
                size="sm"
                fullWidth
                options={QUALITY_OPTIONS}
                value={quality}
                onValueChange={setQuality}
              />
              <Dropdown
                label="Frame rate"
                size="sm"
                fullWidth
                options={FPS_OPTIONS}
                value={fps}
                onValueChange={setFps}
              />
            </div>
            <FieldNote>{`1920×1080 · H.264 · ~${megabytes.toFixed(1)} MB`}</FieldNote>
          </div>
        </div>
      </Section>

      <Section title="Danger">
        <p className="section-intro">
          <code>tone=&quot;danger&quot;</code> replaces the readout when a row can't work, and says
          why in words. Give it an <code>id</code> and point the control's field at it with{' '}
          <code>aria-describedby</code>.
        </p>
        <div className="demo">
          <div className="docs-field-note-demo">
            <div className="docs-field-note-row">
              <Dropdown
                label="Size"
                size="sm"
                fullWidth
                options={SCALE_OPTIONS}
                value={scale}
                onValueChange={setScale}
              />
            </div>
            <FieldNote tone={tooLarge ? 'danger' : 'default'}>
              {tooLarge
                ? 'Too large · max 8192×4320'
                : `${3840 * Number(scale)}×${2160 * Number(scale)} · HEVC`}
            </FieldNote>
          </div>
        </div>
        <p className="section-note">
          Use danger only for something that blocks; a notice (such as a slower encoder) stays in
          the default tone.
        </p>
      </Section>
    </>
  );
}
