import { Button, Tooltip, type OverlayPlacement } from '@presentstandards/framekit-ui';
import { jsxText, jsxString, type CatalogEntry } from '../types';

/** Real prop unions from TooltipProps: placement is the twelve-member
 *  OverlayPlacement union; defaultOpen boolean, offset number. Content and
 *  the trigger label are builder-editable. */
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

export const tooltipEntry: CatalogEntry = {
  kind: 'tooltip',
  label: 'Tooltip',
  description: 'Concise helper text on focus or hover.',
  category: 'structure',
  short: 'TT',
  specPage: 'hover-cards-tooltips',
  options: [
    { key: 'label', label: 'Trigger label', type: 'text', defaultValue: 'Hover for help' },
    {
      key: 'content',
      label: 'Content',
      type: 'text',
      defaultValue: 'Toggle the selected layer visibility',
    },
    {
      key: 'placement',
      label: 'Placement',
      type: 'select',
      choices: PLACEMENT_CHOICES,
      defaultValue: 'top',
    },
    { key: 'offset', label: 'Offset', type: 'number', min: 0, max: 32, step: 1, defaultValue: 6 },
    { key: 'defaultOpen', label: 'Open by default', type: 'toggle', defaultValue: false },
  ],
  render: (props) => (
    <Tooltip
      content={String(props.content)}
      placement={props.placement as OverlayPlacement}
      offset={Number(props.offset)}
      defaultOpen={Boolean(props.defaultOpen)}
    >
      <Button size="sm" variant="ghost" fullWidth>
        {String(props.label)}
      </Button>
    </Tooltip>
  ),
  code: (props) =>
    [
      '<Tooltip',
      `  content=${jsxString(props.content)}`,
      props.placement !== 'top' ? `  placement="${props.placement}"` : null,
      Number(props.offset) !== 6 ? `  offset={${props.offset}}` : null,
      props.defaultOpen ? '  defaultOpen' : null,
      '>',
      '  <Button size="sm" variant="ghost" fullWidth>',
      `    ${jsxText(props.label)}`,
      '  </Button>',
      '</Tooltip>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Tooltip', 'Button'],
};
