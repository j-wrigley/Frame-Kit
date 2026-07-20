import { Scrubber } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from ScrubberProps: size 'sm' | 'md' | 'lg'
 *  (ValueControlSize), variant 'rail' | 'meter' | 'ruler' (ScrubberVariant),
 *  surface 'soft' | 'bare' (ScrubberSurface), showLabel boolean. A non-empty
 *  unit feeds formatValue. */
export const scrubberEntry: CatalogEntry = {
  kind: 'scrubber',
  label: 'Scrubber',
  description: 'A compact direct adjustment row.',
  category: 'controls',
  short: 'SC',
  specPage: 'scrubber',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Feather' },
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
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'rail', label: 'Rail' },
        { value: 'meter', label: 'Meter' },
        { value: 'ruler', label: 'Ruler' },
      ],
      defaultValue: 'ruler',
    },
    {
      key: 'surface',
      label: 'Surface',
      type: 'select',
      choices: [
        { value: 'soft', label: 'Soft' },
        { value: 'bare', label: 'Bare' },
      ],
      defaultValue: 'soft',
    },
    { key: 'showLabel', label: 'Show label', type: 'toggle', defaultValue: true },
    { key: 'unit', label: 'Unit', type: 'text', defaultValue: 'px' },
    { key: 'min', label: 'Min', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 0 },
    { key: 'max', label: 'Max', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 100 },
  ],
  render: (props, ctx) => {
    const unit = String(props.unit);
    return (
      <Scrubber
        label={String(props.label)}
        size={props.size as 'sm' | 'md' | 'lg'}
        variant={props.variant as 'rail' | 'meter' | 'ruler'}
        surface={props.surface as 'soft' | 'bare'}
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
      '<Scrubber',
      `  label=${jsxString(props.label)}`,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.variant !== 'rail' ? `  variant="${props.variant}"` : null,
      props.surface !== 'soft' ? `  surface="${props.surface}"` : null,
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
  imports: ['Scrubber'],
};
