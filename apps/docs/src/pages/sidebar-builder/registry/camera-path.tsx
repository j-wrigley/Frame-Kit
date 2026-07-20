import { CameraPath } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop surface from CameraPathProps: snapToGrid/editable/disabled
 *  booleans plus numeric gridColumns (default 9) and gridRows (default 5),
 *  both floored at two by the component. Waypoints and the active selection
 *  stay live through ctx; `label` is aria-only. */
export const cameraPathEntry: CatalogEntry = {
  kind: 'camera-path',
  label: 'Camera path',
  description: 'Spatial camera waypoint editing.',
  category: 'creative',
  short: 'CP',
  specPage: 'camera-path',
  options: [
    { key: 'snapToGrid', label: 'Snap to grid', type: 'toggle', defaultValue: false },
    {
      key: 'gridColumns',
      label: 'Grid columns',
      type: 'number',
      min: 2,
      max: 24,
      step: 1,
      defaultValue: 9,
    },
    { key: 'gridRows', label: 'Grid rows', type: 'number', min: 2, max: 24, step: 1, defaultValue: 5 },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <CameraPath
      snapToGrid={Boolean(props.snapToGrid)}
      gridColumns={Number(props.gridColumns)}
      gridRows={Number(props.gridRows)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('waypoints', [
        { x: 0.08, y: 0.82 },
        { x: 0.48, y: 0.5 },
        { x: 0.9, y: 0.22 },
      ])}
      onValueChange={(next) => ctx.set('waypoints', next)}
      activeIndex={ctx.get('activeWaypoint', 0)}
      onActiveIndexChange={(next) => ctx.set('activeWaypoint', next)}
    />
  ),
  code: (props) =>
    [
      '<CameraPath',
      props.snapToGrid ? '  snapToGrid' : null,
      Number(props.gridColumns) !== 9 ? `  gridColumns={${props.gridColumns}}` : null,
      Number(props.gridRows) !== 5 ? `  gridRows={${props.gridRows}}` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={waypoints}',
      '  onValueChange={setWaypoints}',
      '  activeIndex={activeIndex}',
      '  onActiveIndexChange={setActiveIndex}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['CameraPath'],
};
