import { Dropdown } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from DropdownProps: size 'sm' | 'md' (DropdownSize),
 *  fullWidth boolean. `label` is the accessible trigger name, `placeholder`
 *  shows when nothing is selected (component default 'Select option').
 *  Option labels are edited as a comma-separated list; values are derived
 *  slugs. Per-option `description` and `disabled` are item data and are not
 *  builder-editable. */

function parseChoices(raw: unknown) {
  const seen = new Set<string>();
  return String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((label) => {
      const base = label.toLowerCase().replace(/\s+/g, '-');
      let value = base;
      let suffix = 2;
      while (seen.has(value)) {
        value = `${base}-${suffix}`;
        suffix += 1;
      }
      seen.add(value);
      return { value, label };
    });
}

export const dropdownEntry: CatalogEntry = {
  kind: 'dropdown',
  label: 'Dropdown',
  description: 'A single-select list control.',
  category: 'controls',
  short: 'DR',
  specPage: 'dropdowns',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Blend mode' },
    {
      key: 'options',
      label: 'Options (comma separated)',
      type: 'text',
      defaultValue: 'Normal, Multiply, Screen',
    },
    { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Select option' },
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
    { key: 'fullWidth', label: 'Full width', type: 'toggle', defaultValue: true },
  ],
  render: (props, ctx) => {
    const options = parseChoices(props.options);
    return (
      <Dropdown
        label={props.label ? String(props.label) : undefined}
        placeholder={props.placeholder ? String(props.placeholder) : undefined}
        size={props.size as 'sm' | 'md'}
        fullWidth={Boolean(props.fullWidth)}
        options={options}
        value={ctx.get('value', options[0]?.value ?? '')}
        onValueChange={(next) => ctx.set('value', next)}
      />
    );
  },
  code: (props) =>
    [
      '<Dropdown',
      props.label ? `  label=${jsxString(props.label)}` : null,
      props.placeholder && props.placeholder !== 'Select option'
        ? `  placeholder=${jsxString(props.placeholder)}`
        : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.fullWidth ? '  fullWidth' : null,
      '  options={[',
      ...parseChoices(props.options).map(
        (option) =>
          `    { value: ${JSON.stringify(option.value)}, label: ${JSON.stringify(option.label)} },`
      ),
      '  ]}',
      '  value={value}',
      '  onValueChange={setValue}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Dropdown'],
};
