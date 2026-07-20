import { useState } from 'react';
import {
  Button,
  ColorBalanceWheels,
  ResetIcon,
  Tag,
  type ColorBalanceValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const LOG_GRADE: ColorBalanceValue = {
  shadows: { x: -0.18, y: 0.08 },
  midtones: { x: 0.03, y: 0.05 },
  highlights: { x: 0.12, y: -0.08 },
  lift: 0.96,
  gamma: 1.04,
  gain: 1.06,
};

export function ColorBalanceWheelsPage() {
  const [grade, setGrade] = useState<ColorBalanceValue>(LOG_GRADE);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Color balance wheels"
        lede="A three-way grading control for gently separating shadows, midtones, and highlights. Direct two-axis wheels keep chroma bias visible, while compact lift, gamma, and gain controls preserve tonal balance."
      />

      <Section title="Three-way color grade">
        <p className="section-intro">
          Each wheel independently biases one tonal range. The centre is neutral; move out toward a
          hue to introduce colour. The matching lift, gamma, or gain slider changes that range’s
          luminance, so it deliberately does not move the wheel’s chroma handle.
        </p>
        <div className="demo">
          <div className="color-balance-inspector" aria-label="Log footage color balance inspector">
            <div className="color-balance-inspector__heading">
              <div>
                <Tag>Grade</Tag>
                <strong>Three-way balance</strong>
              </div>
              <div className="color-balance-inspector__actions">
                <span>Log footage</span>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset three-way color balance"
                  title="Reset three-way color balance"
                  onClick={() => setGrade(LOG_GRADE)}
                />
              </div>
            </div>

            <ColorBalanceWheels
              value={grade}
              onValueChange={setGrade}
              label="Three-way color balance"
            />
          </div>
        </div>
        <p className="section-note">
          Drag directly in a wheel or use its arrow keys for fine adjustment. Hold <kbd>Shift</kbd>{' '}
          while dragging to align to the eight primary colour directions; holding it with arrow keys
          moves in larger, deliberate increments. The sliders control luma for shadows, midtones,
          and highlights respectively; wheel handles only communicate chroma bias. Lift, gamma, and
          gain are neutral at 1.00.
        </p>
      </Section>

      <Section title="Keep three-way grading intentional">
        <div className="color-balance-guidance">
          <div>
            <Tag>Ranges</Tag>
            <strong>Start with the dominant range</strong>
            <p>Make the visual decision in the wheel that owns it before compensating elsewhere.</p>
          </div>
          <div>
            <Tag>Neutral</Tag>
            <strong>Keep neutral obvious</strong>
            <p>
              The central target gives editors a reliable return point between subtle adjustments.
            </p>
          </div>
          <div>
            <Tag>Levels</Tag>
            <strong>Separate hue from exposure</strong>
            <p>
              Lift, gamma, and gain stay narrow and secondary, so the wheels remain the primary
              task.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { ColorBalanceWheels, type ColorBalanceValue } from '@presentstandards/framekit-ui';

const [grade, setGrade] = useState<ColorBalanceValue>({
  shadows: { x: -0.18, y: 0.08 },
  midtones: { x: 0.03, y: 0.05 },
  highlights: { x: 0.12, y: -0.08 },
  lift: 0.96,
  gamma: 1.04,
  gain: 1.06,
});

<ColorBalanceWheels
  value={grade}
  onValueChange={setGrade}
  label="Three-way color balance"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
