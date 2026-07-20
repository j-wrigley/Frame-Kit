import {
  forwardRef,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { UploadIcon } from '../../icons/icons';
import { Loader } from '../loader';

export type DropZoneSize = 'sm' | 'md' | 'lg';

export interface DropZoneProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick' | 'onDrop' | 'onDragEnter' | 'onDragLeave' | 'onDragOver'
> {
  /** Primary instruction shown at rest. @default 'Drop content here' */
  label?: ReactNode;
  /** Optional quiet detail describing the payload or destination. */
  description?: ReactNode;
  /** Text shown while a compatible payload is held over the zone. @default 'Release to add' */
  activeLabel?: ReactNode;
  /** Optional quiet action hint for a host-owned picker or source chooser. */
  actionLabel?: ReactNode;
  /** Replaces the default upload glyph. */
  icon?: ReactNode;
  /** Space-efficient size scale. @default 'md' */
  size?: DropZoneSize;
  /** Prevents dropping and the optional action. @default false */
  disabled?: boolean;
  /** Shows a processing state and temporarily prevents interaction. @default false */
  busy?: boolean;
  /** Receives the complete DataTransfer payload, not only files. */
  onDrop?: (transfer: DataTransfer) => void;
  /** Opens a consumer-owned source chooser; it is never assumed to be file-only. */
  onAction?: () => void;
  /** Reports drag presence so host UI can coordinate nearby state. */
  onDragStateChange?: (isDragging: boolean) => void;
}

/** A general-purpose transfer target for creative tools. It accepts the full
 * DataTransfer object so callers can support files, URLs, text, layers, clips,
 * or application-specific payloads without the component choosing a format. */
export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(function DropZone(
  {
    label = 'Drop content here',
    description,
    activeLabel = 'Release to add',
    actionLabel,
    icon,
    size = 'md',
    disabled = false,
    busy = false,
    onDrop,
    onAction,
    onDragStateChange,
    className,
    role,
    tabIndex,
    onKeyDown,
    ...props
  },
  ref
) {
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const canDrop = !disabled && !busy && onDrop !== undefined;
  const canAct = !disabled && !busy && onAction !== undefined;

  const setDragState = (nextDragging: boolean) => {
    setIsDragging((current) => {
      if (current !== nextDragging) onDragStateChange?.(nextDragging);
      return nextDragging;
    });
  };

  const resetDrag = () => {
    dragDepth.current = 0;
    setDragState(false);
  };

  const handleDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragState(true);
  };

  const handleDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragState(false);
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    event.preventDefault();
    resetDrag();
    onDrop?.(event.dataTransfer);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !canAct || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onAction?.();
  };

  const classes = [
    'fk-drop-zone',
    `fk-drop-zone--${size}`,
    (canDrop || canAct) && 'fk-drop-zone--interactive',
    isDragging && 'fk-drop-zone--dragging',
    disabled && 'fk-drop-zone--disabled',
    busy && 'fk-drop-zone--busy',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      role={role ?? (canAct ? 'button' : undefined)}
      tabIndex={canAct ? (tabIndex ?? 0) : tabIndex}
      aria-disabled={disabled || busy || undefined}
      aria-busy={busy || undefined}
      data-dragging={isDragging || undefined}
      onClick={canAct ? () => onAction?.() : undefined}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="fk-drop-zone__icon" aria-hidden="true">
        {busy ? <Loader size="sm" variant="grid" /> : (icon ?? <UploadIcon />)}
      </span>
      <span className="fk-drop-zone__copy">
        <strong>{isDragging ? activeLabel : label}</strong>
        {description != null && <span className="fk-drop-zone__description">{description}</span>}
        {canAct && actionLabel != null && (
          <span className="fk-drop-zone__action" aria-hidden="true">
            {actionLabel}
          </span>
        )}
      </span>
    </div>
  );
});
