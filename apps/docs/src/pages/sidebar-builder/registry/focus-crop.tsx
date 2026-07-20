import { FocusCrop } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real prop surface from FocusCropProps: aspectRatio is `number | null`
 *  (not a union), so the select offers curated common ratios with 'free'
 *  mapping to null. aspectLocked/showSafeArea/editable/disabled booleans and
 *  numeric safeAreaInset (clamped 0.04-0.42 by the component) are direct.
 *  Crop and focal point stay live through ctx; `label` is aria-only. */

const DEFAULT_ASPECT = { value: 16 / 9, code: '16 / 9' };
const ASPECT_RATIOS: Record<string, { value: number | null; code: string }> = {
  '16 / 9': DEFAULT_ASPECT,
  '4 / 3': { value: 4 / 3, code: '4 / 3' },
  '1 / 1': { value: 1, code: '1' },
  '9 / 16': { value: 9 / 16, code: '9 / 16' },
  free: { value: null, code: 'null' },
};

function aspectFor(key: unknown): { value: number | null; code: string } {
  return ASPECT_RATIOS[String(key)] ?? DEFAULT_ASPECT;
}

export const focusCropEntry: CatalogEntry = {
  kind: 'focus-crop',
  label: 'Focus / crop',
  description: 'Crop, safe area, and focal placement.',
  category: 'creative',
  short: 'FC',
  specPage: 'focus-crop',
  options: [
    {
      key: 'aspectRatio',
      label: 'Aspect ratio',
      type: 'select',
      choices: [
        { value: '16 / 9', label: '16 : 9' },
        { value: '4 / 3', label: '4 : 3' },
        { value: '1 / 1', label: 'Square' },
        { value: '9 / 16', label: '9 : 16' },
        { value: 'free', label: 'Free' },
      ],
      defaultValue: '16 / 9',
    },
    { key: 'aspectLocked', label: 'Lock aspect', type: 'toggle', defaultValue: true },
    { key: 'showSafeArea', label: 'Safe area', type: 'toggle', defaultValue: true },
    {
      key: 'safeAreaInset',
      label: 'Safe inset',
      type: 'number',
      min: 0.04,
      max: 0.42,
      step: 0.01,
      defaultValue: 0.1,
    },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <FocusCrop
      aspectRatio={aspectFor(props.aspectRatio).value}
      aspectLocked={Boolean(props.aspectLocked)}
      showSafeArea={Boolean(props.showSafeArea)}
      safeAreaInset={Number(props.safeAreaInset)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={ctx.get('crop', { x: 0.11, y: 0.11, width: 0.78, height: 0.72 })}
      onValueChange={(next) => ctx.set('crop', next)}
      focalPoint={ctx.get('focalPoint', { x: 0.5, y: 0.5 })}
      onFocalPointChange={(next) => ctx.set('focalPoint', next)}
    />
  ),
  code: (props) => {
    const aspect = aspectFor(props.aspectRatio);
    return [
      '<FocusCrop',
      aspect.code !== '16 / 9' ? `  aspectRatio={${aspect.code}}` : null,
      !props.aspectLocked ? '  aspectLocked={false}' : null,
      !props.showSafeArea ? '  showSafeArea={false}' : null,
      Number(props.safeAreaInset) !== 0.1 ? `  safeAreaInset={${props.safeAreaInset}}` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  value={crop}',
      '  onValueChange={setCrop}',
      '  focalPoint={focalPoint}',
      '  onFocalPointChange={setFocalPoint}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n');
  },
  imports: ['FocusCrop'],
};
