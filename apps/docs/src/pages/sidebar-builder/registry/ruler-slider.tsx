import { RulerSlider } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from RulerSliderProps: size 'sm' | 'md' | 'lg'
 *  (ValueControlSize), showLabel boolean. Label, range, and unit are
 *  builder-editable; a non-empty unit feeds formatValue. */
export const rulerSliderEntry: CatalogEntry = {
  kind: 'ruler-slider',
  label: 'Ruler slider',
  description: 'A precision value with scale context.',
  category: 'controls',
  short: 'RS',
  specPage: 'ruler-slider',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Rotation' },
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
    { key: 'showLabel', label: 'Show label', type: 'toggle', defaultValue: true },
    { key: 'unit', label: 'Unit', type: 'text', defaultValue: '°' },
    { key: 'min', label: 'Min', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: -180 },
    { key: 'max', label: 'Max', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 180 },
  ],
  render: (props, ctx) => {
    const unit = String(props.unit);
    return (
      <RulerSlider
        label={String(props.label)}
        size={props.size as 'sm' | 'md' | 'lg'}
        showLabel={Boolean(props.showLabel)}
        min={Number(props.min)}
        max={Number(props.max)}
        value={ctx.get('value', Math.round((Number(props.min) + Number(props.max)) / 2))}
        onValueChange={(next) => ctx.set('value', next)}
        formatValue={unit ? (next: number) => Math.round(next) + unit : undefined}
      />
    );
  },
  code: (props) => {
    const unit = String(props.unit);
    return [
      '<RulerSlider',
      `  label=${jsxString(props.label)}`,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      !props.showLabel ? '  showLabel={false}' : null,
      Number(props.min) !== 0 ? `  min={${props.min}}` : null,
      Number(props.max) !== 100 ? `  max={${props.max}}` : null,
      '  value={value}',
      '  onValueChange={setValue}',
      unit ? `  formatValue={(value) => Math.round(value) + ${jsxString(unit)}}` : null,
      '/>',
    ]
      .filter(Boolean)
      .join('\n');
  },
  imports: ['RulerSlider'],
};
