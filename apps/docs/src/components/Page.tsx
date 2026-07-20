import type { ReactNode } from 'react';
import { Tag } from '@presentstandards/framekit-ui';

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="page-header">
      <Tag as="p" tone="accent" className="page-eyebrow">
        {eyebrow}
      </Tag>
      <h1 className="page-title">{title}</h1>
      <p className="page-lede">{lede}</p>
    </header>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="page-section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="card">
      {title && (
        <Tag as="h3" tone="primary" className="card-title">
          {title}
        </Tag>
      )}
      {children}
    </div>
  );
}
