/**
 * Frame Kit — precision UI components for creative & productivity tools.
 *
 * Components are exported from here as they land, one at a time:
 *
 *   export { Button } from './components/button';
 */

// Components — one lands at a time, each with a spec in docs/components/.
export { Tag, type TagProps, type TagTone } from './components/tag';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './components/button';
export { Loader, type LoaderProps, type LoaderSize, type LoaderVariant } from './components/loader';
export { DropZone, type DropZoneProps, type DropZoneSize } from './components/drop-zone';
export {
  SegmentedSwitch,
  type SegmentedSwitchOption,
  type SegmentedSwitchProps,
  type SegmentedSwitchSize,
} from './components/segmented-switch';
export {
  Tabs,
  type TabItem,
  type TabsActivationMode,
  type TabsProps,
  type TabsSize,
  type TabsVariant,
} from './components/tabs';
export {
  Checkbox,
  RadioGroup,
  type CheckboxProps,
  type CheckboxTone,
  type CheckboxVariant,
  type RadioGroupOption,
  type RadioGroupProps,
  type RadioGroupVariant,
} from './components/checks-and-radios';
export {
  Toggle,
  ToggleRow,
  type ToggleProps,
  type ToggleRowProps,
  type ToggleRowVariant,
  type ToggleSize,
  type ToggleTone,
} from './components/toggle';
export {
  LayerRow,
  type LayerRowAction,
  type LayerRowActionTone,
  type LayerRowProps,
  type LayerRowVariant,
} from './components/layer-row';
export { Frame, type FrameProps } from './components/frame';
export {
  Sidebar,
  SidebarSection,
  type SidebarBounds,
  type SidebarDensity,
  type SidebarPosition,
  type SidebarProps,
  type SidebarSectionProps,
  type SidebarSide,
  type SidebarVariant,
} from './components/sidebar';
export { EasingGraph, type EasingCurve, type EasingGraphProps } from './components/easing-graph';
export {
  CameraPath,
  type CameraPathProps,
  type CameraPathWaypoint,
} from './components/camera-path';
export {
  FocusCrop,
  type FocusCropFocalPoint,
  type FocusCropProps,
  type FocusCropValue,
} from './components/focus-crop';
export {
  ModulationStrip,
  type ModulationStripProps,
  type ModulationStripValue,
  type ModulationWaveform,
} from './components/modulation-strip';
export {
  LoopComposer,
  type LoopComposerMode,
  type LoopComposerProps,
  type LoopComposerValue,
} from './components/loop-composer';
export {
  ToneCurve,
  type ToneCurveChannel,
  type ToneCurvePoint,
  type ToneCurveProps,
} from './components/tone-curve';
export {
  OrbitDial,
  type OrbitDialProps,
  type OrbitDialSize,
  type OrbitDialValue,
  type OrbitDialVariant,
} from './components/orbit-dial';
export {
  EnvelopeEditor,
  type EnvelopeEditorDensity,
  type EnvelopeEditorProps,
  type EnvelopeEditorVariant,
  type EnvelopeValue,
} from './components/envelope-editor';
export {
  ColorBalanceWheels,
  type ColorBalanceDensity,
  type ColorBalanceToneValue,
  type ColorBalanceValue,
  type ColorBalanceWheelsProps,
} from './components/color-balance-wheels';
export {
  PerspectiveGrid,
  type PerspectiveCorners,
  type PerspectiveGridDensity,
  type PerspectiveGridProps,
  type PerspectiveGridValue,
  type PerspectivePoint,
} from './components/perspective-grid';
export {
  ValueGraph,
  type ValueGraphChannel,
  type ValueGraphChannels,
  type ValueGraphPoint,
  type ValueGraphProps,
} from './components/value-graph';
export {
  NodeCanvas,
  type NodeCanvasConnection,
  type NodeCanvasNode,
  type NodeCanvasPort,
  type NodeCanvasProps,
  type NodeCanvasTone,
} from './components/node-canvas';
export { AxisField, type AxisFieldProps, type AxisFieldValue } from './components/axis-field';
export {
  DirectionPad,
  type DirectionPadDirection,
  type DirectionPadMode,
  type DirectionPadProps,
  type DirectionPadSize,
} from './components/direction-pad';
export {
  KeyframeLane,
  type KeyframeLaneKeyframe,
  type KeyframeLaneDensity,
  type KeyframeLaneProps,
  type KeyframeLaneRange,
  type KeyframeLaneVariant,
} from './components/keyframe-lane';
export {
  createAudioPeakStore,
  createAudioWaveform,
  createAudioWaveformChannels,
  VideoTimeline,
  type AudioPeakChannel,
  type AudioPeakStore,
  type AudioPeakStoreOptions,
  type AudioWaveformOptions,
  type VideoTimelineClip,
  type VideoTimelineDensity,
  type VideoTimelineEditAction,
  type VideoTimelineEditEvent,
  type VideoTimelineMediaType,
  type VideoTimelineProps,
  type VideoTimelineTrack,
  type VideoTimelineWaveform,
} from './components/video-timeline';
export {
  GradientEditor,
  GradientPicker,
  type GradientAlphaStop,
  type GradientColorStop,
  type GradientEditorActiveStop,
  type GradientEditorDensity,
  type GradientEditorProps,
  type GradientEditorStopKind,
  type GradientEditorValue,
  type GradientPickerProps,
} from './components/gradient-editor';
export {
  HistogramScope,
  type HistogramScopeAdjustments,
  type HistogramScopeData,
  type HistogramScopeExposureRange,
  type HistogramScopeMode,
  type HistogramScopeProps,
  type HistogramScopeRegion,
} from './components/histogram-scope';
export {
  Disclosure,
  Dropdown,
  NestedDropdown,
  type DisclosureProps,
  type DropdownAlign,
  type DropdownOption,
  type DropdownProps,
  type DropdownSize,
  type NestedDropdownProps,
} from './components/dropdown';
export {
  ContextMenu,
  type ContextMenuAction,
  type ContextMenuItem,
  type ContextMenuProps,
  type ContextMenuSeparator,
  type ContextMenuSubmenu,
  type ContextMenuSubmenuItem,
  type ContextMenuTone,
} from './components/context-menu';
export {
  HoverCard,
  Tooltip,
  type HoverCardProps,
  type HoverCardSize,
  type OverlayAlign,
  type OverlayPlacement,
  type OverlaySide,
  type TooltipProps,
} from './components/hover-card';
export {
  Popover,
  type PopoverAlign,
  type PopoverPlacement,
  type PopoverProps,
  type PopoverSide,
  type PopoverSize,
} from './components/popover';
export {
  Input,
  InlineRename,
  SearchField,
  Textarea,
  NumberInput,
  InputComposer,
  type InputAlign,
  type InputComposerProps,
  type InputFont,
  type InlineRenameProps,
  type InputProps,
  type InputSize,
  type InputVariant,
  type NumberInputProps,
  type SearchFieldProps,
  type TextareaProps,
} from './components/input';
export {
  Stepper,
  type StepperFont,
  type StepperProps,
  type StepperSize,
} from './components/stepper';
export { Slider, type SliderProps, type SliderSize } from './components/slider';
export {
  RulerSlider,
  type RulerSliderProps,
  type RulerSliderSize,
} from './components/ruler-slider';
export {
  RulerReadout,
  type RulerReadoutProps,
  type RulerReadoutSize,
} from './components/ruler-readout';
export {
  DragValue,
  type DragValueDecoration,
  type DragValueLabelAlign,
  type DragValueProps,
  type DragValueSize,
  type DragValueVariant,
} from './components/drag-value';
export {
  Scrubber,
  type ScrubberProps,
  type ScrubberSize,
  type ScrubberSurface,
  type ScrubberVariant,
} from './components/scrubber';
export {
  SpringResponse,
  type SpringResponseDensity,
  type SpringResponseProps,
  type SpringResponseValue,
} from './components/spring-response';
export {
  ColorPicker,
  type ColorPickerProps,
  ColorField,
  type ColorFieldProps,
  ColorInput,
  type ColorInputProps,
  ColorSwatch,
  type ColorSwatchProps,
} from './components/color-picker';
export {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  type ToolbarFlyoutPlacement,
  type ToolbarGroupProps,
  type ToolbarProps,
  type ToolbarOrientation,
  type ToolbarSize,
  type ToolbarVariant,
  type ToolbarSeparatorProps,
} from './components/toolbar';

// Accent system — presets via data-accent, arbitrary colors via applyAccent.
export {
  ACCENT_PRESETS,
  ACCENT_PRESET_COLORS,
  applyAccent,
  resetAccent,
  type AccentPreset,
} from './color/accent';

// Surface styles — base by default, optional translucent tool chrome.
export {
  FRAMEKIT_STYLES,
  applyFrameKitStyle,
  getFrameKitStyle,
  resetFrameKitStyle,
  type FrameKitStyle,
} from './style/framekit-style';

// Color utilities — shared math behind the accent system and ColorPicker.
export {
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  luminance,
  contrastRatio,
  type RGB,
  type HSV,
  type HSL,
} from './color/color';

// Icons — 375 named components plus a dynamic lookup.
export * from './icons/icons';
export { Icon, type DynamicIconProps } from './icons/Icon';
export type { IconProps } from './icons/create-icon';
