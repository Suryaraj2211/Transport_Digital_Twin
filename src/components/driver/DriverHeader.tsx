import React from 'react';
import { useDriver } from '../../context/DriverContext';
import { HeaderClock } from '../common/HeaderClock';

export const DriverHeader: React.FC = () => {
  const { selectedProfileId, setSelectedProfileId, profile, isOnTrip } = useDriver();

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
              <option value="d1">Murugan K · TN 09 AB 1234</option>
              <option value="d2">Selvam R · TN 22 CD 5678</option>
              <option value="d3">Imran Pasha · KA 01 EF 9012</option>
              <option value="d6">Anbu Selvan · TN 07 LM 2468</option>
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

