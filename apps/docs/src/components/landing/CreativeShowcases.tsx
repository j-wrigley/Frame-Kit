import { useState } from 'react';
import {
  AxisField,
  Button,
  CameraPath,
  Dropdown,
  NodeCanvas,
  NumberInput,
  PlusIcon,
  ResetIcon,
  SegmentedSwitch,
  Toggle,
  ToneCurve,
  type CameraPathWaypoint,
  type NodeCanvasConnection,
  type NodeCanvasNode,
  type ToneCurveChannel,
  type ToneCurvePoint,
} from '@presentstandards/framekit-ui';

type TonePreset = 'linear' | 'contrast' | 'lifted' | 'filmic' | 'custom';

const TONE_CHANNEL_OPTIONS = [
  { value: 'luminance', label: 'Luma' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

const TONE_PRESET_OPTIONS = [
  { value: 'linear', label: 'Linear', description: 'No tonal change' },
  { value: 'contrast', label: 'Soft contrast', description: 'Gently deepen and lift' },
  { value: 'lifted', label: 'Lifted blacks', description: 'Matte shadow detail' },
  { value: 'filmic', label: 'Filmic', description: 'Compressed highlights' },
];

const TONE_PRESET_VALUES: Record<
  Exclude<TonePreset, 'custom'>,
  ReadonlyArray<readonly [number, number]>
> = {
  linear: [
    [0, 0],
    [1, 1],
  ],
  contrast: [
    [0, 0],
    [0.24, 0.18],
    [0.74, 0.82],
    [1, 1],
  ],
  lifted: [
    [0, 0.08],
    [0.28, 0.28],
    [0.72, 0.76],
    [1, 0.96],
  ],
  filmic: [
    [0, 0.03],
    [0.3, 0.2],
    [0.66, 0.76],
    [1, 0.94],
  ],
};

function tonePointsForPreset(preset: Exclude<TonePreset, 'custom'>, key: string): ToneCurvePoint[] {
  return TONE_PRESET_VALUES[preset].map(([x, y], index) => ({
    id: `${key}-${preset}-${index}`,
    x,
    y,
  }));
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

function formatToneChannel(channel: ToneCurveChannel) {
  return channel === 'luminance' ? 'Luminance' : `${channel[0].toUpperCase()}${channel.slice(1)}`;
}

export function ToneCurveShowcase() {
  const [preset, setPreset] = useState<TonePreset>('contrast');
  const [channel, setChannel] = useState<ToneCurveChannel>('luminance');
  const [curves, setCurves] = useState<Record<ToneCurveChannel, ToneCurvePoint[]>>(() => ({
    luminance: tonePointsForPreset('contrast', 'luma'),
    red: tonePointsForPreset('linear', 'red'),
    green: tonePointsForPreset('linear', 'green'),
    blue: tonePointsForPreset('linear', 'blue'),
  }));
  const [activeId, setActiveId] = useState<string | null>('luma-contrast-1');
  const points = curves[channel];
  const activeIndex = Math.max(
    0,
    points.findIndex((point) => point.id === activeId)
  );
  const activePoint = points[activeIndex] ?? points[0];

  const setCurrentPoints = (nextPoints: ToneCurvePoint[]) => {
    setCurves((current) => ({ ...current, [channel]: nextPoints }));
    setPreset('custom');
  };

  const selectChannel = (next: string) => {
    const nextChannel = next as ToneCurveChannel;
    setChannel(nextChannel);
    setActiveId(curves[nextChannel][Math.min(1, curves[nextChannel].length - 1)]?.id ?? null);
  };

  const selectPreset = (next: string) => {
    const nextPreset = next as Exclude<TonePreset, 'custom'>;
    const nextPoints = tonePointsForPreset(nextPreset, channel);
    setCurves((current) => ({ ...current, [channel]: nextPoints }));
    setActiveId(nextPoints[Math.min(1, nextPoints.length - 1)]?.id ?? null);
    setPreset(nextPreset);
  };

  const updateActivePoint = (key: 'x' | 'y', value: number) => {
    if (!activePoint || !Number.isFinite(value)) return;
    setCurrentPoints(
      points.map((point, index) =>
        index === activeIndex
          ? {
              ...point,
              [key]:
                key === 'x' && (index === 0 || index === points.length - 1)
                  ? point.x
                  : clampUnit(value),
            }
          : point
      )
    );
  };

  const reset = () => {
    const nextPoints = tonePointsForPreset('contrast', channel);
    setCurves((current) => ({ ...current, [channel]: nextPoints }));
    setActiveId(nextPoints[1]?.id ?? null);
    setPreset(channel === 'luminance' ? 'contrast' : 'custom');
  };

  return (
    <div className="tone-curve-inspector landing-tone-curve" aria-label="Tone curve inspector">
      <div className="tone-curve-inspector__heading">
        <div>
          <strong>Tone curve</strong>
        </div>
        <span className="tone-curve-inspector__state">
          {preset === 'custom' ? 'Custom' : 'Preset'}
        </span>
      </div>

      <div className="tone-curve-inspector__controls">
        <Dropdown
          size="sm"
          label="Tone curve preset"
          options={TONE_PRESET_OPTIONS}
          value={preset === 'custom' ? undefined : preset}
          placeholder="Custom curve"
          onValueChange={selectPreset}
          fullWidth
        />
        <Button
          size="sm"
          variant="ghost"
          iconStart={<ResetIcon />}
          aria-label="Reset tone curve"
          title="Reset tone curve"
          onClick={reset}
        />
      </div>

      <SegmentedSwitch
        size="sm"
        fullWidth
        aria-label="Tone curve channel"
        options={TONE_CHANNEL_OPTIONS}
        value={channel}
        onValueChange={selectChannel}
      />

      <ToneCurve
        value={points}
        onValueChange={setCurrentPoints}
        activeId={activeId}
        onActiveIdChange={setActiveId}
        channel={channel}
        label={`${formatToneChannel(channel)} tone curve`}
      />

      <div className="tone-curve-inspector__readout">
        <span className="fk-tag">Point {String(activeIndex + 1).padStart(2, '0')}</span>
        <output>
          Input {Math.round((activePoint?.x ?? 0) * 255)} → Output{' '}
          {Math.round((activePoint?.y ?? 0) * 255)}
        </output>
      </div>

      <div className="tone-curve-inspector__fine-tuning">
        <NumberInput
          size="sm"
          label="Input"
          font="mono"
          value={String(Math.round((activePoint?.x ?? 0) * 255))}
          disabled={activeIndex === 0 || activeIndex === points.length - 1}
          decrementLabel="Decrease tone curve input"
          incrementLabel="Increase tone curve input"
          onChange={(event) => updateActivePoint('x', Number.parseFloat(event.target.value) / 255)}
          onDecrement={() => updateActivePoint('x', (activePoint?.x ?? 0) - 1 / 255)}
          onIncrement={() => updateActivePoint('x', (activePoint?.x ?? 0) + 1 / 255)}
        />
        <NumberInput
          size="sm"
          label="Output"
          font="mono"
          value={String(Math.round((activePoint?.y ?? 0) * 255))}
          decrementLabel="Decrease tone curve output"
          incrementLabel="Increase tone curve output"
          onChange={(event) => updateActivePoint('y', Number.parseFloat(event.target.value) / 255)}
          onDecrement={() => updateActivePoint('y', (activePoint?.y ?? 0) - 1 / 255)}
          onIncrement={() => updateActivePoint('y', (activePoint?.y ?? 0) + 1 / 255)}
        />
      </div>
    </div>
  );
}

const NODE_NODES: readonly NodeCanvasNode[] = [
  {
    id: 'footage',
    label: 'Footage',
    kind: 'Source',
    x: 20,
    y: 128,
    outputs: [
      { id: 'image', label: 'Image' },
      { id: 'luma', label: 'Luma' },
    ],
  },
  {
    id: 'grade',
    label: 'Grade',
    kind: 'Process',
    x: 196,
    y: 34,
    inputs: [
      { id: 'image', label: 'Image' },
      { id: 'mask', label: 'Mask' },
    ],
    outputs: [{ id: 'image', label: 'Image' }],
    tone: 'accent',
  },
  {
    id: 'position',
    label: 'Position',
    kind: 'Control',
    x: 196,
    y: 174,
    outputs: [{ id: 'value', label: 'Value' }],
    tone: 'warning',
    contentHeight: 100,
    content: (
      <AxisField
        defaultValue={{ x: 0.68, y: 0.34 }}
        gridColumns={9}
        gridRows={6}
        snapToGrid
        xLabel="Pan"
        yLabel="Tilt"
        label="Position axis field"
      />
    ),
  },
  {
    id: 'composite',
    label: 'Composite',
    kind: 'Output',
    x: 432,
    y: 126,
    inputs: [
      { id: 'image', label: 'Image' },
      { id: 'mix', label: 'Mix' },
    ],
    outputs: [{ id: 'image', label: 'Image' }],
    tone: 'success',
  },
];

const NODE_CONNECTIONS: readonly NodeCanvasConnection[] = [
  {
    id: 'footage-image-grade-image',
    from: { nodeId: 'footage', portId: 'image' },
    to: { nodeId: 'grade', portId: 'image' },
  },
  {
    id: 'grade-image-composite-image',
    from: { nodeId: 'grade', portId: 'image' },
    to: { nodeId: 'composite', portId: 'image' },
  },
  {
    id: 'position-value-composite-mix',
    from: { nodeId: 'position', portId: 'value' },
    to: { nodeId: 'composite', portId: 'mix' },
  },
];

function copyNodes() {
  return NODE_NODES.map((node) => ({
    ...node,
    inputs: node.inputs?.map((port) => ({ ...port })),
    outputs: node.outputs?.map((port) => ({ ...port })),
  }));
}

function copyConnections() {
  return NODE_CONNECTIONS.map((connection) => ({
    ...connection,
    from: { ...connection.from },
    to: { ...connection.to },
  }));
}

export function NodeCanvasShowcase() {
  const [nodes, setNodes] = useState<NodeCanvasNode[]>(copyNodes);
  const [connections, setConnections] = useState<NodeCanvasConnection[]>(copyConnections);
  const [activeNodeId, setActiveNodeId] = useState<string | null>('grade');

  return (
    <NodeCanvas
      className="landing-node-canvas"
      value={nodes}
      onValueChange={setNodes}
      connections={connections}
      onConnectionsChange={setConnections}
      activeNodeId={activeNodeId}
      onActiveNodeIdChange={setActiveNodeId}
      width={620}
      height={364}
      label="Colour processing node canvas"
    />
  );
}

type PathPreset = 'sweep' | 'push-in' | 'reveal' | 'custom';
type PointKey = 'x' | 'y';

const PATH_PRESET_OPTIONS = [
  { value: 'sweep', label: 'Sweep', description: 'Cross-frame movement' },
  { value: 'push-in', label: 'Push in', description: 'Centered close-up' },
  { value: 'reveal', label: 'Reveal', description: 'Hold, then uncover' },
];

const PATH_PRESETS: Record<Exclude<PathPreset, 'custom'>, readonly CameraPathWaypoint[]> = {
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

function formatPathPoint(point: CameraPathWaypoint) {
  return `X ${point.x.toFixed(2)} · Y ${point.y.toFixed(2)}`;
}

export function CameraPathShowcase() {
  const [preset, setPreset] = useState<PathPreset>('sweep');
  const [customPath, setCustomPath] = useState<CameraPathWaypoint[]>([...PATH_PRESETS.sweep]);
  const [activeIndex, setActiveIndex] = useState(1);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const isCustom = preset === 'custom';
  const path = isCustom ? customPath : PATH_PRESETS[preset];
  const activePoint = path[activeIndex] ?? path[0] ?? { x: 0, y: 0 };

  const startCustom = () => {
    if (!isCustom) setCustomPath([...path]);
    setPreset('custom');
  };

  const selectPreset = (nextPreset: Exclude<PathPreset, 'custom'>) => {
    setPreset(nextPreset);
    setActiveIndex(Math.min(1, PATH_PRESETS[nextPreset].length - 1));
  };

  const updatePoint = (key: PointKey, value: number) => {
    if (!isCustom || !Number.isFinite(value)) return;
    setCustomPath((current) =>
      current.map((point, index) =>
        index === activeIndex ? { ...point, [key]: clampUnit(value) } : point
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
    setCustomPath([...PATH_PRESETS.sweep]);
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
    <div className="camera-path-inspector landing-camera-path" aria-label="Camera move inspector">
      <div className="camera-path-inspector__heading">
        <div>
          <strong>Camera path</strong>
        </div>
        <span className="camera-path-inspector__state">{isCustom ? 'Custom' : 'Preset'}</span>
      </div>

      <div className="camera-path-inspector__controls">
        <Dropdown
          label="Camera path preset"
          options={PATH_PRESET_OPTIONS}
          value={isCustom ? undefined : preset}
          placeholder={isCustom ? 'Custom path' : 'Select path'}
          onValueChange={(nextPreset) => selectPreset(nextPreset as Exclude<PathPreset, 'custom'>)}
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
        <output>{formatPathPoint(activePoint)}</output>
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
  );
}
