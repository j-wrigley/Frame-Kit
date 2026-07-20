import { GradientEditor } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from GradientEditorProps: density 'default' | 'compact'
 *  (GradientEditorDensity), showActions, editable, disabled booleans. Stops stay
 *  uncontrolled (built-in three-colour, two-opacity sample); the active-segment
 *  midpoint is wired live through the builder scratch state. */
export const gradientEntry: CatalogEntry = {
  kind: 'gradient',
  label: 'Gradient editor',
  description: 'Colour and opacity stop editing.',
  category: 'creative',
  short: 'GE',
  specPage: 'gradient-editor',
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
    { key: 'showActions', label: 'Show actions', type: 'toggle', defaultValue: true },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <GradientEditor
      density={props.density as 'default' | 'compact'}
      showActions={Boolean(props.showActions)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      midpoint={ctx.get('midpoint', 0.5)}
      onMidpointChange={(next) => ctx.set('midpoint', next)}
    />
  ),
  code: (props) =>
    [
      '<GradientEditor',
      props.density !== 'default' ? `  density="${props.density}"` : null,
      !props.showActions ? '  showActions={false}' : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  midpoint={midpoint}',
      '  onMidpointChange={setMidpoint}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['GradientEditor'],
};
