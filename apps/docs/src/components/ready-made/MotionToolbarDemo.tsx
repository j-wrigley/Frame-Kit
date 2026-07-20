import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Button,
  KeyframeLane,
  PauseIcon,
  PlayIcon,
  StopwatchIcon,
  Tag,
  Toolbar,
  type KeyframeLaneKeyframe,
} from '@presentstandards/framekit-ui';

const DURATION = 1600;

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
      { id: 'background-shift', time: 600, label: 'Shift' },
      { id: 'background-end', time: 1600, label: 'End' },
    ],
  },
  {
    id: 'orbit',
    label: 'Orbit ring',
    keyframes: [
      { id: 'orbit-start', time: 0, label: 'Start' },
      { id: 'orbit-enter', time: 300, label: 'Enter' },
      { id: 'orbit-turn', time: 900, label: 'Turn' },
      { id: 'orbit-end', time: 1600, label: 'End' },
    ],
  },
  {
    id: 'title',
    label: 'Title entrance',
    keyframes: [
      { id: 'title-start', time: 0, label: 'Hidden' },
      { id: 'title-enter', time: 400, label: 'Enter' },
      { id: 'title-settle', time: 900, label: 'Settle' },
      { id: 'title-end', time: 1600, label: 'End' },
    ],
  },
  {
    id: 'caption',
    label: 'Caption',
    keyframes: [
      { id: 'caption-start', time: 0, label: 'Hidden' },
      { id: 'caption-enter', time: 600, label: 'Enter' },
      { id: 'caption-settle', time: 1100, label: 'Settle' },
      { id: 'caption-end', time: 1600, label: 'End' },
    ],
  },
];

function getInitialTracks() {
  return INITIAL_TRACKS.map((track) => ({
    ...track,
    keyframes: track.keyframes.map((keyframe) => ({ ...keyframe })),
  }));
}

function normaliseTimelineTime(time: number) {
  return Math.min(DURATION, Math.max(0, time));
}

function formatTime(time: number) {
  return `${Math.round(time)} milliseconds`;
}

export function MotionToolbarDemo({ className }: { className?: string }) {
  const timelineEditorRef = useRef<HTMLDivElement>(null);
  const timelinePanelId = useId();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [tracks, setTracks] = useState<MotionTrack[]>(getInitialTracks);
  const [activeTrackId, setActiveTrackId] = useState('title');
  const [activeIds, setActiveIds] = useState<Record<string, string>>({
    background: 'background-shift',
    orbit: 'orbit-turn',
    title: 'title-settle',
    caption: 'caption-enter',
  });
  const [playhead, setPlayhead] = useState(900);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  const updateTrackKeyframes = (trackId: string, keyframes: KeyframeLaneKeyframe[]) => {
    setTracks((current) =>
      current.map((track) => (track.id === trackId ? { ...track, keyframes } : track))
    );
  };

  const updatePlayheadFromPointer = useCallback((clientX: number) => {
    const lane = timelineEditorRef.current?.querySelector<SVGSVGElement>(
      '.fk-keyframe-lane__canvas'
    );
    const bounds = lane?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;
    setPlayhead(normaliseTimelineTime(((clientX - bounds.left) / bounds.width) * DURATION));
  }, []);

  const handlePlayheadPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingPlayhead(true);
    updatePlayheadFromPointer(event.clientX);
  };

  const handlePlayheadPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead) updatePlayheadFromPointer(event.clientX);
  };

  const stopPlayheadDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingPlayhead(false);
  };

  const handlePlayheadKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const increment = event.shiftKey ? 100 : 10;
    let nextTime = playhead;

    if (event.key === 'ArrowLeft') nextTime -= increment;
    else if (event.key === 'ArrowRight') nextTime += increment;
    else if (event.key === 'Home') nextTime = 0;
    else if (event.key === 'End') nextTime = DURATION;
    else return;

    event.preventDefault();
    setPlayhead(normaliseTimelineTime(nextTime));
  };

  return (
    <div
      className={['motion-tool-layout', className].filter(Boolean).join(' ')}
      aria-label="Motion timeline toolbar workspace"
    >
      <header className="motion-tool-layout__header">
        <div>
          <Tag>Shot 01</Tag>
          <strong>Title entrance</strong>
        </div>
        <div className="motion-tool-layout__header-actions">
          <span>1920 × 1080 · 24 fps</span>
          <Toolbar size="large" aria-label="Motion controls">
            <Button
              variant="ghost"
              size="sm"
              iconStart={<StopwatchIcon />}
              aria-label="Motion timeline"
              aria-controls={timelinePanelId}
              aria-expanded={timelineOpen}
              aria-pressed={timelineOpen}
              onClick={() => setTimelineOpen((current) => !current)}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={isPreviewing ? <PauseIcon /> : <PlayIcon />}
              aria-label={isPreviewing ? 'Pause preview' : 'Play preview'}
              aria-pressed={isPreviewing}
              onClick={() => setIsPreviewing((current) => !current)}
            />
          </Toolbar>
        </div>
      </header>

      <div className="motion-tool-layout__stage" aria-label="Empty motion composition canvas">
        <section
          className="motion-tool-layout__timeline-panel"
          data-open={timelineOpen || undefined}
          aria-hidden={!timelineOpen}
          id={timelinePanelId}
        >
          <div className="motion-tool-layout__timeline-editor" ref={timelineEditorRef}>
            <div className="motion-tool-layout__timeline-ruler" aria-hidden="true">
              <span>Layers</span>
              <div>
                {[0, 400, 800, 1200, 1600].map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>
            </div>
            <div className="motion-tool-layout__timeline-tracks">
              {tracks.map((track) => {
                const activeId = activeIds[track.id] ?? track.keyframes[0]?.id ?? null;
                return (
                  <div
                    className="motion-tool-layout__timeline-track"
                    data-active={track.id === activeTrackId || undefined}
                    key={track.id}
                  >
                    <button
                      className="motion-tool-layout__timeline-layer"
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
                      onActiveIdChange={(id) => {
                        if (!id) return;
                        setActiveTrackId(track.id);
                        setActiveIds((current) => ({ ...current, [track.id]: id }));
                      }}
                      playhead={playhead}
                      onPlayheadChange={setPlayhead}
                      showPlayhead={false}
                      duration={DURATION}
                      label={`${track.label} keyframes`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="motion-tool-layout__playhead-area">
              <div
                className="motion-tool-layout__playhead"
                role="slider"
                tabIndex={0}
                aria-label="Timeline playhead"
                aria-valuemin={0}
                aria-valuemax={DURATION}
                aria-valuenow={playhead}
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
        </section>
      </div>
    </div>
  );
}
