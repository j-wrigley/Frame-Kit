import { PageHeader, Section } from '../components/Page';

const SPACES = [
  { token: '--fk-space-1', px: 4 },
  { token: '--fk-space-2', px: 8 },
  { token: '--fk-space-3', px: 12 },
  { token: '--fk-space-4', px: 16 },
  { token: '--fk-space-5', px: 20 },
  { token: '--fk-space-6', px: 24 },
  { token: '--fk-space-7', px: 32 },
  { token: '--fk-space-8', px: 40 },
  { token: '--fk-space-9', px: 48 },
  { token: '--fk-space-10', px: 64 },
];

const RADII = [
  { token: '--fk-radius-xs', px: 3, use: 'Nested: chips, tracks, menu items' },
  { token: '--fk-radius-sm', px: 4, use: 'Controls: buttons, fields' },
  { token: '--fk-radius-md', px: 6, use: 'Menus, popovers' },
  { token: '--fk-radius-lg', px: 8, use: 'Cards, dialogs' },
];

export function Spacing() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Spacing"
        lede="A 4px base grid. Ten steps cover everything from control padding to page gutters — if a gap isn't on the grid, it's wrong."
      />

      <Section title="Scale">
        <div className="space-scale">
          {SPACES.map((s) => (
            <div className="space-row" key={s.token}>
              <div className="space-meta">
                <code>{s.token}</code>
                <span>{s.px}px</span>
              </div>
              <div className="space-bar" style={{ width: s.px * 4 }} />
            </div>
          ))}
        </div>
        <p className="section-note">Bars shown at 4× for legibility.</p>
      </Section>

      <Section title="Radii">
        <div className="radius-grid">
          {RADII.map((r) => (
            <div className="radius-item" key={r.token}>
              <div className="radius-demo" style={{ borderRadius: `var(${r.token})` }} />
              <code>{r.token}</code>
              <span>
                {r.px}px · {r.use}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
