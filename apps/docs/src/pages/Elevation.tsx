import { Button } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const SHADOWS = [
  { token: '--fk-shadow-sm', label: 'sm', use: 'Raised cards, subtle lift' },
  { token: '--fk-shadow-md', label: 'md', use: 'Popovers, menus, dropdowns' },
  { token: '--fk-shadow-lg', label: 'lg', use: 'Dialogs, drag states' },
];

export function Elevation() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Elevation"
        lede="Structure comes from hairline borders; shadows are reserved for true elevation. Light mode lifts raised surfaces off-ramp to pure white — dark mode steps up the neutral ramp."
      />

      <Section title="Surface stack">
        <div className="surface-tier surface-tier-app">
          <span className="surface-tier-label">--fk-bg-app</span>
          <div className="surface-tier surface-tier-surface">
            <span className="surface-tier-label">--fk-bg-surface</span>
            <div className="surface-tier surface-tier-raised">
              <span className="surface-tier-label">--fk-bg-raised</span>
              <p className="surface-tier-body">
                Three tiers cover every layout: the app canvas, panels and wells, and raised
                elements that float — cards, popovers, menus.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Shadows">
        <div className="shadow-grid">
          {SHADOWS.map((s) => (
            <div className="shadow-demo" key={s.token} style={{ boxShadow: `var(${s.token})` }}>
              <code>{s.token}</code>
              <span>{s.use}</span>
            </div>
          ))}
        </div>
        <p className="section-note">
          Shadows are tuned per theme — heavier in the dark, where borders alone can't separate
          overlapping surfaces.
        </p>
      </Section>

      <Section title="Overlay">
        <div className="overlay-demo">
          <div className="overlay-demo-content" aria-hidden="true">
            <div className="fake-row" style={{ width: '40%' }} />
            <div className="fake-row" style={{ width: '85%' }} />
            <div className="fake-row" style={{ width: '70%' }} />
            <div className="fake-row" style={{ width: '78%' }} />
            <div className="fake-row" style={{ width: '30%' }} />
          </div>
          <div className="overlay-scrim">
            <div className="overlay-dialog">
              <span className="overlay-dialog-title">Discard changes?</span>
              <span className="overlay-dialog-body">
                --fk-bg-overlay dims the canvas; the dialog rides --fk-shadow-lg.
              </span>
              <div className="overlay-dialog-actions">
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
                <Button size="sm" variant="danger">
                  Discard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
