import React, { useState, useEffect } from 'react';
import { FleetProvider } from './context/FleetContext';
import { DriverProvider } from './context/DriverContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { DriverPortal } from './components/driver/DriverPortal';
import adminCss from './styles/admin.css?inline';
import driverCss from './styles/driver.css?inline';

export const App: React.FC = () => {
  const getInitialView = (): 'admin' | 'driver' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('driver') || hash.includes('driver')) {
        return 'driver';
      }
    }
    return 'admin';
  };

  const [view, setView] = useState<'admin' | 'driver'>(getInitialView);

  // Dynamic Stylesheet Injection: ensures 100% style isolation with zero CSS bleed
  useEffect(() => {
    let styleTag = document.getElementById('view-styles') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'view-styles';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = view === 'admin' ? adminCss : driverCss;
    document.body.className = view === 'driver' ? 'view-driver' : 'view-admin';
  }, [view, adminCss, driverCss]);

  // Handle browser back/forward or hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('driver') || hash.includes('driver')) {
        setView('driver');
      } else {
        setView('admin');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleOpenDriverPortal = () => {
    window.open('/driver', '_blank');
  };

  return (
    <>
      {view === 'admin' ? (
        <FleetProvider>
          <AdminLayout onOpenDriverPortal={handleOpenDriverPortal} />
        </FleetProvider>
      ) : (
        <DriverProvider>
          <DriverPortal />
        </DriverProvider>
      )}
    </>
  );
};

