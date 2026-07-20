import { InlineRename } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** InlineRenameProps has no size/variant unions — its public visual surface is
 *  the name value, `meta` detail, `placeholder`, and `disabled`. `icon` is a
 *  ReactNode slot and is not builder-editable. The name stays live: clicking
 *  the row edits in place and commits into the node's scratch state. */
export const inlineRenameEntry: CatalogEntry = {
  kind: 'inline-rename',
  label: 'Inline rename',
  description: 'Rename an item directly in its row.',
  category: 'controls',
  short: 'IR',
  specPage: 'inputs',
  options: [
    { key: 'value', label: 'Name', type: 'text', defaultValue: 'Hero layer' },
    { key: 'meta', label: 'Meta', type: 'text', defaultValue: 'Shape' },
    { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Untitled' },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <InlineRename
      value={ctx.get('name', String(props.value))}
      onCommit={(next) => ctx.set('name', next)}
      meta={props.meta ? String(props.meta) : undefined}
      placeholder={String(props.placeholder)}
      disabled={Boolean(props.disabled)}
    />
  ),
  code: (props) =>
    [
      '<InlineRename',
      '  value={name}',
      '  onCommit={setName}',
      props.meta ? `  meta=${jsxString(props.meta)}` : null,
      props.placeholder !== 'Untitled' ? `  placeholder=${jsxString(props.placeholder)}` : null,
      props.disabled ? '  disabled' : null,
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['InlineRename'],
};
