import { ArrowRightIcon } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const SHIPPED = [
  {
    id: 'buttons',
    name: 'Button',
    status: 'stable',
    description: 'The command button — four weights, three sizes, icons, and selectable loaders.',
  },
  {
    id: 'loader',
    name: 'Loader',
    status: 'stable',
    description: 'Compact currentColor activity indicators in eight block-based styles.',
  },
  {
    id: 'drop-zone',
    name: 'Drop zone',
    status: 'stable',
    description:
      'A general transfer target for files, text, URLs, layers, clips, and application-specific payloads.',
  },
  {
    id: 'inputs',
    name: 'Input',
    status: 'stable',
    description:
      'Dense labelled fields, search, textareas, number steppers, and compact compose flows.',
  },
  {
    id: 'stepper',
    name: 'Stepper',
    status: 'stable',
    description: 'Compact display and editable increment controls for bounded numeric values.',
  },
  {
    id: 'slider',
    name: 'Slider',
    status: 'stable',
    description:
      'Native range inputs for familiar continuous adjustments and clear value readouts.',
  },
  {
    id: 'ruler-slider',
    name: 'Ruler slider',
    status: 'stable',
    description: 'Precision pointer sliders with an embedded measurement scale and fine controls.',
  },
  {
    id: 'ruler-readouts',
    name: 'Ruler readouts',
    status: 'stable',
    description: 'Compact display-only range references for values adjusted elsewhere in the tool.',
  },
  {
    id: 'drag-value',
    name: 'Drag value',
    status: 'stable',
    description: 'Direct manipulation fields with reset, bipolar, and compact bare variants.',
  },
  {
    id: 'scrubber',
    name: 'Scrubber',
    status: 'stable',
    description: 'Dense value rows with rail, meter, and ruler feedback for creative inspectors.',
  },
  {
    id: 'segmented-switch',
    name: 'Segmented switch',
    status: 'stable',
    description:
      'Quiet, compact choices for frame rate, quality, aspect ratio, and short tool modes.',
  },
  {
    id: 'tabs',
    name: 'Tabs',
    status: 'stable',
    description:
      'Keyboard-navigable underline, contained, and soft views for workspace and inspector content.',
  },
  {
    id: 'checks-radios',
    name: 'Checks & radios',
    status: 'stable',
    description: 'Native compact checks for independent settings and radio groups for tool modes.',
  },
  {
    id: 'toggle-rows',
    name: 'Toggle rows',
    status: 'stable',
    description: 'Native switch controls and quiet inspector or compact menu setting rows.',
  },
  {
    id: 'layer-rows',
    name: 'Layer rows',
    status: 'stable',
    description: 'Selectable icon-led layers and text-led presets with quiet contextual actions.',
  },
  {
    id: 'frames',
    name: 'Frame',
    status: 'stable',
    description: 'Named artboard surfaces with a selected-state outline and quiet resize handles.',
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    status: 'stable',
    description:
      'Panel, docked, and bounded floating inspector shells with optional pointer and keyboard dragging.',
  },
  {
    id: 'histogram-scope',
    name: 'Histogram scope',
    status: 'stable',
    description:
      'Luminance and RGB distribution with clipping flags and a clear exposure range for image work.',
  },
  {
    id: 'easing-graph',
    name: 'Easing graph',
    status: 'stable',
    description:
      'Cubic-bezier graphs with a quiet grid, preset composition, and direct control-point editing.',
  },
  {
    id: 'spring-response',
    name: 'Spring response',
    status: 'stable',
    description:
      'Physical motion previews with mass, stiffness, damping, velocity, and a live settling graph.',
  },
  {
    id: 'node-canvas',
    name: 'Node canvas',
    status: 'stable',
    description:
      'Compact visual patching with draggable tools, named ports, and direct connections between inputs and outputs.',
  },
  {
    id: 'camera-path',
    name: 'Camera path',
    status: 'stable',
    description:
      'Spatial waypoint editing with optional grid snap, direct manipulation, and exact framing values.',
  },
  {
    id: 'focus-crop',
    name: 'Focus / crop region',
    status: 'stable',
    description:
      'A bounded crop frame with resize handles, optional aspect lock, safe-area guides, and focal placement.',
  },
  {
    id: 'modulation-strip',
    name: 'Modulation strip',
    status: 'stable',
    description:
      'A compact waveform preview for procedural loops with direct phase and intensity adjustment.',
  },
  {
    id: 'tone-curve',
    name: 'Tone curve',
    status: 'stable',
    description:
      'A histogram-backed tonal transfer curve with presets, draggable points, and luminance or channel targeting.',
  },
  {
    id: 'axis-field',
    name: 'Axis field',
    status: 'stable',
    description:
      'A responsive two-axis field with direct manipulation, optional dot snap, and neutral axis labels.',
  },
  {
    id: 'direction-pad',
    name: 'Direction pad',
    status: 'stable',
    description:
      'A compact cardinal or eight-way compass selector for motion, alignment, and spatial effects.',
  },
  {
    id: 'keyframe-lane',
    name: 'Keyframe lane',
    status: 'stable',
    description:
      'A compact single-property timeline with draggable events, current time, working range, and snap.',
  },
  {
    id: 'video-timeline',
    name: 'Video timeline',
    status: 'stable',
    description:
      'A multi-track editorial surface with neutral thumbnail cells, draggable clips, and one shared playhead.',
  },
  {
    id: 'gradient-editor',
    name: 'Gradient editor',
    status: 'stable',
    description:
      'Direct colour and opacity stop editing with a live ramp and a focused blend-midpoint control.',
  },
  {
    id: 'dropdowns',
    name: 'Dropdowns',
    status: 'stable',
    description: 'Custom single-select lists, nested control panels, and inline disclosure rows.',
  },
  {
    id: 'popover',
    name: 'Popover',
    status: 'stable',
    description:
      'Viewport-aware non-modal panels for quick actions, compact settings, and supporting detail.',
  },
  {
    id: 'context-menu',
    name: 'Context menu',
    status: 'stable',
    description:
      'Keyboard-complete right-click actions with shortcuts, nested actions, and danger intent.',
  },
  {
    id: 'hover-cards-tooltips',
    name: 'Hover cards & tooltips',
    status: 'stable',
    description:
      'Viewport-aware helper bubbles and richer optional previews for dense tools and inspectors.',
  },
  {
    id: 'toolbar',
    name: 'Toolbar',
    status: 'stable',
    description:
      'Compact and large horizontal groups and vertical rails for tool modes and canvas actions.',
  },
  {
    id: 'color-picker',
    name: 'Color picker',
    status: 'stable',
    description: 'Colour field with anchored picker popover, embeddable panel, and swatch chips.',
  },
];

export function Components() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Overview"
        lede="Components land one at a time — each spec'd, token-pure, keyboard-complete, and refined here before the next begins."
      />

      <Section title="Shipped">
        <div className="component-index">
          {SHIPPED.map((c) => (
            <a className="component-card" href={`#/${c.id}`} key={c.id}>
              <div className="component-card-head">
                <span className="component-card-name">{c.name}</span>
                <span className={`component-card-status status-${c.status}`}>{c.status}</span>
              </div>
              <p className="component-card-desc">{c.description}</p>
              <span className="component-card-go" aria-hidden="true">
                <ArrowRightIcon size={14} />
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Next up">
        <div className="roadmap-release">
          <span className="fk-tag">V0.2 in progress</span>
          <strong>V0.1 is the base standard.</strong>
          <p>
            The current kit is the stable reference point. We are now working toward V0.2, adding
            the next set of components with the same care for craft, consistency, and handoff.
          </p>
        </div>
      </Section>
    </>
  );
}
