import { useState } from 'react';
import {
  CopyIcon,
  DownloadIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  ImageIcon,
  LayerRow,
  TextIcon,
  TrashIcon,
  VideoIcon,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const LAYERS = [
  { id: 'hero', label: 'Hero image', meta: '1920 × 1080', icon: <ImageIcon /> },
  { id: 'caption', label: 'Caption overlay', meta: 'Text', icon: <TextIcon /> },
  { id: 'cutaway', label: 'B-roll cutaway', meta: '00:08', icon: <VideoIcon /> },
];

const PRESETS = [
  { id: 'soft-drift', label: 'Soft drift', meta: 'Motion' },
  { id: 'punch-zoom', label: 'Punch zoom', meta: 'Motion' },
  { id: 'loop-hold', label: 'Loop hold', meta: 'Timing' },
];

export function LayerRows() {
  const [selectedLayer, setSelectedLayer] = useState('hero');
  const [selectedPreset, setSelectedPreset] = useState('soft-drift');
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    hero: true,
    caption: true,
    cutaway: false,
  });
  const [lastAction, setLastAction] = useState('Hero image selected');

  const toggleVisibility = (id: string, label: string) => {
    const nextVisible = !visibleLayers[id];
    setVisibleLayers((current) => {
      return { ...current, [id]: nextVisible };
    });
    setLastAction(`${nextVisible ? 'Showing' : 'Hiding'} ${label}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Layer rows"
        lede="A compact row system for selected layers and saved presets. Both variations share a stable action edge, readable metadata, and a restrained selected state that keeps creative panels easy to scan."
      />

      <Section title="Layer variation">
        <p className="section-intro">
          Use the icon-led layer variation for objects on a canvas or timeline. Selection carries a
          subtle accent edge; contextual actions remain quiet until the row is selected, hovered, or
          focused from the keyboard.
        </p>
        <div className="demo">
          <div className="layer-row-showcase" aria-label="Project layers">
            {LAYERS.map((layer) => {
              const isVisible = visibleLayers[layer.id];
              return (
                <LayerRow
                  key={layer.id}
                  label={layer.label}
                  meta={layer.meta}
                  icon={layer.icon}
                  selected={selectedLayer === layer.id}
                  onSelect={() => {
                    setSelectedLayer(layer.id);
                    setLastAction(`${layer.label} selected`);
                  }}
                  actions={[
                    {
                      id: 'visibility',
                      label: `${isVisible ? 'Hide' : 'Show'} ${layer.label}`,
                      icon: isVisible ? <EyeOpenIcon /> : <EyeClosedIcon />,
                      onSelect: () => toggleVisibility(layer.id, layer.label),
                    },
                    {
                      id: 'duplicate',
                      label: `Duplicate ${layer.label}`,
                      icon: <CopyIcon />,
                      onSelect: () => setLastAction(`${layer.label} duplicated`),
                    },
                    {
                      id: 'delete',
                      label: `Delete ${layer.label}`,
                      icon: <TrashIcon />,
                      tone: 'danger',
                      onSelect: () => setLastAction(`${layer.label} marked for deletion`),
                    },
                  ]}
                />
              );
            })}
          </div>
          <p className="layer-rows-status" role="status" aria-live="polite">
            {lastAction}
          </p>
        </div>
      </Section>

      <Section title="Preset variation">
        <p className="section-intro">
          Presets use the same selection and action behavior without a leading icon. This keeps a
          library of named states compact while preserving the familiar trailing metadata slot.
        </p>
        <div className="demo">
          <div className="layer-row-showcase" aria-label="Motion presets">
            {PRESETS.map((preset) => (
              <LayerRow
                key={preset.id}
                variant="preset"
                label={preset.label}
                meta={preset.meta}
                selected={selectedPreset === preset.id}
                onSelect={() => {
                  setSelectedPreset(preset.id);
                  setLastAction(`${preset.label} preset selected`);
                }}
                actions={[
                  {
                    id: 'export',
                    label: `Export ${preset.label}`,
                    icon: <DownloadIcon />,
                    onSelect: () => setLastAction(`${preset.label} preset exported`),
                  },
                  {
                    id: 'delete',
                    label: `Delete ${preset.label}`,
                    icon: <TrashIcon />,
                    tone: 'danger',
                    onSelect: () => setLastAction(`${preset.label} preset marked for deletion`),
                  },
                ]}
              />
            ))}
            <LayerRow
              variant="preset"
              label="Studio master"
              meta="Locked"
              disabled
              onSelect={() => undefined}
            />
          </div>
        </div>
        <p className="section-note">
          A preset row omits <code>icon</code>; its metadata still uses the compact mono treatment
          so scanning remains consistent with the layer variation.
        </p>
      </Section>

      <Section title="Keep the hierarchy quiet">
        <div className="layer-rows-guidance">
          <div>
            <span className="fk-tag spec-label">Selection</span>
            <strong>One clear current row</strong>
            <p>
              Use the subtle accent edge for the current object, not as a permanent label colour.
            </p>
          </div>
          <div>
            <span className="fk-tag spec-label">Metadata</span>
            <strong>Short, scannable facts</strong>
            <p>Dimensions, type, duration, and preset family belong in the quiet trailing slot.</p>
          </div>
          <div>
            <span className="fk-tag spec-label">Actions</span>
            <strong>Context on demand</strong>
            <p>Keep actions icon-only, named for assistive technology, and reveal danger last.</p>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { EyeOpenIcon, ImageIcon, LayerRow, TrashIcon } from '@presentstandards/framekit-ui';

<LayerRow
  label="Hero image"
  meta="1920 × 1080"
  icon={<ImageIcon />}
  selected={selectedLayer === 'hero'}
  onSelect={() => setSelectedLayer('hero')}
  actions={[
    {
      id: 'visibility',
      label: 'Hide hero image',
      icon: <EyeOpenIcon />,
      onSelect: hideHero,
    },
    {
      id: 'delete',
      label: 'Delete hero image',
      icon: <TrashIcon />,
      tone: 'danger',
      onSelect: deleteHero,
    },
  ]}
/>

<LayerRow
  variant="preset"
  label="Soft drift"
  meta="Motion"
  selected={selectedPreset === 'soft-drift'}
  onSelect={() => setSelectedPreset('soft-drift')}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
