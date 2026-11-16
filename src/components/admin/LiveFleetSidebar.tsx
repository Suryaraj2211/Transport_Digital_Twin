import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types/fleet';

interface LiveFleetSidebarProps {
  onSelectVehicle: (id: string) => void;
}

export const LiveFleetSidebar: React.FC<LiveFleetSidebarProps> = ({ onSelectVehicle }) => {
  const { vehicles, drivers, filter, selectedVehicleId } = useFleet();

  const getVehicleCat = (v: Vehicle): 'moving' | 'halt' | 'offline' => {
    if (v.status === 'driving') return 'moving';
    if (v.status === 'halted') return 'halt';
    return 'offline';
  };

  const allVehicles = Object.values(vehicles);
  const filteredVehicles = allVehicles.filter((v) => {
    if (filter === 'all') return true;
    const cat = getVehicleCat(v);
    return cat === filter;
  });

  const filterLabel =
    filter === 'all'
      ? `All (${allVehicles.length})`
      : filter === 'moving'
      ? `Moving (${allVehicles.filter((v) => v.status === 'driving').length})`
      : filter === 'halt'
      ? `Halted (${allVehicles.filter((v) => v.status === 'halted').length})`
      : `Offline (${allVehicles.filter((v) => v.status === 'offline').length})`;

  return (
    <aside className="live-fleet-sidebar">
      <div className="fleet-list-header">
        <span className="fleet-list-title">🚚 Fleet Vehicles</span>
        <span className="fleet-filter-badge" id="fleetFilterIndicator">
          {filterLabel}
        </span>
      </div>

      <div className="live-vehicle-list" id="liveVehicleList">
        {filteredVehicles.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
            No vehicles in "{filter}" status.
          </div>
        ) : (
          filteredVehicles.map((v) => {
            const cat = getVehicleCat(v);
            const isSelected = v.id === selectedVehicleId;
            const driver = v.driverId ? drivers[v.driverId] : null;
            const driverName = driver ? driver.name : 'Unassigned';

            let pillText = '● Moving';
            if (cat === 'halt') pillText = '● Halt';
            else if (cat === 'offline') pillText = '● Offline';

            let subText = '';
            if (cat === 'moving') {
              subText = `${v.speed} km/h · ${v.lastSeen || 'Live now'}`;
            } else if (cat === 'halt') {
              subText = v.lastSeen || 'Halted · 2 min ago';
            } else {
              subText = v.lastSeen || 'No signal · last seen 42 min ago';
            }

            return (
              <div
                key={v.id}
                className={`live-vehicle-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectVehicle(v.id)}
              >
                <div className="item-left">
                  <span className="item-plate">{v.plate}</span>
                  <span className="item-driver">{driverName}</span>
                  <span className="item-sub">{subText}</span>
                </div>
                <span className={`item-pill ${cat}`}>{pillText}</span>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

