import { useState } from 'react';
import {
  Button,
  CheckIcon,
  ChevronRightIcon,
  HoverCard,
  MagicWandIcon,
  Popover,
  RowActions,
  RowAddButton,
  RowInfoButton,
  Tag,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';

interface LibraryItem {
  id: string;
  label: string;
  /** Only items with an explanation get an 'i'. */
  summary?: string;
}

const STYLISE: readonly LibraryItem[] = [
  {
    id: 'halftone',
    label: 'Halftone',
    summary: 'Turns an image into a printed dot pattern, in one ink, two inks, or CMYK.',
  },
  { id: 'dither', label: 'Dither' },
  {
    id: 'risograph',
    label: 'Risograph',
    summary: 'Two-ink stencil print with slight misregistration and grain.',
  },
  { id: 'grain', label: 'Grain' },
  { id: 'posterize', label: 'Posterize' },
];

const EXTRA_SETTINGS = ['Contrast', 'Dot gain', 'Blend'];

/** offset clears the '+' that follows the 'i', so a right-placed card never
 *  covers it; a header with no '+' passes the default gap. */
function InfoCard({
  title,
  summary,
  offset = 30,
}: {
  title: string;
  summary: string;
  offset?: number;
}) {
  return (
    <HoverCard
      trigger={<RowInfoButton label={`About ${title}`} />}
      size="md"
      placement="right-start"
      offset={offset}
      openDelay={300}
      panelLabel={`About ${title}`}
    >
      <div className="docs-node-info">
        <div className="docs-node-info__head">
          <span className="docs-node-info__icon" aria-hidden="true">
            <MagicWandIcon />
          </span>
          <strong>{title}</strong>
          <Tag>Effect · Stylise</Tag>
        </div>
        <p className="docs-node-info__summary">{summary}</p>
        <dl className="docs-node-info__facts">
          <div>
            <dt className="fk-tag">Takes</dt>
            <dd>Pixels, Mask, Numbers</dd>
          </div>
          <div>
            <dt className="fk-tag">Gives</dt>
            <dd>Pixels</dd>
          </div>
          <div>
            <dt className="fk-tag">Works with</dt>
            <dd>All elements</dd>
          </div>
        </dl>
      </div>
    </HoverCard>
  );
}

export function RowActionsPage() {
  const [status, setStatus] = useState('Nothing added yet');
  const [shown, setShown] = useState<Set<string>>(() => new Set());

  const add = (label: string) => setStatus(`Added ${label}`);
  const toggle = (label: string) =>
    setShown((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  return (
    <>
      <PageHeader
        eyebrow="Components"
        title="Row actions"
        lede="The trailing 'i' then '+' pair. The 'i' explains an item in a hover card; the '+' adds it, or adds more to it. The 'i' always sits immediately before the '+'."
      />

      <Section title="Library rows">
        <p className="section-intro">
          In a library, the row&apos;s main button and its <strong>+</strong> both add the item.
          Only items with an explanation get an <strong>i</strong>; <code>reserve</code> keeps the
          empty cell so every <strong>+</strong> lines up.
        </p>
        <div className="demo">
          <div className="docs-library" aria-label="Effect library">
            <Tag className="docs-library__group">Stylise</Tag>
            {STYLISE.map((item) => (
              <div className="docs-library__row" key={item.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="docs-library__item"
                  iconStart={<MagicWandIcon />}
                  onClick={() => add(item.label)}
                >
                  {item.label}
                </Button>
                <RowActions
                  reserve
                  info={
                    item.summary ? (
                      <InfoCard title={item.label} summary={item.summary} />
                    ) : undefined
                  }
                  add={
                    <RowAddButton
                      label={`Add ${item.label}`}
                      tabIndex={-1}
                      onClick={() => add(item.label)}
                    />
                  }
                />
              </div>
            ))}
          </div>
          <p className="layer-rows-status" role="status" aria-live="polite">
            {status}
          </p>
        </div>
        <p className="section-note">
          The trailing <strong>+</strong> repeats the row&apos;s own action, so it takes no extra
          keyboard stop (<code>tabIndex=&#123;-1&#125;</code>).
        </p>
      </Section>

      <Section title="Card and section headers">
        <p className="section-intro">
          In a header, the <strong>+</strong> opens an add-more menu and the <strong>i</strong>{' '}
          explains the card. Without <code>reserve</code>, a card with nothing to add simply drops
          its <strong>+</strong>.
        </p>
        <div className="demo">
          <div className="docs-header-samples">
            <div className="docs-node docs-node--header-only">
              <header className="docs-node__header">
                <span className="docs-node__fold docs-node__fold--static" aria-hidden="true">
                  <ChevronRightIcon />
                </span>
                <span className="docs-node__icon" aria-hidden="true">
                  <MagicWandIcon />
                </span>
                <span className="docs-node__title">Halftone</span>
                <RowActions
                  info={
                    <InfoCard
                      title="Halftone"
                      summary="Turns an image into a printed dot pattern, in one ink, two inks, or CMYK."
                    />
                  }
                  add={
                    <Popover
                      trigger={<RowAddButton label="Add settings to Halftone" />}
                      size="sm"
                      placement="bottom-end"
                      panelLabel="Halftone settings"
                      panelClassName="docs-add-menu"
                    >
                      <div className="docs-add-menu__section">
                        <Tag className="docs-add-menu__heading">Settings</Tag>
                        {EXTRA_SETTINGS.map((label) => (
                          <Button
                            key={label}
                            variant="ghost"
                            size="sm"
                            fullWidth
                            className="docs-add-menu__item"
                            aria-pressed={shown.has(label)}
                            iconStart={
                              shown.has(label) ? (
                                <CheckIcon />
                              ) : (
                                <span className="docs-add-menu__spacer" aria-hidden="true" />
                              )
                            }
                            onClick={() => toggle(label)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </Popover>
                  }
                />
              </header>
            </div>
            <div className="docs-node docs-node--header-only">
              <header className="docs-node__header">
                <span className="docs-node__fold docs-node__fold--static" aria-hidden="true">
                  <ChevronRightIcon />
                </span>
                <span className="docs-node__icon" aria-hidden="true">
                  <MagicWandIcon />
                </span>
                <span className="docs-node__title">Nothing optional</span>
                <RowActions
                  info={
                    <InfoCard
                      title="Risograph"
                      summary="Two-ink stencil print with slight misregistration and grain."
                      offset={8}
                    />
                  }
                />
              </header>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import {
  Button,
  HoverCard,
  Popover,
  RowActions,
  RowAddButton,
  RowInfoButton,
} from '@presentstandards/framekit-ui';

// Library row: [add button][i][+]
<div className="library-row">
  <Button variant="ghost" size="sm" fullWidth onClick={addHalftone}>Halftone</Button>
  <RowActions
    reserve
    info={
      <HoverCard
        trigger={<RowInfoButton label="About Halftone" />}
        placement="right-start"
        offset={30} // clear the '+' so the card never covers it
      >
        …
      </HoverCard>
    }
    add={<RowAddButton label="Add Halftone" tabIndex={-1} onClick={addHalftone} />}
  />
</div>

// Card header: the '+' opens an add-more menu.
<RowActions
  info={<HoverCard trigger={<RowInfoButton label="About Halftone" />}>…</HoverCard>}
  add={
    <Popover trigger={<RowAddButton label="Add settings" />} size="sm" placement="bottom-end">
      …
    </Popover>
  }
/>`}</code>
        </pre>
      </Section>
    </>
  );
}
