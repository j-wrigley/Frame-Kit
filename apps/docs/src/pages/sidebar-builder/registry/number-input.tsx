import { NumberInput } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** NumberInputProps extends InputProps minus type/inputMode/align, so the real
 *  unions are size 'sm' | 'md' | 'lg' (InputSize), variant 'surface' | 'bare'
 *  (InputVariant), and font 'sans' | 'mono' (InputFont); the value is always
 *  end-aligned. Step buttons can be disabled individually. Parsing stays with
 *  the consumer, so the render clamps at zero like the beta baseline. */
export const numberInputEntry: CatalogEntry = {
  kind: 'number-input',
  label: 'Number input',
  description: 'Exact numeric entry with increment actions.',
  category: 'controls',
  short: 'NI',
  specPage: 'inputs',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Radius' },
    { key: 'prefix', label: 'Prefix', type: 'text', defaultValue: '' },
    { key: 'suffix', label: 'Suffix', type: 'text', defaultValue: 'PX' },
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
        { value: 'surface', label: 'Surface' },
        { value: 'bare', label: 'Bare' },
      ],
      defaultValue: 'surface',
    },
    {
      key: 'font',
      label: 'Font',
      type: 'select',
      choices: [
        { value: 'sans', label: 'Sans' },
        { value: 'mono', label: 'Mono' },
      ],
      defaultValue: 'sans',
    },
    { key: 'decrementDisabled', label: 'Disable decrease', type: 'toggle', defaultValue: false },
    { key: 'incrementDisabled', label: 'Disable increase', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => {
    const value = ctx.get('value', '24');
    const setValue = (next: string) => ctx.set('value', next);
    return (
      <NumberInput
        label={props.label ? String(props.label) : undefined}
        prefix={props.prefix ? String(props.prefix) : undefined}
        suffix={props.suffix ? String(props.suffix) : undefined}
        size={props.size as 'sm' | 'md' | 'lg'}
        variant={props.variant as 'surface' | 'bare'}
        font={props.font as 'sans' | 'mono'}
        decrementDisabled={Boolean(props.decrementDisabled)}
        incrementDisabled={Boolean(props.incrementDisabled)}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onDecrement={() => setValue(String(Math.max(0, Number(value) - 1)))}
        onIncrement={() => setValue(String(Number(value) + 1))}
      />
    );
  },
  code: (props) =>
    [
      '<NumberInput',
      props.label ? `  label=${jsxString(props.label)}` : null,
      props.prefix ? `  prefix=${jsxString(props.prefix)}` : null,
      props.suffix ? `  suffix=${jsxString(props.suffix)}` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.variant !== 'surface' ? `  variant="${props.variant}"` : null,
      props.font !== 'sans' ? `  font="${props.font}"` : null,
      props.decrementDisabled ? '  decrementDisabled' : null,
      props.incrementDisabled ? '  incrementDisabled' : null,
      '  value={value}',
      '  onChange={(event) => setValue(event.target.value)}',
      '  onDecrement={() => setValue(String(Math.max(0, Number(value) - 1)))}',
      '  onIncrement={() => setValue(String(Number(value) + 1))}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['NumberInput'],
};
