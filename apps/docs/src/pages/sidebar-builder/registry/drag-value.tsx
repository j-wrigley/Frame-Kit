import { DragValue } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from DragValueProps: size 'sm' | 'md' | 'lg'
 *  (ValueControlSize), variant 'fill' | 'bipolar' | 'bare' (DragValueVariant),
 *  decoration 'none' | 'handle' | 'ticks' | 'zero' (DragValueDecoration),
 *  labelAlign 'left' | 'center' | 'right' (DragValueLabelAlign), showLabel
 *  boolean. A non-empty unit feeds formatValue. */
export const dragValueEntry: CatalogEntry = {
  kind: 'drag-value',
  label: 'Drag value',
  description: 'A filled horizontal scrub value.',
  category: 'controls',
  short: 'DV',
  specPage: 'drag-value',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Exposure' },
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
        { value: 'fill', label: 'Fill' },
        { value: 'bipolar', label: 'Bipolar' },
        { value: 'bare', label: 'Bare' },
      ],
      defaultValue: 'fill',
    },
    {
      key: 'decoration',
      label: 'Decoration',
      type: 'select',
      choices: [
        { value: 'none', label: 'None' },
        { value: 'handle', label: 'Handle' },
        { value: 'ticks', label: 'Ticks' },
        { value: 'zero', label: 'Zero' },
      ],
      defaultValue: 'handle',
    },
    {
      key: 'labelAlign',
      label: 'Label align',
      type: 'select',
      choices: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    },
    { key: 'showLabel', label: 'Show label', type: 'toggle', defaultValue: true },
    { key: 'unit', label: 'Unit', type: 'text', defaultValue: '%' },
    { key: 'min', label: 'Min', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 0 },
    { key: 'max', label: 'Max', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 100 },
  ],
  render: (props, ctx) => {
    const unit = String(props.unit);
    return (
      <DragValue
        label={String(props.label)}
        size={props.size as 'sm' | 'md' | 'lg'}
        variant={props.variant as 'fill' | 'bipolar' | 'bare'}
        decoration={props.decoration as 'none' | 'handle' | 'ticks' | 'zero'}
        labelAlign={props.labelAlign as 'left' | 'center' | 'right'}
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
      '<DragValue',
      `  label=${jsxString(props.label)}`,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.variant !== 'fill' ? `  variant="${props.variant}"` : null,
      props.decoration !== 'none' ? `  decoration="${props.decoration}"` : null,
      props.labelAlign !== 'center' ? `  labelAlign="${props.labelAlign}"` : null,
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
  imports: ['DragValue'],
};
