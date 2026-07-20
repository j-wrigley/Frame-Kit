import type { ReactNode } from 'react';
import {
  ArrowRightIcon,
  ArrowTopRightIcon,
  Button,
  CheckIcon,
  CopyIcon,
  Tag,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';
import { useCopyFeedback } from '../lib/use-copy-feedback';

const FOUNDATION_BRIEF = `Frame Kit foundation
Accent: blue preset via data-accent="blue"
Themes: light + dark
Density: compact inspector
Sidebar data: [paste Copy stack JSON here]
Controls: map every parameter to its best-fit component
Groups: organise by creative task, dependency, and frequency

Treat this as the interface contract. Preserve the
sidebar order, labels, and nesting. Resolve each kind
to the public Frame Kit component and use semantic
tokens so accent contrast remains automatic.`;

const TOOL_PROMPT = `Use the Frame Kit skill and build a compact motion-poster tool.

Establish this Frame Kit foundation before feature work:
- Accent: blue preset via data-accent="blue". Use semantic accent tokens and preserve the generated foreground contrast in both themes.
- Themes: light and dark.
- Density: compact inspector controls with a restrained canvas toolbar.
- Sidebar stack: preserve the order, labels, and nesting in the copied Sidebar Builder data below, and resolve every kind to its public Frame Kit component.
- Component reasoning: before implementation, map every parameter to its data shape, interaction, best-fit Frame Kit component, sidebar group, and reason. Consider the complete catalogue; do not default to sliders or use creative controls only for novelty.

[
  { "kind": "search", "label": "Search field" },
  {
    "kind": "disclosure",
    "label": "Geometry",
    "children": [
      { "kind": "axis-field", "label": "Field layout" },
      { "kind": "drag-value", "label": "Density" },
      { "kind": "ruler-slider", "label": "Rotation" }
    ]
  },
  {
    "kind": "disclosure",
    "label": "Motion",
    "children": [
      { "kind": "modulation", "label": "Audio response" },
      { "kind": "slider", "label": "Speed" }
    ]
  },
  {
    "kind": "disclosure",
    "label": "Palette",
    "children": [
      { "kind": "color-field", "label": "Background" },
      { "kind": "gradient", "label": "Accent distribution" }
    ]
  }
]

The canvas should render a field of concentric marks that respond to a live audio amplitude value. Give me controls for density, radius, amplitude, rotation, speed, background colour, and three accent colours. Add a small preset row and an export action.

Use existing Frame Kit components before creating anything new. If a required control is a genuine gap, state why no existing component or composition fits, then build the smallest extension from Frame Kit’s tokens, typography, spacing, radii, accessibility, and interaction patterns. If it is reusable, complete the public component contract. Make any small visual adjustments through documented props, theme/accent APIs, or scoped semantic tokens—never by forcing a divergent restyle of component internals. Group controls by the creative task they support, keep frequent controls easy to reach, and place advanced or conditional controls behind purposeful disclosure. Keep the interface dense, flat, keyboard accessible, and correct in light and dark themes. Preserve smooth pointer response while values change. Run typecheck and build, then inspect the completed tool in the browser at desktop and narrow widths. Continue until the interactions and layout pass those checks.`;

const REFERENCE_PROMPT = `Use the Frame Kit skill. Study the attached reference and describe the visual behaviour you infer before implementing it.

Build an original tool inspired by its rhythm and movement, not a pixel-for-pixel copy. Expose only the controls that materially change the result: repetition, spread, phase, falloff, colour, and playback speed. Use Frame Kit creative controls where they fit. If a new primitive is genuinely needed, explain the gap and build it from the Frame Kit foundations and closest existing pattern.

Acceptance criteria: no clipped overlays, no control lag, no raw colour values in UI chrome, complete keyboard operation, and a verified light/dark result.`;

const REFINEMENT_PROMPT = `Refine this existing Frame Kit tool without changing its core behaviour.

First inspect the current component composition and identify the three weakest interaction or hierarchy problems. Then improve density, optical spacing, hover/drag feedback, and responsive behaviour using existing tokens and components. Small requested visual adjustments may use documented props, theme/accent APIs, or scoped semantic tokens; do not redesign unrelated surfaces or restyle working Frame Kit primitives into a different language.

Verify every changed state in the browser and report the files changed, checks run, and any remaining trade-offs.`;

const WORKFLOW = [
  [
    '01',
    'Set the foundation',
    'Give the exact accent, themes, density, and copied Sidebar Builder structure.',
  ],
  [
    '02',
    'Frame the outcome',
    'Describe the tool, its output, and the behaviour that makes it useful.',
  ],
  [
    '03',
    'Ground the agent',
    'Name Frame Kit, invoke the skill, and attach references or existing screens.',
  ],
  [
    '04',
    'Design the controls',
    'Map each parameter to the best-fit component, then group controls by task and dependency.',
  ],
  [
    '05',
    'Set the bar',
    'State responsive, accessibility, performance, and visual acceptance criteria.',
  ],
  [
    '06',
    'Let it finish',
    'Ask the agent to inspect, implement, run checks, visually verify, and refine before handoff.',
  ],
] as const;

const PROMPT_ANATOMY = [
  [
    'Foundation',
    'Exact accent, themes, density, and copied sidebar structure.',
    '“Use blue, both themes, and this sidebar JSON.”',
  ],
  ['Outcome', 'What the tool creates or changes.', '“Build a repeatable grain-field generator.”'],
  [
    'Reference',
    'Images, video, product behaviour, or an existing screen.',
    '“Use this clip to infer timing and density.”',
  ],
  [
    'Controls',
    'Values, useful ranges, presets, and reset behaviour.',
    '“Expose amount, scale, falloff, seed, and speed.”',
  ],
  [
    'Control map',
    'Data shape, interaction, component choice, reason, and sidebar group.',
    '“Use AxisField for linked X/Y spread; keep speed a Slider.”',
  ],
  [
    'Interaction',
    'Pointer, keyboard, playback, selection, and feedback.',
    '“Dragging stays live; Shift enables fine control.”',
  ],
  [
    'Constraints',
    'What must remain stable and what the agent must not invent.',
    '“Compose existing Frame Kit primitives first.”',
  ],
  [
    'Gaps & adjustment',
    'How to extend a genuine gap or make a small visual change without drifting.',
    '“Build a missing control from the foundations; use scoped tokens for small adjustments.”',
  ],
  [
    'Acceptance',
    'Observable checks that define done.',
    '“No clipping; themes and narrow width verified.”',
  ],
] as const;

const QUALITY_GATES = [
  [
    'Foundation',
    'The requested accent, themes, density, and Sidebar Builder structure are implemented as one coherent contract.',
  ],
  [
    'Composition',
    'Existing Frame Kit components and patterns were checked before new UI was authored.',
  ],
  [
    'Extension',
    'A genuine gap is built from Frame Kit foundations and the closest existing pattern; reusable additions complete the public contract.',
  ],
  [
    'Adjustment',
    'Small visual changes use documented props, theme/accent APIs, or scoped semantic tokens without breaking themes, focus, or keyboard behaviour.',
  ],
  [
    'Selection',
    'Every control fits the value and interaction model; repeated generic sliders were deliberately reconsidered.',
  ],
  [
    'Structure',
    'Controls are grouped by user task, dependency, and frequency with advanced options progressively disclosed.',
  ],
  ['Tokens', 'UI chrome uses semantic Frame Kit tokens; accent and contrast remain theme-aware.'],
  [
    'Type',
    'Inter carries interface copy; Office Code Pro appears only in compact uppercase tags and values.',
  ],
  [
    'State',
    'The application owns domain data, history, persistence, rendering, and export without forking Frame Kit internals.',
  ],
  [
    'Interaction',
    'Hover, focus, active, drag, disabled, loading, and empty states are deliberate.',
  ],
  ['Access', 'Controls have names, keyboard paths, visible focus, and useful native semantics.'],
  [
    'Resilience',
    'Long values, narrow widths, portal overlays, light theme, and dark theme were inspected.',
  ],
  [
    'Performance',
    'Pointer-driven controls update together without lag, layout shift, or unnecessary rerenders.',
  ],
  [
    'Release',
    'Typecheck and build pass; public additions include exports, styles, docs, and an AI-readable spec.',
  ],
] as const;

const COMPONENT_CHOICES = [
  [
    'One familiar amount',
    <code key="slider">Slider</code>,
    'A clear bounded scalar where the range itself is the useful model.',
  ],
  [
    'Direct or exact value',
    <code key="direct">DragValue · Scrubber · NumberInput</code>,
    'Fast adjustment, compact rail feedback, or exact entry.',
  ],
  [
    'Two related dimensions',
    <code key="axis">AxisField</code>,
    'Expose the relationship between paired values instead of splitting it across two sliders.',
  ],
  [
    'Direction or orientation',
    <code key="spatial">DirectionPad · OrbitDial · PerspectiveGrid</code>,
    'Use a spatial model when the adjustment is spatial.',
  ],
  [
    'Timing or response',
    <code key="motion">EasingGraph · SpringResponse · ModulationStrip</code>,
    'Make the shape or physical behaviour visible and directly editable.',
  ],
  [
    'Tone, time, or processing',
    <code key="systems">ToneCurve · KeyframeLane · ValueGraph · NodeCanvas</code>,
    'Represent the underlying system rather than flattening it into unrelated values.',
  ],
] as const;

const SIDEBAR_RULES = [
  [
    'Intent before novelty',
    'Choose the component whose interaction model matches the job. Creative controls are not decoration.',
  ],
  [
    'Pair when useful',
    'Combine a visual control with exact entry when precision and direct manipulation both matter.',
  ],
  [
    'Group by task',
    'Organise around Appearance, Transform, Motion, Output, or the product’s own workflow—not component type.',
  ],
  [
    'Show by frequency',
    'Keep primary controls visible; place advanced, conditional, or rarely used settings in Disclosure or Popover.',
  ],
  [
    'Respect dependency',
    'Keep values that affect one another together and order groups in the sequence the user works.',
  ],
  [
    'Recheck repetition',
    'If a sidebar becomes a long run of sliders, reconsider whether paired, spatial, temporal, or graphical controls fit better.',
  ],
] as const;

const EXTENSION_RULES = [
  [
    'Reuse first',
    'Search the exports, specs, and complete examples. An intentional composition is often the right answer before a new primitive.',
  ],
  [
    'Build the gap properly',
    'When no component fits, match Frame Kit’s semantic tokens, typography, 4px spacing, sharp radii, quiet elevation, keyboard behaviour, and both themes.',
  ],
  [
    'Adjust with public levers',
    'For a small change, use documented props, theme/accent APIs, or scoped semantic tokens. Make a recurring change a documented variant or component.',
  ],
  [
    'Promote what repeats',
    'A reusable control belongs in the kit with its types, styles, live example, AI-readable spec, and release checks—not as a local fork.',
  ],
] as const;

function GuidanceTable({
  columns,
  rows,
}: {
  columns: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <div className="ai-table-wrap">
      <table className="ai-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PromptExample({
  id,
  label,
  title,
  prompt,
  copied,
  onCopy,
}: {
  id: string;
  label: string;
  title: string;
  prompt: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <article className="ai-prompt">
      <div className="ai-prompt__header">
        <div>
          <Tag tone="secondary">{label}</Tag>
          <h3>{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconStart={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={onCopy}
          aria-label={`Copy ${id} prompt`}
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

function DirectionLink({
  href,
  label,
  title,
  body,
  external = false,
}: {
  href: string;
  label: string;
  title: string;
  body: string;
  external?: boolean;
}) {
  return (
    <a
      className="ai-direction-link"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <div className="ai-direction-link__head">
        <Tag tone="secondary">{label}</Tag>
        {external ? (
          <ArrowTopRightIcon aria-hidden="true" />
        ) : (
          <ArrowRightIcon aria-hidden="true" />
        )}
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </a>
  );
}

export function AIDirection() {
  const { copied, announcement, copy } = useCopyFeedback();

  return (
    <>
      <PageHeader
        eyebrow="AI Direction / people"
        title="Give the agent the idea. Frame Kit holds the interface together."
        lede="A practical way to direct GPT, Codex, or Claude to build precise creative tools with Frame Kit. Describe the outcome and behaviour clearly, give the agent useful evidence, then make verification part of the brief rather than an afterthought."
      />

      <Section title="Start with the tool, not the plumbing">
        <div className="ai-direction-lead">
          <div>
            <Tag tone="accent">The useful division</Tag>
            <h3>
              Frame Kit supplies the interface language. Your prompt supplies the product intent.
            </h3>
            <p>
              You should not need to restate spacing, typography, control density, theme behaviour,
              or the basic anatomy of an inspector. Spend that context on what the tool should make,
              how it should respond, and what a successful result looks like.
            </p>
          </div>
          <dl>
            <div>
              <dt>Frame Kit decides</dt>
              <dd>Visual language, control patterns, tokens, states, and interaction standards.</dd>
            </div>
            <div>
              <dt>Your brief decides</dt>
              <dd>Creative outcome, domain logic, data, rendering, export, and useful controls.</dd>
            </div>
          </dl>
        </div>
        <p className="section-note">
          Frame Kit is a UI system, not an application runtime. The agent still needs to choose and
          verify the right rendering, state, persistence, and export architecture for the tool.
        </p>
      </Section>

      <Section title="Set the foundation before feature work">
        <p className="section-intro">
          Give the agent a small visual contract before describing the feature. This prevents an
          otherwise good tool from starting with the wrong accent, an improvised sidebar, or a
          mixture of incompatible density and theme decisions.
        </p>
        <div className="ai-foundation">
          <div className="ai-foundation__steps">
            <a href="#/colors" className="ai-foundation-step">
              <span className="ai-foundation-step__signal" aria-hidden="true">
                <span className="ai-foundation-step__swatch" />
              </span>
              <span className="ai-foundation-step__copy">
                <span className="ai-foundation-step__meta">
                  <Tag tone="tertiary">01</Tag>
                  Accent
                </span>
                <strong>Name the exact Frame Kit accent</strong>
                <span>
                  Choose a preset or hex value. Tell the agent to use <code>data-accent</code> or{' '}
                  <code>applyAccent()</code>, never hard-coded UI chrome.
                </span>
              </span>
              <ArrowRightIcon aria-hidden="true" />
            </a>

            <a href="#/sidebar-builder" className="ai-foundation-step">
              <span
                className="ai-foundation-step__signal ai-foundation-step__signal--stack"
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </span>
              <span className="ai-foundation-step__copy">
                <span className="ai-foundation-step__meta">
                  <Tag tone="tertiary">02</Tag>
                  Sidebar <Tag tone="accent">Beta</Tag>
                </span>
                <strong>Design the inspector before prompting</strong>
                <span>
                  Build the stack, choose View to check it, then use Copy stack to capture its
                  portable <code>kind</code>, <code>label</code>, and <code>children</code> data.
                </span>
              </span>
              <ArrowRightIcon aria-hidden="true" />
            </a>

            <a href="#/frame-kit-skill" className="ai-foundation-step">
              <span
                className="ai-foundation-step__signal ai-foundation-step__signal--contract"
                aria-hidden="true"
              >
                FK
              </span>
              <span className="ai-foundation-step__copy">
                <span className="ai-foundation-step__meta">
                  <Tag tone="tertiary">03</Tag>
                  Contract
                </span>
                <strong>Paste both into the working prompt</strong>
                <span>
                  Ask the agent to preserve order and nesting, map every kind to a public component,
                  and verify generated contrast in light and dark themes.
                </span>
              </span>
              <ArrowRightIcon aria-hidden="true" />
            </a>
          </div>

          <article className="ai-foundation-brief">
            <div className="ai-foundation-brief__header">
              <div>
                <Tag tone="accent">Copy into your prompt</Tag>
                <h3>Foundation brief</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconStart={copied === 'foundation' ? <CheckIcon /> : <CopyIcon />}
                onClick={() => copy('foundation', FOUNDATION_BRIEF, 'Foundation brief copied')}
              >
                {copied === 'foundation' ? 'Copied' : 'Copy example'}
              </Button>
            </div>
            <pre className="code-block ai-foundation-brief__code">
              <code>{FOUNDATION_BRIEF}</code>
            </pre>
          </article>
        </div>
        <p className="section-note">
          The Sidebar Builder is beta, so use its copied data as an implementation brief rather than
          a runtime schema. The agent should compose the matching public components and keep
          application state, rendering, history, persistence, and export owned by the tool.
        </p>
      </Section>

      <Section title="Design a control system, not a row of sliders">
        <p className="section-intro">
          Ask the agent to make a small control map before implementation. It should consider the
          complete Frame Kit catalogue, identify the shape of each adjustment, and choose the most
          expressive component that remains clear and proportionate to the task.
        </p>
        <div className="ai-component-table">
          <GuidanceTable
            columns={['Adjustment shape', 'Consider first', 'Why']}
            rows={COMPONENT_CHOICES}
          />
        </div>
        <div className="ai-design-rules">
          {SIDEBAR_RULES.map(([title, body], index) => (
            <article key={title}>
              <Tag tone="tertiary">{String(index + 1).padStart(2, '0')}</Tag>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="section-note">
          This is intelligent selection, not forced variety. A Slider remains right for many
          familiar scalar values; an AxisField, ToneCurve, SpringResponse, or other creative
          component earns its place only when its model makes the adjustment easier to understand.
        </p>
      </Section>

      <Section title="Extend without drifting">
        <p className="section-intro">
          Frame Kit should not block a product idea simply because a control has not been designed
          yet. The skill makes a gap explicit, then extends the system from the same foundations
          rather than introducing an unrelated style.
        </p>
        <div className="ai-design-rules">
          {EXTENSION_RULES.map(([title, body], index) => (
            <article key={title}>
              <Tag tone="tertiary">{String(index + 1).padStart(2, '0')}</Tag>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="section-note">
          Small adjustments are supported: use the component&apos;s documented props first, then the
          theme, accent, or scoped semantic tokens. The agent must retain light and dark theme
          support, accessible contrast, visible focus, and the component&apos;s keyboard behaviour.
        </p>
      </Section>

      <Section title="A complete first pass">
        <div className="ai-workflow">
          {WORKFLOW.map(([step, title, body]) => (
            <article key={step}>
              <Tag tone="tertiary">{step}</Tag>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Write prompts the agent can execute">
        <p className="section-intro">
          Strong prompts describe observable behaviour and a definition of done. They leave room for
          engineering judgement while making the visual and interaction intent difficult to miss.
        </p>
        <GuidanceTable
          columns={['Prompt part', 'What to include', 'Useful example']}
          rows={PROMPT_ANATOMY}
        />
      </Section>

      <Section title="Prompt examples">
        <div className="ai-prompts">
          <PromptExample
            id="tool"
            label="New tool"
            title="Build a complete creative workspace"
            prompt={TOOL_PROMPT}
            copied={copied === 'tool'}
            onCopy={() => copy('tool', TOOL_PROMPT, 'New tool prompt copied')}
          />
          <PromptExample
            id="reference"
            label="Reference led"
            title="Turn visual evidence into editable behaviour"
            prompt={REFERENCE_PROMPT}
            copied={copied === 'reference'}
            onCopy={() => copy('reference', REFERENCE_PROMPT, 'Reference prompt copied')}
          />
          <PromptExample
            id="refinement"
            label="Refinement"
            title="Improve an existing Frame Kit interface"
            prompt={REFINEMENT_PROMPT}
            copied={copied === 'refinement'}
            onCopy={() => copy('refinement', REFINEMENT_PROMPT, 'Refinement prompt copied')}
          />
        </div>
        <span className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </span>
      </Section>

      <Section title="Definition of done">
        <GuidanceTable columns={['Gate', 'The agent must confirm']} rows={QUALITY_GATES} />
      </Section>

      <Section title="Give the agent the right direction">
        <div className="ai-direction-links">
          <DirectionLink
            href="#/frame-kit-skill"
            label="Shared"
            title="Frame Kit skill"
            body="One provider-neutral workflow and quality contract for every Frame Kit build."
          />
          <DirectionLink
            href="#/gpt-codex"
            label="OpenAI"
            title="GPT / Codex"
            body="Install the shared skill for Codex and invoke it in a working prompt."
          />
          <DirectionLink
            href="#/claude"
            label="Anthropic"
            title="Claude"
            body="Add the same skill to Claude Code without maintaining a second set of rules."
          />
        </div>
      </Section>

      <Section title="Further reading">
        <div className="ai-direction-links ai-direction-links--sources">
          <DirectionLink
            href="https://pixelpoint.io/blog/how-to-craft-personal-design-tools-with-toolcraft/"
            label="Inspiration"
            title="Toolcraft: personal design tools with AI"
            body="A useful account of focusing the first prompt on the creative behaviour once the environment is already established."
            external
          />
          <DirectionLink
            href="https://developers.openai.com/codex/skills/"
            label="Official"
            title="OpenAI agent skills"
            body="Current Codex conventions for authoring, discovering, and invoking reusable skills."
            external
          />
          <DirectionLink
            href="https://code.claude.com/docs/en/slash-commands"
            label="Official"
            title="Claude Code skills"
            body="Current Claude conventions for project skills, invocation, and supporting resources."
            external
          />
        </div>
      </Section>
    </>
  );
}

const INSTALL_ROWS = [
  [
    'GPT / Codex',
    <code key="codex-path">.agents/skills/frame-kit/SKILL.md</code>,
    <code key="codex-invoke">$frame-kit</code>,
  ],
  [
    'Claude Code',
    <code key="claude-path">.claude/skills/frame-kit/SKILL.md</code>,
    <code key="claude-invoke">/frame-kit</code>,
  ],
] as const;

export function FrameKitSkill() {
  return (
    <>
      <PageHeader
        eyebrow="AI Direction / shared skill"
        title="One Frame Kit skill for GPT and Claude."
        lede="The packaged skill gives an agent the same component-first workflow, design constraints, prompt intake, verification gates, and public-component release contract regardless of provider."
      />

      <Section title="One source of truth">
        <div className="ai-skill-summary">
          <div>
            <Tag tone="accent">Provider neutral</Tag>
            <h3>Install the same folder in the location your agent discovers.</h3>
            <p>
              The canonical source ships at <code>skills/frame-kit/</code> inside the package. Its
              main instructions remain concise; prompt recipes, component routing, and quality gates
              live in referenced files and load only when they are useful.
            </p>
          </div>
          <div className="ai-skill-summary__path">
            <Tag tone="tertiary">Package source</Tag>
            <code>node_modules/@presentstandards/framekit-ui/skills/frame-kit/</code>
          </div>
        </div>
      </Section>

      <Section title="Install for your agent">
        <GuidanceTable
          columns={['Agent', 'Project location', 'Explicit use']}
          rows={INSTALL_ROWS}
        />
        <p className="section-note">
          Copy the complete <code>frame-kit</code> folder so its references and optional Codex
          metadata stay beside <code>SKILL.md</code>.
        </p>
      </Section>

      <Section title="What the skill adds">
        <div className="ai-capability-grid">
          <article>
            <Tag tone="secondary">Foundation</Tag>
            <h3>Start from one visual contract</h3>
            <p>
              Lock the accent, themes, density, and copied sidebar structure before feature work.
            </p>
          </article>
          <article>
            <Tag tone="secondary">Discovery</Tag>
            <h3>Find before inventing</h3>
            <p>
              Locate the package, read the relevant specs, and inventory existing components first.
            </p>
          </article>
          <article>
            <Tag tone="secondary">Composition</Tag>
            <h3>Keep the system coherent</h3>
            <p>
              Map each adjustment to the best-fit component, then build genuine gaps from the same
              foundations.
            </p>
          </article>
          <article>
            <Tag tone="secondary">Ownership</Tag>
            <h3>Keep product logic explicit</h3>
            <p>Let the application own domain data, rendering, history, persistence, and export.</p>
          </article>
          <article>
            <Tag tone="secondary">Verification</Tag>
            <h3>Prove the working result</h3>
            <p>
              Exercise themes, widths, keyboard paths, pointer response, typecheck, build, and
              browser QA.
            </p>
          </article>
          <article>
            <Tag tone="secondary">Release</Tag>
            <h3>Finish public additions</h3>
            <p>
              Keep exports, styles, docs, AI specs, examples, and package contents synchronized.
            </p>
          </article>
        </div>
      </Section>

      <Section title="Use it in a prompt">
        <pre className="code-block ai-provider-prompt">
          <code>{`Use the Frame Kit skill to build a compact colour-grading inspector.
Foundation: blue accent, light + dark, compact density, and this copied
Sidebar Builder JSON: [paste stack]. Preserve its order and nesting.
Create a control map, consider the complete Frame Kit catalogue, and justify
each component and sidebar group. Do not default every scalar to a Slider.
Compose existing components first, verify pointer response and both themes,
then run the repository checks and inspect the finished page in the browser.`}</code>
        </pre>
      </Section>
    </>
  );
}

export function GPTCodexDirection() {
  return (
    <>
      <PageHeader
        eyebrow="AI Direction / GPT + Codex"
        title="Direct Codex with the Frame Kit skill."
        lede="Place the packaged skill in Codex’s repository skill directory, mention it explicitly for the first build, and keep the prompt focused on the tool’s output, behaviour, and acceptance criteria."
      />

      <Section title="Project setup">
        <ol className="ai-setup-list">
          <li>
            <Tag tone="tertiary">01</Tag>
            <div>
              <h3>Install Frame Kit</h3>
              <pre className="code-block">
                <code>npm install @presentstandards/framekit-ui</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="tertiary">02</Tag>
            <div>
              <h3>Copy the shared skill</h3>
              <pre className="code-block">
                <code>{`mkdir -p .agents/skills\ncp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .agents/skills/frame-kit`}</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="tertiary">03</Tag>
            <div>
              <h3>Invoke it with the task</h3>
              <pre className="code-block">
                <code>$frame-kit Build a focused masking tool from the attached reference…</code>
              </pre>
            </div>
          </li>
        </ol>
      </Section>

      <Section title="Codex working contract">
        <GuidanceTable
          columns={['Put it here', 'Use it for']}
          rows={[
            [
              <code key="skill">.agents/skills/frame-kit/</code>,
              'Reusable Frame Kit workflow and design-system knowledge.',
            ],
            [
              <code key="agents">AGENTS.md</code>,
              'Always-on repository facts, local commands, and project conventions.',
            ],
            [
              'Your prompt',
              'The specific outcome, evidence, controls, constraints, and definition of done.',
            ],
          ]}
        />
      </Section>

      <Section title="Prompt pattern">
        <pre className="code-block ai-provider-prompt">
          <code>{`$frame-kit Build [tool and output].

Foundation: use [accent preset or exact hex], [themes], and [density].
Sidebar data: [paste JSON copied from the Sidebar Builder].
Preserve its order, labels, and nesting.
Create a control map: [parameter, data shape, interaction, component, group, reason].
Consider the complete catalogue; use expressive controls only when their model fits.

Use [reference or existing screen] to understand [behaviour].
Expose [controls and ranges]. Support [pointer and keyboard interaction].
Preserve [constraints]. Done means [observable visual and technical checks].

Inspect the repository, implement the complete result, run its checks,
and visually verify the live interface before handing it back.`}</code>
        </pre>
      </Section>

      <Section title="Official reference">
        <DirectionLink
          href="https://developers.openai.com/codex/skills/"
          label="OpenAI"
          title="Build skills for Codex"
          body="The official reference for skill structure, repository discovery, invocation, and optional metadata."
          external
        />
      </Section>
    </>
  );
}

export function ClaudeDirection() {
  return (
    <>
      <PageHeader
        eyebrow="AI Direction / Claude"
        title="Give Claude the same Frame Kit contract."
        lede="Claude Code can use the provider-neutral skill without a rewritten prompt manual. Install the complete folder as a project skill, invoke it directly when useful, and keep durable repository facts separate from the task brief."
      />

      <Section title="Project setup">
        <ol className="ai-setup-list">
          <li>
            <Tag tone="tertiary">01</Tag>
            <div>
              <h3>Install Frame Kit</h3>
              <pre className="code-block">
                <code>npm install @presentstandards/framekit-ui</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="tertiary">02</Tag>
            <div>
              <h3>Copy the shared skill</h3>
              <pre className="code-block">
                <code>{`mkdir -p .claude/skills\ncp -R node_modules/@presentstandards/framekit-ui/skills/frame-kit .claude/skills/frame-kit`}</code>
              </pre>
            </div>
          </li>
          <li>
            <Tag tone="tertiary">03</Tag>
            <div>
              <h3>Invoke it with the task</h3>
              <pre className="code-block">
                <code>/frame-kit Build a focused masking tool from the attached reference…</code>
              </pre>
            </div>
          </li>
        </ol>
      </Section>

      <Section title="Claude working contract">
        <GuidanceTable
          columns={['Put it here', 'Use it for']}
          rows={[
            [
              <code key="skill">.claude/skills/frame-kit/</code>,
              'Reusable Frame Kit workflow and design-system knowledge.',
            ],
            [
              <code key="claude">CLAUDE.md</code>,
              'Always-on repository facts, local commands, and project conventions.',
            ],
            [
              'Your prompt',
              'The specific outcome, evidence, controls, constraints, and definition of done.',
            ],
          ]}
        />
      </Section>

      <Section title="Prompt pattern">
        <pre className="code-block ai-provider-prompt">
          <code>{`/frame-kit Build [tool and output].

Foundation: use [accent preset or exact hex], [themes], and [density].
Sidebar data: [paste JSON copied from the Sidebar Builder].
Preserve its order, labels, and nesting.
Create a control map: [parameter, data shape, interaction, component, group, reason].
Consider the complete catalogue; use expressive controls only when their model fits.

Use [reference or existing screen] to understand [behaviour].
Expose [controls and ranges]. Support [pointer and keyboard interaction].
Preserve [constraints]. Done means [observable visual and technical checks].

Inspect the repository, implement the complete result, run its checks,
and visually verify the live interface before handing it back.`}</code>
        </pre>
      </Section>

      <Section title="Official reference">
        <DirectionLink
          href="https://code.claude.com/docs/en/slash-commands"
          label="Anthropic"
          title="Extend Claude with skills"
          body="The official reference for project skill locations, automatic or direct invocation, and supporting files."
          external
        />
      </Section>
    </>
  );
}
