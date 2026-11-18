import React from 'react';
import { HeaderClock } from '../common/HeaderClock';

export type AdminTab = 'dashboard' | 'vehicles' | 'drivers' | 'trips';

interface SidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onOpenDriverPortal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenDriverPortal }) => {
  return (
    <aside className="sidebar">
      {/* Integrated Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          <div className="sidebar-logo-box">
            <span className="sidebar-logo">🚚</span>
          </div>
          <div>
            <div className="sidebar-brand-name">Fleet Tracker</div>
            <span className="sidebar-admin-badge">V3 LOGISTICS</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`sidebar-tab ${currentTab === 'dashboard' ? 'active' : ''}`}
          data-tab="dashboard"
          onClick={() => onSelectTab('dashboard')}
        >
          <span className="tab-icon">📍</span>
          <span className="tab-label">Live map</span>
        </button>
        <button
          type="button"
          className={`sidebar-tab ${currentTab === 'vehicles' ? 'active' : ''}`}
          data-tab="vehicles"
          onClick={() => onSelectTab('vehicles')}
        >
          <span className="tab-icon">🚚</span>
          <span className="tab-label">Vehicles</span>
        </button>
        <button
          type="button"
          className={`sidebar-tab ${currentTab === 'drivers' ? 'active' : ''}`}
          data-tab="drivers"
          onClick={() => onSelectTab('drivers')}
        >
          <span className="tab-icon">👤</span>
          <span className="tab-label">Drivers</span>
        </button>
        <button
          type="button"
          className={`sidebar-tab ${currentTab === 'trips' ? 'active' : ''}`}
          data-tab="trips"
          onClick={() => onSelectTab('trips')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Trip History</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <a
          href="/driver"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-portal-btn"
          onClick={(e) => {
            if (onOpenDriverPortal) {
              e.preventDefault();
              onOpenDriverPortal();
            }
          }}
        >
          📱 Open Driver Portal ↗
        </a>
        <div className="sidebar-clock-row">
          <span className="clock-indicator-dot"></span>
          <HeaderClock className="sidebar-clock" id="headerClock" />
        </div>
        <div className="sidebar-user-tag">
          <span className="user-status-dot"></span>
          <span>Owner Account · V3</span>
        </div>
      </div>
    </aside>
  );
};
