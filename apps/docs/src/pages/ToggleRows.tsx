import { useState } from 'react';
import { Toggle, ToggleRow } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

export function ToggleRows() {
  const [settings, setSettings] = useState({
    guides: true,
    snap: false,
    previews: true,
    sound: false,
    clean: false,
    compact: true,
    keyboard: false,
  });

  const update = (key: keyof typeof settings) => (checked: boolean) => {
    setSettings((current) => ({ ...current, [key]: checked }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Toggle rows"
        lede="Native switch settings for immediate on or off decisions. They keep the original kit’s quiet status-row rhythm, now with a precise physical toggle and reusable inspector variants."
      />

      <Section title="Toggle controls">
        <p className="section-intro">
          Use a standalone toggle when the surrounding label already identifies the setting. It is a
          real native checkbox with switch semantics, not a pressed button imitation.
        </p>
        <div className="demo">
          <div className="toggle-control-showcase">
            <div className="toggle-control-showcase__sample">
              <span className="fk-tag spec-label">Standard</span>
              <Toggle
                aria-label="Canvas guides"
                checked={settings.guides}
                onChange={(event) => update('guides')(event.target.checked)}
              />
            </div>
            <div className="toggle-control-showcase__sample">
              <span className="fk-tag spec-label">Compact</span>
              <Toggle
                size="sm"
                aria-label="Snap to pixels"
                checked={settings.snap}
                onChange={(event) => update('snap')(event.target.checked)}
              />
            </div>
            <div className="toggle-control-showcase__sample">
              <span className="fk-tag spec-label">Disabled</span>
              <Toggle aria-label="Auto save unavailable" defaultChecked disabled />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Inspector rows">
        <p className="section-intro">
          The default row keeps a short description and optional state summary together with the
          toggle. Use this treatment for settings that benefit from a little context.
        </p>
        <div className="demo">
          <div className="toggle-rows-showcase">
            <ToggleRow
              label="Smart guides"
              description="Canvas"
              meta={settings.guides ? 'On' : 'Off'}
              checked={settings.guides}
              onChange={(event) => update('guides')(event.target.checked)}
            />
            <ToggleRow
              label="Pixel snap"
              description="Alignment"
              meta={settings.snap ? 'On' : 'Off'}
              checked={settings.snap}
              onChange={(event) => update('snap')(event.target.checked)}
            />
            <ToggleRow
              label="Live previews"
              description="Performance"
              meta={settings.previews ? 'On' : 'Off'}
              checked={settings.previews}
              onChange={(event) => update('previews')(event.target.checked)}
            />
          </div>
        </div>
        <p className="section-note">
          The switch carries state; a short <code>meta</code> value is optional, not required.
        </p>
      </Section>

      <Section title="Compact menu rows">
        <p className="section-intro">
          The compact variation follows the original kit’s minimal dropdown rows: no persistent
          container chrome, just a quiet hover surface and the toggle state.
        </p>
        <div className="demo">
          <div className="toggle-menu-panel">
            <ToggleRow
              variant="compact"
              label="Play sound"
              checked={settings.sound}
              onChange={(event) => update('sound')(event.target.checked)}
            />
            <ToggleRow
              variant="compact"
              label="Clean playback"
              checked={settings.clean}
              onChange={(event) => update('clean')(event.target.checked)}
            />
            <ToggleRow
              variant="compact"
              label="Show shortcuts"
              checked={settings.compact}
              onChange={(event) => update('compact')(event.target.checked)}
            />
          </div>
        </div>
      </Section>

      <Section title="Intent and availability">
        <p className="section-intro">
          Reserve the danger tone for a setting with a clearly destructive effect. Disabled rows
          stay readable without pretending they are available.
        </p>
        <div className="demo">
          <div className="toggle-rows-showcase">
            <ToggleRow
              tone="danger"
              label="Destructive edit"
              description="Replace original pixels"
              checked={settings.keyboard}
              onChange={(event) => update('keyboard')(event.target.checked)}
            />
            <ToggleRow
              label="Cloud sync"
              description="Managed by workspace"
              defaultChecked
              disabled
            />
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Toggle, ToggleRow } from '@presentstandards/framekit-ui';

<Toggle
  aria-label="Show guides"
  checked={showGuides}
  onChange={(event) => setShowGuides(event.target.checked)}
/>

<ToggleRow
  label="Smart guides"
  description="Canvas"
  checked={showGuides}
  onChange={(event) => setShowGuides(event.target.checked)}
/>

<ToggleRow
  variant="compact"
  label="Play sound"
  checked={playSound}
  onChange={(event) => setPlaySound(event.target.checked)}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
