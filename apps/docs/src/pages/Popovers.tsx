import { useState } from 'react';
import {
  Button,
  CopyIcon,
  CropIcon,
  GearIcon,
  MagicWandIcon,
  Popover,
  ResetIcon,
  Slider,
  ToggleRow,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

type OpenPopover = 'actions' | 'effects' | 'canvas' | null;

export function PopoverPage() {
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const [lastAction, setLastAction] = useState('No action selected');
  const [opacity, setOpacity] = useState(84);
  const [showShadow, setShowShadow] = useState(true);

  const open = (name: Exclude<OpenPopover, null>) => openPopover === name;
  const setOpen = (name: Exclude<OpenPopover, null>, nextOpen: boolean) => {
    setOpenPopover(nextOpen ? name : null);
  };
  const selectAction = (action: string) => {
    setLastAction(action);
    setOpenPopover(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Popover"
        lede="A compact, non-modal surface for related actions and supporting settings. It stays attached to its trigger, flips away from viewport edges, and keeps the quiet panel language of Frame Kit."
      />

      <Section title="Quick actions">
        <p className="section-intro">
          Use a small popover for a focused group of next actions—more contextual than a toolbar,
          and more discoverable than a context menu. It closes on outside interaction or{' '}
          <code>Escape</code>.
        </p>
        <div className="demo">
          <div className="popover-showcase">
            <div className="popover-showcase__sample">
              <span className="fk-tag spec-label">Bottom start / small</span>
              <Popover
                trigger={<Button iconStart={<MagicWandIcon />}>Quick edit</Button>}
                open={open('actions')}
                onOpenChange={(nextOpen) => setOpen('actions', nextOpen)}
                placement="bottom-start"
                size="sm"
                panelLabel="Quick edit actions"
                autoFocus
              >
                <div className="popover-demo__heading">
                  <strong>Quick edit</strong>
                  <span>Hero image</span>
                </div>
                <div className="popover-demo__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconStart={<CropIcon />}
                    onClick={() => selectAction('Crop selection')}
                  >
                    Crop selection
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconStart={<CopyIcon />}
                    onClick={() => selectAction('Copied style')}
                  >
                    Copy style
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    iconStart={<ResetIcon />}
                    onClick={() => selectAction('Reset appearance')}
                  >
                    Reset appearance
                  </Button>
                </div>
              </Popover>
            </div>
          </div>
          <p className="popover-demo__status" role="status" aria-live="polite">
            {lastAction}
          </p>
        </div>
      </Section>

      <Section title="Composed settings">
        <p className="section-intro">
          The panel accepts regular Frame Kit controls, so an occasional setting can stay near its
          trigger without forcing a persistent inspector. Prefer an inline disclosure for settings
          users need to scan or compare continuously.
        </p>
        <div className="demo">
          <div className="popover-showcase">
            <div className="popover-showcase__sample">
              <span className="fk-tag spec-label">Bottom end / medium</span>
              <Popover
                trigger={<Button iconStart={<GearIcon />}>Layer effects</Button>}
                open={open('effects')}
                onOpenChange={(nextOpen) => setOpen('effects', nextOpen)}
                placement="bottom-end"
                panelLabel="Layer effects"
              >
                <div className="popover-demo__heading">
                  <strong>Layer effects</strong>
                  <span>Live</span>
                </div>
                <p className="popover-demo__detail">
                  Adjust the selected layer without leaving canvas.
                </p>
                <div className="popover-demo__settings">
                  <Slider
                    label="Opacity"
                    value={opacity}
                    onValueChange={setOpacity}
                    size="sm"
                    formatValue={(value) => `${value}%`}
                  />
                  <ToggleRow
                    variant="compact"
                    label="Drop shadow"
                    checked={showShadow}
                    onChange={(event) => setShowShadow(event.target.checked)}
                  />
                </div>
              </Popover>
            </div>
            <div className="popover-showcase__sample">
              <span className="fk-tag spec-label">Top start / small</span>
              <Popover
                trigger={
                  <Button variant="secondary" iconStart={<ResetIcon />}>
                    Canvas view
                  </Button>
                }
                open={open('canvas')}
                onOpenChange={(nextOpen) => setOpen('canvas', nextOpen)}
                placement="top-start"
                size="sm"
                panelLabel="Canvas view"
              >
                <div className="popover-demo__heading">
                  <strong>Canvas view</strong>
                  <span>100%</span>
                </div>
                <p className="popover-demo__detail">
                  Fit the active frame or restore the last view.
                </p>
                <Button size="sm" fullWidth onClick={() => selectAction('Fit canvas to selection')}>
                  Fit selection
                </Button>
              </Popover>
            </div>
          </div>
        </div>
        <p className="section-note">
          Set <code>placement</code> to any side and alignment. The surface first flips to the
          opposite side, then clamps inside the viewport when space is limited.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Button, Popover, Slider } from '@presentstandards/framekit-ui';

<Popover
  trigger={<Button>Layer effects</Button>}
  placement="bottom-end"
  panelLabel="Layer effects"
>
  <Slider
    label="Opacity"
    value={opacity}
    onValueChange={setOpacity}
    formatValue={(value) => \`${'${value}'}%\`}
  />
</Popover>

// Controlled when the surrounding UI needs to coordinate open surfaces.
<Popover
  trigger={<Button>Quick edit</Button>}
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <QuickEditActions />
</Popover>`}</code>
        </pre>
      </Section>
    </>
  );
}
