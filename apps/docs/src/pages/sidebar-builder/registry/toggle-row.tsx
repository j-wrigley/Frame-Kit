import { ToggleRow } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from ToggleRowProps: variant 'default' | 'compact'
 *  (ToggleRowVariant), size 'sm' | 'md' (ToggleSize), tone 'default' | 'danger'
 *  (ToggleTone). The component derives size when omitted — compact rows use
 *  'sm', default rows 'md' — so code omits size when it matches that
 *  derivation. `meta` is a ReactNode slot and is not builder-editable. */
export const toggleRowEntry: CatalogEntry = {
  kind: 'toggle-row',
  label: 'Toggle row',
  description: 'An immediate binary setting.',
  category: 'controls',
  short: 'TO',
  specPage: 'toggle-rows',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Visible' },
    { key: 'description', label: 'Description', type: 'text', defaultValue: 'Show on canvas' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'default', label: 'Default' },
        { value: 'compact', label: 'Compact' },
      ],
      defaultValue: 'default',
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
  ],
  render: (props, ctx) => (
    <ToggleRow
      label={String(props.label)}
      description={props.description ? String(props.description) : undefined}
      variant={props.variant as 'default' | 'compact'}
      size={props.size as 'sm' | 'md'}
      tone={props.tone as 'default' | 'danger'}
      checked={ctx.get('checked', true)}
      onChange={(event) => ctx.set('checked', event.target.checked)}
    />
  ),
  code: (props) => {
    const derivedSize = props.variant === 'compact' ? 'sm' : 'md';
    return [
      '<ToggleRow',
      `  label=${jsxString(props.label)}`,
      props.description ? `  description=${jsxString(props.description)}` : null,
      props.variant !== 'default' ? `  variant="${props.variant}"` : null,
      props.size !== derivedSize ? `  size="${props.size}"` : null,
      props.tone !== 'default' ? `  tone="${props.tone}"` : null,
      '  checked={checked}',
      '  onChange={(event) => setChecked(event.target.checked)}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n');
  },
  imports: ['ToggleRow'],
};
