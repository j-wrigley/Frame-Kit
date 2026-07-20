import {
  Button,
  HoverCard,
  InfoCircledIcon,
  MagicWandIcon,
  Tooltip,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

export function HoverCardsAndTooltips() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Hover cards & tooltips"
        lede="Small supporting surfaces for dense tools: concise labels when a control needs a name, and calm optional previews when a little more context helps users decide."
      />

      <Section title="Tooltips">
        <p className="section-intro">
          Tooltips answer one short question about a familiar control. They open on hover or
          keyboard focus, wait briefly for pointer intent, and stay out of the way of the task
          itself.
        </p>
        <div className="demo">
          <div className="overlay-showcase">
            <div className="overlay-showcase__sample">
              <span className="fk-tag spec-label">Short label</span>
              <Tooltip content="Apply the saved appearance" placement="top">
                <Button iconStart={<MagicWandIcon />}>Apply style</Button>
              </Tooltip>
            </div>
            <div className="overlay-showcase__sample">
              <span className="fk-tag spec-label">Icon action</span>
              <Tooltip content="Layer information" placement="top">
                <Button
                  variant="ghost"
                  iconStart={<InfoCircledIcon />}
                  aria-label="Layer information"
                />
              </Tooltip>
            </div>
          </div>
        </div>
        <p className="section-note">
          Keep tooltip text brief and supporting. An icon-only control still needs its own{' '}
          <code>aria-label</code>; the tooltip is not its accessible name.
        </p>
      </Section>

      <Section title="Hover card preview">
        <p className="section-intro">
          Use a hover card for optional, richer context that can survive long enough to read or
          inspect. It flips at viewport edges, stays open while the pointer moves into it, and
          closes with <code>Escape</code>.
        </p>
        <div className="demo">
          <div className="overlay-showcase">
            <div className="overlay-showcase__sample">
              <span className="fk-tag spec-label">Bottom start / medium</span>
              <HoverCard
                trigger={
                  <Button variant="secondary" iconEnd={<InfoCircledIcon />}>
                    Preview state
                  </Button>
                }
                placement="bottom-start"
                panelLabel="Animation preview state"
              >
                <div className="hover-card-preview">
                  <div className="hover-card-preview__head">
                    <div>
                      <span className="fk-tag">Animation</span>
                      <strong>Loop ready</strong>
                    </div>
                    <span className="hover-card-preview__state">Ready</span>
                  </div>
                  <div className="hover-card-preview__meta">
                    <strong>1.20 s loop</strong>
                    <span>24 frames · Linear easing</span>
                  </div>
                  <p>Starts from the current frame and returns seamlessly to the first pose.</p>
                </div>
              </HoverCard>
            </div>
          </div>
        </div>
        <p className="section-note">
          Use a popover instead when content is an on-demand action or setting. Hover cards are
          supplementary—not the only path to a necessary command or critical information.
        </p>
      </Section>

      <Section title="Choose the smallest useful surface">
        <div className="overlay-guidance">
          <div>
            <span className="fk-tag spec-label">Tooltip</span>
            <strong>One concise helper phrase</strong>
            <p>For icon labels, unfamiliar terms, or a compact explanation of a disabled action.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Hover card</span>
            <strong>Optional supporting detail</strong>
            <p>For a rich preview, status summary, or a little context that is safe to miss.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Popover</span>
            <strong>An intentional interaction</strong>
            <p>For controls and actions that must be opened deliberately and work without hover.</p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Button, HoverCard, Tooltip } from '@presentstandards/framekit-ui';

<Tooltip content="Layer information">
  <Button variant="ghost" aria-label="Layer information" />
</Tooltip>

<HoverCard trigger={<Button>Preview state</Button>} panelLabel="Animation preview">
  <PreviewDetails />
</HoverCard>

// Both surfaces can be controlled when nearby UI needs to coordinate them.
<Tooltip content="Apply style" open={isOpen} onOpenChange={setIsOpen}>
  <Button>Apply style</Button>
</Tooltip>`}</code>
        </pre>
      </Section>
    </>
  );
}
