import { useRef, useState } from 'react';
import {
  AxisField,
  Button,
  ColorField,
  EyeOpenIcon,
  GridIcon,
  Input,
  LayerRow,
  LayersIcon,
  OpenInNewWindowIcon,
  PinLeftIcon,
  ResetIcon,
  SearchField,
  Sidebar as FrameKitSidebar,
  SidebarSection,
  Slider,
  ToneCurve,
  ToggleRow,
  type SidebarPosition,
  type ToneCurvePoint,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const STARTING_POSITION: SidebarPosition = { x: 40, y: 52 };
const CURVE_POPOUT_POSITION: SidebarPosition = { x: 304, y: 44 };
const AXIS_POPOUT_POSITION: SidebarPosition = { x: 382, y: 370 };
const INITIAL_CURVE: ToneCurvePoint[] = [
  { id: 'dock-black', x: 0, y: 0.04 },
  { id: 'dock-shadow', x: 0.26, y: 0.19 },
  { id: 'dock-highlight', x: 0.72, y: 0.84 },
  { id: 'dock-white', x: 1, y: 0.97 },
];

export function SidebarPage() {
  const [opacity, setOpacity] = useState(82);
  const [blur, setBlur] = useState(18);
  const [colour, setColour] = useState('#3b67de');
  const [position, setPosition] = useState<SidebarPosition>(STARTING_POSITION);
  const [offset, setOffset] = useState({ x: 0.42, y: 0.58 });
  const [visible, setVisible] = useState(true);
  const [curveDetached, setCurveDetached] = useState(true);
  const [axisDetached, setAxisDetached] = useState(false);
  const [curvePosition, setCurvePosition] = useState<SidebarPosition>(CURVE_POPOUT_POSITION);
  const [axisPosition, setAxisPosition] = useState<SidebarPosition>(AXIS_POPOUT_POSITION);
  const [curve, setCurve] = useState<ToneCurvePoint[]>(INITIAL_CURVE);
  const [axisValue, setAxisValue] = useState({ x: 0.36, y: 0.64 });
  const curvePopoutRef = useRef<HTMLButtonElement>(null);
  const axisPopoutRef = useRef<HTMLButtonElement>(null);
  const curvePanelRef = useRef<HTMLElement>(null);
  const axisPanelRef = useRef<HTMLElement>(null);
  const detachedCount = Number(curveDetached) + Number(axisDetached);

  const moveTool = (tool: 'curve' | 'axis', detached: boolean) => {
    if (tool === 'curve') setCurveDetached(detached);
    else setAxisDetached(detached);

    requestAnimationFrame(() => {
      if (detached) {
        const panel = tool === 'curve' ? curvePanelRef.current : axisPanelRef.current;
        panel?.querySelector<HTMLButtonElement>('.fk-sidebar__drag-handle')?.focus();
      } else {
        (tool === 'curve' ? curvePopoutRef.current : axisPopoutRef.current)?.focus();
      }
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Sidebar"
        lede="A reusable inspector shell for creative tools, with a structured header when needed plus consistent sections, scrolling, and footer structure. Use it as a simple panel, attach it to either workspace edge, or let users reposition a bounded floating sidebar."
      />

      <Section title="Panel sidebar">
        <p className="section-intro">
          The default panel treatment is the direct component equivalent of the Simple sidebar
          pattern. <code>SidebarSection</code> keeps labels, gaps, and full-width dividers aligned
          while the regular Frame Kit controls remain application-owned. Keep the header to two
          distinct levels: a title plus useful context, or a category plus title.
        </p>
        <div className="demo sidebar-panel-demo">
          <FrameKitSidebar
            title="Hero card"
            description="Shape · Hero composition"
            actions={
              <Button
                variant="ghost"
                size="sm"
                iconStart={<EyeOpenIcon />}
                aria-label="Layer visible"
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
              />
            }
            footer={
              <Button variant="ghost" size="sm" fullWidth>
                Reset properties
              </Button>
            }
          >
            <SidebarSection label="Layout">
              <div className="sidebar-demo__input-grid">
                <Input size="sm" label="X" suffix="PX" font="mono" align="end" defaultValue="128" />
                <Input size="sm" label="Y" suffix="PX" font="mono" align="end" defaultValue="96" />
              </div>
            </SidebarSection>
            <SidebarSection label="Appearance">
              <ColorField value={colour} onChange={setColour} fullWidth pickerLabel="Fill colour" />
              <Slider
                size="sm"
                label="Opacity"
                value={opacity}
                onValueChange={setOpacity}
                formatValue={(value) => `${Math.round(value)}%`}
              />
            </SidebarSection>
          </FrameKitSidebar>
        </div>
      </Section>

      <Section title="Headerless sidebar">
        <p className="section-intro">
          Use <code>headerless</code> when the content already identifies itself: an embedded
          property group, a compact search panel, or a focused tool. It composes with the panel,
          docked, and floating placements. A supplied title remains the accessible name without
          creating a visible header.
        </p>
        <div className="demo sidebar-headerless-demo">
          <FrameKitSidebar
            headerless
            title="Quick appearance controls"
            density="compact"
            width={272}
            footer={
              <Button size="sm" variant="ghost" fullWidth>
                Reset appearance
              </Button>
            }
          >
            <SidebarSection label="Appearance">
              <Slider
                size="sm"
                label="Opacity"
                value={opacity}
                onValueChange={setOpacity}
                formatValue={(value) => `${Math.round(value)}%`}
              />
              <ToggleRow
                label="Clip content"
                checked={visible}
                onChange={(event) => setVisible(event.target.checked)}
              />
            </SidebarSection>
          </FrameKitSidebar>
        </div>
      </Section>

      <Section title="Docked workspace">
        <p className="section-intro">
          Docked sidebars become part of the workspace edge. The side prop puts the single dividing
          rule on the correct inner edge, and compact density keeps persistent inspectors efficient.
        </p>
        <div className="sidebar-workspace-demo">
          <FrameKitSidebar
            variant="docked"
            side="left"
            density="compact"
            width="100%"
            title="Layers"
            description="3 objects"
          >
            <SidebarSection>
              <SearchField size="sm" aria-label="Search layers" placeholder="Search layers" />
            </SidebarSection>
            <SidebarSection label="Scene">
              <LayerRow label="Hero card" meta="Shape" icon={<LayersIcon />} selected />
              <LayerRow label="Headline" meta="Text" icon={<LayersIcon />} />
              <LayerRow label="Backdrop" meta="Image" icon={<LayersIcon />} />
            </SidebarSection>
          </FrameKitSidebar>

          <div className="sidebar-workspace-demo__canvas" aria-label="Example canvas area">
            <div className="sidebar-workspace-demo__toolbar" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="sidebar-workspace-demo__frame">
              <span className="fk-tag">Canvas</span>
              <strong>Hero composition</strong>
              <div />
            </div>
          </div>

          <FrameKitSidebar
            variant="docked"
            side="right"
            density="compact"
            width="100%"
            title="Properties"
            description="Hero card"
          >
            <SidebarSection label="Transform">
              <div className="sidebar-demo__input-grid">
                <Input size="sm" label="W" suffix="PX" font="mono" align="end" defaultValue="640" />
                <Input size="sm" label="H" suffix="PX" font="mono" align="end" defaultValue="384" />
              </div>
            </SidebarSection>
            <SidebarSection label="Effects">
              <Slider
                size="sm"
                label="Blur"
                max={64}
                value={blur}
                onValueChange={setBlur}
                formatValue={(value) => `${Math.round(value)} px`}
              />
              <ToggleRow
                label="Clip content"
                checked={visible}
                onChange={(event) => setVisible(event.target.checked)}
              />
            </SidebarSection>
          </FrameKitSidebar>
        </div>
      </Section>

      <Section title="Floating and draggable">
        <p className="section-intro">
          A floating sidebar can expose a dedicated drag handle without making its inputs or actions
          compete with movement. This example is controlled and bounded to the stage; the same
          component can use viewport bounds for application-level utility panels.
        </p>
        <div className="sidebar-floating-demo">
          <div className="sidebar-floating-demo__status">
            <span className="fk-tag">Position</span>
            <output aria-live="polite">
              {Math.round(position.x)}, {Math.round(position.y)}
            </output>
            <Button
              variant="ghost"
              size="sm"
              iconStart={<ResetIcon />}
              onClick={() => setPosition(STARTING_POSITION)}
            >
              Reset panel
            </Button>
          </div>
          <div className="sidebar-floating-demo__backdrop" aria-hidden="true">
            <GridIcon size={16} />
            <div />
          </div>
          <FrameKitSidebar
            variant="floating"
            density="compact"
            draggable
            position={position}
            defaultPosition={STARTING_POSITION}
            onPositionChange={setPosition}
            bounds="parent"
            width={286}
            title="Shadow field"
            description="Drag from the six-dot handle"
            actions={
              <Button
                variant="ghost"
                size="sm"
                iconStart={<EyeOpenIcon />}
                aria-label="Preview effect"
              />
            }
            footer={
              <Button size="sm" fullWidth>
                Apply effect
              </Button>
            }
          >
            <SidebarSection label="Direction">
              <AxisField
                label="Shadow offset"
                xLabel="Horizontal offset"
                yLabel="Vertical offset"
                value={offset}
                onValueChange={setOffset}
              />
            </SidebarSection>
            <SidebarSection label="Finish">
              <Slider
                size="sm"
                label="Opacity"
                value={opacity}
                onValueChange={setOpacity}
                formatValue={(value) => `${Math.round(value)}%`}
              />
              <ColorField
                value={colour}
                onChange={setColour}
                fullWidth
                pickerLabel="Shadow colour"
              />
            </SidebarSection>
          </FrameKitSidebar>
        </div>
        <p className="section-note">
          Drag from the handle, or focus it and use Arrow keys for 1px movement. Hold{' '}
          <code>Shift</code> for 10px steps; press <code>Home</code> to restore the starting
          position. Pointer movement is immediate and never animated behind the cursor.
        </p>
      </Section>

      <Section title="Dockable tool panels">
        <p className="section-intro">
          Individual controls can leave a larger inspector and become focused floating tools. The
          application keeps each value and position controlled, so edits survive the transition and
          every tool can move independently before docking back into its original section.
        </p>
        <div className="sidebar-undock-demo">
          <FrameKitSidebar
            variant="docked"
            side="left"
            density="compact"
            width="100%"
            title="Grade inspector"
            description={`${2 - detachedCount} docked · ${detachedCount} floating`}
            footer={
              <Button
                size="sm"
                variant="ghost"
                fullWidth
                disabled={detachedCount === 0}
                onClick={() => {
                  setCurveDetached(false);
                  setAxisDetached(false);
                  requestAnimationFrame(() => curvePopoutRef.current?.focus());
                }}
              >
                Dock all tools
              </Button>
            }
          >
            <SidebarSection
              label="Tone curve"
              actions={
                !curveDetached && (
                  <Button
                    ref={curvePopoutRef}
                    size="sm"
                    variant="ghost"
                    iconStart={<OpenInNewWindowIcon />}
                    aria-label="Pop out Tone curve"
                    title="Pop out Tone curve"
                    onClick={() => moveTool('curve', true)}
                  />
                )
              }
            >
              {curveDetached ? (
                <button
                  type="button"
                  className="sidebar-undock-demo__placeholder"
                  aria-label="Dock Tone curve"
                  onClick={() => moveTool('curve', false)}
                >
                  <span>
                    <strong>Tone curve</strong>
                    <span>Floating on canvas</span>
                  </span>
                  <PinLeftIcon size={13} aria-hidden="true" />
                </button>
              ) : (
                <ToneCurve
                  value={curve}
                  onValueChange={setCurve}
                  label="Docked luminance tone curve"
                />
              )}
            </SidebarSection>

            <SidebarSection
              label="Balance point"
              actions={
                !axisDetached && (
                  <Button
                    ref={axisPopoutRef}
                    size="sm"
                    variant="ghost"
                    iconStart={<OpenInNewWindowIcon />}
                    aria-label="Pop out Balance point"
                    title="Pop out Balance point"
                    onClick={() => moveTool('axis', true)}
                  />
                )
              }
            >
              {axisDetached ? (
                <button
                  type="button"
                  className="sidebar-undock-demo__placeholder"
                  aria-label="Dock Balance point"
                  onClick={() => moveTool('axis', false)}
                >
                  <span>
                    <strong>Balance point</strong>
                    <span>Floating on canvas</span>
                  </span>
                  <PinLeftIcon size={13} aria-hidden="true" />
                </button>
              ) : (
                <AxisField
                  label="Docked balance point"
                  xLabel="Warmth"
                  yLabel="Tint"
                  value={axisValue}
                  onValueChange={setAxisValue}
                />
              )}
            </SidebarSection>
          </FrameKitSidebar>

          <div className="sidebar-undock-demo__canvas" aria-hidden="true">
            <div className="sidebar-undock-demo__canvas-frame">
              <span className="fk-tag">Working canvas</span>
              <strong>Reframe the workspace</strong>
              <p>
                Keep a high-frequency tool close to the work, then dock it when the edit is done.
              </p>
            </div>
          </div>

          <div className="sidebar-undock-demo__status" aria-live="polite">
            <span className="fk-tag">Workspace</span>
            <span>{detachedCount === 0 ? 'All tools docked' : `${detachedCount} floating`}</span>
          </div>

          <div className="sidebar-undock-demo__float-layer">
            {curveDetached && (
              <FrameKitSidebar
                ref={curvePanelRef}
                variant="floating"
                density="compact"
                draggable
                width={286}
                title="Tone curve"
                description="Luminance · state preserved"
                position={curvePosition}
                defaultPosition={CURVE_POPOUT_POSITION}
                onPositionChange={setCurvePosition}
                bounds="parent"
                dragLabel="Move Tone curve panel"
                actions={
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<PinLeftIcon />}
                    aria-label="Dock Tone curve"
                    title="Dock Tone curve"
                    onClick={() => moveTool('curve', false)}
                  />
                }
              >
                <SidebarSection>
                  <ToneCurve
                    value={curve}
                    onValueChange={setCurve}
                    label="Floating luminance tone curve"
                  />
                </SidebarSection>
              </FrameKitSidebar>
            )}

            {axisDetached && (
              <FrameKitSidebar
                ref={axisPanelRef}
                variant="floating"
                density="compact"
                draggable
                width={268}
                title="Balance point"
                description="Warmth and tint"
                position={axisPosition}
                defaultPosition={AXIS_POPOUT_POSITION}
                onPositionChange={setAxisPosition}
                bounds="parent"
                dragLabel="Move Balance point panel"
                actions={
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<PinLeftIcon />}
                    aria-label="Dock Balance point"
                    title="Dock Balance point"
                    onClick={() => moveTool('axis', false)}
                  />
                }
              >
                <SidebarSection>
                  <AxisField
                    label="Floating balance point"
                    xLabel="Warmth"
                    yLabel="Tint"
                    value={axisValue}
                    onValueChange={setAxisValue}
                  />
                </SidebarSection>
              </FrameKitSidebar>
            )}
          </div>
        </div>
        <p className="section-note">
          Use the pop-out action beside either tool, then drag from its dedicated handle. Docking
          returns the live controlled value—not a reset or visual copy—to the same sidebar section.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import {
  Sidebar,
  SidebarSection,
  type SidebarPosition,
} from '@presentstandards/framekit-ui';

const [position, setPosition] = useState<SidebarPosition>({ x: 24, y: 24 });

<div style={{ position: 'relative', minHeight: 480 }}>
  <Sidebar
    variant="floating"
    draggable
    title="Properties"
    eyebrow="Inspector"
    position={position}
    defaultPosition={{ x: 24, y: 24 }}
    onPositionChange={setPosition}
    bounds="parent"
    footer={<Button fullWidth>Apply</Button>}
  >
    <SidebarSection label="Appearance">
      <ColorField value={colour} onChange={setColour} fullWidth />
      <Slider label="Opacity" value={opacity} onValueChange={setOpacity} />
    </SidebarSection>
  </Sidebar>
</div>`}</code>
        </pre>
      </Section>
    </>
  );
}
