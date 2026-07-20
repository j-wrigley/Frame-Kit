import { PageHeader, Section } from '../components/Page';

const SCALE = [
  { token: '--fk-fs-7', px: 32, sample: 'Frame Kit', use: 'Hero display' },
  { token: '--fk-fs-6', px: 28, sample: 'Precision by default', use: 'Display' },
  { token: '--fk-fs-5', px: 22, sample: 'Panels, inspectors, canvases', use: 'Page headings' },
  { token: '--fk-fs-4', px: 18, sample: 'Every element earns its place', use: 'Section headings' },
  {
    token: '--fk-fs-3',
    px: 15,
    sample: 'Emphasized body copy and ledes sit at fifteen pixels.',
    use: 'Ledes',
  },
  {
    token: '--fk-fs-2',
    px: 13,
    sample: 'Primary UI text — the workhorse size for tool interfaces.',
    use: 'UI default',
  },
  {
    token: '--fk-fs-1',
    px: 12,
    sample: 'Secondary interface text, table metadata, and helper copy.',
    use: 'Secondary',
  },
  {
    token: '--fk-fs-0',
    px: 11,
    sample: 'Micro labels · badges · section headers',
    use: 'Micro · tags',
    mono: true,
  },
];

const TAGS = [
  {
    name: 'Eyebrow',
    recipe: 'mono · 11px · medium · +6% tracking · accent',
    sample: <span className="fk-tag spec-eyebrow">Foundations</span>,
  },
  {
    name: 'Micro label',
    recipe: 'mono · 11px · medium · +6% tracking · tertiary',
    sample: <span className="fk-tag spec-label">Export settings</span>,
  },
  {
    name: 'Badge',
    recipe: 'mono · 8px · accent subtle · hairline · 3px radius',
    sample: <span className="spec-badge">Beta</span>,
  },
  {
    name: 'Value',
    recipe: 'mono · 12px · regular · secondary',
    sample: <span className="spec-value">1920 × 1080 · 60 fps</span>,
  },
];

const WEIGHTS = [
  {
    family: 'Inter Variable',
    role: 'Interface text',
    mono: false,
    weights: [
      { value: 400, label: 'Regular' },
      { value: 500, label: 'Medium' },
      { value: 600, label: 'Semibold' },
    ],
  },
  {
    family: 'Office Code Pro',
    role: 'Tags, values, code',
    mono: true,
    weights: [
      { value: 300, label: 'Light' },
      { value: 400, label: 'Regular' },
      { value: 500, label: 'Medium' },
      { value: 700, label: 'Bold' },
    ],
  },
];

export function Typography() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Typography"
        lede="Inter Variable for interface text, Office Code Pro for compact uppercase UI labels and lowercase tokens, values, and code — both packaged with the kit. The scale is tuned for dense tool UIs; 13px is the workhorse."
      />

      <Section title="Scale">
        <div className="type-scale">
          {SCALE.map((row) => (
            <div className="type-row" key={row.token}>
              <div className="type-meta">
                <code>{row.token}</code>
                <span>
                  {row.px}px · {row.use}
                </span>
              </div>
              <p
                className="type-sample"
                style={{
                  fontSize: `var(${row.token})`,
                  fontFamily: row.mono ? 'var(--fk-font-mono)' : undefined,
                  letterSpacing:
                    row.px >= 22
                      ? 'var(--fk-tracking-tight)'
                      : row.mono
                        ? 'var(--fk-tracking-label)'
                        : undefined,
                  fontWeight:
                    row.px >= 18
                      ? 'var(--fk-fw-semibold)'
                      : row.mono
                        ? 'var(--fk-fw-medium)'
                        : ('var(--fk-fw-regular)' as const),
                  textTransform: row.mono ? 'uppercase' : undefined,
                }}
              >
                {row.sample}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tags & labels">
        <p className="section-intro">
          Office Code Pro distinguishes compact UI labels from literal values: labels and branding
          are uppercase, while tokens, values, and code preserve lowercase. The shared{' '}
          <code>Tag</code> component (<code>.fk-tag</code>) owns the uppercase recipe, so every
          eyebrow, field label, and section header changes in one place.
        </p>
        <div className="type-scale">
          {TAGS.map((tag) => (
            <div className="type-row" key={tag.name}>
              <div className="type-meta">
                <span className="type-meta__heading">{tag.name}</span>
                <span>{tag.recipe}</span>
              </div>
              <div className="type-sample">{tag.sample}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Weights">
        <div className="type-weight-lists">
          {WEIGHTS.map((family) => (
            <section className="type-weight-list" key={family.family}>
              <header className="type-weight-list__header">
                <span className="type-meta__heading">{family.family}</span>
                <span>{family.role}</span>
              </header>
              <div className="type-weight-list__items" role="list">
                {family.weights.map((w) => (
                  <div className="type-weight-list__item" key={w.value} role="listitem">
                    <span className="type-weight-list__meta">
                      {w.value} · {w.label}
                    </span>
                    <span
                      className="type-weight-list__sample"
                      style={{
                        fontWeight: w.value,
                        fontFamily: family.mono ? 'var(--fk-font-mono)' : undefined,
                      }}
                    >
                      AaBbCcDd
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>

      <Section title="Families">
        <div className="token-table">
          <div className="token-row">
            <code className="token-name">--fk-font-sans</code>
            <span className="token-usage">Inter Variable — all interface text</span>
          </div>
          <div className="token-row">
            <code className="token-name">--fk-font-mono</code>
            <span className="token-usage">
              Office Code Pro — uppercase UI labels; lowercase tokens, values, code
              (300/400/500/700)
            </span>
          </div>
        </div>
      </Section>
    </>
  );
}
