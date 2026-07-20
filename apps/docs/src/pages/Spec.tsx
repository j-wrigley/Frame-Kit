import { useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  Button,
  CheckIcon,
  CopyIcon,
  Loader,
  Tag,
} from '@presentstandards/framekit-ui';
import { NAV, type PageId } from '../nav';
import { loadSpec, specPath } from '../specs';
import { parseSpec, renderInline, renderMarkdown, type ParsedSpec } from '../lib/markdown';
import { useCopyFeedback } from '../lib/use-copy-feedback';

function pageLabel(page: PageId): string {
  for (const section of NAV) {
    const item = section.items.find((i) => i.id === page);
    if (item) return item.label;
  }
  return page;
}

const STATUS_TONE = {
  stable: 'accent',
  review: 'secondary',
  draft: 'tertiary',
} as const;

/** Renders a page's AI-readable Markdown spec in the docs design style.
 *  The raw document stays the source of truth — this view is a formatted
 *  window onto it, with the original copyable for AI use. */
export function SpecPage({ page }: { page: PageId }) {
  const [raw, setRaw] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const { copied, announcement, copy } = useCopyFeedback();

  useEffect(() => {
    let cancelled = false;
    setRaw(null);
    setFailed(false);
    const pending = loadSpec(page);
    if (!pending) {
      setFailed(true);
      return;
    }
    pending
      .then((text) => {
        if (!cancelled) setRaw(text);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const label = pageLabel(page);
  const path = specPath(page);

  if (failed) {
    return (
      <div className="spec">
        <SpecTopBar page={page} label={label} />
        <p className="spec-p">This document could not be loaded.</p>
      </div>
    );
  }

  if (raw === null) {
    return (
      <div className="spec">
        <SpecTopBar page={page} label={label} />
        <div className="spec-loading">
          <Loader aria-label="Loading document" />
        </div>
      </div>
    );
  }

  const spec: ParsedSpec = parseSpec(raw);
  const title = spec.frontmatter.name ?? spec.title ?? label;
  const status = spec.frontmatter.status as keyof typeof STATUS_TONE | undefined;

  return (
    <div className="spec">
      <SpecTopBar page={page} label={label} />

      <header className="page-header spec-header">
        <Tag as="p" tone="accent" className="page-eyebrow">
          Spec · AI-readable
        </Tag>
        <div className="spec-title-row">
          <h1 className="page-title">{title}</h1>
          {status && <Tag tone={STATUS_TONE[status] ?? 'tertiary'}>{status}</Tag>}
          {spec.frontmatter.since && <Tag tone="tertiary">since {spec.frontmatter.since}</Tag>}
        </div>
        {spec.lede && <p className="page-lede">{renderInline(spec.lede)}</p>}
        <div className="spec-meta">
          {path && (
            <Tag as="span" className="spec-path">
              {path}
            </Tag>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconStart={copied === 'md' ? <CheckIcon /> : <CopyIcon />}
            onClick={() => copy('md', raw, 'Markdown copied')}
          >
            {copied === 'md' ? 'Copied' : 'Copy Markdown'}
          </Button>
          <span className="visually-hidden" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>
      </header>

      {spec.frontmatter.import && (
        <pre className="code-block spec-code spec-import">
          <code>{spec.frontmatter.import}</code>
        </pre>
      )}

      <div className="spec-body">{renderMarkdown(spec.body)}</div>
    </div>
  );
}

function SpecTopBar({ page, label }: { page: PageId; label: string }) {
  return (
    <a className="spec-back" href={`#/${page}`} aria-label={`Back to ${label}`}>
      <ArrowLeftIcon size={13} />
      <span>{label}</span>
    </a>
  );
}
