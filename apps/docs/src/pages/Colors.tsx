import { useEffect, useState } from 'react';
import {
  ACCENT_PRESETS,
  ACCENT_PRESET_COLORS,
  Button,
  CheckIcon,
  ColorField,
  ColorSwatch,
  Frame,
  Input,
  Sidebar,
  SidebarSection,
  Slider,
  Tag,
  Toggle,
  applyFrameKitStyle,
  getFrameKitStyle,
  type FrameKitStyle,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';
import { useCopyFeedback } from '../lib/use-copy-feedback';
import {
  getAccentSelection,
  selectCustomAccent,
  selectPresetAccent,
  type AccentSelection,
} from '../lib/accent-store';

/** Tracks data-theme on <html> so theme-dependent UI re-renders. */
function useTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}

const GRAY_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const GRAY_TOKENS = GRAY_STEPS.map((step) => `--fk-gray-${step}`);

const ACCENT = [
  { token: '--fk-accent-subtle', label: 'subtle' },
  { token: '--fk-accent-muted', label: 'muted' },
  { token: '--fk-accent', label: 'solid' },
  { token: '--fk-accent-hover', label: 'hover' },
  { token: '--fk-accent-active', label: 'active' },
  { token: '--fk-accent-text', label: 'text' },
];

const STATUS = [
  {
    name: 'Success',
    tokens: [
      { token: '--fk-success', label: 'solid' },
      { token: '--fk-success-subtle', label: 'subtle' },
      { token: '--fk-success-text', label: 'text' },
      { token: '--fk-text-on-success', label: 'on-solid' },
    ],
  },
  {
    name: 'Warning',
    tokens: [
      { token: '--fk-warning', label: 'solid' },
      { token: '--fk-warning-subtle', label: 'subtle' },
      { token: '--fk-warning-text', label: 'text' },
      { token: '--fk-text-on-warning', label: 'on-solid' },
    ],
  },
  {
    name: 'Danger',
    tokens: [
      { token: '--fk-danger', label: 'solid' },
      { token: '--fk-danger-subtle', label: 'subtle' },
      { token: '--fk-danger-text', label: 'text' },
      { token: '--fk-text-on-danger', label: 'on-solid' },
    ],
  },
];

const SEMANTIC: { token: string; usage: string }[] = [
  { token: '--fk-bg-app', usage: 'App background' },
  { token: '--fk-bg-surface', usage: 'Panels, sidebars, wells' },
  { token: '--fk-bg-raised', usage: 'Cards, popovers, menus' },
  { token: '--fk-bg-control', usage: 'Buttons and inputs at rest' },
  { token: '--fk-border-subtle', usage: 'Hairline structure, dividers' },
  { token: '--fk-border-control', usage: 'Resting control chrome' },
  { token: '--fk-text-primary', usage: 'Default text' },
  { token: '--fk-text-secondary', usage: 'Supporting copy' },
  { token: '--fk-text-tertiary', usage: 'Meta text, placeholders' },
  { token: '--fk-accent', usage: 'Primary actions, selection' },
  { token: '--fk-accent-subtle', usage: 'Selected-item backgrounds' },
  { token: '--fk-accent-text', usage: 'Accent text and icons' },
];

const ALL_TOKENS = [
  ...GRAY_TOKENS,
  ...ACCENT.map((a) => a.token),
  ...STATUS.flatMap((s) => s.tokens.map((t) => t.token)),
  ...SEMANTIC.map((s) => s.token),
];

/** Read resolved token values from the live stylesheet — tokens.css stays the
 *  single source of truth. Re-reads when the theme toggle flips data-theme. */
function useTokenValues(tokens: string[]): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const token of tokens) {
        next[token] = styles.getPropertyValue(token).trim().toUpperCase();
      }
      setValues(next);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-accent', 'data-style', 'style'],
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass module constants
  }, []);
  return values;
}

export function Colors() {
  const values = useTokenValues(ALL_TOKENS);
  const theme = useTheme();
  const [accent, setAccent] = useState<AccentSelection>(() => getAccentSelection());
  const [frameKitStyle, setFrameKitStyle] = useState<FrameKitStyle>(() => getFrameKitStyle());
  const [previewName, setPreviewName] = useState('Frame 01');
  const [previewOpacity, setPreviewOpacity] = useState(72);
  const { copied, announcement, copy } = useCopyFeedback();

  const accentValue =
    accent.kind === 'custom' ? accent.hex : ACCENT_PRESET_COLORS[accent.preset][theme];

  const copyToken = (token: string) => {
    void copy(token, token, `Copied ${token} to clipboard`);
  };

  const selectFrameKitStyle = (style: FrameKitStyle) => {
    applyFrameKitStyle(style);
    setFrameKitStyle(style);
  };

  const chip = (token: string, extraClass = '') => {
    const isSmall = extraClass.includes('swatch-chip-small');
    return (
      <button
        type="button"
        className={`swatch-chip ${extraClass}`.trim()}
        style={{ background: `var(${token})` }}
        onClick={() => copyToken(token)}
        aria-label={`Copy ${token}`}
        title={`${token} · ${values[token] ?? ''}`}
      >
        {copied === token && (
          <span className="chip-check">
            <span className="chip-check-badge">
              <CheckIcon size={isSmall ? 7 : 9} />
            </span>
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Colors"
        lede="A twelve-step neutral ramp with a restrained, user-tunable accent — graphite by default, tuned per theme. Hover any chip for its value, click to copy the token."
      />

      <div className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </div>

      <Section title="Styles">
        <p className="section-intro">
          Base is the unchanged Frame Kit treatment. Transparent keeps the same components, spacing,
          typography, and states while giving panels and raised tool surfaces a quieter, translucent
          finish. Set <code>data-style=&quot;transparent&quot;</code> on the root or use{' '}
          <code>applyFrameKitStyle(&apos;transparent&apos;)</code>.
        </p>

        <div className="style-configurator">
          <div className="style-configurator__controls">
            <div className="style-mode-setting">
              <div className="style-mode-setting__copy">
                <Tag tone="secondary">Surface style</Tag>
                <strong>Transparent UI</strong>
              </div>
              <label className="style-mode-setting__action">
                <Tag tone={frameKitStyle === 'transparent' ? 'accent' : 'tertiary'}>
                  {frameKitStyle === 'transparent' ? 'On' : 'Off'}
                </Tag>
                <Toggle
                  aria-label="Transparent UI"
                  checked={frameKitStyle === 'transparent'}
                  onChange={(event) =>
                    selectFrameKitStyle(event.currentTarget.checked ? 'transparent' : 'base')
                  }
                />
              </label>
              <p className="style-mode-setting__description">
                Apply translucent panels, controls, menus, and tool chrome across Frame Kit.
              </p>
            </div>
            <p className="style-configurator__note">
              The app canvas stays solid so translucent UI remains legible over artwork and media.
            </p>
          </div>

          <div className="style-live-preview" aria-label={`${frameKitStyle} component preview`}>
            <Frame
              className="style-live-preview__frame"
              name="Canvas frame"
              width={176}
              height={116}
            />
            <Sidebar
              className="style-live-preview__sidebar"
              variant="panel"
              density="compact"
              width={224}
              title="Inspector"
              description={
                frameKitStyle === 'transparent' ? 'Transparent surfaces' : 'Base surfaces'
              }
            >
              <SidebarSection label="Appearance">
                <Input
                  size="sm"
                  label="Name"
                  value={previewName}
                  onChange={(event) => setPreviewName(event.currentTarget.value)}
                />
                <Slider
                  size="sm"
                  label="Opacity"
                  value={previewOpacity}
                  onValueChange={setPreviewOpacity}
                  formatValue={(value) => `${value}%`}
                />
              </SidebarSection>
            </Sidebar>
          </div>
        </div>
      </Section>

      <Section title="Neutral ramp">
        <div className="swatch-row">
          {GRAY_STEPS.map((step) => (
            <div className="swatch" key={step}>
              <span className="fk-tag swatch-step">{step}</span>
              {chip(`--fk-gray-${step}`)}
            </div>
          ))}
        </div>
        <p className="section-note">
          1–2 backgrounds · 3–5 surfaces &amp; controls · 6–8 borders · 9–10 muted text · 11–12 text
        </p>
      </Section>

      <Section title="Accent">
        <p className="section-intro">
          The accent is a swappable slot — graphite by default, with a balanced range of neutral,
          cool, and warm presets via <code>data-accent</code>, or any color via{' '}
          <code>applyAccent()</code>. Choose a preset or custom colour; the generated tokens and its
          AA-safe black or white on-solid text update live across the kit.
        </p>

        <div className="accent-configurator">
          <div className="accent-configurator-controls">
            <div className="accent-control">
              <span className="fk-tag accent-control-label">Presets</span>
              <div className="accent-presets" role="group" aria-label="Accent presets">
                {ACCENT_PRESETS.map((preset) => (
                  <ColorSwatch
                    key={preset}
                    size="sm"
                    color={ACCENT_PRESET_COLORS[preset][theme]}
                    aria-label={`${preset} accent`}
                    title={`Use ${preset} accent`}
                    selected={accent.kind === 'preset' && accent.preset === preset}
                    onClick={() => {
                      selectPresetAccent(preset);
                      setAccent({ kind: 'preset', preset });
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="accent-control accent-control-custom">
              <span className="fk-tag accent-control-label">Custom</span>
              <ColorField
                value={accentValue}
                onChange={(hex) => {
                  selectCustomAccent(hex);
                  setAccent({ kind: 'custom', hex });
                }}
                pickerLabel="Accent colour"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectPresetAccent('graphite');
                  setAccent({ kind: 'preset', preset: 'graphite' });
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="accent-token-preview">
            <div className="accent-token-preview__header">
              <span className="fk-tag accent-control-label">Generated tokens</span>
              <div className="accent-on-solid-preview">
                <span className="fk-tag accent-control-label">On solid</span>
                <span className="accent-on-solid-sample">Accent action</span>
              </div>
            </div>
            <div className="accent-token-strip" role="group" aria-label="Generated accent tokens">
              {ACCENT.map((a) => (
                <button
                  type="button"
                  className={`accent-token-strip__segment accent-token-strip__segment--${a.label}`}
                  key={a.token}
                  style={{ background: `var(${a.token})` }}
                  onClick={() => copyToken(a.token)}
                  aria-label={`Copy ${a.token}`}
                  title={`${a.token} · ${values[a.token] ?? ''}`}
                >
                  <span className="accent-token-strip__label">{a.label}</span>
                  {copied === a.token && (
                    <span className="accent-token-strip__check" aria-hidden="true">
                      <CheckIcon size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Status">
        <div className="token-table">
          {STATUS.flatMap((status) =>
            status.tokens.map((token) => (
              <div className="token-row" key={token.token}>
                {chip(token.token, 'swatch-chip-small')}
                <code className="token-name">{token.token}</code>
                <span className="token-usage">
                  {status.name} · {token.label}
                </span>
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title="Semantic tokens">
        <div className="token-table">
          {SEMANTIC.map((row) => (
            <div className="token-row" key={row.token}>
              {chip(row.token, 'swatch-chip-small')}
              <code className="token-name">{row.token}</code>
              <span className="token-usage">{row.usage}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
