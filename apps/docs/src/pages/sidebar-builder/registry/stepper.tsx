import { Stepper } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from StepperProps: size 'sm' | 'md' | 'lg' (StepperSize),
 *  font 'sans' | 'mono' (StepperFont), editable boolean. The label is the
 *  accessible group name; suffix is the visible unit. Parsing stays with the
 *  builder, matching the component contract. */
export const stepperEntry: CatalogEntry = {
  kind: 'stepper',
  label: 'Stepper',
  description: 'A bounded compact numeric control.',
  category: 'controls',
  short: 'ST',
  specPage: 'stepper',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Zoom' },
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
      key: 'font',
      label: 'Font',
      type: 'select',
      choices: [
        { value: 'mono', label: 'Mono' },
        { value: 'sans', label: 'Sans' },
      ],
      defaultValue: 'mono',
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'suffix', label: 'Suffix', type: 'text', defaultValue: '%' },
  ],
  render: (props, ctx) => (
    <Stepper
      label={String(props.label)}
      size={props.size as 'sm' | 'md' | 'lg'}
      font={props.font as 'sans' | 'mono'}
      editable={Boolean(props.editable)}
      suffix={String(props.suffix) || undefined}
      value={ctx.get('value', '24')}
      onChange={(event) => ctx.set('value', event.target.value)}
      onDecrement={() => ctx.set('value', String(Number(ctx.get('value', '24')) - 1))}
      onIncrement={() => ctx.set('value', String(Number(ctx.get('value', '24')) + 1))}
    />
  ),
  code: (props) => {
    const suffix = String(props.suffix);
    return [
      '<Stepper',
      props.label !== 'Stepper' ? `  label=${jsxString(props.label)}` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.font !== 'mono' ? `  font="${props.font}"` : null,
      !props.editable ? '  editable={false}' : null,
      suffix ? `  suffix=${jsxString(suffix)}` : null,
      '  value={value}',
      props.editable ? '  onChange={(event) => setValue(event.target.value)}' : null,
      '  onDecrement={() => setValue(String(Number(value) - 1))}',
      '  onIncrement={() => setValue(String(Number(value) + 1))}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n');
  },
  imports: ['Stepper'],
};
