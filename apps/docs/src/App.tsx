import { useEffect, useRef, useState, type JSX } from 'react';
import { Sidebar } from './components/Sidebar';
import { Landing } from './Landing';
import { hashForRoute, pageTitle, routeFromHash, type PageId, type Route } from './nav';
import { SpecPage } from './pages/Spec';
import { Introduction } from './pages/Introduction';
import { LocalSetup } from './pages/LocalSetup';
import { NpmSetup } from './pages/NpmSetup';
import {
  AIDirection,
  ClaudeDirection,
  FrameKitSkill,
  GPTCodexDirection,
} from './pages/AIDirection';
import { Colors } from './pages/Colors';
import { Typography } from './pages/Typography';
import { Spacing } from './pages/Spacing';
import { Elevation } from './pages/Elevation';
import { Motion } from './pages/Motion';
import { Icons } from './pages/Icons';
import { Components } from './pages/Components';
import { Buttons } from './pages/Buttons';
import { LoaderPage } from './pages/Loader';
import { DropZonePage } from './pages/DropZonePage';
import { Inputs } from './pages/Inputs';
import { StepperPage } from './pages/Stepper';
import { SliderPage } from './pages/Slider';
import { RulerSliderPage } from './pages/RulerSlider';
import { RulerReadoutsPage } from './pages/RulerReadouts';
import { DragValuePage } from './pages/DragValue';
import { ScrubberPage } from './pages/Scrubber';
import { SegmentedSwitches } from './pages/SegmentedSwitches';
import { TabsPage } from './pages/Tabs';
import { ChecksAndRadios } from './pages/ChecksAndRadios';
import { ToggleRows } from './pages/ToggleRows';
import { LayerRows } from './pages/LayerRows';
import { Frames } from './pages/Frames';
import { SidebarPage } from './pages/SidebarPage';
import { Dropdowns } from './pages/Dropdowns';
import { PopoverPage } from './pages/Popovers';
import { ContextMenuPage } from './pages/ContextMenuPage';
import { HoverCardsAndTooltips } from './pages/HoverCardsAndTooltips';
import { ToolbarPage } from './pages/Toolbar';
import { ColorPickerPage } from './pages/ColorPickerPage';
import { EasingGraphPage } from './pages/EasingGraphPage';
import { CameraPathPage } from './pages/CameraPathPage';
import { FocusCropPage } from './pages/FocusCropPage';
import { ModulationStripPage } from './pages/ModulationStripPage';
import { LoopComposerPage } from './pages/LoopComposerPage';
import { ToneCurvePage } from './pages/ToneCurvePage';
import { OrbitDialPage } from './pages/OrbitDialPage';
import { EnvelopeEditorPage } from './pages/EnvelopeEditorPage';
import { ColorBalanceWheelsPage } from './pages/ColorBalanceWheelsPage';
import { PerspectiveTransformPage } from './pages/PerspectiveTransformPage';
import { ValueGraphPage } from './pages/ValueGraphPage';
import { NodeCanvasPage } from './pages/NodeCanvasPage';
import { AxisFieldPage } from './pages/AxisFieldPage';
import { DirectionPadPage } from './pages/DirectionPadPage';
import { KeyframeLanePage } from './pages/KeyframeLanePage';
import { VideoTimelinePage } from './pages/VideoTimelinePage';
import { GradientEditorPage } from './pages/GradientEditorPage';
import { HistogramScopePage } from './pages/HistogramScopePage';
import { SpringResponsePage } from './pages/SpringResponsePage';
import { SidebarBuilder } from './pages/sidebar-builder/SidebarBuilderPage';
import { SimpleSidebar } from './pages/SimpleSidebar';
import { FrameCanvas } from './pages/FrameCanvas';
import { PhotographySidebar } from './pages/PhotographySidebar';
import { MotionToolbar } from './pages/MotionToolbar';
import { FontPicker } from './pages/FontPicker';
import { reapplyAccentForTheme } from './lib/accent-store';

const PAGES: Record<PageId, () => JSX.Element> = {
  introduction: Introduction,
  locally: LocalSetup,
  npm: NpmSetup,
  'ai-direction': AIDirection,
  'frame-kit-skill': FrameKitSkill,
  'gpt-codex': GPTCodexDirection,
  claude: ClaudeDirection,
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  elevation: Elevation,
  motion: Motion,
  icons: Icons,
  components: Components,
  buttons: Buttons,
  loader: LoaderPage,
  'drop-zone': DropZonePage,
  inputs: Inputs,
  stepper: StepperPage,
  slider: SliderPage,
  'ruler-slider': RulerSliderPage,
  'ruler-readouts': RulerReadoutsPage,
  'drag-value': DragValuePage,
  scrubber: ScrubberPage,
  'segmented-switch': SegmentedSwitches,
  tabs: TabsPage,
  'checks-radios': ChecksAndRadios,
  'toggle-rows': ToggleRows,
  'layer-rows': LayerRows,
  frames: Frames,
  sidebar: SidebarPage,
  dropdowns: Dropdowns,
  popover: PopoverPage,
  'context-menu': ContextMenuPage,
  'hover-cards-tooltips': HoverCardsAndTooltips,
  toolbar: ToolbarPage,
  'color-picker': ColorPickerPage,
  'easing-graph': EasingGraphPage,
  'camera-path': CameraPathPage,
  'focus-crop': FocusCropPage,
  'modulation-strip': ModulationStripPage,
  'loop-composer': LoopComposerPage,
  'tone-curve': ToneCurvePage,
  'orbit-dial': OrbitDialPage,
  'envelope-editor': EnvelopeEditorPage,
  'color-balance-wheels': ColorBalanceWheelsPage,
  'perspective-transform': PerspectiveTransformPage,
  'value-graph': ValueGraphPage,
  'node-canvas': NodeCanvasPage,
  'axis-field': AxisFieldPage,
  'direction-pad': DirectionPadPage,
  'keyframe-lane': KeyframeLanePage,
  'video-timeline': VideoTimelinePage,
  'gradient-editor': GradientEditorPage,
  'histogram-scope': HistogramScopePage,
  'spring-response': SpringResponsePage,
  'sidebar-builder': SidebarBuilder,
  'simple-sidebar': SimpleSidebar,
  'frame-canvas': FrameCanvas,
  'photography-sidebar': PhotographySidebar,
  'motion-toolbar': MotionToolbar,
  'font-picker': FontPicker,
};

function DocsApp() {
  const [route, setRoute] = useState<Route>(() => routeFromHash(window.location.hash));
  const mainRef = useRef<HTMLElement>(null);
  const didMount = useRef(false);

  useEffect(() => {
    const syncFromHash = () => {
      const next = routeFromHash(window.location.hash);
      // Normalize stale/invalid hashes so the URL matches what renders.
      if (window.location.hash && window.location.hash !== hashForRoute(next)) {
        history.replaceState(null, '', hashForRoute(next));
      }
      // Value-equality bailout: a redundant sync (mount, self-normalizing
      // hashchange) must not re-fire the scroll/focus-reset effect.
      setRoute((prev) => (prev.page === next.page && prev.spec === next.spec ? prev : next));
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    document.title = pageTitle(route);
    if (didMount.current) {
      mainRef.current?.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    } else {
      didMount.current = true;
    }
  }, [route]);

  const Page = PAGES[route.page];

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <Sidebar active={route.page} spec={route.spec} />
      <main
        className="main"
        id="main"
        data-page={route.page}
        data-spec={route.spec || undefined}
        ref={mainRef}
        tabIndex={-1}
      >
        <div
          className={
            route.page === 'sidebar-builder' && !route.spec ? 'content content--tool' : 'content'
          }
        >
          {route.spec ? <SpecPage page={route.page} /> : <Page />}
        </div>
      </main>
    </div>
  );
}

function isDocsLocation() {
  return window.location.hash.length > 1;
}

/** The public entrance lives at the empty URL. Existing hash routes remain the
 * documentation URL contract, so saved links and AI-readable specs keep
 * working without a second build or router dependency. */
export function App() {
  const [showDocs, setShowDocs] = useState(isDocsLocation);

  useEffect(() => {
    // Custom accents derive from the theme and should also colour the live
    // package previews on the entrance page.
    reapplyAccentForTheme();
  }, []);

  useEffect(() => {
    const syncView = () => setShowDocs(isDocsLocation());
    window.addEventListener('hashchange', syncView);
    return () => window.removeEventListener('hashchange', syncView);
  }, []);

  useEffect(() => {
    if (!showDocs) document.title = 'Frame Kit';
  }, [showDocs]);

  return showDocs ? <DocsApp /> : <Landing />;
}
