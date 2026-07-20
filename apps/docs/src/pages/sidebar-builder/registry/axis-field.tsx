import { AxisField } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop surface from AxisFieldProps: snapToGrid boolean (default false),
 *  gridColumns (default 13), gridRows (default 9), editable, disabled booleans.
 *  The live { x, y } value stays wired through the builder scratch state. */
export const axisFieldEntry: CatalogEntry = {
  kind: 'axis-field',
  label: 'Axis field',
  description: 'A precise two-axis value field.',
  category: 'creative',
  short: 'AF',
  specPage: 'axis-field',
  options: [
    { key: 'snapToGrid', label: 'Snap to grid', type: 'toggle', defaultValue: false },
    {
      key: 'gridColumns',
      label: 'Grid columns',
      type: 'number',
      min: 2,
      max: 25,
      step: 1,
      defaultValue: 13,
    },
    {
      key: 'gridRows',
      label: 'Grid rows',
      type: 'number',
      min: 2,
      max: 25,
      step: 1,
      defaultValue: 9,
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <AxisField
      snapToGrid={Boolean(props.snapToGrid)}
      gridColumns={Number(props.gridColumns)}
      gridRows={Number(props.gridRows)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={{ x: ctx.get('x', 0.52), y: ctx.get('y', 0.62) }}
      onValueChange={(next) => {
        ctx.set('x', next.x);
        ctx.set('y', next.y);
      }}
    />
  ),
  code: (props) =>
    [
      '<AxisField',
      props.snapToGrid ? '  snapToGrid' : null,
      Number(props.gridColumns) !== 13 ? `  gridColumns={${props.gridColumns}}` : null,
      Number(props.gridRows) !== 9 ? `  gridRows={${props.gridRows}}` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={value}',
      '  onValueChange={setValue}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['AxisField'],
};
