import { useState } from 'react';
import {
  AxisField,
  Button,
  NodeCanvas,
  ResetIcon,
  type NodeCanvasConnection,
  type NodeCanvasNode,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const INITIAL_NODES: readonly NodeCanvasNode[] = [
  {
    id: 'footage',
    label: 'Footage',
    kind: 'Source',
    x: 20,
    y: 145,
    outputs: [
      { id: 'image', label: 'Image' },
      { id: 'luma', label: 'Luma' },
    ],
  },
  {
    id: 'grade',
    label: 'Grade',
    kind: 'Process',
    x: 195,
    y: 48,
    inputs: [
      { id: 'image', label: 'Image' },
      { id: 'mask', label: 'Mask' },
    ],
    outputs: [{ id: 'image', label: 'Image' }],
    tone: 'accent',
  },
  {
    id: 'position',
    label: 'Position',
    kind: 'Control',
    x: 195,
    y: 202,
    outputs: [{ id: 'value', label: 'Value' }],
    tone: 'warning',
    contentHeight: 106,
    content: (
      <AxisField
        defaultValue={{ x: 0.68, y: 0.34 }}
        gridColumns={9}
        gridRows={6}
        snapToGrid
        xLabel="Pan"
        yLabel="Tilt"
        label="Position axis field"
      />
    ),
  },
  {
    id: 'composite',
    label: 'Composite',
    kind: 'Output',
    x: 410,
    y: 142,
    inputs: [
      { id: 'image', label: 'Image' },
      { id: 'mix', label: 'Mix' },
    ],
    outputs: [{ id: 'image', label: 'Image' }],
    tone: 'success',
  },
];

const INITIAL_CONNECTIONS: readonly NodeCanvasConnection[] = [
  {
    id: 'footage-image-grade-image',
    from: { nodeId: 'footage', portId: 'image' },
    to: { nodeId: 'grade', portId: 'image' },
  },
  {
    id: 'grade-image-composite-image',
    from: { nodeId: 'grade', portId: 'image' },
    to: { nodeId: 'composite', portId: 'image' },
  },
  {
    id: 'position-value-composite-mix',
    from: { nodeId: 'position', portId: 'value' },
    to: { nodeId: 'composite', portId: 'mix' },
  },
];

function copyNodes() {
  return INITIAL_NODES.map((node) => ({
    ...node,
    inputs: node.inputs?.map((port) => ({ ...port })),
    outputs: node.outputs?.map((port) => ({ ...port })),
  }));
}

function copyConnections() {
  return INITIAL_CONNECTIONS.map((connection) => ({
    ...connection,
    from: { ...connection.from },
    to: { ...connection.to },
  }));
}

export function NodeCanvasPage() {
  const [nodes, setNodes] = useState<NodeCanvasNode[]>(copyNodes);
  const [connections, setConnections] = useState<NodeCanvasConnection[]>(copyConnections);
  const [activeNodeId, setActiveNodeId] = useState<string | null>('grade');
  const activeNode = nodes.find((node) => node.id === activeNodeId) ?? null;

  const resetGraph = () => {
    setNodes(copyNodes());
    setConnections(copyConnections());
    setActiveNodeId('grade');
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Node canvas"
        lede="A compact visual patching surface for effects, materials, and media workflows. Place tools where the flow makes sense, then connect named outputs to the inputs that consume them."
      />

      <Section title="Colour processing patch">
        <p className="section-intro">
          This is a deliberately contained graph, not a canvas workspace in miniature. Drag nodes by
          their headers to clarify the flow. The Position node contains a live Axis field, showing
          how familiar Frame Kit controls can live inside a graph tool. To add a patch, drag from an
          output dot to the input dot that should receive it.
        </p>
        <div className="demo">
          <div className="node-canvas-inspector" aria-label="Colour processing node graph">
            <div className="node-canvas-inspector__heading">
              <div>
                <span className="fk-tag">Patch</span>
                <strong>Colour chain</strong>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconStart={<ResetIcon />}
                aria-label="Reset colour processing patch"
                title="Reset colour processing patch"
                onClick={resetGraph}
              >
                Reset
              </Button>
            </div>

            <NodeCanvas
              value={nodes}
              onValueChange={setNodes}
              connections={connections}
              onConnectionsChange={setConnections}
              activeNodeId={activeNodeId}
              onActiveNodeIdChange={setActiveNodeId}
              height={420}
              label="Colour processing node canvas"
            />

            <div className="node-canvas-inspector__readout">
              <div>
                <span className="fk-tag">Selected</span>
                <output>{activeNode?.label ?? 'None'}</output>
                <span>{activeNode?.kind ?? 'No node selected'}</span>
              </div>
              <div>
                <span className="fk-tag">Patches</span>
                <output>{connections.length}</output>
                <span>{connections.length === 1 ? 'connection' : 'connections'}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Click a cable to select it, then use <strong>Disconnect</strong> or press{' '}
          <kbd>Delete</kbd> while the cable is focused to remove it. Press <kbd>Escape</kbd> to
          cancel a pending patch. With the graph itself focused, use arrow keys to nudge the
          selected node; hold <kbd>Shift</kbd> for larger moves.
        </p>
      </Section>

      <Section title="Keep patching legible">
        <div className="node-canvas-guidance">
          <div>
            <span className="fk-tag spec-label">Ports</span>
            <strong>Name what moves</strong>
            <p>
              Use concrete port names such as Image, Mask, Value, or Geometry rather than generic
              handles.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Flow</span>
            <strong>Read left to right</strong>
            <p>
              Place sources, transforms, and outputs in a consistent direction so the patch can be
              scanned quickly.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Scope</span>
            <strong>Keep it local</strong>
            <p>
              Use this compact canvas for a single task or inspector. Escalate to a dedicated
              workspace for a full graph editor.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { NodeCanvas, type NodeCanvasNode } from '@presentstandards/framekit-ui';

const [nodes, setNodes] = useState<NodeCanvasNode[]>([
  {
    id: 'source',
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

<NodeCanvas
  value={nodes}
  onValueChange={setNodes}
  connections={connections}
  onConnectionsChange={setConnections}
  label="Colour processing patch"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
