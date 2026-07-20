import { useState } from 'react';
import {
  ContextMenu,
  type ContextMenuItem,
  CopyIcon,
  EyeOpenIcon,
  LayersIcon,
  Pencil1Icon,
  TrashIcon,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

export function ContextMenuPage() {
  const [lastAction, setLastAction] = useState('No action selected');
  const [menuOpen, setMenuOpen] = useState(false);

  const items: readonly ContextMenuItem[] = [
    {
      id: 'rename',
      label: 'Rename layer',
      icon: <Pencil1Icon />,
      shortcut: '⌘R',
      onSelect: () => setLastAction('Rename layer'),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <CopyIcon />,
      shortcut: '⌘D',
      onSelect: () => setLastAction('Duplicate'),
    },
    { type: 'separator', id: 'primary-separator' },
    {
      type: 'submenu',
      id: 'arrange',
      label: 'Arrange',
      icon: <LayersIcon />,
      items: [
        {
          id: 'forward',
          label: 'Bring forward',
          shortcut: '⌘]',
          onSelect: () => setLastAction('Bring forward'),
        },
        {
          id: 'backward',
          label: 'Send backward',
          shortcut: '⌘[',
          onSelect: () => setLastAction('Send backward'),
        },
        { type: 'separator', id: 'arrange-separator' },
        { id: 'front', label: 'Bring to front', onSelect: () => setLastAction('Bring to front') },
        { id: 'back', label: 'Send to back', onSelect: () => setLastAction('Send to back') },
      ],
    },
    {
      id: 'hide',
      label: 'Hide layer',
      icon: <EyeOpenIcon />,
      shortcut: '⌘⇧H',
      onSelect: () => setLastAction('Hide layer'),
    },
    { type: 'separator', id: 'danger-separator' },
    {
      id: 'delete',
      label: 'Delete layer',
      icon: <TrashIcon />,
      shortcut: '⌫',
      tone: 'danger',
      onSelect: () => setLastAction('Delete layer'),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Context menu"
        lede="Precise right-click actions for layers, canvas objects, and list rows. The menu combines quiet hierarchy, shortcuts, destructive intent, and a shallow nested action group without adding visual noise."
      />

      <Section title="Layer actions">
        <p className="section-intro">
          Right-click the layer below to open its actions. The same menu opens from the keyboard
          with <code>Shift</code> + <code>F10</code> or the Context Menu key, then focuses its first
          available action.
        </p>
        <div className="demo">
          <ContextMenu items={items} label="Layer actions" onOpenChange={setMenuOpen}>
            <div className="context-menu-target" tabIndex={0}>
              <span className="fk-tag">Layer</span>
              <strong>Hero illustration</strong>
              <small>{menuOpen ? 'Choose an action' : 'Right-click or press Shift + F10'}</small>
            </div>
          </ContextMenu>
          <p className="context-menu-status" role="status" aria-live="polite">
            {lastAction}
          </p>
        </div>
      </Section>

      <Section title="Hierarchy and intent">
        <p className="section-intro">
          Group related actions with separators, use a single-level submenu for compact secondary
          actions, and reserve danger styling for an irreversible operation. The content itself uses
          Inter; tags are the only mono detail.
        </p>
        <div className="context-menu-guidance">
          <div>
            <span className="fk-tag spec-label">Actions</span>
            <p>
              Use an icon only when it improves recognition, and keep shortcuts as quiet trailing
              hints.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Nested</span>
            <p>Keep submenus shallow. Arrow keys open, return from, and navigate their actions.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Danger</span>
            <p>
              Apply the danger tone only to the final destructive action, never to the whole menu.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { ContextMenu, type ContextMenuItem } from '@presentstandards/framekit-ui';

const items: readonly ContextMenuItem[] = [
  { id: 'rename', label: 'Rename layer', shortcut: '⌘R', onSelect: renameLayer },
  { type: 'separator', id: 'primary-divider' },
  {
    type: 'submenu',
    id: 'arrange',
    label: 'Arrange',
    items: [{ id: 'front', label: 'Bring to front', onSelect: bringToFront }],
  },
  { id: 'delete', label: 'Delete layer', tone: 'danger', onSelect: deleteLayer },
];

<ContextMenu items={items} label="Layer actions">
  <div tabIndex={0}>Right-click this layer</div>
</ContextMenu>`}</code>
        </pre>
      </Section>
    </>
  );
}
