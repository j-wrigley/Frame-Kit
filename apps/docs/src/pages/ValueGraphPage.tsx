import { useState } from 'react';
import {
  Button,
  ResetIcon,
  Tag,
  Tabs,
  ValueGraph,
  type ValueGraphChannel,
  type ValueGraphChannels,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const INITIAL_CHANNELS: ValueGraphChannels = {
  position: [
    { id: 'position-start', time: 0, value: -0.08 },
    { id: 'position-rise', time: 0.24, value: 0.46 },
    { id: 'position-drift', time: 0.57, value: -0.22 },
    { id: 'position-peak', time: 0.82, value: 0.62 },
    { id: 'position-end', time: 1, value: 0.16 },
  ],
  scale: [
    { id: 'scale-start', time: 0, value: -0.42 },
    { id: 'scale-settle', time: 0.3, value: 0.14 },
    { id: 'scale-peak', time: 0.68, value: 0.48 },
    { id: 'scale-end', time: 1, value: 0.08 },
  ],
  rotation: [
    { id: 'rotation-start', time: 0, value: 0.3 },
    { id: 'rotation-turn', time: 0.38, value: -0.22 },
    { id: 'rotation-settle', time: 0.74, value: 0.26 },
    { id: 'rotation-end', time: 1, value: -0.1 },
  ],
  opacity: [
    { id: 'opacity-start', time: 0, value: -0.88 },
    { id: 'opacity-in', time: 0.16, value: 0.1 },
    { id: 'opacity-hold', time: 0.52, value: 0.72 },
    { id: 'opacity-out', time: 0.82, value: 0.28 },
    { id: 'opacity-end', time: 1, value: 0.92 },
  ],
};

const CHANNEL_OPTIONS = [
  { value: 'position', label: 'Position' },
  { value: 'scale', label: 'Scale' },
  { value: 'rotation', label: 'Rotation' },
  { value: 'opacity', label: 'Opacity' },
];

function formatChannel(channel: ValueGraphChannel) {
  return `${channel[0].toUpperCase()}${channel.slice(1)}`;
}

function formatValue(channel: ValueGraphChannel, value: number) {
  if (channel === 'position') return `${Math.round(value * 100)} px`;
  if (channel === 'scale') return `${(1 + value * 0.35).toFixed(2)}×`;
  if (channel === 'rotation') return `${Math.round(value * 180)}°`;
  return `${Math.round(((value + 1) / 2) * 100)}%`;
}

export function ValueGraphPage() {
  const [channels, setChannels] = useState<ValueGraphChannels>(INITIAL_CHANNELS);
  const [activeChannel, setActiveChannel] = useState<ValueGraphChannel>('position');
  const [activePointId, setActivePointId] = useState<string | null>('position-rise');
  const activePoints = channels[activeChannel];
  const activePoint =
    activePoints.find((point) => point.id === activePointId) ?? activePoints[0] ?? null;

  const changeChannel = (nextValue: string) => {
    const nextChannel = nextValue as ValueGraphChannel;
    setActiveChannel(nextChannel);
    setActivePointId(
      channels[nextChannel][Math.min(1, channels[nextChannel].length - 1)]?.id ?? null
    );
  };

  const reset = () => {
    setChannels(INITIAL_CHANNELS);
    setActiveChannel('position');
    setActivePointId('position-rise');
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Value graph"
        lede="A multi-channel animation graph for shaping position, scale, rotation, and opacity in one calm, coordinated view. Edit the active curve directly while the remaining channels preserve timing context."
      />

      <Section title="Animation value inspector">
        <p className="section-intro">
          A selected channel stays precise and editable. The three background curves stay quiet,
          making it easy to retain timing relationships across a full animation without turning the
          editor into a dense timeline.
        </p>
        <div className="demo">
          <div className="value-graph-inspector" aria-label="Animation value graph inspector">
            <div className="value-graph-inspector__heading">
              <div>
                <Tag>Motion</Tag>
                <strong>Animation values</strong>
              </div>
              <div className="value-graph-inspector__actions">
                <span>4 channels</span>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset animation value graph"
                  title="Reset animation value graph"
                  onClick={reset}
                />
              </div>
            </div>

            <Tabs
              size="sm"
              fullWidth
              variant="underline"
              aria-label="Animation value channel"
              items={CHANNEL_OPTIONS}
              value={activeChannel}
              onValueChange={changeChannel}
            />

            <ValueGraph
              value={channels}
              onValueChange={setChannels}
              activeChannel={activeChannel}
              activePointId={activePointId}
              onActivePointChange={setActivePointId}
              label={`${formatChannel(activeChannel)} animation value graph`}
            />

            <div className="value-graph-inspector__readout">
              <Tag>{formatChannel(activeChannel)}</Tag>
              <output>{activePoint ? formatValue(activeChannel, activePoint.value) : '—'}</output>
              <span>at {activePoint ? `${Math.round(activePoint.time * 100)}%` : '—'}</span>
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag an active key point, or focus one and use the arrow keys; hold <kbd>Shift</kbd> for
          larger moves. Double-click the graph to add a key point, and press <kbd>Delete</kbd> on an
          interior point to remove it.
        </p>
      </Section>

      <Section title="Keep the animation readable">
        <div className="value-graph-guidance">
          <div>
            <Tag>Channels</Tag>
            <strong>Focus one value at a time</strong>
            <p>
              The active curve carries the decision; the others stay present only for timing
              context.
            </p>
          </div>
          <div>
            <Tag>Keys</Tag>
            <strong>Use deliberate inflection points</strong>
            <p>A small number of meaningful keys is easier to tune, review, and hand off.</p>
          </div>
          <div>
            <Tag>Baseline</Tag>
            <strong>Keep zero visible</strong>
            <p>
              The quiet central reference makes overshoot and directional change immediately
              legible.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { ValueGraph, type ValueGraphChannels } from '@presentstandards/framekit-ui';

const [channels, setChannels] = useState<ValueGraphChannels>({
  position: [{ id: 'start', time: 0, value: 0 }, { id: 'end', time: 1, value: 0.4 }],
  scale: [{ id: 'start', time: 0, value: 0 }, { id: 'end', time: 1, value: 0.2 }],
  rotation: [{ id: 'start', time: 0, value: 0 }, { id: 'end', time: 1, value: -0.3 }],
  opacity: [{ id: 'start', time: 0, value: -1 }, { id: 'end', time: 1, value: 1 }],
});

<ValueGraph
  value={channels}
  onValueChange={setChannels}
  activeChannel="position"
  label="Position animation value graph"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
