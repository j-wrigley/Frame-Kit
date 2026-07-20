import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Button,
  EasingGraph,
  KeyframeLane,
  Popover,
  ResetIcon,
  SegmentedSwitch,
  Toggle,
  type EasingCurve,
  type KeyframeLaneKeyframe,
  type KeyframeLaneRange,
  type KeyframeLaneVariant,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const DURATION = 1200;
const INITIAL_RANGE: KeyframeLaneRange | null = null;
const INITIAL_CURVE: EasingCurve = { x1: 0.22, y1: 0.9, x2: 0.3, y2: 1 };
const VARIANT_OPTIONS = [
  { value: 'diamond', label: 'Keys' },
  { value: 'bar', label: 'Bars' },
  { value: 'dot', label: 'Dots' },
];
type MotionTrack = {
  id: string;
  label: string;
  keyframes: KeyframeLaneKeyframe[];
};

const INITIAL_TRACKS: readonly MotionTrack[] = [
  {
    id: 'background',
    label: 'Background mesh',
    keyframes: [
      { id: 'background-start', time: 0, label: 'Start' },
      { id: 'background-shift', time: 500, label: 'Shift' },
      { id: 'background-end', time: 1200, label: 'End' },
    ],
  },
  {
    id: 'orbit',
    label: 'Orbit ring',
    keyframes: [
      { id: 'orbit-start', time: 0, label: 'Start' },
      { id: 'orbit-enter', time: 300, label: 'Enter' },
      { id: 'orbit-turn', time: 700, label: 'Turn' },
      { id: 'orbit-end', time: 1200, label: 'End' },
    ],
  },
  {
    id: 'title',
    label: 'Frame Kit',
    keyframes: [
      { id: 'title-start', time: 0, label: 'Hidden' },
      { id: 'title-enter', time: 300, label: 'Enter' },
      { id: 'title-settle', time: 700, label: 'Settle' },
      { id: 'title-end', time: 1200, label: 'End' },
    ],
  },
  {
    id: 'caption',
    label: 'Motion controls',
    keyframes: [
      { id: 'caption-start', time: 0, label: 'Hidden' },
      { id: 'caption-enter', time: 500, label: 'Enter' },
      { id: 'caption-settle', time: 900, label: 'Settle' },
      { id: 'caption-end', time: 1200, label: 'End' },
    ],
  },
];

function getInitialTracks() {
  return INITIAL_TRACKS.map((track) => ({
    ...track,
    keyframes: track.keyframes.map((keyframe) => ({ ...keyframe })),
  }));
}

function clamp(value: number) {
  return Math.min(DURATION, Math.max(0, value));
}

function formatTime(time: number) {
  return `${Math.round(time)} ms`;
}

function formatCurve(curve: EasingCurve) {
  return `cubic-bezier(${curve.x1.toFixed(2)}, ${curve.y1.toFixed(2)}, ${curve.x2.toFixed(2)}, ${curve.y2.toFixed(2)})`;
}

export function KeyframeLanePage() {
  const timelineEditorRef = useRef<HTMLDivElement>(null);
  const [tracks, setTracks] = useState<MotionTrack[]>(getInitialTracks);
  const [activeTrackId, setActiveTrackId] = useState('title');
  const [activeIds, setActiveIds] = useState<Record<string, string>>({
    background: 'background-shift',
    orbit: 'orbit-enter',
    title: 'title-settle',
    caption: 'caption-enter',
  });
  const [playhead, setPlayhead] = useState(500);
  const [range, setRange] = useState<KeyframeLaneRange | null>(INITIAL_RANGE);
  const [snapToTicks, setSnapToTicks] = useState(true);
  const [curve, setCurve] = useState<EasingCurve>(INITIAL_CURVE);
  const [timelineVariant, setTimelineVariant] = useState<KeyframeLaneVariant>('diamond');
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];
  const activeKeyframe =
    activeTrack?.keyframes.find((keyframe) => keyframe.id === activeIds[activeTrack.id]) ??
    activeTrack?.keyframes[0];

  const updateTrackKeyframes = (trackId: string, keyframes: KeyframeLaneKeyframe[]) => {
    setTracks((current) =>
      current.map((track) => (track.id === trackId ? { ...track, keyframes } : track))
    );
  };

  const normaliseTimelineTime = useCallback(
    (nextTime: number) => {
      const bounded = clamp(nextTime);
      return snapToTicks ? Math.round(bounded / 100) * 100 : bounded;
    },
    [snapToTicks]
  );

  const updatePlayheadFromPointer = useCallback(
    (clientX: number) => {
      const lane = timelineEditorRef.current?.querySelector<SVGSVGElement>(
        '.fk-keyframe-lane__canvas'
      );
      const bounds = lane?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return;
      setPlayhead(normaliseTimelineTime(((clientX - bounds.left) / bounds.width) * DURATION));
    },
    [normaliseTimelineTime]
  );

  const handlePlayheadPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingPlayhead(true);
    updatePlayheadFromPointer(event.clientX);
  };

  const handlePlayheadPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingPlayhead) return;
    updatePlayheadFromPointer(event.clientX);
  };

  const stopPlayheadDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingPlayhead(false);
  };

  const handlePlayheadKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const multiplier = event.shiftKey ? 5 : 1;
    const increment = (snapToTicks ? 100 : 10) * multiplier;
    let nextTime = playhead;

    if (event.key === 'ArrowLeft') nextTime -= increment;
    else if (event.key === 'ArrowRight') nextTime += increment;
    else if (event.key === 'Home') nextTime = 0;
    else if (event.key === 'End') nextTime = DURATION;
    else return;

    event.preventDefault();
    setPlayhead(normaliseTimelineTime(nextTime));
  };

  const resetTimeline = () => {
    setTracks(getInitialTracks());
    setActiveTrackId('title');
    setActiveIds({
      background: 'background-shift',
      orbit: 'orbit-enter',
      title: 'title-settle',
      caption: 'caption-enter',
    });
    setPlayhead(500);
    setRange(INITIAL_RANGE);
    setSnapToTicks(true);
    setCurve(INITIAL_CURVE);
    setTimelineVariant('diamond');
    setIsDraggingPlayhead(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Keyframe lane"
        lede="A compact temporal editor that scales from a single inspector row into an editorial motion timeline. Share a playhead and working range across layers, while the timeline keeps one coherent keyframe language."
      />

      <Section title="Motion timeline">
        <p className="section-intro">
          A full-width composition shows how the lane behaves in an actual motion workspace. Select
          a layer, then edit its frames without losing the timing context of the rest of the scene.
        </p>
        <div className="demo demo--motion-timeline">
          <div className="motion-timeline" aria-label="Title sequence motion timeline">
            <div className="motion-timeline__header">
              <SegmentedSwitch
                size="sm"
                aria-label="Timeline keyframe styling"
                options={VARIANT_OPTIONS}
                value={timelineVariant}
                onValueChange={(nextVariant) =>
                  setTimelineVariant(nextVariant as KeyframeLaneVariant)
                }
              />
              <div className="motion-timeline__transport">
                <output>
                  {formatTime(playhead)} / {formatTime(DURATION)}
                </output>
              </div>
            </div>

            <div className="motion-timeline__editor" ref={timelineEditorRef}>
              <div className="motion-timeline__ruler" aria-hidden="true">
                <span>Layers</span>
                <div>
                  {[0, 300, 600, 900, 1200].map((time) => (
                    <span key={time}>{time}</span>
                  ))}
                </div>
              </div>

              <div className="motion-timeline__tracks">
                {tracks.map((track) => {
                  const activeId = activeIds[track.id] ?? track.keyframes[0]?.id ?? null;
                  return (
                    <div
                      className="motion-timeline__track"
                      data-active={track.id === activeTrackId || undefined}
                      key={track.id}
                    >
                      <button
                        className="motion-timeline__track-label"
                        type="button"
                        onClick={() => setActiveTrackId(track.id)}
                      >
                        <strong>{track.label}</strong>
                      </button>
                      <KeyframeLane
                        density="compact"
                        value={track.keyframes}
                        onValueChange={(nextKeyframes) =>
                          updateTrackKeyframes(track.id, nextKeyframes)
                        }
                        activeId={activeId}
                        onActiveIdChange={(nextId) => {
                          if (!nextId) return;
                          setActiveTrackId(track.id);
                          setActiveIds((current) => ({ ...current, [track.id]: nextId }));
                        }}
                        playhead={playhead}
                        onPlayheadChange={setPlayhead}
                        showPlayhead={false}
                        range={range}
                        onRangeChange={setRange}
                        duration={DURATION}
                        snap={snapToTicks ? 100 : undefined}
                        variant={timelineVariant}
                        label={`${track.label} animation keyframes`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="motion-timeline__playhead-area">
                <div
                  className="motion-timeline__playhead"
                  role="slider"
                  tabIndex={0}
                  aria-label="Timeline playhead"
                  aria-valuemin={0}
                  aria-valuemax={DURATION}
                  aria-valuenow={Math.round(playhead)}
                  aria-valuetext={formatTime(playhead)}
                  data-dragging={isDraggingPlayhead || undefined}
                  style={{ left: `${(playhead / DURATION) * 100}%` }}
                  onPointerDown={handlePlayheadPointerDown}
                  onPointerMove={handlePlayheadPointerMove}
                  onPointerUp={stopPlayheadDragging}
                  onPointerCancel={stopPlayheadDragging}
                  onKeyDown={handlePlayheadKeyDown}
                >
                  <span />
                </div>
              </div>
            </div>

            <div className="motion-timeline__footer">
              <div className="motion-timeline__readout">
                <strong>
                  {activeTrack?.label ?? 'Frame Kit'} · {activeKeyframe?.label ?? 'Selected'}
                </strong>
              </div>
              <div className="motion-timeline__controls">
                <label className="motion-timeline__snap">
                  <span>Snap</span>
                  <Toggle
                    size="sm"
                    aria-label="Snap keyframes to 100 millisecond ticks"
                    checked={snapToTicks}
                    onChange={(event) => setSnapToTicks(event.target.checked)}
                  />
                </label>
                <Popover
                  trigger={
                    <Button size="sm" variant="ghost" aria-label="Edit selected keyframe easing">
                      Curve
                    </Button>
                  }
                  placement="bottom-end"
                  panelLabel="Selected keyframe easing"
                >
                  <div className="keyframe-easing-popover">
                    <div>
                      <span className="fk-tag">Keyframe</span>
                      <strong>{activeKeyframe?.label ?? 'Selected'} easing</strong>
                    </div>
                    <EasingGraph
                      value={curve}
                      onValueChange={setCurve}
                      label="Selected keyframe easing"
                    />
                    <output>{formatCurve(curve)}</output>
                  </div>
                </Popover>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset motion timeline"
                  title="Reset motion timeline"
                  onClick={resetTimeline}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag the red playhead to scrub across the composition. Click a layer label to make it
          active, drag frames to retime them, or use <code>Shift</code>-drag in an empty section to
          set the working range. The styling control applies one visual treatment to every layer so
          the composition stays easy to scan.
        </p>
      </Section>

      <Section title="Individual lanes">
        <p className="section-intro">
          Each representation keeps the same direct keyframe interaction. Choose the visual language
          that makes the timing easiest to scan in its own context.
        </p>
        <div className="keyframe-lane-individuals">
          <article>
            <div>
              <span className="fk-tag spec-label">Keys</span>
              <strong>Point events</strong>
            </div>
            <KeyframeLane
              density="compact"
              defaultValue={INITIAL_TRACKS[2].keyframes}
              defaultActiveId="title-settle"
              defaultPlayhead={500}
              duration={DURATION}
              snap={100}
              label="Keyframe marker lane"
            />
          </article>
          <article>
            <div>
              <span className="fk-tag spec-label">Bars</span>
              <strong>Holds and states</strong>
            </div>
            <KeyframeLane
              density="compact"
              defaultValue={INITIAL_TRACKS[1].keyframes}
              defaultActiveId="orbit-turn"
              defaultPlayhead={500}
              duration={DURATION}
              snap={100}
              variant="bar"
              label="Keyframe bar lane"
            />
          </article>
          <article>
            <div>
              <span className="fk-tag spec-label">Dots</span>
              <strong>Dense events</strong>
            </div>
            <KeyframeLane
              density="compact"
              defaultValue={INITIAL_TRACKS[3].keyframes}
              defaultActiveId="caption-enter"
              defaultPlayhead={500}
              duration={DURATION}
              snap={100}
              variant="dot"
              label="Keyframe dot lane"
            />
          </article>
        </div>
      </Section>

      <Section title="Build a real motion workspace">
        <div className="keyframe-lane-guidance">
          <div>
            <span className="fk-tag spec-label">Layers</span>
            <strong>Make the composition visible</strong>
            <p>
              Use one row per scene layer so timing decisions can be read across the whole sequence.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Shared time</span>
            <strong>Keep the editor aligned</strong>
            <p>
              Pass the same playhead and range to every compact lane for a single motion context.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">One treatment</span>
            <strong>Use one visual language</strong>
            <p>
              Apply marker, bar, or dot styling across all layers rather than mixing styles by row.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { KeyframeLane, type KeyframeLaneKeyframe } from '@presentstandards/framekit-ui';

<KeyframeLane
  density="compact"
  value={positionKeyframes}
  onValueChange={setPositionKeyframes}
  playhead={playhead}
  onPlayheadChange={setPlayhead}
  range={range}
  onRangeChange={setRange}
  duration={1200}
  snap={100}
  variant="diamond"
  label="Position animation keyframes"
/>;

// Stack compact lanes with a shared playhead and range for a motion timeline.
// Variants: 'diamond' (default), 'bar', and 'dot'.`}</code>
        </pre>
      </Section>
    </>
  );
}
