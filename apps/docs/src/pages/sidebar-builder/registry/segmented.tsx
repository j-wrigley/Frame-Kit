import { SegmentedSwitch } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from SegmentedSwitchProps: size 'sm' | 'md'
 *  (SegmentedSwitchSize), fullWidth boolean. Segment labels are the visible
 *  text, edited as a comma-separated list; values are derived slugs.
 *  Per-option `disabled` is item data and is not builder-editable. */

function parseSegments(raw: unknown) {
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

export const segmentedEntry: CatalogEntry = {
  kind: 'segmented',
  label: 'Segmented switch',
  description: 'A small mutually exclusive mode choice.',
  category: 'controls',
  short: 'SG',
  specPage: 'segmented-switch',
  options: [
    { key: 'options', label: 'Options (comma separated)', type: 'text', defaultValue: 'Fill, Fit, Crop' },
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
    const options = parseSegments(props.options);
    return (
      <SegmentedSwitch
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
      '<SegmentedSwitch',
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.fullWidth ? '  fullWidth' : null,
      '  options={[',
      ...parseSegments(props.options).map(
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
  imports: ['SegmentedSwitch'],
};
