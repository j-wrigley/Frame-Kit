import { useState } from 'react';
import {
  FrameIcon,
  ImageIcon,
  InlineRename,
  Input,
  InputComposer,
  LayersIcon,
  NumberInput,
  SearchField,
  Textarea,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Inputs() {
  const [id, setId] = useState('A-01');
  const [offset, setOffset] = useState('1080');
  const [positionX, setPositionX] = useState('124');
  const [positionY, setPositionY] = useState('-32');
  const [amount, setAmount] = useState('38');
  const [duration, setDuration] = useState('1.25');
  const [title, setTitle] = useState('Camera Drift');
  const [note, setNote] = useState('Soft stagger / hold');
  const [presetName, setPresetName] = useState('Soft Zoom');
  const [savedPreset, setSavedPreset] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [heroImageName, setHeroImageName] = useState('Hero image');
  const [compositionName, setCompositionName] = useState('Main composition');
  const [frameName, setFrameName] = useState('Portrait frame');

  const nudgeDuration = (delta: number) => {
    const current = Number.parseFloat(duration);
    const next = clamp(Number.isFinite(current) ? current + delta : 0, 0, 9.99);
    setDuration(next.toFixed(2));
  };

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Input"
        lede="Dense, label-aware controls for inspectors and tool panels. The family covers compact values, search, bare property rows, multiline notes, explicit number stepping, and small compose flows."
      />

      <Section title="Field family">
        <p className="section-intro">
          <code>Input</code> keeps the value, optional inline label, and unit in one native label.
          Use the mono value treatment for IDs and measurements; keep names and readable text in the
          default sans face.
        </p>
        <div className="demo">
          <div className="input-showcase">
            <div className="input-showcase__group">
              <span className="fk-tag spec-label">Compact</span>
              <div className="input-showcase__compact-grid">
                <Input
                  size="sm"
                  font="mono"
                  label="ID"
                  value={id}
                  onChange={(event) => setId(event.target.value.toUpperCase().slice(0, 8))}
                />
                <Input
                  size="sm"
                  font="mono"
                  label="X"
                  align="end"
                  value={offset}
                  inputMode="decimal"
                  onChange={(event) => setOffset(event.target.value)}
                />
              </div>
            </div>

            <div className="input-showcase__group">
              <span className="fk-tag spec-label">Bare values</span>
              <div className="input-showcase__property-grid">
                <Input
                  variant="bare"
                  font="mono"
                  label="X"
                  suffix="PX"
                  align="end"
                  value={positionX}
                  inputMode="decimal"
                  onChange={(event) => setPositionX(event.target.value)}
                />
                <Input
                  variant="bare"
                  font="mono"
                  label="Y"
                  suffix="PX"
                  align="end"
                  value={positionY}
                  inputMode="decimal"
                  onChange={(event) => setPositionY(event.target.value)}
                />
              </div>
            </div>

            <div className="input-showcase__group">
              <span className="fk-tag spec-label">Text</span>
              <Input
                label="Title"
                value={title}
                spellCheck={false}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
        </div>
        <p className="section-note">
          <code>sm</code> / <code>md</code> / <code>lg</code> are 24 / 30 / 34px. Choose{' '}
          <code>variant="bare"</code> for low-chrome properties inside an already structured panel.
        </p>
      </Section>

      <Section title="Search field">
        <p className="section-intro">
          <code>SearchField</code> is the quiet, icon-led filter control for layers, projects, and
          command lists. It uses the sans face so queries retain their natural casing.
        </p>
        <div className="demo">
          <div className="input-search-field">
            <SearchField
              value={search}
              placeholder="Search layers"
              aria-label="Search layers"
              spellCheck={false}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <p className="section-note">
          <code>SearchField</code> always renders a native <code>type="search"</code> input. Give it
          an accessible name because its placeholder is not a persistent label.
        </p>
      </Section>

      <Section title="Inline rename">
        <p className="section-intro">
          <code>InlineRename</code> keeps small naming changes in context. Click a row to edit it,
          press Enter or leave the field to save, and press Escape to restore the previous name.
          Names and supporting details are always set in Sans.
        </p>
        <div className="demo">
          <div className="input-inline-rename-list">
            <InlineRename
              icon={<ImageIcon />}
              value={heroImageName}
              meta="1080 × 1350"
              label="Rename hero image"
              onCommit={setHeroImageName}
            />
            <InlineRename
              icon={<LayersIcon />}
              value={compositionName}
              meta="12 layers"
              label="Rename main composition"
              onCommit={setCompositionName}
            />
            <InlineRename
              icon={<FrameIcon />}
              value={frameName}
              meta="9:16"
              label="Rename portrait frame"
              onCommit={setFrameName}
            />
          </div>
        </div>
        <p className="section-note">
          Use this for a concise, identifiable object name. Keep broader property edits in a regular
          <code>Input</code>.
        </p>
      </Section>

      <Section title="Number input">
        <p className="section-intro">
          Use a standard <code>Input</code> for a value that should be edited directly.{' '}
          <code>NumberInput</code> adds deliberate decrease and increase actions; your app keeps
          ownership of parsing, precision, bounds, and the resulting value.
        </p>
        <div className="demo">
          <div className="input-showcase__number-grid">
            <Input
              label="Amount"
              suffix="%"
              font="mono"
              align="end"
              value={amount}
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value)}
            />
            <NumberInput
              label="Duration"
              suffix="S"
              font="mono"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              onDecrement={() => nudgeDuration(-0.25)}
              onIncrement={() => nudgeDuration(0.25)}
              decrementLabel="Decrease duration"
              incrementLabel="Increase duration"
            />
          </div>
        </div>
      </Section>

      <Section title="Multiline and compose">
        <p className="section-intro">
          <code>Textarea</code> keeps a compact property label above a resizable text area.{' '}
          <code>InputComposer</code> is a native form, so Enter submits and the caller decides what
          saving means.
        </p>
        <div className="demo">
          <div className="input-showcase">
            <Textarea
              label="Note"
              value={note}
              spellCheck={false}
              onChange={(event) => setNote(event.target.value)}
            />
            <InputComposer
              inputProps={{
                value: presetName,
                placeholder: 'Preset name',
                'aria-label': 'Preset name',
                spellCheck: false,
                onChange: (event) => setPresetName(event.target.value),
              }}
              submitLabel="Save preset"
              onSubmit={(event) => {
                event.preventDefault();
                setSavedPreset(presetName.trim() || null);
              }}
            />
            <span className="input-composer-status" role="status" aria-live="polite">
              {savedPreset ? `Saved “${savedPreset}”` : 'Enter a name, then save.'}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { InlineRename, Input, NumberInput, SearchField, Textarea, InputComposer } from '@presentstandards/framekit-ui';

<Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />

<SearchField
  placeholder="Search layers"
  aria-label="Search layers"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
/>

<InlineRename
  value={layerName}
  meta="1080 × 1350"
  onCommit={setLayerName}
/>

<Input
  variant="bare"
  font="mono"
  label="X"
  suffix="PX"
  align="end"
  value={positionX}
/>

<NumberInput
  label="Duration"
  suffix="S"
  value={duration}
  onDecrement={() => nudgeDuration(-0.25)}
  onIncrement={() => nudgeDuration(0.25)}
/>

<Textarea label="Note" value={note} onChange={(event) => setNote(event.target.value)} />

<InputComposer
  inputProps={{ value: presetName, 'aria-label': 'Preset name' }}
  submitLabel="Save preset"
  onSubmit={savePreset}
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
