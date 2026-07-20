import { KeyframeLane } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from KeyframeLaneProps: variant 'diamond' | 'bar' | 'dot'
 *  (KeyframeLaneVariant), density 'regular' | 'compact' (KeyframeLaneDensity),
 *  showPlayhead boolean, duration number (default 1000), editable, disabled.
 *  Keyframes stay uncontrolled (built-in four-key sample); the shared playhead
 *  is wired live through the builder scratch state. */
export const keyframeLaneEntry: CatalogEntry = {
  kind: 'keyframe-lane',
  label: 'Keyframe lane',
  description: 'A compact property timeline.',
  category: 'creative',
  short: 'KL',
  specPage: 'keyframe-lane',
  options: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'diamond', label: 'Diamond' },
        { value: 'bar', label: 'Bar' },
        { value: 'dot', label: 'Dot' },
      ],
      defaultValue: 'diamond',
    },
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
    { key: 'showPlayhead', label: 'Show playhead', type: 'toggle', defaultValue: true },
    {
      key: 'duration',
      label: 'Duration',
      type: 'number',
      min: 200,
      max: 10000,
      step: 100,
      defaultValue: 1000,
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <KeyframeLane
      variant={props.variant as 'diamond' | 'bar' | 'dot'}
      density={props.density as 'regular' | 'compact'}
      showPlayhead={Boolean(props.showPlayhead)}
      duration={Number(props.duration)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      playhead={ctx.get('playhead', 300)}
      onPlayheadChange={(next) => ctx.set('playhead', next)}
    />
  ),
  code: (props) =>
    [
      '<KeyframeLane',
      props.variant !== 'diamond' ? `  variant="${props.variant}"` : null,
      props.density !== 'regular' ? `  density="${props.density}"` : null,
      !props.showPlayhead ? '  showPlayhead={false}' : null,
      Number(props.duration) !== 1000 ? `  duration={${props.duration}}` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  playhead={playhead}',
      '  onPlayheadChange={setPlayhead}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['KeyframeLane'],
};
