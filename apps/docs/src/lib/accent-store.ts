import {
  applyAccent,
  resetAccent,
  ACCENT_PRESETS,
  type AccentPreset,
} from '@presentstandards/framekit-ui';

/** Docs-app accent persistence.
 *  - Presets persist as 'fk-accent' and apply pre-paint via index.html.
 *  - Custom hex persists as 'fk-accent-custom' and applies on mount /
 *    theme change (derived values are theme-dependent). */

const PRESET_KEY = 'fk-accent';
const CUSTOM_KEY = 'fk-accent-custom';
const DEFAULT_FAVICON_COLOR = '#0e0e10';

export type AccentSelection =
  { kind: 'preset'; preset: AccentPreset } | { kind: 'custom'; hex: string };

function syncAccentFavicon(selection: AccentSelection): void {
  const favicon = document.querySelector<HTMLLinkElement>('#frame-kit-favicon');
  if (!favicon) return;

  const usesDefaultGraphite = selection.kind === 'preset' && selection.preset === 'graphite';
  const computedAccent = getComputedStyle(document.documentElement)
    .getPropertyValue('--fk-accent')
    .trim();
  const color = usesDefaultGraphite
    ? DEFAULT_FAVICON_COLOR
    : computedAccent || (selection.kind === 'custom' ? selection.hex : DEFAULT_FAVICON_COLOR);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="6" fill="${color}"/></svg>`;

  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getAccentSelection(): AccentSelection {
  try {
    const custom = localStorage.getItem(CUSTOM_KEY);
    if (custom) return { kind: 'custom', hex: custom };
    const preset = localStorage.getItem(PRESET_KEY);
    if (preset && (ACCENT_PRESETS as readonly string[]).includes(preset)) {
      return { kind: 'preset', preset: preset as AccentPreset };
    }
  } catch {
    // storage unavailable — fall through to default
  }
  return { kind: 'preset', preset: 'graphite' };
}

export function selectPresetAccent(preset: AccentPreset): void {
  resetAccent();
  const root = document.documentElement;
  if (preset === 'graphite') delete root.dataset.accent;
  else root.dataset.accent = preset;
  try {
    localStorage.removeItem(CUSTOM_KEY);
    if (preset === 'graphite') localStorage.removeItem(PRESET_KEY);
    else localStorage.setItem(PRESET_KEY, preset);
  } catch {
    // theme just won't persist
  }
  syncAccentFavicon({ kind: 'preset', preset });
}

export function selectCustomAccent(hex: string): void {
  delete document.documentElement.dataset.accent;
  const applied = applyAccent(hex);
  if (!applied) return;
  try {
    localStorage.removeItem(PRESET_KEY);
    localStorage.setItem(CUSTOM_KEY, applied);
  } catch {
    // theme just won't persist
  }
  syncAccentFavicon({ kind: 'custom', hex: applied });
}

/** Custom accents derive from the active theme — re-run after mount and
 *  after every theme toggle. Presets are pure CSS and need nothing. */
export function reapplyAccentForTheme(): void {
  const selection = getAccentSelection();
  if (selection.kind === 'custom') applyAccent(selection.hex);
  syncAccentFavicon(selection);
}
