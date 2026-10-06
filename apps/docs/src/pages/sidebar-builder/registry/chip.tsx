import { Chip } from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** Real prop union from ChipProps: size 'sm' | 'md' (ChipSize), plus the
 *  mono boolean. `toggle` is builder-only: on, the chip carries `pressed`
 *  (a toggle chip, kept live through ctx); off, it is an action chip. */
export const chipEntry: CatalogEntry = {
  kind: 'chip',
  label: 'Chip',
  description: 'A one-word token or mode.',
  category: 'controls',
  short: 'CH',
  specPage: 'chip',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Auto' },
    { key: 'toggle', label: 'Toggle', type: 'toggle', defaultValue: true },
    {
      key: 'size',
      label: 'Size',
      type: 'select',
      choices: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
      ],
      defaultValue: 'sm',
    },
    { key: 'mono', label: 'Mono', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => {
    const pressed = ctx.get('pressed', true);
    return (
      <Chip
        size={props.size as 'sm' | 'md'}
        mono={Boolean(props.mono)}
        pressed={props.toggle ? pressed : undefined}
        onClick={props.toggle ? () => ctx.set('pressed', !pressed) : undefined}
      >
        {String(props.label)}
      </Chip>
    );
  },
  code: (props) => {
    const attrs = [
      props.size !== 'sm' ? ` size="${props.size}"` : '',
      props.mono ? ' mono' : '',
      props.toggle ? ' pressed={pressed} onClick={() => setPressed(!pressed)}' : '',
    ].join('');
    return `<Chip${attrs}>${jsxText(props.label)}</Chip>`;
  },
  imports: ['Chip'],
};
