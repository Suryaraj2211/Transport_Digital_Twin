import React from 'react';
import { useFleet } from '../../context/FleetContext';

interface KpiFilterCardsProps {
  onGoToTrips: () => void;
}

export const KpiFilterCards: React.FC<KpiFilterCardsProps> = ({ onGoToTrips }) => {
  const { vehicles, trips, filter, setFilter } = useFleet();

  const vList = Object.values(vehicles);
  const totalVehicles = vList.length;
  const movingVehicles = vList.filter((v) => v.status === 'driving').length;
  const haltedVehicles = vList.filter((v) => v.status === 'halted').length;
  const offlineVehicles = vList.filter((v) => v.status === 'offline').length;

  const completedToday = trips.filter((t) => t.status === 'completed').length;
  const totalDistance = vList.reduce((acc, v) => acc + (v.distanceToday || 0), 0);

  return (
    <div className="live-map-kpis">
      <div
        className={`live-kpi-card live-kpi-filter ${filter === 'all' ? 'active' : ''}`}
        data-filter="all"
        onClick={() => setFilter('all')}
        style={{ borderLeft: '4px solid #2563eb' }}
        title="Filter: All Vehicles"
      >
        <span className="live-kpi-value" id="kpiTotalVehicles">
          {totalVehicles}
        </span>
        <span className="live-kpi-label">TOTAL VEHICLES</span>
      </div>

      <div
        className={`live-kpi-card live-kpi-filter live-kpi-active ${filter === 'moving' ? 'active' : ''}`}
        data-filter="moving"
        onClick={() => setFilter('moving')}
        style={{ borderLeft: '4px solid #16a34a' }}
        title="Filter: Active Trips (Moving)"
      >
        <span className="live-kpi-value" id="kpiActiveTrips" style={{ color: '#16a34a' }}>
          {movingVehicles}
        </span>
        <span className="live-kpi-label">ACTIVE TRIPS</span>
      </div>

      <div
        className={`live-kpi-card live-kpi-filter live-kpi-halted ${filter === 'halt' ? 'active' : ''}`}
        data-filter="halt"
        onClick={() => setFilter('halt')}
        style={{ borderLeft: '4px solid #f59e0b' }}
        title="Filter: Vehicles Halted"
      >
        <span className="live-kpi-value" id="kpiHaltedCount" style={{ color: '#d97706' }}>
          {haltedVehicles}
        </span>
        <span className="live-kpi-label">VEHICLES HALTED</span>
      </div>

      <div
        className={`live-kpi-card live-kpi-filter live-kpi-offline ${filter === 'offline' ? 'active' : ''}`}
        data-filter="offline"
        onClick={() => setFilter('offline')}
        style={{ borderLeft: '4px solid #64748b' }}
        title="Filter: Offline Vehicles"
      >
        <span className="live-kpi-value" id="kpiOfflineCount" style={{ color: '#64748b' }}>
          {offlineVehicles}
        </span>
        <span className="live-kpi-label">OFFLINE</span>
      </div>

      <div
        className="live-kpi-card live-kpi-completed"
        onClick={onGoToTrips}
        style={{ borderLeft: '4px solid #0284c7' }}
        title="Click to view Trip History"
      >
        <span className="live-kpi-value" id="kpiCompletedToday" style={{ color: '#0284c7' }}>
          {completedToday}
        </span>
        <span className="live-kpi-label">COMPLETED TODAY</span>
      </div>

      <div
        className="live-kpi-card live-kpi-summary"
        style={{ borderLeft: '4px solid #0f172a', cursor: 'default' }}
        title="Fleet Total Distance Today"
      >
        <span className="live-kpi-value">
          <span id="kpiFleetDistance">{totalDistance.toFixed(1)}</span> <span className="unit-km">km</span>
        </span>
        <span className="live-kpi-label">FLEET DISTANCE TODAY</span>
      </div>
    </div>
  );
};

