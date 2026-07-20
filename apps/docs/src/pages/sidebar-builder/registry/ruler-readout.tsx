import { RulerReadout } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop union from RulerReadoutProps: size 'sm' | 'md' | 'lg'
 *  (ValueControlSize). The readout is display-only, so its value is a plain
 *  builder option rather than live scratch state. `origin` is optional in the
 *  component API, so a Show origin toggle gates the origin number option. */
export const rulerReadoutEntry: CatalogEntry = {
  kind: 'ruler-readout',
  label: 'Ruler readout',
  description: 'A passive scale for a related value.',
  category: 'controls',
  short: 'RR',
  specPage: 'ruler-readouts',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Position' },
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
    { key: 'unit', label: 'Unit', type: 'text', defaultValue: '' },
    { key: 'value', label: 'Value', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 64 },
    { key: 'min', label: 'Min', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 0 },
    { key: 'max', label: 'Max', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 100 },
    { key: 'showOrigin', label: 'Show origin', type: 'toggle', defaultValue: false },
    { key: 'origin', label: 'Origin', type: 'number', min: -1000, max: 1000, step: 1, defaultValue: 0 },
    { key: 'hideRangeLabels', label: 'Hide range labels', type: 'toggle', defaultValue: false },
  ],
  render: (props) => {
    const unit = String(props.unit);
    return (
      <RulerReadout
        label={String(props.label)}
        size={props.size as 'sm' | 'md' | 'lg'}
        value={Number(props.value)}
        min={Number(props.min)}
        max={Number(props.max)}
        origin={props.showOrigin ? Number(props.origin) : undefined}
        hideRangeLabels={Boolean(props.hideRangeLabels)}
        formatValue={unit ? (next: number) => Math.round(next) + unit : undefined}
      />
    );
  },
  code: (props) => {
    const unit = String(props.unit);
    return [
      '<RulerReadout',
      `  label=${jsxString(props.label)}`,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      `  value={${props.value}}`,
      Number(props.min) !== 0 ? `  min={${props.min}}` : null,
      Number(props.max) !== 100 ? `  max={${props.max}}` : null,
      props.showOrigin ? `  origin={${props.origin}}` : null,
      props.hideRangeLabels ? '  hideRangeLabels' : null,
      unit ? `  formatValue={(value) => Math.round(value) + ${jsxString(unit)}}` : null,
      '/>',
    ]
      .filter(Boolean)
      .join('\n');
  },
  imports: ['RulerReadout'],
};
