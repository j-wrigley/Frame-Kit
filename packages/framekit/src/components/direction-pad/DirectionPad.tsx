import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  TargetIcon,
} from '../../icons/icons';

export type DirectionPadDirection =
  'center' | 'up' | 'up-right' | 'right' | 'down-right' | 'down' | 'down-left' | 'left' | 'up-left';

export type DirectionPadMode = 'eight-way' | 'cardinal';
export type DirectionPadSize = 'sm' | 'md';

export interface DirectionPadProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  /** Controlled selected direction. */
  value?: DirectionPadDirection;
  /** Initial direction when uncontrolled. @default 'center' */
  defaultValue?: DirectionPadDirection;
  /** Called when the user selects a direction or neutral center. */
  onValueChange?: (direction: DirectionPadDirection) => void;
  /** Shows all eight directions or only the four cardinal directions. @default 'eight-way' */
  mode?: DirectionPadMode;
  /** Pad density. @default 'md' */
  size?: DirectionPadSize;
  /** Disables every direction action. @default false */
  disabled?: boolean;
  /** Accessible direction-pad name. @default 'Direction' */
  label?: string;
  /** Accessible label for the neutral center action. @default 'Center' */
  centerLabel?: string;
}

type DirectionDetail = {
  direction: DirectionPadDirection;
  label: string;
  row: number;
  column: number;
};

const DIRECTION_DETAILS: readonly DirectionDetail[] = [
  { direction: 'up-left', label: 'Up left', row: 0, column: 0 },
  { direction: 'up', label: 'Up', row: 0, column: 1 },
  { direction: 'up-right', label: 'Up right', row: 0, column: 2 },
  { direction: 'left', label: 'Left', row: 1, column: 0 },
  { direction: 'center', label: 'Center', row: 1, column: 1 },
  { direction: 'right', label: 'Right', row: 1, column: 2 },
  { direction: 'down-left', label: 'Down left', row: 2, column: 0 },
  { direction: 'down', label: 'Down', row: 2, column: 1 },
  { direction: 'down-right', label: 'Down right', row: 2, column: 2 },
];

const DIRECTION_LABELS: Record<DirectionPadDirection, string> = Object.fromEntries(
  DIRECTION_DETAILS.map(({ direction, label }) => [direction, label])
) as Record<DirectionPadDirection, string>;

function isDiagonal(direction: DirectionPadDirection) {
  return direction.includes('-');
}

function supportsDirection(direction: DirectionPadDirection, mode: DirectionPadMode) {
  return mode === 'eight-way' || !isDiagonal(direction);
}

function normaliseDirection(direction: DirectionPadDirection, mode: DirectionPadMode) {
  return supportsDirection(direction, mode) ? direction : 'center';
}

function keyboardDirection(
  direction: DirectionPadDirection,
  key: string,
  mode: DirectionPadMode
): DirectionPadDirection | null {
  const eightWay = mode === 'eight-way';

  if (key === 'Home') return 'center';
  if (key === 'ArrowUp') {
    if (eightWay && direction.includes('left')) return 'up-left';
    if (eightWay && direction.includes('right')) return 'up-right';
    return 'up';
  }
  if (key === 'ArrowDown') {
    if (eightWay && direction.includes('left')) return 'down-left';
    if (eightWay && direction.includes('right')) return 'down-right';
    return 'down';
  }
  if (key === 'ArrowLeft') {
    if (eightWay && direction.includes('up')) return 'up-left';
    if (eightWay && direction.includes('down')) return 'down-left';
    return 'left';
  }
  if (key === 'ArrowRight') {
    if (eightWay && direction.includes('up')) return 'up-right';
    if (eightWay && direction.includes('down')) return 'down-right';
    return 'right';
  }

  return null;
}

function DirectionIcon({ direction }: { direction: DirectionPadDirection }) {
  if (direction === 'center') return <TargetIcon aria-hidden="true" />;

  const icon = direction.includes('up') ? (
    <ArrowUpIcon aria-hidden="true" />
  ) : direction.includes('down') ? (
    <ArrowDownIcon aria-hidden="true" />
  ) : direction === 'left' ? (
    <ArrowLeftIcon aria-hidden="true" />
  ) : (
    <ArrowRightIcon aria-hidden="true" />
  );

  return (
    <span className={`fk-direction-pad__icon fk-direction-pad__icon--${direction}`}>{icon}</span>
  );
}

/**
 * A compact directional selector for motion, alignment, and spatial tools. It supports a
 * neutral center plus either four cardinal or all eight compass directions.
 */
export const DirectionPad = forwardRef<HTMLDivElement, DirectionPadProps>(function DirectionPad(
  {
    value,
    defaultValue = 'center',
    onValueChange,
    mode = 'eight-way',
    size = 'md',
    disabled = false,
    label = 'Direction',
    centerLabel = 'Center',
    className,
    ...props
  },
  ref
) {
  const buttonRefs = useRef<Partial<Record<DirectionPadDirection, HTMLButtonElement | null>>>({});
  const [uncontrolledValue, setUncontrolledValue] = useState<DirectionPadDirection>(() =>
    normaliseDirection(defaultValue, mode)
  );
  const selectedDirection = normaliseDirection(value ?? uncontrolledValue, mode);
  const classes = [
    'fk-direction-pad',
    `fk-direction-pad--${size}`,
    `fk-direction-pad--${mode}`,
    disabled && 'fk-direction-pad--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const selectDirection = useCallback(
    (direction: DirectionPadDirection, moveFocus = false) => {
      const next = normaliseDirection(direction, mode);
      if (value === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
      if (moveFocus) buttonRefs.current[next]?.focus();
    },
    [mode, onValueChange, value]
  );

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    direction: DirectionPadDirection
  ) => {
    const next = keyboardDirection(direction, event.key, mode);
    if (!next) return;
    event.preventDefault();
    selectDirection(next, true);
  };

  return (
    <div
      ref={ref}
      {...props}
      className={classes}
      role="group"
      aria-label={`${label}. Current direction: ${DIRECTION_LABELS[selectedDirection]}.`}
      aria-disabled={disabled || undefined}
    >
      {DIRECTION_DETAILS.map((detail) => {
        const { direction, label: directionLabel, row, column } = detail;
        const isSupported = supportsDirection(direction, mode);
        if (!isSupported) {
          return (
            <span
              className="fk-direction-pad__empty"
              key={direction}
              aria-hidden="true"
              style={{ gridColumn: column + 1, gridRow: row + 1 }}
            />
          );
        }

        const isCenter = direction === 'center';
        const actionLabel = isCenter ? centerLabel : directionLabel;
        return (
          <button
            className="fk-direction-pad__button"
            type="button"
            key={direction}
            ref={(element) => {
              buttonRefs.current[direction] = element;
            }}
            style={{ gridColumn: column + 1, gridRow: row + 1 }}
            disabled={disabled}
            aria-label={actionLabel}
            aria-pressed={selectedDirection === direction}
            data-selected={selectedDirection === direction || undefined}
            onClick={() => selectDirection(direction)}
            onKeyDown={(event) => handleKeyDown(event, direction)}
          >
            <DirectionIcon direction={direction} />
          </button>
        );
      })}
    </div>
  );
});
