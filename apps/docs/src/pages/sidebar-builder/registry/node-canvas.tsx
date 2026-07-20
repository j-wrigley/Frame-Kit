import { NodeCanvas } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop surface from NodeCanvasProps: width (default 640), height (default 390),
 *  editable, connectable, disabled booleans. The built-in sample patch supplies nodes
 *  and connections; node data stays application-owned so it is not a builder option. */
export const nodeCanvasEntry: CatalogEntry = {
  kind: 'node-canvas',
  label: 'Node canvas',
  description: 'A compact visual patching surface.',
  category: 'creative',
  short: 'NC',
  specPage: 'node-canvas',
  options: [
    {
      key: 'width',
      label: 'Canvas width',
      type: 'number',
      min: 200,
      max: 640,
      step: 10,
      defaultValue: 300,
    },
    {
      key: 'height',
      label: 'Canvas height',
      type: 'number',
      min: 120,
      max: 390,
      step: 10,
      defaultValue: 190,
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'connectable', label: 'Connectable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props) => (
    <NodeCanvas
      width={Number(props.width)}
      height={Number(props.height)}
      editable={Boolean(props.editable)}
      connectable={Boolean(props.connectable)}
      disabled={Boolean(props.disabled)}
    />
  ),
  code: (props) => {
    const lines = [
      '<NodeCanvas',
      Number(props.width) !== 640 ? `  width={${props.width}}` : null,
      Number(props.height) !== 390 ? `  height={${props.height}}` : null,
      !props.editable ? '  editable={false}' : null,
      !props.connectable ? '  connectable={false}' : null,
      props.disabled ? '  disabled' : null,
      '/>',
    ].filter((line): line is string => line !== null);
    return lines.length === 2 ? `${lines[0]} />` : lines.join('\n');
  },
  imports: ['NodeCanvas'],
};
