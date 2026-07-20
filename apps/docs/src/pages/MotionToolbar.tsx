import { Tag } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';
import { MotionToolbarDemo } from '../components/ready-made/MotionToolbarDemo';

export function MotionToolbar() {
  return (
    <>
      <PageHeader
        eyebrow="Ready Made"
        title="Motion toolbar"
        lede="A focused motion workspace with a deliberately minimal control bar. A shared timing bar follows one playhead across every layer of the composition."
      />

      <Section title="Top-docked motion controls">
        <p className="section-intro">
          Keep the canvas clear for the work itself. Motion and playback live at the top, while the
          Motion button slides a multi-layer timeline up from the workspace edge.
        </p>
        <div className="demo ready-motion-toolbar-demo">
          <MotionToolbarDemo />
        </div>
        <p className="section-note">
          The full-width panel keeps four KeyframeLane layers in view while one draggable playhead
          gives every layer the same timing reference.
        </p>
      </Section>

      <Section title="Composition notes">
        <div className="motion-toolbar-guidance">
          <div>
            <Tag>Focus</Tag>
            <strong>Show only motion and playback</strong>
            <p>The dock exposes exactly the controls that belong to this focused editing mode.</p>
          </div>
          <div>
            <Tag>Timeline</Tag>
            <strong>Open up from the workspace edge</strong>
            <p>The panel slides up from the canvas edge and leaves it unconstrained when closed.</p>
          </div>
          <div>
            <Tag>Layers</Tag>
            <strong>Keep the whole composition in view</strong>
            <p>
              One shared timing bar makes the relationship between every animated layer easy to
              scan.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
