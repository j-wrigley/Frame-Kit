import { useState, type ReactNode } from 'react';
import {
  FileTextIcon,
  FrameIcon,
  ImageIcon,
  LayersIcon,
  Tabs,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

export function TabsPage() {
  const [workspace, setWorkspace] = useState('storyboard');
  const [inspector, setInspector] = useState('design');
  const [preview, setPreview] = useState('canvas');

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Tabs"
        lede="A clear, keyboard-navigable way to switch between related views. Choose a quiet underline for workspace views, a contained strip for panel navigation, or a soft treatment inside established surfaces."
      />

      <Section title="Workspace views">
        <p className="section-intro">
          Underline tabs work best when the content area feels like a small workspace. Icons and
          compact metadata make the current view easy to find without turning the strip into a
          toolbar.
        </p>
        <div className="demo">
          <div className="tabs-showcase">
            <span className="fk-tag spec-label">Underline / panels</span>
            <Tabs
              aria-label="Project workspace"
              items={[
                {
                  value: 'storyboard',
                  label: 'Storyboard',
                  icon: <FrameIcon />,
                  meta: '12',
                  content: (
                    <TabPanel
                      title="Storyboard"
                      detail="12 scenes · Last edited just now"
                      icon={<FrameIcon />}
                    />
                  ),
                },
                {
                  value: 'layers',
                  label: 'Layers',
                  icon: <LayersIcon />,
                  meta: '48',
                  content: (
                    <TabPanel
                      title="Layers"
                      detail="48 visible layers · All changes saved"
                      icon={<LayersIcon />}
                    />
                  ),
                },
                {
                  value: 'assets',
                  label: 'Assets',
                  icon: <ImageIcon />,
                  meta: '26',
                  content: (
                    <TabPanel
                      title="Assets"
                      detail="26 project assets · Synced to library"
                      icon={<ImageIcon />}
                    />
                  ),
                },
              ]}
              value={workspace}
              onValueChange={setWorkspace}
            />
          </div>
        </div>
        <p className="section-note">
          When every item has <code>content</code>, Tabs creates linked <code>tabpanel</code>{' '}
          elements for you. Arrow keys move across enabled tabs; Home and End jump to the edges.
        </p>
      </Section>

      <Section title="Panel navigation">
        <p className="section-intro">
          Contained tabs retain the dense panel rhythm from the original UI Kit, but the active view
          has a clearer raised surface. Soft tabs sit comfortably in an existing inspector or card
          when a shared control well would feel too heavy.
        </p>
        <div className="demo">
          <div className="tabs-showcase">
            <span className="fk-tag spec-label">Contained / full width</span>
            <Tabs
              aria-label="Design inspector"
              variant="contained"
              fullWidth
              items={[
                {
                  value: 'design',
                  label: 'Design',
                  content: <TabPanel title="Design" detail="Layout, appearance, and constraints" />,
                },
                {
                  value: 'prototype',
                  label: 'Prototype',
                  content: <TabPanel title="Prototype" detail="Interactions and transitions" />,
                },
                {
                  value: 'inspect',
                  label: 'Inspect',
                  content: <TabPanel title="Inspect" detail="Measurements and code handoff" />,
                },
              ]}
              value={inspector}
              onValueChange={setInspector}
            />
          </div>
          <div className="tabs-showcase">
            <span className="fk-tag spec-label">Soft / compact</span>
            <Tabs
              aria-label="Preview mode"
              variant="soft"
              size="sm"
              items={[
                { value: 'canvas', label: 'Canvas', icon: <FrameIcon /> },
                { value: 'preview', label: 'Preview', icon: <FileTextIcon /> },
                { value: 'history', label: 'History', disabled: true },
              ]}
              value={preview}
              onValueChange={setPreview}
            />
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { Tabs } from '@presentstandards/framekit-ui';

<Tabs
  aria-label="Project workspace"
  variant="underline"
  items={[
    {
      value: 'storyboard',
      label: 'Storyboard',
      meta: '12',
      content: <StoryboardPanel />,
    },
    {
      value: 'layers',
      label: 'Layers',
      meta: '48',
      content: <LayersPanel />,
    },
  ]}
  value={view}
  onValueChange={setView}
/>

// Use activationMode="manual" when changing a panel is expensive.
// Arrow keys then move focus; Enter or Space activates the focused tab.`}</code>
        </pre>
      </Section>
    </>
  );
}

function TabPanel({ title, detail, icon }: { title: string; detail: string; icon?: ReactNode }) {
  return (
    <div className="tabs-panel-preview">
      {icon != null && <span className="tabs-panel-preview__icon">{icon}</span>}
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}
