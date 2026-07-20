import { HistogramScope, type HistogramScopeAdjustments } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

const RESTING_ADJUSTMENTS: HistogramScopeAdjustments = {
  blacks: 0,
  shadows: 0,
  exposure: 0,
  highlights: 0,
  whites: 0,
};

/** Real prop unions from HistogramScopeProps: mode 'luminance' | 'rgb'
 *  (HistogramScopeMode); shadowClipped, highlightClipped, showExposureRange,
 *  interactive, disabled booleans; exposureRange { min, max } (default -5 to 5).
 *  Bin data stays application-owned (built-in sample distribution); interactive
 *  tonal adjustments are wired live through the builder scratch state. */
export const histogramEntry: CatalogEntry = {
  kind: 'histogram',
  label: 'Histogram scope',
  description: 'Luminance distribution and clipping context.',
  category: 'creative',
  short: 'HS',
  specPage: 'histogram-scope',
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'luminance', label: 'Luminance' },
        { value: 'rgb', label: 'RGB' },
      ],
      defaultValue: 'luminance',
    },
    { key: 'interactive', label: 'Interactive', type: 'toggle', defaultValue: false },
    { key: 'shadowClipped', label: 'Shadow clipping', type: 'toggle', defaultValue: false },
    { key: 'highlightClipped', label: 'Highlight clipping', type: 'toggle', defaultValue: false },
    { key: 'showExposureRange', label: 'Show exposure range', type: 'toggle', defaultValue: true },
    {
      key: 'exposureMin',
      label: 'Exposure min',
      type: 'number',
      min: -10,
      max: 0,
      step: 1,
      defaultValue: -5,
    },
    {
      key: 'exposureMax',
      label: 'Exposure max',
      type: 'number',
      min: 0,
      max: 10,
      step: 1,
      defaultValue: 5,
    },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => {
    const interactive = Boolean(props.interactive);
    return (
      <HistogramScope
        mode={props.mode as 'luminance' | 'rgb'}
        shadowClipped={Boolean(props.shadowClipped)}
        highlightClipped={Boolean(props.highlightClipped)}
        showExposureRange={Boolean(props.showExposureRange)}
        exposureRange={{ min: Number(props.exposureMin), max: Number(props.exposureMax) }}
        interactive={interactive}
        disabled={Boolean(props.disabled)}
        value={interactive ? ctx.get('adjustments', RESTING_ADJUSTMENTS) : undefined}
        onValueChange={interactive ? (next) => ctx.set('adjustments', next) : undefined}
      />
    );
  },
  code: (props) => {
    const lines = [
      '<HistogramScope',
      props.mode !== 'luminance' ? `  mode="${props.mode}"` : null,
      props.shadowClipped ? '  shadowClipped' : null,
      props.highlightClipped ? '  highlightClipped' : null,
      !props.showExposureRange ? '  showExposureRange={false}' : null,
      Number(props.exposureMin) !== -5 || Number(props.exposureMax) !== 5
        ? `  exposureRange={{ min: ${props.exposureMin}, max: ${props.exposureMax} }}`
        : null,
      props.interactive ? '  interactive' : null,
      props.interactive ? '  value={adjustments}' : null,
      props.interactive ? '  onValueChange={setAdjustments}' : null,
      props.disabled ? '  disabled' : null,
      '/>',
    ].filter((line): line is string => line !== null);
    return lines.length === 2 ? `${lines[0]} />` : lines.join('\n');
  },
  imports: ['HistogramScope'],
};
