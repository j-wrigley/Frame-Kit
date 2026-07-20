import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  CopyIcon,
  LockClosedIcon,
  LockOpen1Icon,
  Pencil1Icon,
  ScissorsIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
  TrashIcon,
} from '../../icons/icons';
import { createAudioPeakStore, type AudioPeakChannel, type AudioPeakStore } from './audio-waveform';

export type VideoTimelineMediaType = 'video' | 'audio' | 'image' | 'title' | 'adjustment' | 'file';
export type VideoTimelineWaveform = readonly number[] | readonly (readonly number[])[];

export interface VideoTimelineClip {
  /** Application-owned stable identifier. */
  id: string;
  /** Start position on the timeline, constrained to 0 through `duration`. */
  start: number;
  /** Visible clip length, constrained to the remaining timeline duration. */
  duration: number;
  /** Offset into the source media. Updated when the clip start is trimmed. @default 0 */
  sourceOffset?: number;
  /** Full source duration used to crop waveform and video previews after edits. */
  sourceDuration?: number;
  /** Human-readable name announced for the clip. */
  label: string;
  /** Optional supporting text, such as a camera, scene, or source name. */
  meta?: string;
  /** Built-in media preview treatment. @default 'video' */
  mediaType?: VideoTimelineMediaType;
  /** Media source used for native image/video previews and automatic audio waveform decoding. */
  previewSrc?: string;
  /** Real mono or per-channel audio peak amplitudes from 0–1. Takes precedence over decoding `previewSrc`. */
  waveform?: VideoTimelineWaveform;
  /** Optional application-provided preview content. Overrides the built-in media treatment. */
  thumbnail?: ReactNode;
}

export interface VideoTimelineTrack {
  /** Application-owned stable identifier. */
  id: string;
  /** Short visible name for the editorial lane. */
  label: string;
  /** Media clips in this lane. Their positions remain application-owned. */
  clips: readonly VideoTimelineClip[];
  /** Prevents clip movement, trimming, splitting, duplication, and deletion. */
  locked?: boolean;
  /** Visually marks the lane as muted. Applications can connect this value to playback. */
  muted?: boolean;
}

export type VideoTimelineDensity = 'regular' | 'compact';
export type VideoTimelineEditAction =
  'move' | 'trim-start' | 'trim-end' | 'split' | 'duplicate' | 'delete' | 'rename';

export interface VideoTimelineEditEvent {
  action: VideoTimelineEditAction;
  clipId: string;
  /** Destination lane for move events, otherwise the lane where the edit occurred. */
  trackId: string;
  /** Original lane when a move transfers the clip to another track. */
  previousTrackId?: string;
  /** Present when an edit creates a second clip. */
  createdClipId?: string;
  /** Updated label for rename events. */
  label?: string;
}

export interface VideoTimelineProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled editorial tracks. Clip and track ids must be stable and unique. */
  value?: readonly VideoTimelineTrack[];
  /** Initial editorial tracks when uncontrolled. */
  defaultValue?: readonly VideoTimelineTrack[];
  /** Called after clips or track controls are edited. */
  onValueChange?: (tracks: VideoTimelineTrack[]) => void;
  /** Called after a clip edit completes or is invoked from the tool strip. */
  onEdit?: (event: VideoTimelineEditEvent) => void;
  /** Controlled selected clip id. */
  activeClipId?: string | null;
  /** Initial selected clip id when uncontrolled. Defaults to the first clip. */
  defaultActiveClipId?: string | null;
  /** Called when a clip becomes selected. */
  onActiveClipIdChange?: (id: string | null) => void;
  /** Controlled timeline playhead time. */
  playhead?: number;
  /** Initial playhead time when uncontrolled. @default 0 */
  defaultPlayhead?: number;
  /** Called after scrubbing the timeline. */
  onPlayheadChange?: (time: number) => void;
  /** Total timeline duration. @default 16000 */
  duration?: number;
  /** Optional snapping increment for clip movement, trimming, and scrubbing. */
  snap?: number;
  /** Smallest duration retained by trimming and splitting. @default 500 */
  minClipDuration?: number;
  /** Overall lane density. `compact` is suitable for a side panel preview. @default 'regular' */
  density?: VideoTimelineDensity;
  /** Arrow-key increment when `snap` is off. Hold Shift for five increments. @default 250 */
  step?: number;
  /** Shows rename, split, duplicate, and delete actions above the ruler. @default true */
  showTools?: boolean;
  /** Enables clip renaming from the tool strip, double click, or F2. @default true */
  renamable?: boolean;
  /** Enables scrubbing and timeline editing. @default true */
  editable?: boolean;
  /** Disables direct interaction and mutes the timeline. @default false */
  disabled?: boolean;
  /** Accessible timeline name. @default 'Video timeline' */
  label?: string;
}

const DEFAULT_TRACKS: readonly VideoTimelineTrack[] = [
  {
    id: 'primary',
    label: 'Primary',
    clips: [
      { id: 'primary-opening', start: 0, duration: 4400, label: 'Opening', meta: 'A001' },
      { id: 'primary-detail', start: 5000, duration: 3800, label: 'Detail', meta: 'A004' },
      { id: 'primary-close', start: 9400, duration: 4600, label: 'Closing', meta: 'A007' },
    ],
  },
  {
    id: 'cutaway',
    label: 'Stills',
    clips: [
      {
        id: 'cutaway-hands',
        start: 1600,
        duration: 3000,
        label: 'Hands',
        meta: 'JPG',
        mediaType: 'image',
      },
      {
        id: 'cutaway-screen',
        start: 7200,
        duration: 4200,
        label: 'Screen',
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
        id: 'audio-dialogue',
        start: 0,
        duration: 9800,
        label: 'Dialogue',
        meta: 'WAV',
        mediaType: 'audio',
      },
      {
        id: 'audio-music',
        start: 10400,
        duration: 3600,
        label: 'Music',
        meta: 'MP3',
        mediaType: 'audio',
      },
    ],
  },
];

type TrimEdge = 'start' | 'end';

interface MoveDrag {
  clipId: string;
  originTrackId: string;
  targetTrackId: string;
  offset: number;
  moved: boolean;
}

interface TrimDrag {
  clipId: string;
  trackId: string;
  edge: TrimEdge;
  originalStart: number;
  originalDuration: number;
  originalSourceOffset: number;
  changed: boolean;
}

function clamp(value: number, maximum: number, minimum = 0) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normaliseClip(clip: VideoTimelineClip, duration: number): VideoTimelineClip {
  const clipDuration = Math.min(duration, Math.max(1, clip.duration));
  return {
    ...clip,
    start: round(clamp(clip.start, Math.max(0, duration - clipDuration))),
    duration: round(clipDuration),
    sourceOffset:
      clip.sourceOffset === undefined ? undefined : round(Math.max(0, clip.sourceOffset)),
  };
}

function normaliseTracks(tracks: readonly VideoTimelineTrack[], duration: number) {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) => normaliseClip(clip, duration)),
  }));
}

function findFirstClipId(tracks: readonly VideoTimelineTrack[]) {
  return tracks.flatMap((track) => track.clips)[0]?.id ?? null;
}

function findClipContext(tracks: readonly VideoTimelineTrack[], clipId: string | null) {
  for (const track of tracks) {
    const clip = track.clips.find((item) => item.id === clipId);
    if (clip) return { clip, track };
  }
  return null;
}

function formatTime(time: number) {
  const totalSeconds = Math.max(0, Math.round(time / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const MEDIA_TYPE_LABELS: Record<VideoTimelineMediaType, string> = {
  video: 'video',
  audio: 'audio',
  image: 'image',
  title: 'title',
  adjustment: 'adjustment',
  file: 'file',
};

/** Decoded peak stores, LRU-capped — object-URL sources come and go, so old
 *  entries (including revoked blob URLs) age out instead of pinning memory. */
const WAVEFORM_CACHE_LIMIT = 24;
const waveformCache = new Map<string, Promise<AudioPeakStore>>();

function cacheWaveform(source: string, pending: Promise<AudioPeakStore>) {
  waveformCache.delete(source);
  waveformCache.set(source, pending);
  while (waveformCache.size > WAVEFORM_CACHE_LIMIT) {
    const oldest = waveformCache.keys().next().value;
    if (oldest === undefined) break;
    waveformCache.delete(oldest);
  }
}

async function decodeAudioSource(source: string): Promise<AudioPeakStore> {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Unable to load audio source (${response.status})`);
  const context = new AudioContext();
  try {
    const audioBuffer = await context.decodeAudioData(await response.arrayBuffer());
    return createAudioPeakStore(audioBuffer);
  } finally {
    void context.close();
  }
}

function getWaveformChannels(waveform?: VideoTimelineWaveform) {
  if (!waveform || waveform.length === 0) return [];
  return Array.isArray(waveform[0])
    ? (waveform as readonly (readonly number[])[])
    : [waveform as readonly number[]];
}

/** Hand-authored 0–1 peaks become a symmetric store; the RMS core is derived
 *  (≈70% of the peak) purely for the two-layer look — decoded audio always
 *  carries true per-bucket RMS instead. */
function storeFromPeaks(waveform: VideoTimelineWaveform): AudioPeakStore {
  const channels = getWaveformChannels(waveform).map((peaks) => {
    const min = new Float32Array(peaks.length);
    const max = new Float32Array(peaks.length);
    const rms = new Float32Array(peaks.length);
    peaks.forEach((peak, index) => {
      const amplitude = Number.isFinite(peak) ? clamp(peak, 1) : 0;
      min[index] = -amplitude;
      max[index] = amplitude;
      rms[index] = amplitude * 0.7;
    });
    return { min, max, rms };
  });
  return { channels, bucketCount: channels[0]?.min.length ?? 0, duration: 0 };
}

/** Paints one channel the way an NLE draws it: per device-pixel columns of
 *  true min/max peaks with a brighter RMS body over a faint zero line.
 *  The window is expressed as 0–1 fractions of THIS channel's own extent so
 *  ragged multichannel data maps correctly, and it may extend past 1 — a clip
 *  trimmed longer than its source paints the overhang as silence (zero line
 *  only), exactly as Premiere shows media running out. */
function paintWaveformChannel(
  canvas: HTMLCanvasElement,
  channel: AudioPeakChannel,
  windowStart: number,
  windowEnd: number
) {
  const context = canvas.getContext('2d');
  if (!context) return;
  const ratio = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(2, Math.round(rect.height * ratio));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  context.clearRect(0, 0, width, height);
  const color = getComputedStyle(canvas).color;
  const mid = height / 2;
  const amplitude = mid * 0.96;
  const bucketCount = channel.min.length;
  const bucketStart = windowStart * bucketCount;
  const span = Math.max(1e-6, (windowEnd - windowStart) * bucketCount);
  const minBar = ratio * 0.75;

  // Zero line — the faint rule silence sits on, like Premiere's center rule.
  context.fillStyle = color;
  context.globalAlpha = 0.22;
  context.fillRect(0, mid - ratio / 2, width, ratio);

  const peakTop = new Float32Array(width);
  const peakBottom = new Float32Array(width);
  const rmsHalf = new Float32Array(width);
  const empty = new Uint8Array(width);

  for (let x = 0; x < width; x += 1) {
    const from = bucketStart + (x / width) * span;
    const to = bucketStart + ((x + 1) / width) * span;
    const first = Math.max(0, Math.floor(from));
    const last = Math.min(bucketCount - 1, Math.max(first, Math.ceil(to) - 1));
    // Columns wholly outside the source (trim overhang) stay empty.
    if (first >= bucketCount || last < 0 || from >= bucketCount) {
      empty[x] = 1;
      continue;
    }
    let columnMin = Infinity;
    let columnMax = -Infinity;
    let energy = 0;
    for (let bucket = first; bucket <= last; bucket += 1) {
      if (channel.min[bucket] < columnMin) columnMin = channel.min[bucket];
      if (channel.max[bucket] > columnMax) columnMax = channel.max[bucket];
      energy += channel.rms[bucket] * channel.rms[bucket];
    }
    if (columnMin === Infinity) {
      empty[x] = 1;
      continue;
    }
    peakTop[x] = columnMax;
    peakBottom[x] = columnMin;
    rmsHalf[x] = Math.sqrt(energy / (last - first + 1));
  }

  // Pale full min/max peaks, then the brighter RMS body — the two-layer
  // rendering that makes real program material read as audio, not a blob.
  // Minimum bar heights are centred on the span so silence hugs the zero line.
  context.globalAlpha = 0.5;
  for (let x = 0; x < width; x += 1) {
    if (empty[x]) continue;
    const top = mid - peakTop[x] * amplitude;
    const bottom = mid - peakBottom[x] * amplitude;
    const bar = Math.max(minBar, bottom - top);
    context.fillRect(x, top - (bar - (bottom - top)) / 2, 1, bar);
  }
  context.globalAlpha = 0.95;
  for (let x = 0; x < width; x += 1) {
    if (empty[x]) continue;
    const half = rmsHalf[x] * amplitude;
    if (half <= 0) continue;
    const bar = Math.max(minBar, half * 2);
    context.fillRect(x, mid - bar / 2, 1, bar);
  }
  context.globalAlpha = 1;
}

function AudioWaveformPreview({
  source,
  waveform,
  sourceOffset = 0,
  sourceDuration,
  duration,
}: {
  source?: string;
  waveform?: VideoTimelineWaveform;
  sourceOffset?: number;
  sourceDuration?: number;
  duration: number;
}) {
  const [decodedStore, setDecodedStore] = useState<AudioPeakStore | null>(null);
  const canvasesRef = useRef<(HTMLCanvasElement | null)[]>([]);
  const hasProvidedWaveform = !!waveform && waveform.length > 0;

  useEffect(() => {
    // Reset immediately — while a new source decodes, the empty state shows
    // rather than the previous source's waveform.
    setDecodedStore(null);
    if (hasProvidedWaveform || !source) return;
    let cancelled = false;
    let pending = waveformCache.get(source);
    if (!pending) {
      pending = decodeAudioSource(source);
    }
    cacheWaveform(source, pending);
    void pending
      .then((store) => {
        if (!cancelled) setDecodedStore(store);
      })
      .catch(() => {
        waveformCache.delete(source);
        if (!cancelled) setDecodedStore(null);
      });
    return () => {
      cancelled = true;
    };
  }, [source, hasProvidedWaveform]);

  const store = useMemo(
    () => (hasProvidedWaveform ? storeFromPeaks(waveform!) : decodedStore),
    [hasProvidedWaveform, waveform, decodedStore]
  );

  // Trim window as unclamped 0–1 fractions of the source. The painter maps
  // them onto each channel's own extent; past-the-end reads as silence.
  // Without a known source duration a hand-authored waveform maps 1:1 onto
  // the clip, matching the old behavior.
  const totalDuration =
    sourceDuration ?? (store && store.duration > 0 ? store.duration : undefined);
  const windowStart = totalDuration ? Math.max(0, sourceOffset / totalDuration) : 0;
  const windowEnd = totalDuration
    ? Math.max(windowStart + 1e-6, (sourceOffset + duration) / totalDuration)
    : 1;

  const paint = useCallback(() => {
    if (!store) return;
    store.channels.forEach((channel, index) => {
      const canvas = canvasesRef.current[index];
      if (canvas) paintWaveformChannel(canvas, channel, windowStart, windowEnd);
    });
  }, [store, windowStart, windowEnd]);
  const paintRef = useRef(paint);
  paintRef.current = paint;

  // Data changes repaint directly; observers live in their own effect keyed
  // only by channel count so a trim drag doesn't rebuild them every frame.
  useEffect(paint, [paint]);

  const channelCount = store?.channels.length ?? 0;
  useEffect(() => {
    const repaint = () => paintRef.current();
    const canvases = canvasesRef.current
      .slice(0, channelCount)
      .filter(Boolean) as HTMLCanvasElement[];
    if (canvases.length === 0) return;
    const observer = new ResizeObserver(repaint);
    canvases.forEach((canvas) => observer.observe(canvas));
    // The paint reads currentColor, so a theme flip must repaint too.
    const themeObserver = new MutationObserver(repaint);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    // devicePixelRatio changes (monitor moves, zoom) resize no element but
    // invalidate the backing store — watch via a self-renewing media query.
    let media: MediaQueryList | null = null;
    const armDprListener = () => {
      media?.removeEventListener('change', onDprChange);
      media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      media.addEventListener('change', onDprChange);
    };
    const onDprChange = () => {
      repaint();
      armDprListener();
    };
    armDprListener();
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      media?.removeEventListener('change', onDprChange);
    };
  }, [channelCount]);

  return (
    <span
      className="fk-video-timeline__media-preview fk-video-timeline__media-preview--audio"
      data-empty={channelCount === 0 || undefined}
    >
      {Array.from({ length: channelCount }, (_, channelIndex) => (
        <span className="fk-video-timeline__waveform-channel" key={channelIndex}>
          <canvas
            ref={(node) => {
              canvasesRef.current[channelIndex] = node;
            }}
            aria-hidden="true"
          />
        </span>
      ))}
    </span>
  );
}

function VideoMediaPreview({
  source,
  sourceOffset = 0,
}: {
  source: string;
  sourceOffset?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const seekToOffset = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(Math.max(0, sourceOffset / 1000), video.duration);
  }, [sourceOffset]);

  useEffect(seekToOffset, [seekToOffset]);

  return (
    <video
      ref={videoRef}
      src={source}
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={seekToOffset}
    />
  );
}

function DefaultMediaPreview({
  mediaType,
  previewSrc,
  waveform,
  sourceOffset,
  sourceDuration,
  duration,
}: {
  mediaType: VideoTimelineMediaType;
  previewSrc?: string;
  waveform?: VideoTimelineWaveform;
  sourceOffset?: number;
  sourceDuration?: number;
  duration: number;
}) {
  if (mediaType === 'audio') {
    return (
      <AudioWaveformPreview
        source={previewSrc}
        waveform={waveform}
        sourceOffset={sourceOffset}
        sourceDuration={sourceDuration}
        duration={duration}
      />
    );
  }

  if (mediaType === 'image') {
    return previewSrc ? (
      <img src={previewSrc} alt="" draggable={false} />
    ) : (
      <span className="fk-video-timeline__media-preview fk-video-timeline__media-preview--empty" />
    );
  }

  if (mediaType === 'video') {
    return previewSrc ? (
      <VideoMediaPreview source={previewSrc} sourceOffset={sourceOffset} />
    ) : (
      <span className="fk-video-timeline__media-preview fk-video-timeline__media-preview--empty" />
    );
  }

  if (mediaType === 'title') {
    return (
      <span className="fk-video-timeline__media-preview fk-video-timeline__media-preview--title">
        T
      </span>
    );
  }

  if (mediaType === 'adjustment') {
    return (
      <span className="fk-video-timeline__media-preview fk-video-timeline__media-preview--adjustment">
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (mediaType === 'file') {
    return (
      <span className="fk-video-timeline__media-preview fk-video-timeline__media-preview--file">
        <i />
      </span>
    );
  }

  return (
    <span className="fk-video-timeline__media-preview fk-video-timeline__media-preview--empty" />
  );
}

/**
 * A multi-track editorial timeline for arranging and trimming clips against one
 * shared playhead. Playback and persistence remain application-owned.
 */
export const VideoTimeline = forwardRef<HTMLDivElement, VideoTimelineProps>(function VideoTimeline(
  {
    value,
    defaultValue = DEFAULT_TRACKS,
    onValueChange,
    onEdit,
    activeClipId: activeClipIdProp,
    defaultActiveClipId,
    onActiveClipIdChange,
    playhead: playheadProp,
    defaultPlayhead = 0,
    onPlayheadChange,
    duration: durationProp = 16000,
    snap,
    minClipDuration: minClipDurationProp = 500,
    density = 'regular',
    step = 250,
    showTools = true,
    renamable = true,
    editable = true,
    disabled = false,
    label = 'Video timeline',
    className,
    ...props
  },
  ref
) {
  const tracksRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const moveDragRef = useRef<MoveDrag | null>(null);
  const trimDragRef = useRef<TrimDrag | null>(null);
  const generatedIdRef = useRef(0);
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normaliseTracks(defaultValue, Math.max(1, durationProp))
  );
  const [uncontrolledActiveClipId, setUncontrolledActiveClipId] = useState<string | null>(
    () => defaultActiveClipId ?? findFirstClipId(defaultValue)
  );
  const [uncontrolledPlayhead, setUncontrolledPlayhead] = useState(defaultPlayhead);
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dropTargetTrackId, setDropTargetTrackId] = useState<string | null>(null);
  const [dragTranslationY, setDragTranslationY] = useState(0);
  const [trimming, setTrimming] = useState<{ clipId: string; edge: TrimEdge } | null>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [renamingClipId, setRenamingClipId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const duration = Math.max(1, durationProp);
  const minClipDuration = clamp(minClipDurationProp, duration, 1);
  const tracks = normaliseTracks(value ?? uncontrolledValue, duration);
  const clipIds = tracks.flatMap((track) => track.clips.map((clip) => clip.id));
  const requestedActiveClipId =
    activeClipIdProp === undefined ? uncontrolledActiveClipId : activeClipIdProp;
  const activeClipId =
    requestedActiveClipId === null
      ? null
      : clipIds.includes(requestedActiveClipId ?? '')
        ? requestedActiveClipId
        : (findFirstClipId(tracks) ?? null);
  const activeContext = findClipContext(tracks, activeClipId);
  const playhead = round(clamp(playheadProp ?? uncontrolledPlayhead, duration));
  const canEdit = editable && !disabled;
  const canEditActiveClip = Boolean(activeContext && canEdit && !activeContext.track.locked);
  const canRenameActiveClip = canEditActiveClip && renamable;
  const canSplitActiveClip = Boolean(
    canEditActiveClip &&
    activeContext &&
    playhead >= activeContext.clip.start + minClipDuration &&
    playhead <= activeContext.clip.start + activeContext.clip.duration - minClipDuration
  );
  const tickCount = density === 'compact' ? 5 : 9;
  const ticks = Array.from(
    { length: tickCount },
    (_, index) => (duration / (tickCount - 1)) * index
  );
  const classes = [
    'fk-video-timeline',
    `fk-video-timeline--${density}`,
    !canEdit && 'fk-video-timeline--readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const normaliseTime = useCallback(
    (time: number) => {
      const next = clamp(time, duration);
      const snapStep = Math.max(0, snap ?? 0);
      return round(snapStep > 0 ? clamp(Math.round(next / snapStep) * snapStep, duration) : next);
    },
    [duration, snap]
  );

  const setTracks = useCallback(
    (nextTracks: readonly VideoTimelineTrack[]) => {
      const next = normaliseTracks(nextTracks, duration);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [duration, onValueChange, value]
  );

  const selectClip = useCallback(
    (id: string | null) => {
      if (activeClipIdProp === undefined) setUncontrolledActiveClipId(id);
      onActiveClipIdChange?.(id);
    },
    [activeClipIdProp, onActiveClipIdChange]
  );

  const setPlayhead = useCallback(
    (nextTime: number) => {
      const next = normaliseTime(nextTime);
      if (playheadProp === undefined) setUncontrolledPlayhead(next);
      onPlayheadChange?.(next);
    },
    [normaliseTime, onPlayheadChange, playheadProp]
  );

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const bounds = tracksRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0) return null;
      return ((clientX - bounds.left) / bounds.width) * duration;
    },
    [duration]
  );

  const replaceClip = useCallback(
    (clipId: string, updater: (clip: VideoTimelineClip) => VideoTimelineClip) => {
      setTracks(
        tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) => (clip.id === clipId ? updater(clip) : clip)),
        }))
      );
    },
    [setTracks, tracks]
  );

  const beginClipRename = useCallback(
    (clipId: string) => {
      const context = findClipContext(tracks, clipId);
      if (!renamable || !canEdit || !context || context.track.locked) return;
      selectClip(clipId);
      setRenameValue(context.clip.label);
      setRenamingClipId(clipId);
    },
    [canEdit, renamable, selectClip, tracks]
  );

  const commitClipRename = useCallback(() => {
    if (!renamingClipId) return;
    const context = findClipContext(tracks, renamingClipId);
    const nextLabel = renameValue.trim();
    if (context && nextLabel && nextLabel !== context.clip.label) {
      replaceClip(renamingClipId, (clip) => ({ ...clip, label: nextLabel }));
      onEdit?.({
        action: 'rename',
        clipId: renamingClipId,
        trackId: context.track.id,
        label: nextLabel,
      });
    }
    setRenamingClipId(null);
    setRenameValue('');
  }, [onEdit, renameValue, renamingClipId, replaceClip, tracks]);

  const cancelClipRename = useCallback(() => {
    setRenamingClipId(null);
    setRenameValue('');
  }, []);

  const updateClipStart = useCallback(
    (clipId: string, start: number) => {
      replaceClip(clipId, (clip) => ({
        ...clip,
        start: normaliseTime(clamp(start, Math.max(0, duration - clip.duration))),
      }));
    },
    [duration, normaliseTime, replaceClip]
  );

  const moveClipToTrack = useCallback(
    (clipId: string, targetTrackId: string) => {
      const context = findClipContext(tracks, clipId);
      const targetTrack = tracks.find((track) => track.id === targetTrackId);
      if (!context || !targetTrack || targetTrack.locked || context.track.id === targetTrackId) {
        return false;
      }

      setTracks(
        tracks.map((track) => {
          if (track.id === context.track.id) {
            return { ...track, clips: track.clips.filter((clip) => clip.id !== clipId) };
          }
          if (track.id === targetTrackId) {
            return { ...track, clips: [...track.clips, context.clip] };
          }
          return track;
        })
      );
      return true;
    },
    [setTracks, tracks]
  );

  const findDropTrackId = useCallback(
    (clientY: number) => {
      for (const track of tracks) {
        const lane = laneRefs.current.get(track.id);
        if (!lane) continue;
        const bounds = lane.getBoundingClientRect();
        if (clientY >= bounds.top && clientY <= bounds.bottom) {
          return track.locked ? null : track.id;
        }
      }
      return null;
    },
    [tracks]
  );

  const trimClip = useCallback(
    (clipId: string, edge: TrimEdge, boundary: number, original?: TrimDrag) => {
      replaceClip(clipId, (clip) => {
        const basisStart = original?.originalStart ?? clip.start;
        const basisDuration = original?.originalDuration ?? clip.duration;
        const basisOffset = original?.originalSourceOffset ?? clip.sourceOffset ?? 0;
        const originalEnd = basisStart + basisDuration;

        if (edge === 'start') {
          const nextStart = clamp(normaliseTime(boundary), originalEnd - minClipDuration, 0);
          return {
            ...clip,
            start: nextStart,
            duration: round(originalEnd - nextStart),
            sourceOffset: round(Math.max(0, basisOffset + nextStart - basisStart)),
          };
        }

        const nextEnd = clamp(normaliseTime(boundary), duration, basisStart + minClipDuration);
        return { ...clip, start: basisStart, duration: round(nextEnd - basisStart) };
      });
    },
    [duration, minClipDuration, normaliseTime, replaceClip]
  );

  const createClipId = useCallback((clipId: string, action: 'split' | 'copy') => {
    generatedIdRef.current += 1;
    return `${clipId}-${action}-${generatedIdRef.current}`;
  }, []);

  const splitClipAtPlayhead = useCallback(
    (context: NonNullable<typeof activeContext>) => {
      const { clip, track } = context;
      const canSplit =
        canEdit &&
        !track.locked &&
        playhead >= clip.start + minClipDuration &&
        playhead <= clip.start + clip.duration - minClipDuration;
      if (!canSplit) return;
      const createdClipId = createClipId(clip.id, 'split');
      const firstDuration = round(playhead - clip.start);
      const secondDuration = round(clip.duration - firstDuration);
      const secondClip: VideoTimelineClip = {
        ...clip,
        id: createdClipId,
        start: playhead,
        duration: secondDuration,
        sourceOffset: round((clip.sourceOffset ?? 0) + firstDuration),
      };
      setTracks(
        tracks.map((item) =>
          item.id === track.id
            ? {
                ...item,
                clips: item.clips.flatMap((itemClip) =>
                  itemClip.id === clip.id
                    ? [{ ...itemClip, duration: firstDuration }, secondClip]
                    : [itemClip]
                ),
              }
            : item
        )
      );
      selectClip(createdClipId);
      onEdit?.({ action: 'split', clipId: clip.id, createdClipId, trackId: track.id });
    },
    [canEdit, createClipId, minClipDuration, onEdit, playhead, selectClip, setTracks, tracks]
  );

  const splitActiveClip = useCallback(() => {
    if (activeContext) splitClipAtPlayhead(activeContext);
  }, [activeContext, splitClipAtPlayhead]);

  const duplicateClip = useCallback(
    (context: NonNullable<typeof activeContext>) => {
      const { clip, track } = context;
      if (!canEdit || track.locked) return;
      const createdClipId = createClipId(clip.id, 'copy');
      const afterStart = clip.start + clip.duration;
      const beforeStart = clip.start - clip.duration;
      const preferredStart =
        afterStart + clip.duration <= duration
          ? afterStart
          : beforeStart >= 0
            ? beforeStart
            : clamp(afterStart, Math.max(0, duration - clip.duration));
      const nextStart = normaliseTime(preferredStart);
      const duplicatedClip = { ...clip, id: createdClipId, start: nextStart };
      setTracks(
        tracks.map((item) =>
          item.id === track.id ? { ...item, clips: [...item.clips, duplicatedClip] } : item
        )
      );
      selectClip(createdClipId);
      onEdit?.({ action: 'duplicate', clipId: clip.id, createdClipId, trackId: track.id });
    },
    [canEdit, createClipId, duration, normaliseTime, onEdit, selectClip, setTracks, tracks]
  );

  const duplicateActiveClip = useCallback(() => {
    if (activeContext) duplicateClip(activeContext);
  }, [activeContext, duplicateClip]);

  const deleteClip = useCallback(
    (context: NonNullable<typeof activeContext>) => {
      const { clip, track } = context;
      if (!canEdit || track.locked) return;
      const flattenedIds = tracks.flatMap((item) => item.clips.map((itemClip) => itemClip.id));
      const deletedIndex = flattenedIds.indexOf(clip.id);
      const remainingIds = flattenedIds.filter((id) => id !== clip.id);
      const nextSelection = remainingIds[Math.min(deletedIndex, remainingIds.length - 1)] ?? null;
      setTracks(
        tracks.map((item) =>
          item.id === track.id
            ? { ...item, clips: item.clips.filter((itemClip) => itemClip.id !== clip.id) }
            : item
        )
      );
      selectClip(nextSelection);
      onEdit?.({ action: 'delete', clipId: clip.id, trackId: track.id });
    },
    [canEdit, onEdit, selectClip, setTracks, tracks]
  );

  const deleteActiveClip = useCallback(() => {
    if (activeContext) deleteClip(activeContext);
  }, [activeContext, deleteClip]);

  const toggleTrackState = useCallback(
    (trackId: string, state: 'locked' | 'muted') => {
      if (!canEdit) return;
      setTracks(
        tracks.map((track) => (track.id === trackId ? { ...track, [state]: !track[state] } : track))
      );
    },
    [canEdit, setTracks, tracks]
  );

  const handleLanePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canEdit || event.button !== 0) return;
    const nextTime = timeFromClientX(event.clientX);
    if (nextTime === null) return;
    event.preventDefault();
    selectClip(null);
    setPlayhead(nextTime);
  };

  const handleClipPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    clip: VideoTimelineClip,
    track: VideoTimelineTrack
  ) => {
    if (!canEdit || track.locked || event.button !== 0) {
      if (!disabled) selectClip(clip.id);
      return;
    }
    const pointerTime = timeFromClientX(event.clientX);
    if (pointerTime === null) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    moveDragRef.current = {
      clipId: clip.id,
      originTrackId: track.id,
      targetTrackId: track.id,
      offset: pointerTime - clip.start,
      moved: false,
    };
    setDraggingClipId(clip.id);
    setDropTargetTrackId(null);
    setDragTranslationY(0);
    selectClip(clip.id);
  };

  const handleClipPointerMove = (event: ReactPointerEvent<HTMLButtonElement>, clipId: string) => {
    const drag = moveDragRef.current;
    if (!canEdit || !drag || drag.clipId !== clipId) return;
    const pointerTime = timeFromClientX(event.clientX);
    if (pointerTime !== null) {
      drag.moved = true;
      updateClipStart(clipId, pointerTime - drag.offset);
    }

    const hoveredTrackId = findDropTrackId(event.clientY);
    const targetTrackId = hoveredTrackId ?? drag.originTrackId;
    drag.targetTrackId = targetTrackId;

    if (targetTrackId !== drag.originTrackId) {
      const originLane = laneRefs.current.get(drag.originTrackId);
      const targetLane = laneRefs.current.get(targetTrackId);
      if (originLane && targetLane) {
        setDragTranslationY(
          round(targetLane.getBoundingClientRect().top - originLane.getBoundingClientRect().top)
        );
        setDropTargetTrackId(targetTrackId);
      }
    } else {
      setDragTranslationY(0);
      setDropTargetTrackId(null);
    }
  };

  const stopClipDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = moveDragRef.current;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag) {
      const changedTrack = moveClipToTrack(drag.clipId, drag.targetTrackId);
      if (drag.moved || changedTrack) {
        onEdit?.({
          action: 'move',
          clipId: drag.clipId,
          trackId: changedTrack ? drag.targetTrackId : drag.originTrackId,
          previousTrackId: changedTrack ? drag.originTrackId : undefined,
        });
      }
    }
    moveDragRef.current = null;
    setDraggingClipId(null);
    setDropTargetTrackId(null);
    setDragTranslationY(0);
  };

  const handleTrimPointerDown = (
    event: ReactPointerEvent<HTMLSpanElement>,
    clip: VideoTimelineClip,
    trackId: string,
    edge: TrimEdge
  ) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    trimDragRef.current = {
      clipId: clip.id,
      trackId,
      edge,
      originalStart: clip.start,
      originalDuration: clip.duration,
      originalSourceOffset: clip.sourceOffset ?? 0,
      changed: false,
    };
    setTrimming({ clipId: clip.id, edge });
    selectClip(clip.id);
  };

  const handleTrimPointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = trimDragRef.current;
    if (!canEdit || !drag) return;
    const pointerTime = timeFromClientX(event.clientX);
    if (pointerTime !== null) {
      drag.changed = true;
      trimClip(drag.clipId, drag.edge, pointerTime, drag);
    }
  };

  const stopTrimming = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = trimDragRef.current;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag?.changed) {
      onEdit?.({
        action: drag.edge === 'start' ? 'trim-start' : 'trim-end',
        clipId: drag.clipId,
        trackId: drag.trackId,
      });
    }
    trimDragRef.current = null;
    setTrimming(null);
  };

  const handleTrimKeyDown = (
    event: ReactKeyboardEvent<HTMLSpanElement>,
    clip: VideoTimelineClip,
    trackId: string,
    edge: TrimEdge
  ) => {
    if (!canEdit) return;
    const multiplier = event.shiftKey ? 5 : 1;
    const increment =
      Math.max(0, snap ?? 0) > 0 ? (snap as number) * multiplier : step * multiplier;
    const currentBoundary = edge === 'start' ? clip.start : clip.start + clip.duration;
    let nextBoundary = currentBoundary;
    if (event.key === 'ArrowLeft') nextBoundary -= increment;
    else if (event.key === 'ArrowRight') nextBoundary += increment;
    else if (event.key === 'Home')
      nextBoundary = edge === 'start' ? 0 : clip.start + minClipDuration;
    else if (event.key === 'End') {
      nextBoundary = edge === 'start' ? clip.start + clip.duration - minClipDuration : duration;
    } else return;
    event.preventDefault();
    trimClip(clip.id, edge, nextBoundary);
    onEdit?.({ action: edge === 'start' ? 'trim-start' : 'trim-end', clipId: clip.id, trackId });
  };

  const handleClipKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    clip: VideoTimelineClip,
    track: VideoTimelineTrack
  ) => {
    if (!canEdit || track.locked) return;
    if (event.key === 'F2') {
      event.preventDefault();
      beginClipRename(clip.id);
      return;
    }
    const multiplier = event.shiftKey ? 5 : 1;
    const increment =
      Math.max(0, snap ?? 0) > 0 ? (snap as number) * multiplier : step * multiplier;
    let nextStart = clip.start;

    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const currentTrackIndex = tracks.findIndex((item) => item.id === track.id);
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      let targetTrack: VideoTimelineTrack | undefined;

      for (
        let index = currentTrackIndex + direction;
        index >= 0 && index < tracks.length;
        index += direction
      ) {
        if (!tracks[index].locked) {
          targetTrack = tracks[index];
          break;
        }
      }

      if (targetTrack && moveClipToTrack(clip.id, targetTrack.id)) {
        selectClip(clip.id);
        onEdit?.({
          action: 'move',
          clipId: clip.id,
          trackId: targetTrack.id,
          previousTrackId: track.id,
        });
      }
      return;
    }

    if (event.key === 'ArrowLeft') nextStart -= increment;
    else if (event.key === 'ArrowRight') nextStart += increment;
    else if (event.key === 'Home') nextStart = 0;
    else if (event.key === 'End') nextStart = duration - clip.duration;
    else if (event.key === '[' && playhead > clip.start && playhead < clip.start + clip.duration) {
      event.preventDefault();
      trimClip(clip.id, 'start', playhead);
      onEdit?.({ action: 'trim-start', clipId: clip.id, trackId: track.id });
      return;
    } else if (
      event.key === ']' &&
      playhead > clip.start &&
      playhead < clip.start + clip.duration
    ) {
      event.preventDefault();
      trimClip(clip.id, 'end', playhead);
      onEdit?.({ action: 'trim-end', clipId: clip.id, trackId: track.id });
      return;
    } else if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      selectClip(clip.id);
      splitClipAtPlayhead({ clip, track });
      return;
    } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      selectClip(clip.id);
      duplicateClip({ clip, track });
      return;
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      selectClip(clip.id);
      deleteClip({ clip, track });
      return;
    } else return;

    event.preventDefault();
    selectClip(clip.id);
    updateClipStart(clip.id, nextStart);
    onEdit?.({ action: 'move', clipId: clip.id, trackId: track.id });
  };

  const handlePlayheadPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canEdit || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingPlayhead(true);
    const nextTime = timeFromClientX(event.clientX);
    if (nextTime !== null) setPlayhead(nextTime);
  };

  const handlePlayheadPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canEdit || !isDraggingPlayhead) return;
    const nextTime = timeFromClientX(event.clientX);
    if (nextTime !== null) setPlayhead(nextTime);
  };

  const stopPlayheadDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingPlayhead(false);
  };

  const handlePlayheadKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    const multiplier = event.shiftKey ? 5 : 1;
    const increment =
      Math.max(0, snap ?? 0) > 0 ? (snap as number) * multiplier : step * multiplier;
    let nextTime = playhead;

    if (event.key === 'ArrowLeft') nextTime -= increment;
    else if (event.key === 'ArrowRight') nextTime += increment;
    else if (event.key === 'Home') nextTime = 0;
    else if (event.key === 'End') nextTime = duration;
    else return;

    event.preventDefault();
    setPlayhead(nextTime);
  };

  return (
    <div ref={ref} {...props} className={classes} data-disabled={disabled || undefined}>
      {showTools && (
        <div className="fk-video-timeline__tools" role="toolbar" aria-label="Clip editing tools">
          <span className="fk-video-timeline__selection" aria-live="polite">
            {activeContext ? (
              <>
                <strong>{activeContext.clip.label}</strong>
                <span>{formatTime(activeContext.clip.duration)}</span>
              </>
            ) : (
              <span>No clip selected</span>
            )}
          </span>
          <span className="fk-video-timeline__tool-actions">
            <button
              type="button"
              aria-label="Rename selected clip"
              title="Rename clip (F2)"
              disabled={!canRenameActiveClip}
              onClick={() => activeContext && beginClipRename(activeContext.clip.id)}
            >
              <Pencil1Icon />
            </button>
            <button
              type="button"
              aria-label="Split selected clip at playhead"
              title="Split at playhead (S)"
              disabled={!canSplitActiveClip}
              onClick={splitActiveClip}
            >
              <ScissorsIcon />
            </button>
            <button
              type="button"
              aria-label="Duplicate selected clip"
              title="Duplicate clip"
              disabled={!canEditActiveClip}
              onClick={duplicateActiveClip}
            >
              <CopyIcon />
            </button>
            <button
              type="button"
              aria-label="Delete selected clip"
              title="Delete clip"
              disabled={!canEditActiveClip}
              onClick={deleteActiveClip}
            >
              <TrashIcon />
            </button>
          </span>
        </div>
      )}

      <div className="fk-video-timeline__ruler" aria-hidden="true">
        <span>Tracks</span>
        <div ref={tracksRef}>
          {ticks.map((time) => (
            <span key={time} style={{ left: `${(time / duration) * 100}%` }}>
              {formatTime(time)}
            </span>
          ))}
        </div>
      </div>

      <div className="fk-video-timeline__body" role={canEdit ? 'group' : 'img'} aria-label={label}>
        <div className="fk-video-timeline__track-list">
          {tracks.map((track) => {
            const trackCanEdit = canEdit && !track.locked;
            return (
              <div
                className="fk-video-timeline__track"
                key={track.id}
                data-locked={track.locked || undefined}
                data-muted={track.muted || undefined}
                data-drop-target={dropTargetTrackId === track.id || undefined}
              >
                <div className="fk-video-timeline__track-label">
                  <span className="fk-video-timeline__track-name">
                    <strong>{track.label}</strong>
                  </span>
                  <span className="fk-video-timeline__track-actions">
                    <button
                      type="button"
                      aria-label={`${track.muted ? 'Unmute' : 'Mute'} ${track.label} track`}
                      aria-pressed={track.muted}
                      title={track.muted ? 'Unmute track' : 'Mute track'}
                      disabled={!canEdit}
                      onClick={() => toggleTrackState(track.id, 'muted')}
                    >
                      {track.muted ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}
                    </button>
                    <button
                      type="button"
                      aria-label={`${track.locked ? 'Unlock' : 'Lock'} ${track.label} track`}
                      aria-pressed={track.locked}
                      title={track.locked ? 'Unlock track' : 'Lock track'}
                      disabled={!canEdit}
                      onClick={() => toggleTrackState(track.id, 'locked')}
                    >
                      {track.locked ? <LockClosedIcon /> : <LockOpen1Icon />}
                    </button>
                  </span>
                </div>
                <div
                  ref={(node) => {
                    if (node) laneRefs.current.set(track.id, node);
                    else laneRefs.current.delete(track.id);
                  }}
                  className="fk-video-timeline__lane"
                  data-drag-source={
                    (draggingClipId && track.clips.some((clip) => clip.id === draggingClipId)) ||
                    undefined
                  }
                  onPointerDown={handleLanePointerDown}
                >
                  <div className="fk-video-timeline__guides" aria-hidden="true">
                    {ticks.map((time) => (
                      <span key={time} style={{ left: `${(time / duration) * 100}%` }} />
                    ))}
                  </div>
                  {track.clips.map((clip) => {
                    const width = (clip.duration / duration) * 100;
                    const start = (clip.start / duration) * 100;
                    const isActive = clip.id === activeClipId;
                    const end = clip.start + clip.duration;
                    const mediaType = clip.mediaType ?? 'video';
                    return (
                      <div
                        className="fk-video-timeline__clip-shell"
                        key={clip.id}
                        style={{
                          left: `${start}%`,
                          width: `${width}%`,
                          transform:
                            draggingClipId === clip.id && dragTranslationY !== 0
                              ? `translateY(${dragTranslationY}px)`
                              : undefined,
                        }}
                        data-active={isActive || undefined}
                        data-dragging={draggingClipId === clip.id || undefined}
                        data-trimming={trimming?.clipId === clip.id || undefined}
                        data-renaming={renamingClipId === clip.id || undefined}
                        data-media-type={mediaType}
                      >
                        <button
                          className="fk-video-timeline__clip"
                          type="button"
                          aria-label={`${clip.label}, ${MEDIA_TYPE_LABELS[mediaType]} clip, ${track.label} track, starts at ${formatTime(clip.start)}, duration ${formatTime(clip.duration)}`}
                          aria-pressed={isActive}
                          onClick={() => selectClip(clip.id)}
                          onDoubleClick={() => beginClipRename(clip.id)}
                          onPointerDown={(event) => handleClipPointerDown(event, clip, track)}
                          onPointerMove={(event) => handleClipPointerMove(event, clip.id)}
                          onPointerUp={stopClipDragging}
                          onPointerCancel={stopClipDragging}
                          onKeyDown={(event) => handleClipKeyDown(event, clip, track)}
                        >
                          <span
                            className="fk-video-timeline__thumbnail"
                            data-custom-preview={clip.thumbnail ? '' : undefined}
                            aria-hidden="true"
                          >
                            {clip.thumbnail ?? (
                              <DefaultMediaPreview
                                mediaType={mediaType}
                                previewSrc={clip.previewSrc}
                                waveform={clip.waveform}
                                sourceOffset={clip.sourceOffset}
                                sourceDuration={clip.sourceDuration}
                                duration={clip.duration}
                              />
                            )}
                          </span>
                          <span className="fk-video-timeline__clip-copy">
                            <strong>{clip.label}</strong>
                            {clip.meta && <small>{clip.meta}</small>}
                          </span>
                        </button>
                        {renamingClipId === clip.id && (
                          <input
                            className="fk-video-timeline__rename"
                            type="text"
                            value={renameValue}
                            maxLength={120}
                            autoFocus
                            spellCheck={false}
                            aria-label={`Rename ${clip.label}`}
                            onChange={(event) => setRenameValue(event.target.value)}
                            onBlur={commitClipRename}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                commitClipRename();
                              } else if (event.key === 'Escape') {
                                event.preventDefault();
                                cancelClipRename();
                              }
                            }}
                          />
                        )}
                        {isActive && trackCanEdit && renamingClipId !== clip.id && (
                          <>
                            <span
                              className="fk-video-timeline__trim fk-video-timeline__trim--start"
                              role="slider"
                              tabIndex={0}
                              aria-label={`Trim start of ${clip.label}`}
                              aria-valuemin={0}
                              aria-valuemax={Math.round(end - minClipDuration)}
                              aria-valuenow={Math.round(clip.start)}
                              aria-valuetext={formatTime(clip.start)}
                              data-dragging={
                                (trimming?.clipId === clip.id && trimming.edge === 'start') ||
                                undefined
                              }
                              onPointerDown={(event) =>
                                handleTrimPointerDown(event, clip, track.id, 'start')
                              }
                              onPointerMove={handleTrimPointerMove}
                              onPointerUp={stopTrimming}
                              onPointerCancel={stopTrimming}
                              onKeyDown={(event) =>
                                handleTrimKeyDown(event, clip, track.id, 'start')
                              }
                            />
                            <span
                              className="fk-video-timeline__trim fk-video-timeline__trim--end"
                              role="slider"
                              tabIndex={0}
                              aria-label={`Trim end of ${clip.label}`}
                              aria-valuemin={Math.round(clip.start + minClipDuration)}
                              aria-valuemax={duration}
                              aria-valuenow={Math.round(end)}
                              aria-valuetext={formatTime(end)}
                              data-dragging={
                                (trimming?.clipId === clip.id && trimming.edge === 'end') ||
                                undefined
                              }
                              onPointerDown={(event) =>
                                handleTrimPointerDown(event, clip, track.id, 'end')
                              }
                              onPointerMove={handleTrimPointerMove}
                              onPointerUp={stopTrimming}
                              onPointerCancel={stopTrimming}
                              onKeyDown={(event) => handleTrimKeyDown(event, clip, track.id, 'end')}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fk-video-timeline__playhead-area">
          <div
            className="fk-video-timeline__playhead"
            role="slider"
            tabIndex={canEdit ? 0 : -1}
            aria-label="Timeline playhead"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={Math.round(playhead)}
            aria-valuetext={formatTime(playhead)}
            data-dragging={isDraggingPlayhead || undefined}
            style={{ left: `${(playhead / duration) * 100}%` }}
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
    </div>
  );
});
