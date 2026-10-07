import { Combobox } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from ComboboxProps: size 'sm' | 'md' (ComboboxSize),
 *  font 'sans' | 'mono' (ComboboxFont), fullWidth boolean. Suggestions are
 *  edited as a comma-separated list of string values; the builder uses the
 *  default string parse/format (trimmed text, empty is invalid). */

function parseSuggestions(raw: unknown) {
  return [
    ...new Set(
      String(raw)
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    ),
  ];
}

export const comboboxEntry: CatalogEntry = {
  kind: 'combobox',
  label: 'Combobox',
  description: 'A typed value with suggestions.',
  category: 'controls',
  short: 'CB',
  specPage: 'combobox',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Zoom' },
    {
      key: 'suggestions',
      label: 'Suggestions (comma separated)',
      type: 'text',
      defaultValue: '50%, 100%, 200%, Fit',
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
      key: 'font',
      label: 'Font',
      type: 'select',
      choices: [
        { value: 'sans', label: 'Sans' },
        { value: 'mono', label: 'Mono' },
      ],
      defaultValue: 'sans',
    },
    { key: 'fullWidth', label: 'Full width', type: 'toggle', defaultValue: true },
  ],
  render: (props, ctx) => {
    const suggestions = parseSuggestions(props.suggestions);
    return (
      <Combobox
        label={props.label ? String(props.label) : undefined}
        size={props.size as 'sm' | 'md'}
        font={props.font as 'sans' | 'mono'}
        fullWidth={Boolean(props.fullWidth)}
        options={suggestions.map((value) => ({ value }))}
        value={ctx.get('value', suggestions[1] ?? suggestions[0] ?? '')}
        onCommit={(next) => {
          if (next !== null) ctx.set('value', next);
        }}
      />
    );
  },
  code: (props) =>
    [
      '<Combobox',
      props.label ? `  label=${jsxString(props.label)}` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.font !== 'sans' ? `  font="${props.font}"` : null,
      props.fullWidth ? '  fullWidth' : null,
      `  options={${JSON.stringify(parseSuggestions(props.suggestions).map((value) => ({ value })))}}`,
      '  value={value}',
      '  onCommit={(next) => next !== null && setValue(next)}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Combobox'],
};
