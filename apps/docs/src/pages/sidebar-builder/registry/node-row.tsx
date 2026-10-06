import {
  Input,
  NodeRow,
  NodeRows,
  NodeSocket,
  type NodeRowPlacement,
  type NodeSocketLane,
} from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** Real prop unions: NodeRows placement 'edge' | 'gutter' (NodeRowPlacement)
 *  and NodeSocket lane 'value' | 'pixels' | 'element' | 'mask'
 *  (NodeSocketLane), plus NodeRow's driven / inactive booleans. A sidebar is
 *  a list surface, so the builder defaults to the gutter placement; edge
 *  placement expects a node card shell that lets sockets overhang it. */
export const nodeRowEntry: CatalogEntry = {
  kind: 'node-row',
  label: 'Node row',
  description: 'A wireable setting with its socket.',
  category: 'creative',
  short: 'NR',
  specPage: 'node-row',
  options: [
    { key: 'label', label: 'Label', type: 'text', defaultValue: 'Cell size' },
    {
      key: 'lane',
      label: 'Socket lane',
      type: 'select',
      choices: [
        { value: 'value', label: 'Value' },
        { value: 'pixels', label: 'Pixels' },
        { value: 'element', label: 'Element' },
        { value: 'mask', label: 'Mask' },
      ],
      defaultValue: 'value',
    },
    {
      key: 'placement',
      label: 'Placement',
      type: 'select',
      choices: [
        { value: 'gutter', label: 'Gutter' },
        { value: 'edge', label: 'Edge' },
      ],
      defaultValue: 'gutter',
    },
    { key: 'connected', label: 'Connected', type: 'toggle', defaultValue: false },
    { key: 'driven', label: 'Driven', type: 'toggle', defaultValue: false },
    { key: 'inactive', label: 'Inactive', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => {
    const label = String(props.label);
    const driven = Boolean(props.driven);
    return (
      <NodeRows placement={props.placement as NodeRowPlacement}>
        <NodeRow
          label={label}
          driven={driven}
          inactive={Boolean(props.inactive)}
          input={
            <NodeSocket
              as="button"
              lane={props.lane as NodeSocketLane}
              connected={Boolean(props.connected) || driven}
              aria-label={`Connect ${label}`}
            />
          }
        >
          <Input
            size="sm"
            font="mono"
            align="end"
            aria-label={label}
            value={ctx.get('value', '12')}
            disabled={driven}
            onChange={(event) => ctx.set('value', event.currentTarget.value)}
          />
        </NodeRow>
      </NodeRows>
    );
  },
  code: (props) => {
    const driven = Boolean(props.driven);
    const connected = Boolean(props.connected) || driven;
    return [
      props.placement !== 'edge' ? `<NodeRows placement="${props.placement}">` : '<NodeRows>',
      '  <NodeRow',
      `    label=${jsxString(props.label)}`,
      driven ? '    driven' : null,
      props.inactive ? '    inactive' : null,
      '    input={',
      '      <NodeSocket',
      '        as="button"',
      props.lane !== 'value' ? `        lane="${props.lane}"` : null,
      connected ? '        connected' : null,
      `        aria-label=${jsxString(`Connect ${String(props.label)}`)}`,
      '      />',
      '    }',
      '  >',
      `    <Input size="sm" font="mono" align="end" aria-label=${jsxString(props.label)} value={value}${driven ? ' disabled' : ''} />`,
      '  </NodeRow>',
      '</NodeRows>',
    ]
      .filter(Boolean)
      .join('\n');
  },
  imports: ['NodeRows', 'NodeRow', 'NodeSocket', 'Input'],
};
