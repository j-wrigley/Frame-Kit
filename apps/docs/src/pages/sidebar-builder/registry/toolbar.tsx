import {
  Button,
  GridIcon,
  MoveIcon,
  Pencil1Icon,
  Toolbar,
  ToolbarSeparator,
} from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from ToolbarProps: orientation 'horizontal' | 'vertical'
 *  (ToolbarOrientation), variant 'solid' | 'ghost' (ToolbarVariant), size
 *  'compact' | 'large' (ToolbarSize). The separator toggle inserts the public
 *  ToolbarSeparator sub-component (rotated to match a vertical toolbar).
 *  ToolbarGroup needs a trigger element + flyout children and is not
 *  builder-editable. */
export const toolbarEntry: CatalogEntry = {
  kind: 'toolbar',
  label: 'Toolbar',
  description: 'A compact set of tool actions.',
  category: 'structure',
  short: 'TB',
  specPage: 'toolbar',
  options: [
    {
      key: 'orientation',
      label: 'Orientation',
      type: 'select',
      choices: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
      defaultValue: 'horizontal',
    },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'solid', label: 'Solid' },
        { value: 'ghost', label: 'Ghost' },
      ],
      defaultValue: 'solid',
    },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      choices: [
        { value: 'compact', label: 'Compact' },
        { value: 'large', label: 'Large' },
      ],
      defaultValue: 'compact',
    },
    { key: 'separator', label: 'Separator', type: 'toggle', defaultValue: false },
  ],
  render: (props) => (
    <Toolbar
      orientation={props.orientation as 'horizontal' | 'vertical'}
      variant={props.variant as 'solid' | 'ghost'}
      size={props.size as 'compact' | 'large'}
      aria-label="Sidebar tools"
    >
      <Button variant="ghost" size="sm" iconStart={<MoveIcon />} aria-label="Move" />
      <Button variant="ghost" size="sm" iconStart={<Pencil1Icon />} aria-label="Draw" />
      {Boolean(props.separator) && (
        <ToolbarSeparator
          orientation={props.orientation === 'vertical' ? 'horizontal' : 'vertical'}
        />
      )}
      <Button variant="ghost" size="sm" iconStart={<GridIcon />} aria-label="Grid" />
    </Toolbar>
  ),
  code: (props) =>
    [
      '<Toolbar' +
        (props.orientation !== 'horizontal' ? ` orientation="${props.orientation}"` : '') +
        (props.variant !== 'solid' ? ` variant="${props.variant}"` : '') +
        (props.size !== 'compact' ? ` size="${props.size}"` : '') +
        ' aria-label="Sidebar tools">',
      '  <Button variant="ghost" size="sm" iconStart={<MoveIcon />} aria-label="Move" />',
      '  <Button variant="ghost" size="sm" iconStart={<Pencil1Icon />} aria-label="Draw" />',
      props.separator
        ? props.orientation === 'vertical'
          ? '  <ToolbarSeparator orientation="horizontal" />'
          : '  <ToolbarSeparator />'
        : null,
      '  <Button variant="ghost" size="sm" iconStart={<GridIcon />} aria-label="Grid" />',
      '</Toolbar>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Toolbar', 'ToolbarSeparator', 'Button', 'MoveIcon', 'Pencil1Icon', 'GridIcon'],
};
