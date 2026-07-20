import {
  Button,
  HoverCard,
  Tag,
  type HoverCardSize,
  type OverlayPlacement,
} from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** Real prop unions from HoverCardProps: size 'sm' | 'md' | 'lg'
 *  (HoverCardSize), placement is the twelve-member OverlayPlacement union,
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

export const hoverCardEntry: CatalogEntry = {
  kind: 'hover-card',
  label: 'Hover card',
  description: 'A richer optional preview on hover or focus.',
  category: 'structure',
  short: 'HC',
  specPage: 'hover-cards-tooltips',
  options: [
    { key: 'label', label: 'Trigger label', type: 'text', defaultValue: 'Preview layer' },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      choices: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
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
  render: (props) => (
    <HoverCard
      trigger={
        <Button size="sm" variant="ghost" fullWidth>
          {String(props.label)}
        </Button>
      }
      panelLabel="Layer preview"
      size={props.size as HoverCardSize}
      placement={props.placement as OverlayPlacement}
      offset={Number(props.offset)}
      defaultOpen={Boolean(props.defaultOpen)}
    >
      <Tag>Hero layer</Tag>
      <span>Shape · 1280 × 720</span>
    </HoverCard>
  ),
  code: (props) =>
    [
      '<HoverCard',
      '  trigger={',
      '    <Button size="sm" variant="ghost" fullWidth>',
      `      ${jsxText(props.label)}`,
      '    </Button>',
      '  }',
      '  panelLabel="Layer preview"',
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.placement !== 'bottom-start' ? `  placement="${props.placement}"` : null,
      Number(props.offset) !== 8 ? `  offset={${props.offset}}` : null,
      props.defaultOpen ? '  defaultOpen' : null,
      '>',
      '  <Tag>Hero layer</Tag>',
      '  <span>Shape · 1280 × 720</span>',
      '</HoverCard>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['HoverCard', 'Button', 'Tag'],
};
