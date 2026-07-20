import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  DropZone,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SegmentedSwitch,
  TrackNextIcon,
  TrackPreviousIcon,
  Toggle,
  VideoTimeline,
  type VideoTimelineDensity,
  type VideoTimelineEditEvent,
  type VideoTimelineTrack,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const DURATION = 16000;
const DENSITY_OPTIONS = [
  { value: 'regular', label: 'Roomy' },
  { value: 'compact', label: 'Compact' },
];

function fileLabel(file: File) {
  return file.name.replace(/\.[^/.]+$/, '') || file.name;
}

function fileExtension(file: File) {
  return file.name.split('.').pop()?.slice(0, 5).toUpperCase() || 'FILE';
}

function fileMediaType(file: File) {
  if (file.type.startsWith('video/')) return 'video' as const;
  if (file.type.startsWith('audio/')) return 'audio' as const;
  if (file.type.startsWith('image/')) return 'image' as const;
  return 'file' as const;
}

function mediaTrackId(mediaType: ReturnType<typeof fileMediaType>) {
  if (mediaType === 'video') return 'primary';
  if (mediaType === 'image') return 'cutaways';
  if (mediaType === 'audio') return 'audio';
  return 'graphics';
}

async function readAudioDuration(file: File) {
  const context = new AudioContext();
  try {
    const audioBuffer = await context.decodeAudioData(await file.arrayBuffer());
    return audioBuffer.duration * 1000;
  } finally {
    void context.close();
  }
}

function readVideoDuration(source: string) {
  return new Promise<number>((resolve) => {
    const video = document.createElement('video');
    const finish = (duration: number) => {
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
      resolve(duration);
    };
    video.preload = 'metadata';
    video.src = source;
    video.onloadedmetadata = () =>
      finish(Number.isFinite(video.duration) ? video.duration * 1000 : 4000);
    video.onerror = () => finish(4000);
  });
}

interface ImportedMedia {
  trackId: string;
  clip: VideoTimelineTrack['clips'][number];
}

const INITIAL_TRACKS: readonly VideoTimelineTrack[] = [
  {
    id: 'primary',
    label: 'Video',
    clips: [
      {
        id: 'primary-01',
        start: 0,
        duration: 4300,
        label: 'Arrival',
        meta: 'A001',
        mediaType: 'video',
      },
      {
        id: 'primary-02',
        start: 5000,
        duration: 3600,
        label: 'Studio',
        meta: 'A004',
        mediaType: 'video',
      },
      {
        id: 'primary-03',
        start: 9400,
        duration: 4700,
        label: 'Sign-off',
        meta: 'A007',
        mediaType: 'video',
      },
    ],
  },
  {
    id: 'cutaways',
    label: 'Stills',
    clips: [
      {
        id: 'cutaway-01',
        start: 1400,
        duration: 3100,
        label: 'Hands',
        meta: 'JPG',
        mediaType: 'image',
      },
      {
        id: 'cutaway-02',
        start: 7000,
        duration: 4400,
        label: 'Monitor',
        meta: 'PNG',
        mediaType: 'image',
      },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    clips: [
      {
        id: 'audio-01',
        start: 0,
        duration: 9800,
        sourceDuration: 10000,
        label: 'Interview',
        meta: 'WAV',
        mediaType: 'audio',
        previewSrc: 'audio/demo-interview.wav',
      },
      {
        id: 'audio-02',
        start: 10400,
        duration: 3700,
        sourceOffset: 4400,
        sourceDuration: 12000,
        label: 'Music bed',
        meta: 'WAV',
        mediaType: 'audio',
        previewSrc: 'audio/demo-music.wav',
      },
    ],
  },
  {
    id: 'graphics',
    label: 'Graphics',
    clips: [
      {
        id: 'title-01',
        start: 800,
        duration: 2800,
        label: 'Opening title',
        meta: 'TYPE',
        mediaType: 'title',
      },
      {
        id: 'adjustment-01',
        start: 4700,
        duration: 3800,
        label: 'Colour grade',
        meta: 'ADJ',
        mediaType: 'adjustment',
      },
      {
        id: 'file-01',
        start: 10300,
        duration: 3500,
        label: 'End card',
        meta: 'SVG',
        mediaType: 'file',
      },
    ],
  },
];

function getInitialTracks() {
  return INITIAL_TRACKS.map((track) => ({
    ...track,
    clips: track.clips.map((clip) => ({ ...clip })),
  }));
}

function formatTime(time: number) {
  const totalSeconds = Math.max(0, Math.round(time / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function findClip(tracks: readonly VideoTimelineTrack[], id: string | null) {
  return tracks.flatMap((track) => track.clips).find((clip) => clip.id === id) ?? null;
}

function describeEdit(event: VideoTimelineEditEvent) {
  switch (event.action) {
    case 'trim-start':
      return 'In point trimmed';
    case 'trim-end':
      return 'Out point trimmed';
    case 'split':
      return 'Clip split';
    case 'duplicate':
      return 'Clip duplicated';
    case 'delete':
      return 'Clip deleted';
    case 'rename':
      return 'Clip renamed';
    default:
      return event.previousTrackId ? 'Clip moved to another lane' : 'Clip moved';
  }
}

export function VideoTimelinePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importedUrlsRef = useRef<string[]>([]);
  const importedIdRef = useRef(0);
  const [tracks, setTracks] = useState<VideoTimelineTrack[]>(getInitialTracks);
  const [playhead, setPlayhead] = useState(9000);
  const [activeClipId, setActiveClipId] = useState<string | null>('cutaway-02');
  const [snapToSeconds, setSnapToSeconds] = useState(true);
  const [density, setDensity] = useState<VideoTimelineDensity>('regular');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastEdit, setLastEdit] = useState('Ready to edit');
  const activeClip = findClip(tracks, activeClipId);
  const editPoints = useMemo(
    () =>
      Array.from(
        new Set(
          tracks.flatMap((track) =>
            track.clips.flatMap((clip) => [clip.start, clip.start + clip.duration])
          )
        )
      ).sort((a, b) => a - b),
    [tracks]
  );

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setPlayhead((current) => {
        const next = current + 100;
        if (next >= DURATION) {
          setIsPlaying(false);
          return DURATION;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  useEffect(
    () => () => {
      importedUrlsRef.current.forEach((source) => URL.revokeObjectURL(source));
    },
    []
  );

  const importMedia = async (files: readonly File[]) => {
    if (files.length === 0) return;
    setIsImporting(true);
    const imported: ImportedMedia[] = [];

    for (const file of files) {
      const mediaType = fileMediaType(file);
      const usesSource = mediaType === 'video' || mediaType === 'image' || mediaType === 'audio';
      const previewSrc = usesSource ? URL.createObjectURL(file) : undefined;
      if (previewSrc) importedUrlsRef.current.push(previewSrc);

      let sourceDuration = mediaType === 'image' || mediaType === 'file' ? 4000 : 5000;
      try {
        if (mediaType === 'audio') {
          // The timeline decodes previewSrc itself into a hi-res peak store —
          // passing a low-res waveform here would override it.
          sourceDuration = await readAudioDuration(file);
        } else if (mediaType === 'video' && previewSrc) {
          sourceDuration = await readVideoDuration(previewSrc);
        }
      } catch {
        // Keep the clip usable when a browser cannot decode a particular codec.
      }

      importedIdRef.current += 1;
      imported.push({
        trackId: mediaTrackId(mediaType),
        clip: {
          id: `local-media-${importedIdRef.current}`,
          start: 0,
          duration: Math.min(Math.max(1000, sourceDuration), mediaType === 'audio' ? 8000 : 6000),
          sourceDuration,
          label: fileLabel(file),
          meta: fileExtension(file),
          mediaType,
          previewSrc,
        },
      });
    }

    setTracks((currentTracks) => {
      const trackOffsets = new Map<string, number>();
      return currentTracks.map((track) => {
        const additions = imported
          .filter((item) => item.trackId === track.id)
          .map((item) => {
            const offset = trackOffsets.get(track.id) ?? 0;
            trackOffsets.set(track.id, offset + 500);
            const start = Math.min(playhead + offset, DURATION - 1000);
            return {
              ...item.clip,
              start,
              duration: Math.min(item.clip.duration, DURATION - start),
            };
          });
        return additions.length > 0 ? { ...track, clips: [...track.clips, ...additions] } : track;
      });
    });

    const lastImported = imported.at(-1)?.clip;
    if (lastImported) setActiveClipId(lastImported.id);
    setLastEdit(`${imported.length} local file${imported.length === 1 ? '' : 's'} added`);
    setIsImporting(false);
  };

  const seekEditPoint = (direction: -1 | 1) => {
    const candidates =
      direction < 0
        ? editPoints.filter((point) => point < playhead - 1).reverse()
        : editPoints.filter((point) => point > playhead + 1);
    setPlayhead(candidates[0] ?? (direction < 0 ? 0 : DURATION));
  };

  const handleEdit = (event: VideoTimelineEditEvent) => {
    setLastEdit(describeEdit(event));
  };

  const resetTimeline = () => {
    importedUrlsRef.current.forEach((source) => URL.revokeObjectURL(source));
    importedUrlsRef.current = [];
    setTracks(getInitialTracks());
    setPlayhead(9000);
    setActiveClipId('cutaway-02');
    setSnapToSeconds(true);
    setDensity('regular');
    setIsPlaying(false);
    setIsImporting(false);
    setLastEdit('Ready to edit');
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Video timeline"
        lede="A compact mixed-media timeline with real image and video previews, full-width channel-accurate audio waveforms, direct renaming, and one shared editing model."
      />

      <Section title="Editorial timeline">
        <p className="section-intro">
          Drop local media into the live example: images and videos render their real preview, while
          audio is decoded into per-channel peaks taken from its PCM signal. The waveform uses the
          complete clip width and stays aligned through trims and splits. Files remain in this
          browser session. Text, adjustment, and general assets use a quieter icon-and-label
          treatment.
        </p>
        <div className="demo demo--video-timeline">
          <div className="video-timeline-demo">
            <div className="video-timeline-demo__header">
              <div>
                <span className="fk-tag">Sequence</span>
                <strong>Opening cut</strong>
              </div>
              <div className="video-timeline-demo__actions">
                <div
                  className="video-timeline-demo__transport"
                  role="group"
                  aria-label="Playback controls"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<TrackPreviousIcon />}
                    aria-label="Previous edit point"
                    title="Previous edit point"
                    onClick={() => seekEditPoint(-1)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={isPlaying ? <PauseIcon /> : <PlayIcon />}
                    aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
                    title={isPlaying ? 'Pause' : 'Play'}
                    onClick={() => {
                      if (!isPlaying && playhead >= DURATION) setPlayhead(0);
                      setIsPlaying((current) => !current);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<TrackNextIcon />}
                    aria-label="Next edit point"
                    title="Next edit point"
                    onClick={() => seekEditPoint(1)}
                  />
                </div>
                <output>
                  {formatTime(playhead)} / {formatTime(DURATION)}
                </output>
              </div>
            </div>

            <DropZone
              className="video-timeline-demo__drop"
              size="sm"
              busy={isImporting}
              label="Drop video, image, audio, or project files"
              description="Real previews and waveforms are generated locally"
              activeLabel="Release to add media at the playhead"
              actionLabel="Choose files"
              onDrop={(transfer) => void importMedia(Array.from(transfer.files))}
              onAction={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="video/*,image/*,audio/*,.svg,.pdf,.psd,.ai"
              onChange={(event) => {
                void importMedia(Array.from(event.currentTarget.files ?? []));
                event.currentTarget.value = '';
              }}
            />

            <VideoTimeline
              value={tracks}
              onValueChange={setTracks}
              onEdit={handleEdit}
              activeClipId={activeClipId}
              onActiveClipIdChange={setActiveClipId}
              playhead={playhead}
              onPlayheadChange={setPlayhead}
              duration={DURATION}
              snap={snapToSeconds ? 1000 : undefined}
              density={density}
              label="Opening cut video timeline"
            />

            <div className="video-timeline-demo__footer">
              <output>
                <span className="fk-tag">Selected</span>
                <strong>{activeClip?.label ?? 'No clip selected'}</strong>
                {activeClip && (
                  <small>
                    {formatTime(activeClip.start)}–
                    {formatTime(activeClip.start + activeClip.duration)}
                  </small>
                )}
                <em>{lastEdit}</em>
              </output>
              <div>
                <SegmentedSwitch
                  size="sm"
                  aria-label="Video timeline density"
                  options={DENSITY_OPTIONS}
                  value={density}
                  onValueChange={(nextDensity) => setDensity(nextDensity as VideoTimelineDensity)}
                />
                <label className="video-timeline-demo__snap">
                  <span>Snap</span>
                  <Toggle
                    size="sm"
                    aria-label="Snap video timeline to one second increments"
                    checked={snapToSeconds}
                    onChange={(event) => setSnapToSeconds(event.target.checked)}
                  />
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset video timeline"
                  title="Reset video timeline"
                  onClick={resetTimeline}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag a clip horizontally to retime or vertically to change lanes, drag its accent edge
          handles to trim, or split at the shared playhead. Keyboard users can use <code>[</code> /{' '}
          <code>]</code> to trim, <code>S</code> to split, arrow keys to retime, and{' '}
          <code>Alt + ↑ / ↓</code> to move between unlocked lanes. Double-click any clip or press{' '}
          <code>F2</code> to rename it.
        </p>
      </Section>

      <Section title="Editing model">
        <div className="video-timeline-feature-grid">
          <div>
            <strong>Trim</strong>
            <p>Selected clips expose precise in and out handles while preserving source offset.</p>
          </div>
          <div>
            <strong>Cut</strong>
            <p>
              Split at the playhead creates two independently selectable clips in the same lane.
            </p>
          </div>
          <div>
            <strong>Arrange</strong>
            <p>Retime clips or transfer them between unlocked lanes with one continuous drag.</p>
          </div>
          <div>
            <strong>Control</strong>
            <p>Each lane includes working mute and lock states for safer editorial changes.</p>
          </div>
          <div>
            <strong>Represent</strong>
            <p>
              Visual media renders its real source, while audio keeps decoded signal amplitude and
              channel separation rather than drawing a decorative waveform.
            </p>
          </div>
          <div>
            <strong>Rename</strong>
            <p>Every clip can be renamed inline from the toolbar, by double click, or with F2.</p>
          </div>
        </div>
      </Section>

      <Section title="Compact timeline">
        <p className="section-intro">
          The same structure condenses for focused inspector or sidebar contexts without changing
          the direct editing model.
        </p>
        <div className="video-timeline-compact-example">
          <VideoTimeline
            density="compact"
            showTools={false}
            defaultValue={[
              {
                id: 'compact-video',
                label: 'Video',
                clips: [
                  {
                    id: 'compact-a',
                    start: 0,
                    duration: 2600,
                    label: 'Intro',
                    meta: 'A001',
                    mediaType: 'video',
                  },
                  {
                    id: 'compact-b',
                    start: 3200,
                    duration: 2900,
                    label: 'Detail',
                    meta: 'PNG',
                    mediaType: 'image',
                  },
                  {
                    id: 'compact-c',
                    start: 7000,
                    duration: 3000,
                    label: 'Close',
                    meta: 'A007',
                    mediaType: 'video',
                  },
                ],
              },
              {
                id: 'compact-audio',
                label: 'Audio',
                clips: [
                  {
                    id: 'compact-mix',
                    start: 0,
                    duration: 6100,
                    sourceDuration: 10000,
                    label: 'Dialogue',
                    meta: 'WAV',
                    mediaType: 'audio',
                    previewSrc: 'audio/demo-interview.wav',
                  },
                ],
              },
              {
                id: 'compact-overlay',
                label: 'Overlay',
                clips: [
                  {
                    id: 'compact-title',
                    start: 800,
                    duration: 2500,
                    label: 'Title',
                    meta: 'TYPE',
                    mediaType: 'title',
                  },
                ],
              },
            ]}
            defaultActiveClipId="compact-title"
            defaultPlayhead={3200}
            duration={10000}
            snap={1000}
            label="Compact video timeline"
          />
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { VideoTimeline, type VideoTimelineTrack } from '@presentstandards/framekit-ui';

<VideoTimeline
  value={tracks}
  onValueChange={setTracks}
  onEdit={(event) => saveEdit(event)}
  activeClipId={activeClipId}
  onActiveClipIdChange={setActiveClipId}
  playhead={playhead}
  onPlayheadChange={setPlayhead}
  duration={16000}
  snap={1000}
  minClipDuration={500}
  label="Opening cut video timeline"
/>;

// Drag selected clip edges to trim. The component updates sourceOffset
// when the in point moves, and can split, duplicate, delete, or change lanes.
// previewSrc renders native video/image previews; for audio it decodes the
// file into a hi-res min/max/RMS peak store and paints true per-pixel
// waveforms (Premiere-style pale peaks + brighter RMS body) per channel.
// To supply peaks yourself (e.g. precomputed server-side), pass
// waveform / createAudioPeakStore(decodedAudioBuffer) instead.
// sourceDuration keeps waveforms aligned after trims and splits.
// Double-click a clip or press F2 to rename it.`}</code>
        </pre>
      </Section>
    </>
  );
}
