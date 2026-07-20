import { useState } from 'react';
import { Button } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const TOKENS = [
  {
    token: '--fk-ease',
    value: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
    use: 'Every transition — one curve',
  },
  { token: '--fk-duration-fast', value: '120ms', use: 'Hover and press feedback' },
  { token: '--fk-duration', value: '180ms', use: 'Reveals, popovers, toggles' },
];

export function Motion() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Motion"
        lede="One easing curve, two durations. Animation confirms an action — it never performs."
      />

      <Section title="Tokens">
        <div className="token-table">
          {TOKENS.map((t) => (
            <div className="token-row" key={t.token}>
              <code className="token-name">{t.token}</code>
              <span className="token-value">{t.value}</span>
              <span className="token-usage">{t.use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Feel">
        <div className="motion-grid">
          <div className="motion-demo">
            <div>
              <span className="motion-demo-title">Fast · 120ms</span>
              <span className="motion-demo-note">
                Hover or focus the track — press-and-hover feedback.
              </span>
            </div>
            <button
              type="button"
              className="motion-track"
              aria-label="Preview the 120ms transition"
            >
              <span className="motion-puck" />
            </button>
          </div>

          <div className="motion-demo">
            <div>
              <span className="motion-demo-title">Base · 180ms</span>
              <span className="motion-demo-note">
                Reveals and popovers — one 180ms move, in and out.
              </span>
            </div>
            <div className="motion-toggle-area">
              <Button size="sm" onClick={() => setOpen(!open)}>
                {open ? 'Hide panel' : 'Show panel'}
              </Button>
              <div className={`motion-pop${open ? ' open' : ''}`} aria-hidden={!open}>
                Snap to grid · 8px
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Reduced motion">
        <p className="section-intro">
          The kit's base styles collapse every transition and animation under{' '}
          <code>prefers-reduced-motion: reduce</code> — motion is a courtesy, never a requirement.
        </p>
      </Section>
    </>
  );
}
