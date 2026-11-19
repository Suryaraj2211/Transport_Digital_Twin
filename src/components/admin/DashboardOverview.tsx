import React from 'react';
import { KpiFilterCards } from './KpiFilterCards';
import { LiveFleetSidebar } from './LiveFleetSidebar';
import { FleetMap } from './FleetMap';
import { VehicleDetailPanel } from './VehicleDetailPanel';
import { useFleet } from '../../context/FleetContext';

interface DashboardOverviewProps {
  onGoToTrips: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onGoToTrips }) => {
  const { setSelectedVehicleId } = useFleet();

  return (
    <section className="tab-panel active" id="panel-dashboard">
      {/* Sleek Top Header with Natural Breathing Room */}
      <div className="dash-top-header">
        <div className="dash-title-wrap">
          <h2 className="dash-page-heading">Live Tracking</h2>
          <span className="dash-status-dot-pulse"></span>
          <span className="dash-sub-note">Real-time GPS telematics · Auto-refreshes every 5s</span>
        </div>
      </div>

      {/* KPI Filter Cards */}
      <KpiFilterCards onGoToTrips={onGoToTrips} />

      {/* 3-Column Workspace */}
      <div className="live-map-workspace">
        <LiveFleetSidebar onSelectVehicle={(id) => setSelectedVehicleId(id)} />
        <FleetMap onSelectVehicle={(id) => setSelectedVehicleId(id)} />
        <VehicleDetailPanel />
      </div>
    </section>
  );
};

