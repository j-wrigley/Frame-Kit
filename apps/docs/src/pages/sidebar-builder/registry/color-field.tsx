import { ColorField } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real props from ColorFieldProps: fullWidth boolean, pickerLabel string
 *  (default 'Colour'), controlled value/onChange hex contract. The colour
 *  option seeds the live value; picking or typing then updates the node's
 *  scratch state. `presets`, `renderPicker`, and `pickerClassName` are
 *  composition props and are not builder-editable. */
export const colorFieldEntry: CatalogEntry = {
  kind: 'color-field',
  label: 'Colour field',
  description: 'A swatch input with picker popover.',
  category: 'controls',
  short: 'CF',
  specPage: 'color-picker',
  options: [
    { key: 'value', label: 'Colour', type: 'color', defaultValue: '#3b67de' },
    { key: 'pickerLabel', label: 'Picker label', type: 'text', defaultValue: 'Fill colour' },
    { key: 'fullWidth', label: 'Full width', type: 'toggle', defaultValue: true },
  ],
  render: (props, ctx) => (
    <ColorField
      pickerLabel={props.pickerLabel ? String(props.pickerLabel) : undefined}
      fullWidth={Boolean(props.fullWidth)}
      value={ctx.get('value', String(props.value))}
      onChange={(next) => ctx.set('value', next)}
    />
  ),
  code: (props) =>
    [
      '<ColorField',
      props.pickerLabel && props.pickerLabel !== 'Colour'
        ? `  pickerLabel=${jsxString(props.pickerLabel)}`
        : null,
      props.fullWidth ? '  fullWidth' : null,
      '  value={colour}',
      '  onChange={setColour}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['ColorField'],
};
