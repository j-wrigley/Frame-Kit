import { Button } from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** Real prop unions from ButtonProps: variant 'primary' | 'secondary' | 'ghost'
 *  | 'danger' (ButtonVariant), size 'sm' | 'md' | 'lg' (ButtonSize), loader
 *  'grid' | 'bars' | 'steps' | 'pulse' | 'orbit' | 'wave' | 'flip' | 'scan'
 *  (LoaderVariant), plus fullWidth / loading / disabled booleans.
 *  `iconStart`/`iconEnd` are ReactNode slots and are not builder-editable. */
export const buttonEntry: CatalogEntry = {
  kind: 'button',
  label: 'Button',
  description: 'A full-width sidebar action.',
  category: 'structure',
  short: 'BT',
  specPage: 'buttons',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Apply changes' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'ghost', label: 'Ghost' },
        { value: 'danger', label: 'Danger' },
      ],
      defaultValue: 'secondary',
    },
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
    { key: 'fullWidth', label: 'Full width', type: 'toggle', defaultValue: true },
    { key: 'loading', label: 'Loading', type: 'toggle', defaultValue: false },
    {
      key: 'loader',
      label: 'Loader',
      type: 'select',
      choices: [
        { value: 'grid', label: 'Grid' },
        { value: 'bars', label: 'Bars' },
        { value: 'steps', label: 'Steps' },
        { value: 'pulse', label: 'Pulse' },
        { value: 'orbit', label: 'Orbit' },
        { value: 'wave', label: 'Wave' },
        { value: 'flip', label: 'Flip' },
        { value: 'scan', label: 'Scan' },
      ],
      defaultValue: 'grid',
    },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props) => (
    <Button
      variant={props.variant as 'primary' | 'secondary' | 'ghost' | 'danger'}
      size={props.size as 'sm' | 'md' | 'lg'}
      fullWidth={Boolean(props.fullWidth)}
      loading={Boolean(props.loading)}
      loader={
        props.loader as 'grid' | 'bars' | 'steps' | 'pulse' | 'orbit' | 'wave' | 'flip' | 'scan'
      }
      disabled={Boolean(props.disabled)}
    >
      {String(props.label)}
    </Button>
  ),
  code: (props) => {
    const attrs = [
      props.variant !== 'secondary' ? ` variant="${props.variant}"` : '',
      props.size !== 'md' ? ` size="${props.size}"` : '',
      props.fullWidth ? ' fullWidth' : '',
      props.loading ? ' loading' : '',
      props.loader !== 'grid' ? ` loader="${props.loader}"` : '',
      props.disabled ? ' disabled' : '',
    ].join('');
    return `<Button${attrs}>${jsxText(props.label)}</Button>`;
  },
  imports: ['Button'],
};
