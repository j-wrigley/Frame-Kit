import { useState } from 'react';
import { Button, EyeOpenIcon, Input, Slider, Stepper, Tag } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function nudge(value: string, amount: number, minimum: number, maximum: number, precision = 0) {
  const parsed = Number.parseFloat(value);
  const next = clamp((Number.isFinite(parsed) ? parsed : minimum) + amount, minimum, maximum);
  return next.toFixed(precision);
}

export function SimpleSidebar() {
  const [x, setX] = useState('128');
  const [y, setY] = useState('96');
  const [width, setWidth] = useState('640');
  const [height, setHeight] = useState('384');
  const [opacity, setOpacity] = useState(84);
  const [radius, setRadius] = useState(24);
  const [rotation, setRotation] = useState('0');
  const [scale, setScale] = useState('100');

  const resetProperties = () => {
    setX('128');
    setY('96');
    setWidth('640');
    setHeight('384');
    setOpacity(84);
    setRadius(24);
    setRotation('0');
    setScale('100');
  };

  return (
    <>
      <PageHeader
        eyebrow="Ready Made"
        title="Simple sidebar"
        lede="A compact layer inspector assembled from the regular Frame Kit control family. It shows how values, continuous adjustments, and bounded increments settle into a real tool sidebar without adding another visual language."
      />

      <Section title="Layer inspector">
        <p className="section-intro">
          This is a practical composition rather than a new component: the panel structure is local
          layout, while every interactive control is a standard Frame Kit input, slider, stepper, or
          button.
        </p>
        <div className="demo ready-made-demo">
          <aside className="ready-sidebar" aria-label="Hero card layer inspector">
            <header className="ready-sidebar__header">
              <div className="ready-sidebar__identity">
                <Tag>Selected layer</Tag>
                <strong>Hero card</strong>
                <span>Shape · Hero composition</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconStart={<EyeOpenIcon />}
                aria-label="Layer visible"
              />
            </header>

            <div className="ready-sidebar__body">
              <section className="ready-sidebar__section" aria-labelledby="layout-heading">
                <Tag id="layout-heading">Layout</Tag>
                <div className="ready-sidebar__input-grid">
                  <Input
                    size="sm"
                    label="X"
                    suffix="PX"
                    font="mono"
                    align="end"
                    value={x}
                    inputMode="decimal"
                    onChange={(event) => setX(event.target.value)}
                  />
                  <Input
                    size="sm"
                    label="Y"
                    suffix="PX"
                    font="mono"
                    align="end"
                    value={y}
                    inputMode="decimal"
                    onChange={(event) => setY(event.target.value)}
                  />
                  <Input
                    size="sm"
                    label="W"
                    suffix="PX"
                    font="mono"
                    align="end"
                    value={width}
                    inputMode="decimal"
                    onChange={(event) => setWidth(event.target.value)}
                  />
                  <Input
                    size="sm"
                    label="H"
                    suffix="PX"
                    font="mono"
                    align="end"
                    value={height}
                    inputMode="decimal"
                    onChange={(event) => setHeight(event.target.value)}
                  />
                </div>
              </section>

              <section className="ready-sidebar__section" aria-labelledby="appearance-heading">
                <Tag id="appearance-heading">Appearance</Tag>
                <Slider
                  size="sm"
                  label="Opacity"
                  value={opacity}
                  onValueChange={setOpacity}
                  formatValue={(value) => `${Math.round(value)}%`}
                />
                <Slider
                  size="sm"
                  label="Corner radius"
                  value={radius}
                  max={64}
                  onValueChange={setRadius}
                  formatValue={(value) => `${Math.round(value)} px`}
                />
              </section>

              <section className="ready-sidebar__section" aria-labelledby="transform-heading">
                <Tag id="transform-heading">Transform</Tag>
                <div className="ready-sidebar__stepper-row">
                  <Tag as="span">Rotate</Tag>
                  <Stepper
                    size="sm"
                    label="Rotation"
                    value={rotation}
                    suffix="°"
                    decrementDisabled={Number(rotation) <= -180}
                    incrementDisabled={Number(rotation) >= 180}
                    onChange={(event) => setRotation(event.target.value)}
                    onDecrement={() => setRotation(nudge(rotation, -1, -180, 180))}
                    onIncrement={() => setRotation(nudge(rotation, 1, -180, 180))}
                  />
                </div>
                <div className="ready-sidebar__stepper-row">
                  <Tag as="span">Scale</Tag>
                  <Stepper
                    size="sm"
                    label="Scale"
                    value={scale}
                    suffix="%"
                    decrementDisabled={Number(scale) <= 25}
                    incrementDisabled={Number(scale) >= 200}
                    onChange={(event) => setScale(event.target.value)}
                    onDecrement={() => setScale(nudge(scale, -5, 25, 200))}
                    onIncrement={() => setScale(nudge(scale, 5, 25, 200))}
                  />
                </div>
              </section>
            </div>

            <footer className="ready-sidebar__footer">
              <Button variant="ghost" size="sm" fullWidth onClick={resetProperties}>
                Reset properties
              </Button>
            </footer>
          </aside>
        </div>
        <p className="section-note">
          The sidebar remains at an inspector-friendly width, uses <code>sm</code> controls for
          density, and lets the shared components retain their native keyboard, focus, and input
          behavior.
        </p>
      </Section>

      <Section title="Composition notes">
        <div className="ready-made-notes">
          <div>
            <Tag>Structure</Tag>
            <p>
              Group values by the decision a designer is making, with a quiet divider between
              groups.
            </p>
          </div>
          <div>
            <Tag>Density</Tag>
            <p>
              Use compact controls inside a narrow inspector; keep a consistent 12px rhythm between
              fields.
            </p>
          </div>
          <div>
            <Tag>Hierarchy</Tag>
            <p>
              Let the selected object name read in Inter, and keep only category and property labels
              as tags.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
