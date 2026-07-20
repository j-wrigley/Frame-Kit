import { Tag } from '@presentstandards/framekit-ui';
import { jsxText, type CatalogEntry } from '../types';

/** Real prop union from TagTone: 'tertiary' | 'secondary' | 'primary' | 'accent'. */
export const tagEntry: CatalogEntry = {
  kind: 'tag',
  label: 'Section label',
  description: 'A compact Office Pro category label.',
  category: 'structure',
  short: 'TG',
  specPage: 'colors',
  options: [
    { key: 'label', label: 'Text', type: 'text', defaultValue: 'Properties' },
    {
      key: 'tone',
      label: 'Tone',
      type: 'select',
      choices: [
        { value: 'tertiary', label: 'Tertiary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'primary', label: 'Primary' },
        { value: 'accent', label: 'Accent' },
      ],
      defaultValue: 'secondary',
    },
  ],
  render: (props) => (
    <Tag tone={props.tone as 'tertiary' | 'secondary' | 'primary' | 'accent'}>
      {String(props.label)}
    </Tag>
  ),
  code: (props) =>
    `<Tag${props.tone !== 'tertiary' ? ` tone="${props.tone}"` : ''}>${jsxText(props.label)}</Tag>`,
  imports: ['Tag'],
};
