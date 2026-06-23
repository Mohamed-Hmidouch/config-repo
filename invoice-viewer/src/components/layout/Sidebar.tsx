// See DESIGN_RULES.md before editing this file.
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lightning, Receipt, UploadSimple, Database } from '@phosphor-icons/react';

const linkBase =
  'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium text-ink-muted transition-colors hover:bg-paper hover:text-ink';
const linkActive =
  'flex items-center gap-2.5 px-3 py-2 rounded text-sm font-medium bg-paper text-accent';

export const Sidebar: React.FC = () => {
  return (
    <aside className="flex flex-col h-full w-56 bg-paper-surface border-r border-border-light font-sans">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-accent text-white">
            <Lightning size={18} weight="light" />
          </div>
          <span className="text-sm font-semibold text-ink tracking-tight">
            InvoiceView
          </span>
        </div>
        <span className="text-[10px] font-medium text-ink-muted bg-paper px-1.5 py-0.5 rounded">
          v1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 mt-2 flex-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? linkActive : linkBase)}
        >
          <Receipt size={18} weight="light" />
          <span>Factures</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) => (isActive ? linkActive : linkBase)}
        >
          <UploadSimple size={18} weight="light" />
          <span>Importer</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-light">
        <div className="flex items-center gap-2.5">
          <span className="text-ink-muted">
            <Database size={18} weight="light" />
          </span>
          <div>
            <p className="text-xs font-medium text-ink">Data-Driven UI</p>
            <p className="text-[11px] text-ink-muted leading-tight">
              Rendu dynamique JSON
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
