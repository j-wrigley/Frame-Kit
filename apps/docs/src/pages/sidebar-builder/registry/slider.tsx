import { Slider } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from SliderProps: size 'sm' | 'md' | 'lg' (ValueControlSize),
 *  showValue boolean. Label + range are builder-editable. */
export const sliderEntry: CatalogEntry = {
  kind: 'slider',
  label: 'Slider',
  description: 'A continuous everyday adjustment.',
  category: 'controls',
  short: 'SL',
  specPage: 'slider',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Opacity' },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      choices: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ],
      defaultValue: 'sm',
    },
    { key: 'showValue', label: 'Show value', type: 'toggle', defaultValue: true },
    { key: 'min', label: 'Min', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 0 },
    { key: 'max', label: 'Max', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 100 },
  ],
  render: (props, ctx) => (
    <Slider
      label={String(props.label)}
      size={props.size as 'sm' | 'md' | 'lg'}
      showValue={Boolean(props.showValue)}
      min={Number(props.min)}
      max={Number(props.max)}
      value={ctx.get('value', Math.round((Number(props.min) + Number(props.max)) / 2))}
      onValueChange={(next) => ctx.set('value', next)}
    />
  ),
  code: (props) =>
    [
      '<Slider',
      `  label=${jsxString(props.label)}`,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      !props.showValue ? '  showValue={false}' : null,
      Number(props.min) !== 0 ? `  min={${props.min}}` : null,
      Number(props.max) !== 100 ? `  max={${props.max}}` : null,
      '  value={value}',
      '  onValueChange={setValue}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Slider'],
};
