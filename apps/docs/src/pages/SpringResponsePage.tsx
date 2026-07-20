import { useState } from 'react';
import {
  Button,
  ResetIcon,
  SpringResponse,
  type SpringResponseValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const DEFAULT_SPRING: SpringResponseValue = {
  mass: 1,
  stiffness: 170,
  damping: 18,
  velocity: 0,
};

const RESPONSE_VARIANTS: readonly {
  label: string;
  title: string;
  description: string;
  value: SpringResponseValue;
}[] = [
  {
    label: 'Balanced',
    title: 'Quick, restrained landing',
    description:
      'A small overshoot gives controls a sense of weight without making the interface feel playful.',
    value: DEFAULT_SPRING,
  },
  {
    label: 'Bouncy',
    title: 'Visible elastic feedback',
    description:
      'Lower damping makes the energy legible for direct manipulation, drops, and expressive canvas objects.',
    value: { mass: 1, stiffness: 210, damping: 10, velocity: 0 },
  },
  {
    label: 'Critical',
    title: 'Fastest clean settle',
    description:
      'Critical damping reaches the target without overshoot when a precise, quiet arrival is more important.',
    value: { mass: 1, stiffness: 170, damping: 26, velocity: 0 },
  },
];

export function SpringResponsePage() {
  const [spring, setSpring] = useState<SpringResponseValue>(DEFAULT_SPRING);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Spring response"
        lede="A physical motion editor for interfaces that need more character than a curve alone. Tune mass, stiffness, damping, and initial velocity while the settling behaviour stays in view."
      />

      <Section title="Motion spring inspector">
        <p className="section-intro">
          Keep the parameters and the result together. The graph uses the same physical values as
          the controls, so a change to weight, energy, or resistance immediately explains how the
          motion will arrive.
        </p>
        <div className="demo">
          <div className="spring-response-inspector" aria-label="Spring motion inspector">
            <div className="spring-response-inspector__heading">
              <div>
                <span className="fk-tag">Motion</span>
                <strong>Panel response</strong>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconStart={<ResetIcon />}
                aria-label="Reset spring response"
                title="Reset spring response"
                onClick={() => setSpring(DEFAULT_SPRING)}
              >
                Reset
              </Button>
            </div>

            <SpringResponse
              value={spring}
              onValueChange={setSpring}
              label="Panel response spring"
            />
          </div>
        </div>
        <p className="section-note">
          The target is the dashed line. The response is calculated from the current values, while
          the summary reports its character, settling time, damping ratio, and overshoot.
        </p>
      </Section>

      <Section title="Choose the response, not a decoration">
        <div className="spring-response-variants">
          {RESPONSE_VARIANTS.map((variant) => (
            <article key={variant.label}>
              <span className="fk-tag spec-label">{variant.label}</span>
              <SpringResponse
                defaultValue={variant.value}
                density="compact"
                showControls={false}
                editable={false}
                label={variant.label + ' spring response'}
              />
              <strong>{variant.title}</strong>
              <p>{variant.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { SpringResponse, type SpringResponseValue } from '@presentstandards/framekit-ui';

const [spring, setSpring] = useState<SpringResponseValue>({
  mass: 1,
  stiffness: 170,
  damping: 18,
  velocity: 0,
});

<SpringResponse
  value={spring}
  onValueChange={setSpring}
  label="Panel response spring"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
