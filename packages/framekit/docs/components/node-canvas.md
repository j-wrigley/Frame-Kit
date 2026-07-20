---
name: Node canvas
status: stable
since: 0.1.0
import: import { NodeCanvas } from '@presentstandards/framekit-ui'
---

# Node canvas

> A compact visual patching surface for connecting tools, effects, media, and signals.

## When to use

- Inspector-level graphs for a local material, effect, or media-processing task.
- Creative tools where users need to see and adjust how named values move between tools.
- Compact node arrangements that benefit from direct repositioning and visible signal paths.

## When not to use

- Do not use this as a substitute for a full-screen node editor with grouping, minimaps, or hundreds of nodes.
- Use Dropdown, SegmentedSwitch, or Tabs for short categorical choices rather than a graph.
- Use ValueGraph or EasingGraph when the task is shaping a curve rather than routing between tools.

## Anatomy

NodeCanvas contains a bounded grid workspace, draggable node cards, named input and output
ports, curved patch paths, selection, and a small graph-status readout. A node can also reserve
space for compact custom Frame Kit content below its ports. The app owns the node definitions,
positions, and connections; the component handles their contained presentation and direct
interaction.

## Props

| Prop                       | Type                                          | Default         | Description                                                         |
| -------------------------- | --------------------------------------------- | --------------- | ------------------------------------------------------------------- |
| value                      | readonly NodeCanvasNode[]                     | —               | Controlled nodes, their labels, ports, tones, and positions.        |
| defaultValue               | readonly NodeCanvasNode[]                     | Built-in patch  | Initial uncontrolled nodes.                                         |
| onValueChange              | (nodes: NodeCanvasNode[]) => void             | —               | Called after a node is repositioned.                                |
| connections                | readonly NodeCanvasConnection[]               | —               | Controlled connections between output and input ports.              |
| defaultConnections         | readonly NodeCanvasConnection[]               | Built-in patch  | Initial uncontrolled connections.                                   |
| onConnectionsChange        | (connections: NodeCanvasConnection[]) => void | —               | Called when an output is patched to an input.                       |
| activeNodeId               | string or null                                | —               | Controlled selected node id.                                        |
| defaultActiveNodeId        | string or null                                | null            | Initial selected node id for uncontrolled selection.                |
| onActiveNodeIdChange       | (id: string or null) => void                  | —               | Called when a node or one of its ports becomes selected.            |
| activeConnectionId         | string or null                                | —               | Controlled selected connection id.                                  |
| defaultActiveConnectionId  | string or null                                | null            | Initial selected connection id for uncontrolled selection.          |
| onActiveConnectionIdChange | (id: string or null) => void                  | —               | Called when a connection is selected or removed.                    |
| content                    | ReactNode                                     | —               | Optional compact content rendered below a node's ports.             |
| contentHeight              | number                                        | 96 with content | Reserved logical height for custom content.                         |
| width                      | number                                        | 640             | Logical canvas width in pixels. Narrow layouts scroll horizontally. |
| height                     | number                                        | 390             | Logical canvas height in pixels.                                    |
| editable                   | boolean                                       | true            | Enables header dragging and arrow-key node repositioning.           |
| connectable                | boolean                                       | true            | Enables output-then-input patching.                                 |
| disabled                   | boolean                                       | false           | Disables movement and patching.                                     |
| label                      | string                                        | Node canvas     | Accessible name for the graph group.                                |

NodeCanvasNode requires an id, label, and logical x/y coordinates. Add inputs and outputs as
named port objects. Optional kind and tone provide quiet hierarchy; tones are neutral, accent,
success, warning, and danger.

Use content and contentHeight together when a node needs a familiar Frame Kit control:

```tsx
{
  id: 'position',
  label: 'Position',
  x: 180,
  y: 180,
  outputs: [{ id: 'value', label: 'Value' }],
  contentHeight: 106,
  content: <AxisField label="Position axis" />,
}
```

NodeCanvasConnection joins one output to one input:

```ts
{
  id: 'footage-image-grade-image',
  from: { nodeId: 'footage', portId: 'image' },
  to: { nodeId: 'grade', portId: 'image' },
}
```

Invalid ports and duplicate connection ids are ignored, keeping the visible graph coherent.

## Keyboard & accessibility

- Drag an output dot onto an input dot to create a visible patch directly.
- Inputs and outputs are normal labelled buttons. Activate an output, then an input, to create a patch without a pointer.
- Click a wire to select it, then use Disconnect or press Delete/Backspace while it is focused to remove it.
- Press Escape after choosing an output to cancel the pending patch.
- Focus the graph and use arrow keys to reposition the selected node; hold Shift for larger movement.
- The graph status announces a pending source and the current connection count.

## Examples

```tsx
import {
  NodeCanvas,
  type NodeCanvasConnection,
  type NodeCanvasNode,
} from '@presentstandards/framekit-ui';

const [nodes, setNodes] = useState<NodeCanvasNode[]>([
  {
    id: 'footage',
    label: 'Footage',
    x: 24,
    y: 100,
    outputs: [{ id: 'image', label: 'Image' }],
  },
  {
    id: 'grade',
    label: 'Grade',
    x: 210,
    y: 100,
    inputs: [{ id: 'image', label: 'Image' }],
  },
]);

const [connections, setConnections] = useState<NodeCanvasConnection[]>([]);

<NodeCanvas
  value={nodes}
  onValueChange={setNodes}
  connections={connections}
  onConnectionsChange={setConnections}
  label="Colour processing patch"
/>;
```

## Do / Don't

- **Do** label ports by the actual data they carry.
- **Do** order sources, processing, and outputs in a consistent reading direction.
- **Do** use the controlled connection callback to bind patches to application behaviour.
- **Don't** make every port interactable when the graph is only a static explanation; use connectable false.
- **Don't** force a dense production graph into a compact inspector canvas.
