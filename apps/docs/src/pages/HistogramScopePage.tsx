import { useState } from 'react';
import {
  HistogramScope,
  SegmentedSwitch,
  Toggle,
  type HistogramScopeAdjustments,
  type HistogramScopeData,
  type HistogramScopeMode,
  type HistogramScopeRegion,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

function distribution(
  peaks: readonly [centre: number, width: number, strength: number][],
  seed: number
) {
  const bins = 80;
  return Array.from({ length: bins }, (_, index) => {
    const position = index / (bins - 1);
    const envelope = peaks.reduce(
      (total, [centre, width, strength]) =>
        total + Math.exp(-((position - centre) ** 2) / (2 * width ** 2)) * strength,
      0
    );
    const texture =
      0.58 +
      Math.sin(index * 2.41 + seed) * 0.18 +
      Math.cos(index * 0.73 + seed * 1.7) * 0.12 +
      Math.sin(index * 5.17 + seed * 0.4) * 0.08;
    return Math.max(0, Math.round(envelope * Math.max(texture, 0.16) * 100));
  });
}

const PORTRAIT_HISTOGRAM: HistogramScopeData = {
  luminance: distribution(
    [
      [0.06, 0.025, 0.3],
      [0.2, 0.09, 0.84],
      [0.44, 0.12, 1],
      [0.72, 0.12, 0.53],
      [0.96, 0.022, 0.26],
    ],
    0.7
  ),
  red: distribution(
    [
      [0.07, 0.03, 0.22],
      [0.24, 0.1, 0.64],
      [0.47, 0.13, 1],
      [0.74, 0.12, 0.68],
    ],
    1.5
  ),
  green: distribution(
    [
      [0.08, 0.04, 0.32],
      [0.2, 0.1, 0.82],
      [0.43, 0.12, 0.87],
      [0.66, 0.1, 0.72],
      [0.93, 0.04, 0.16],
    ],
    2.6
  ),
  blue: distribution(
    [
      [0.05, 0.025, 0.45],
      [0.17, 0.09, 0.9],
      [0.38, 0.12, 0.82],
      [0.65, 0.12, 0.42],
      [0.96, 0.02, 0.32],
    ],
    3.4
  ),
};

const TONAL_REGIONS: readonly { id: HistogramScopeRegion; label: string }[] = [
  { id: 'blacks', label: 'Blacks' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'exposure', label: 'Exposure' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'whites', label: 'Whites' },
];

const INITIAL_ADJUSTMENTS: HistogramScopeAdjustments = {
  blacks: 0,
  shadows: 0,
  exposure: 0,
  highlights: 0,
  whites: 0,
};

function formatAdjustment(region: HistogramScopeRegion, value: number) {
  if (region === 'exposure') return `${value > 0 ? '+' : ''}${value.toFixed(2)} EV`;
  return `${value > 0 ? '+' : ''}${Math.round(value)}`;
}

export function HistogramScopePage() {
  const [mode, setMode] = useState<HistogramScopeMode>('luminance');
  const [clipping, setClipping] = useState(true);
  const [adjustments, setAdjustments] = useState<HistogramScopeAdjustments>(INITIAL_ADJUSTMENTS);
  const [activeRegion, setActiveRegion] = useState<HistogramScopeRegion | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Histogram scope"
        lede="A calm exposure reference for photo, video, and colour workflows. Read tonal distribution at a glance, then keep clipping and exposure range visible beside the controls that change them."
      />

      <Section title="Exposure inspector">
        <p className="section-intro">
          The scope stays faithful to its source bins while its five tonal bands become direct
          controls when the host binds the callback. Drag vertically across a band to adjust Blacks,
          Shadows, Exposure, Highlights, or Whites; switch to RGB to compare channels.
        </p>
        <div className="demo">
          <div className="histogram-inspector" aria-label="Portrait exposure inspector">
            <div className="histogram-inspector__heading">
              <div>
                <span className="fk-tag">Exposure</span>
                <strong>Portrait RAW</strong>
              </div>
              <label className="histogram-inspector__clip-toggle">
                <span>Clipping</span>
                <Toggle
                  size="sm"
                  aria-label="Show clipping indicators"
                  checked={clipping}
                  onChange={(event) => setClipping(event.target.checked)}
                />
              </label>
            </div>

            <SegmentedSwitch
              size="sm"
              fullWidth
              aria-label="Histogram distribution"
              value={mode}
              onValueChange={(value) => setMode(value as HistogramScopeMode)}
              options={[
                { value: 'luminance', label: 'Luminance' },
                { value: 'rgb', label: 'RGB' },
              ]}
            />

            <HistogramScope
              data={PORTRAIT_HISTOGRAM}
              mode={mode}
              shadowClipped={clipping}
              highlightClipped={clipping}
              exposureRange={{ min: -5, max: 5 }}
              interactive
              value={adjustments}
              onValueChange={setAdjustments}
              onActiveRegionChange={setActiveRegion}
              label="Portrait RAW histogram"
            />

            <div className="histogram-inspector__readouts">
              <div>
                <span className="fk-tag">Range</span>
                <output>−5 EV / +5 EV</output>
              </div>
              <div>
                <span className="fk-tag">Clipping</span>
                <output>{clipping ? 'Indicators on' : 'Indicators off'}</output>
              </div>
              <div>
                <span className="fk-tag">Active zone</span>
                <output>
                  {activeRegion
                    ? TONAL_REGIONS.find((region) => region.id === activeRegion)?.label
                    : 'Hover or drag'}
                </output>
              </div>
            </div>

            <div className="histogram-inspector__tone-controls">
              <div className="histogram-inspector__tone-heading">
                <span className="fk-tag">Direct tone</span>
                <span>Drag vertically across a zone</span>
              </div>
              <div className="histogram-inspector__tone-values">
                {TONAL_REGIONS.map((region) => (
                  <div data-active={activeRegion === region.id || undefined} key={region.id}>
                    <span className="fk-tag">{region.label}</span>
                    <output>{formatAdjustment(region.id, adjustments[region.id])}</output>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          The scope scales raw bins to the largest visible channel. Hover a zone to reveal it, drag
          up or down to adjust, or focus a zone and use arrow keys (hold <code>Shift</code> for
          larger steps).
        </p>
      </Section>

      <Section title="Read before adjusting">
        <div className="histogram-guidance">
          <div>
            <span className="fk-tag spec-label">Distribution</span>
            <strong>Begin with luminance</strong>
            <p>
              Use one quiet tonal distribution for fast exposure judgement before inspecting each
              channel.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">RGB</span>
            <strong>Reveal colour imbalance</strong>
            <p>
              Overlay RGB only when channel separation helps identify a colour cast or channel risk.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Clipping</span>
            <strong>Make lost detail explicit</strong>
            <p>
              Use edge indicators for an actual clipping condition, not as permanent decoration.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { HistogramScope, type HistogramScopeData } from '@presentstandards/framekit-ui';

const histogram: HistogramScopeData = {
  luminance: [2, 4, 12, 21, 18, 9, 5, 1],
  red: [1, 3, 9, 18, 15, 7, 3, 1],
  green: [2, 5, 14, 20, 18, 10, 4, 1],
  blue: [4, 8, 17, 16, 9, 4, 2, 1],
};

<HistogramScope
  data={histogram}
  mode="rgb"
  shadowClipped
  exposureRange={{ min: -5, max: 5 }}
  label="Portrait exposure histogram"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
