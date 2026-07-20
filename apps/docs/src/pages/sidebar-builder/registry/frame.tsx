import { Frame } from '@presentstandards/framekit-ui';
import { jsxString, type CatalogEntry } from '../types';

/** FrameProps has no variant unions — its visual states are the selected and
 *  recording booleans plus recordingProgress (0–1, clamped). Width is fixed to
 *  100% so the surface fits the narrow canvas; shape comes from the freeform
 *  CSS aspectRatio prop (a text option, not a union). The empty clipped
 *  surface renders the kit's raised background. */
export const frameEntry: CatalogEntry = {
  kind: 'frame',
  label: 'Frame',
  description: 'A compact canvas surface.',
  category: 'structure',
  short: 'FR',
  specPage: 'frames',
  options: [
    { key: 'name', label: 'Name', type: 'text', defaultValue: 'Preview' },
    { key: 'aspectRatio', label: 'Aspect ratio', type: 'text', defaultValue: '16 / 9' },
    { key: 'selected', label: 'Selected', type: 'toggle', defaultValue: true },
    { key: 'recording', label: 'Recording', type: 'toggle', defaultValue: false },
    {
      key: 'recordingProgress',
      label: 'Progress',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.05,
      defaultValue: 0.6,
    },
  ],
  render: (props) => (
    <Frame
      name={String(props.name)}
      width="100%"
      aspectRatio={String(props.aspectRatio)}
      selected={Boolean(props.selected)}
      recording={Boolean(props.recording)}
      recordingProgress={Number(props.recordingProgress)}
    />
  ),
  code: (props) =>
    [
      '<Frame',
      `  name=${jsxString(props.name)}`,
      '  width="100%"',
      `  aspectRatio=${jsxString(props.aspectRatio)}`,
      props.selected ? '  selected' : null,
      props.recording ? '  recording' : null,
      Number(props.recordingProgress) !== 0
        ? `  recordingProgress={${Number(props.recordingProgress)}}`
        : null,
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['Frame'],
};
