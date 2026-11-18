import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types/fleet';

interface LiveFleetSidebarProps {
  onSelectVehicle: (id: string) => void;
}

export const LiveFleetSidebar: React.FC<LiveFleetSidebarProps> = ({ onSelectVehicle }) => {
  const { vehicles, drivers, trips, filter, selectedVehicleId } = useFleet();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getVehicleCat = (v: Vehicle): 'moving' | 'halt' | 'offline' => {
    if (v.status === 'driving') return 'moving';
    if (v.status === 'halted') return 'halt';
    return 'offline';
  };

  const allVehicles = Object.values(vehicles);
  const filteredVehicles = allVehicles.filter((v) => {
    // 1. Status Filter
    if (filter !== 'all') {
      const cat = getVehicleCat(v);
      if (cat !== filter) return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const driver = v.driverId ? drivers[v.driverId] : null;
      const plateMatch = v.plate.toLowerCase().includes(q);
      const driverMatch = driver ? driver.name.toLowerCase().includes(q) : false;
      const locationMatch = v.currentLocation ? v.currentLocation.toLowerCase().includes(q) : false;
      const destMatch = (v.destination || driver?.destination || '').toLowerCase().includes(q);
      const modelMatch = v.model.toLowerCase().includes(q);
      return plateMatch || driverMatch || locationMatch || destMatch || modelMatch;
    }

    return true;
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

      {/* Quick Fleet Search Bar */}
      <div className="fleet-search-box">
        <span className="fleet-search-icon">🔍</span>
        <input
          type="text"
          id="fleetSearchInput"
          placeholder="Search plate, driver, location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="btn-clear-fleet-search"
            id="btnClearFleetSearch"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="live-vehicle-list" id="liveVehicleList">
        {filteredVehicles.length === 0 ? (
          searchQuery.trim() ? (
            <div className="fleet-search-empty">
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                No matches for "{searchQuery}"
              </div>
              <button
                type="button"
                className="btn-reset-search"
                onClick={() => setSearchQuery('')}
              >
                Reset search
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              No vehicles in "{filter}" status.
            </div>
          )
        ) : (
          filteredVehicles.map((v) => {
            const cat = getVehicleCat(v);
            const isSelected = v.id === selectedVehicleId;
            const driver = v.driverId ? drivers[v.driverId] : null;
            const driverName = driver ? driver.name : 'Unassigned';

            const activeTrip = trips.find((t) => t.status === 'active' && t.truckPlate === v.plate);
            const isTripEnded = !activeTrip && (v.lastSeen?.toLowerCase().includes('trip ended') || v.lastSeen?.toLowerCase().includes('arrived'));

            let pillClass: string = cat;
            let pillText = '● Moving';
            if (isTripEnded) {
              pillClass = 'arrived';
              pillText = '🏁 Arrived';
            } else if (cat === 'halt') {
              pillText = '● Halt';
            } else if (cat === 'offline') {
              pillText = '● Offline';
            }

            let subText = '';
            if (isTripEnded) {
              subText = `Arrived · ${v.currentLocation || 'Destination Hub'}`;
            } else if (cat === 'moving') {
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
                <span className={`item-pill ${pillClass}`}>{pillText}</span>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
