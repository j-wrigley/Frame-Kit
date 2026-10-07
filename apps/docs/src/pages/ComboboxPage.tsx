import { useState } from 'react';
import { Combobox, Dropdown, FieldNote, type ComboboxOption } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

/** An export size, Figma convention: a scale, or a width or height in pixels. */
type Size = { scale: number } | { width: number } | { height: number };

const FRAME = { width: 1920, height: 1080 };

const formatSize = (size: Size) =>
  'scale' in size ? `${size.scale}×` : 'width' in size ? `${size.width}w` : `${size.height}h`;

const parseSize = (text: string): Size | null => {
  const match = /^@?\s*(\d+(?:\.\d+)?)\s*([x×wh]?)$/i.exec(text.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2]!.toLowerCase();
  if (unit === 'w' || unit === 'h') {
    if (!Number.isInteger(amount) || amount < 1 || amount > 32768) return null;
    return unit === 'w' ? { width: amount } : { height: amount };
  }
  return amount >= 0.1 && amount <= 8 ? { scale: amount } : null;
};

const pixels = (size: Size) => {
  const scale =
    'scale' in size
      ? size.scale
      : 'width' in size
        ? size.width / FRAME.width
        : size.height / FRAME.height;
  return `${Math.round(FRAME.width * scale)}×${Math.round(FRAME.height * scale)}`;
};

const SIZE_OPTIONS: ComboboxOption<Size>[] = [0.5, 1, 2, 3, 4].map((scale) => ({
  value: { scale },
  description: pixels({ scale }),
}));

const FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG', description: 'Transparent' },
  { value: 'jpeg', label: 'JPEG', description: 'Opaque' },
  { value: 'webp', label: 'WebP', description: 'Transparent' },
];

const ZOOM_OPTIONS: ComboboxOption<number>[] = [
  { value: 0, label: 'Fit', description: 'Whole canvas' },
  { value: 50 },
  { value: 100 },
  { value: 200 },
  { value: 400 },
];

const formatZoom = (zoom: number) => (zoom === 0 ? 'Fit' : `${zoom}%`);

const parseZoom = (text: string) => {
  const trimmed = text.trim().toLowerCase();
  if (trimmed === 'fit') return 0;
  const value = Number.parseFloat(trimmed.replace(/%$/, ''));
  return Number.isFinite(value) && value >= 1 && value <= 3200 ? Math.round(value) : null;
};

export function ComboboxPage() {
  const [size, setSize] = useState<Size>({ scale: 2 });
  const [sizeBad, setSizeBad] = useState(false);
  const [format, setFormat] = useState('png');
  const [zoom, setZoom] = useState(100);
  const [zoomBad, setZoomBad] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Combobox"
        lede="An editable field with a suggestion list: type any value the tool can read, or choose a suggestion. The field is the Input chrome; the list is the Dropdown listbox."
      />

      <Section title="Size field">
        <p className="section-intro">
          Suggestions cover the common values and carry what each makes in a{' '}
          <code>description</code>. The field also takes typed values the application can{' '}
          <code>parse</code> — try <code>1.5x</code>, <code>1920w</code> or <code>1080h</code>. Text
          that does not parse stays in the field, marked invalid, and a <code>FieldNote</code> says
          why.
        </p>
        <div className="demo">
          <div className="docs-combobox-demo">
            <div className="docs-combobox-row">
              <Combobox<Size>
                label="Size"
                size="sm"
                options={SIZE_OPTIONS}
                value={size}
                format={formatSize}
                parse={parseSize}
                invalid={sizeBad}
                aria-describedby="docs-combobox-size-note"
                onCommit={(next) => {
                  setSizeBad(next === null);
                  if (next) setSize(next);
                }}
              />
              <Dropdown
                label="Format"
                size="sm"
                fullWidth
                options={FORMAT_OPTIONS}
                value={format}
                onValueChange={setFormat}
              />
            </div>
            <FieldNote id="docs-combobox-size-note" tone={sizeBad ? 'danger' : 'default'}>
              {sizeBad ? 'Use 2x, 1920w or 1080h' : pixels(size)}
            </FieldNote>
          </div>
        </div>
        <p className="section-note">
          <code>onCommit(value, text)</code> runs on Enter, on blur after an edit, and when a
          suggestion is chosen; <code>value</code> is <code>null</code> when the text did not parse.
          Escape closes the list, then restores the committed value.
        </p>
      </Section>

      <Section title="Typed values">
        <p className="section-intro">
          The list never filters: it is a set of suggestions, not a search. Arrow keys open it at
          the current value; typing clears its active row, so Enter commits what was typed.
        </p>
        <div className="demo">
          <div className="docs-combobox-demo">
            <span className="fk-tag spec-label">Zoom</span>
            <Combobox<number>
              label="Zoom"
              fullWidth
              options={ZOOM_OPTIONS}
              value={zoom}
              format={formatZoom}
              parse={parseZoom}
              invalid={zoomBad}
              aria-describedby="docs-combobox-zoom-note"
              onCommit={(next) => {
                setZoomBad(next === null);
                if (next !== null) setZoom(next);
              }}
            />
            {zoomBad ? (
              <FieldNote id="docs-combobox-zoom-note" tone="danger">
                Use 1–3200% or Fit
              </FieldNote>
            ) : null}
          </div>
        </div>
        <p className="section-note">
          <code>sm</code> / <code>md</code> are 24 / 30px, matching Dropdown and Input, so a
          Combobox sits in a row of either.
        </p>
      </Section>
    </>
  );
}
