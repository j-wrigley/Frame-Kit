import { SpringResponse } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop unions from SpringResponseProps: density 'default' | 'compact'
 *  (SpringResponseDensity), plus showControls/showSummary/showAxis/editable/
 *  disabled booleans.
 *  Physical spring values stay live through ctx; `label` is aria-only. */
export const springEntry: CatalogEntry = {
  kind: 'spring',
  label: 'Spring response',
  description: 'A compact live settling graph.',
  category: 'creative',
  short: 'SR',
  specPage: 'spring-response',
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
    { key: 'showControls', label: 'Show controls', type: 'toggle', defaultValue: false },
    { key: 'showSummary', label: 'Show summary', type: 'toggle', defaultValue: true },
    { key: 'showAxis', label: 'Show axis', type: 'toggle', defaultValue: true },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <SpringResponse
      density={props.density as 'default' | 'compact'}
      showControls={Boolean(props.showControls)}
      showSummary={Boolean(props.showSummary)}
      showAxis={Boolean(props.showAxis)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('spring', { mass: 1, stiffness: 170, damping: 18, velocity: 0 })}
      onValueChange={(next) => ctx.set('spring', next)}
    />
  ),
  code: (props) =>
    [
      '<SpringResponse',
      props.density !== 'default' ? `  density="${props.density}"` : null,
      !props.showControls ? '  showControls={false}' : null,
      !props.showSummary ? '  showSummary={false}' : null,
      !props.showAxis ? '  showAxis={false}' : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={spring}',
      '  onValueChange={setSpring}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['SpringResponse'],
};
