import {
  OrbitDial,
  type OrbitDialSize,
  type OrbitDialValue,
  type OrbitDialVariant,
} from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** The component's default orbit, reused as demo data. */
const DEMO_ORBIT: OrbitDialValue = { yaw: 42, elevation: 18 };

/** Real prop unions from OrbitDialProps: size 'sm' | 'md' | 'lg' (OrbitDialSize),
 *  variant 'camera' | 'light' (OrbitDialVariant). yawLabel and elevationLabel are
 *  displayed in the centre readout, so both are builder-editable. */
export const orbitEntry: CatalogEntry = {
  kind: 'orbit',
  label: 'Orbit dial',
  description: 'Yaw and elevation direction control.',
  category: 'creative',
  short: 'OD',
  specPage: 'orbit-dial',
  options: [
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
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'camera', label: 'Camera' },
        { value: 'light', label: 'Light' },
      ],
      defaultValue: 'camera',
    },
    { key: 'yawLabel', label: 'Yaw label', type: 'text', defaultValue: 'Yaw' },
    { key: 'elevationLabel', label: 'Elevation label', type: 'text', defaultValue: 'Elevation' },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <OrbitDial
      size={props.size as OrbitDialSize}
      variant={props.variant as OrbitDialVariant}
      yawLabel={String(props.yawLabel)}
      elevationLabel={String(props.elevationLabel)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('orbit', DEMO_ORBIT)}
      onValueChange={(next) => ctx.set('orbit', next)}
    />
  ),
  code: (props) =>
    [
      '<OrbitDial',
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.variant !== 'camera' ? `  variant="${props.variant}"` : null,
      props.yawLabel !== 'Yaw' ? `  yawLabel=${jsxString(props.yawLabel)}` : null,
      props.elevationLabel !== 'Elevation'
        ? `  elevationLabel=${jsxString(props.elevationLabel)}`
        : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={orbit}',
      '  onValueChange={setOrbit}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['OrbitDial'],
};
