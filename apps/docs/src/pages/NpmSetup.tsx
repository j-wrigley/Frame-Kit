import { Button, CheckIcon, CopyIcon, ExternalLinkIcon, Tag } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';
import { useCopyFeedback } from '../lib/use-copy-feedback';

const NPM_PACKAGE_URL = 'https://www.npmjs.com/package/@presentstandards/framekit-ui';
const CURRENT_PACKAGE_VERSION = '0.1.1';

const NPM_SETUP_PROMPT = `Set up this project to use Frame Kit from npm.

1. Inspect the project first and preserve its existing framework, package manager, lockfile, rendering model, and conventions.
2. Install @presentstandards/framekit-ui from the npm registry using the project's existing package manager. Do not replace or upgrade unrelated dependencies.
3. Confirm that react and react-dom are both on a supported matching major version: 18 or 19.
4. Import '@presentstandards/framekit-ui/styles.css' exactly once at the correct application root. Import components only from '@presentstandards/framekit-ui'; do not import internal source or dist paths.
5. For server-rendered frameworks, keep interactive Frame Kit controls behind the appropriate client boundary and do not execute browser-only APIs during server rendering.
6. Confirm the package and stylesheet resolve, then run the project's existing typecheck and production build commands if available.

This is setup only. Do not create screens, features, content, settings, visual adjustments, or new components. Stop after reporting the setup result and files changed.`;

export function NpmSetup() {
  const { copied, announcement, copy } = useCopyFeedback();

  const openPackage = () => {
    window.open(NPM_PACKAGE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <PageHeader
        eyebrow="Start up"
        title="Install Frame Kit from npm."
        lede="Add the published package directly to a React application. This is the recommended setup for most projects because the package manager records the version, installs updates, and keeps Frame Kit independent from its source repository."
      />

      <Section title="Published package">
        <div className="startup-source">
          <div className="startup-source__copy">
            <Tag tone="accent">NPM</Tag>
            <h3>@presentstandards/framekit-ui</h3>
            <p>
              Public React package with components, icons, fonts, design tokens, styles, and
              TypeScript declarations. The current published release is {CURRENT_PACKAGE_VERSION}.
            </p>
          </div>
          <Button variant="secondary" iconStart={<ExternalLinkIcon />} onClick={openPackage}>
            View on npm
          </Button>
        </div>
      </Section>

      <Section title="Install">
        <ol className="startup-steps">
          <li>
            <Tag tone="accent">01</Tag>
            <div>
              <h3>Add the package to your app</h3>
              <p>Run the install from the application that will use Frame Kit.</p>
              <pre className="code-block">
                <code>npm install @presentstandards/framekit-ui</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">02</Tag>
            <div>
              <h3>Load Frame Kit&apos;s styles once</h3>
              <p>
                Import the complete stylesheet at the application root. It includes the fonts,
                tokens, base rules, and every component style.
              </p>
              <pre className="code-block">
                <code>import '@presentstandards/framekit-ui/styles.css';</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">03</Tag>
            <div>
              <h3>Import public components</h3>
              <p>
                Import only what the interface needs from the package root. Avoid internal source or
                dist paths because they are not part of the public API.
              </p>
              <pre className="code-block">
                <code>{`import { Button, Input, Slider } from '@presentstandards/framekit-ui';`}</code>
              </pre>
            </div>
          </li>
        </ol>
      </Section>

      <Section title="Compatibility">
        <p className="section-intro">
          Frame Kit is an ESM React library rather than a complete application framework. It works
          in browser-based React interfaces wherever the host toolchain can bundle JavaScript and
          CSS.
        </p>
        <dl className="startup-requirements">
          <div>
            <Tag tone="accent">Peer dependency</Tag>
            <dt>React and React DOM 18 or 19</dt>
            <dd>Keep both packages on the same supported major version.</dd>
          </div>
          <div>
            <Tag tone="accent">Toolchains</Tag>
            <dt>Vite, Electron, and React frameworks</dt>
            <dd>
              Use Frame Kit in the browser or Electron renderer layer. It is not intended for an
              Electron main process or a non-React UI runtime.
            </dd>
          </div>
          <div>
            <Tag tone="accent">SSR</Tag>
            <dt>Use an appropriate client boundary</dt>
            <dd>
              In server-rendered and React Server Component apps, keep interactive controls in a
              client component without converting the entire application.
            </dd>
          </div>
          <div>
            <Tag tone="accent">Included</Tag>
            <dt>Types, fonts, icons, and styles</dt>
            <dd>No separate type package, icon dependency, or font installation is required.</dd>
          </div>
        </dl>
      </Section>

      <Section title="Update and pin versions">
        <ol className="startup-steps">
          <li>
            <Tag tone="accent">01</Tag>
            <div>
              <h3>Update within the saved version range</h3>
              <p>
                This respects the version range already recorded in your app&apos;s package.json and
                updates its lockfile.
              </p>
              <pre className="code-block">
                <code>npm update @presentstandards/framekit-ui</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">02</Tag>
            <div>
              <h3>Move to the latest published release</h3>
              <p>
                Use the latest tag when you intentionally want the newest release, including a new
                pre-1.0 minor version.
              </p>
              <pre className="code-block">
                <code>npm install @presentstandards/framekit-ui@latest</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">03</Tag>
            <div>
              <h3>Pin the current release exactly</h3>
              <p>
                Exact versions are useful when a production tool must not change until you
                deliberately approve an update.
              </p>
              <pre className="code-block">
                <code>{`npm install @presentstandards/framekit-ui@${CURRENT_PACKAGE_VERSION} --save-exact`}</code>
              </pre>
            </div>
          </li>
        </ol>
        <p className="section-note">
          Frame Kit is currently pre-1.0. Review release changes and test both themes, keyboard
          behaviour, and your production build before adopting a new minor version.
        </p>
      </Section>

      <Section title="Remove">
        <p className="section-intro">
          Remove the dependency, then delete the single global stylesheet import and any remaining
          component imports from the application.
        </p>
        <pre className="code-block">
          <code>npm uninstall @presentstandards/framekit-ui</code>
        </pre>
      </Section>

      <Section title="Start with AI">
        <p className="section-intro">
          Send this prompt from the application you want to prepare. Unlike the local workflow,
          there is no Frame Kit folder to attach because the agent installs the published package
          from npm.
        </p>
        <article className="ai-prompt">
          <div className="ai-prompt__header">
            <div>
              <Tag tone="accent">Setup only</Tag>
              <h3>Connect the npm package to this project</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconStart={copied === 'npm-setup' ? <CheckIcon /> : <CopyIcon />}
              onClick={() => void copy('npm-setup', NPM_SETUP_PROMPT, 'npm setup prompt copied')}
              aria-label="Copy npm setup prompt"
            >
              {copied === 'npm-setup' ? 'Copied' : 'Copy prompt'}
            </Button>
          </div>
          <pre className="code-block ai-prompt__code">
            <code>{NPM_SETUP_PROMPT}</code>
          </pre>
        </article>
        <span className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </span>
      </Section>
    </>
  );
}
