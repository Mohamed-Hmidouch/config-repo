import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lightning, Receipt, UploadSimple, Database } from '@phosphor-icons/react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <Lightning size={18} weight="fill" />
          </div>
          <span className="sidebar__logo-text">InvoiceView</span>
        </div>
        <span className="sidebar__version">v1.0</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__link-icon">
            <Receipt size={18} weight="duotone" />
          </span>
          <span className="sidebar__link-text">Factures</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__link-icon">
            <UploadSimple size={18} weight="duotone" />
          </span>
          <span className="sidebar__link-text">Importer</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__footer-info">
          <span className="sidebar__footer-icon">
            <Database size={18} weight="duotone" />
          </span>
          <div>
            <p className="sidebar__footer-title">Data-Driven UI</p>
            <p className="sidebar__footer-desc">Rendu dynamique JSON</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
