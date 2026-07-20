import { Loader } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions from LoaderProps: variant 'grid' | 'bars' | 'steps' |
 *  'pulse' | 'orbit' | 'wave' | 'flip' | 'scan' (LoaderVariant), size 'sm' |
 *  'md' | 'lg' (LoaderSize). `label` is the accessible status label; `text` is
 *  the visible supporting copy composed beside the indicator (inline styles so
 *  the emitted JSX is portable). */
export const loaderEntry: CatalogEntry = {
  kind: 'loader',
  label: 'Loader',
  description: 'A compact progress state with supporting text.',
  category: 'structure',
  short: 'LD',
  specPage: 'loader',
  options: [
    { key: 'text', label: 'Text', type: 'text', defaultValue: 'Processing selection' },
    {
      key: 'variant',
      label: 'Variant',
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
    { key: 'label', label: 'Status label', type: 'text', defaultValue: 'Processing' },
  ],
  render: (props) => {
    const loader = (
      <Loader
        variant={
          props.variant as 'grid' | 'bars' | 'steps' | 'pulse' | 'orbit' | 'wave' | 'flip' | 'scan'
        }
        size={props.size as 'sm' | 'md' | 'lg'}
        label={props.label ? String(props.label) : undefined}
      />
    );
    if (!props.text) return loader;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fk-space-2)' }}>
        {loader}
        <span style={{ color: 'var(--fk-text-secondary)', fontSize: 'var(--fk-fs-1)' }}>
          {String(props.text)}
        </span>
      </div>
    );
  },
  code: (props) => {
    const loader =
      '<Loader' +
      (props.variant !== 'grid' ? ` variant="${props.variant}"` : '') +
      (props.size !== 'md' ? ` size="${props.size}"` : '') +
      (props.label ? ` label=${jsxString(props.label)}` : '') +
      ' />';
    if (!props.text) return loader;
    return [
      "<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fk-space-2)' }}>",
      '  ' + loader,
      "  <span style={{ color: 'var(--fk-text-secondary)', fontSize: 'var(--fk-fs-1)' }}>" +
        String(props.text) +
        '</span>',
      '</div>',
    ].join('\n');
  },
  imports: ['Loader'],
};
