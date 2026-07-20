import { jsxString, type CatalogEntry } from '../types';

/** Container node — children render inside a real Disclosure on the canvas.
 *  The builder owns the Disclosure composition (see SidebarBuilderPage), so
 *  this entry only declares options and the code template. */
export const disclosureEntry: CatalogEntry = {
  kind: 'disclosure',
  label: 'Dropdown section',
  description: 'A collapsible destination for any other element.',
  category: 'structure',
  short: 'DD',
  container: true,
  specPage: 'dropdowns',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Section' },
    { key: 'defaultOpen', label: 'Open by default', type: 'toggle', defaultValue: true },
  ],
  // Containers are rendered by the canvas itself (children live inside);
  // render/code here cover the standalone empty shell for completeness.
  render: () => null,
  code: (props) =>
    [
      `<Disclosure label=${jsxString(props.label)}${props.defaultOpen ? ' defaultOpen' : ''}>`,
      '  {/* children */}',
      '</Disclosure>',
    ].join('\n'),
  imports: ['Disclosure'],
};
