import {
  Button,
  HoverCard,
  MagicWandIcon,
  RowActions,
  RowAddButton,
  RowInfoButton,
} from '@presentstandards/framekit-ui';
import { jsxString, jsxText, type CatalogEntry } from '../types';

/** A library row built on RowActions: the row's own button adds, the 'i'
 *  explains (HoverCard), the trailing '+' repeats the add without a second
 *  tab stop. `reserve` keeps the 'i' cell when it is off, so a list of these
 *  rows keeps its '+' column aligned. */
export const rowActionsEntry: CatalogEntry = {
  kind: 'row-actions',
  label: 'Row actions',
  description: "An item with an 'i' and a '+'.",
  category: 'structure',
  short: 'RA',
  specPage: 'row-actions',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Halftone' },
    { key: 'info', label: 'Explanation', type: 'text', defaultValue: 'Prints an image as dots.' },
    { key: 'showInfo', label: 'Show i', type: 'toggle', defaultValue: true },
    { key: 'reserve', label: 'Reserve cells', type: 'toggle', defaultValue: true },
  ],
  render: (props, ctx) => {
    const label = String(props.label);
    const add = () => ctx.set('added', ctx.get('added', 0) + 1);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 2 }}>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          iconStart={<MagicWandIcon />}
          style={{ justifyContent: 'flex-start' }}
          onClick={add}
        >
          {label}
        </Button>
        <RowActions
          reserve={Boolean(props.reserve)}
          info={
            props.showInfo ? (
              <HoverCard
                trigger={<RowInfoButton label={`About ${label}`} />}
                placement="right-start"
                offset={30}
                panelLabel={`About ${label}`}
              >
                {String(props.info)}
              </HoverCard>
            ) : undefined
          }
          add={<RowAddButton label={`Add ${label}`} tabIndex={-1} onClick={add} />}
        />
      </div>
    );
  },
  code: (props) =>
    [
      '<div className="library-row">',
      '  <Button',
      '    variant="ghost"',
      '    size="sm"',
      '    fullWidth',
      '    iconStart={<MagicWandIcon />}',
      "    style={{ justifyContent: 'flex-start' }}",
      '    onClick={add}',
      '  >',
      `    ${jsxText(props.label)}`,
      '  </Button>',
      '  <RowActions',
      props.reserve ? '    reserve' : null,
      ...(props.showInfo
        ? [
            '    info={',
            '      <HoverCard',
            `        trigger={<RowInfoButton label=${jsxString(`About ${String(props.label)}`)} />}`,
            '        placement="right-start"',
            '        offset={30}',
            `        panelLabel=${jsxString(`About ${String(props.label)}`)}`,
            '      >',
            `        ${jsxText(props.info)}`,
            '      </HoverCard>',
            '    }',
          ]
        : []),
      `    add={<RowAddButton label=${jsxString(`Add ${String(props.label)}`)} tabIndex={-1} onClick={add} />}`,
      '  />',
      '</div>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Button', 'HoverCard', 'MagicWandIcon', 'RowActions', 'RowAddButton', 'RowInfoButton'],
};
