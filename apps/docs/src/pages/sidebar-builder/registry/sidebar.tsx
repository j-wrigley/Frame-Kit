import { Sidebar, SidebarSection, Slider } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from SidebarProps: variant 'panel' | 'docked' | 'floating'
 *  (SidebarVariant), side 'left' | 'right' (SidebarSide), density
 *  'default' | 'compact' (SidebarDensity), draggable boolean. Width is fixed
 *  to 100% so the shell fits the narrow canvas. */
export const sidebarEntry: CatalogEntry = {
  kind: 'sidebar',
  label: 'Sidebar',
  description: 'A panel, docked, or floating inspector shell.',
  category: 'structure',
  short: 'SB',
  specPage: 'simple-sidebar',
  options: [
    { key: 'title', label: 'Title', type: 'text', defaultValue: 'Mini inspector' },
    { key: 'eyebrow', label: 'Eyebrow', type: 'text', defaultValue: 'Panel' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'panel', label: 'Panel' },
        { value: 'docked', label: 'Docked' },
        { value: 'floating', label: 'Floating' },
      ],
      defaultValue: 'panel',
    },
    {
      key: 'side',
      label: 'Docked side',
      type: 'select',
      choices: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    },
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      choices: [
        { value: 'default', label: 'Default' },
        { value: 'compact', label: 'Compact' },
      ],
      defaultValue: 'compact',
    },
    { key: 'draggable', label: 'Drag handle (floating)', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <Sidebar
      variant={props.variant as 'panel' | 'docked' | 'floating'}
      side={props.side as 'left' | 'right'}
      density={props.density as 'default' | 'compact'}
      width="100%"
      eyebrow={String(props.eyebrow) || undefined}
      title={String(props.title)}
      draggable={Boolean(props.draggable)}
    >
      <SidebarSection label="Appearance">
        <Slider
          size="sm"
          label="Opacity"
          value={ctx.get('value', 64)}
          onValueChange={(next) => ctx.set('value', next)}
        />
      </SidebarSection>
    </Sidebar>
  ),
  code: (props) =>
    [
      '<Sidebar',
      props.variant !== 'panel' ? `  variant="${props.variant}"` : null,
      props.side !== 'left' ? `  side="${props.side}"` : null,
      props.density !== 'default' ? `  density="${props.density}"` : null,
      '  width="100%"',
      String(props.eyebrow) ? `  eyebrow=${jsxString(props.eyebrow)}` : null,
      `  title=${jsxString(props.title)}`,
      props.draggable ? '  draggable' : null,
      '>',
      '  <SidebarSection label="Appearance">',
      '    <Slider size="sm" label="Opacity" value={value} onValueChange={setValue} />',
      '  </SidebarSection>',
      '</Sidebar>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Sidebar', 'SidebarSection', 'Slider'],
};
