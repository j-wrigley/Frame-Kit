import {
  ColorBalanceWheels,
  type ColorBalanceDensity,
  type ColorBalanceValue,
} from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** A plausible gentle orange-and-teal starting grade for the demo. */
const DEMO_BALANCE: ColorBalanceValue = {
  shadows: { x: -0.12, y: -0.08 },
  midtones: { x: 0, y: 0 },
  highlights: { x: 0.14, y: 0.1 },
  lift: 0.98,
  gamma: 1.04,
  gain: 1.06,
};

/** Real prop union from ColorBalanceDensity: 'default' | 'compact'. The wheel
 *  captions (shadows/midtones/highlights) and level names (lift/gamma/gain) are
 *  fixed internal text; the `label` prop is accessible-only, so no text option. */
export const colorWheelsEntry: CatalogEntry = {
  kind: 'color-wheels',
  label: 'Colour balance wheels',
  description: 'Compact shadow, midtone, and highlight bias.',
  category: 'creative',
  short: 'CW',
  specPage: 'color-balance-wheels',
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
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <ColorBalanceWheels
      density={props.density as ColorBalanceDensity}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('balance', DEMO_BALANCE)}
      onValueChange={(next) => ctx.set('balance', next)}
    />
  ),
  code: (props) =>
    [
      '<ColorBalanceWheels',
      props.density !== 'default' ? `  density="${props.density}"` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={balance}',
      '  onValueChange={setBalance}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['ColorBalanceWheels'],
};
