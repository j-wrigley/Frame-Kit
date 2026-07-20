import { useMemo, useState } from 'react';
import {
  CheckIcon,
  ICONS,
  ICON_NAMES,
  Input,
  MagnifyingGlassIcon,
  type IconName,
} from '@presentstandards/framekit-ui';
import { PageHeader, Section } from '../components/Page';
import { useCopyFeedback } from '../lib/use-copy-feedback';

// "arrow up", "arrow-up", and "arrowup" should all find arrow-up.
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function Icons() {
  const [query, setQuery] = useState('');
  const { copied, announcement, copy } = useCopyFeedback();

  const names = useMemo(() => {
    const q = normalize(query);
    return q ? ICON_NAMES.filter((n) => normalize(n).includes(q)) : ICON_NAMES;
  }, [query]);

  const copyIcon = (name: IconName) => {
    const jsx = `<${ICONS[name].displayName} />`;
    void copy(name, jsx, `Copied ${jsx} to clipboard`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Icons"
        lede={`${ICON_NAMES.length} icons on a 15×15 grid, drawn with currentColor and packaged directly in @presentstandards/framekit-ui — no extra dependency. Hover for names, click to copy JSX.`}
      />

      <Section title="Usage">
        <pre className="code-block">
          <code>{`import { MagnifyingGlassIcon, Icon } from '@presentstandards/framekit-ui';

<MagnifyingGlassIcon />            // 15px, inherits text color
<MagnifyingGlassIcon size={18} />  // any square size
<Icon name="magnifying-glass" />   // dynamic, for runtime names`}</code>
        </pre>
      </Section>

      <Section title="Library">
        <div className="icon-search">
          <Input
            prefix={<MagnifyingGlassIcon />}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${ICON_NAMES.length} icons…`}
            aria-label="Search icons"
          />
        </div>

        <div className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </div>

        {names.length === 0 ? (
          <p className="section-note">No icons match “{query.trim()}”.</p>
        ) : (
          <div className="icon-grid">
            {names.map((name) => {
              const IconComponent = ICONS[name];
              return (
                <button
                  key={name}
                  type="button"
                  className="icon-tile"
                  onClick={() => copyIcon(name)}
                  aria-label={`Copy <${IconComponent.displayName} />`}
                  title={`${name} · <${IconComponent.displayName} />`}
                >
                  {copied === name ? <CheckIcon className="icon-tile-check" /> : <IconComponent />}
                </button>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
