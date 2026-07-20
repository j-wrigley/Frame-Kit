import {
  Button,
  Popover,
  Tag,
  ToggleRow,
  type PopoverPlacement,
  type PopoverSize,
} from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** Real prop unions from PopoverProps: size 'sm' | 'md' | 'lg' | 'auto'
 *  (PopoverSize), placement is the twelve-member PopoverPlacement union,
 *  defaultOpen boolean, offset number. */
const PLACEMENT_CHOICES = [
  { value: 'top-start', label: 'Top start' },
  { value: 'top', label: 'Top' },
  { value: 'top-end', label: 'Top end' },
  { value: 'right-start', label: 'Right start' },
  { value: 'right', label: 'Right' },
  { value: 'right-end', label: 'Right end' },
  { value: 'bottom-start', label: 'Bottom start' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom-end', label: 'Bottom end' },
  { value: 'left-start', label: 'Left start' },
  { value: 'left', label: 'Left' },
  { value: 'left-end', label: 'Left end' },
] as const;

export const popoverEntry: CatalogEntry = {
  kind: 'popover',
  label: 'Popover',
  description: 'An anchored panel trigger.',
  category: 'structure',
  short: 'PO',
  specPage: 'popover',
  options: [
    { key: 'label', label: 'Trigger label', type: 'text', defaultValue: 'Open settings' },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      choices: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'auto', label: 'Auto' },
      ],
      defaultValue: 'sm',
    },
    {
      key: 'placement',
      label: 'Placement',
      type: 'select',
      choices: PLACEMENT_CHOICES,
      defaultValue: 'bottom-start',
    },
    { key: 'offset', label: 'Offset', type: 'number', min: 0, max: 32, step: 1, defaultValue: 8 },
    { key: 'defaultOpen', label: 'Open by default', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <Popover
      trigger={
        <Button size="sm" variant="ghost" fullWidth>
          {String(props.label)}
        </Button>
      }
      panelLabel="Sidebar settings"
      size={props.size as PopoverSize}
      placement={props.placement as PopoverPlacement}
      offset={Number(props.offset)}
      defaultOpen={Boolean(props.defaultOpen)}
    >
      <Tag>Quick settings</Tag>
      <ToggleRow
        variant="compact"
        label="Snap to grid"
        checked={ctx.get('snap', true)}
        onChange={(event) => ctx.set('snap', event.target.checked)}
      />
    </Popover>
  ),
  code: (props) =>
    [
      '<Popover',
      '  trigger={',
      '    <Button size="sm" variant="ghost" fullWidth>',
      `      ${jsxText(props.label)}`,
      '    </Button>',
      '  }',
      '  panelLabel="Sidebar settings"',
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.placement !== 'bottom-start' ? `  placement="${props.placement}"` : null,
      Number(props.offset) !== 8 ? `  offset={${props.offset}}` : null,
      props.defaultOpen ? '  defaultOpen' : null,
      '>',
      '  <Tag>Quick settings</Tag>',
      '  <ToggleRow',
      '    variant="compact"',
      '    label="Snap to grid"',
      '    checked={snap}',
      '    onChange={(event) => setSnap(event.target.checked)}',
      '  />',
      '</Popover>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Popover', 'Button', 'Tag', 'ToggleRow'],
};
