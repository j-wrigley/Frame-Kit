import {
  EnvelopeEditor,
  type EnvelopeEditorDensity,
  type EnvelopeEditorVariant,
  type EnvelopeValue,
} from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** The component's default envelope, reused as demo data. */
const DEMO_ENVELOPE: EnvelopeValue = {
  attack: 0.1,
  hold: 0.12,
  decay: 0.18,
  sustain: 0.62,
  release: 0.2,
};

/** Real prop unions from EnvelopeEditorProps: variant 'default' | 'audio' | 'motion'
 *  (EnvelopeEditorVariant), density 'default' | 'compact' (EnvelopeEditorDensity).
 *  The `label` prop is accessible-only (never displayed), so no text option. */
export const envelopeEntry: CatalogEntry = {
  kind: 'envelope',
  label: 'Envelope editor',
  description: 'An ADSR-style timing shape.',
  category: 'creative',
  short: 'EE',
  specPage: 'envelope-editor',
  options: [
    {
      key: 'variant',
      label: 'Variant',
      type: 'select',
      choices: [
        { value: 'default', label: 'Default' },
        { value: 'audio', label: 'Audio' },
        { value: 'motion', label: 'Motion' },
      ],
      defaultValue: 'default',
    },
    {
      key: 'density',
      label: 'Density',
      type: 'select',
      choices: [
        { value: 'default', label: 'Default' },
        { value: 'compact', label: 'Compact' },
      ],
      defaultValue: 'compact',
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <EnvelopeEditor
      variant={props.variant as EnvelopeEditorVariant}
      density={props.density as EnvelopeEditorDensity}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('envelope', DEMO_ENVELOPE)}
      onValueChange={(next) => ctx.set('envelope', next)}
    />
  ),
  code: (props) =>
    [
      '<EnvelopeEditor',
      props.variant !== 'default' ? `  variant="${props.variant}"` : null,
      props.density !== 'default' ? `  density="${props.density}"` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={envelope}',
      '  onValueChange={setEnvelope}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['EnvelopeEditor'],
};
