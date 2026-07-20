import { LoopComposer } from '@presentstandards/framekit-ui';
import type { CatalogEntry } from '../types';

/** Real union from LoopComposerMode: 'repeat' | 'ping-pong'. Mode and
 *  seamless options seed the live value (the composer's own toolbar edits
 *  them afterwards through ctx); repeats/hold/offset stay live through the
 *  built-in Cycles/Hold/Offset controls. minRepeats/maxRepeats bound the
 *  Cycles range; `label` is aria-only. */
export const loopEntry: CatalogEntry = {
  kind: 'loop',
  label: 'Loop composer',
  description: 'Repeat, hold, offset, and seam controls.',
  category: 'creative',
  short: 'LC',
  specPage: 'loop-composer',
  options: [
    {
      key: 'mode',
      label: 'Mode',
      type: 'select',
      choices: [
        { value: 'repeat', label: 'Repeat' },
        { value: 'ping-pong', label: 'Ping-pong' },
      ],
      defaultValue: 'repeat',
    },
    { key: 'seamless', label: 'Seamless', type: 'toggle', defaultValue: true },
    { key: 'minRepeats', label: 'Min repeats', type: 'number', min: 1, max: 8, step: 1, defaultValue: 1 },
    { key: 'maxRepeats', label: 'Max repeats', type: 'number', min: 1, max: 12, step: 1, defaultValue: 8 },
    { key: 'editable', label: 'Editable', type: 'toggle', defaultValue: true },
    { key: 'disabled', label: 'Disabled', type: 'toggle', defaultValue: false },
  ],
  render: (props, ctx) => (
    <LoopComposer
      minRepeats={Number(props.minRepeats)}
      maxRepeats={Number(props.maxRepeats)}
      editable={Boolean(props.editable)}
      disabled={Boolean(props.disabled)}
      value={{
        mode: ctx.get('liveMode', props.mode as 'repeat' | 'ping-pong'),
        repeats: ctx.get('repeats', 3),
        hold: ctx.get('hold', 0.16),
        offset: ctx.get('offset', 0.12),
        seamless: ctx.get('liveSeamless', Boolean(props.seamless)),
      }}
      onValueChange={(next) => {
        ctx.set('liveMode', next.mode);
        ctx.set('repeats', next.repeats);
        ctx.set('hold', next.hold);
        ctx.set('offset', next.offset);
        ctx.set('liveSeamless', next.seamless);
      }}
    />
  ),
  code: (props) =>
    [
      '<LoopComposer',
      Number(props.minRepeats) !== 1 ? `  minRepeats={${props.minRepeats}}` : null,
      Number(props.maxRepeats) !== 8 ? `  maxRepeats={${props.maxRepeats}}` : null,
      !props.editable ? '  editable={false}' : null,
      props.disabled ? '  disabled' : null,
      '  // loop state seeded from the builder mode/seamless choices',
      `  value={{ repeats: 3, hold: 0, offset: 0.25, mode: '${props.mode}', seamless: ${props.seamless} }}`,
      '  onValueChange={setLoop}',
      '/>',
    ]
      .filter(Boolean)
      .join('\n'),
  imports: ['LoopComposer'],
};
