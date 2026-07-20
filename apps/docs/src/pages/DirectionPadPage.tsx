import { useState } from 'react';
import {
  Button,
  DirectionPad,
  ResetIcon,
  Slider,
  Toggle,
  type DirectionPadDirection,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type DirectionDetail = {
  label: string;
  angle: number;
  x: number;
  y: number;
};

const DIRECTION_DETAILS: Record<DirectionPadDirection, DirectionDetail> = {
  center: { label: 'Centered', angle: 0, x: 0, y: 0 },
  up: { label: 'Up', angle: 0, x: 0, y: 1 },
  'up-right': { label: 'Up right', angle: 45, x: 1, y: 1 },
  right: { label: 'Right', angle: 90, x: 1, y: 0 },
  'down-right': { label: 'Down right', angle: 135, x: 1, y: -1 },
  down: { label: 'Down', angle: 180, x: 0, y: -1 },
  'down-left': { label: 'Down left', angle: 225, x: -1, y: -1 },
  left: { label: 'Left', angle: 270, x: -1, y: 0 },
  'up-left': { label: 'Up left', angle: 315, x: -1, y: 1 },
};

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function DirectionPadPage() {
  const [direction, setDirection] = useState<DirectionPadDirection>('up-right');
  const [strength, setStrength] = useState(52);
  const [relative, setRelative] = useState(true);
  const detail = DIRECTION_DETAILS[direction];

  const resetDirection = () => {
    setDirection('center');
    setStrength(50);
    setRelative(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Direction pad"
        lede="A precise compass control for motion, alignment, and spatial effects. Choose a clear cardinal or diagonal direction, return to center in one action, and pair it with the strength that gives the choice meaning."
      />

      <Section title="Directional motion inspector">
        <p className="section-intro">
          The pad holds the discrete spatial choice; supporting controls hold the continuous
          settings. This keeps diagonal selection direct and makes the current vector easy to read
          without turning an inspector into a coordinate grid.
        </p>
        <div className="demo">
          <div className="direction-inspector" aria-label="Directional motion inspector">
            <div className="direction-inspector__heading">
              <div>
                <span className="fk-tag">Motion</span>
                <strong>Direction</strong>
              </div>
              <span className="direction-inspector__state">
                {detail.angle === 0 && direction === 'center' ? 'Neutral' : `${detail.angle}°`}
              </span>
            </div>

            <div className="direction-inspector__field">
              <DirectionPad
                value={direction}
                onValueChange={setDirection}
                label="Motion direction"
                centerLabel="Reset direction to center"
              />
              <div className="direction-inspector__readout">
                <span className="fk-tag">Vector</span>
                <strong>{detail.label}</strong>
                <output>
                  X {signed(detail.x)} · Y {signed(detail.y)}
                </output>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset motion direction"
                  title="Reset motion direction"
                  onClick={resetDirection}
                />
              </div>
            </div>

            <div className="direction-inspector__controls">
              <Slider
                label="Strength"
                size="sm"
                value={strength}
                onValueChange={setStrength}
                formatValue={(value) => `${value}%`}
              />
              <label className="direction-inspector__relative">
                <span>Relative</span>
                <Toggle
                  size="sm"
                  aria-label="Apply direction relative to the current layer"
                  checked={relative}
                  onChange={(event) => setRelative(event.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>
        <p className="section-note">
          Select any cell with a pointer or <kbd>Tab</kbd>. Arrow keys choose the corresponding
          cardinal direction; from a cardinal direction, an adjacent arrow selects the matching
          diagonal. Press <kbd>Home</kbd> to return to center.
        </p>
      </Section>

      <Section title="Scale the choice to the task">
        <div className="direction-pad-variants">
          <div>
            <span className="fk-tag spec-label">Eight way</span>
            <DirectionPad defaultValue="up-right" label="Eight-way direction" />
            <p>Use the full compass when diagonal motion or placement is meaningful.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Cardinal</span>
            <DirectionPad mode="cardinal" defaultValue="left" label="Cardinal direction" />
            <p>Remove corners when an action should stay on one axis at a time.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Compact</span>
            <DirectionPad size="sm" defaultValue="down-right" label="Compact direction" />
            <p>Use the smaller pad inside a popover, flyout, or dense property row.</p>
          </div>
        </div>
      </Section>

      <Section title="Keep direction decisions clear">
        <div className="direction-pad-guidance">
          <div>
            <span className="fk-tag spec-label">Discrete choice</span>
            <strong>Use the pad for direction</strong>
            <p>
              Keep magnitude, duration, and other continuous values in their own nearby controls.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Center</span>
            <strong>Make neutral a first-class action</strong>
            <p>
              The center cell is always present, so reset never becomes a hidden or separate
              command.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Mode</span>
            <strong>Only offer meaningful diagonals</strong>
            <p>
              Use cardinal mode for alignment and nudging where diagonal movement would be
              ambiguous.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { DirectionPad, type DirectionPadDirection } from '@presentstandards/framekit-ui';

const [direction, setDirection] = useState<DirectionPadDirection>('up-right');

<DirectionPad
  value={direction}
  onValueChange={setDirection}
  label="Motion direction"
  centerLabel="Reset direction to center"
/>;

// Use mode="cardinal" when diagonal actions are not meaningful.`}</code>
        </pre>
      </Section>
    </>
  );
}
