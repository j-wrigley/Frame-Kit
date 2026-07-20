import {
  ValueGraph,
  type ValueGraphChannel,
  type ValueGraphChannels,
} from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Compact plausible motion curves for all four channels. */
const DEMO_CHANNELS: ValueGraphChannels = {
  position: [
    { id: 'position-start', time: 0, value: -0.08 },
    { id: 'position-rise', time: 0.26, value: 0.46 },
    { id: 'position-drift', time: 0.6, value: -0.2 },
    { id: 'position-end', time: 1, value: 0.16 },
  ],
  scale: [
    { id: 'scale-start', time: 0, value: -0.42 },
    { id: 'scale-peak', time: 0.66, value: 0.44 },
    { id: 'scale-end', time: 1, value: 0.08 },
  ],
  rotation: [
    { id: 'rotation-start', time: 0, value: 0.3 },
    { id: 'rotation-turn', time: 0.4, value: -0.22 },
    { id: 'rotation-end', time: 1, value: -0.1 },
  ],
  opacity: [
    { id: 'opacity-start', time: 0, value: -0.88 },
    { id: 'opacity-hold', time: 0.5, value: 0.72 },
    { id: 'opacity-end', time: 1, value: 0.92 },
  ],
};

/** Real prop union from ValueGraphChannel: 'position' | 'scale' | 'rotation' |
 *  'opacity'. The `label` prop is accessible-only (never displayed), so no text
 *  option. */
export const valueGraphEntry: CatalogEntry = {
  kind: 'value-graph',
  label: 'Value graph',
  description: 'Multi-channel value shaping.',
  category: 'creative',
  short: 'VG',
  specPage: 'value-graph',
  options: [
    {
      key: 'activeChannel',
      label: 'Active channel',
      type: 'select',
      choices: [
        { value: 'position', label: 'Position' },
        { value: 'scale', label: 'Scale' },
        { value: 'rotation', label: 'Rotation' },
        { value: 'opacity', label: 'Opacity' },
      ],
      defaultValue: 'position',
    },
    { key: 'showOtherChannels', label: 'Show other channels', type: 'toggle', defaultValue: true },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <ValueGraph
      activeChannel={props.activeChannel as ValueGraphChannel}
      showOtherChannels={Boolean(props.showOtherChannels)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('channels', DEMO_CHANNELS)}
      onValueChange={(next) => ctx.set('channels', next)}
    />
  ),
  code: (props) =>
    [
      '<ValueGraph',
      props.activeChannel !== 'position' ? `  activeChannel="${props.activeChannel}"` : null,
      !props.showOtherChannels ? '  showOtherChannels={false}' : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={channels}',
      '  onValueChange={setChannels}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['ValueGraph'],
};
