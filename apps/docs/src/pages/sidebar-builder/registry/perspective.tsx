import {
  PerspectiveGrid,
  type PerspectiveGridDensity,
  type PerspectiveGridValue,
} from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** The component's default slightly skewed quad, reused as demo data. */
const DEMO_TRANSFORM: PerspectiveGridValue = {
  topLeft: { x: 0.11, y: 0.14 },
  topRight: { x: 0.89, y: 0.1 },
  bottomRight: { x: 0.94, y: 0.91 },
  bottomLeft: { x: 0.06, y: 0.93 },
  straighten: 0,
  horizontal: 0,
  vertical: 0,
};

/** Real prop union from PerspectiveGridDensity: 'default' | 'compact'. The slider
 *  captions (Straighten/Horizontal/Vertical) are fixed internal text; the `label`
 *  prop is accessible-only, so no text option. */
export const perspectiveEntry: CatalogEntry = {
  kind: 'perspective',
  label: 'Perspective grid',
  description: 'Corner and keystone correction.',
  category: 'creative',
  short: 'PG',
  specPage: 'perspective-transform',
  options: [
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
    { key: 'showControls', label: 'Show controls', type: 'toggle', defaultValue: true },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <PerspectiveGrid
      density={props.density as PerspectiveGridDensity}
      showControls={Boolean(props.showControls)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('transform', DEMO_TRANSFORM)}
      onValueChange={(next) => ctx.set('transform', next)}
    />
  ),
  code: (props) =>
    [
      '<PerspectiveGrid',
      props.density !== 'default' ? `  density="${props.density}"` : null,
      !props.showControls ? '  showControls={false}' : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={transform}',
      '  onValueChange={setTransform}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['PerspectiveGrid'],
};
