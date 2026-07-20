import {
  Button,
  CheckIcon,
  CopyIcon,
  GithubLogoIcon,
  Tabs,
  Tag,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';
import { useCopyFeedback } from '../lib/use-copy-feedback';

// Add the public repository URL here once Frame Kit is on GitHub. Keeping it
// empty gives the docs an honest, non-navigating state until then.
const GITHUB_REPOSITORY_URL = '';

const LOCAL_SETUP_PROMPT = `I am setting up Frame Kit in this project.

I have attached the complete downloaded Frame Kit folder to this chat. Use that attached folder as the source of truth and resolve its local path yourself. Do not ask me to paste a filesystem path.

Set up this project to use @presentstandards/framekit-ui locally:
1. Confirm the attached Frame Kit folder exists, read its README, and use only its documented public package entry points. Do not import its source or dist folders directly.
2. From the Frame Kit folder, install dependencies if needed and run: npm run build:kit
3. In this project, install the attached folder's packages/framekit package as a local dependency. Preserve the existing package manager and lockfile; do not replace tooling or dependencies unnecessarily.
4. Import '@presentstandards/framekit-ui/styles.css' exactly once at the application root, then confirm the app's installed React version satisfies the kit's peer dependency.
5. Confirm the package resolves, then run the project's existing typecheck and build commands if available.

This is setup only. Do not create screens, features, content, settings, visual adjustments, or new components. Stop after reporting the setup result and files changed.`;

const ELECTRON_SETUP_PROMPT = `I am starting a minimal Electron desktop app that uses Frame Kit.

I have attached the complete downloaded Frame Kit folder to this chat. Use that attached folder as the source of truth and resolve its local path yourself. Do not ask me to paste a filesystem path.

Set up the current project as a minimal Electron + React application:
1. Inspect the current project first. Reuse its package manager, lockfile, framework, and conventions; only scaffold an Electron shell if one does not already exist. If scaffolding is needed, prefer Electron Forge and keep the Electron version current.
2. Build the attached kit with npm run build:kit, add its packages/framekit folder as a local dependency, and import '@presentstandards/framekit-ui/styles.css' exactly once in the renderer entry point.
3. Establish a secure Electron baseline: enable context isolation and the process sandbox, disable Node integration, use a strict local-content Content Security Policy, and keep web security enabled.
4. Keep the main process, preload, and renderer clearly separated. Expose only narrowly typed, task-specific APIs through contextBridge when needed; never expose raw ipcRenderer, broad Node APIs, remote content, or unchecked shell.openExternal access. Validate IPC senders and arguments before privileged work.
5. Create only a blank application shell that confirms Frame Kit loads. Do not add product screens, controls, content, settings, visual exploration, or custom components.
6. Confirm the desktop app starts, run the available typecheck and production build commands, and make sure a packaging command is available for later distribution. Do not configure signing credentials, auto-updates, or release publishing.

Stop after reporting the setup result and files changed.`;

const WEB_APP_SETUP_PROMPT = `I am starting a minimal web app that uses Frame Kit.

I have attached the complete downloaded Frame Kit folder to this chat. Use that attached folder as the source of truth and resolve its local path yourself. Do not ask me to paste a filesystem path.

Set up the current project as a React web application:
1. Inspect the current project first. Reuse its framework, package manager, lockfile, routing, and conventions; only scaffold a minimal React web app if one does not already exist.
2. Build the attached kit with npm run build:kit, add its packages/framekit folder as a local dependency, and import '@presentstandards/framekit-ui/styles.css' exactly once at the appropriate application root.
3. Respect the app's rendering model. For server-rendered or React Server Component frameworks, keep interactive Frame Kit controls behind an appropriate client boundary instead of turning the whole app into a client component. Do not use browser-only APIs during server rendering.
4. Create only a blank application shell that confirms Frame Kit loads and preserves the current baseline. Do not add product screens, controls, content, settings, visual exploration, or custom components.
5. Confirm the app starts and run the available typecheck and production build commands.

Stop after reporting the setup result and files changed.`;

const EXISTING_APP_SETUP_PROMPT = `I am adding Frame Kit to this existing application.

I have attached the complete downloaded Frame Kit folder to this chat. Use that attached folder as the source of truth and resolve its local path yourself. Do not ask me to paste a filesystem path.

Set up Frame Kit without changing the product:
1. Inspect the existing app to identify its framework, package manager, lockfile, rendering model, and correct application entry point before making changes.
2. Build the attached kit with npm run build:kit, add its packages/framekit folder as a local dependency, and import '@presentstandards/framekit-ui/styles.css' exactly once at the correct root. Use only documented public package entry points.
3. Preserve the app's framework boundaries: respect server/client component boundaries where applicable, and do not introduce browser-only code into server execution.
4. Confirm the package resolves and that the existing app continues to start unchanged. Keep existing styles, routes, tooling, dependencies, and formatting intact unless a minimal setup change requires otherwise.
5. Do not add screens, features, content, settings, visual adjustments, or custom components.
6. Run the available typecheck and production build commands, then report only the setup result and files changed.

Stop after reporting the setup result and files changed.`;

const AI_SETUP_PROMPTS = [
  {
    value: 'basic',
    label: 'Basic',
    eyebrow: 'Setup only',
    title: 'Connect the downloaded kit to this project',
    prompt: LOCAL_SETUP_PROMPT,
  },
  {
    value: 'electron',
    label: 'Electron',
    eyebrow: 'Desktop app',
    title: 'Create a minimal Electron shell',
    prompt: ELECTRON_SETUP_PROMPT,
  },
  {
    value: 'web',
    label: 'Web app',
    eyebrow: 'Web app',
    title: 'Create a minimal React web app',
    prompt: WEB_APP_SETUP_PROMPT,
  },
  {
    value: 'existing',
    label: 'Existing app',
    eyebrow: 'Integrate',
    title: 'Add Frame Kit without changing the product',
    prompt: EXISTING_APP_SETUP_PROMPT,
  },
] as const;

export function LocalSetup() {
  const { copied, announcement, copy } = useCopyFeedback();
  const openRepository = () => {
    if (!GITHUB_REPOSITORY_URL) return;
    window.open(GITHUB_REPOSITORY_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <PageHeader
        eyebrow="Start up"
        title="Use Frame Kit locally."
        lede="Download Frame Kit from GitHub, then point your app at its local package folder. The kit stays on your machine while the public npm release is being prepared."
      />

      <Section title="Get the source">
        <div className="startup-source">
          <div className="startup-source__copy">
            <Tag tone="accent">GitHub</Tag>
            <h3>Keep a local copy of the Frame Kit project.</h3>
            <p>
              When the repository is public, download the project as a ZIP or clone it, then move
              the complete Frame Kit folder somewhere stable, such as your Projects folder. This
              button will become the download and source link when GitHub is ready.
            </p>
          </div>
          <Button
            variant="secondary"
            iconStart={<GithubLogoIcon />}
            disabled={!GITHUB_REPOSITORY_URL}
            onClick={openRepository}
          >
            View on GitHub
          </Button>
        </div>
      </Section>

      <Section title="Specs needed">
        <p className="section-intro">
          Frame Kit is a React library, so there are no special operating-system or hardware
          requirements. You only need the following development setup to build the downloaded kit
          and use it in an app.
        </p>
        <dl className="startup-requirements">
          <div>
            <Tag tone="accent">Runtime</Tag>
            <dt>Node.js 22.12 or later</dt>
            <dd>
              Required to install the downloaded project&apos;s dependencies and build the local
              package.
            </dd>
          </div>
          <div>
            <Tag tone="accent">Package manager</Tag>
            <dt>npm</dt>
            <dd>
              Used by this project&apos;s documented commands and to connect the local package to
              your app.
            </dd>
          </div>
          <div>
            <Tag tone="accent">App</Tag>
            <dt>React and React DOM 18 or 19</dt>
            <dd>
              Frame Kit&apos;s supported peer dependency range. Keep both packages on a matching
              major version.
            </dd>
          </div>
          <div>
            <Tag tone="accent">Build</Tag>
            <dt>An ESM-capable React toolchain</dt>
            <dd>
              Vite, Electron&apos;s renderer, and most current React frameworks work well with the
              package.
            </dd>
          </div>
        </dl>
        <p className="section-note">
          The kit includes its own fonts, icons, styles, and TypeScript types. You do not need an
          additional icon library, font install, or operating-system-specific setup.
        </p>
      </Section>

      <Section title="Install from the downloaded folder">
        <p className="section-intro">
          Install the package directory into your app by its path. npm connects to that local
          folder; Frame Kit is neither downloaded from nor published to the npm registry.
        </p>
        <ol className="startup-steps">
          <li>
            <Tag tone="accent">01</Tag>
            <div>
              <h3>Prepare the downloaded project</h3>
              <p>Run these commands once from the Frame Kit folder you downloaded from GitHub.</p>
              <pre className="code-block">
                <code>{`cd /path/to/frame-kit\nnpm install\nnpm run build:kit`}</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">02</Tag>
            <div>
              <h3>Install the local package in your app</h3>
              <p>Run this from the React application where you want to use Frame Kit.</p>
              <pre className="code-block">
                <code>{`cd /path/to/your-react-app\nnpm install /path/to/frame-kit/packages/framekit`}</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">03</Tag>
            <div>
              <h3>Import the stylesheet and components</h3>
              <p>
                Load the stylesheet once at your application root, then import only the controls you
                need.
              </p>
              <pre className="code-block">
                <code>{`import '@presentstandards/framekit-ui/styles.css';\nimport { Button, Input } from '@presentstandards/framekit-ui';`}</code>
              </pre>
            </div>
          </li>
        </ol>
        <p className="section-note">
          When Frame Kit changes, run <code>npm run build:kit</code> again, then refresh your app.
          The local dependency stays in place until you remove it from the app with{' '}
          <code>npm uninstall @presentstandards/framekit-ui</code>.
        </p>
      </Section>

      <Section title="Update from GitHub">
        <p className="section-intro">
          The app keeps pointing at the same local package folder. Update that folder, rebuild Frame
          Kit, then restart the app using it—there is no npm package release involved.
        </p>
        <ol className="startup-steps">
          <li>
            <Tag tone="accent">01</Tag>
            <div>
              <h3>If you cloned the repository</h3>
              <p>
                Pull the latest changes into the same local Frame Kit folder, then rebuild the
                package.
              </p>
              <pre className="code-block">
                <code>{`cd /path/to/frame-kit\ngit pull\nnpm install\nnpm run build:kit`}</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="accent">02</Tag>
            <div>
              <h3>If you downloaded a ZIP</h3>
              <p>
                Download the new ZIP, replace the existing Frame Kit folder in the same location,
                then install its dependencies and rebuild it.
              </p>
              <pre className="code-block">
                <code>{`cd /path/to/frame-kit\nnpm install\nnpm run build:kit`}</code>
              </pre>
            </div>
          </li>
        </ol>
        <p className="section-note">
          Restart the consuming app once the build finishes. If you move the Frame Kit folder rather
          than replacing it in place, run the local{' '}
          <code>npm install /path/to/frame-kit/packages/framekit</code> command again from that app.
        </p>
      </Section>

      <Section title="Start with AI">
        <p className="section-intro">
          Drag the complete downloaded Frame Kit folder into the chat before sending one of these
          prompts. If the chat cannot attach folders, attach a ZIP of that folder instead. Basic
          setup only connects the package; the other tabs establish an appropriate empty app shell
          without beginning product or design work.
        </p>
        <Tabs
          className="startup-ai-tabs"
          aria-label="AI setup prompt type"
          variant="contained"
          size="sm"
          items={AI_SETUP_PROMPTS.map((setup) => ({
            value: setup.value,
            label: setup.label,
            content: (
              <SetupPrompt
                {...setup}
                copied={copied === setup.value}
                onCopy={() =>
                  void copy(setup.value, setup.prompt, `${setup.label} setup prompt copied`)
                }
              />
            ),
          }))}
        />
        <span className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </span>
      </Section>
    </>
  );
}

function SetupPrompt({
  value,
  eyebrow,
  title,
  prompt,
  copied,
  onCopy,
}: {
  value: string;
  eyebrow: string;
  title: string;
  prompt: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="ai-prompt">
      <div className="ai-prompt__header">
        <div>
          <Tag tone="accent">{eyebrow}</Tag>
          <h3>{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconStart={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={onCopy}
          aria-label={`Copy ${value} setup prompt`}
        >
          {copied ? 'Copied' : 'Copy prompt'}
        </Button>
      </div>
      <pre className="code-block ai-prompt__code">
        <code>{prompt}</code>
      </pre>
    </article>
  );
}
