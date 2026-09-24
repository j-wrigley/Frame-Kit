import { useState } from 'react';
import {
  Disclosure,
  Dropdown,
  NestedDropdown,
  SegmentedSwitch,
  ToggleRow,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const METRIC_OPTIONS = [
  { value: 'duration', label: 'Duration', description: 'Time based' },
  { value: 'distance', label: 'Distance', description: 'Spatial' },
  { value: 'velocity', label: 'Velocity', description: 'Rate based' },
  { value: 'custom', label: 'Custom', description: 'Unavailable', disabled: true },
];

const PLAYBACK_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'hold', label: 'Hold' },
  { value: 'loop', label: 'Loop' },
];

export function Dropdowns() {
  const [metric, setMetric] = useState('duration');
  const [mode, setMode] = useState('auto');
  const [snap, setSnap] = useState(true);
  const [handles, setHandles] = useState(false);
  const [responseOpen, setResponseOpen] = useState(true);
  const [soften, setSoften] = useState(true);
  const [preserve, setPreserve] = useState(false);
  const [plainOpen, setPlainOpen] = useState(true);
  const [softOpen, setSoftOpen] = useState(true);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Dropdowns"
        lede="Custom selection lists, composed nested panels, and inline disclosures for compact tool settings. Each treatment stays quiet at rest and adds structure only when a setting needs it."
      />

      <Section title="Custom dropdown">
        <p className="section-intro">
          Use the custom dropdown for a short single-select list. It supports controlled or
          uncontrolled values, descriptions, disabled options, outside dismissal, and expected
          Arrow, Home, End, and Escape keyboard behavior.
        </p>
        <div className="demo">
          <div className="dropdown-showcase">
            <span className="fk-tag spec-label">Metric</span>
            <Dropdown
              label="Animation metric"
              options={METRIC_OPTIONS}
              value={metric}
              onValueChange={setMetric}
              fullWidth
            />
          </div>
        </div>
      </Section>

      <Section title="Nested dropdown">
        <p className="section-intro">
          Use the nested panel when a compact group of controls belongs behind one summary. The
          panel accepts normal Frame Kit components, so settings stay familiar and keyboard-ready.
        </p>
        <div className="demo">
          <div className="dropdown-showcase">
            <NestedDropdown
              label="Animation"
              summary={`${mode} · ${snap ? 'snap' : 'free'}`}
              panelLabel="Animation controls"
              fullWidth
            >
              <span className="fk-tag dropdown-panel-label">Playback</span>
              <SegmentedSwitch
                aria-label="Playback mode"
                options={PLAYBACK_OPTIONS}
                value={mode}
                onValueChange={setMode}
                fullWidth
                size="sm"
              />
              <div className="dropdown-panel-rows">
                <ToggleRow
                  variant="compact"
                  label="Snap frame"
                  checked={snap}
                  onChange={(event) => setSnap(event.target.checked)}
                />
                <ToggleRow
                  variant="compact"
                  label="Preview handles"
                  checked={handles}
                  onChange={(event) => setHandles(event.target.checked)}
                />
              </div>
            </NestedDropdown>
          </div>
        </div>
        <p className="section-note">
          Press <code>Escape</code> or click outside an anchored panel to close it.
        </p>
      </Section>

      <Section title="Disclosure dropdown">
        <p className="section-intro">
          Keep optional, secondary settings in the existing inspector flow with a disclosure. Unlike
          the nested dropdown, its content opens inline and does not cover nearby controls.
        </p>
        <div className="demo">
          <div className="dropdown-showcase">
            <Disclosure
              label="Response"
              summary={responseOpen ? 'Open' : 'Closed'}
              open={responseOpen}
              onOpenChange={setResponseOpen}
            >
              <ToggleRow
                variant="compact"
                label="Soften corners"
                checked={soften}
                onChange={(event) => setSoften(event.target.checked)}
              />
              <ToggleRow
                variant="compact"
                label="Preserve velocity"
                checked={preserve}
                onChange={(event) => setPreserve(event.target.checked)}
              />
            </Disclosure>
          </div>
        </div>
      </Section>

      <Section title="Disclosure variants">
        <p className="section-intro">
          <code>plain</code> drops the border and fill for top-level inspector sections: a clean
          heading row with the chevron at the end. <code>soft</code> is a borderless filled group: use
          it nested inside a plain section, or as the sections themselves (right), stacked in
          <code>SidebarSection divided=&#123;false&#125;</code> so no rules sit between them.
        </p>
        <div className="demo">
          <div className="dropdown-showcase dropdown-showcase--inspector">
            <Disclosure
              variant="plain"
              label="Transform"
              open={plainOpen}
              onOpenChange={setPlainOpen}
            >
              <ToggleRow
                variant="compact"
                label="Soften corners"
                checked={soften}
                onChange={(event) => setSoften(event.target.checked)}
              />
              <Disclosure
                variant="soft"
                label="Response"
                summary={preserve ? 'Preserved' : 'Off'}
                open={softOpen}
                onOpenChange={setSoftOpen}
              >
                <ToggleRow
                  variant="compact"
                  label="Preserve velocity"
                  checked={preserve}
                  onChange={(event) => setPreserve(event.target.checked)}
                />
              </Disclosure>
            </Disclosure>
            <Disclosure variant="plain" label="Lighting" summary="Studio">
              <ToggleRow variant="compact" label="Soft shadows" defaultChecked />
            </Disclosure>
            <Disclosure variant="plain" label="Timing">
              <ToggleRow variant="compact" label="Loop" defaultChecked />
            </Disclosure>
          </div>
          <div className="dropdown-showcase dropdown-showcase--inspector dropdown-showcase--soft">
            <Disclosure variant="soft" label="Transform" defaultOpen>
              <ToggleRow variant="compact" label="Lock aspect" defaultChecked />
            </Disclosure>
            <Disclosure variant="soft" label="Lighting" summary="Studio">
              <ToggleRow variant="compact" label="Soft shadows" defaultChecked />
            </Disclosure>
            <Disclosure variant="soft" label="Timing">
              <ToggleRow variant="compact" label="Loop" defaultChecked />
            </Disclosure>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Disclosure, Dropdown, NestedDropdown } from '@presentstandards/framekit-ui';

<Dropdown
  label="Animation metric"
  options={[
    { value: 'duration', label: 'Duration' },
    { value: 'distance', label: 'Distance' },
  ]}
  value={metric}
  onValueChange={setMetric}
/>

<NestedDropdown label="Animation" summary="Auto · Snap" panelLabel="Animation controls">
  <PlaybackSettings />
</NestedDropdown>

<Disclosure label="Response" summary="Open" defaultOpen>
  <ResponseSettings />
</Disclosure>`}</code>
        </pre>
      </Section>
    </>
  );
}
