import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  ContextMenu,
  type ContextMenuItem,
  CopyIcon,
  Frame,
  LayersIcon,
  Pencil1Icon,
  Tag,
  TrashIcon,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type CanvasFrameId = 'campaign' | 'story';
type ResizeCorner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';

interface CanvasFrame {
  id: CanvasFrameId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PointerOperation {
  id: CanvasFrameId;
  kind: 'move' | 'resize';
  corner?: ResizeCorner;
  startX: number;
  startY: number;
  initial: CanvasFrame;
}

const STAGE_INSET = 28;
const MIN_FRAME_WIDTH = 120;
const MIN_FRAME_HEIGHT = 96;
const HANDLE_HIT_AREA = 18;

const INITIAL_CANVAS_FRAMES: readonly CanvasFrame[] = [
  {
    id: 'campaign',
    name: 'Campaign post',
    x: 258,
    y: 82,
    width: 260,
    height: 325,
  },
  {
    id: 'story',
    name: 'Story',
    x: 76,
    y: 208,
    width: 132,
    height: 234,
  },
];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function cornerAt(event: ReactPointerEvent<HTMLDivElement>): ResizeCorner | undefined {
  const bounds = event.currentTarget.getBoundingClientRect();
  const fromLeft = event.clientX - bounds.left <= HANDLE_HIT_AREA;
  const fromRight = bounds.right - event.clientX <= HANDLE_HIT_AREA;
  const fromTop = event.clientY - bounds.top <= HANDLE_HIT_AREA;
  const fromBottom = bounds.bottom - event.clientY <= HANDLE_HIT_AREA;

  if (fromTop && fromLeft) return 'top-left';
  if (fromTop && fromRight) return 'top-right';
  if (fromBottom && fromRight) return 'bottom-right';
  if (fromBottom && fromLeft) return 'bottom-left';
  return undefined;
}

export function FrameCanvas() {
  const stageRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<PointerOperation | null>(null);
  const [canvasFrames, setCanvasFrames] = useState<CanvasFrame[]>([...INITIAL_CANVAS_FRAMES]);
  const [activeFrameId, setActiveFrameId] = useState<CanvasFrameId>('campaign');
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastAction, setLastAction] = useState('Campaign post selected');

  const updateFrame = (id: CanvasFrameId, update: (frame: CanvasFrame) => CanvasFrame) => {
    setCanvasFrames((current) => current.map((frame) => (frame.id === id ? update(frame) : frame)));
  };

  const contextMenuItems = (frame: CanvasFrame): readonly ContextMenuItem[] => [
    {
      id: 'rename',
      label: 'Rename frame',
      icon: <Pencil1Icon />,
      shortcut: '⌘R',
      onSelect: () => setLastAction(`${frame.name} ready to rename`),
    },
    {
      id: 'duplicate',
      label: 'Duplicate frame',
      icon: <CopyIcon />,
      shortcut: '⌘D',
      onSelect: () => setLastAction(`${frame.name} duplicated`),
    },
    { type: 'separator', id: 'primary-separator' },
    {
      type: 'submenu',
      id: 'arrange',
      label: 'Arrange',
      icon: <LayersIcon />,
      items: [
        {
          id: 'front',
          label: 'Bring to front',
          shortcut: '⌘]',
          onSelect: () => setLastAction(`${frame.name} brought to front`),
        },
        {
          id: 'back',
          label: 'Send to back',
          shortcut: '⌘[',
          onSelect: () => setLastAction(`${frame.name} sent to back`),
        },
      ],
    },
    { type: 'separator', id: 'danger-separator' },
    {
      id: 'delete',
      label: 'Delete frame',
      icon: <TrashIcon />,
      shortcut: '⌫',
      tone: 'danger',
      onSelect: () => setLastAction(`${frame.name} marked for deletion`),
    },
  ];

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>, frame: CanvasFrame) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    setActiveFrameId(frame.id);
    setLastAction(`${frame.name} selected`);

    const corner = frame.id === activeFrameId ? cornerAt(event) : undefined;
    interactionRef.current = {
      id: frame.id,
      kind: corner ? 'resize' : 'move',
      corner,
      startX: event.clientX,
      startY: event.clientY,
      initial: { ...frame },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const interaction = interactionRef.current;
    const stage = stageRef.current;
    if (!interaction || !stage) return;

    const stageBounds = stage.getBoundingClientRect();
    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    const maximumX = stageBounds.width - STAGE_INSET;
    const maximumY = stageBounds.height - STAGE_INSET;

    updateFrame(interaction.id, () => {
      const next = { ...interaction.initial };

      if (interaction.kind === 'move') {
        next.x = clamp(
          interaction.initial.x + deltaX,
          STAGE_INSET,
          maximumX - interaction.initial.width
        );
        next.y = clamp(
          interaction.initial.y + deltaY,
          STAGE_INSET,
          maximumY - interaction.initial.height
        );
        return next;
      }

      if (interaction.corner?.includes('left')) {
        next.x = clamp(
          interaction.initial.x + deltaX,
          STAGE_INSET,
          interaction.initial.x + interaction.initial.width - MIN_FRAME_WIDTH
        );
        next.width = interaction.initial.width + interaction.initial.x - next.x;
      }
      if (interaction.corner?.includes('right')) {
        next.width = clamp(
          interaction.initial.width + deltaX,
          MIN_FRAME_WIDTH,
          maximumX - interaction.initial.x
        );
      }
      if (interaction.corner?.includes('top')) {
        next.y = clamp(
          interaction.initial.y + deltaY,
          STAGE_INSET,
          interaction.initial.y + interaction.initial.height - MIN_FRAME_HEIGHT
        );
        next.height = interaction.initial.height + interaction.initial.y - next.y;
      }
      if (interaction.corner?.includes('bottom')) {
        next.height = clamp(
          interaction.initial.height + deltaY,
          MIN_FRAME_HEIGHT,
          maximumY - interaction.initial.y
        );
      }

      return next;
    });
  };

  const finishPointerOperation = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    interactionRef.current = null;
  };

  const handleFrameKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, frame: CanvasFrame) => {
    const amount = event.shiftKey ? 10 : 1;
    let deltaX = 0;
    let deltaY = 0;
    if (event.key === 'ArrowLeft') deltaX = -amount;
    if (event.key === 'ArrowRight') deltaX = amount;
    if (event.key === 'ArrowUp') deltaY = -amount;
    if (event.key === 'ArrowDown') deltaY = amount;
    if (!deltaX && !deltaY) return;

    event.preventDefault();
    setActiveFrameId(frame.id);
    const stageBounds = stageRef.current?.getBoundingClientRect();
    if (!stageBounds) return;
    updateFrame(frame.id, (current) => ({
      ...current,
      x: clamp(current.x + deltaX, STAGE_INSET, stageBounds.width - STAGE_INSET - current.width),
      y: clamp(current.y + deltaY, STAGE_INSET, stageBounds.height - STAGE_INSET - current.height),
    }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Ready Made"
        title="Frame canvas"
        lede="A focused campaign workspace where selected artboards and contextual actions use the normal Frame Kit primitives. It shows the direct-manipulation and right-click workflows in the places designers expect them."
      />

      <Section title="Campaign artboards">
        <p className="section-intro">
          Drag any frame to reposition it. Select a frame, then drag one of its corner squares to
          resize it. Right-click either artboard for actions; keyboard users can focus a frame and
          press <code>Shift</code> + <code>F10</code> or the Context Menu key.
        </p>
        <div className="demo">
          <div className="ready-frame-canvas">
            <div className="ready-frame-canvas__chrome">
              <Tag>Campaign / Spring launch</Tag>
              <span>{menuOpen ? 'Frame actions open' : 'Canvas · 2 frames'}</span>
            </div>
            <div className="ready-frame-canvas__stage" ref={stageRef} aria-label="Campaign canvas">
              {canvasFrames.map((frame) => (
                <ContextMenu
                  items={contextMenuItems(frame)}
                  key={frame.id}
                  label={`${frame.name} frame actions`}
                  onOpenChange={setMenuOpen}
                >
                  <Frame
                    className="ready-frame-canvas__frame"
                    name={frame.name}
                    selected={activeFrameId === frame.id}
                    width={frame.width}
                    height={frame.height}
                    tabIndex={0}
                    aria-label={`Edit ${frame.name} frame`}
                    style={{ left: frame.x, top: frame.y }}
                    onPointerDown={(event) => handlePointerDown(event, frame)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerOperation}
                    onPointerCancel={finishPointerOperation}
                    onKeyDown={(event) => handleFrameKeyDown(event, frame)}
                  />
                </ContextMenu>
              ))}
            </div>
          </div>
          <p className="ready-frame-canvas__status" role="status" aria-live="polite">
            {lastAction}
          </p>
        </div>
      </Section>

      <Section title="Why this composition works">
        <div className="ready-frame-guidance">
          <div>
            <Tag>Canvas</Tag>
            <strong>Frames are the objects</strong>
            <p>Names stay attached to each artboard, not hidden in a detached panel.</p>
          </div>
          <div>
            <Tag>Selection</Tag>
            <strong>One clear current frame</strong>
            <p>
              The accent edge and direct corner handles identify the active object without colouring
              the entire canvas.
            </p>
          </div>
          <div>
            <Tag>Actions</Tag>
            <strong>Context stays at the frame</strong>
            <p>
              Rename, duplicate, arrange, and delete belong in the right-click menu for that exact
              frame.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
