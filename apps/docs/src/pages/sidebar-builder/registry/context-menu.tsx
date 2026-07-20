import { Button, ContextMenu } from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** ContextMenuProps exposes no size or variant unions — items carry the only
 *  visual treatments (tone 'default' | 'danger', separators, shortcuts), shown
 *  here with a compact three-item layer menu. The target label is editable. */
export const contextMenuEntry: CatalogEntry = {
  kind: 'context-menu',
  label: 'Context menu',
  description: 'A right-click action surface.',
  category: 'structure',
  short: 'CM',
  specPage: 'context-menu',
  options: [
    { key: 'label', label: 'Target label', type: 'text', defaultValue: 'Right-click layer actions' },
  ],
  render: (props) => (
    <ContextMenu
      label="Layer actions"
      items={[
        { id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
        { type: 'separator', id: 'divider' },
        { id: 'remove', label: 'Remove', tone: 'danger' },
      ]}
    >
      <Button size="sm" variant="ghost" fullWidth>
        {String(props.label)}
      </Button>
    </ContextMenu>
  ),
  code: (props) =>
    [
      '<ContextMenu',
      '  label="Layer actions"',
      '  items={[',
      "    { id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },",
      "    { type: 'separator', id: 'divider' },",
      "    { id: 'remove', label: 'Remove', tone: 'danger' },",
      '  ]}',
      '>',
      '  <Button size="sm" variant="ghost" fullWidth>',
      `    ${jsxText(props.label)}`,
      '  </Button>',
      '</ContextMenu>',
    ].join('\n'),
  imports: ['ContextMenu', 'Button'],
};
