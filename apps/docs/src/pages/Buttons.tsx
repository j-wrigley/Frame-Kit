import { useState } from 'react';
import {
  ArrowRightIcon,
  Button,
  CopyIcon,
  DownloadIcon,
  EyeOpenIcon,
  GearIcon,
  LoopIcon,
  MagicWandIcon,
  PlusIcon,
  TrashIcon,
  type ButtonVariant,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const VARIANTS: { variant: ButtonVariant; label: string }[] = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'secondary', label: 'Secondary' },
  { variant: 'ghost', label: 'Ghost' },
  { variant: 'danger', label: 'Danger' },
];

export function Buttons() {
  const [loading, setLoading] = useState(false);

  const runLoading = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1600);
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Button"
        lede="The command button — the primary action control across a tool UI. Four weights, three sizes, optional icons, and a width-stable loading state."
      />

      <Section title="Variants">
        <div className="demo">
          <div className="demo-row">
            {VARIANTS.map((v) => (
              <Button key={v.variant} variant={v.variant}>
                {v.label}
              </Button>
            ))}
          </div>
        </div>
        <p className="section-note">
          One <code>primary</code> per view — the single affirmative action. Everything else is{' '}
          <code>secondary</code> or <code>ghost</code>; <code>danger</code> confirms a destructive
          action.
        </p>
      </Section>

      <Section title="Sizes">
        <div className="demo">
          <div className="demo-row demo-row-baseline">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
        <p className="section-note">
          24 / 30 / 34px. Medium is the default for panels and toolbars.
        </p>
      </Section>

      <Section title="With icons">
        <div className="demo">
          <div className="demo-row">
            <Button variant="primary" iconStart={<PlusIcon />}>
              Add layer
            </Button>
            <Button iconStart={<DownloadIcon />}>Export</Button>
            <Button iconEnd={<ArrowRightIcon />}>Continue</Button>
            <Button variant="danger" iconStart={<TrashIcon />}>
              Delete
            </Button>
            <Button variant="ghost" iconStart={<GearIcon />} aria-label="Settings" />
          </div>
        </div>
        <p className="section-note">
          Icons are the packaged set; pass any as <code>iconStart</code> / <code>iconEnd</code>. An
          icon-only button needs an <code>aria-label</code>.
        </p>
      </Section>

      <Section title="Icon buttons">
        <p className="section-intro">
          Icon-only Buttons use the same size and treatment system in a square footprint. Reserve
          them for familiar, repeatable tool actions; every one needs a concise{' '}
          <code>aria-label</code>.
        </p>
        <div className="demo">
          <div className="icon-button-showcase">
            <div className="icon-button-showcase__group">
              <span className="fk-tag spec-label">Sizes</span>
              <div className="demo-row demo-row-baseline">
                <Button variant="ghost" size="sm" iconStart={<PlusIcon />} aria-label="Add" />
                <Button size="md" iconStart={<LoopIcon />} aria-label="Loop playback" />
                <Button
                  variant="primary"
                  size="lg"
                  iconStart={<DownloadIcon />}
                  aria-label="Export"
                />
              </div>
            </div>

            <div className="icon-button-showcase__group">
              <span className="fk-tag spec-label">Treatments</span>
              <div className="demo-row">
                <Button iconStart={<GearIcon />} aria-label="Settings" />
                <Button variant="ghost" iconStart={<CopyIcon />} aria-label="Duplicate" />
                <Button variant="primary" iconStart={<MagicWandIcon />} aria-label="Apply effect" />
                <Button variant="danger" iconStart={<TrashIcon />} aria-label="Delete" />
                <Button iconStart={<EyeOpenIcon />} aria-label="Show layer" disabled />
              </div>
            </div>

            <div className="icon-button-showcase__group">
              <span className="fk-tag spec-label">Row actions</span>
              <div className="icon-action-strip" aria-label="Layer actions">
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<EyeOpenIcon />}
                  aria-label="Show layer"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<CopyIcon />}
                  aria-label="Duplicate layer"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<TrashIcon />}
                  aria-label="Delete layer"
                />
              </div>
            </div>
          </div>
        </div>
        <p className="section-note">
          Use <code>sm</code> for dense rows and toolbars, <code>md</code> for panel actions, and{' '}
          <code>lg</code> only where a primary canvas action needs more reach.
        </p>
      </Section>

      <Section title="States">
        <div className="demo">
          <div className="demo-row">
            <Button variant="primary">Default</Button>
            <Button variant="primary" loading={loading} onClick={runLoading}>
              Save changes
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="demo-row">
            <Button>Default</Button>
            <Button loading loader="bars">
              Loading
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
        <p className="section-note">
          <code>loading</code> keeps the button's width and colors, blocks activation, and sets{' '}
          <code>aria-busy</code>. It uses the Grid loader by default; pass <code>loader</code> to
          choose another pattern.
        </p>
      </Section>

      <Section title="Full width">
        <div className="demo">
          <Button variant="primary" fullWidth iconEnd={<ArrowRightIcon />}>
            Continue
          </Button>
        </div>
        <p className="section-note">
          <code>fullWidth</code> stretches to the container — for dialog footers and narrow panels.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Button, GearIcon, PlusIcon, TrashIcon } from '@presentstandards/framekit-ui';

<Button variant="primary">Export</Button>
<Button iconStart={<PlusIcon />}>Add layer</Button>
<Button variant="ghost" size="sm" iconStart={<GearIcon />} aria-label="Settings" />
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger" iconStart={<TrashIcon />}>Delete</Button>
<Button variant="primary" loading loader="grid">Saving</Button>
<Button loading loader="bars">Processing</Button>
<Button fullWidth>Continue</Button>`}</code>
        </pre>
      </Section>
    </>
  );
}
