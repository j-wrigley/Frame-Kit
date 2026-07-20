import { Checkbox } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from CheckboxProps: variant 'row' | 'inline' (CheckboxVariant),
 *  tone 'default' | 'danger' (CheckboxTone), indeterminate boolean. Label and
 *  description are the visible text slots; empty description omits the slot.
 *  `meta` is a ReactNode slot and is not builder-editable. */
export const checkboxEntry: CatalogEntry = {
  kind: 'checkbox',
  label: 'Checkbox',
  description: 'A native optional setting.',
  category: 'controls',
  short: 'CK',
  specPage: 'checks-radios',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Clip content' },
    { key: 'description', label: 'Description', type: 'text', defaultValue: '' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'row', label: 'Row' },
        { value: 'inline', label: 'Inline' },
      ],
      defaultValue: 'row',
    },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      choices: [
        { value: 'default', label: 'Default' },
        { value: 'danger', label: 'Danger' },
      ],
      defaultValue: 'default',
    },
    { key: 'indeterminate', label: 'Indeterminate', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <Checkbox
      label={String(props.label)}
      description={props.description ? String(props.description) : undefined}
      variant={props.variant as 'row' | 'inline'}
      tone={props.tone as 'default' | 'danger'}
      indeterminate={Boolean(props.indeterminate)}
      checked={ctx.get('checked', true)}
      onChange={(event) => ctx.set('checked', event.target.checked)}
    />
  ),
  code: (props) =>
    [
      '<Checkbox',
      `  label=${jsxString(props.label)}`,
      props.description ? `  description=${jsxString(props.description)}` : null,
      props.variant !== 'row' ? `  variant="${props.variant}"` : null,
      props.tone !== 'default' ? `  tone="${props.tone}"` : null,
      props.indeterminate ? '  indeterminate' : null,
      '  checked={checked}',
      '  onChange={(event) => setChecked(event.target.checked)}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Checkbox'],
};
