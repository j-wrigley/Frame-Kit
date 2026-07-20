import type { ReactNode } from 'react';
import { pageForSpecFile } from '../specs';

/** Targeted Markdown renderer for the kit's spec docs. Covers the subset the
 *  docs template uses — headings, blockquotes, fenced code, pipe tables,
 *  lists, paragraphs, hr; inline code / bold / italic / links — and renders
 *  straight to React nodes styled with kit tokens. Not a general-purpose
 *  parser; the corpus is our own `docs/*.md`. */

export interface SpecFrontmatter {
  name?: string;
  status?: string;
  since?: string;
  import?: string;
}

export interface ParsedSpec {
  frontmatter: SpecFrontmatter;
  /** Title from the first `# h1` (frontmatter `name` wins if present). */
  title: string | null;
  /** First blockquote when it directly follows the h1 — the doc's lede. */
  lede: string | null;
  body: string;
}

export function parseSpec(raw: string): ParsedSpec {
  let text = raw.replace(/\r\n/g, '\n');
  const frontmatter: SpecFrontmatter = {};

  if (text.startsWith('---\n')) {
    const end = text.indexOf('\n---', 4);
    if (end !== -1) {
      for (const line of text.slice(4, end).split('\n')) {
        const colon = line.indexOf(':');
        if (colon === -1) continue;
        const key = line.slice(0, colon).trim();
        // Values may carry trailing `# comments` (see _TEMPLATE.md).
        const value = line
          .slice(colon + 1)
          .replace(/\s+#\s.*$/, '')
          .trim();
        if (key === 'name' || key === 'status' || key === 'since' || key === 'import') {
          frontmatter[key] = value;
        }
      }
      text = text.slice(end + 4).replace(/^\n+/, '');
    }
  }

  let title: string | null = null;
  let lede: string | null = null;

  const titleMatch = /^#\s+(.+)\n/.exec(text);
  if (titleMatch) {
    title = titleMatch[1].trim();
    text = text.slice(titleMatch[0].length).replace(/^\n+/, '');
    // A blockquote immediately after the h1 is the lede sentence.
    const ledeLines: string[] = [];
    const lines = text.split('\n');
    while (lines.length && lines[0].startsWith('>')) {
      ledeLines.push(lines.shift()!.replace(/^>\s?/, ''));
    }
    if (ledeLines.length) {
      lede = ledeLines.join(' ').trim();
      text = lines.join('\n').replace(/^\n+/, '');
    }
  }

  return { frontmatter, title, lede, body: text };
}

/* ── Inline rendering ───────────────────────────────────────── */

/** Split on unescaped pipes for table rows (types use `\|`). Pipes inside an
 *  open backtick span never split — a missed escape degrades gracefully. */
function splitCells(row: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inCode = false;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === '`') {
      inCode = !inCode;
      current += row[i];
    } else if (row[i] === '\\' && row[i + 1] === '|') {
      current += '|';
      i++;
    } else if (row[i] === '|' && !inCode) {
      cells.push(current);
      current = '';
    } else {
      current += row[i];
    }
  }
  cells.push(current);
  // Leading/trailing pipes produce empty edge cells — drop them.
  if (cells.length && cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  return cells.map((c) => c.trim());
}

function renderLink(label: string, href: string, key: number): ReactNode {
  const relative = /^\.\/([\w-]+)\.md$/.exec(href);
  if (relative) {
    const page = pageForSpecFile(relative[1]);
    // Cross-link to another spec view when the target doc is registered;
    // otherwise fall back to plain emphasized text (no dead links).
    if (page) {
      return (
        <a key={key} href={`#/spec/${page}`}>
          {renderInline(label)}
        </a>
      );
    }
    return <strong key={key}>{renderInline(label)}</strong>;
  }
  if (/^https?:\/\//.test(href)) {
    return (
      <a key={key} href={href} target="_blank" rel="noreferrer">
        {renderInline(label)}
      </a>
    );
  }
  return (
    <a key={key} href={href}>
      {renderInline(label)}
    </a>
  );
}

/** Inline markdown: `code` (protected first), then [links](…), **bold**, *italic*. */
export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  // Code spans are opaque — split them out before any other inline rule.
  const parts = text.split(/(`[^`]*`)/);
  for (const part of parts) {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      out.push(<code key={key++}>{part.slice(1, -1)}</code>);
      continue;
    }
    // Non-code text: <kbd>, links, bold, italic — tokenized in one pass.
    // <kbd> is the one HTML tag the docs template allows outside code fences.
    const rx = /<kbd>([^<]*)<\/kbd>|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(part))) {
      if (m.index > last) out.push(part.slice(last, m.index));
      if (m[1] !== undefined) out.push(<kbd key={key++}>{m[1]}</kbd>);
      else if (m[2] !== undefined) out.push(renderLink(m[2], m[3], key++));
      else if (m[4] !== undefined) out.push(<strong key={key++}>{renderInline(m[4])}</strong>);
      else if (m[5] !== undefined) out.push(<em key={key++}>{renderInline(m[5])}</em>);
      last = m.index + m[0].length;
    }
    if (last < part.length) out.push(part.slice(last));
  }
  return out;
}

/* ── Block rendering ────────────────────────────────────────── */

export function renderMarkdown(body: string): ReactNode[] {
  const lines = body.split('\n');
  const out: ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code — backtick or tilde fences, closed by the same marker
    const fence = /^(`{3}|~{3})/.exec(line);
    if (fence) {
      const marker = fence[1];
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(marker)) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      out.push(
        <pre key={key++} className="code-block spec-code">
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2].trim());
      if (level <= 2) {
        out.push(
          <h2 key={key++} className="section-title spec-h2">
            {content}
          </h2>
        );
      } else if (level === 3) {
        out.push(
          <h3 key={key++} className="spec-h3">
            {content}
          </h3>
        );
      } else {
        out.push(
          <h4 key={key++} className="spec-h4">
            {content}
          </h4>
        );
      }
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      out.push(<hr key={key++} className="spec-hr" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(
        <blockquote key={key++} className="spec-quote">
          {renderInline(quote.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Table
    if (line.trimStart().startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('|')) {
        rows.push(lines[i]);
        i++;
      }
      const header = splitCells(rows[0]);
      const bodyRows = rows
        .slice(1)
        .filter((r) => !/^[\s|:-]+$/.test(r))
        .map(splitCells);
      out.push(
        <div key={key++} className="spec-table-wrap">
          <table className="spec-table">
            <thead>
              <tr>
                {header.map((cell, c) => (
                  <th key={c}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((cells, r) => (
                <tr key={r}>
                  {cells.map((cell, c) => (
                    <td key={c}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Lists (flat — the docs template doesn't nest)
    const listMatch = /^(\s*)([-*]|\d+\.)\s+/.exec(line);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2]);
      const items: string[][] = [];
      while (i < lines.length) {
        const m = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (m) {
          items.push([m[3]]);
          i++;
        } else if (lines[i].trim() !== '' && /^\s{2,}/.test(lines[i]) && items.length) {
          // Continuation line of the previous item
          items[items.length - 1].push(lines[i].trim());
          i++;
        } else {
          break;
        }
      }
      const children = items.map((item, n) => <li key={n}>{renderInline(item.join(' '))}</li>);
      out.push(
        ordered ? (
          <ol key={key++} className="spec-list">
            {children}
          </ol>
        ) : (
          <ul key={key++} className="spec-list">
            {children}
          </ul>
        )
      );
      continue;
    }

    // Paragraph — merge soft-wrapped lines
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('~~~') &&
      !lines[i].startsWith('>') &&
      !lines[i].trimStart().startsWith('|') &&
      !/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length === 0) {
      // A line that matched no block rule and no paragraph rule (e.g. `#x`
      // without a space) — consume it as plain text so the loop always advances.
      para.push(lines[i].trim());
      i++;
    }
    out.push(
      <p key={key++} className="spec-p">
        {renderInline(para.join(' '))}
      </p>
    );
  }

  return out;
}
