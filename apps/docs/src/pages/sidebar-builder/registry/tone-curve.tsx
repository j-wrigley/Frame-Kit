import {
  ToneCurve,
  type ToneCurveChannel,
  type ToneCurvePoint,
} from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** The component's soft-contrast default curve, reused as compact demo data. */
const DEMO_POINTS: readonly ToneCurvePoint[] = [
  { id: 'black', x: 0, y: 0 },
  { id: 'shadow', x: 0.24, y: 0.18 },
  { id: 'highlight', x: 0.74, y: 0.82 },
  { id: 'white', x: 1, y: 1 },
];

/** Real prop union from ToneCurveChannel: 'luminance' | 'red' | 'green' | 'blue',
 *  plus showHistogram/showAxis/editable/disabled booleans.
 *  The `label` prop is accessible-only (never displayed), so no text option. */
export const toneCurveEntry: CatalogEntry = {
  kind: 'tone-curve',
  label: 'Tone curve',
  description: 'A tonal transfer curve with direct points.',
  category: 'creative',
  short: 'TC',
  specPage: 'tone-curve',
  options: [
    {
      key: 'channel',
      label: 'Channel',
      type: 'select',
      choices: [
        { value: 'luminance', label: 'Luminance' },
        { value: 'red', label: 'Red' },
        { value: 'green', label: 'Green' },
        { value: 'blue', label: 'Blue' },
      ],
      defaultValue: 'luminance',
    },
    { key: 'showHistogram', label: 'Show histogram', type: 'toggle', defaultValue: true },
    { key: 'showAxis', label: 'Show axis', type: 'toggle', defaultValue: true },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <ToneCurve
      channel={props.channel as ToneCurveChannel}
      showHistogram={Boolean(props.showHistogram)}
      showAxis={Boolean(props.showAxis)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('points', DEMO_POINTS)}
      onValueChange={(next) => ctx.set('points', next)}
    />
  ),
  code: (props) =>
    [
      '<ToneCurve',
      props.channel !== 'luminance' ? `  channel="${props.channel}"` : null,
      !props.showHistogram ? '  showHistogram={false}' : null,
      !props.showAxis ? '  showAxis={false}' : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={points}',
      '  onValueChange={setPoints}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['ToneCurve'],
};
