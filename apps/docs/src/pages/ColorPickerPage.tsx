import { useState } from 'react';
import {
  Button,
  ColorField,
  ColorPicker,
  ColorSwatch,
  ColorWheelIcon,
  Cross1Icon,
  Dropdown,
  GradientIcon,
  ImageIcon,
  LayersIcon,
  PlusIcon,
  Tabs,
  TransparencyGridIcon,
  VideoIcon,
  contrastRatio,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const PRESETS = ['#3f3f46', '#363c4e', '#394c41', '#4a3b4a', '#4c4539', '#3b67de'];

const DOCUMENT_COLORS = [
  '#1d1e23',
  '#3f3f46',
  '#666770',
  '#b9bac1',
  '#f2f2f5',
  '#ffffff',
  '#d5323c',
  '#f0a32e',
  '#2ead6e',
  '#3b67de',
  '#4a3b4a',
  '#4c4539',
];

const DESIGN_PICKER_TOOLS = [
  { value: 'solid', label: 'Solid colour', icon: <ColorWheelIcon /> },
  { value: 'gradient', label: 'Gradient fill', icon: <GradientIcon /> },
  { value: 'image', label: 'Image palette', icon: <ImageIcon /> },
  { value: 'video', label: 'Video frame', icon: <VideoIcon /> },
  { value: 'styles', label: 'Colour styles', icon: <LayersIcon /> },
  { value: 'opacity', label: 'Opacity', icon: <TransparencyGridIcon /> },
] as const;

const PALETTE_OPTIONS = [
  { value: 'document', label: 'On this page' },
  { value: 'styles', label: 'Colour styles' },
  { value: 'recent', label: 'Recent colours' },
];

export function ColorPickerPage() {
  const [fill, setFill] = useState('#394c41');
  const [stroke, setStroke] = useState('#1d1e23');
  const [canvas, setCanvas] = useState('#f2f2f5');
  const [picked, setPicked] = useState('#3f3f46');
  const [documentColor, setDocumentColor] = useState('#3b67de');
  const [designPickerTab, setDesignPickerTab] = useState('custom');
  const [designPickerTool, setDesignPickerTool] =
    useState<(typeof DESIGN_PICKER_TOOLS)[number]['value']>('solid');
  const [designColor, setDesignColor] = useState('#d5323c');
  const [designPalette, setDesignPalette] = useState('document');

  const whiteContrast = contrastRatio(picked, '#ffffff');
  const activeDesignTool = DESIGN_PICKER_TOOLS.find((tool) => tool.value === designPickerTool);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Color picker"
        lede="Color controls for design tools: a closed field that opens the picker in an anchored popover, an embeddable picker panel, and document-colour swatches. Hex is design-tool style — uppercase, no hash."
      />

      <Section title="Colour field">
        <p className="section-intro">
          <code>ColorField</code> is the inspector control — swatch button plus hex field. The
          swatch opens the full picker in a popover; Escape or an outside click closes it. Edit the
          fields below and the artboard follows.
        </p>
        <div className="demo">
          <div className="tool-demo">
            <div className="inspector">
              <span className="fk-tag inspector-title">Appearance</span>
              <div className="inspector-row">
                <span className="inspector-label">Fill</span>
                <ColorField value={fill} onChange={setFill} presets={PRESETS} pickerLabel="Fill" />
              </div>
              <div className="inspector-row">
                <span className="inspector-label">Stroke</span>
                <ColorField
                  value={stroke}
                  onChange={setStroke}
                  presets={PRESETS}
                  pickerLabel="Stroke"
                />
              </div>
              <div className="inspector-row">
                <span className="inspector-label">Canvas</span>
                <ColorField
                  value={canvas}
                  onChange={setCanvas}
                  presets={PRESETS}
                  pickerLabel="Canvas"
                />
              </div>
            </div>
            <div className="artboard" style={{ background: canvas }}>
              <div className="artboard-shape" style={{ background: fill, borderColor: stroke }} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Picker panel">
        <p className="section-intro">
          <code>ColorPicker</code> is the panel itself — embed it directly in sidebars and custom
          popovers. HSV working state, so hue survives black, white, and greys.
        </p>
        <div className="demo">
          <div className="picker-demo">
            <ColorPicker value={picked} onChange={setPicked} presets={PRESETS} />
            <div className="picker-readout">
              <div className="picker-readout-chip" style={{ background: picked }} />
              <code>{picked.slice(1).toUpperCase()}</code>
              <span>
                {whiteContrast.toFixed(1)}:1 with white —{' '}
                {whiteContrast >= 4.5 ? 'AA for text' : 'below AA for text'}
              </span>
            </div>
          </div>
        </div>
        <p className="section-note">
          Keyboard: the area is a 2D slider (arrows adjust saturation/brightness, Shift ×10); hue is
          a native range input; the hex field commits on Enter.
        </p>
      </Section>

      <Section title="Design-tool popup">
        <p className="section-intro">
          A fuller colour surface starts with the same <code>ColorField</code> inspector control,
          then composes source tabs, mode tools, <code>ColorPicker</code>, and local colour swatches
          inside its anchored popover.
        </p>
        <div className="demo">
          <div className="design-color-picker-demo">
            <ColorField
              value={designColor}
              onChange={setDesignColor}
              pickerLabel="Design-tool colour picker"
              pickerClassName="design-color-popover"
              className="design-color-picker-demo__trigger"
              renderPicker={({ value, onChange, close }) => (
                <>
                  <div className="design-color-popover__header">
                    <Tabs
                      value={designPickerTab}
                      onValueChange={setDesignPickerTab}
                      variant="soft"
                      size="sm"
                      aria-label="Colour source"
                      items={[
                        { value: 'custom', label: 'Custom' },
                        { value: 'library', label: 'Libraries' },
                      ]}
                    />
                    <div className="design-color-popover__header-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconStart={<PlusIcon />}
                        aria-label="Add colour style"
                        title="Add colour style"
                        onClick={() => setDesignPickerTab('library')}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconStart={<Cross1Icon />}
                        aria-label="Close colour picker"
                        title="Close colour picker"
                        onClick={close}
                      />
                    </div>
                  </div>

                  <div
                    className="design-color-popover__tools"
                    role="toolbar"
                    aria-label="Fill tools"
                  >
                    {DESIGN_PICKER_TOOLS.map((tool) => (
                      <Button
                        key={tool.value}
                        variant="ghost"
                        size="sm"
                        className="design-color-popover__tool"
                        iconStart={tool.icon}
                        aria-label={tool.label}
                        aria-pressed={designPickerTool === tool.value}
                        title={tool.label}
                        onClick={() => setDesignPickerTool(tool.value)}
                      />
                    ))}
                  </div>

                  {designPickerTab === 'custom' ? (
                    <div className="design-color-popover__body">
                      <div className="design-color-popover__mode">
                        <span>Editing</span>
                        <strong>{activeDesignTool?.label}</strong>
                      </div>
                      <ColorPicker value={value} onChange={onChange} />
                    </div>
                  ) : (
                    <div className="design-color-popover__library">
                      <span className="fk-tag">Colour libraries</span>
                      <p>Choose a saved style to update the active fill.</p>
                      <div className="design-color-popover__library-grid">
                        {DOCUMENT_COLORS.slice(0, 8).map((color) => (
                          <ColorSwatch
                            key={color}
                            size="md"
                            color={color}
                            title={color.slice(1).toUpperCase()}
                            selected={value === color}
                            onClick={() => {
                              onChange(color);
                              setDesignPickerTab('custom');
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="design-color-popover__palette">
                    <Dropdown
                      options={PALETTE_OPTIONS}
                      value={designPalette}
                      onValueChange={setDesignPalette}
                      label="Palette source"
                      size="sm"
                      fullWidth
                    />
                    <div className="design-color-popover__swatches" aria-label="Document colours">
                      {DOCUMENT_COLORS.map((color) => (
                        <ColorSwatch
                          key={color}
                          size="sm"
                          color={color}
                          title={color.slice(1).toUpperCase()}
                          selected={value === color}
                          onClick={() => onChange(color)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            />
          </div>
        </div>
        <p className="section-note">
          The source tabs, add action, mode tools, palette menu, and swatches are independently
          useful controls; the colour area itself remains the shared <code>ColorPicker</code>.
        </p>
      </Section>

      <Section title="Swatches">
        <p className="section-intro">
          <code>ColorSwatch</code> chips — 16 and 20px, 2px corners, keyline inset. Document
          colours, palette rows, recent colours.
        </p>
        <div className="demo">
          <div className="swatch-panel">
            <span className="fk-tag inspector-title">Document colours</span>
            <div className="swatch-grid">
              {DOCUMENT_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  size="sm"
                  color={color}
                  title={color.slice(1).toUpperCase()}
                  selected={documentColor === color}
                  onClick={() => setDocumentColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { ColorField, ColorPicker, ColorSwatch, applyAccent } from '@presentstandards/framekit-ui';

// Inspector rows — swatch opens the picker popover
<ColorField value={fill} onChange={setFill} presets={DOCUMENT_COLORS} />

// Embed the panel directly (sidebars, custom popovers)
<ColorPicker value={color} onChange={setColor} />

// Retheme the kit accent from any picked color
<ColorField value={accent} onChange={(hex) => applyAccent(hex)} />`}</code>
        </pre>
      </Section>
    </>
  );
}
