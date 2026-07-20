---
name: Histogram scope
status: stable
since: 0.1.0
import: import { HistogramScope } from '@presentstandards/framekit-ui'
---

# Histogram scope

> A compact luminance and RGB distribution view for exposure-aware creative tools.

## When to use

- A photo, video, colour, or compositing inspector needs a fast read of tonal distribution.
- Users need to spot crushed shadows or clipped highlights before making exposure decisions.
- A compact visual companion should make the current image range legible without becoming a chart dashboard.

## When not to use

- Use `Slider`, `DragValue`, or `Scrubber` to adjust exposure; Histogram Scope is read-only.
- Do not use it for live time-series data, keyframe timing, or arbitrary analytics.
- Do not infer clipping from a display profile alone; pass the application’s clipping state explicitly.

## Anatomy

`HistogramScope` renders exact vertical bins on a contained distribution surface, quiet exposure divisions, either a luminance or overlapping RGB distribution, unobtrusive clipping brackets at either edge, and a labelled exposure range. It does not smooth or interpolate the supplied data.

## Props

| Prop                   | Type                           | Default               | Description                                                          |
| ---------------------- | ------------------------------ | --------------------- | -------------------------------------------------------------------- |
| `data`                 | `HistogramScopeData`           | Sample distribution   | Raw or relative bins, ordered from shadow to highlight.              |
| `mode`                 | `'luminance' \| 'rgb'`         | `'luminance'`         | Selects luminance bins or overlapping RGB channel bins.              |
| `shadowClipped`        | `boolean`                      | `false`               | Shows the clipping flag at the shadow edge.                          |
| `highlightClipped`     | `boolean`                      | `false`               | Shows the clipping flag at the highlight edge.                       |
| `exposureRange`        | `{ min: number; max: number }` | `{ min: -5, max: 5 }` | Exposure values represented on the horizontal axis.                  |
| `showExposureRange`    | `boolean`                      | `true`                | Shows the low, midpoint, and high exposure labels.                   |
| `value`                | `HistogramScopeAdjustments`    | —                     | Controlled Blacks, Shadows, Exposure, Highlights, and Whites values. |
| `defaultValue`         | `HistogramScopeAdjustments`    | All values at `0`     | Initial values when the scope owns direct adjustments.               |
| `onValueChange`        | `(value) => void`              | —                     | Receives the next tonal adjustment after drag or keyboard input.     |
| `onActiveRegionChange` | `(region \| null) => void`     | —                     | Reports the hovered, focused, or released tonal region.              |
| `interactive`          | `boolean`                      | `false`               | Enables Lightroom-style direct tonal-zone adjustment.                |
| `disabled`             | `boolean`                      | `false`               | Disables direct tonal-zone adjustment.                               |
| `label`                | `string`                       | `'Histogram scope'`   | Accessible name for the read-only visual.                            |

`HistogramScopeData` accepts optional `luminance`, `red`, `green`, and `blue` bin arrays. Values may be raw counts or normalised measurements; visible channels scale against the largest supplied bin so relative distribution remains clear.

`HistogramScopeAdjustments` contains `blacks`, `shadows`, `highlights`, and `whites` from `-100` to `100`, plus `exposure` from `-5` to `5` stops. The scope remaps its visible bins immediately for direct-feedback preview, while the application still owns image processing and can provide a refreshed source histogram when that work completes.

## Tokens used

| Token                                     | Role in this component          |
| ----------------------------------------- | ------------------------------- |
| `--fk-bg-control` / `--fk-border-control` | Scope surface and edge.         |
| `--fk-border`                             | Quiet exposure divisions.       |
| `--fk-text-primary`                       | Neutral luminance distribution. |
| `--fk-danger`                             | Explicit clipping flags.        |
| `--fk-text-tertiary`                      | Exposure axis labels.           |

RGB traces use fixed red, green, and blue signals so their channel meaning does not change with the application accent.

## Accessibility

- A non-interactive scope is a labelled image; an interactive scope is a labelled group containing five tonal sliders.
- Keep a nearby text readout for exact exposure or channel values when those are required for a workflow.
- Clipping is communicated through the accessible name, not colour alone.
- With `interactive`, each tonal zone is a focusable slider. Arrow keys adjust it, Shift multiplies the step by five, Home and End set its bounds, and Escape returns it to zero.

## Direct tonal adjustment

Set `interactive` and bind `value` / `onValueChange` to add the familiar histogram interaction found in photo tools. The five equal horizontal zones map left to right to Blacks, Shadows, Exposure, Highlights, and Whites. Drag upward to increase a zone and downward to decrease it; this component reports the requested value but never alters image data by itself.

## Example

```tsx
import { useState } from 'react';
import {
  HistogramScope,
  type HistogramScopeAdjustments,
  type HistogramScopeData,
} from '@presentstandards/framekit-ui';

const histogram: HistogramScopeData = {
  luminance: [2, 4, 12, 21, 18, 9, 5, 1],
  red: [1, 3, 9, 18, 15, 7, 3, 1],
  green: [2, 5, 14, 20, 18, 10, 4, 1],
  blue: [4, 8, 17, 16, 9, 4, 2, 1],
};

const [adjustments, setAdjustments] = useState<HistogramScopeAdjustments>({
  blacks: 0,
  shadows: 0,
  exposure: 0,
  highlights: 0,
  whites: 0,
});

<HistogramScope
  data={histogram}
  mode="rgb"
  shadowClipped
  highlightClipped={false}
  exposureRange={{ min: -5, max: 5 }}
  interactive
  value={adjustments}
  onValueChange={setAdjustments}
  label="Portrait exposure histogram"
/>;
```

## Do / Don't

- **Do** feed the scope from the source image or frame data used by the adjustment workflow.
- **Do** show clipping only when it is a meaningful warning for the current operation.
- **Do** pair the scope with direct exposure and colour controls.
- **Don't** turn the scope into a draggable editor or use it as the only expression of an exposure value.
