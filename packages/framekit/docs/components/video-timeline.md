---
name: Video timeline
status: stable
since: 0.1.0
import: import { VideoTimeline } from '@presentstandards/framekit-ui'
---

# Video timeline

> A composed multi-track editor for arranging, trimming, and cutting mixed media against one shared playhead.

## When to use

- Video editing, social publishing, review, and presentation tools that need a concise mixed-media arrangement view.
- A sidebar, inspector, or full editing view that needs useful timeline behaviour without rebuilding the basics.
- Readable multi-layer timelines that need real video, image, and audio previews alongside minimal title, adjustment, and generic-file clips.

## When not to use

- Use [Keyframe lane](./keyframe-lane.md) for discrete changes to a single animated property.
- Do not use it as a complete non-linear editor: the application should still own media loading, playback, rendering, persistence, and undo history.
- Use `Scrubber` when a single playback value is needed without lanes or clips.

## Anatomy

`VideoTimeline` renders a clip tool strip, time ruler, named track labels, aligned lane guides,
media-aware preview surfaces, two trim handles on the selected clip, and one shared playhead. Clips can be
retimed horizontally or transferred vertically to another unlocked lane in the same drag. The
built-in tools rename, split at the playhead, duplicate, and delete. Each lane can be muted or locked.
`regular` provides comfortable clip labels; `compact` reduces lane height and secondary metadata.

The component owns the editing mechanics while keeping playback and persistence application-owned.
Set `clip.mediaType` to `video`, `audio`, `image`, `title`, `adjustment`, or `file`. A
`previewSrc` renders native image/video content; audio sources are decoded once (cached per URL) into a
high-resolution min/max/RMS peak store (`createAudioPeakStore`, ~5ms buckets) and painted onto a canvas at
one column per device pixel — true asymmetric peak extents in a pale layer with a brighter RMS body over a
faint zero line, the way Premiere Pro and Final Cut draw program material. The painter re-renders on resize,
trim, and theme changes. For precomputed pipelines, pass per-channel `waveform` peaks together with
`sourceDuration`; supplied peaks render through the same painter with a symmetric envelope and a derived
(~70% of peak) body, so decoded audio is always the more faithful path.
The clip name occupies a thin header so the waveform uses the complete clip width, while stereo and multichannel
sources retain separate channel rows. Trimming and splitting crop the displayed signal to the retained source range.
Audio without a source or peaks renders an honest flat empty state—not an invented waveform. `thumbnail` remains the
highest-priority escape hatch for a completely custom renderer. Title, adjustment, and file clips use the same polished,
minimal icon-and-label structure instead of a thumbnail panel.

## Props

| Prop                   | Type                                      | Default             | Description                                                         |
| ---------------------- | ----------------------------------------- | ------------------- | ------------------------------------------------------------------- |
| `value`                | `readonly VideoTimelineTrack[]`           | —                   | Controlled tracks and their clips.                                  |
| `defaultValue`         | `readonly VideoTimelineTrack[]`           | Three sample tracks | Initial uncontrolled tracks.                                        |
| `onValueChange`        | `(tracks: VideoTimelineTrack[]) => void`  | —                   | Called after clip or track state changes.                           |
| `onEdit`               | `(event: VideoTimelineEditEvent) => void` | —                   | Reports move, trim, split, duplicate, delete, and rename edits.     |
| `activeClipId`         | `string \| null`                          | —                   | Controlled selected clip id.                                        |
| `defaultActiveClipId`  | `string \| null`                          | First clip          | Initial selected clip id.                                           |
| `onActiveClipIdChange` | `(id: string \| null) => void`            | —                   | Called when a clip is selected.                                     |
| `playhead`             | `number`                                  | —                   | Controlled shared current time.                                     |
| `defaultPlayhead`      | `number`                                  | `0`                 | Initial uncontrolled current time.                                  |
| `onPlayheadChange`     | `(time: number) => void`                  | —                   | Called after lane click or playhead scrub.                          |
| `duration`             | `number`                                  | `16000`             | Final editable timeline time.                                       |
| `snap`                 | `number`                                  | —                   | Positive movement, trim, playhead, and keyboard snapping increment. |
| `minClipDuration`      | `number`                                  | `500`               | Smallest duration retained by trimming and splitting.               |
| `density`              | `'regular' \| 'compact'`                  | `'regular'`         | Vertical density and supporting metadata.                           |
| `step`                 | `number`                                  | `250`               | Arrow-key increment when snap is off.                               |
| `showTools`            | `boolean`                                 | `true`              | Shows rename, split, duplicate, and delete actions.                 |
| `renamable`            | `boolean`                                 | `true`              | Enables tool-strip, double-click, and F2 clip renaming.             |
| `editable`             | `boolean`                                 | `true`              | Enables scrubbing, trimming, track controls, and clip edits.        |
| `disabled`             | `boolean`                                 | `false`             | Prevents interaction and mutes the surface.                         |
| `label`                | `string`                                  | `'Video timeline'`  | Accessible timeline name.                                           |

`VideoTimelineClip` is
`{ id; start; duration; sourceOffset?; sourceDuration?; label; meta?; mediaType?; previewSrc?; waveform?; thumbnail? }`.
`sourceOffset` is increased when the in point is trimmed, allowing the application to preserve the
correct source-media position. `sourceDuration` allows the component to crop whole-source waveform
data and seek video previews to the correct edited range. `mediaType` is
`'video' | 'audio' | 'image' | 'title' | 'adjustment' | 'file'` and defaults to `video`.
`previewSrc` accepts a media URL or object URL. `waveform` accepts a mono `number[]` envelope or
per-channel `number[][]` of real peak amplitudes from 0–1 and takes precedence over automatic decoding.
Peak values preserve their recorded amplitude by default — silence stays quiet and loud sections read loud.
Use `{ normalize: true }` with `createAudioWaveformChannels` only when the application deliberately wants a
reference waveform with its loudest peak scaled to full height. `createAudioPeakStore(audioBuffer)` is the
high-fidelity reducer behind automatic decoding, exported for applications that persist or inspect peak
data themselves (as NLEs cache peak files alongside media). Note the store is not a clip prop — clips
accept only `previewSrc` (preferred, decoded through this reducer internally) or `waveform` peak arrays.
`thumbnail` accepts any React node and takes precedence over both.

`VideoTimelineTrack` is `{ id; label; clips; locked?; muted? }`. Lock prevents destructive and
positional edits for that lane. Mute is an application-readable state intended to connect to the
playback engine.

`VideoTimelineEditEvent` includes `action`, `clipId`, `trackId`, and `createdClipId` for split or
duplicate operations. For lane transfers, `trackId` is the destination and `previousTrackId` is the
original lane. Rename events include the updated `label`. The component forwards its ref and
standard `<div>` attributes to the root.

## Tokens used

| Token                                      | Role in this component                                        |
| ------------------------------------------ | ------------------------------------------------------------- |
| `--fk-bg-control`                          | Quiet editorial lane ground.                                  |
| `--fk-bg-raised`                           | Clip and neutral thumbnail surface.                           |
| `--fk-border-subtle`                       | Ruler, lane, tool strip, and timing guides.                   |
| `--fk-accent`                              | Selected clip edge, trim handles, playhead, and focus signal. |
| `--fk-text-primary` / `--fk-text-tertiary` | Clip and secondary source labels.                             |

## Keyboard & accessibility

- Each clip is a focusable toggle button announcing its label, start, and duration.
- Selected clip edges are sliders that announce and update the in and out points.
- Arrow keys retime the focused clip; `Shift` moves five increments. `Home` aligns it to the start and `End` aligns its end to the timeline end.
- `Alt + Arrow Up` and `Alt + Arrow Down` move the focused clip to the next unlocked lane, skipping locked lanes.
- `[` and `]` trim the focused clip to the playhead. `S` splits, `Delete` removes, and `Cmd/Ctrl+D` duplicates the selected clip.
- `F2` opens the selected clip name in an inline text field. Enter commits and Escape cancels. Pointer users can double-click a clip or use the rename tool.
- The shared playhead is a focusable slider. Arrow keys move it, while `Home` and `End` jump to bounds.
- Clicking an empty lane clears selection and moves the playhead. Dragging horizontally changes a clip's start time; dragging vertically previews and commits a new unlocked lane.
- Clip position and trim boundaries are constrained to the supplied timeline and `minClipDuration`.
- Tool-strip actions expose names and disabled state; track mute and lock controls expose pressed state.
- With `editable={false}`, the timeline remains a labelled static image with no keyboard stops.

## Example

```tsx
import { VideoTimeline, type VideoTimelineTrack } from '@presentstandards/framekit-ui';

// Audio clips need only previewSrc — the timeline decodes it into a
// min/max/RMS peak store and paints real per-pixel waveforms per channel.

const [tracks, setTracks] = useState<VideoTimelineTrack[]>([
  {
    id: 'video',
    label: 'Video',
    clips: [
      {
        id: 'opening',
        start: 0,
        duration: 4200,
        label: 'Opening',
        meta: 'A001',
        mediaType: 'video',
        previewSrc: videoObjectUrl,
      },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    clips: [
      {
        id: 'dialogue',
        start: 0,
        duration: 9600,
        label: 'Dialogue',
        meta: 'WAV',
        mediaType: 'audio',
        previewSrc: audioObjectUrl,
        sourceDuration: audioDurationMs,
      },
    ],
  },
]);

<VideoTimeline
  value={tracks}
  onValueChange={setTracks}
  onEdit={(event) => saveEdit(event)}
  playhead={playhead}
  onPlayheadChange={setPlayhead}
  duration={16000}
  snap={1000}
  minClipDuration={500}
  label="Opening cut video timeline"
/>;
```

## Do / Don't

- **Do** keep track labels concise and reflect the editorial purpose of each lane.
- **Do** pass one playhead to a related viewer or transport control.
- **Do** persist `sourceOffset` and `sourceDuration` with start and duration so trimmed clips retain their media in point and truthful preview range.
- **Do** use `previousTrackId` and `trackId` from move events to persist lane transfers and undo history.
- **Do** set `mediaType` even when a custom thumbnail is supplied so the clip retains useful semantic styling if that preview is unavailable.
- **Do** pass `previewSrc` for native previews — audio decodes once into a cached hi-res peak store; reach for `waveform` only when peaks are precomputed away from the client.
- **Do** use `thumbnail` only when the native preview modes do not cover the application renderer.
- **Don't** manufacture decorative audio bars. Render the flat unloaded state until the source has been decoded.
- **Don't** treat `muted` as audio processing by itself; connect the returned state to the playback engine.
- **Don't** discard `onValueChange` while controlled—the timeline cannot display edits without the updated value.
