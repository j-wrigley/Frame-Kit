import { Input } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from InputProps: size 'sm' | 'md' | 'lg' (InputSize),
 *  variant 'surface' | 'bare' (InputVariant), font 'sans' | 'mono' (InputFont),
 *  align 'start' | 'end' (InputAlign). Label, prefix, and suffix are the
 *  visible text slots; empty text omits the slot. */
export const inputEntry: CatalogEntry = {
  kind: 'input',
  label: 'Input',
  description: 'A labelled text value.',
  category: 'controls',
  short: 'IN',
  specPage: 'inputs',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Name' },
    { key: 'prefix', label: 'Prefix', type: 'text', defaultValue: '' },
    { key: 'suffix', label: 'Suffix', type: 'text', defaultValue: '' },
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
    {
      key: 'align',
      label: 'Align',
      type: 'select',
      choices: [
        { value: 'start', label: 'Start' },
        { value: 'end', label: 'End' },
      ],
      defaultValue: 'start',
    },
  ],
  render: (props, ctx) => (
    <Input
      label={props.label ? String(props.label) : undefined}
      prefix={props.prefix ? String(props.prefix) : undefined}
      suffix={props.suffix ? String(props.suffix) : undefined}
      size={props.size as 'sm' | 'md' | 'lg'}
      variant={props.variant as 'surface' | 'bare'}
      font={props.font as 'sans' | 'mono'}
      align={props.align as 'start' | 'end'}
      value={ctx.get('value', 'Hero card')}
      onChange={(event) => ctx.set('value', event.target.value)}
    />
  ),
  code: (props) =>
    [
      '<Input',
      props.label ? `  label=${jsxString(props.label)}` : null,
      props.prefix ? `  prefix=${jsxString(props.prefix)}` : null,
      props.suffix ? `  suffix=${jsxString(props.suffix)}` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.variant !== 'surface' ? `  variant="${props.variant}"` : null,
      props.font !== 'sans' ? `  font="${props.font}"` : null,
      props.align !== 'start' ? `  align="${props.align}"` : null,
      '  value={value}',
      '  onChange={(event) => setValue(event.target.value)}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Input'],
};
