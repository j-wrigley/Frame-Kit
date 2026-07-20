import { ArrowRightIcon, Tag } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const PRINCIPLES = [
  {
    title: 'Precise',
    body: 'Every surface, label, and control is tuned for dense workspaces without adding visual noise.',
  },
  {
    title: 'Direct',
    body: 'Creative controls respond where the work happens, with clear value feedback and dependable motion.',
  },
  {
    title: 'Composable',
    body: 'Tokens and accessible primitives are designed to assemble into complete tools, not isolated demos.',
  },
];

const PATHS = [
  {
    label: 'Foundations',
    title: 'Set the visual language',
    body: 'Colour, type, spacing, elevation, motion, and icons give every workspace a shared baseline.',
    href: '#/colors',
    action: 'Explore foundations',
  },
  {
    label: 'Components',
    title: 'Compose reliable controls',
    body: 'Inputs, value controls, menus, overlays, and toolbars are ready for real product interactions.',
    href: '#/components',
    action: 'Browse components',
  },
  {
    label: 'Creative',
    title: 'Work directly with the detail',
    body: 'Purpose-built tools for easing, paths, gradients, directional values, and keyframe timing.',
    href: '#/easing-graph',
    action: 'View creative tools',
  },
  {
    label: 'Ready made',
    title: 'Build a complete tool',
    body: 'Compose a sidebar from the full component library, or start from a focused production-like workspace.',
    href: '#/sidebar-builder',
    action: 'Build a sidebar',
  },
];

export function Introduction() {
  return (
    <>
      <PageHeader
        eyebrow="Frame Kit / system"
        title="Precision UI for creative work."
        lede="Frame Kit is a focused system of tokens and calibrated React controls for creative and productivity software, built for people and AI agents to work from the same source of truth. Its predictable APIs, documented states, and connected examples make dense interfaces easier to create, refine, and keep recognisably yours."
      />

      <Section title="Designed to hold together">
        <div className="overview-principles">
          {PRINCIPLES.map((principle) => (
            <article className="overview-principle" key={principle.title}>
              <Tag as="h3" tone="primary">
                {principle.title}
              </Tag>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Find your starting point">
        <div className="overview-paths">
          {PATHS.map((path) => (
            <a className="overview-path" href={path.href} key={path.label}>
              <div className="overview-path__head">
                <Tag tone="secondary">{path.label}</Tag>
                <ArrowRightIcon aria-hidden="true" />
              </div>
              <h3>{path.title}</h3>
              <p>{path.body}</p>
              <span className="overview-path__action">{path.action}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Ready for the whole workspace">
        <div className="overview-status">
          <div className="overview-status__lead">
            <Tag tone="accent">One connected system</Tag>
            <h3>From a single value to the surrounding tool.</h3>
            <p>
              Foundations, components, creative controls, and complete examples all use the same
              tokens and interaction standards. Refine a decision once, then carry it through the
              product with confidence.
            </p>
          </div>
          <dl className="overview-status__list">
            <div>
              <dt>Foundations</dt>
              <dd>Colour, typography, surfaces, spacing, and motion.</dd>
            </div>
            <div>
              <dt>Controls</dt>
              <dd>Accessible primitives for input, navigation, and value editing.</dd>
            </div>
            <div>
              <dt>Patterns</dt>
              <dd>Creative interactions and workspace compositions ready to adapt.</dd>
            </div>
          </dl>
        </div>
      </Section>
    </>
  );
}
