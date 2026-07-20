import { useCallback, type KeyboardEvent, type PointerEvent } from 'react';

export type ValueControlSize = 'sm' | 'md' | 'lg';

export interface ValueControlOptions {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  fineStep?: number;
  coarseStep?: number;
  onValueChange: (value: number) => void;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function decimalPlaces(value: number) {
  const valueAsText = String(value);
  const exponent = valueAsText.match(/e-(\d+)$/i);
  if (exponent) return Number(exponent[1]);
  return valueAsText.includes('.') ? valueAsText.split('.')[1]!.length : 0;
}

export function snapValue(value: number, min: number, max: number, step: number) {
  const safeStep = step > 0 ? step : 1;
  const snapped = min + Math.round((clamp(value, min, max) - min) / safeStep) * safeStep;
  const precision = Math.min(
    10,
    Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(safeStep))
  );
  return Number(clamp(snapped, min, max).toFixed(precision));
}

export function valueProgress(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return ((clamp(value, min, max) - min) / (max - min)) * 100;
}

export function defaultValueFormat(value: number) {
  return String(value);
}

/** Shared pointer and keyboard behavior for the custom value controls.
 * Shift uses the fine step, Alt uses the coarse step, and PageUp/PageDown
 * always use the coarse increment. */
export function useValueControl({
  value,
  min,
  max,
  step,
  disabled = false,
  fineStep,
  coarseStep,
  onValueChange,
}: ValueControlOptions) {
  const setValue = useCallback(
    (nextValue: number, increment = step) => {
      if (!disabled) onValueChange(snapValue(nextValue, min, max, increment));
    },
    [disabled, max, min, onValueChange, step]
  );

  const setValueFromPointer = useCallback(
    (element: HTMLElement, clientX: number) => {
      const bounds = element.getBoundingClientRect();
      if (bounds.width <= 0) return;
      const progress = clamp((clientX - bounds.left) / bounds.width, 0, 1);
      setValue(min + progress * (max - min));
    },
    [max, min, setValue]
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setValueFromPointer(event.currentTarget, event.clientX);
    },
    [disabled, setValueFromPointer]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
      setValueFromPointer(event.currentTarget, event.clientX);
    },
    [disabled, setValueFromPointer]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;

      const fine = fineStep ?? step / 10;
      const coarse = coarseStep ?? step * 10;
      const directionalStep = event.shiftKey ? fine : event.altKey ? coarse : step;
      let nextValue: number | undefined;

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
        nextValue = value + directionalStep;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
        nextValue = value - directionalStep;
      if (event.key === 'PageUp') nextValue = value + coarse;
      if (event.key === 'PageDown') nextValue = value - coarse;
      if (event.key === 'Home') nextValue = min;
      if (event.key === 'End') nextValue = max;

      if (nextValue !== undefined) {
        event.preventDefault();
        const snapIncrement =
          event.key === 'Home' || event.key === 'End'
            ? step
            : event.key.startsWith('Page')
              ? coarse
              : directionalStep;
        setValue(nextValue, snapIncrement);
      }
    },
    [coarseStep, disabled, fineStep, max, min, setValue, step, value]
  );

  return { onKeyDown, onPointerDown, onPointerMove };
}
