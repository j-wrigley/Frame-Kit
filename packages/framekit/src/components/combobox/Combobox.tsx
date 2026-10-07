import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardedRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDownIcon } from '../../icons/icons';
import { FloatingPortal, useAnchoredOverlay } from '../floating-overlay';

export type ComboboxSize = 'sm' | 'md';
export type ComboboxFont = 'sans' | 'mono';

export interface ComboboxOption<T = string> {
  /** The value committed when this suggestion is chosen. */
  value: T;
  /** Visible option label. @default format(value) */
  label?: ReactNode;
  /** Quiet supporting detail under the label, such as the size it makes. */
  description?: ReactNode;
  /** Shown, but neither pointer nor keyboard can choose it. */
  disabled?: boolean;
}

export interface ComboboxProps<T = string> extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'prefix' | 'children'
> {
  /** Suggestions, in order. The list does not filter while typing. */
  options: readonly ComboboxOption<T>[];
  /** Controlled committed value. The field shows `format(value)` until edited. */
  value: T;
  /**
   * Called on Enter, on blur after an edit, and when a suggestion is chosen.
   * `value` is `parse(text)`; `null` means the text did not parse, and the
   * field keeps that text (marked invalid) until it is corrected or Escape
   * restores the committed value — which reports the committed value again.
   */
  onCommit: (value: T | null, text: string) => void;
  /** Text → value, or `null` when it cannot be read. @default the trimmed text; empty is null */
  parse?: (text: string) => T | null;
  /** Value → field text. Also identifies the current suggestion. @default String(value) */
  format?: (value: T) => string;
  /** Marks the field invalid (danger border, `aria-invalid`) — for example a
   *  value that parses but cannot be used. Text that fails `parse` is marked
   *  invalid automatically. Say why in a `FieldNote` linked with
   *  `aria-describedby`. */
  invalid?: boolean;
  /** Accessible name for the field and its suggestion list. */
  label?: string;
  /** Field height: `sm` 24px, `md` 30px. @default 'md' */
  size?: ComboboxSize;
  /** Value font. @default 'sans' */
  font?: ComboboxFont;
  /** Stretches the field to the available width. */
  fullWidth?: boolean;
}

const defaultParse = (text: string) => text.trim() || null;
const defaultFormat = (value: unknown) => String(value);

function enabledIndex<T>(options: readonly ComboboxOption<T>[], from: number, step: 1 | -1) {
  for (let offset = 1; offset <= options.length; offset += 1) {
    const index = (from + step * offset + options.length * 2) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

function ComboboxInner<T = string>(
  {
    options,
    value,
    onCommit,
    parse = defaultParse as unknown as (text: string) => T | null,
    format = defaultFormat,
    invalid = false,
    label,
    size = 'md',
    font = 'sans',
    fullWidth = false,
    disabled = false,
    className,
    onBlur,
    onFocus,
    onKeyDown,
    onMouseUp,
    onPointerDown,
    ...props
  }: ComboboxProps<T>,
  ref: ForwardedRef<HTMLInputElement>
) {
  const generatedId = useId();
  const listId = `fk-combobox-${generatedId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const selectOnMouseUp = useRef(false);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const committedText = format(value);
  // Editing buffer: null shows the committed value. Text that failed to parse
  // stays here (and in `rejected`) until a commit succeeds or Escape.
  const [draft, setDraft] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string | null>(null);
  const [shownValue, setShownValue] = useState(committedText);
  if (shownValue !== committedText) {
    // The value changed from outside (or after a commit): show it.
    setShownValue(committedText);
    setDraft(null);
    setRejected(null);
  }
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedIndex = options.findIndex(
    (option) => !option.disabled && format(option.value) === committedText
  );
  const isInvalid = invalid || rejected !== null;

  const floatingMenu = useAnchoredOverlay({
    open,
    anchorRef: rootRef,
    panelRef: menuRef,
    placement: 'bottom-start',
    offset: 4,
  });
  // Inside a Popover, the list sits one layer above its parent surface.
  const menuZIndex =
    open && rootRef.current?.closest('.fk-popover__surface')
      ? 'calc(var(--fk-z-popover, 1100) + 1)'
      : undefined;

  const openList = (index: number) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const closeList = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const commitText = (text: string) => {
    const parsed = parse(text);
    if (parsed === null) {
      setDraft(text);
      setRejected(text);
      onCommit(null, text);
      return;
    }
    setDraft(null);
    setRejected(null);
    onCommit(parsed, text);
  };

  const commitOption = (option: ComboboxOption<T>) => {
    if (option.disabled) return;
    setDraft(null);
    setRejected(null);
    onCommit(option.value, format(option.value));
  };

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      closeList();
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0)
      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const down = event.key === 'ArrowDown';
      if (!open || event.altKey) {
        const start =
          selectedIndex >= 0 ? selectedIndex : enabledIndex(options, down ? -1 : 0, down ? 1 : -1);
        openList(start);
        return;
      }
      const from = activeIndex >= 0 ? activeIndex : down ? -1 : 0;
      setActiveIndex(enabledIndex(options, from, down ? 1 : -1));
      return;
    }

    if (event.key === 'Enter') {
      const option = open && activeIndex >= 0 ? options[activeIndex] : undefined;
      if (option && !option.disabled) {
        event.preventDefault();
        commitOption(option);
        closeList();
        return;
      }
      if (draft !== null) {
        event.preventDefault();
        commitText(draft);
      }
      if (open) {
        event.preventDefault();
        closeList();
      }
      return;
    }

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        closeList();
        return;
      }
      if (draft !== null) {
        event.preventDefault();
        const wasRejected = rejected !== null;
        setDraft(null);
        setRejected(null);
        if (wasRejected) onCommit(value, committedText);
        window.requestAnimationFrame(() => inputRef.current?.select());
      }
      return;
    }

    if (event.key === 'Tab' && open) closeList();
  };

  const classes = [
    'fk-combobox',
    `fk-combobox--${size}`,
    `fk-combobox--${font}`,
    fullWidth && 'fk-combobox--full',
    isInvalid && 'fk-combobox--invalid',
    disabled && 'fk-combobox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const activeId = open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined;

  return (
    <div ref={rootRef} className={classes} data-open={open || undefined}>
      <input
        ref={inputRef}
        className="fk-combobox__input"
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-label={props['aria-labelledby'] ? undefined : label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="none"
        aria-activedescendant={activeId}
        aria-invalid={isInvalid || undefined}
        disabled={disabled}
        {...props}
        value={draft ?? committedText}
        onChange={(event) => {
          setDraft(event.target.value);
          setActiveIndex(-1);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          // A pointer focus selects the whole value, as in design tools.
          selectOnMouseUp.current = document.activeElement !== event.currentTarget;
        }}
        onFocus={(event) => {
          onFocus?.(event);
          event.currentTarget.select();
        }}
        onMouseUp={(event) => {
          onMouseUp?.(event);
          // WebKit/Blink place the caret on mouseup; keep the selection.
          if (selectOnMouseUp.current) event.preventDefault();
          selectOnMouseUp.current = false;
        }}
        onBlur={(event) => {
          onBlur?.(event);
          closeList();
          if (draft !== null && draft !== rejected) commitText(draft);
        }}
        onKeyDown={handleKeyDown}
      />
      <button
        className="fk-combobox__toggle"
        type="button"
        tabIndex={-1}
        aria-label={label ? `${label} suggestions` : 'Suggestions'}
        aria-controls={listId}
        aria-expanded={open}
        disabled={disabled}
        onPointerDown={(event) => {
          // Keep focus (and any draft) in the field.
          event.preventDefault();
        }}
        onClick={() => {
          if (open) closeList();
          else openList(selectedIndex >= 0 ? selectedIndex : enabledIndex(options, -1, 1));
          inputRef.current?.focus();
        }}
      >
        <ChevronDownIcon className="fk-combobox__chevron" aria-hidden="true" />
      </button>
      {open && (
        <FloatingPortal>
          <div
            ref={menuRef}
            className="fk-dropdown__menu fk-combobox__menu"
            id={listId}
            role="listbox"
            aria-label={label}
            data-side={floatingMenu.side}
            data-positioned={floatingMenu.positioned || undefined}
            style={{
              ...floatingMenu.style,
              minWidth: floatingMenu.anchorWidth,
              zIndex: menuZIndex,
            }}
          >
            {options.map((option, index) => {
              const text = format(option.value);
              return (
                <div
                  key={text}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  className="fk-dropdown__option fk-combobox__option"
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  aria-disabled={option.disabled || undefined}
                  data-active={index === activeIndex || undefined}
                  onPointerDown={(event) => event.preventDefault()}
                  onPointerMove={() => {
                    if (!option.disabled && index !== activeIndex) setActiveIndex(index);
                  }}
                  onClick={() => {
                    if (option.disabled) return;
                    commitOption(option);
                    closeList();
                  }}
                >
                  <span className="fk-dropdown__option-label">{option.label ?? text}</span>
                  {option.description != null && (
                    <span className="fk-dropdown__option-description">{option.description}</span>
                  )}
                </div>
              );
            })}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}

/** An editable field with a suggestion list: type any value the application
 *  can `parse`, or choose a suggestion. Enter or blur commits; Escape closes
 *  the list, then restores the committed value. Built from the Input field
 *  chrome and the Dropdown listbox; focus stays in the field. */
export const Combobox = forwardRef(ComboboxInner) as <T = string>(
  props: ComboboxProps<T> & { ref?: Ref<HTMLInputElement> }
) => ReactElement | null;
