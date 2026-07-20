import { Button, Loader, type LoaderVariant } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const VARIANTS: Array<{ variant: LoaderVariant; name: string; note: string }> = [
  { variant: 'grid', name: 'Grid', note: 'Four cells sequence through a compact matrix.' },
  { variant: 'bars', name: 'Bars', note: 'A tiny equalizer of rising blocks.' },
  { variant: 'steps', name: 'Steps', note: 'Three square cells move along a baseline.' },
  { variant: 'pulse', name: 'Pulse', note: 'Nested squares breathe in a quiet rhythm.' },
  { variant: 'orbit', name: 'Orbit', note: 'One block traces a precise square perimeter.' },
  { variant: 'wave', name: 'Wave', note: 'Four square cells pass a compact vertical beat.' },
  { variant: 'flip', name: 'Flip', note: 'Paired tiles turn over in a mechanical cadence.' },
  { variant: 'scan', name: 'Scan', note: 'A rectangular beam sweeps across a compact field.' },
];

export function LoaderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Loader"
        lede="Small currentColor-driven activity indicators for compact controls and dense tool UIs. Choose a pattern to match the task without reaching for a generic spinner."
      />

      <Section title="Styles">
        <p className="section-intro">
          Grid is the default: block-based, legible at button scale, and restrained in motion. The
          other variants provide different character without adding any visual noise.
        </p>
        <div className="loader-list">
          {VARIANTS.map((item) => (
            <div className="loader-list-row" key={item.variant}>
              <span className="loader-list-preview">
                <Loader variant={item.variant} label={`${item.name} loading`} />
              </span>
              <code className="loader-list-variant">{`variant="${item.variant}"`}</code>
              <span className="loader-list-note">{item.note}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="In buttons">
        <p className="section-intro">
          Button loading defaults to the grid. Set <code>loader</code> when a task benefits from a
          different signal; the label remains in the accessibility tree while the visual loader is
          shown.
        </p>
        <div className="demo">
          <div className="demo-row">
            <Button variant="primary" loading>
              Saving
            </Button>
            <Button loading loader="bars">
              Processing
            </Button>
            <Button variant="ghost" loading loader="steps">
              Syncing
            </Button>
            <Button variant="danger" loading loader="pulse">
              Removing
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Accessibility">
        <p className="section-intro">
          A standalone loader is decorative by default. Pass <code>label</code> when it is the only
          loading status available to assistive technology. Button already supplies{' '}
          <code>aria-busy</code> and preserves its label while loading.
        </p>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Button, Loader } from '@presentstandards/framekit-ui';

<Loader variant="orbit" label="Loading canvas" />
<Button variant="primary" loading>Saving</Button>
<Button loading loader="bars">Processing</Button>`}</code>
        </pre>
      </Section>
    </>
  );
}
