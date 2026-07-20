import { EyeOpenIcon, LayerRow, LayersIcon, TrashIcon } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop union from LayerRowProps: variant 'layer' | 'preset'
 *  (LayerRowVariant), plus selected / disabled booleans. The icon slot follows
 *  the variant — the layer treatment is icon-led (LayersIcon), the preset
 *  treatment is text-led with no icon, per the component doc. The actions
 *  toggle adds the documented visibility + danger delete pair. Clicking the
 *  row toggles live selection on the canvas. */
export const layerRowEntry: CatalogEntry = {
  kind: 'layer-row',
  label: 'Layer row',
  description: 'A selected layer with metadata.',
  category: 'structure',
  short: 'LR',
  specPage: 'layer-rows',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Hero layer' },
    { key: 'meta', label: 'Meta', type: 'text', defaultValue: 'Shape' },
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'layer', label: 'Layer' },
        { value: 'preset', label: 'Preset' },
      ],
      defaultValue: 'layer',
    },
    { key: 'selected', label: 'Selected', type: 'toggle', defaultValue: true },
    { key: 'actions', label: 'Show actions', type: 'toggle', defaultValue: false },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <LayerRow
      label={String(props.label)}
      meta={props.meta ? String(props.meta) : undefined}
      icon={props.variant === 'layer' ? <LayersIcon /> : undefined}
      variant={props.variant as 'layer' | 'preset'}
      selected={ctx.get('selected', Boolean(props.selected))}
      disabled={Boolean(props.disabled)}
      actions={
        props.actions
          ? [
              { id: 'visibility', label: 'Toggle visibility', icon: <EyeOpenIcon /> },
              { id: 'remove', label: 'Remove layer', icon: <TrashIcon />, tone: 'danger' },
            ]
          : []
      }
      onSelect={() => ctx.set('selected', !ctx.get('selected', Boolean(props.selected)))}
    />
  ),
  code: (props) =>
    [
      '<LayerRow',
      `  label=${jsxString(props.label)}`,
      props.meta ? `  meta=${jsxString(props.meta)}` : null,
      props.variant === 'layer' ? '  icon={<LayersIcon />}' : null,
      props.variant !== 'layer' ? `  variant="${props.variant}"` : null,
      props.selected ? '  selected' : null,
      props.disabled ? '  disabled' : null,
      ...(props.actions
        ? [
            '  actions={[',
            "    { id: 'visibility', label: 'Toggle visibility', icon: <EyeOpenIcon /> },",
            "    { id: 'remove', label: 'Remove layer', icon: <TrashIcon />, tone: 'danger' },",
            '  ]}',
          ]
        : []),
      '  onSelect={() => selectLayer(id)}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['LayerRow', 'LayersIcon', 'EyeOpenIcon', 'TrashIcon'],
};
