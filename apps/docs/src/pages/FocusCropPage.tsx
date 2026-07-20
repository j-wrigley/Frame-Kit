import { useState } from 'react';
import {
  Button,
  Dropdown,
  FocusCrop,
  ResetIcon,
  Toggle,
  type FocusCropFocalPoint,
  type FocusCropValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type AspectPreset = 'wide' | 'square' | 'portrait' | 'free';

const ASPECT_OPTIONS = [
  { value: 'wide', label: '16:9', description: 'Widescreen frame' },
  { value: 'square', label: '1:1', description: 'Square crop' },
  { value: 'portrait', label: '4:5', description: 'Portrait crop' },
  { value: 'free', label: 'Free', description: 'Independent width and height' },
];

const ASPECT_RATIOS: Record<Exclude<AspectPreset, 'free'>, number> = {
  wide: 16 / 9,
  square: 1,
  portrait: 4 / 5,
};

const DEFAULT_CROP: FocusCropValue = { x: 0.11, y: 0.11, width: 0.78, height: 0.72 };
const DEFAULT_FOCUS: FocusCropFocalPoint = { x: 0.5, y: 0.5 };
const CANVAS_ASPECT = 296 / 176;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fitAspect(crop: FocusCropValue, ratio: number): FocusCropValue {
  const factor = CANVAS_ASPECT / ratio;
  const centreX = crop.x + crop.width / 2;
  const centreY = crop.y + crop.height / 2;
  const width = Math.min(crop.width, 1, 1 / factor);
  const height = width * factor;
  return {
    x: clamp(centreX - width / 2, 0, 1 - width),
    y: clamp(centreY - height / 2, 0, 1 - height),
    width,
    height,
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function FocusCropPage() {
  const [crop, setCrop] = useState<FocusCropValue>(DEFAULT_CROP);
  const [focus, setFocus] = useState<FocusCropFocalPoint>(DEFAULT_FOCUS);
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>('wide');
  const [aspectLocked, setAspectLocked] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const aspectRatio = aspectPreset === 'free' ? null : ASPECT_RATIOS[aspectPreset];

  const changeAspect = (next: string) => {
    const nextPreset = next as AspectPreset;
    setAspectPreset(nextPreset);
    if (nextPreset === 'free') {
      setAspectLocked(false);
      return;
    }
    setAspectLocked(true);
    setCrop((current) => fitAspect(current, ASPECT_RATIOS[nextPreset]));
  };

  const reset = () => {
    setCrop(DEFAULT_CROP);
    setFocus(DEFAULT_FOCUS);
    setAspectPreset('wide');
    setAspectLocked(true);
    setShowSafeArea(true);
  };

  const stateLabel =
    aspectPreset === 'free' ? 'Free crop' : aspectLocked ? 'Aspect locked' : 'Aspect free';

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Focus / crop region"
        lede="A bounded framing field for crop, subject placement, and delivery-safe composition. Resize the frame, keep a deliberate aspect when needed, and place the focal point independently."
      />

      <Section title="Focus and crop inspector">
        <p className="section-intro">
          Keep framing decisions legible in one compact surface. The crop always stays inside the
          image, the safe areas are optional guidance, and the focal point remains relative to the
          selected frame.
        </p>
        <div className="demo">
          <div className="focus-crop-inspector" aria-label="Focus and crop inspector">
            <div className="focus-crop-inspector__heading">
              <div>
                <span className="fk-tag">Crop</span>
                <strong>Focus region</strong>
              </div>
              <span className="focus-crop-inspector__state">{stateLabel}</span>
            </div>

            <div className="focus-crop-inspector__controls">
              <Dropdown
                size="sm"
                label="Crop aspect ratio"
                options={ASPECT_OPTIONS}
                value={aspectPreset}
                onValueChange={changeAspect}
                fullWidth
              />
              <label className="focus-crop-inspector__setting">
                <span>Lock</span>
                <Toggle
                  size="sm"
                  aria-label="Lock crop aspect ratio"
                  checked={aspectLocked}
                  disabled={aspectRatio == null}
                  onChange={(event) => setAspectLocked(event.target.checked)}
                />
              </label>
              <label className="focus-crop-inspector__setting">
                <span>Safe</span>
                <Toggle
                  size="sm"
                  aria-label="Show safe-area guides"
                  checked={showSafeArea}
                  onChange={(event) => setShowSafeArea(event.target.checked)}
                />
              </label>
            </div>

            <FocusCrop
              value={crop}
              onValueChange={setCrop}
              focalPoint={focus}
              onFocalPointChange={setFocus}
              aspectRatio={aspectRatio}
              aspectLocked={aspectLocked}
              showSafeArea={showSafeArea}
              label="Feature image focus and crop region"
            />

            <div className="focus-crop-inspector__readout">
              <span className="fk-tag">Frame</span>
              <output>
                {formatPercent(crop.width)} × {formatPercent(crop.height)} · X{' '}
                {formatPercent(crop.x)}
              </output>
              <span className="fk-tag">Focus</span>
              <output>
                X {focus.x.toFixed(2)} · Y {focus.y.toFixed(2)}
              </output>
              <Button
                size="sm"
                variant="ghost"
                iconStart={<ResetIcon />}
                aria-label="Reset focus and crop region"
                title="Reset focus and crop region"
                onClick={reset}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag inside the crop to reposition it. Drag any corner handle to resize; when Lock is
          active, the selected ratio remains exact. Drag the target to set focus, or use its arrow
          keys for small adjustments and <code>Shift</code> for larger ones.
        </p>
      </Section>

      <Section title="Compose for the delivery frame">
        <div className="focus-crop-guidance">
          <div>
            <span className="fk-tag spec-label">Bounds</span>
            <strong>Keep intent inside the image</strong>
            <p>The frame clamps at every edge so no crop can produce an unavailable region.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Safe areas</span>
            <strong>Guide, never obscure</strong>
            <p>
              Use quiet nested guides for titles and key action, then hide them when they are not
              useful.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Focus</span>
            <strong>Place the subject separately</strong>
            <p>
              Keep the focal target relative to the crop so it travels predictably while reframing.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { FocusCrop, type FocusCropValue } from '@presentstandards/framekit-ui';

const [crop, setCrop] = useState<FocusCropValue>({
  x: 0.11, y: 0.11, width: 0.78, height: 0.72,
});

<FocusCrop
  value={crop}
  onValueChange={setCrop}
  aspectRatio={16 / 9}
  aspectLocked
  showSafeArea
  label="Feature image crop"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
