import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Button, Frame, PlayIcon, Tag } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type CanvasFrameId = 'hero' | 'story';
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

const CANVAS_INSET = 20;
const MIN_FRAME_WIDTH = 120;
const MIN_FRAME_HEIGHT = 96;
const HANDLE_HIT_AREA = 18;

const INITIAL_CANVAS_FRAMES: readonly CanvasFrame[] = [
  {
    id: 'hero',
    name: 'Hero desktop',
    x: 250,
    y: 82,
    width: 320,
    height: 200,
  },
  {
    id: 'story',
    name: 'Story',
    x: 62,
    y: 202,
    width: 136,
    height: 212,
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

export function Frames() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<PointerOperation | null>(null);
  const [canvasFrames, setCanvasFrames] = useState<CanvasFrame[]>([...INITIAL_CANVAS_FRAMES]);
  const [activeFrameId, setActiveFrameId] = useState<CanvasFrameId>('hero');
  const [recording, setRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingSelected, setRecordingSelected] = useState(false);
  const [isRecordingPlaying, setIsRecordingPlaying] = useState(false);
  const playbackFrameRef = useRef<number | null>(null);
  const playbackRunRef = useRef(0);

  useEffect(
    () => () => {
      playbackRunRef.current += 1;
      if (playbackFrameRef.current != null) cancelAnimationFrame(playbackFrameRef.current);
    },
    []
  );

  const stopRecordingPlayback = () => {
    playbackRunRef.current += 1;
    if (playbackFrameRef.current != null) {
      cancelAnimationFrame(playbackFrameRef.current);
      playbackFrameRef.current = null;
    }
    setIsRecordingPlaying(false);
  };

  const playRecording = () => {
    stopRecordingPlayback();
    setRecording(true);
    setRecordingProgress(0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRecordingProgress(1);
      return;
    }

    const playbackRun = playbackRunRef.current;
    setIsRecordingPlaying(true);
    playbackFrameRef.current = requestAnimationFrame((startedAt) => {
      if (playbackRun !== playbackRunRef.current) return;

      const animate = (now: number) => {
        if (playbackRun !== playbackRunRef.current) return;

        const nextProgress = Math.min((now - startedAt) / 2200, 1);
        setRecordingProgress(nextProgress);
        if (nextProgress < 1) {
          playbackFrameRef.current = requestAnimationFrame(animate);
        } else {
          playbackFrameRef.current = null;
          setIsRecordingPlaying(false);
        }
      };

      playbackFrameRef.current = requestAnimationFrame(animate);
    });
  };

  const clearRecording = () => {
    stopRecordingPlayback();
    setRecording(false);
    setRecordingProgress(0);
  };

  const updateFrame = (id: CanvasFrameId, update: (frame: CanvasFrame) => CanvasFrame) => {
    setCanvasFrames((current) => current.map((frame) => (frame.id === id ? update(frame) : frame)));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>, frame: CanvasFrame) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    setActiveFrameId(frame.id);

    // Selecting a different frame is deliberately a separate gesture; once it
    // is selected, its visible corner handles offer the resize affordance.
    if (frame.id !== activeFrameId) return;

    const corner = cornerAt(event);
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
    const canvas = canvasRef.current;
    if (!interaction || !canvas) return;

    const canvasBounds = canvas.getBoundingClientRect();
    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    const maximumX = canvasBounds.width - CANVAS_INSET;
    const maximumY = canvasBounds.height - CANVAS_INSET;

    updateFrame(interaction.id, () => {
      const next = { ...interaction.initial };

      if (interaction.kind === 'move') {
        next.x = clamp(
          interaction.initial.x + deltaX,
          CANVAS_INSET,
          maximumX - interaction.initial.width
        );
        next.y = clamp(
          interaction.initial.y + deltaY,
          CANVAS_INSET,
          maximumY - interaction.initial.height
        );
        return next;
      }

      if (interaction.corner?.includes('left')) {
        next.x = clamp(
          interaction.initial.x + deltaX,
          CANVAS_INSET,
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
          CANVAS_INSET,
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
    const canvas = canvasRef.current;
    const canvasBounds = canvas?.getBoundingClientRect();
    if (!canvasBounds) return;
    updateFrame(frame.id, (current) => ({
      ...current,
      x: clamp(current.x + deltaX, CANVAS_INSET, canvasBounds.width - CANVAS_INSET - current.width),
      y: clamp(
        current.y + deltaY,
        CANVAS_INSET,
        canvasBounds.height - CANVAS_INSET - current.height
      ),
    }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Frame"
        lede="A named design surface for canvas-based creative tools. Frame provides the boundary and selected-state affordance, while your application owns canvas position, movement, resizing, and actions."
      />

      <Section title="Canvas surfaces">
        <p className="section-intro">
          A frame gives an artboard a quiet, precise edge without turning it into a panel. Keep its
          visible name in Inter, then place the work itself inside the clipped surface.
        </p>
        <div className="demo">
          <div className="frame-showcase" ref={canvasRef} aria-label="Interactive frame canvas">
            <div className="frame-showcase__canvas">
              {canvasFrames.map((frame) => (
                <Frame
                  className="frame-showcase__frame"
                  key={frame.id}
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
              ))}
            </div>
          </div>
        </div>
        <p className="section-note">
          Drag a selected frame by its surface, then drag any corner handle to resize it. Arrow keys
          nudge a focused frame by 1px; hold <code>Shift</code> to move in 10px steps. The demo owns
          these interactions—<code>Frame</code> itself stays focused on the shared visual boundary.
        </p>
      </Section>

      <Section title="Recording progress">
        <p className="section-intro">
          A frame can expose capture or render progress without introducing extra canvas chrome. One
          accent line sits just outside the frame edge, starting at the top-left corner and
          travelling around the otherwise blank surface.
        </p>
        <div className="demo">
          <div className="frame-recording-showcase">
            <Frame
              name="Interview take"
              selected={recordingSelected}
              recording={recording}
              recordingProgress={recordingProgress}
              width="244px"
              aspectRatio="4 / 5"
            />
            <div className="frame-recording-controls">
              <div>
                <Tag>Frame activation</Tag>
                <strong>
                  {isRecordingPlaying
                    ? 'Capture in progress'
                    : recordingProgress === 1
                      ? 'Capture complete'
                      : 'Ready to capture'}
                </strong>
                <p>
                  {recording
                    ? `${Math.round(recordingProgress * 100)}% of the frame outline captured.`
                    : 'Play the full recording to preview the accent outline.'}
                </p>
              </div>
              <div className="frame-recording-controls__actions">
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  iconStart={<PlayIcon />}
                  onClick={playRecording}
                >
                  {isRecordingPlaying ? 'Playing recording' : 'Play recording'}
                </Button>
                <Button
                  size="sm"
                  variant={recordingSelected ? 'secondary' : 'ghost'}
                  fullWidth
                  aria-pressed={recordingSelected}
                  onClick={() => setRecordingSelected((selected) => !selected)}
                >
                  {recordingSelected ? 'Deselect frame' : 'Select frame'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  fullWidth
                  disabled={!recording}
                  onClick={clearRecording}
                >
                  Clear recording
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Selection stays legible">
        <p className="section-intro">
          A selected frame gets one accent edge and four small resize handles. The default state is
          deliberately quiet, so an open canvas with several frames remains easy to scan.
        </p>
        <div className="frame-state-showcase">
          <div className="frame-state-showcase__sample">
            <Tag>Default</Tag>
            <Frame name="Notes" width="176px" aspectRatio="4 / 3" />
          </div>
          <div className="frame-state-showcase__sample">
            <Tag>Selected</Tag>
            <Frame name="Notes" selected width="176px" aspectRatio="4 / 3" />
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Frame } from '@presentstandards/framekit-ui';

<Frame
  name="Campaign post"
  selected={selectedFrameId === 'campaign-post'}
  width="320px"
  aspectRatio="4 / 5"
  tabIndex={0}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
