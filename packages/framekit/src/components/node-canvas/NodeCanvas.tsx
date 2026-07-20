import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

export type NodeCanvasTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface NodeCanvasPort {
  /** Stable identifier within its node. */
  id: string;
  /** Visible and accessible port name. */
  label: string;
}

export interface NodeCanvasNode {
  /** Application-owned stable node identifier. */
  id: string;
  /** Primary node label. */
  label: string;
  /** Quiet category label shown in the node header. */
  kind?: string;
  /** Horizontal position on the logical canvas. */
  x: number;
  /** Vertical position on the logical canvas. */
  y: number;
  /** Ports that receive a connection. */
  inputs?: readonly NodeCanvasPort[];
  /** Ports that originate a connection. */
  outputs?: readonly NodeCanvasPort[];
  /** Node emphasis token. @default 'neutral' */
  tone?: NodeCanvasTone;
  /** Optional compact Frame Kit content rendered below the ports. */
  content?: ReactNode;
  /** Reserved height for custom content in logical pixels. @default 96 when content is supplied */
  contentHeight?: number;
}

export interface NodeCanvasConnection {
  /** Stable connection identifier. Generated from both endpoints when omitted. */
  id?: string;
  /** Output endpoint for the connection. */
  from: { nodeId: string; portId: string };
  /** Input endpoint for the connection. */
  to: { nodeId: string; portId: string };
}

export interface NodeCanvasProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled node positions and definitions. */
  value?: readonly NodeCanvasNode[];
  /** Initial nodes when uncontrolled. */
  defaultValue?: readonly NodeCanvasNode[];
  /** Called after a node is repositioned. */
  onValueChange?: (nodes: NodeCanvasNode[]) => void;
  /** Controlled graph connections. */
  connections?: readonly NodeCanvasConnection[];
  /** Initial connections when uncontrolled. */
  defaultConnections?: readonly NodeCanvasConnection[];
  /** Called after a connection is added from an output to an input. */
  onConnectionsChange?: (connections: NodeCanvasConnection[]) => void;
  /** Controlled selected node id. */
  activeNodeId?: string | null;
  /** Initial selected node id when uncontrolled. */
  defaultActiveNodeId?: string | null;
  /** Called when a node becomes selected. */
  onActiveNodeIdChange?: (id: string | null) => void;
  /** Controlled selected connection id. */
  activeConnectionId?: string | null;
  /** Initial selected connection id when uncontrolled. */
  defaultActiveConnectionId?: string | null;
  /** Called when a connection becomes selected or is removed. */
  onActiveConnectionIdChange?: (id: string | null) => void;
  /** Logical canvas width in pixels. @default 640 */
  width?: number;
  /** Logical canvas height in pixels. @default 390 */
  height?: number;
  /** Enables dragging nodes and arrow-key repositioning. @default true */
  editable?: boolean;
  /** Enables click-to-patch output and input ports. @default true */
  connectable?: boolean;
  /** Disables movement and patching. @default false */
  disabled?: boolean;
  /** Accessible canvas name. @default 'Node canvas' */
  label?: string;
}

type Endpoint = { nodeId: string; portId: string };
type DragState = { id: string; x: number; y: number; pointerX: number; pointerY: number };
type ConnectionDrag = { from: Endpoint; x: number; y: number };

const NODE_WIDTH = 148;
const NODE_HEADER_HEIGHT = 32;
const PORTS_TOP = 8;
const PORT_ROW_HEIGHT = 22;
const PORTS_BOTTOM = 8;
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 390;

const DEFAULT_NODES: readonly NodeCanvasNode[] = [
  {
    id: 'source',
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
    id: 'pulse',
    label: 'Pulse',
    kind: 'Signal',
    x: 195,
    y: 248,
    outputs: [{ id: 'value', label: 'Value' }],
    tone: 'warning',
  },
  {
    id: 'merge',
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

const DEFAULT_CONNECTIONS: readonly NodeCanvasConnection[] = [
  {
    id: 'source-image-grade-image',
    from: { nodeId: 'source', portId: 'image' },
    to: { nodeId: 'grade', portId: 'image' },
  },
  {
    id: 'grade-image-merge-image',
    from: { nodeId: 'grade', portId: 'image' },
    to: { nodeId: 'merge', portId: 'image' },
  },
  {
    id: 'pulse-value-merge-mix',
    from: { nodeId: 'pulse', portId: 'value' },
    to: { nodeId: 'merge', portId: 'mix' },
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function validTone(tone: NodeCanvasTone | undefined): NodeCanvasTone {
  return ['neutral', 'accent', 'success', 'warning', 'danger'].includes(tone ?? '')
    ? (tone as NodeCanvasTone)
    : 'neutral';
}

function normalisePorts(ports: readonly NodeCanvasPort[] | undefined) {
  const used = new Set<string>();
  return (ports ?? []).reduce<NodeCanvasPort[]>((next, port, index) => {
    const id = String(port.id || 'port-' + index);
    if (used.has(id)) return next;
    used.add(id);
    next.push({ id, label: port.label || 'Port ' + (index + 1) });
    return next;
  }, []);
}

function rowsForNode(node: Pick<NodeCanvasNode, 'inputs' | 'outputs'>) {
  return Math.max(1, node.inputs?.length ?? 0, node.outputs?.length ?? 0);
}

function contentHeightForNode(node: Pick<NodeCanvasNode, 'content' | 'contentHeight'>) {
  if (node.content == null) return 0;
  return clamp(Number.isFinite(node.contentHeight) ? (node.contentHeight as number) : 96, 48, 240);
}

function heightForNode(
  node: Pick<NodeCanvasNode, 'inputs' | 'outputs' | 'content' | 'contentHeight'>
) {
  return (
    NODE_HEADER_HEIGHT +
    PORTS_TOP +
    rowsForNode(node) * PORT_ROW_HEIGHT +
    PORTS_BOTTOM +
    contentHeightForNode(node)
  );
}

function normaliseNodes(
  nodes: readonly NodeCanvasNode[] | undefined,
  width: number,
  height: number
) {
  const used = new Set<string>();
  return (nodes ?? DEFAULT_NODES).reduce<NodeCanvasNode[]>((next, node, index) => {
    const id = String(node.id || 'node-' + index);
    if (used.has(id)) return next;
    used.add(id);
    const inputs = normalisePorts(node.inputs);
    const outputs = normalisePorts(node.outputs);
    const normalised = {
      id,
      label: node.label || 'Node ' + (index + 1),
      kind: node.kind,
      x: clamp(Number.isFinite(node.x) ? node.x : 0, 0, Math.max(0, width - NODE_WIDTH)),
      y: 0,
      inputs,
      outputs,
      tone: validTone(node.tone),
      content: node.content,
      contentHeight: contentHeightForNode(node),
    };
    normalised.y = clamp(
      Number.isFinite(node.y) ? node.y : 0,
      0,
      Math.max(0, height - heightForNode(normalised))
    );
    next.push(normalised);
    return next;
  }, []);
}

function normaliseConnections(
  connections: readonly NodeCanvasConnection[] | undefined,
  nodes: readonly NodeCanvasNode[]
) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const used = new Set<string>();
  return (connections ?? []).reduce<NodeCanvasConnection[]>((next, connection) => {
    const source = nodeMap.get(connection.from.nodeId);
    const target = nodeMap.get(connection.to.nodeId);
    if (
      !source ||
      !target ||
      !source.outputs?.some((port) => port.id === connection.from.portId) ||
      !target.inputs?.some((port) => port.id === connection.to.portId)
    ) {
      return next;
    }
    const id =
      connection.id ||
      connection.from.nodeId +
        '-' +
        connection.from.portId +
        '-' +
        connection.to.nodeId +
        '-' +
        connection.to.portId;
    if (used.has(id)) return next;
    used.add(id);
    next.push({ id, from: { ...connection.from }, to: { ...connection.to } });
    return next;
  }, []);
}

function sameEndpoint(first: Endpoint, second: Endpoint) {
  return first.nodeId === second.nodeId && first.portId === second.portId;
}

function portPosition(node: NodeCanvasNode, portId: string, direction: 'input' | 'output') {
  const ports = direction === 'input' ? (node.inputs ?? []) : (node.outputs ?? []);
  const index = Math.max(
    0,
    ports.findIndex((port) => port.id === portId)
  );
  return {
    x: direction === 'input' ? node.x : node.x + NODE_WIDTH,
    y: node.y + NODE_HEADER_HEIGHT + PORTS_TOP + PORT_ROW_HEIGHT / 2 + index * PORT_ROW_HEIGHT,
  };
}

function connectionPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const bend = Math.max(16, Math.min(92, Math.abs(to.x - from.x) * 0.48));
  return (
    'M ' +
    from.x +
    ' ' +
    from.y +
    ' C ' +
    (from.x + bend) +
    ' ' +
    from.y +
    ', ' +
    (to.x - bend) +
    ' ' +
    to.y +
    ', ' +
    to.x +
    ' ' +
    to.y
  );
}

function endpointLabel(
  nodes: readonly NodeCanvasNode[],
  endpoint: Endpoint,
  direction: 'input' | 'output'
) {
  const node = nodes.find((candidate) => candidate.id === endpoint.nodeId);
  const port = (direction === 'input' ? node?.inputs : node?.outputs)?.find(
    (candidate) => candidate.id === endpoint.portId
  );
  return (node?.label ?? 'Node') + ' ' + (port?.label ?? 'port');
}

/**
 * A compact patching surface for creative workflows. Nodes stay application-owned,
 * while Frame Kit handles contained layout, direct positioning, ports, and visible
 * links between tools.
 */
export const NodeCanvas = forwardRef<HTMLDivElement, NodeCanvasProps>(function NodeCanvas(
  {
    value,
    defaultValue = DEFAULT_NODES,
    onValueChange,
    connections: connectionsProp,
    defaultConnections = DEFAULT_CONNECTIONS,
    onConnectionsChange,
    activeNodeId: activeNodeIdProp,
    defaultActiveNodeId = null,
    onActiveNodeIdChange,
    activeConnectionId: activeConnectionIdProp,
    defaultActiveConnectionId = null,
    onActiveConnectionIdChange,
    width: widthProp = DEFAULT_WIDTH,
    height: heightProp = DEFAULT_HEIGHT,
    editable = true,
    connectable = true,
    disabled = false,
    label = 'Node canvas',
    className,
    ...props
  },
  ref
) {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const connectionDragRef = useRef<ConnectionDrag | null>(null);
  const connectionTargetRef = useRef<Endpoint | null>(null);
  const suppressOutputClickRef = useRef(false);
  const [uncontrolledNodes, setUncontrolledNodes] = useState(() =>
    normaliseNodes(defaultValue, widthProp, heightProp)
  );
  const [uncontrolledConnections, setUncontrolledConnections] = useState(() =>
    normaliseConnections(defaultConnections, normaliseNodes(defaultValue, widthProp, heightProp))
  );
  const [uncontrolledActiveNodeId, setUncontrolledActiveNodeId] = useState<string | null>(
    defaultActiveNodeId
  );
  const [uncontrolledActiveConnectionId, setUncontrolledActiveConnectionId] = useState<
    string | null
  >(defaultActiveConnectionId);
  const [pendingOutput, setPendingOutput] = useState<Endpoint | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectionDrag, setConnectionDrag] = useState<ConnectionDrag | null>(null);
  const [connectionTarget, setConnectionTarget] = useState<Endpoint | null>(null);
  const width = Math.max(NODE_WIDTH + 32, widthProp);
  const height = Math.max(120, heightProp);
  const nodes = useMemo(
    () => normaliseNodes(value ?? uncontrolledNodes, width, height),
    [height, uncontrolledNodes, value, width]
  );
  const connections = useMemo(
    () => normaliseConnections(connectionsProp ?? uncontrolledConnections, nodes),
    [connectionsProp, nodes, uncontrolledConnections]
  );
  const requestedActiveId =
    activeNodeIdProp === undefined ? uncontrolledActiveNodeId : activeNodeIdProp;
  const activeNodeId = nodes.some((node) => node.id === requestedActiveId)
    ? requestedActiveId
    : null;
  const requestedActiveConnectionId =
    activeConnectionIdProp === undefined ? uncontrolledActiveConnectionId : activeConnectionIdProp;
  const activeConnectionId = connections.some(
    (connection) => connection.id === requestedActiveConnectionId
  )
    ? requestedActiveConnectionId
    : null;
  const canMove = editable && !disabled;
  const canConnect = connectable && !disabled;
  const classes = [
    'fk-node-canvas',
    !canMove && 'fk-node-canvas--readonly',
    connectionDrag && 'fk-node-canvas--patching',
    disabled && 'fk-node-canvas--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const setNodes = useCallback(
    (nextNodes: readonly NodeCanvasNode[]) => {
      const next = normaliseNodes(nextNodes, width, height);
      if (value === undefined) setUncontrolledNodes(next);
      onValueChange?.(next);
    },
    [height, onValueChange, value, width]
  );

  const setConnections = useCallback(
    (nextConnections: readonly NodeCanvasConnection[]) => {
      const next = normaliseConnections(nextConnections, nodes);
      if (connectionsProp === undefined) setUncontrolledConnections(next);
      onConnectionsChange?.(next);
    },
    [connectionsProp, nodes, onConnectionsChange]
  );

  const setActiveNode = useCallback(
    (id: string | null) => {
      if (activeNodeIdProp === undefined) setUncontrolledActiveNodeId(id);
      onActiveNodeIdChange?.(id);
    },
    [activeNodeIdProp, onActiveNodeIdChange]
  );

  const setActiveConnection = useCallback(
    (id: string | null) => {
      if (activeConnectionIdProp === undefined) setUncontrolledActiveConnectionId(id);
      onActiveConnectionIdChange?.(id);
    },
    [activeConnectionIdProp, onActiveConnectionIdChange]
  );

  const canvasPointFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const bounds = workspaceRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
      return {
        x: clamp(((event.clientX - bounds.left) / bounds.width) * width, 0, width),
        y: clamp(((event.clientY - bounds.top) / bounds.height) * height, 0, height),
      };
    },
    [height, width]
  );

  const inputFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>): Endpoint | null => {
      const input = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLButtonElement>('[data-fk-node-canvas-input]');
      const nodeId = input?.dataset.nodeId;
      const portId = input?.dataset.portId;
      if (!nodeId || !portId) return null;
      const node = nodes.find((candidate) => candidate.id === nodeId);
      return node?.inputs?.some((port) => port.id === portId) ? { nodeId, portId } : null;
    },
    [nodes]
  );

  const completeConnection = useCallback(
    (from: Endpoint, to: Endpoint) => {
      if (from.nodeId === to.nodeId) return;
      const duplicate = connections.some(
        (connection) => sameEndpoint(connection.from, from) && sameEndpoint(connection.to, to)
      );
      if (duplicate) return;
      setConnections([
        ...connections,
        {
          id: from.nodeId + '-' + from.portId + '-' + to.nodeId + '-' + to.portId,
          from,
          to,
        },
      ]);
      setActiveConnection(from.nodeId + '-' + from.portId + '-' + to.nodeId + '-' + to.portId);
    },
    [connections, setActiveConnection, setConnections]
  );

  const removeConnection = useCallback(
    (id: string) => {
      setConnections(connections.filter((connection) => connection.id !== id));
      setActiveConnection(null);
    },
    [connections, setActiveConnection, setConnections]
  );

  const startDragging = (event: ReactPointerEvent<HTMLDivElement>, node: NodeCanvasNode) => {
    if (!canMove || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    workspaceRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: node.id,
      x: node.x,
      y: node.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDraggingNodeId(node.id);
    setActiveNode(node.id);
  };

  const moveDraggingNode = (event: ReactPointerEvent<HTMLDivElement>) => {
    const connection = connectionDragRef.current;
    if (connection) {
      const point = canvasPointFromPointer(event);
      if (!point) return;
      const nextDrag = { ...connection, ...point };
      const nextTarget = inputFromPointer(event);
      connectionDragRef.current = nextDrag;
      connectionTargetRef.current = nextTarget;
      setConnectionDrag(nextDrag);
      setConnectionTarget(nextTarget);
      return;
    }
    const drag = dragRef.current;
    if (!canMove || !drag) return;
    const node = nodes.find((candidate) => candidate.id === drag.id);
    if (!node) return;
    const nextX = clamp(drag.x + event.clientX - drag.pointerX, 0, Math.max(0, width - NODE_WIDTH));
    const nextY = clamp(
      drag.y + event.clientY - drag.pointerY,
      0,
      Math.max(0, height - heightForNode(node))
    );
    setNodes(
      nodes.map((candidate) =>
        candidate.id === drag.id
          ? { ...candidate, x: Math.round(nextX), y: Math.round(nextY) }
          : candidate
      )
    );
  };

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (workspaceRef.current?.hasPointerCapture(event.pointerId)) {
      workspaceRef.current.releasePointerCapture(event.pointerId);
    }
    const connection = connectionDragRef.current;
    if (connection) {
      const target =
        event.type === 'pointercancel'
          ? null
          : (inputFromPointer(event) ?? connectionTargetRef.current);
      if (target) completeConnection(connection.from, target);
      connectionDragRef.current = null;
      connectionTargetRef.current = null;
      suppressOutputClickRef.current = true;
      window.setTimeout(() => {
        suppressOutputClickRef.current = false;
      }, 0);
      setConnectionDrag(null);
      setConnectionTarget(null);
      setPendingOutput(null);
      return;
    }
    dragRef.current = null;
    setDraggingNodeId(null);
  };

  const startConnectionDrag = (event: ReactPointerEvent<HTMLElement>, endpoint: Endpoint) => {
    if (!canConnect || event.button !== 0) return;
    const point = canvasPointFromPointer(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    workspaceRef.current?.setPointerCapture(event.pointerId);
    const nextDrag = { from: endpoint, ...point };
    connectionDragRef.current = nextDrag;
    connectionTargetRef.current = null;
    setActiveNode(endpoint.nodeId);
    setPendingOutput(endpoint);
    setConnectionDrag(nextDrag);
    setConnectionTarget(null);
  };

  const chooseOutput = (event: ReactMouseEvent<HTMLButtonElement>, endpoint: Endpoint) => {
    event.stopPropagation();
    if (!canConnect) return;
    if (suppressOutputClickRef.current) {
      suppressOutputClickRef.current = false;
      return;
    }
    setActiveNode(endpoint.nodeId);
    setPendingOutput((current) => (current && sameEndpoint(current, endpoint) ? null : endpoint));
  };

  const chooseInput = (event: ReactMouseEvent<HTMLButtonElement>, endpoint: Endpoint) => {
    event.stopPropagation();
    setActiveNode(endpoint.nodeId);
    if (!canConnect || !pendingOutput || pendingOutput.nodeId === endpoint.nodeId) return;
    completeConnection(pendingOutput, endpoint);
    setPendingOutput(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && pendingOutput) {
      event.preventDefault();
      setPendingOutput(null);
      return;
    }
    if (event.target !== event.currentTarget || !canMove || !activeNodeId) return;
    const increment = event.shiftKey ? 32 : 8;
    const node = nodes.find((candidate) => candidate.id === activeNodeId);
    if (!node) return;
    const offsets: Record<string, [number, number] | undefined> = {
      ArrowLeft: [-increment, 0],
      ArrowRight: [increment, 0],
      ArrowUp: [0, -increment],
      ArrowDown: [0, increment],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    setNodes(
      nodes.map((candidate) =>
        candidate.id === node.id
          ? {
              ...candidate,
              x: clamp(candidate.x + offset[0], 0, Math.max(0, width - NODE_WIDTH)),
              y: clamp(candidate.y + offset[1], 0, Math.max(0, height - heightForNode(candidate))),
            }
          : candidate
      )
    );
  };

  const handleConnectionKeyDown = (
    event: ReactKeyboardEvent<SVGGElement>,
    connection: NodeCanvasConnection
  ) => {
    if (!canConnect) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      removeConnection(connection.id!);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveConnection(connection.id!);
    }
  };

  const activeConnection =
    connections.find((connection) => connection.id === activeConnectionId) ?? null;
  const pendingLabel = connectionDrag
    ? 'Dragging from ' +
      endpointLabel(nodes, connectionDrag.from, 'output') +
      '. Release over an input.'
    : pendingOutput
      ? 'Patching from ' + endpointLabel(nodes, pendingOutput, 'output') + '. Choose an input.'
      : activeConnection
        ? endpointLabel(nodes, activeConnection.from, 'output') +
          ' to ' +
          endpointLabel(nodes, activeConnection.to, 'input')
        : connections.length + (connections.length === 1 ? ' connection' : ' connections');

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      role="group"
      aria-label={label}
      aria-disabled={disabled || undefined}
      tabIndex={canMove ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="fk-node-canvas__viewport">
        <div
          ref={workspaceRef}
          className="fk-node-canvas__workspace"
          style={{ width, height }}
          onPointerMove={moveDraggingNode}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
        >
          <svg
            className="fk-node-canvas__connections"
            viewBox={'0 0 ' + width + ' ' + height}
            width={width}
            height={height}
            aria-hidden="true"
          >
            {connections.map((connection) => {
              const source = nodes.find((node) => node.id === connection.from.nodeId);
              const target = nodes.find((node) => node.id === connection.to.nodeId);
              if (!source || !target) return null;
              const from = portPosition(source, connection.from.portId, 'output');
              const to = portPosition(target, connection.to.portId, 'input');
              return (
                <g
                  className="fk-node-canvas__connection fk-node-canvas__connection--interactive"
                  key={connection.id}
                  data-active={connection.id === activeConnectionId || undefined}
                  role={canConnect ? 'button' : undefined}
                  tabIndex={canConnect ? 0 : undefined}
                  aria-label={
                    'Connection from ' +
                    endpointLabel(nodes, connection.from, 'output') +
                    ' to ' +
                    endpointLabel(nodes, connection.to, 'input') +
                    (connection.id === activeConnectionId ? ', selected' : '')
                  }
                  onClick={() => setActiveConnection(connection.id!)}
                  onKeyDown={(event) => handleConnectionKeyDown(event, connection)}
                >
                  <path className="fk-node-canvas__connection-hit" d={connectionPath(from, to)} />
                  <path d={connectionPath(from, to)} />
                  <circle cx={from.x} cy={from.y} r="2.5" />
                  <circle cx={to.x} cy={to.y} r="2.5" />
                </g>
              );
            })}
            {connectionDrag &&
              (() => {
                const source = nodes.find((node) => node.id === connectionDrag.from.nodeId);
                if (!source) return null;
                const from = portPosition(source, connectionDrag.from.portId, 'output');
                const targetNode = connectionTarget
                  ? nodes.find((node) => node.id === connectionTarget.nodeId)
                  : null;
                const to =
                  targetNode && connectionTarget
                    ? portPosition(targetNode, connectionTarget.portId, 'input')
                    : { x: connectionDrag.x, y: connectionDrag.y };
                return (
                  <g className="fk-node-canvas__connection fk-node-canvas__connection--preview">
                    <path d={connectionPath(from, to)} />
                    <circle cx={from.x} cy={from.y} r="2.5" />
                    <circle cx={to.x} cy={to.y} r="2.5" />
                  </g>
                );
              })()}
          </svg>

          {nodes.map((node) => {
            const rows = rowsForNode(node);
            const inputs = node.inputs ?? [];
            const outputs = node.outputs ?? [];
            const isActive = activeNodeId === node.id;
            const isDragging = draggingNodeId === node.id;
            return (
              <section
                className={'fk-node-canvas__node fk-node-canvas__node--' + node.tone}
                key={node.id}
                data-active={isActive || undefined}
                data-dragging={isDragging || undefined}
                aria-label={node.label + ' node'}
                style={{ transform: 'translate(' + node.x + 'px, ' + node.y + 'px)' }}
                onClick={() => setActiveNode(node.id)}
              >
                <div
                  className="fk-node-canvas__node-header"
                  onPointerDown={(event) => startDragging(event, node)}
                >
                  <span className="fk-node-canvas__node-title">{node.label}</span>
                  {node.kind && <span className="fk-node-canvas__node-kind">{node.kind}</span>}
                </div>
                <div className="fk-node-canvas__ports">
                  {Array.from({ length: rows }, (_, index) => {
                    const input = inputs[index];
                    const output = outputs[index];
                    const inputEndpoint = input ? { nodeId: node.id, portId: input.id } : null;
                    const outputEndpoint = output ? { nodeId: node.id, portId: output.id } : null;
                    const outputIsPending =
                      outputEndpoint &&
                      pendingOutput &&
                      sameEndpoint(outputEndpoint, pendingOutput);
                    const inputIsTarget =
                      inputEndpoint &&
                      connectionTarget &&
                      sameEndpoint(inputEndpoint, connectionTarget);
                    return (
                      <div
                        className="fk-node-canvas__port-row"
                        key={input?.id ?? output?.id ?? index}
                      >
                        {input && inputEndpoint ? (
                          <button
                            className="fk-node-canvas__port fk-node-canvas__port--input"
                            type="button"
                            disabled={!canConnect}
                            data-fk-node-canvas-input="true"
                            data-node-id={node.id}
                            data-port-id={input.id}
                            data-connection-target={inputIsTarget || undefined}
                            aria-label={
                              pendingOutput
                                ? 'Connect ' +
                                  endpointLabel(nodes, pendingOutput, 'output') +
                                  ' to ' +
                                  node.label +
                                  ' ' +
                                  input.label
                                : node.label + ' ' + input.label + ' input'
                            }
                            onClick={(event) => chooseInput(event, inputEndpoint)}
                          >
                            <span className="fk-node-canvas__port-dot" aria-hidden="true" />
                            <span>{input.label}</span>
                          </button>
                        ) : (
                          <span aria-hidden="true" />
                        )}
                        {output && outputEndpoint ? (
                          <button
                            className="fk-node-canvas__port fk-node-canvas__port--output"
                            type="button"
                            disabled={!canConnect}
                            aria-label={node.label + ' ' + output.label + ' output'}
                            aria-pressed={outputIsPending || undefined}
                            onClick={(event) => chooseOutput(event, outputEndpoint)}
                          >
                            <span>{output.label}</span>
                            <span
                              className="fk-node-canvas__port-dot"
                              aria-hidden="true"
                              onPointerDown={(event) => startConnectionDrag(event, outputEndpoint)}
                            />
                          </button>
                        ) : (
                          <span aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {node.content != null && (
                  <div
                    className="fk-node-canvas__node-content"
                    style={{ height: node.contentHeight }}
                  >
                    {node.content}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
      <div className="fk-node-canvas__status" aria-live="polite">
        <span className="fk-tag">
          {pendingOutput ? 'Patch' : activeConnection ? 'Wire' : 'Graph'}
        </span>
        <span>{pendingLabel}</span>
        {activeConnection && canConnect && (
          <button
            className="fk-node-canvas__disconnect"
            type="button"
            onClick={() => removeConnection(activeConnection.id!)}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
});
