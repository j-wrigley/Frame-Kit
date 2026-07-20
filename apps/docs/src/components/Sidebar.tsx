import { useEffect, useRef, useState } from 'react';
import {
  ArrowTopRightIcon,
  Button,
  Cross1Icon,
  CursorArrowIcon,
  HamburgerMenuIcon,
  MoonIcon,
  SunIcon,
  Tag,
} from '@presentstandards/framekit-ui';
import { NAV, type PageId } from '../nav';
import { hasSpec } from '../specs';
import { reapplyAccentForTheme } from '../lib/accent-store';

export function Sidebar({ active, spec = false }: { active: PageId; spec?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const activeItem = NAV.flatMap((section) => section.items).find((item) => item.id === active);

  useEffect(() => {
    setMobileOpen(false);
  }, [active, spec]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      mobileTriggerRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="mobile-docs-bar">
        <div className="mobile-docs-bar__identity">
          <Tag tone="primary">Frame Kit</Tag>
          <span>
            {spec
              ? `${activeItem?.label ?? 'Documentation'} spec`
              : (activeItem?.label ?? 'Documentation')}
          </span>
        </div>
        <Button
          ref={mobileTriggerRef}
          variant="ghost"
          size="sm"
          iconStart={<HamburgerMenuIcon />}
          aria-label="Open documentation navigation"
          aria-controls="docs-sidebar"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        />
      </header>

      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close documentation navigation"
        data-open={mobileOpen || undefined}
        onClick={() => setMobileOpen(false)}
      />

      <aside className="sidebar" id="docs-sidebar" data-mobile-open={mobileOpen || undefined}>
        <div className="sidebar-brand" aria-label="Frame Kit version 0.1">
          <a className="sidebar-brand-home" href="./" aria-label="Frame Kit home">
            <Tag tone="primary" className="sidebar-brand-name">
              Frame Kit
            </Tag>
          </a>
          <Tag tone="accent" className="sidebar-brand-version">
            v0.1
          </Tag>
          <Button
            className="sidebar-mobile-close"
            variant="ghost"
            size="sm"
            iconStart={<Cross1Icon />}
            aria-label="Close documentation navigation"
            onClick={() => {
              setMobileOpen(false);
              mobileTriggerRef.current?.focus();
            }}
          />
        </div>

        <nav className="sidebar-nav" aria-label="Documentation">
          {NAV.map((section, i) => (
            <div className="sidebar-section" key={section.title ?? i}>
              {section.title && (
                <div className="sidebar-section-heading">
                  <Tag as="div" className="sidebar-section-title">
                    {section.title}
                  </Tag>
                  {section.badge && (
                    <Tag tone="accent" className="sidebar-section-badge">
                      {section.badge}
                    </Tag>
                  )}
                </div>
              )}
              {section.items.length > 0 && (
                <ul className="sidebar-list">
                  {section.items.map((item) => (
                    <li className="sidebar-row" key={item.id}>
                      <a
                        className="sidebar-link"
                        href={`#/${item.id}`}
                        aria-current={active === item.id && !spec ? 'page' : undefined}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="sidebar-link-label">
                          {item.sidebarLabel ?? item.label}
                        </span>
                        {item.badge && (
                          <Tag tone="accent" className="sidebar-link-badge">
                            {item.badge}
                          </Tag>
                        )}
                      </a>
                      {hasSpec(item.id) && (
                        <a
                          className="sidebar-spec-link"
                          href={`#/spec/${item.id}`}
                          aria-current={active === item.id && spec ? 'page' : undefined}
                          aria-label={`${item.label} — Markdown spec`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <ArrowTopRightIcon size={11} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <FigmaCaptureToggle />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

function FigmaCaptureToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-fk-capture', enabled);
    if (enabled) document.documentElement.dataset.fkCapture = 'figma';

    return () => {
      document.documentElement.removeAttribute('data-fk-capture');
    };
  }, [enabled]);

  return (
    <Button
      className="sidebar-capture-toggle"
      variant="ghost"
      iconStart={<CursorArrowIcon />}
      aria-label={`${enabled ? 'Disable' : 'Enable'} Figma capture mode`}
      aria-pressed={enabled}
      title={`${enabled ? 'Disable' : 'Enable'} Figma capture mode`}
      onClick={() => setEnabled((current) => !current)}
    />
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  );

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('fk-theme', next);
    } catch {
      // private browsing — theme just won't persist
    }
    // Custom accents derive from the theme — recompute for the new one.
    reapplyAccentForTheme();
    setTheme(next);
  };

  return (
    <Button
      variant="ghost"
      iconStart={theme === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    />
  );
}
