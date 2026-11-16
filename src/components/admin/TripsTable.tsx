import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { exportTripsToCsv } from '../../services/exportService';

export const TripsTable: React.FC = () => {
  const { trips } = useFleet();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTrips = trips.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.truckPlate.toLowerCase().includes(term) ||
      t.driverName.toLowerCase().includes(term) ||
      t.startLocation.toLowerCase().includes(term) ||
      t.endLocation.toLowerCase().includes(term) ||
      t.status.toLowerCase().includes(term) ||
      String(t.tripNum).includes(term)
    );
  });

  return (
    <section className="tab-panel active" id="panel-trips">
      <div className="panel-header-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <h2 className="panel-title" style={{ margin: 0 }}>
            Trip History
          </h2>
          <input
            type="text"
            id="tripSearchInput"
            placeholder="🔍 Search truck plate, driver, location, status..."
            style={{
              padding: '6px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '13px',
              width: '300px',
              outline: 'none',
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn btn-outline"
          id="btnExportCSV"
          type="button"
          onClick={() => exportTripsToCsv(filteredTrips)}
        >
          📥 Export CSV
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table" id="tripsTable">
          <thead>
            <tr>
              <th>Trip #</th>
              <th>Truck Plate</th>
              <th>Driver Name</th>
              <th>Start Time</th>
              <th>Start Location</th>
              <th>End Time</th>
              <th>End Location</th>
              <th>Duration</th>
              <th>Halt Time</th>
              <th>Avg Speed</th>
              <th>Distance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="tripsTableBody">
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  No matching trip records found.
                </td>
              </tr>
            ) : (
              filteredTrips.map((trip) => {
                const isActive = trip.status === 'active';
                return (
                  <tr key={trip.id}>
                    <td>
                      <strong>#{trip.tripNum}</strong>
                    </td>
                    <td>
                      <span className="plate-badge">{trip.truckPlate}</span>
                    </td>
                    <td>{trip.driverName}</td>
                    <td>{trip.startTime}</td>
                    <td>{trip.startLocation}</td>
                    <td>{trip.endTime || '--'}</td>
                    <td>{trip.endLocation || '--'}</td>
                    <td>
                      <strong>{trip.duration || '--'}</strong>
                    </td>
                    <td>{trip.haltTime || '00:00'}</td>
                    <td>{trip.avgSpeed}</td>
                    <td>
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>{trip.distance}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${trip.status}`}>
                        {isActive ? '🟢 Active' : '✅ Completed'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

