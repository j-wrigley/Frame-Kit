import { SearchField } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from SearchFieldProps: size 'sm' | 'md' | 'lg' (InputSize),
 *  variant 'surface' | 'bare' (InputVariant). `icon` is a ReactNode slot and is
 *  not builder-editable. The field has no visible label, so the render always
 *  supplies an aria-label. */
export const searchEntry: CatalogEntry = {
  kind: 'search',
  label: 'Search field',
  description: 'Filter layers, tools, or assets.',
  category: 'controls',
  short: 'SF',
  specPage: 'inputs',
  options: [
    { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Search layers' },
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
  ],
  render: (props, ctx) => (
    <SearchField
      aria-label="Search sidebar"
      placeholder={props.placeholder ? String(props.placeholder) : undefined}
      size={props.size as 'sm' | 'md' | 'lg'}
      variant={props.variant as 'surface' | 'bare'}
      value={ctx.get('value', '')}
      onChange={(event) => ctx.set('value', event.target.value)}
    />
  ),
  code: (props) =>
    [
      '<SearchField',
      '  aria-label="Search sidebar"',
      props.placeholder ? `  placeholder=${jsxString(props.placeholder)}` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.variant !== 'surface' ? `  variant="${props.variant}"` : null,
      '  value={query}',
      '  onChange={(event) => setQuery(event.target.value)}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['SearchField'],
};
