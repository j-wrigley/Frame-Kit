import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react';
import {
  Button,
  CheckIcon,
  ColorField,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  Disclosure,
  DragHandleDots2Icon,
  Dropdown,
  EyeOpenIcon,
  Input,
  Pencil1Icon,
  PlusIcon,
  ResetIcon,
  SearchField,
  SegmentedSwitch,
  Sidebar,
  Stepper,
  Tag,
  ToggleRow,
  TrashIcon,
} from '@presentstandards/framekit-ui';
import { CATALOG, entryFor } from './registry';
import {
  defaultProps,
  jsxString,
  type CatalogEntry,
  type NodeProps,
  type RenderContext,
} from './types';
import { useCopyFeedback } from '../../lib/use-copy-feedback';

/* ── Model ──────────────────────────────────────────────────── */

interface BuilderNode {
  id: string;
  kind: string;
  props: NodeProps;
  children?: BuilderNode[];
}

interface ShellProps {
  eyebrow: string;
  title: string;
  variant: 'panel' | 'docked' | 'floating';
  density: 'default' | 'compact';
  width: number;
}

const SHELL_DEFAULTS: ShellProps = {
  eyebrow: 'Inspector',
  title: 'Custom sidebar',
  variant: 'panel',
  density: 'compact',
  width: 300,
};

type DropPosition =
  | { parentId: string | null; index: number } // insertion point in a child list
  | null;

const STORAGE_KEY = 'fk-sidebar-builder-v2';
const KIND_MIME = 'application/x-framekit-kind';
const NODE_MIME = 'application/x-framekit-node';

let serial = 0;
function makeNode(entry: CatalogEntry): BuilderNode {
  serial += 1;
  return {
    id: `sb-${Date.now().toString(36)}-${serial}`,
    kind: entry.kind,
    props: defaultProps(entry),
    children: entry.container ? [] : undefined,
  };
}

function makeInitialStack(): BuilderNode[] {
  const search = makeNode(entryFor('search')!);
  const appearance = makeNode(entryFor('disclosure')!);
  appearance.props.label = 'Appearance';
  appearance.children = [
    makeNode(entryFor('slider')!),
    makeNode(entryFor('color-field')!),
    makeNode(entryFor('toggle-row')!),
  ];
  const transform = makeNode(entryFor('disclosure')!);
  transform.props.label = 'Transform';
  transform.children = [makeNode(entryFor('stepper')!), makeNode(entryFor('axis-field')!)];
  return [search, appearance, transform];
}

/* ── Tree helpers ───────────────────────────────────────────── */

function findNode(nodes: BuilderNode[], id: string | null): BuilderNode | null {
  if (id == null) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = node.children ? findNode(node.children, id) : null;
    if (child) return child;
  }
  return null;
}

function containsNode(node: BuilderNode, id: string): boolean {
  if (node.id === id) return true;
  return node.children?.some((child) => containsNode(child, id)) ?? false;
}

function removeNode(nodes: BuilderNode[], id: string): BuilderNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children ? { ...node, children: removeNode(node.children, id) } : node
    );
}

function insertNode(
  nodes: BuilderNode[],
  parentId: string | null,
  index: number,
  node: BuilderNode
): BuilderNode[] {
  if (parentId == null) {
    const next = [...nodes];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, node);
    return next;
  }
  return nodes.map((item) => {
    if (item.id === parentId && item.children) {
      const children = [...item.children];
      children.splice(Math.max(0, Math.min(index, children.length)), 0, node);
      return { ...item, children };
    }
    return item.children
      ? { ...item, children: insertNode(item.children, parentId, index, node) }
      : item;
  });
}

function updateNodeProps(nodes: BuilderNode[], id: string, props: NodeProps): BuilderNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, props };
    return node.children
      ? { ...node, children: updateNodeProps(node.children, id, props) }
      : node;
  });
}

function moveNode(nodes: BuilderNode[], id: string, direction: -1 | 1): BuilderNode[] {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) {
    const next = index + direction;
    if (next < 0 || next >= nodes.length) return nodes;
    const copy = [...nodes];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    return copy;
  }
  return nodes.map((node) =>
    node.children ? { ...node, children: moveNode(node.children, id, direction) } : node
  );
}

function countNodes(nodes: BuilderNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countNodes(node.children ?? []), 0);
}

/** Parent id + index of a node, for duplicate-in-place. */
function locateNode(
  nodes: BuilderNode[],
  id: string,
  parentId: string | null = null
): { parentId: string | null; index: number } | null {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) return { parentId, index };
  for (const node of nodes) {
    if (!node.children) continue;
    const found = locateNode(node.children, id, node.id);
    if (found) return found;
  }
  return null;
}

function cloneNode(node: BuilderNode): BuilderNode {
  serial += 1;
  return {
    ...node,
    id: `sb-${Date.now().toString(36)}-${serial}`,
    props: { ...node.props },
    children: node.children?.map(cloneNode),
  };
}

/* ── Persistence ────────────────────────────────────────────── */

interface StoredState {
  nodes: BuilderNode[];
  shell: ShellProps;
}

function sanitizeNodes(raw: unknown): BuilderNode[] {
  if (!Array.isArray(raw)) return [];
  const nodes: BuilderNode[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item == null) continue;
    const candidate = item as Partial<BuilderNode>;
    const entry = typeof candidate.kind === 'string' ? entryFor(candidate.kind) : null;
    if (!entry || typeof candidate.id !== 'string') continue;
    const props = { ...defaultProps(entry) };
    if (candidate.props && typeof candidate.props === 'object') {
      for (const option of entry.options) {
        const value = (candidate.props as NodeProps)[option.key];
        if (typeof value !== typeof option.defaultValue) continue;
        if (option.type === 'select' && !option.choices?.some((c) => c.value === value)) continue;
        if (option.type === 'number' && typeof value === 'number') {
          props[option.key] = Math.max(
            option.min ?? -Infinity,
            Math.min(option.max ?? Infinity, value)
          );
          continue;
        }
        props[option.key] = value;
      }
    }
    nodes.push({
      id: candidate.id,
      kind: entry.kind,
      props,
      children: entry.container ? sanitizeNodes(candidate.children) : undefined,
    });
  }
  return nodes;
}

function loadStoredState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const nodes = sanitizeNodes(parsed.nodes);
    if (nodes.length === 0) return null;
    const shell = { ...SHELL_DEFAULTS, ...(parsed.shell ?? {}) };
    if (!['panel', 'docked', 'floating'].includes(shell.variant)) shell.variant = 'panel';
    if (!['default', 'compact'].includes(shell.density)) shell.density = 'compact';
    shell.eyebrow = String(shell.eyebrow ?? '');
    shell.title = String(shell.title ?? SHELL_DEFAULTS.title);
    shell.width = Math.max(240, Math.min(420, Number(shell.width) || SHELL_DEFAULTS.width));
    return { nodes, shell };
  } catch {
    return null;
  }
}

/* ── Code export ────────────────────────────────────────────── */

function indent(code: string, depth: number): string {
  const pad = '  '.repeat(depth);
  return code
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n');
}

function nodeCode(node: BuilderNode, depth: number): string {
  const entry = entryFor(node.kind);
  if (!entry) return '';
  if (entry.container) {
    const open = `<Disclosure label=${jsxString(String(node.props.label ?? 'Section'))}${
      node.props.defaultOpen ? ' defaultOpen' : ''
    }>`;
    const children = (node.children ?? []).map((child) => nodeCode(child, depth + 1));
    return [indent(open, depth), ...children, indent('</Disclosure>', depth)].join('\n');
  }
  return indent(entry.code(node.props), depth);
}

function collectImports(nodes: BuilderNode[], into: Set<string>) {
  for (const node of nodes) {
    const entry = entryFor(node.kind);
    if (entry) for (const name of entry.imports) into.add(name);
    if (node.children) collectImports(node.children, into);
  }
}

function generateJsx(nodes: BuilderNode[], shell: ShellProps): string {
  const imports = new Set<string>(['Sidebar']);
  collectImports(nodes, imports);
  const body = nodes.map((node) => nodeCode(node, 3)).join('\n');
  return [
    `import { ${[...imports].sort().join(', ')} } from '@presentstandards/framekit-ui';`,
    '',
    '// Interactive values (value/setValue etc.) are placeholders — wire them',
    '// to your application state, and rename duplicates when the same',
    '// component appears more than once.',
    'export function CustomSidebar() {',
    '  return (',
    '    <Sidebar',
    `      eyebrow=${jsxString(shell.eyebrow)}`,
    `      title=${jsxString(shell.title)}`,
    shell.variant !== 'panel' ? `      variant="${shell.variant}"` : null,
    shell.density !== 'default' ? `      density="${shell.density}"` : null,
    `      width={${shell.width}}`,
    '    >',
    body,
    '    </Sidebar>',
    '  );',
    '}',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

/* ── Page ───────────────────────────────────────────────────── */

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'structure', label: 'Structure' },
  { value: 'controls', label: 'Controls' },
  { value: 'creative', label: 'Creative' },
] as const;

export function SidebarBuilder() {
  const stored = useMemo(loadStoredState, []);
  const [nodes, setNodes] = useState<BuilderNode[]>(() => stored?.nodes ?? makeInitialStack());
  const [shell, setShell] = useState<ShellProps>(() => stored?.shell ?? SHELL_DEFAULTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [viewing, setViewing] = useState(false);
  const [drop, setDrop] = useState<DropPosition>(null);
  const [, setScratchVersion] = useState(0);
  const [notice, setNotice] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const scratchRef = useRef<Record<string, Record<string, unknown>>>({});
  const dragNodeRef = useRef<string | null>(null);
  const undoRef = useRef<{ nodes: BuilderNode[]; shell: ShellProps } | null>(null);
  const inspectorRef = useRef<HTMLElement>(null);
  const previewSelectionRef = useRef<string | null>(null);
  const noticeNonce = useRef(0);
  const { copied, announcement, copy } = useCopyFeedback();

  const announce = (message: string) => {
    noticeNonce.current += 1;
    setNotice(message + (noticeNonce.current % 2 ? '\u200b' : ''));
  };

  const snapshotForUndo = () => {
    undoRef.current = { nodes, shell };
    setCanUndo(true);
  };

  const undo = () => {
    if (!undoRef.current) return;
    setNodes(undoRef.current.nodes);
    setShell(undoRef.current.shell);
    undoRef.current = null;
    setCanUndo(false);
    setSelectedId(null);
    announce('Undid the last destructive change');
  };

  const selected = findNode(nodes, selectedId);
  const selectedEntry = selected ? entryFor(selected.kind) : null;
  const itemCount = countNodes(nodes);
  const selectedLocation = selected ? locateNode(nodes, selected.id) : null;
  const selectedSiblings = selectedLocation
    ? selectedLocation.parentId == null
      ? nodes
      : (findNode(nodes, selectedLocation.parentId)?.children ?? [])
    : [];
  const previousSibling =
    selectedLocation && selectedLocation.index > 0
      ? selectedSiblings[selectedLocation.index - 1]
      : null;
  const canNest = !!previousSibling && !!entryFor(previousSibling.kind)?.container;
  const canUnnest = selectedLocation?.parentId != null;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, shell }));
    } catch {
      // Private browsing — the build simply won't persist.
    }
  }, [nodes, shell]);

  const contextFor = useCallback(
    (nodeId: string): RenderContext => ({
      get: <T,>(key: string, fallback: T): T => {
        const bucket = scratchRef.current[nodeId];
        return bucket && key in bucket ? (bucket[key] as T) : fallback;
      },
      set: (key, value) => {
        scratchRef.current[nodeId] = { ...scratchRef.current[nodeId], [key]: value };
        setScratchVersion((version) => version + 1);
      },
      viewing,
    }),
    [viewing]
  );

  const filteredCatalog = useMemo(() => {
    const term = query.trim().toLowerCase();
    return CATALOG.filter((entry) => {
      const categoryMatch = category === 'all' || entry.category === category;
      const queryMatch =
        term.length === 0 ||
        entry.label.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  /* ── Mutations ── */

  const addEntry = (entry: CatalogEntry) => {
    const node = makeNode(entry);
    announce(`Added ${entry.label}`);
    if (selected && selectedEntry?.container) {
      setNodes((current) => insertNode(current, selected.id, selected.children?.length ?? 0, node));
    } else if (selected) {
      const location = locateNode(nodes, selected.id);
      setNodes((current) =>
        insertNode(current, location?.parentId ?? null, (location?.index ?? nodes.length) + 1, node)
      );
    } else {
      setNodes((current) => insertNode(current, null, current.length, node));
    }
    setSelectedId(node.id);
  };

  const removeSelected = () => {
    if (!selected) return;
    snapshotForUndo();
    const pruneScratch = (node: BuilderNode) => {
      delete scratchRef.current[node.id];
      node.children?.forEach(pruneScratch);
    };
    pruneScratch(selected);
    setNodes((current) => removeNode(current, selected.id));
    setSelectedId(null);
    announce(`Removed ${selectedEntry?.label ?? 'element'}`);
    requestAnimationFrame(() => inspectorRef.current?.focus());
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const location = locateNode(nodes, selected.id);
    if (!location) return;
    const copy = cloneNode(selected);
    setNodes((current) => insertNode(current, location.parentId, location.index + 1, copy));
    setSelectedId(copy.id);
  };

  const setSelectedProp = (key: string, value: string | number | boolean) => {
    if (!selected) return;
    // Reset the node's live scratch so the new configuration takes effect even
    // after the user has interacted with the component on the canvas.
    delete scratchRef.current[selected.id];
    setNodes((current) =>
      updateNodeProps(current, selected.id, { ...selected.props, [key]: value })
    );
  };

  const nestSelected = () => {
    if (!selected || !previousSibling || !canNest) return;
    const moving = selected;
    setNodes((current) =>
      insertNode(
        removeNode(current, moving.id),
        previousSibling.id,
        findNode(current, previousSibling.id)?.children?.length ?? 0,
        moving
      )
    );
    announce(`Moved ${selectedEntry?.label ?? 'element'} into ${String(previousSibling.props.label ?? 'section')}`);
  };

  const unnestSelected = () => {
    if (!selected || !selectedLocation || selectedLocation.parentId == null) return;
    const parentLocation = locateNode(nodes, selectedLocation.parentId);
    if (!parentLocation) return;
    const moving = selected;
    setNodes((current) =>
      insertNode(removeNode(current, moving.id), parentLocation.parentId, parentLocation.index + 1, moving)
    );
    announce(`Moved ${selectedEntry?.label ?? 'element'} out of its section`);
  };

  const reset = () => {
    snapshotForUndo();
    setNodes(makeInitialStack());
    setSelectedId(null);
    scratchRef.current = {};
    announce('Reset to the starter sidebar');
  };

  /* ── Drag and drop ── */

  const handleDropAt = (event: DragEvent, parentId: string | null, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setDrop(null);
    setDragActive(false);
    const kind = event.dataTransfer.getData(KIND_MIME);
    const movedId = event.dataTransfer.getData(NODE_MIME) || dragNodeRef.current;
    dragNodeRef.current = null;
    if (kind) {
      const entry = entryFor(kind);
      if (!entry) return;
      const node = makeNode(entry);
      setNodes((current) => insertNode(current, parentId, index, node));
      setSelectedId(node.id);
      announce(`Added ${entry.label}`);
      return;
    }
    if (movedId) {
      const moving = findNode(nodes, movedId);
      if (!moving) return;
      // Never drop a node into itself or its own descendants.
      if (parentId != null && containsNode(moving, parentId)) return;
      setNodes((current) => {
        // Recompute the index against the tree WITHOUT the moving node so
        // dropping below its own position lands where the indicator showed.
        const without = removeNode(current, movedId);
        let targetIndex = index;
        if (parentId == null) {
          const before = current.findIndex((node) => node.id === movedId);
          if (before >= 0 && before < index) targetIndex -= 1;
        } else {
          const parentBefore = findNode(current, parentId);
          const before = parentBefore?.children?.findIndex((node) => node.id === movedId) ?? -1;
          if (before >= 0 && before < index) targetIndex -= 1;
        }
        return insertNode(without, parentId, targetIndex, moving);
      });
    }
  };

  const dragOverAt = (event: DragEvent, parentId: string | null, index: number) => {
    if (
      !event.dataTransfer.types.includes(KIND_MIME) &&
      !event.dataTransfer.types.includes(NODE_MIME)
    ) {
      return;
    }
    // Never signal a valid drop inside the dragged node's own subtree.
    if (event.dataTransfer.types.includes(NODE_MIME) && parentId != null) {
      const moving = findNode(nodes, dragNodeRef.current);
      if (moving && containsNode(moving, parentId)) return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = event.dataTransfer.types.includes(NODE_MIME) ? 'move' : 'copy';
    setDrop((current) =>
      current && current.parentId === parentId && current.index === index
        ? current
        : { parentId, index }
    );
  };

  /* ── Rendering ── */

  const renderDropLine = (parentId: string | null, index: number) => (
    <div
      key={`drop-${parentId ?? 'root'}-${index}`}
      className="sbuild-dropline"
      data-active={(drop && drop.parentId === parentId && drop.index === index) || undefined}
      onDragOver={(event) => dragOverAt(event, parentId, index)}
      onDrop={(event) => handleDropAt(event, parentId, index)}
    />
  );

  const renderNodeList = (list: BuilderNode[], parentId: string | null): ReactNode => (
    <>
      {renderDropLine(parentId, 0)}
      {list.map((node, index) => (
        <div key={node.id} className="sbuild-node-slot">
          {renderNode(node)}
          {renderDropLine(parentId, index + 1)}
        </div>
      ))}
    </>
  );

  const renderNode = (node: BuilderNode): ReactNode => {
    const entry = entryFor(node.kind);
    if (!entry) return null;
    const isSelected = node.id === selectedId;
    const chrome = !viewing && (
      <span className="sbuild-node-chrome" data-selected={isSelected || undefined}>
        <span
          className="sbuild-node-grip"
          draggable
          onDragStart={(event) => {
            dragNodeRef.current = node.id;
            event.dataTransfer.setData(NODE_MIME, node.id);
            event.dataTransfer.effectAllowed = 'move';
            setDragActive(true);
          }}
          onDragEnd={() => {
            dragNodeRef.current = null;
            setDrop(null);
            setDragActive(false);
          }}
          title="Drag to move"
          aria-hidden="true"
        >
          <DragHandleDots2Icon size={11} />
        </span>
        <button
          type="button"
          className="sbuild-node-name"
          onClick={() => setSelectedId(isSelected ? null : node.id)}
          aria-pressed={isSelected}
        >
          {entry.label}
        </button>
      </span>
    );

    if (entry.container) {
      return (
        <div
          className="sbuild-node sbuild-node--container"
          data-selected={(!viewing && isSelected) || undefined}
          onClickCapture={() => !viewing && setSelectedId(node.id)}
          onDragOver={(event) => dragOverAt(event, node.id, node.children?.length ?? 0)}
          onDrop={(event) => handleDropAt(event, node.id, node.children?.length ?? 0)}
        >
          {chrome}
          <Disclosure
            key={`open-${String(node.props.defaultOpen)}`}
            label={String(node.props.label ?? 'Section')}
            summary={`${node.children?.length ?? 0} ${node.children?.length === 1 ? 'item' : 'items'}`}
            defaultOpen={Boolean(node.props.defaultOpen)}
          >
            <div
              className="sbuild-container-body"
              onDragOver={(event) =>
                dragOverAt(event, node.id, node.children?.length ?? 0)
              }
              onDrop={(event) => handleDropAt(event, node.id, node.children?.length ?? 0)}
            >
              {node.children && node.children.length > 0 ? (
                renderNodeList(node.children, node.id)
              ) : (
                <span className="sbuild-container-empty">
                  {viewing ? 'Empty section' : 'Drop components here'}
                </span>
              )}
            </div>
          </Disclosure>
        </div>
      );
    }

    return (
      <div
        className="sbuild-node"
        data-selected={(!viewing && isSelected) || undefined}
        onClickCapture={() => !viewing && setSelectedId(node.id)}
      >
        {chrome}
        <div className="sbuild-node-body">{entry.render(node.props, contextFor(node.id))}</div>
      </div>
    );
  };

  const renderOptionControl = (option: CatalogEntry['options'][number]) => {
    if (!selected) return null;
    const value = selected.props[option.key];
    switch (option.type) {
      case 'text':
        return (
          <Input
            size="sm"
            label={option.label}
            value={String(value ?? '')}
            onChange={(event) => setSelectedProp(option.key, event.target.value)}
          />
        );
      case 'toggle':
        return (
          <ToggleRow
            variant="compact"
            label={option.label}
            checked={Boolean(value)}
            onChange={(event) => setSelectedProp(option.key, event.target.checked)}
          />
        );
      case 'number': {
        const current = Number(value ?? option.defaultValue);
        const step = option.step ?? 1;
        const decimals = (String(step).split('.')[1] ?? '').length;
        const clampTo = (next: number) => {
          const bounded = Math.max(option.min ?? -Infinity, Math.min(option.max ?? Infinity, next));
          return Number(bounded.toFixed(decimals));
        };
        return (
          <Stepper
            size="sm"
            label={option.label}
            value={current}
            onDecrement={() => setSelectedProp(option.key, clampTo(current - step))}
            onIncrement={() => setSelectedProp(option.key, clampTo(current + step))}
            decrementDisabled={option.min !== undefined && current <= option.min}
            incrementDisabled={option.max !== undefined && current >= option.max}
          />
        );
      }
      case 'select': {
        const choices = option.choices ?? [];
        if (choices.length <= 3) {
          return (
            <div className="sbuild-option-labelled">
              <Tag as="span">{option.label}</Tag>
              <SegmentedSwitch
                size="sm"
                fullWidth
                options={choices.map((choice) => ({ value: choice.value, label: choice.label }))}
                value={String(value)}
                onValueChange={(next) => setSelectedProp(option.key, next)}
              />
            </div>
          );
        }
        return (
          <div className="sbuild-option-labelled">
            <Tag as="span">{option.label}</Tag>
            <Dropdown
              size="sm"
              aria-label={option.label}
              options={choices.map((choice) => ({ value: choice.value, label: choice.label }))}
              value={String(value)}
              onValueChange={(next) => setSelectedProp(option.key, next)}
            />
          </div>
        );
      }
      case 'color':
        return (
          <div className="sbuild-option-labelled">
            <Tag as="span">{option.label}</Tag>
            <ColorField
              fullWidth
              pickerLabel={option.label}
              value={String(value ?? '#3f3f46')}
              onChange={(hex) => setSelectedProp(option.key, hex)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sbuild">
      <header className="sbuild-topbar">
        <div className="sbuild-topbar__title">
          <Tag tone="accent">Ready made · Builder</Tag>
          <h1>Make your own sidebar</h1>
        </div>
        <div className="sbuild-topbar__actions">
          <span className="sbuild-topbar__meta">
            {itemCount} {itemCount === 1 ? 'element' : 'elements'}
          </span>
          {canUndo && (
            <Button size="sm" variant="ghost" iconStart={<ResetIcon />} onClick={undo}>
              Undo
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            iconStart={viewing ? <Pencil1Icon /> : <EyeOpenIcon />}
            onClick={() => {
              setViewing((current) => {
                if (!current) {
                  previewSelectionRef.current = selectedId;
                  setSelectedId(null);
                } else {
                  setSelectedId(previewSelectionRef.current);
                }
                return !current;
              });
            }}
          >
            {viewing ? 'Edit' : 'Preview'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            iconStart={copied === 'json' ? <CheckIcon /> : <CopyIcon />}
            onClick={() =>
              void copy(
                'json',
                JSON.stringify(
                  { shell, nodes },
                  (key, value) => (key === 'id' ? undefined : value),
                  2
                ),
                'Structure copied as JSON'
              )
            }
          >
            {copied === 'json' ? 'Copied' : 'Copy JSON'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            iconStart={copied === 'jsx' ? <CheckIcon /> : <CopyIcon />}
            onClick={() => void copy('jsx', generateJsx(nodes, shell), 'Sidebar copied as JSX')}
          >
            {copied === 'jsx' ? 'Copied' : 'Copy JSX'}
          </Button>
        </div>
        <span className="visually-hidden" role="status" aria-live="polite">
          {announcement} {notice}
        </span>
      </header>

      <div
        className="sbuild-workspace"
        data-viewing={viewing || undefined}
        data-dragging={dragActive || undefined}
      >
        {/* ── Library ── */}
        {!viewing && (
          <section className="sbuild-library" aria-label="Component library">
            <div className="sbuild-library__head">
              <SearchField
                size="sm"
                aria-label="Search components"
                placeholder={`Search ${CATALOG.length} components`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <SegmentedSwitch
                size="sm"
                fullWidth
                options={CATEGORY_OPTIONS}
                value={category}
                onValueChange={setCategory}
              />
            </div>
            <div className="sbuild-library__list">
              {filteredCatalog.length === 0 ? (
                <div className="sbuild-library__empty">No matching components.</div>
              ) : (
                filteredCatalog.map((entry) => (
                  <div
                    key={entry.kind}
                    className="sbuild-card"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(KIND_MIME, entry.kind);
                      event.dataTransfer.effectAllowed = 'copy';
                      setDragActive(true);
                    }}
                    onDragEnd={() => {
                      setDrop(null);
                      setDragActive(false);
                    }}
                  >
                    <span className="sbuild-card__mark">{entry.short}</span>
                    <span className="sbuild-card__copy">
                      <strong>{entry.label}</strong>
                      <span>{entry.description}</span>
                    </span>
                    <button
                      type="button"
                      className="sbuild-card__add"
                      aria-label={`Add ${entry.label}`}
                      onClick={() => addEntry(entry)}
                    >
                      <PlusIcon size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── Canvas ── */}
        <section className="sbuild-canvas" aria-label="Sidebar canvas">
          <div
            className="sbuild-canvas__surface"
            onDragOver={(event) => dragOverAt(event, null, nodes.length)}
            onDrop={(event) => handleDropAt(event, null, nodes.length)}
            onDragLeave={(event) => {
              const next = event.relatedTarget as Node | null;
              if (!next || !event.currentTarget.contains(next)) setDrop(null);
            }}
            onClick={() => setSelectedId(null)}
          >
            <div
              className="sbuild-canvas__shell"
              style={{ width: shell.width }}
              onClick={(event) => event.stopPropagation()}
            >
              <Sidebar
                eyebrow={shell.eyebrow}
                title={shell.title}
                variant={shell.variant}
                density={shell.density}
                width="100%"
              >
                <div className="sbuild-stack">
                  {nodes.length === 0 ? (
                    <div className="sbuild-stack__empty">
                      <PlusIcon size={14} />
                      Drag components here, or press plus in the library
                    </div>
                  ) : (
                    renderNodeList(nodes, null)
                  )}
                </div>
              </Sidebar>
            </div>
          </div>
        </section>

        {/* ── Inspector ── */}
        {!viewing && (
          <section className="sbuild-inspector" aria-label="Inspector" ref={inspectorRef} tabIndex={-1}>
            {selected && selectedEntry ? (
              <>
                <div className="sbuild-inspector__head">
                  <div>
                    <Tag tone="primary">{selectedEntry.label}</Tag>
                    <p>{selectedEntry.description}</p>
                  </div>
                  {selectedEntry.specPage && (
                    <a className="sbuild-inspector__spec" href={`#/spec/${selectedEntry.specPage}`}>
                      Spec
                    </a>
                  )}
                </div>
                <div className="sbuild-inspector__options">
                  {selectedEntry.options.map((option) => (
                    <div className="sbuild-inspector__option" key={option.key}>
                      {renderOptionControl(option)}
                    </div>
                  ))}
                  {selectedEntry.options.length === 0 && (
                    <p className="sbuild-inspector__hint">
                      This component has no configurable options — it always renders its
                      production form.
                    </p>
                  )}
                </div>
                <div className="sbuild-inspector__actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<ChevronUpIcon />}
                    disabled={!selectedLocation || selectedLocation.index === 0}
                    onClick={() => {
                      setNodes((current) => moveNode(current, selected.id, -1));
                      announce('Moved up');
                    }}
                  >
                    Up
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<ChevronDownIcon />}
                    disabled={
                      !selectedLocation || selectedLocation.index >= selectedSiblings.length - 1
                    }
                    onClick={() => {
                      setNodes((current) => moveNode(current, selected.id, 1));
                      announce('Moved down');
                    }}
                  >
                    Down
                  </Button>
                  {canNest && (
                    <Button size="sm" variant="ghost" iconStart={<ChevronDownIcon />} onClick={nestSelected}>
                      Nest into section above
                    </Button>
                  )}
                  {canUnnest && (
                    <Button size="sm" variant="ghost" iconStart={<ChevronUpIcon />} onClick={unnestSelected}>
                      Move out of section
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" iconStart={<CopyIcon />} onClick={duplicateSelected}>
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    iconStart={<TrashIcon />}
                    onClick={removeSelected}
                  >
                    Remove
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="sbuild-inspector__head">
                  <div>
                    <Tag tone="primary">Sidebar shell</Tag>
                    <p>The real Sidebar component wrapping your stack.</p>
                  </div>
                </div>
                <div className="sbuild-inspector__options">
                  <div className="sbuild-inspector__option">
                    <Input
                      size="sm"
                      label="Eyebrow"
                      value={shell.eyebrow}
                      onChange={(event) => setShell({ ...shell, eyebrow: event.target.value })}
                    />
                  </div>
                  <div className="sbuild-inspector__option">
                    <Input
                      size="sm"
                      label="Title"
                      value={shell.title}
                      onChange={(event) => setShell({ ...shell, title: event.target.value })}
                    />
                  </div>
                  <div className="sbuild-inspector__option sbuild-option-labelled">
                    <Tag as="span">Variant</Tag>
                    <SegmentedSwitch
                      size="sm"
                      fullWidth
                      options={[
                        { value: 'panel', label: 'Panel' },
                        { value: 'docked', label: 'Docked' },
                        { value: 'floating', label: 'Floating' },
                      ]}
                      value={shell.variant}
                      onValueChange={(next) =>
                        setShell({ ...shell, variant: next as ShellProps['variant'] })
                      }
                    />
                  </div>
                  <div className="sbuild-inspector__option sbuild-option-labelled">
                    <Tag as="span">Density</Tag>
                    <SegmentedSwitch
                      size="sm"
                      fullWidth
                      options={[
                        { value: 'default', label: 'Default' },
                        { value: 'compact', label: 'Compact' },
                      ]}
                      value={shell.density}
                      onValueChange={(next) =>
                        setShell({ ...shell, density: next as ShellProps['density'] })
                      }
                    />
                  </div>
                  <div className="sbuild-inspector__option">
                    <Stepper
                      size="sm"
                      label="Width"
                      value={shell.width}
                      suffix="PX"
                      onDecrement={() => setShell({ ...shell, width: Math.max(240, shell.width - 10) })}
                      onIncrement={() => setShell({ ...shell, width: Math.min(420, shell.width + 10) })}
                      decrementDisabled={shell.width <= 240}
                      incrementDisabled={shell.width >= 420}
                    />
                  </div>
                </div>
                <p className="sbuild-inspector__hint">
                  Select any element on the canvas to edit its label and variants. Drag from the
                  library to add, drag the grip to rearrange, drop into a dropdown section to nest.
                </p>
                <div className="sbuild-inspector__actions">
                  <Button size="sm" variant="ghost" iconStart={<ResetIcon />} onClick={reset}>
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<TrashIcon />}
                    onClick={() => {
                      snapshotForUndo();
                      setNodes([]);
                      setSelectedId(null);
                      scratchRef.current = {};
                      announce('Cleared the sidebar');
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
