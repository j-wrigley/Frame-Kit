import { useState } from 'react';
import {
  AxisField,
  Button,
  CameraIcon,
  Disclosure,
  Dropdown,
  HistogramScope,
  ResetIcon,
  RulerSlider,
  SegmentedSwitch,
  Slider,
  Tag,
  ToneCurve,
  ToggleRow,
  type AxisFieldValue,
  type HistogramScopeAdjustments,
  type HistogramScopeRegion,
  type ToneCurveChannel,
  type ToneCurvePoint,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const PROFILE_OPTIONS = [
  { value: 'natural', label: 'Natural 02', description: 'Balanced colour response' },
  { value: 'portrait', label: 'Portrait 01', description: 'Soft skin and contrast' },
  { value: 'vivid', label: 'Vivid 03', description: 'Richer colour and depth' },
];

const INITIAL_GRAIN: AxisFieldValue = { x: 0.42, y: 0.28 };

const TONE_CHANNEL_OPTIONS = [
  { value: 'luminance', label: 'Luma' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

const GOLDEN_HOUR_LUMINANCE_HISTOGRAM = [
  3, 5, 9, 17, 25, 38, 52, 64, 77, 88, 96, 102, 98, 91, 84, 82, 87, 96, 108, 114, 110, 99, 86, 75,
  69, 63, 54, 45, 34, 25, 18, 12, 8, 5, 3, 2,
].map((bin) => bin / 114);

const GOLDEN_HOUR_HISTOGRAM = { luminance: GOLDEN_HOUR_LUMINANCE_HISTOGRAM };

const INITIAL_HISTOGRAM_ADJUSTMENTS: HistogramScopeAdjustments = {
  blacks: 0,
  shadows: 0,
  exposure: 0.4,
  highlights: 0,
  whites: 0,
};

const HISTOGRAM_REGION_LABELS: Record<HistogramScopeRegion, string> = {
  blacks: 'Blacks',
  shadows: 'Shadows',
  exposure: 'Exposure',
  highlights: 'Highlights',
  whites: 'Whites',
};

function initialTonePoints(channel: ToneCurveChannel): ToneCurvePoint[] {
  const id = (name: string) => `${channel}-${name}`;
  if (channel === 'luminance') {
    return [
      { id: id('black'), x: 0, y: 0.03 },
      { id: id('shadow'), x: 0.24, y: 0.18 },
      { id: id('highlight'), x: 0.74, y: 0.82 },
      { id: id('white'), x: 1, y: 0.96 },
    ];
  }
  return [
    { id: id('black'), x: 0, y: 0 },
    { id: id('white'), x: 1, y: 1 },
  ];
}

function initialToneCurves(): Record<ToneCurveChannel, ToneCurvePoint[]> {
  return {
    luminance: initialTonePoints('luminance'),
    red: initialTonePoints('red'),
    green: initialTonePoints('green'),
    blue: initialTonePoints('blue'),
  };
}

function signedValue(value: number, suffix = '') {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}${suffix}`;
}

function formatHistogramAdjustment(region: HistogramScopeRegion, value: number) {
  if (region !== 'exposure') return signedValue(value);

  const rounded = Math.round(value * 100) / 100;
  const precision = Number.isInteger(rounded * 10) ? 1 : 2;
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(precision)} EV`;
}

export function PhotographySidebar() {
  const [profile, setProfile] = useState('natural');
  const [histogramAdjustments, setHistogramAdjustments] = useState<HistogramScopeAdjustments>(
    INITIAL_HISTOGRAM_ADJUSTMENTS
  );
  const [activeHistogramRegion, setActiveHistogramRegion] = useState<HistogramScopeRegion | null>(
    null
  );
  const [contrast, setContrast] = useState(12);
  const [temperature, setTemperature] = useState(8);
  const [toneChannel, setToneChannel] = useState<ToneCurveChannel>('luminance');
  const [toneCurves, setToneCurves] =
    useState<Record<ToneCurveChannel, ToneCurvePoint[]>>(initialToneCurves);
  const [activeToneId, setActiveToneId] = useState<string | null>('luminance-shadow');
  const [grain, setGrain] = useState<AxisFieldValue>(INITIAL_GRAIN);
  const [autoTone, setAutoTone] = useState(true);
  const [luminanceSmoothing, setLuminanceSmoothing] = useState(true);

  const resetDevelop = () => {
    setProfile('natural');
    setHistogramAdjustments(INITIAL_HISTOGRAM_ADJUSTMENTS);
    setActiveHistogramRegion(null);
    setContrast(12);
    setTemperature(8);
    setToneChannel('luminance');
    setToneCurves(initialToneCurves());
    setActiveToneId('luminance-shadow');
    setGrain(INITIAL_GRAIN);
    setAutoTone(true);
    setLuminanceSmoothing(true);
  };

  const tonePoints = toneCurves[toneChannel];
  const activeTonePoint =
    tonePoints.find((point) => point.id === activeToneId) ?? tonePoints[1] ?? tonePoints[0];

  const updateToneCurve = (nextPoints: ToneCurvePoint[]) => {
    setToneCurves((current) => ({ ...current, [toneChannel]: nextPoints }));
  };

  const selectToneChannel = (nextChannel: string) => {
    const channel = nextChannel as ToneCurveChannel;
    setToneChannel(channel);
    setActiveToneId(toneCurves[channel][Math.min(1, toneCurves[channel].length - 1)]?.id ?? null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Ready Made"
        title="Photography sidebar"
        lede="A focused Develop inspector made entirely from existing Frame Kit controls. It combines everyday adjustments with direct-manipulation tools for the details that benefit from a visual response."
      />

      <Section title="Develop inspector">
        <p className="section-intro">
          The layout is intentionally narrow and calm: image distribution and quick tonal decisions
          stay compact, while the tone curve and grain treatment expand only when a photograph needs
          precise shaping.
        </p>
        <div className="demo ready-photo-demo">
          <aside className="photo-editor-sidebar" aria-label="Photography develop inspector">
            <header className="photo-editor-sidebar__header">
              <div className="photo-editor-sidebar__identity">
                <span className="photo-editor-sidebar__icon" aria-hidden="true">
                  <CameraIcon />
                </span>
                <div>
                  <Tag>Develop</Tag>
                  <strong>Golden hour</strong>
                  <span>DSC_1048.RAW · 24 MP</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconStart={<ResetIcon />}
                aria-label="Reset all develop adjustments"
                title="Reset all adjustments"
                onClick={resetDevelop}
              />
            </header>

            <div className="photo-editor-sidebar__body">
              <div className="photo-editor-sidebar__profile">
                <Tag>Profile</Tag>
                <Dropdown
                  size="sm"
                  label="Photo profile"
                  options={PROFILE_OPTIONS}
                  value={profile}
                  onValueChange={setProfile}
                  fullWidth
                />
              </div>

              <div className="photo-editor-sidebar__disclosures">
                <Disclosure label="Histogram" summary="Luma · no clipping" defaultOpen>
                  <HistogramScope
                    data={GOLDEN_HOUR_HISTOGRAM}
                    mode="luminance"
                    shadowClipped={false}
                    highlightClipped={false}
                    exposureRange={{ min: -5, max: 5 }}
                    interactive
                    value={histogramAdjustments}
                    onValueChange={setHistogramAdjustments}
                    onActiveRegionChange={setActiveHistogramRegion}
                    label="Golden hour luminance histogram"
                  />
                  <div className="photo-editor-sidebar__readout">
                    <Tag>Clipping</Tag>
                    <output>None detected · −5 EV to +5 EV</output>
                  </div>
                  <div className="photo-editor-sidebar__readout">
                    <Tag>
                      {activeHistogramRegion
                        ? HISTOGRAM_REGION_LABELS[activeHistogramRegion]
                        : 'Direct tone'}
                    </Tag>
                    <output>
                      {activeHistogramRegion
                        ? formatHistogramAdjustment(
                            activeHistogramRegion,
                            histogramAdjustments[activeHistogramRegion]
                          )
                        : 'Drag vertically across a tonal band'}
                    </output>
                  </div>
                </Disclosure>

                <Disclosure label="Light" summary="Balanced" defaultOpen>
                  <Slider
                    size="sm"
                    label="Exposure"
                    value={histogramAdjustments.exposure}
                    min={-3}
                    max={3}
                    step={0.05}
                    onValueChange={(nextExposure) =>
                      setHistogramAdjustments((current) => ({
                        ...current,
                        exposure: nextExposure,
                      }))
                    }
                    formatValue={(value) => formatHistogramAdjustment('exposure', value)}
                  />
                  <Slider
                    size="sm"
                    label="Contrast"
                    value={contrast}
                    min={-100}
                    max={100}
                    onValueChange={setContrast}
                    formatValue={(value) => signedValue(value)}
                  />
                  <RulerSlider
                    size="sm"
                    label="Temperature"
                    value={temperature}
                    min={-50}
                    max={50}
                    step={1}
                    fineStep={0.2}
                    coarseStep={10}
                    onValueChange={setTemperature}
                    formatValue={(value) => signedValue(value)}
                  />
                  <ToggleRow
                    size="sm"
                    variant="compact"
                    label="Auto tone"
                    description="Protect highlight detail"
                    checked={autoTone}
                    onChange={(event) => setAutoTone(event.target.checked)}
                  />
                </Disclosure>

                <Disclosure label="Tone curve" summary="Luma · custom" defaultOpen>
                  <SegmentedSwitch
                    size="sm"
                    fullWidth
                    aria-label="Photography tone curve channel"
                    options={TONE_CHANNEL_OPTIONS}
                    value={toneChannel}
                    onValueChange={selectToneChannel}
                  />
                  <ToneCurve
                    value={tonePoints}
                    onValueChange={updateToneCurve}
                    activeId={activeToneId}
                    onActiveIdChange={setActiveToneId}
                    channel={toneChannel}
                    histogram={GOLDEN_HOUR_LUMINANCE_HISTOGRAM}
                    label="Golden hour image tone curve"
                  />
                  <div className="photo-editor-sidebar__readout">
                    <Tag>Histogram</Tag>
                    <output>Image luminance · shadow to highlight distribution</output>
                  </div>
                  <div className="photo-editor-sidebar__readout">
                    <Tag>Tone</Tag>
                    <output>
                      Input {Math.round((activeTonePoint?.x ?? 0) * 255)} → Output{' '}
                      {Math.round((activeTonePoint?.y ?? 0) * 255)}
                    </output>
                  </div>
                </Disclosure>

                <Disclosure label="Grain & texture" summary="Fine" defaultOpen>
                  <AxisField
                    value={grain}
                    onValueChange={setGrain}
                    snapToGrid
                    xLabel="Amount"
                    yLabel="Size"
                    label="Grain amount and size"
                  />
                  <div className="photo-editor-sidebar__readout">
                    <Tag>Grain</Tag>
                    <output>
                      Amount {Math.round(grain.x * 100)} · Size {Math.round(grain.y * 100)}
                    </output>
                  </div>
                  <ToggleRow
                    size="sm"
                    variant="compact"
                    label="Luminance smoothing"
                    description="Keep flat areas clean"
                    checked={luminanceSmoothing}
                    onChange={(event) => setLuminanceSmoothing(event.target.checked)}
                  />
                </Disclosure>
              </div>
            </div>

            <footer className="photo-editor-sidebar__footer">
              <Button variant="ghost" size="sm" fullWidth onClick={resetDevelop}>
                Reset develop settings
              </Button>
            </footer>
          </aside>
        </div>
        <p className="section-note">
          This is composition, not a new sidebar component. The same Dropdown, Disclosure, Slider,
          RulerSlider, ToggleRow, HistogramScope, ToneCurve, and AxisField remain directly reusable
          elsewhere in the kit.
        </p>
      </Section>

      <Section title="Composition notes">
        <div className="photo-editor-guidance">
          <div>
            <Tag>Priority</Tag>
            <strong>Put common adjustments first</strong>
            <p>Exposure, contrast, and temperature form the immediate editing loop.</p>
          </div>
          <div>
            <Tag>Visual edits</Tag>
            <strong>Give visual edits their source data</strong>
            <p>
              The histogram and tone curve share the image’s luminance bins, while the grain field
              makes treatment changes legible before a value is read.
            </p>
          </div>
          <div>
            <Tag>Density</Tag>
            <strong>Let disclosures manage detail</strong>
            <p>
              Each section has a meaningful summary, so the inspector stays scannable when
              collapsed.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
