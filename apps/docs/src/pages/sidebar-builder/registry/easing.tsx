import { EasingGraph } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop surface from EasingGraphProps: editable and disabled booleans.
 *  The cubic-bezier curve stays live through ctx; `label` is aria-only, so
 *  there is no visible-label option. */
export const easingEntry: CatalogEntry = {
  kind: 'easing',
  label: 'Easing graph',
  description: 'Direct cubic-bezier shaping.',
  category: 'creative',
  short: 'EG',
  specPage: 'easing-graph',
  options: [
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <EasingGraph
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('curve', { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 })}
      onValueChange={(next) => ctx.set('curve', next)}
    />
  ),
  code: (props) =>
    [
      '<EasingGraph',
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={curve}',
      '  onValueChange={setCurve}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['EasingGraph'],
};
