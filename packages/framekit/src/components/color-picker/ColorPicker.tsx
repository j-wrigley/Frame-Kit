import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { hexToRgb, hsvToRgb, normalizeHex, rgbToHex, rgbToHsv, type HSV } from '../../color/color';
import { ColorInput } from './ColorInput';
import { ColorSwatch } from './ColorSwatch';

export interface ColorPickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Controlled hex value (e.g. "#3f3f46"). */
  value?: string;
  /** Uncontrolled initial hex value. @default '#3f3f46' */
  defaultValue?: string;
  /** Fires with a normalized "#rrggbb" on every change. */
  onChange?: (hex: string) => void;
  /** Optional preset swatches rendered under the controls. */
  presets?: string[];
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** The color picker panel — saturation/brightness area, hue slider, hex
 *  input, optional presets. Inline and composable — ColorField wraps it in
 *  an anchored popover for inspector rows. HSV is the working state so hue
 *  survives black/white/grey values. */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker(
  { value, defaultValue = '#3f3f46', onChange, presets, className, ...props },
  ref
) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() => normalizeHex(defaultValue) ?? '#3f3f46');
  const hexValue = isControlled ? (normalizeHex(value) ?? '#000000') : uncontrolled;

  const [hsv, setHsvState] = useState<HSV>(() => rgbToHsv(hexToRgb(hexValue)));
  const lastHex = useRef(hexValue);
  // Mirror of the working state for pointer handlers: a click on the SV area
  // first blurs the hex field (committing a typed hue) and then reads the hue
  // in the same task — the render-scope closure would still hold the old one.
  const hsvRef = useRef(hsv);

  const setHsv = (next: HSV) => {
    hsvRef.current = next;
    setHsvState(next);
  };

  // External value changes (controlled) re-seed the HSV working state.
  useEffect(() => {
    if (hexValue !== lastHex.current) {
      lastHex.current = hexValue;
      setHsv(rgbToHsv(hexToRgb(hexValue)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setHsv is stable in behavior
  }, [hexValue]);

  const emit = (hex: string) => {
    if (hex === lastHex.current) return;
    lastHex.current = hex;
    if (!isControlled) setUncontrolled(hex);
    onChange?.(hex);
  };

  const commitHsv = (next: HSV) => {
    setHsv(next);
    emit(rgbToHex(hsvToRgb(next)));
  };

  const commitHex = (hex: string) => {
    const normalized = normalizeHex(hex);
    if (!normalized) return;
    setHsv(rgbToHsv(hexToRgb(normalized)));
    emit(normalized);
  };

  /* ── Saturation/brightness area ── */

  const areaRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    commitHsv({
      h: hsvRef.current.h,
      s: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      v: clamp((1 - (event.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  };

  const onAreaKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    let handled = true;
    if (event.key === 'ArrowLeft') commitHsv({ ...hsv, s: clamp(hsv.s - step, 0, 100) });
    else if (event.key === 'ArrowRight') commitHsv({ ...hsv, s: clamp(hsv.s + step, 0, 100) });
    else if (event.key === 'ArrowUp') commitHsv({ ...hsv, v: clamp(hsv.v + step, 0, 100) });
    else if (event.key === 'ArrowDown') commitHsv({ ...hsv, v: clamp(hsv.v - step, 0, 100) });
    else handled = false;
    if (handled) event.preventDefault();
  };

  const classes = ['fk-color-picker', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      <div
        ref={areaRef}
        className="fk-color-area"
        style={{ '--fk-color-area-hue': hsv.h } as CSSProperties}
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.v)}
        aria-valuetext={`Saturation ${Math.round(hsv.s)}%, brightness ${Math.round(hsv.v)}%`}
        onPointerDown={(event) => {
          if (event.button !== 0) return; // primary button only
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // pointer already released (or synthetic) — a click still commits
          }
          areaRef.current?.focus();
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons & 1) updateFromPointer(event);
        }}
        onKeyDown={onAreaKeyDown}
      >
        <span
          className="fk-color-area__thumb"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: hexValue }}
          aria-hidden="true"
        />
      </div>

      <input
        type="range"
        className="fk-hue-slider"
        min={0}
        max={360}
        step={1}
        value={Math.round(hsv.h)}
        onChange={(event) => commitHsv({ ...hsv, h: Number(event.target.value) })}
        aria-label="Hue"
      />

      <ColorInput value={hexValue} onChange={commitHex} aria-label="Hex value" />

      {presets && presets.length > 0 && (
        <div className="fk-color-picker__presets" role="group" aria-label="Preset colors">
          {presets.map((preset) => {
            const normalized = normalizeHex(preset) ?? preset;
            return (
              <ColorSwatch
                key={preset}
                size="sm"
                color={normalized}
                selected={normalized === hexValue}
                onClick={() => commitHex(preset)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});
