import { useState } from 'react';
import {
  Button,
  CropIcon,
  CursorArrowIcon,
  FrameIcon,
  GridIcon,
  ImageIcon,
  LayersIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  MoveIcon,
  TextIcon,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const HORIZONTAL_TOOLS = [
  { id: 'select', label: 'Select', icon: CursorArrowIcon },
  { id: 'move', label: 'Move', icon: MoveIcon },
  { id: 'crop', label: 'Crop', icon: CropIcon },
  { id: 'effects', label: 'Effects', icon: MagicWandIcon },
];

const RAIL_TOOLS = [
  { id: 'text', label: 'Text', icon: TextIcon },
  { id: 'frame', label: 'Frame', icon: FrameIcon },
  { id: 'image', label: 'Image', icon: ImageIcon },
];

const SELECTION_TOOLS = [
  { id: 'select', label: 'Select', icon: CursorArrowIcon },
  { id: 'move', label: 'Move', icon: MoveIcon },
];

export function ToolbarPage() {
  const [tool, setTool] = useState('select');
  const [utility, setUtility] = useState('grid');
  const [railTool, setRailTool] = useState('select');
  const [selectionToolsOpen, setSelectionToolsOpen] = useState(false);
  const [largeRailTool, setLargeRailTool] = useState('select');
  const [largeSelectionToolsOpen, setLargeSelectionToolsOpen] = useState(false);
  const selectionTool = SELECTION_TOOLS.find((item) => item.id === railTool) ?? SELECTION_TOOLS[0];
  const largeSelectionTool =
    SELECTION_TOOLS.find((item) => item.id === largeRailTool) ?? SELECTION_TOOLS[0];
  const SelectionToolIcon = selectionTool.icon;
  const LargeSelectionToolIcon = largeSelectionTool.icon;

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Toolbar"
        lede="Compact and roomy, keyboard-navigable control groups for tool modes, canvas actions, and vertical rails. Pair them with icon-only Buttons, aria-pressed selection state, and grouped tool flyouts."
      />

      <Section title="Toolbar sizes">
        <p className="section-intro">
          <code>compact</code> is the original dense toolbar for space-constrained tools. Use{' '}
          <code>large</code> when the toolbar has more breathing room or needs a larger pointer
          target. Arrow keys move between enabled controls; Home and End jump to the edges.
        </p>
        <div className="demo">
          <div className="toolbar-size-showcase">
            <div className="toolbar-size-showcase__group">
              <span className="fk-tag spec-label">Compact</span>
              <Toolbar size="compact" aria-label="Compact canvas tool modes">
                {HORIZONTAL_TOOLS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      iconStart={<Icon />}
                      aria-label={item.label}
                      aria-pressed={tool === item.id}
                      onClick={() => setTool(item.id)}
                    />
                  );
                })}
                <ToolbarSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<MixerHorizontalIcon />}
                  aria-label="Tool settings"
                />
              </Toolbar>
            </div>
            <div className="toolbar-size-showcase__group">
              <span className="fk-tag spec-label">Large</span>
              <Toolbar size="large" aria-label="Large canvas tool modes">
                {HORIZONTAL_TOOLS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      size="sm"
                      iconStart={<Icon />}
                      aria-label={item.label}
                      aria-pressed={tool === item.id}
                      onClick={() => setTool(item.id)}
                    />
                  );
                })}
                <ToolbarSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<MixerHorizontalIcon />}
                  aria-label="Tool settings"
                />
              </Toolbar>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Utility group">
        <p className="section-intro">
          Use the ghost treatment where the surrounding surface already provides structure, such as
          a canvas header or inspector row.
        </p>
        <div className="demo">
          <Toolbar variant="ghost" aria-label="Canvas utilities">
            <Button
              variant="ghost"
              size="sm"
              iconStart={<GridIcon />}
              aria-label="Grid"
              aria-pressed={utility === 'grid'}
              onClick={() => setUtility('grid')}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<LayersIcon />}
              aria-label="Layers"
              aria-pressed={utility === 'layers'}
              onClick={() => setUtility('layers')}
            />
          </Toolbar>
        </div>
      </Section>

      <Section title="Vertical rail">
        <p className="section-intro">
          Switch orientation for a compact canvas rail. A grouped tool can be clicked or pressed and
          held to reveal its related modes; use Alt+↓ to open the same flyout from a keyboard.
        </p>
        <div className="toolbar-stage">
          <Toolbar orientation="vertical" aria-label="Canvas tools">
            <ToolbarGroup
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<SelectionToolIcon />}
                  aria-label={`${selectionTool.label} tools`}
                  aria-pressed={railTool === 'select' || railTool === 'move'}
                />
              }
              aria-label="Selection tools"
              open={selectionToolsOpen}
              onOpenChange={setSelectionToolsOpen}
            >
              {SELECTION_TOOLS.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    iconStart={<Icon />}
                    aria-label={item.label}
                    aria-pressed={railTool === item.id}
                    onClick={() => {
                      setRailTool(item.id);
                      setSelectionToolsOpen(false);
                    }}
                  />
                );
              })}
            </ToolbarGroup>
            <ToolbarSeparator orientation="horizontal" />
            {RAIL_TOOLS.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  iconStart={<Icon />}
                  aria-label={item.label}
                  aria-pressed={railTool === item.id}
                  onClick={() => setRailTool(item.id)}
                />
              );
            })}
          </Toolbar>
        </div>
      </Section>

      <Section title="Large vertical rail">
        <p className="section-intro">
          Use the large rail when a persistent canvas tool surface has room for larger pointer
          targets. It keeps the same keyboard and press-and-hold behavior while expanding every
          enclosed control and the grouped-tool flyout together.
        </p>
        <div className="toolbar-stage">
          <Toolbar size="large" orientation="vertical" aria-label="Large canvas tools">
            <ToolbarGroup
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  iconStart={<LargeSelectionToolIcon />}
                  aria-label={`${largeSelectionTool.label} tools`}
                  aria-pressed={largeRailTool === 'select' || largeRailTool === 'move'}
                />
              }
              aria-label="Large selection tools"
              open={largeSelectionToolsOpen}
              onOpenChange={setLargeSelectionToolsOpen}
            >
              {SELECTION_TOOLS.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    iconStart={<Icon />}
                    aria-label={item.label}
                    aria-pressed={largeRailTool === item.id}
                    onClick={() => {
                      setLargeRailTool(item.id);
                      setLargeSelectionToolsOpen(false);
                    }}
                  />
                );
              })}
            </ToolbarGroup>
            <ToolbarSeparator orientation="horizontal" />
            {RAIL_TOOLS.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  iconStart={<Icon />}
                  aria-label={item.label}
                  aria-pressed={largeRailTool === item.id}
                  onClick={() => setLargeRailTool(item.id)}
                />
              );
            })}
          </Toolbar>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { useState } from 'react';
import { Button, CursorArrowIcon, MoveIcon, Toolbar, ToolbarGroup, ToolbarSeparator } from '@presentstandards/framekit-ui';

const selectionTools = [
  { id: 'select', label: 'Select', icon: CursorArrowIcon },
  { id: 'move', label: 'Move', icon: MoveIcon },
];

function CanvasTools() {
  const [tool, setTool] = useState('select');
  const activeTool = selectionTools.find((item) => item.id === tool) ?? selectionTools[0];
  const ActiveToolIcon = activeTool.icon;

  return <Toolbar orientation="vertical" size="large" aria-label="Canvas tools">
  <ToolbarGroup
    aria-label="Selection tools"
    trigger={<Button variant="ghost" size="sm" iconStart={<ActiveToolIcon />} aria-label={\`\${activeTool.label} tools\`} />}
  >
    {selectionTools.map(({ id, label, icon: Icon }) => (
      <Button key={id} variant="ghost" size="sm" iconStart={<Icon />} aria-label={label} aria-pressed={tool === id} onClick={() => setTool(id)} />
    ))}
  </ToolbarGroup>
  <ToolbarSeparator orientation="horizontal" />
  </Toolbar>;
}`}</code>
        </pre>
      </Section>
    </>
  );
}
