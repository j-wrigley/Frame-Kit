import { FieldNote } from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** Real prop union from FieldNoteTone: 'default' | 'danger'. */
export const fieldNoteEntry: CatalogEntry = {
  kind: 'field-note',
  label: 'Field note',
  description: 'A one-line readout under a row.',
  category: 'controls',
  short: 'FN',
  specPage: 'field-note',
  options: [
    { key: 'label', label: 'Text', type: 'text', defaultValue: '3840×2160 · HEVC · ~42 MB' },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      choices: [
        { value: 'default', label: 'Default' },
        { value: 'danger', label: 'Danger' },
      ],
      defaultValue: 'default',
    },
  ],
  render: (props) => (
    <FieldNote tone={props.tone as 'default' | 'danger'}>{String(props.label)}</FieldNote>
  ),
  code: (props) =>
    `<FieldNote${props.tone !== 'default' ? ` tone="${props.tone}"` : ''}>${jsxText(props.label)}</FieldNote>`,
  imports: ['FieldNote'],
};
