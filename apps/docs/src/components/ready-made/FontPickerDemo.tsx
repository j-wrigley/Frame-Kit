import { useMemo, useState } from 'react';
import {
  Button,
  Disclosure,
  Dropdown,
  FontBoldIcon,
  FontItalicIcon,
  Input,
  LetterCaseCapitalizeIcon,
  LetterCaseToggleIcon,
  LetterCaseUppercaseIcon,
  LetterSpacingIcon,
  LineHeightIcon,
  ResetIcon,
  SearchField,
  Slider,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  Toolbar,
  UnderlineIcon,
} from '@presentstandards/framekit-ui';

type TextAlignment = 'left' | 'center' | 'right';
type TextCase = 'none' | 'uppercase' | 'capitalize';

const FONT_FAMILIES = [
  { id: 'inter', name: 'Inter', family: 'var(--fk-font-sans)' },
  { id: 'office-code', name: 'Office Code Pro', family: 'var(--fk-font-mono)' },
  {
    id: 'editorial',
    name: 'Editorial Serif',
    family: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
  },
  {
    id: 'system',
    name: 'System UI',
    family: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
] as const;

const WEIGHT_OPTIONS = [
  { value: '400', label: 'Regular · 400' },
  { value: '500', label: 'Medium · 500' },
  { value: '600', label: 'Semibold · 600' },
  { value: '700', label: 'Bold · 700' },
];

export function FontPickerDemo({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [fontId, setFontId] = useState('inter');
  const [fontQuery, setFontQuery] = useState('');
  const [weight, setWeight] = useState('600');
  const [textCase, setTextCase] = useState<TextCase>('none');
  const [fontSize, setFontSize] = useState('16');
  const [leading, setLeading] = useState(1.4);
  const [tracking, setTracking] = useState(0);
  const [alignment, setAlignment] = useState<TextAlignment>('left');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);

  const selectedFont = FONT_FAMILIES.find((font) => font.id === fontId) ?? FONT_FAMILIES[0];
  const visibleFonts = useMemo(() => {
    const query = fontQuery.trim().toLowerCase();
    return query
      ? FONT_FAMILIES.filter((font) => font.name.toLowerCase().includes(query))
      : FONT_FAMILIES;
  }, [fontQuery]);

  const resetTypography = () => {
    setFontId('inter');
    setFontQuery('');
    setWeight('600');
    setTextCase('none');
    setFontSize('16');
    setLeading(1.4);
    setTracking(0);
    setAlignment('left');
    setBold(false);
    setItalic(false);
    setUnderline(false);
  };

  return (
    <Disclosure
      className={['font-picker-disclosure', className].filter(Boolean).join(' ')}
      label="Font"
      summary={`${selectedFont.name} · ${Number(weight)}`}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="font-picker-disclosure__family">
        <SearchField
          size="sm"
          aria-label="Search font families"
          placeholder="Search fonts"
          value={fontQuery}
          onChange={(event) => setFontQuery(event.target.value)}
        />
        <div
          className="font-picker-disclosure__family-list"
          role="listbox"
          aria-label="Font families"
        >
          {visibleFonts.map((font) => {
            const selected = font.id === fontId;
            return (
              <button
                className="font-picker-disclosure__family-option"
                key={font.id}
                type="button"
                role="option"
                aria-selected={selected}
                style={{ fontFamily: font.family }}
                onClick={() => {
                  setFontId(font.id);
                  setFontQuery('');
                }}
              >
                {font.name}
              </button>
            );
          })}
          {visibleFonts.length === 0 && (
            <p className="font-picker-disclosure__empty">No font matches that search.</p>
          )}
        </div>
      </div>

      <div className="font-picker-disclosure__controls">
        <div className="font-picker-disclosure__tool-grid">
          <Dropdown
            size="sm"
            label="Font weight"
            options={WEIGHT_OPTIONS}
            value={weight}
            onValueChange={setWeight}
            fullWidth
          />
          <Input
            size="sm"
            label="Size"
            suffix="PX"
            font="mono"
            align="end"
            inputMode="decimal"
            value={fontSize}
            onChange={(event) => setFontSize(event.target.value)}
          />

          <Toolbar
            className="font-picker-disclosure__toolbar"
            size="compact"
            aria-label="Text case"
          >
            <Button
              variant="ghost"
              size="sm"
              iconStart={<LetterCaseToggleIcon />}
              aria-label="Sentence case"
              title="Sentence case"
              aria-pressed={textCase === 'none'}
              onClick={() => setTextCase('none')}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<LetterCaseUppercaseIcon />}
              aria-label="All caps"
              title="All caps"
              aria-pressed={textCase === 'uppercase'}
              onClick={() => setTextCase('uppercase')}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<LetterCaseCapitalizeIcon />}
              aria-label="Title case"
              title="Title case"
              aria-pressed={textCase === 'capitalize'}
              onClick={() => setTextCase('capitalize')}
            />
          </Toolbar>

          <Toolbar
            className="font-picker-disclosure__toolbar"
            size="compact"
            aria-label="Text style"
          >
            <Button
              variant="ghost"
              size="sm"
              iconStart={<FontBoldIcon />}
              aria-label="Bold"
              title="Bold"
              aria-pressed={bold}
              onClick={() => setBold((current) => !current)}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<FontItalicIcon />}
              aria-label="Italic"
              title="Italic"
              aria-pressed={italic}
              onClick={() => setItalic((current) => !current)}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<UnderlineIcon />}
              aria-label="Underline"
              title="Underline"
              aria-pressed={underline}
              onClick={() => setUnderline((current) => !current)}
            />
          </Toolbar>

          <Toolbar
            className="font-picker-disclosure__toolbar"
            size="compact"
            aria-label="Text alignment"
          >
            <Button
              variant="ghost"
              size="sm"
              iconStart={<TextAlignLeftIcon />}
              aria-label="Align left"
              title="Align left"
              aria-pressed={alignment === 'left'}
              onClick={() => setAlignment('left')}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<TextAlignCenterIcon />}
              aria-label="Align center"
              title="Align center"
              aria-pressed={alignment === 'center'}
              onClick={() => setAlignment('center')}
            />
            <Button
              variant="ghost"
              size="sm"
              iconStart={<TextAlignRightIcon />}
              aria-label="Align right"
              title="Align right"
              aria-pressed={alignment === 'right'}
              onClick={() => setAlignment('right')}
            />
          </Toolbar>

          <Button
            className="font-picker-disclosure__reset"
            variant="ghost"
            size="sm"
            iconStart={<ResetIcon />}
            aria-label="Reset typography"
            title="Reset typography"
            onClick={resetTypography}
          >
            Reset
          </Button>
        </div>

        <div className="font-picker-disclosure__sliders">
          <Slider
            size="sm"
            label={
              <span title="Leading">
                <LineHeightIcon aria-hidden="true" />
              </span>
            }
            aria-label="Leading"
            min={0.8}
            max={2.4}
            step={0.01}
            value={leading}
            onValueChange={setLeading}
            formatValue={(value) => `${value.toFixed(2)}×`}
          />
          <Slider
            size="sm"
            label={
              <span title="Tracking">
                <LetterSpacingIcon aria-hidden="true" />
              </span>
            }
            aria-label="Tracking"
            min={-12}
            max={32}
            step={0.1}
            value={tracking}
            onValueChange={setTracking}
            formatValue={(value) => `${value.toFixed(1)} px`}
          />
        </div>
      </div>
    </Disclosure>
  );
}
