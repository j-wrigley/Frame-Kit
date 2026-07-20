/** Frame Kit accent system.
 *
 *  The accent is a swappable slot of seven tokens. Three ways to set it:
 *  1. Default — graphite, defined in tokens.css.
 *  2. Presets — `<html data-accent="sage">` (values in accents.css).
 *  3. Custom — `applyAccent('#7a6a52')` derives the full slot from one color
 *     for the root's current theme and writes inline custom properties.
 */
import { contrastRatio, hexToRgb, hslToRgb, normalizeHex, rgbToHex, rgbToHsl } from './color';

export const ACCENT_PRESETS = [
  'graphite',
  'slate',
  'sage',
  'mauve',
  'sand',
  'blue',
  'teal',
  'violet',
  'rose',
  'coral',
  'amber',
] as const;

export type AccentPreset = (typeof ACCENT_PRESETS)[number];

/** Solid accent color per preset and theme — for rendering preset pickers. */
export const ACCENT_PRESET_COLORS: Record<AccentPreset, { light: string; dark: string }> = {
  graphite: { light: '#3f3f46', dark: '#dfdfe2' },
  slate: { light: '#363c4e', dark: '#dcdee5' },
  sage: { light: '#394c41', dark: '#dde4e0' },
  mauve: { light: '#4a3b4a', dark: '#e3dee3' },
  sand: { light: '#4c4539', dark: '#e4e2dd' },
  blue: { light: '#3b67de', dark: '#3b67de' },
  teal: { light: '#146b68', dark: '#71d1c8' },
  violet: { light: '#6146b7', dark: '#c1b2f6' },
  rose: { light: '#b63d63', dark: '#f2a9bd' },
  coral: { light: '#b94a38', dark: '#f5af9b' },
  amber: { light: '#ae5711', dark: '#f5c47a' },
};

const ACCENT_VARS = [
  '--fk-accent',
  '--fk-accent-rgb',
  '--fk-accent-hover',
  '--fk-accent-active',
  '--fk-accent-subtle',
  '--fk-accent-muted',
  '--fk-accent-text',
  '--fk-text-on-accent',
] as const;

const LIGHT_BG = '#fcfcfd';
const DARK_BG = '#0e0e10';
const DARK_TEXT = '#17181c';
const WHITE_TEXT = '#ffffff';
const BLACK_TEXT = '#000000';
const MIN_TEXT_CONTRAST = 4.5;
// At this narrow crossover, a tiny deepening keeps a white label readable
// rather than making a warm, saturated accent unexpectedly switch to black.
const WHITE_PREFERENCE_CONTRAST = 4.2;

function withLightness(hex: string, l: number, s?: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ h: hsl.h, s: s ?? hsl.s, l }));
}

function adjustForContrast(hex: string, text: string, towardDark: boolean): string {
  if (contrastRatio(hex, text) >= MIN_TEXT_CONTRAST) return hex;

  const hsl = rgbToHsl(hexToRgb(hex));
  let candidate = hex;
  for (let step = 1; step <= 400; step++) {
    const lightness = Math.max(0, Math.min(100, hsl.l + (towardDark ? -1 : 1) * step * 0.25));
    candidate = withLightness(hex, lightness);
    if (contrastRatio(candidate, text) >= MIN_TEXT_CONTRAST) return candidate;
    if (lightness === 0 || lightness === 100) break;
  }
  return candidate;
}

interface SolidPair {
  color: string;
  text: string;
}

/** Pair a generated accent solid with an AA foreground. For colors on the
 *  white/black boundary, preserve the expected white-label treatment by
 *  deepening the derived solid just enough to meet AA. */
function solidPairFor(hex: string): SolidPair {
  const white = contrastRatio(hex, WHITE_TEXT);
  const dark = contrastRatio(hex, DARK_TEXT);
  if (white >= MIN_TEXT_CONTRAST) return { color: hex, text: WHITE_TEXT };
  if (dark >= MIN_TEXT_CONTRAST) return { color: hex, text: DARK_TEXT };

  if (white >= WHITE_PREFERENCE_CONTRAST) {
    return {
      color: adjustForContrast(hex, WHITE_TEXT, true),
      text: WHITE_TEXT,
    };
  }

  return { color: hex, text: BLACK_TEXT };
}

/** Keep a fixed foreground readable in every visual state of the solid. If a
 *  preferred lightness shift would make the foreground fail AA, reverse the
 *  shift so the state still gives visible feedback without a text-color jump. */
function solidStateFor(
  solid: string,
  targetLightness: number,
  text: string,
  fallbackLightness: number
): string {
  const preferred = withLightness(solid, targetLightness);
  if (contrastRatio(preferred, text) >= MIN_TEXT_CONTRAST) return preferred;

  const fallback = withLightness(solid, fallbackLightness);
  return adjustForContrast(fallback, text, text === WHITE_TEXT);
}

/** Darken (light theme) or lighten (dark theme) until AA against the app bg. */
function readableText(hex: string, bg: string, towardDark: boolean): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  let l = towardDark ? Math.min(hsl.l, 40) : Math.max(hsl.l, 70);
  let out = withLightness(hex, l);
  for (let i = 0; i < 40 && contrastRatio(out, bg) < 4.5; i++) {
    l += towardDark ? -2 : 2;
    out = withLightness(hex, l);
  }
  return out;
}

/** Derive and apply the full accent slot from a single color, for the root's
 *  current theme. Re-run after a theme change. Returns the applied hex, or
 *  null if the input wasn't a valid hex color. */
export function applyAccent(
  color: string,
  root: HTMLElement = document.documentElement
): string | null {
  const hex = normalizeHex(color);
  if (!hex) return null;

  const dark = root.dataset.theme === 'dark';
  const rgb = hexToRgb(hex);
  const pair = solidPairFor(hex);
  const solidRgb = hexToRgb(pair.color);
  const solidRgbChannels = `${solidRgb.r}, ${solidRgb.g}, ${solidRgb.b}`;
  const hsl = rgbToHsl(hexToRgb(pair.color));

  // HSL saturation is unstable at lightness extremes (a 1-bit-off white reads
  // as 33% saturated) — gate tints on raw chroma so near-neutrals stay neutral.
  const chroma = (Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b)) / 255;
  const tintS = chroma < 0.04 ? 0 : Math.min(hsl.s, 40);

  // Near the lightness poles the +/- steps would clamp into the base color
  // (no hover/press feedback) — step the other way instead.
  const hoverL = hsl.l >= 94 ? hsl.l - 10 : hsl.l + (dark ? 9 : 10);
  const activeL = hsl.l <= 6 ? hsl.l + 6 : hsl.l - 6;
  const hoverFallbackL = pair.text === WHITE_TEXT ? hsl.l - 7 : hsl.l + 6;
  const activeFallbackL = pair.text === WHITE_TEXT ? hsl.l - 6 : hsl.l + 4;
  const accentHover = solidStateFor(pair.color, hoverL, pair.text, hoverFallbackL);
  const accentActive = solidStateFor(pair.color, activeL, pair.text, activeFallbackL);

  const values: Record<(typeof ACCENT_VARS)[number], string> = dark
    ? {
        '--fk-accent': pair.color,
        '--fk-accent-rgb': solidRgbChannels,
        '--fk-accent-hover': accentHover,
        '--fk-accent-active': accentActive,
        '--fk-accent-subtle': withLightness(pair.color, 16, tintS),
        '--fk-accent-muted': withLightness(pair.color, 28, tintS),
        '--fk-accent-text': readableText(pair.color, DARK_BG, false),
        '--fk-text-on-accent': pair.text,
      }
    : {
        '--fk-accent': pair.color,
        '--fk-accent-rgb': solidRgbChannels,
        '--fk-accent-hover': accentHover,
        '--fk-accent-active': accentActive,
        '--fk-accent-subtle': withLightness(pair.color, 94, tintS),
        '--fk-accent-muted': withLightness(pair.color, 81, tintS),
        '--fk-accent-text': readableText(pair.color, LIGHT_BG, true),
        '--fk-text-on-accent': pair.text,
      };

  for (const [name, value] of Object.entries(values)) {
    root.style.setProperty(name, value);
  }
  return hex;
}

/** Remove a custom accent applied via applyAccent — the preset from
 *  data-accent (or the graphite default) takes over again. */
export function resetAccent(root: HTMLElement = document.documentElement): void {
  for (const name of ACCENT_VARS) {
    root.style.removeProperty(name);
  }
}
