import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Button,
  CheckIcon,
  ChevronRightIcon,
  ColorField,
  Dropdown,
  EyeClosedIcon,
  HoverCard,
  ImageIcon,
  Input,
  MagicWandIcon,
  MaskOnIcon,
  NodeRow,
  NodeRows,
  NodeSocket,
  Popover,
  RowActions,
  RowAddButton,
  RowInfoButton,
  SegmentedSwitch,
  Sidebar,
  SidebarSection,
  Slider,
  Tag,
  Textarea,
  WaveformIcon,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

/* ── Demo-only card shell ──────────────────────────────────────
   The card frame (header, fold, record) belongs to the application's
   canvas; it is composed here only to show the kit rows in context. */

interface MenuItem {
  id: string;
  label: string;
  shown: boolean;
  /** Why the item cannot be hidden, if it cannot. */
  locked?: string;
}

interface MenuGroup {
  label: string;
  items: readonly MenuItem[];
}

function AddMenu({
  title,
  groups,
  onToggle,
  onShowAll,
  onEssentials,
}: {
  title: string;
  groups: readonly MenuGroup[];
  onToggle: (id: string) => void;
  onShowAll: () => void;
  onEssentials: () => void;
}) {
  // One section of settings, so each group's name is the heading: a lone
  // "Settings" Tag over every group would read as a second, equal level.
  // autoFocus moves focus into the menu once it is positioned, so the
  // keyboard reaches its items straight from the '+'.
  return (
    <Popover
      trigger={<RowAddButton label={`Add settings to ${title}`} />}
      size="sm"
      placement="bottom-end"
      panelLabel={`${title} settings`}
      panelClassName="docs-add-menu"
      autoFocus
    >
      {groups.map((group) => (
        <div className="docs-add-menu__section" key={group.label}>
          <Tag as="h5" className="docs-add-menu__heading">
            {group.label}
          </Tag>
          {group.items.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              fullWidth
              className="docs-add-menu__item"
              iconStart={
                item.shown ? (
                  <CheckIcon />
                ) : (
                  <span className="docs-add-menu__spacer" aria-hidden="true" />
                )
              }
              aria-pressed={item.shown}
              disabled={item.locked != null}
              title={item.locked}
              onClick={() => onToggle(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ))}
      <div className="docs-add-menu__footer">
        <Button variant="ghost" size="sm" onClick={onShowAll}>
          Show all
        </Button>
        <Button variant="ghost" size="sm" onClick={onEssentials}>
          Essentials
        </Button>
      </div>
    </Popover>
  );
}

interface NodeInfoProps {
  icon: ReactNode;
  title: string;
  family: string;
  summary: string;
  facts: readonly [string, string][];
  tip?: string;
  /** Gap to the card. The default clears the '+' that follows the 'i', so a
   *  right-placed card never covers it. */
  offset?: number;
}

function NodeInfo({ icon, title, family, summary, facts, tip, offset = 30 }: NodeInfoProps) {
  return (
    <HoverCard
      trigger={<RowInfoButton label={`About ${title}`} />}
      size="md"
      placement="right-start"
      offset={offset}
      openDelay={300}
      panelLabel={`About ${title}`}
    >
      <div className="docs-node-info">
        <div className="docs-node-info__head">
          <span className="docs-node-info__icon" aria-hidden="true">
            {icon}
          </span>
          <strong>{title}</strong>
          <Tag>{family}</Tag>
        </div>
        <p className="docs-node-info__summary">{summary}</p>
        <dl className="docs-node-info__facts">
          {facts.map(([term, detail]) => (
            <div key={term}>
              <dt className="fk-tag">{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
        {tip && <p className="docs-node-info__tip">{tip}</p>}
      </div>
    </HoverCard>
  );
}

function DocsNodeCard({
  id,
  title,
  icon,
  width,
  position,
  info,
  add,
  recording = false,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  width: number;
  position?: { x: number; y: number };
  info?: ReactNode;
  add?: ReactNode;
  recording?: boolean;
  children: ReactNode;
}) {
  const [folded, setFolded] = useState(false);
  const style: CSSProperties = position
    ? { position: 'absolute', left: position.x, top: position.y, width }
    : { width };

  return (
    <article className="docs-node" style={style} data-node={id} aria-label={`${title} node`}>
      <header className="docs-node__header">
        <button
          type="button"
          className="docs-node__fold"
          aria-expanded={!folded}
          aria-label={folded ? `Expand ${title}` : `Fold ${title}`}
          onClick={() => setFolded((value) => !value)}
        >
          <ChevronRightIcon />
        </button>
        <span className="docs-node__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="docs-node__title">{title}</span>
        <button
          type="button"
          className="docs-node__record"
          aria-label={`Record ${title}`}
          aria-pressed={recording}
        />
        {/* A folded card keeps its 'i' but gives up its '+'. */}
        <RowActions info={info} add={folded ? undefined : add} />
      </header>
      {!folded && children}
    </article>
  );
}

/* ── Wire anchors, measured from the DOM ──────────────────────
   y is measured: offsetTop ignores the workspace's scale(zoom), so the
   anchor stays right at every zoom. Each offsetTop is relative to the
   parent's padding edge, so the parent's border (the card's 1px) is added
   back on the way up. x stays on the card edge: edge sockets are centred
   on the 1px border, half a pixel inside the card's box, and a measured x
   would round that half pixel away. */

function socketY(socket: HTMLElement, card: HTMLElement) {
  let y = socket.offsetHeight / 2;
  let node: HTMLElement | null = socket;
  while (node && node !== card) {
    y += node.offsetTop;
    const parent = node.offsetParent as HTMLElement | null;
    if (parent) y += parent.clientTop;
    node = parent;
  }
  return y;
}

function cardEdgeX(card: HTMLElement, side: 'in' | 'out') {
  return card.offsetLeft + (side === 'out' ? card.offsetWidth - 0.5 : 0.5);
}

const WIRES: readonly { id: string; from: string; to: string }[] = [
  { id: 'pixels', from: 'image:out:pixels', to: 'halftone:in:in' },
  { id: 'angle', from: 'wave:out:value', to: 'halftone:in:angle' },
];

function anchorFor(root: HTMLElement, key: string) {
  const [nodeId, side] = key.split(':') as [string, 'in' | 'out'];
  const card = root.querySelector<HTMLElement>(`[data-node="${nodeId}"]`);
  if (!card) return null;
  const socket = card.querySelector<HTMLElement>(`[data-wire="${key}"]`);
  if (socket) return { x: cardEdgeX(card, side), y: card.offsetTop + socketY(socket, card) };
  // A folded card has no row sockets: its wires meet the header midline.
  const header = card.querySelector<HTMLElement>('.docs-node__header');
  if (!header) return null;
  return {
    x: cardEdgeX(card, side),
    y: card.offsetTop + card.clientTop + header.offsetHeight / 2,
  };
}

function useMeasuredWires(workspace: RefObject<HTMLDivElement | null>) {
  const [paths, setPaths] = useState<{ id: string; d: string }[]>([]);

  const measure = useCallback(() => {
    const root = workspace.current;
    if (!root) return;
    const next = WIRES.flatMap((wire) => {
      const a = anchorFor(root, wire.from);
      const b = anchorFor(root, wire.to);
      if (!a || !b) return [];
      const reach = Math.max(36, Math.abs(b.x - a.x) / 2);
      return [
        {
          id: wire.id,
          d: `M ${a.x} ${a.y} C ${a.x + reach} ${a.y}, ${b.x - reach} ${b.y}, ${b.x} ${b.y}`,
        },
      ];
    });
    // Only commit when a path actually moved, so measuring never loops.
    setPaths((current) =>
      current.length === next.length && current.every((path, i) => path.d === next[i]?.d)
        ? current
        : next
    );
  }, [workspace]);

  useLayoutEffect(() => {
    measure();
  });

  useLayoutEffect(() => {
    const root = workspace.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    root.querySelectorAll('.docs-node').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [measure, workspace]);

  return paths;
}

/* ── Halftone data ──
   A realistic effect card (Halftone): its settings, groups, controls and
   defaults. */

interface HalftoneSetting {
  id: string;
  label: string;
  group: 'Screen' | 'Tone' | 'Colour' | 'Paper';
  face: boolean;
}

const HALFTONE_SETTINGS: readonly HalftoneSetting[] = [
  { id: 'style', label: 'Style', group: 'Screen', face: true },
  { id: 'shape', label: 'Shape', group: 'Screen', face: true },
  { id: 'cellSize', label: 'Cell size', group: 'Screen', face: true },
  { id: 'angle', label: 'Angle', group: 'Screen', face: true },
  { id: 'spread', label: 'Spread', group: 'Screen', face: true },
  { id: 'roundness', label: 'Roundness', group: 'Screen', face: true },
  { id: 'jitter', label: 'Jitter', group: 'Screen', face: true },
  { id: 'contrast', label: 'Contrast', group: 'Tone', face: false },
  { id: 'gamma', label: 'Gamma', group: 'Tone', face: false },
  { id: 'ink', label: 'Ink', group: 'Colour', face: true },
  { id: 'paperColour', label: 'Paper colour', group: 'Paper', face: true },
];

const FACE = new Set(HALFTONE_SETTINGS.filter((s) => s.face).map((s) => s.id));
const WIRED = new Set(['angle']);

/** Settings grouped in registry order, for the '+' menu. */
function groupSettings<T extends { group: string }>(settings: readonly T[]) {
  const groups: { label: string; items: T[] }[] = [];
  for (const setting of settings) {
    const last = groups.at(-1);
    if (last?.label === setting.group) last.items.push(setting);
    else groups.push({ label: setting.group, items: [setting] });
  }
  return groups;
}

// Four choices: a Dropdown. Three or fewer would be a SegmentedSwitch.
const STYLE_OPTIONS = [
  { value: 'mono', label: 'Mono' },
  { value: 'source', label: 'Source colour' },
  { value: 'duotone', label: 'Duotone' },
  { value: 'cmyk', label: 'CMYK' },
];

const SHAPE_OPTIONS = [
  { value: 'dot', label: 'Dot' },
  { value: 'line', label: 'Line' },
  { value: 'cross', label: 'Cross' },
  { value: 'square', label: 'Square' },
  { value: 'diamond', label: 'Diamond' },
];

const INVERT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'inverted', label: 'Inverted' },
];

const ELEMENT_INPUTS: readonly { id: string; label: string; group: string }[] = [
  { id: 'position', label: 'Position', group: 'Transform' },
  { id: 'rotation', label: 'Rotation', group: 'Transform' },
  { id: 'opacity', label: 'Opacity', group: 'Appearance' },
  { id: 'radius', label: 'Corner radius', group: 'Appearance' },
];

const WAVE_OPTIONS = [
  { value: 'sine', label: 'Sine' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'square', label: 'Square' },
];

const ZOOMS = [
  { value: '0.4', label: '40%' },
  { value: '1', label: '100%' },
  { value: '2', label: '200%' },
];

const WORKSPACE = { width: 636, height: 520 };

function socket(
  key: string,
  label: string,
  lane: 'value' | 'pixels' | 'element' | 'mask',
  connected = false
) {
  const direction = key.split(':')[1];
  return (
    <NodeSocket
      as="button"
      lane={lane}
      connected={connected}
      data-wire={key}
      aria-label={direction === 'in' ? `Connect ${label}` : `Drag to connect ${label}`}
    />
  );
}

function numberField(label: string, value: string, suffix: string, onChange?: (v: string) => void) {
  return (
    <Input
      size="sm"
      font="mono"
      align="end"
      aria-label={label}
      value={value}
      // A unitless value (Contrast, Gamma) has no suffix at all.
      suffix={suffix || undefined}
      readOnly={!onChange}
      onChange={onChange ? (event) => onChange(event.currentTarget.value) : undefined}
    />
  );
}

export function NodeRowPage() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState('1');
  const [shown, setShown] = useState<Set<string>>(() => new Set(FACE));
  const [style, setStyle] = useState('mono');
  const [shape, setShape] = useState('dot');
  const [cellSize, setCellSize] = useState('8');
  const [spread, setSpread] = useState(88);
  const [roundness, setRoundness] = useState('100');
  const [jitter, setJitter] = useState('0');
  const [ink, setInk] = useState('#111111');
  const [paperColour, setPaperColour] = useState('#FFFFFF');
  const [contrast, setContrast] = useState('0');
  const [gamma, setGamma] = useState('0');
  const [opacity, setOpacity] = useState('100');
  const [waveform, setWaveform] = useState('sine');
  const [speed, setSpeed] = useState('0.5');
  // The image card leads with its Media row; everything else is behind '+'.
  const [elementInputs, setElementInputs] = useState<Set<string>>(() => new Set());
  const paths = useMeasuredWires(workspaceRef);
  const zoomFactor = Number(zoom);

  const toggleSetting = (id: string) =>
    setShown((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isShown = (id: string) => shown.has(id) || WIRED.has(id);

  const halftoneGroups: MenuGroup[] = groupSettings(HALFTONE_SETTINGS).map((group) => ({
    label: group.label,
    items: group.items.map((setting) => ({
      id: setting.id,
      label: setting.label,
      shown: isShown(setting.id),
      locked: WIRED.has(setting.id) ? 'Connected: disconnect to hide' : undefined,
    })),
  }));

  // Group headings only when two or more groups are on the card: one heading
  // over the whole card says nothing.
  const visibleSettings = HALFTONE_SETTINGS.filter((setting) => isShown(setting.id));
  const headed = new Set(visibleSettings.map((setting) => setting.group)).size > 1;

  const elementGroups: MenuGroup[] = groupSettings(ELEMENT_INPUTS).map((group) => ({
    label: group.label,
    items: group.items.map((input) => ({
      id: input.id,
      label: input.label,
      shown: elementInputs.has(input.id),
    })),
  }));

  const halftoneRow = (id: string): ReactNode => {
    switch (id) {
      case 'style':
        return (
          <NodeRow label="Style" input={socket('halftone:in:style', 'Style', 'value')}>
            <Dropdown
              size="sm"
              fullWidth
              aria-label="Style"
              options={STYLE_OPTIONS}
              value={style}
              onValueChange={setStyle}
            />
          </NodeRow>
        );
      case 'shape':
        return (
          <NodeRow label="Shape" input={socket('halftone:in:shape', 'Shape', 'value')}>
            <Dropdown
              size="sm"
              fullWidth
              aria-label="Shape"
              options={SHAPE_OPTIONS}
              value={shape}
              onValueChange={setShape}
            />
          </NodeRow>
        );
      case 'cellSize':
        return (
          <NodeRow
            label="Cell size"
            labelProps={{ 'data-scrub': true }}
            input={socket('halftone:in:cellSize', 'Cell size', 'value')}
          >
            {numberField('Cell size', cellSize, 'px', setCellSize)}
          </NodeRow>
        );
      case 'angle':
        // Wired from Wave 1, whose wire is drawn: no Node tag on the canvas.
        return (
          <NodeRow
            label="Angle"
            driven
            title="Driven by Wave 1"
            input={socket('halftone:in:angle', 'Angle', 'value', true)}
          >
            <Input
              size="sm"
              font="mono"
              align="end"
              aria-label="Angle, driven by Wave 1"
              value="38"
              suffix="°"
              disabled
            />
          </NodeRow>
        );
      case 'spread':
        return (
          <NodeRow
            label="Spread"
            labelProps={{ 'data-scrub': true }}
            input={socket('halftone:in:spread', 'Spread', 'value')}
          >
            <Slider
              size="sm"
              aria-label="Spread"
              showValue={false}
              min={20}
              max={120}
              value={spread}
              onValueChange={setSpread}
            />
            <span className="docs-node-field">
              {numberField('Spread value', String(spread), '%', (v) => setSpread(Number(v) || 0))}
            </span>
          </NodeRow>
        );
      case 'roundness':
        return (
          <NodeRow
            label="Roundness"
            labelProps={{ 'data-scrub': true }}
            input={socket('halftone:in:roundness', 'Roundness', 'value')}
          >
            {numberField('Roundness', roundness, '%', setRoundness)}
          </NodeRow>
        );
      case 'jitter':
        return (
          <NodeRow
            label="Jitter"
            labelProps={{ 'data-scrub': true }}
            input={socket('halftone:in:jitter', 'Jitter', 'value')}
          >
            {numberField('Jitter', jitter, '%', setJitter)}
          </NodeRow>
        );
      case 'contrast':
        return (
          <NodeRow
            label="Contrast"
            labelProps={{ 'data-scrub': true }}
            input={socket('halftone:in:contrast', 'Contrast', 'value')}
          >
            {numberField('Contrast', contrast, '', setContrast)}
          </NodeRow>
        );
      case 'gamma':
        return (
          <NodeRow
            label="Gamma"
            labelProps={{ 'data-scrub': true }}
            input={socket('halftone:in:gamma', 'Gamma', 'value')}
          >
            {numberField('Gamma', gamma, '', setGamma)}
          </NodeRow>
        );
      case 'ink':
        return (
          <NodeRow label="Ink" input={socket('halftone:in:ink', 'Ink', 'value')}>
            <ColorField pickerLabel="Ink" value={ink} onChange={setInk} fullWidth />
          </NodeRow>
        );
      case 'paperColour':
        return (
          <NodeRow
            label="Paper colour"
            input={socket('halftone:in:paperColour', 'Paper colour', 'value')}
          >
            <ColorField
              pickerLabel="Paper colour"
              value={paperColour}
              onChange={setPaperColour}
              fullWidth
            />
          </NodeRow>
        );
      default:
        return null;
    }
  };

  const toggleElementInput = (id: string) =>
    setElementInputs((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Node row"
        lede="One setting per row, with its socket in the row it drives. Node cards built from these rows read like sidebar sections: the same 24px controls, the same 6px rhythm, and a label column sized by the longest visible name."
      />

      <Section title="A node card that reads like the sidebar">
        <p className="section-intro">
          Sockets sit on the card&apos;s edge at the midline of their row, so the wire meets the
          setting it changes. Wire ends are measured from each socket&apos;s layout position, so
          they land on the glyphs at every zoom. Fold a card and its wires meet the header; use the
          header&apos;s <strong>+</strong> to show more settings, and hover the <strong>i</strong>{' '}
          for an explanation.
        </p>
        <div className="demo">
          <div className="node-socket-matrix__toolbar">
            <span className="fk-tag">Canvas zoom</span>
            <SegmentedSwitch
              size="sm"
              aria-label="Canvas zoom"
              options={ZOOMS}
              value={zoom}
              onValueChange={setZoom}
            />
          </div>
          <div className="docs-patch" aria-label="Halftone patch">
            <div
              className="docs-patch__sizer"
              style={{
                width: WORKSPACE.width * zoomFactor,
                height: WORKSPACE.height * zoomFactor,
              }}
            >
              <div
                ref={workspaceRef}
                className="docs-patch__workspace"
                style={
                  {
                    width: WORKSPACE.width,
                    height: WORKSPACE.height,
                    transform: `scale(${zoomFactor})`,
                    '--fk-node-socket-zoom': zoomFactor,
                    '--fk-node-socket-hit': `max(12px, calc(16px / ${zoomFactor}))`,
                  } as CSSProperties
                }
              >
                <svg
                  className="docs-patch__wires"
                  width={WORKSPACE.width}
                  height={WORKSPACE.height}
                  aria-hidden="true"
                >
                  {paths.map((path) => (
                    <path key={path.id} d={path.d} />
                  ))}
                </svg>

                <DocsNodeCard
                  id="image"
                  title="photo.jpg"
                  icon={<ImageIcon />}
                  width={256}
                  position={{ x: 12, y: 16 }}
                  info={
                    <NodeInfo
                      icon={<ImageIcon />}
                      title="Image"
                      family="Element"
                      summary="A photo on the canvas. Its pixels feed effects; the element itself can be moved, faded, or swapped by other nodes."
                      facts={[
                        ['Takes', 'Media, Position, Opacity, …'],
                        ['Gives', 'Pixels, Element'],
                        ['Works with', 'Effects, masks, readers'],
                      ]}
                    />
                  }
                  add={
                    <AddMenu
                      title="photo.jpg"
                      groups={elementGroups}
                      onToggle={toggleElementInput}
                      onShowAll={() =>
                        setElementInputs(new Set(ELEMENT_INPUTS.map((input) => input.id)))
                      }
                      onEssentials={() => setElementInputs(new Set())}
                    />
                  }
                >
                  <NodeRows>
                    <NodeRow
                      outputLabel="Pixels"
                      meta="1920×1280"
                      output={socket('image:out:pixels', 'Pixels', 'pixels', true)}
                    />
                    <NodeRow
                      outputLabel="Element"
                      meta="image"
                      output={socket('image:out:element', 'Element', 'element')}
                    />
                    {/* The media is shown, not edited, on the card: a row names
                        what the element holds. */}
                    <NodeRow label="Media" input={socket('image:in:media', 'Media', 'value')}>
                      <span className="docs-node-readout">photo.jpg</span>
                    </NodeRow>
                    {elementInputs.has('position') && (
                      <NodeRow
                        label="Position"
                        input={socket('image:in:position', 'Position', 'value')}
                      >
                        {numberField('Position X', '120', 'X')}
                        {numberField('Position Y', '80', 'Y')}
                      </NodeRow>
                    )}
                    {elementInputs.has('rotation') && (
                      <NodeRow
                        label="Rotation"
                        input={socket('image:in:rotation', 'Rotation', 'value')}
                      >
                        {numberField('Rotation', '0', '°')}
                      </NodeRow>
                    )}
                    {elementInputs.has('opacity') && (
                      <NodeRow
                        label="Opacity"
                        labelProps={{ 'data-scrub': true }}
                        input={socket('image:in:opacity', 'Opacity', 'value')}
                      >
                        {numberField('Opacity', opacity, '%', setOpacity)}
                      </NodeRow>
                    )}
                    {elementInputs.has('radius') && (
                      <NodeRow
                        label="Corner radius"
                        input={socket('image:in:radius', 'Corner radius', 'value')}
                      >
                        {numberField('Corner radius', '0', 'px')}
                      </NodeRow>
                    )}
                  </NodeRows>
                </DocsNodeCard>

                <DocsNodeCard
                  id="wave"
                  title="Wave 1"
                  icon={<WaveformIcon />}
                  width={208}
                  position={{ x: 12, y: 316 }}
                >
                  <NodeRows maxLabelWidth={72}>
                    <NodeRow
                      outputLabel="Value"
                      meta="0.42"
                      output={socket('wave:out:value', 'Value', 'value', true)}
                    />
                    <NodeRow label="Shape" input={socket('wave:in:shape', 'Shape', 'value')}>
                      <Dropdown
                        size="sm"
                        fullWidth
                        aria-label="Wave shape"
                        options={WAVE_OPTIONS}
                        value={waveform}
                        onValueChange={setWaveform}
                      />
                    </NodeRow>
                    <NodeRow
                      label="Speed"
                      labelProps={{ 'data-scrub': true }}
                      input={socket('wave:in:speed', 'Speed', 'value')}
                    >
                      {numberField('Speed', speed, 'Hz', setSpeed)}
                    </NodeRow>
                  </NodeRows>
                </DocsNodeCard>

                <DocsNodeCard
                  id="halftone"
                  title="Halftone"
                  icon={<MagicWandIcon />}
                  width={256}
                  position={{ x: 368, y: 16 }}
                  info={
                    <NodeInfo
                      icon={<MagicWandIcon />}
                      title="Halftone"
                      family="Effect · Stylise"
                      summary="Turns an image into a printed dot pattern, in one ink, two inks, or CMYK."
                      facts={[
                        ['Takes', 'Pixels, Mask, Numbers, Colours'],
                        ['Gives', 'Pixels'],
                        ['Works with', 'All elements'],
                      ]}
                      tip="Wire a Wave into Angle for a slowly turning screen."
                    />
                  }
                  add={
                    <AddMenu
                      title="Halftone"
                      groups={halftoneGroups}
                      onToggle={toggleSetting}
                      onShowAll={() => setShown(new Set(HALFTONE_SETTINGS.map((s) => s.id)))}
                      onEssentials={() => setShown(new Set(FACE))}
                    />
                  }
                >
                  <NodeRows>
                    <NodeRow
                      label="In"
                      outputLabel="Out"
                      input={socket('halftone:in:in', 'In', 'pixels', true)}
                      output={socket('halftone:out:out', 'Out', 'pixels')}
                    >
                      <span className="docs-node-source">photo.jpg</span>
                    </NodeRow>
                    <NodeRow label="Mask" input={socket('halftone:in:mask', 'Mask', 'mask')}>
                      <Button variant="secondary" size="sm" iconStart={<MaskOnIcon />}>
                        Add mask
                      </Button>
                    </NodeRow>
                    {visibleSettings.map((setting, index) => (
                      <Fragment key={setting.id}>
                        {headed && setting.group !== visibleSettings[index - 1]?.group && (
                          <Tag as="h5" className="docs-node-group">
                            {setting.group}
                          </Tag>
                        )}
                        {halftoneRow(setting.id)}
                      </Fragment>
                    ))}
                  </NodeRows>
                </DocsNodeCard>
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Angle is wired from Wave 1, so it is read-only, shows the value it receives in accent
          text, and cannot be hidden from the <strong>+</strong> menu.
        </p>
      </Section>

      <Section title="Row layouts and states">
        <p className="section-intro">
          Every row is the same two columns. Leave out the label and the control spans the row; add
          an output label and readout for an output; pair an input and an output for a flow or
          through row. States change emphasis, never geometry.
        </p>
        <div className="demo docs-node-states">
          <DocsNodeCard id="states" title="Row states" icon={<MagicWandIcon />} width={256}>
            <NodeRows>
              <NodeRow
                outputLabel="Matte"
                meta="1 shape"
                output={
                  <NodeSocket
                    as="button"
                    lane="mask"
                    connected
                    aria-label="Drag to connect Matte"
                  />
                }
              />
              <NodeRow
                label="Text"
                input={<NodeSocket as="button" aria-label="Connect Text" />}
                output={<NodeSocket as="button" aria-label="Drag to connect Text" />}
              >
                <Input size="sm" aria-label="Text" defaultValue="Hello" />
              </NodeRow>
              <NodeRow
                label="Angle"
                driven
                title="Driven by Wave 1"
                input={<NodeSocket as="button" connected aria-label="Connect Angle" />}
              >
                {/* The driver's name leads, then the value it supplies. */}
                <span className="docs-node-driver">
                  <Tag tone="accent">Node</Tag>
                  <span>Wave 1</span>
                </span>
                <Input
                  size="sm"
                  font="mono"
                  align="end"
                  aria-label="Angle, driven by Wave 1"
                  value="38"
                  suffix="°"
                  disabled
                />
              </NodeRow>
              <NodeRow
                label="Invert"
                driven
                input={<NodeSocket as="button" connected aria-label="Connect Invert" />}
              >
                <SegmentedSwitch
                  size="sm"
                  aria-label="Invert, driven"
                  // A driven switch locks its other options, never the current one.
                  options={INVERT_OPTIONS.map((option) => ({
                    ...option,
                    disabled: option.value !== 'inverted',
                  }))}
                  value="inverted"
                />
              </NodeRow>
              <NodeRow
                label="Cell size"
                animated
                labelProps={{ 'data-scrub': true }}
                input={<NodeSocket as="button" aria-label="Connect Cell size" />}
              >
                {numberField('Cell size, animated', '16', 'px')}
              </NodeRow>
              <NodeRow
                label="Roundness"
                inactive
                title="Not used with the current settings"
                input={<NodeSocket as="button" aria-label="Connect Roundness" />}
              >
                {numberField('Roundness, not used', '80', '%')}
              </NodeRow>
              <NodeRow
                label="Jitter"
                dropTarget
                input={<NodeSocket as="button" state="compatible" aria-label="Connect Jitter" />}
              >
                {numberField('Jitter', '0', '%')}
              </NodeRow>
              <NodeRow
                label="Ink"
                input={<NodeSocket as="button" state="incompatible" aria-label="Connect Ink" />}
              >
                <ColorField pickerLabel="Ink" defaultValue="#111111" fullWidth />
              </NodeRow>
              <NodeRow
                label="Caption"
                tall
                input={<NodeSocket as="button" aria-label="Connect Caption" />}
              >
                <Textarea aria-label="Caption" rows={2} defaultValue="Printed in two inks" />
              </NodeRow>
              <NodeRow
                className="docs-node-list-row"
                label={
                  <span className="docs-node-list__label">
                    Shapes
                    <span className="docs-node-list__count">1 shape</span>
                  </span>
                }
                wide
                input={
                  <NodeSocket as="button" lane="element" connected aria-label="Connect Shapes" />
                }
              >
                {/* A list is the input's contents: boxed items, so they never
                    read as more setting rows. */}
                <ul className="docs-node-list">
                  <li>
                    <span>Rectangle 1</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="docs-node-list__eye"
                      iconStart={<EyeClosedIcon />}
                      aria-label="Show Rectangle 1"
                      aria-pressed={false}
                    />
                  </li>
                </ul>
              </NodeRow>
            </NodeRows>
          </DocsNodeCard>
          <dl className="docs-node-states__legend">
            <div>
              <dt className="fk-tag">Output</dt>
              <dd>Matte: name and readout beside the output socket.</dd>
            </div>
            <div>
              <dt className="fk-tag">Through</dt>
              <dd>Text: one value with an input and an output.</dd>
            </div>
            <div>
              <dt className="fk-tag">Driven</dt>
              <dd>Angle, Invert: the wire owns the value; it shows in accent text.</dd>
            </div>
            <div>
              <dt className="fk-tag">Animated</dt>
              <dd>Cell size: a diamond after the name.</dd>
            </div>
            <div>
              <dt className="fk-tag">Inactive</dt>
              <dd>Roundness: kept because it was changed, but not used now.</dd>
            </div>
            <div>
              <dt className="fk-tag">Drop target</dt>
              <dd>Jitter: the row under a compatible wire. Ink cannot take it.</dd>
            </div>
            <div>
              <dt className="fk-tag">Tall / wide</dt>
              <dd>Caption, Shapes: sockets stay on the first line.</dd>
            </div>
          </dl>
        </div>
        <p className="section-note">
          Driven rows show the Node tag on the canvas only when the driving wire is not drawn on the
          current page; the Angle row above shows how that reads.
        </p>
      </Section>

      <Section title="In a properties view">
        <p className="section-intro">
          The same rows work in a sidebar list with <code>placement=&quot;gutter&quot;</code>:
          sockets move into a 14px leading gutter that every row reserves, so labels start on one
          axis whether or not a setting can be wired.
        </p>
        <div className="demo docs-node-gutter">
          <Sidebar title="Properties" width={288}>
            <SidebarSection
              label="Halftone"
              actions={
                <RowActions
                  info={
                    <NodeInfo
                      icon={<MagicWandIcon />}
                      title="Halftone"
                      family="Effect · Stylise"
                      summary="Turns an image into a printed dot pattern, in one ink, two inks, or CMYK."
                      facts={[
                        ['Takes', 'Pixels, Mask, Numbers, Colours'],
                        ['Gives', 'Pixels'],
                        ['Works with', 'All elements'],
                      ]}
                      offset={8}
                    />
                  }
                />
              }
            >
              <NodeRows placement="gutter">
                <NodeRow
                  label="In"
                  input={<NodeSocket as="button" lane="pixels" connected aria-label="Connect In" />}
                >
                  <span className="docs-node-source">photo.jpg</span>
                </NodeRow>
                <NodeRow
                  label="Mask"
                  input={<NodeSocket as="button" lane="mask" aria-label="Connect Mask" />}
                >
                  <Button variant="secondary" size="sm" iconStart={<MaskOnIcon />}>
                    Add mask
                  </Button>
                </NodeRow>
                <NodeRow
                  label="Style"
                  input={<NodeSocket as="button" aria-label="Connect Style" />}
                >
                  <Dropdown
                    size="sm"
                    fullWidth
                    aria-label="Style"
                    options={STYLE_OPTIONS}
                    value={style}
                    onValueChange={setStyle}
                  />
                </NodeRow>
                <NodeRow
                  label="Cell size"
                  labelProps={{ 'data-scrub': true }}
                  input={<NodeSocket as="button" aria-label="Connect Cell size" />}
                >
                  {numberField('Cell size', cellSize, 'px', setCellSize)}
                </NodeRow>
                <NodeRow
                  label="Angle"
                  driven
                  input={<NodeSocket as="button" connected aria-label="Connect Angle" />}
                >
                  <span className="docs-node-driver">
                    <Tag tone="accent">Node</Tag>
                  </span>
                  <Input
                    size="sm"
                    font="mono"
                    align="end"
                    aria-label="Angle, driven by Wave 1"
                    value="38"
                    suffix="°"
                    disabled
                  />
                </NodeRow>
                <NodeRow label="Blend">
                  <Dropdown
                    size="sm"
                    fullWidth
                    aria-label="Blend"
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'multiply', label: 'Multiply' },
                    ]}
                    defaultValue="normal"
                  />
                </NodeRow>
              </NodeRows>
            </SidebarSection>
          </Sidebar>
        </div>
        <p className="section-note">
          Blend has no socket, yet its label lines up with the others: the gutter is reserved on
          every row.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Input, NodeRow, NodeRows, NodeSocket } from '@presentstandards/framekit-ui';

<NodeRows placement="edge">
  {/* Flow row: ■ In  photo.jpg  Out ■ */}
  <NodeRow
    label="In"
    outputLabel="Out"
    input={<NodeSocket as="button" lane="pixels" connected aria-label="Connect In" />}
    output={<NodeSocket as="button" lane="pixels" aria-label="Drag to connect Out" />}
  >
    <span>photo.jpg</span>
  </NodeRow>

  {/* Setting row with a scrub label; driven while a wire owns it. */}
  <NodeRow
    label="Cell size"
    labelProps={{ 'data-scrub': true, onPointerDown: startScrub }}
    driven={isWired}
    input={<NodeSocket as="button" connected={isWired} aria-label="Connect Cell size" />}
  >
    <Input size="sm" aria-label="Cell size" value={cellSize} suffix="px" disabled={isWired} />
  </NodeRow>

  {/* Output row: name and live readout beside the socket. */}
  <NodeRow outputLabel="Pixels" meta="1920×1280" output={<NodeSocket as="button" lane="pixels" />} />
</NodeRows>`}</code>
        </pre>
      </Section>
    </>
  );
}
