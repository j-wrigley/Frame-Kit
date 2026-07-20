import { useState } from 'react';
import {
  Button,
  CameraPath,
  Dropdown,
  NumberInput,
  PlusIcon,
  ResetIcon,
  Toggle,
  type CameraPathWaypoint,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type PathPreset = 'sweep' | 'push-in' | 'reveal' | 'custom';
type PointKey = 'x' | 'y';

const PRESET_OPTIONS = [
  { value: 'sweep', label: 'Sweep', description: 'Cross-frame movement' },
  { value: 'push-in', label: 'Push in', description: 'Centered close-up' },
  { value: 'reveal', label: 'Reveal', description: 'Hold, then uncover' },
];

const PRESET_PATHS: Record<Exclude<PathPreset, 'custom'>, readonly CameraPathWaypoint[]> = {
  sweep: [
    { x: 0.08, y: 0.82 },
    { x: 0.48, y: 0.5 },
    { x: 0.9, y: 0.22 },
  ],
  'push-in': [
    { x: 0.2, y: 0.76 },
    { x: 0.5, y: 0.5 },
    { x: 0.7, y: 0.32 },
  ],
  reveal: [
    { x: 0.12, y: 0.3 },
    { x: 0.52, y: 0.3 },
    { x: 0.84, y: 0.72 },
  ],
};

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function formatPoint(point: CameraPathWaypoint) {
  return `X ${point.x.toFixed(2)} · Y ${point.y.toFixed(2)}`;
}

export function CameraPathPage() {
  const [preset, setPreset] = useState<PathPreset>('sweep');
  const [customPath, setCustomPath] = useState<CameraPathWaypoint[]>([...PRESET_PATHS.sweep]);
  const [activeIndex, setActiveIndex] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const isCustom = preset === 'custom';
  const path = isCustom ? customPath : PRESET_PATHS[preset];
  const activePoint = path[activeIndex] ?? path[0] ?? { x: 0, y: 0 };

  const startCustom = () => {
    if (!isCustom) setCustomPath([...path]);
    setPreset('custom');
  };

  const selectPreset = (nextPreset: Exclude<PathPreset, 'custom'>) => {
    setPreset(nextPreset);
    setActiveIndex(Math.min(1, PRESET_PATHS[nextPreset].length - 1));
  };

  const updatePoint = (key: PointKey, value: number) => {
    if (!isCustom || !Number.isFinite(value)) return;
    setCustomPath((current) =>
      current.map((point, index) =>
        index === activeIndex ? { ...point, [key]: clamp(value) } : point
      )
    );
  };

  const addWaypoint = () => {
    const source = isCustom ? customPath : [...path];
    const previous = source[source.length - 2] ?? { x: 0.35, y: 0.65 };
    const last = source[source.length - 1] ?? { x: 0.65, y: 0.35 };
    const nextPoint = { x: (previous.x + last.x) / 2, y: (previous.y + last.y) / 2 };
    const nextPath = [...source, nextPoint].slice(0, 5);

    setCustomPath(nextPath);
    setPreset('custom');
    setActiveIndex(nextPath.length - 1);
  };

  const resetPath = () => {
    setCustomPath([...PRESET_PATHS.sweep]);
    setPreset('sweep');
    setActiveIndex(1);
  };

  const renderNumberInput = (label: string, key: PointKey) => (
    <NumberInput
      key={key}
      size="sm"
      label={label}
      font="mono"
      value={activePoint[key].toFixed(2)}
      disabled={!isCustom}
      decrementLabel={`Decrease ${label}`}
      incrementLabel={`Increase ${label}`}
      onChange={(event) => updatePoint(key, Number.parseFloat(event.target.value))}
      onDecrement={() => updatePoint(key, activePoint[key] - 0.01)}
      onIncrement={() => updatePoint(key, activePoint[key] + 0.01)}
    />
  );

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Camera path"
        lede="A compact spatial editor for camera moves and framing transitions. Start from an intentional route, then switch to direct manipulation when a shot needs its own path."
      />

      <Section title="Camera move inspector">
        <p className="section-intro">
          Keep the path, current waypoint, and exact framing values in one small inspector. The
          default stays readable as a preset; Custom mode makes each waypoint directly editable.
        </p>
        <div className="demo">
          <div className="camera-path-inspector" aria-label="Camera move inspector">
            <div className="camera-path-inspector__heading">
              <div>
                <strong>Camera path</strong>
              </div>
              <span className="camera-path-inspector__state">{isCustom ? 'Custom' : 'Preset'}</span>
            </div>

            <div className="camera-path-inspector__controls">
              <Dropdown
                label="Camera path preset"
                options={PRESET_OPTIONS}
                value={isCustom ? undefined : preset}
                placeholder={isCustom ? 'Custom path' : 'Select path'}
                onValueChange={(nextPreset) =>
                  selectPreset(nextPreset as Exclude<PathPreset, 'custom'>)
                }
                fullWidth
              />
              <Button
                variant={isCustom ? 'primary' : 'secondary'}
                size="md"
                aria-pressed={isCustom}
                onClick={startCustom}
              >
                Custom
              </Button>
            </div>

            <CameraPath
              value={path}
              onValueChange={setCustomPath}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
              editable={isCustom}
              snapToGrid={snapToGrid}
              label="Camera move path"
            />

            <div className="camera-path-inspector__readout">
              <span className="fk-tag">Point {String(activeIndex + 1).padStart(2, '0')}</span>
              <output>{formatPoint(activePoint)}</output>
              <div className="camera-path-inspector__quick-actions">
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<PlusIcon />}
                  aria-label="Add waypoint"
                  title="Add waypoint"
                  onClick={addWaypoint}
                  disabled={path.length >= 5}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset camera path"
                  title="Reset camera path"
                  onClick={resetPath}
                />
              </div>
            </div>

            <div className="camera-path-inspector__editing-strip">
              <div className="camera-path-inspector__point-grid">
                {renderNumberInput('X', 'x')}
                {renderNumberInput('Y', 'y')}
              </div>
              <label className="camera-path-inspector__snap">
                <span>Snap</span>
                <Toggle
                  size="sm"
                  aria-label="Snap waypoints to dot positions"
                  checked={snapToGrid}
                  onChange={(event) => setSnapToGrid(event.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
        <p className="section-note">
          In Custom mode, drag a numbered point or focus it and use arrow keys; hold{' '}
          <code>Shift</code> for larger movements. Snap aligns each edit to a visible dot for
          deliberate, repeatable framing.
        </p>
      </Section>

      <Section title="Plan camera motion deliberately">
        <div className="camera-path-guidance">
          <div>
            <span className="fk-tag spec-label">Route</span>
            <strong>Show a single journey</strong>
            <p>Connect only the important framing decisions so a move can be read at a glance.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Waypoints</span>
            <strong>Number the edit points</strong>
            <p>Keep the selected waypoint visible and pair it with exact values for handoff.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Snap dots</span>
            <strong>Make the target clear</strong>
            <p>
              Use quiet dot targets for repeatable framing, not as decoration or a dense coordinate
              map.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { CameraPath, type CameraPathWaypoint } from '@presentstandards/framekit-ui';

const [path, setPath] = useState<CameraPathWaypoint[]>([
  { x: 0.08, y: 0.82 },
  { x: 0.48, y: 0.5 },
  { x: 0.9, y: 0.22 },
]);

<CameraPath
  value={path}
  onValueChange={setPath}
  editable
  snapToGrid
  label="Camera move path"
/>;

// Compose with Dropdown, ToggleRow, and NumberInput for a full inspector.`}</code>
        </pre>
      </Section>
    </>
  );
}
