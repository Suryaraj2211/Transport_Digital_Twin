import React from 'react';
import { useDriver } from '../../context/DriverContext';
import { HeaderClock } from '../common/HeaderClock';

export const DriverHeader: React.FC = () => {
  const { profiles, selectedProfileId, setSelectedProfileId, profile, isOnTrip } = useDriver();

  return (
    <header className="app-header">
      <div className="header-brand-row">
        <div className="brand-badge">
          <span className="brand-dot"></span>
          <span>V3 LOGISTICS</span>
        </div>
        <div className="header-status-cluster">
          <HeaderClock className="header-clock" id="headerClock" hour12={false} />
          <div
            id="dutyStatusPill"
            className={`duty-pill ${isOnTrip ? 'on-duty' : 'off-duty'}`}
            style={{
              background: isOnTrip ? '#16a34a' : '#334155',
              color: '#ffffff',
            }}
          >
            {isOnTrip ? 'ON DUTY' : 'OFF DUTY'}
          </div>
        </div>
      </div>

      {/* Driver & Truck Header Profile Card */}
      <div className="driver-card-header">
        <div className="driver-identity">
          <div className="driver-avatar">🧑‍✈️</div>
          <div className="driver-details-wrap">
            <select
              id="driverSelectDropdown"
              className="driver-select-input"
              title="Switch driver profile"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              disabled={isOnTrip}
            >
              {Object.values(profiles).map((p) => (
                <option key={p.driverId} value={p.driverId}>
                  {p.driverName} · {p.plate}
                </option>
              ))}
            </select>
            <div className="truck-meta-sub" id="truckMetaSub">
              {profile.truckModel}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

