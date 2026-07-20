import { ModulationStrip } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real union from ModulationWaveform: 'sine' | 'triangle' | 'saw' | 'square'.
 *  The strip owns direct phase/intensity adjustment (live through ctx) while
 *  waveform and rate belong to the application, so they are inspector options.
 *  Rate is bounded by the component defaults minRate 0.25 / maxRate 4;
 *  `label` is aria-only. */
export const modulationEntry: CatalogEntry = {
  kind: 'modulation',
  label: 'Modulation strip',
  description: 'A procedural waveform control.',
  category: 'creative',
  short: 'MS',
  specPage: 'modulation-strip',
  options: [
    {
      key: 'waveform',
      label: 'Waveform',
      type: 'select',
      choices: [
        { value: 'sine', label: 'Sine' },
        { value: 'triangle', label: 'Triangle' },
        { value: 'saw', label: 'Saw' },
        { value: 'square', label: 'Square' },
      ],
      defaultValue: 'sine',
    },
    { key: 'rate', label: 'Rate (Hz)', type: 'number', min: 0.25, max: 4, step: 0.25, defaultValue: 1.25 },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <ModulationStrip
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={{
        waveform: props.waveform as 'sine' | 'triangle' | 'saw' | 'square',
        phase: ctx.get('phase', 0.18),
        rate: Number(props.rate),
        intensity: ctx.get('intensity', 0.72),
      }}
      onValueChange={(next) => {
        ctx.set('phase', next.phase);
        ctx.set('intensity', next.intensity);
      }}
    />
  ),
  code: (props) =>
    [
      '<ModulationStrip',
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      `  value={{ waveform: '${props.waveform}', phase, rate: ${props.rate}, intensity }}`,
      '  onValueChange={setModulation}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['ModulationStrip'],
};
