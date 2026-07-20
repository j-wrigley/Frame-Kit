import { DirectionPad, type DirectionPadDirection } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from DirectionPadProps: mode 'eight-way' | 'cardinal'
 *  (DirectionPadMode), size 'sm' | 'md' (DirectionPadSize), disabled boolean. */
export const directionPadEntry: CatalogEntry = {
  kind: 'direction-pad',
  label: 'Direction pad',
  description: 'A cardinal or eight-way direction choice.',
  category: 'creative',
  short: 'DP',
  specPage: 'direction-pad',
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'eight-way', label: 'Eight-way' },
        { value: 'cardinal', label: 'Cardinal' },
      ],
      defaultValue: 'eight-way',
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      choices: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
      ],
      defaultValue: 'sm',
    },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <DirectionPad
      mode={props.mode as 'eight-way' | 'cardinal'}
      size={props.size as 'sm' | 'md'}
      disabled={Boolean(props.disabled)}
      value={ctx.get<DirectionPadDirection>('direction', 'center')}
      onValueChange={(next) => ctx.set('direction', next)}
    />
  ),
  code: (props) =>
    [
      '<DirectionPad',
      props.mode !== 'eight-way' ? `  mode="${props.mode}"` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.disabled ? '  disabled' : null,
      '  value={direction}',
      '  onValueChange={setDirection}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['DirectionPad'],
};
