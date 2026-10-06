import { useState } from 'react';
import { Chip, Input } from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

const TOKENS = ['value', 'index', 'count', 'name'];

export function ChipPage() {
  const [template, setTemplate] = useState('Item {index}');
  const [auto, setAuto] = useState(true);
  const [loop, setLoop] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Chip"
        lede="A small bordered button for one word or token: a placeholder that inserts itself, or a one-word mode such as Auto that toggles."
      />

      <Section title="Action chips">
        <p className="section-intro">
          A run of <code>mono</code> chips under a field, each inserting its token. Lighter than a
          row of buttons, and each says what it adds.
        </p>
        <div className="demo">
          <div className="docs-chip-demo">
            <Input
              size="sm"
              font="mono"
              aria-label="Template"
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
            />
            <div className="docs-chip-run" role="group" aria-label="Placeholders">
              {TOKENS.map((token) => (
                <Chip
                  key={token}
                  mono
                  title={`Add {${token}}`}
                  onClick={() => setTemplate((current) => `${current} {${token}}`.trimStart())}
                >
                  {`{${token}}`}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Toggle chips">
        <p className="section-intro">
          With <code>pressed</code> a chip is a one-word mode beside the field it governs; pressed
          reads in the accent. <code>size=&quot;md&quot;</code> matches the 24px controls in the
          row.
        </p>
        <div className="demo">
          <div className="docs-chip-demo">
            <div className="docs-chip-row">
              <Chip
                size="md"
                pressed={auto}
                aria-label="Automatic index"
                onClick={() => setAuto((current) => !current)}
              >
                Auto
              </Chip>
              <Input
                size="sm"
                font="mono"
                align="end"
                aria-label="Index"
                defaultValue="0"
                disabled={auto}
              />
            </div>
            <div className="docs-chip-row">
              <Chip size="md" pressed={loop} onClick={() => setLoop((current) => !current)}>
                Loop
              </Chip>
              <Input size="sm" font="mono" align="end" aria-label="Range" defaultValue="0 – 100" />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
