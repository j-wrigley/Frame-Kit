import { DropZone } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop union from DropZoneProps: size 'sm' | 'md' | 'lg' (DropZoneSize),
 *  plus disabled / busy booleans and the label / description / activeLabel /
 *  actionLabel copy slots. `icon` is a ReactNode slot and is not
 *  builder-editable. Dropping or activating the zone writes a live status
 *  label so the canvas demonstrates both callbacks. */
export const dropZoneEntry: CatalogEntry = {
  kind: 'drop-zone',
  label: 'Drop zone',
  description: 'A general target for transferred content.',
  category: 'structure',
  short: 'DZ',
  specPage: 'drop-zone',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Drop content to add' },
    { key: 'description', label: 'Description', type: 'text', defaultValue: '' },
    { key: 'activeLabel', label: 'Active label', type: 'text', defaultValue: 'Release to add' },
    { key: 'actionLabel', label: 'Action label', type: 'text', defaultValue: '' },
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
    { key: 'busy', label: 'Busy', type: 'toggle', defaultValue: false },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <DropZone
      size={props.size as 'sm' | 'md' | 'lg'}
      label={ctx.get<string | null>('status', null) ?? String(props.label)}
      description={props.description ? String(props.description) : undefined}
      activeLabel={props.activeLabel ? String(props.activeLabel) : undefined}
      actionLabel={props.actionLabel ? String(props.actionLabel) : undefined}
      busy={Boolean(props.busy)}
      disabled={Boolean(props.disabled)}
      onDrop={() => ctx.set('status', 'Payload added')}
      onAction={() => ctx.set('status', 'Source chooser ready')}
    />
  ),
  code: (props) =>
    [
      '<DropZone',
      `  label=${jsxString(props.label)}`,
      props.description ? `  description=${jsxString(props.description)}` : null,
      props.activeLabel && props.activeLabel !== 'Release to add'
        ? `  activeLabel=${jsxString(props.activeLabel)}`
        : null,
      props.actionLabel ? `  actionLabel=${jsxString(props.actionLabel)}` : null,
      props.size !== 'md' ? `  size="${props.size}"` : null,
      props.busy ? '  busy' : null,
      props.disabled ? '  disabled' : null,
      '  onDrop={(transfer) => acceptTransfer(transfer)}',
      '  onAction={() => openSourceChooser()}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['DropZone'],
};
