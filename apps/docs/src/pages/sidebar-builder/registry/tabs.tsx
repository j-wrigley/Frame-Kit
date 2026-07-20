import { Tabs } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from TabsProps: variant 'underline' | 'contained' | 'soft'
 *  (TabsVariant), size 'sm' | 'md' (TabsSize), activationMode 'automatic' |
 *  'manual' (TabsActivationMode), fullWidth boolean. Tab labels are the
 *  visible text, edited as a comma-separated list; values are derived slugs.
 *  Per-item `icon`, `meta`, `content`, and `disabled` are item data and are
 *  not builder-editable. */

function parseItems(raw: unknown) {
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

export const tabsEntry: CatalogEntry = {
  kind: 'tabs',
  label: 'Tabs',
  description: 'Switch between related sidebar views.',
  category: 'controls',
  short: 'TS',
  specPage: 'tabs',
  options: [
    { key: 'items', label: 'Tabs (comma separated)', type: 'text', defaultValue: 'Edit, Mask, FX' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'underline', label: 'Underline' },
        { value: 'contained', label: 'Contained' },
        { value: 'soft', label: 'Soft' },
      ],
      defaultValue: 'underline',
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
    { key: 'fullWidth', label: 'Full width', type: 'toggle', defaultValue: true },
    {
      key: 'activationMode',
      label: 'Activation',
      type: 'select',
      choices: [
        { value: 'automatic', label: 'Automatic' },
        { value: 'manual', label: 'Manual' },
      ],
      defaultValue: 'automatic',
    },
  ],
  render: (props, ctx) => {
    const items = parseItems(props.items);
    return (
      <Tabs
        variant={props.variant as 'underline' | 'contained' | 'soft'}
        size={props.size as 'sm' | 'md'}
        fullWidth={Boolean(props.fullWidth)}
        activationMode={props.activationMode as 'automatic' | 'manual'}
        items={items}
        value={ctx.get('value', items[0]?.value ?? '')}
        onValueChange={(next) => ctx.set('value', next)}
      />
    );
  },
  code: (props) =>
    [
      '<Tabs',
      props.variant !== 'underline' ? `  variant="${props.variant}"` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.fullWidth ? '  fullWidth' : null,
      props.activationMode !== 'automatic' ? `  activationMode="${props.activationMode}"` : null,
      '  items={[',
      ...parseItems(props.items).map(
        (item) => `    { value: ${JSON.stringify(item.value)}, label: ${JSON.stringify(item.label)} },`
      ),
      '  ]}',
      '  value={tab}',
      '  onValueChange={setTab}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Tabs'],
};
