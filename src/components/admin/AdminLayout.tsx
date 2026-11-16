import React, { useState } from 'react';
import { Sidebar, AdminTab } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { VehiclesTable } from './VehiclesTable';
import { DriversTable } from './DriversTable';
import { TripsTable } from './TripsTable';
import { ToastContainer } from '../common/ToastContainer';

interface AdminLayoutProps {
  onOpenDriverPortal?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onOpenDriverPortal }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');

  return (
    <div className="layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenDriverPortal={onOpenDriverPortal}
      />

      {/* Main Content Area */}
      <main className="content">
        {currentTab === 'dashboard' && <DashboardOverview onGoToTrips={() => setCurrentTab('trips')} />}
        {currentTab === 'vehicles' && <VehiclesTable />}
        {currentTab === 'drivers' && <DriversTable />}
        {currentTab === 'trips' && <TripsTable />}
      </main>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

