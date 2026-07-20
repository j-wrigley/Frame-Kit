import { VideoTimeline } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop surface from VideoTimelineProps: density 'regular' | 'compact'
 *  (VideoTimelineDensity), showTools, renamable, editable, disabled booleans,
 *  duration number (default 16000). Tracks stay uncontrolled (built-in
 *  three-track sample); the shared playhead is wired live through the builder
 *  scratch state. */
export const videoTimelineEntry: CatalogEntry = {
  kind: 'video-timeline',
  label: 'Video timeline',
  description: 'A compact multi-track editorial timeline.',
  category: 'creative',
  short: 'VT',
  specPage: 'video-timeline',
  options: [
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      choices: [
        { value: 'regular', label: 'Regular' },
        { value: 'compact', label: 'Compact' },
      ],
      defaultValue: 'compact',
    },
    { key: 'showTools', label: 'Show tools', type: 'toggle', defaultValue: true },
    { key: 'renamable', label: 'Renamable', type: 'toggle', defaultValue: true },
    {
      key: 'duration',
      label: 'Duration',
      type: 'number',
      min: 4000,
      max: 60000,
      step: 1000,
      defaultValue: 16000,
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <VideoTimeline
      density={props.density as 'regular' | 'compact'}
      showTools={Boolean(props.showTools)}
      renamable={Boolean(props.renamable)}
      duration={Number(props.duration)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      playhead={ctx.get('playhead', 5200)}
      onPlayheadChange={(next) => ctx.set('playhead', next)}
    />
  ),
  code: (props) =>
    [
      '<VideoTimeline',
      props.density !== 'regular' ? `  density="${props.density}"` : null,
      !props.showTools ? '  showTools={false}' : null,
      !props.renamable ? '  renamable={false}' : null,
      Number(props.duration) !== 16000 ? `  duration={${props.duration}}` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  playhead={playhead}',
      '  onPlayheadChange={setPlayhead}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['VideoTimeline'],
};
