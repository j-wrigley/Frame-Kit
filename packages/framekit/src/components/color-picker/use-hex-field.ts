import { useState } from 'react';
import { normalizeHex } from '../../color/color';

/** Shared controlled/uncontrolled hex-value state with an editing draft.
 *  Display convention is design-tool style: uppercase, no leading '#'
 *  (parsing accepts #abc, abc, #aabbcc, any case). */
export function useHexField(
  value: string | undefined,
  defaultValue: string,
  onChange?: (hex: string) => void
) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() => normalizeHex(defaultValue) ?? '#3f3f46');
  const current = isControlled ? (normalizeHex(value) ?? '#000000') : uncontrolled;

  // Editing buffer: null = displaying the committed value.
  const [draft, setDraft] = useState<string | null>(null);

  /** Apply a already-picked color (swatch, popover picker). */
  const apply = (hex: string) => {
    const normalized = normalizeHex(hex);
    if (!normalized || normalized === current) return;
    if (!isControlled) setUncontrolled(normalized);
    onChange?.(normalized);
  };

  /** Commit the typed draft; invalid input reverts. */
  const commit = () => {
    if (draft === null) return;
    const normalized = normalizeHex(draft);
    setDraft(null);
    if (!normalized || normalized === current) return;
    if (!isControlled) setUncontrolled(normalized);
    onChange?.(normalized);
  };

  return {
    current,
    display: draft ?? current.slice(1).toUpperCase(),
    draft,
    setDraft,
    commit,
    cancel: () => setDraft(null),
    apply,
  };
}
