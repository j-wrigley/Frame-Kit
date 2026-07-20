import type { CatalogEntry } from '../types';
import { buttonEntry } from './button';
import { contextMenuEntry } from './context-menu';
import { disclosureEntry } from './disclosure';
import { dropZoneEntry } from './drop-zone';
import { frameEntry } from './frame';
import { hoverCardEntry } from './hover-card';
import { layerRowEntry } from './layer-row';
import { loaderEntry } from './loader';
import { popoverEntry } from './popover';
import { sidebarEntry } from './sidebar';
import { tagEntry } from './tag';
import { toolbarEntry } from './toolbar';
import { tooltipEntry } from './tooltip';
import { checkboxEntry } from './checkbox';
import { colorFieldEntry } from './color-field';
import { dragValueEntry } from './drag-value';
import { dropdownEntry } from './dropdown';
import { inlineRenameEntry } from './inline-rename';
import { inputEntry } from './input';
import { numberInputEntry } from './number-input';
import { rulerReadoutEntry } from './ruler-readout';
import { rulerSliderEntry } from './ruler-slider';
import { scrubberEntry } from './scrubber';
import { searchEntry } from './search';
import { segmentedEntry } from './segmented';
import { sliderEntry } from './slider';
import { stepperEntry } from './stepper';
import { tabsEntry } from './tabs';
import { toggleRowEntry } from './toggle-row';
import { axisFieldEntry } from './axis-field';
import { cameraPathEntry } from './camera-path';
import { colorWheelsEntry } from './color-wheels';
import { directionPadEntry } from './direction-pad';
import { easingEntry } from './easing';
import { envelopeEntry } from './envelope';
import { focusCropEntry } from './focus-crop';
import { gradientEntry } from './gradient';
import { histogramEntry } from './histogram';
import { keyframeLaneEntry } from './keyframe-lane';
import { loopEntry } from './loop';
import { modulationEntry } from './modulation';
import { nodeCanvasEntry } from './node-canvas';
import { orbitEntry } from './orbit';
import { perspectiveEntry } from './perspective';
import { springEntry } from './spring';
import { toneCurveEntry } from './tone-curve';
import { valueGraphEntry } from './value-graph';
import { videoTimelineEntry } from './video-timeline';

/** Every buildable Frame Kit element, structure → controls → creative.
 *  Each entry renders the real component and mirrors its real prop unions —
 *  when the kit changes, this library follows automatically. */
export const CATALOG: readonly CatalogEntry[] = [
  buttonEntry,
  contextMenuEntry,
  disclosureEntry,
  dropZoneEntry,
  frameEntry,
  hoverCardEntry,
  layerRowEntry,
  loaderEntry,
  popoverEntry,
  sidebarEntry,
  tagEntry,
  toolbarEntry,
  tooltipEntry,
  checkboxEntry,
  colorFieldEntry,
  dragValueEntry,
  dropdownEntry,
  inlineRenameEntry,
  inputEntry,
  numberInputEntry,
  rulerReadoutEntry,
  rulerSliderEntry,
  scrubberEntry,
  searchEntry,
  segmentedEntry,
  sliderEntry,
  stepperEntry,
  tabsEntry,
  toggleRowEntry,
  axisFieldEntry,
  cameraPathEntry,
  colorWheelsEntry,
  directionPadEntry,
  easingEntry,
  envelopeEntry,
  focusCropEntry,
  gradientEntry,
  histogramEntry,
  keyframeLaneEntry,
  loopEntry,
  modulationEntry,
  nodeCanvasEntry,
  orbitEntry,
  perspectiveEntry,
  springEntry,
  toneCurveEntry,
  valueGraphEntry,
  videoTimelineEntry,
];

const BY_KIND = new Map(CATALOG.map((entry) => [entry.kind, entry]));

export function entryFor(kind: string): CatalogEntry | null {
  return BY_KIND.get(kind) ?? null;
}
