import { useState } from 'react';
import {
  Button,
  PerspectiveGrid,
  ResetIcon,
  Tag,
  type PerspectiveGridValue,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const ARCHITECTURE_TRANSFORM: PerspectiveGridValue = {
  topLeft: { x: 0.11, y: 0.14 },
  topRight: { x: 0.89, y: 0.1 },
  bottomRight: { x: 0.94, y: 0.91 },
  bottomLeft: { x: 0.06, y: 0.93 },
  straighten: -0.6,
  horizontal: 0.18,
  vertical: -0.08,
};

export function PerspectiveTransformPage() {
  const [transform, setTransform] = useState<PerspectiveGridValue>(ARCHITECTURE_TRANSFORM);

  return (
    <>
      <PageHeader
        eyebrow="Creative"
        title="Perspective / transform grid"
        lede="A direct correction field for straightening architectural lines, adjusting horizontal and vertical keystone, and precisely placing each transformed corner without visual clutter."
      />

      <Section title="Perspective inspector">
        <p className="section-intro">
          The corner handles establish the transformed plane. Use the three fine controls for a
          deliberate straighten and keystone pass, then return to the grid for the final edge
          placement.
        </p>
        <div className="demo">
          <div className="perspective-inspector" aria-label="Architecture perspective inspector">
            <div className="perspective-inspector__heading">
              <div>
                <Tag>Transform</Tag>
                <strong>Architecture</strong>
              </div>
              <div className="perspective-inspector__actions">
                <span>Four point</span>
                <Button
                  size="sm"
                  variant="ghost"
                  iconStart={<ResetIcon />}
                  aria-label="Reset architecture perspective"
                  title="Reset architecture perspective"
                  onClick={() => setTransform(ARCHITECTURE_TRANSFORM)}
                />
              </div>
            </div>

            <PerspectiveGrid
              value={transform}
              onValueChange={setTransform}
              label="Architecture perspective transform"
            />
          </div>
        </div>
        <p className="section-note">
          Drag a corner directly or focus it and use the arrow keys; hold <kbd>Shift</kbd> for a
          larger increment. The controls below the grid use a central neutral reference, so each
          correction is easy to judge in either direction.
        </p>
      </Section>

      <Section title="Make the correction legible">
        <div className="perspective-guidance">
          <div>
            <Tag>Order</Tag>
            <strong>Level before keystone</strong>
            <p>
              Set the broad horizon first, then use horizontal and vertical correction sparingly.
            </p>
          </div>
          <div>
            <Tag>Edges</Tag>
            <strong>Keep handles on the evidence</strong>
            <p>Place each point on a real architectural edge rather than compensating by eye.</p>
          </div>
          <div>
            <Tag>Grid</Tag>
            <strong>Let the guide stay quiet</strong>
            <p>The grid reveals convergence without competing with the subject being corrected.</p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { PerspectiveGrid, type PerspectiveGridValue } from '@presentstandards/framekit-ui';

const [transform, setTransform] = useState<PerspectiveGridValue>({
  topLeft: { x: 0.11, y: 0.14 },
  topRight: { x: 0.89, y: 0.1 },
  bottomRight: { x: 0.94, y: 0.91 },
  bottomLeft: { x: 0.06, y: 0.93 },
  straighten: -0.6,
  horizontal: 0.18,
  vertical: -0.08,
});

<PerspectiveGrid
  value={transform}
  onValueChange={setTransform}
  label="Architecture perspective transform"
/>;`}</code>
        </pre>
      </Section>
    </>
  );
}
