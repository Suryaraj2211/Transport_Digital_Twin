import React from 'react';
import { DriverHeader } from './DriverHeader';
import { GpsBar } from './GpsBar';
import { RouteCorridorCard } from './RouteCorridorCard';
import { DriverMiniMap } from './DriverMiniMap';
import { TripActions } from './TripActions';
import { TripTelemetry } from './TripTelemetry';
import { TripSummaryCard } from './TripSummaryCard';
import { ShiftMetrics } from './ShiftMetrics';
import { DemoToolbar } from './DemoToolbar';

interface DriverPortalProps {
  onBackToAdmin?: () => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = () => {
  return (
    <div className="app-shell">
      {/* HEADER BAR */}
      <DriverHeader />

      {/* MAIN APP CONTENT */}
      <main className="app-content">
        <GpsBar />
        <RouteCorridorCard />
        <DriverMiniMap />
        <TripActions />
        <TripTelemetry />
        <TripSummaryCard />
        <ShiftMetrics />
        <DemoToolbar />
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <div className="footer-brand">V3 Logistics · Commercial Driver Telematics</div>
        <div className="footer-privacy">
          🔒 Location shared with Fleet Dispatch only during active trips
        </div>
      </footer>
    </div>
  );
};

