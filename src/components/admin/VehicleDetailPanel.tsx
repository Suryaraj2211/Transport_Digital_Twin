import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types/fleet';

interface VehicleDetailPanelProps {
  onClose?: () => void;
}

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({ onClose }) => {
  const {
    vehicles,
    drivers,
    trips,
    selectedVehicleId,
    simulateMissedCall,
    simulateGeofence,
    addToast,
  } = useFleet();

  const [activeTab, setActiveTab] = useState<'overview' | 'corridor'>('overview');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const [isClosed, setIsClosed] = useState(false);

  // If vehicle changes, un-close the panel
  React.useEffect(() => {
    setIsClosed(false);
  }, [selectedVehicleId]);

  if (isClosed) return null;

  const vehicle: Vehicle | undefined = vehicles[selectedVehicleId] || Object.values(vehicles)[0];
  if (!vehicle) return null;

  const driver = vehicle.driverId ? drivers[vehicle.driverId] : null;

  const getCat = (v: Vehicle): 'moving' | 'halt' | 'offline' => {
    if (v.status === 'driving') return 'moving';
    if (v.status === 'halted') return 'halt';
    return 'offline';
  };

  const cat = getCat(vehicle);
  let pillText = '● Moving';
  if (cat === 'halt') pillText = '● Halt';
  else if (cat === 'offline') pillText = '● Offline';

  const sourceBadgeText =
    vehicle.source === 'sim'
      ? '📶 Telecom SIM LBS'
      : vehicle.source === 'gps'
      ? '🛰️ GPS Device'
      : '📱 Driver App GPS';

  // Find active trip for this vehicle
  const activeTrip = trips.find((t) => t.status === 'active' && t.truckPlate === vehicle.plate);
  const lastTrip = trips.find((t) => t.status === 'completed' && t.truckPlate === vehicle.plate);

  // Driver initials
  const initials = driver
    ? driver.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'UN';

  // Distance calculation based on timeframe
  let distanceVal = vehicle.distanceToday || 0;
  if (timeframe === 'week') distanceVal = distanceVal * 5.2;
  if (timeframe === 'month') distanceVal = distanceVal * 22.4;

  const handleStartSimTrip = () => {
    if (driver) {
      simulateMissedCall(driver.id);
    } else {
      addToast('No driver assigned to this truck to start SIM trip', 'alert');
    }
  };

  const handleEndSimTrip = () => {
    if (driver) {
      simulateMissedCall(driver.id);
    }
  };

  const handlePingTower = () => {
    addToast(`📡 Pinging Cell Tower for ${vehicle.plate}... Signal Strong (-72 dBm)`, 'success');
  };

  // Signal text
  let signalText = 'Strong (4G LTE · -74 dBm)';
  let signalColor = '#16a34a';
  if (vehicle.status === 'offline') {
    signalText = 'No Signal (Offline · 42m)';
    signalColor = '#ef4444';
  } else if (vehicle.source === 'sim') {
    const carrier = driver && driver.device && driver.device.toLowerCase().includes('jio') ? 'Jio 4G' : 'Airtel 4G';
    const cellId = carrier.includes('Jio') ? '#8821' : '#4819';
    signalText = `${carrier} Tower LBS (Cell ${cellId} · -72 dBm)`;
    signalColor = '#2563eb';
  } else if (cat === 'halt') {
    signalText = 'Good (4G LTE · -82 dBm)';
    signalColor = '#d97706';
  }

  const batt = vehicle.battery || 85;
  const battColor = batt < 20 ? '#ef4444' : batt < 50 ? '#f59e0b' : '#10b981';

  return (
    <aside className="live-vehicle-detail-panel" id="liveVehicleDetailPanel">
      {/* Header */}
      <div className="detail-panel-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="detail-plate" id="detailPlate">
              {vehicle.plate}
            </h3>
            <span className={`detail-status-pill ${cat}`} id="detailStatusPill">
              {pillText}
            </span>
          </div>
          <div className="detail-sub-header">
            <span className="detail-model" id="detailModel">
              {vehicle.model} · {vehicle.type}
            </span>
            <span className={`source-badge ${vehicle.source}`} id="detailSourceBadge">
              {sourceBadgeText}
            </span>
          </div>
        </div>
        <button className="btn-close-detail" onClick={onClose || (() => setIsClosed(true))} title="Close details">
          ✕
        </button>
      </div>

      {/* 2-Tabs Segmented Bar */}
      <div className="detail-tabs-nav">
        <button
          type="button"
          className={`detail-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          id="tabBtnOverview"
          onClick={() => setActiveTab('overview')}
        >
          📊 Live Overview
        </button>
        <button
          type="button"
          className={`detail-tab-btn ${activeTab === 'corridor' ? 'active' : ''}`}
          id="tabBtnCorridor"
          onClick={() => setActiveTab('corridor')}
        >
          🛰️ Corridor & Tech
        </button>
      </div>

      {/* TAB 1: LIVE OVERVIEW PANE */}
      {activeTab === 'overview' && (
        <div className="detail-tab-pane active" id="paneDetailOverview">
          {/* Distance Covered Card */}
          <div className="detail-distance-card">
            <div className="distance-header">
              <span>📈 DISTANCE COVERED</span>
              <div className="timeframe-toggle">
                <button
                  type="button"
                  className={`timeframe-btn ${timeframe === 'today' ? 'active' : ''}`}
                  onClick={() => setTimeframe('today')}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={`timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeframe('week')}
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeframe('month')}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="distance-number-row">
              <span className="distance-number">
                <span id="detailDistance">{Math.round(distanceVal)}</span> <span className="distance-unit">km</span>
              </span>
              <span className="distance-sub" id="detailDistanceSub">
                {timeframe === 'today' ? `Today · since ${driver?.onDutySince || '06:30'}` : timeframe === 'week' ? 'This Week' : 'This Month'}
              </span>
            </div>
          </div>

          {/* Driver Card */}
          <div className="detail-driver-card">
            <div className="driver-avatar" id="detailDriverAvatar">
              {initials}
            </div>
            <div className="driver-info">
              <div className="driver-name-row">
                <span className="driver-name" id="detailDriverName">
                  {driver ? driver.name : 'Unassigned'}
                </span>
                {driver && (
                  <span className="driver-phone-type-badge" id="detailPhoneType">
                    {driver.phoneType === 'smart' ? 'Smartphone' : 'Button Phone'}
                  </span>
                )}
              </div>
              <div className="driver-status" id="detailDriverStatus">
                {driver
                  ? `On duty since ${driver.onDutySince || '05:40'} · ${
                      cat === 'moving'
                        ? `Moving ${vehicle.speed} km/h`
                        : cat === 'halt'
                        ? 'Halted / Stopped'
                        : 'phone offline'
                    }`
                  : 'Assign a driver from the Drivers tab'}
              </div>
              <div className="driver-phone-text" id="detailDriverPhone">
                {driver ? driver.phone : 'No phone linked'}
              </div>
            </div>
            {driver && driver.phone && (
              <div className="driver-card-actions">
                <a href={`tel:${driver.phone}`} id="detailDriverCall" className="btn-driver-call" title="Call Driver">
                  📞
                </a>
              </div>
            )}
          </div>

          {/* 3-Column Stats Row */}
          <div className="detail-stats-grid">
            <div className="stat-cell">
              <div className="stat-label">Speed</div>
              <div className="stat-value speed-highlight" id="detailSpeed">
                {vehicle.speed > 0 ? `${vehicle.speed} km/h` : '—'}
              </div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">GPS accuracy</div>
              <div className="stat-value" id="detailAccuracy">
                {vehicle.accuracy || 12} m
              </div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Last update</div>
              <div className="stat-value" id="detailLastUpdate">
                {vehicle.lastSeen || 'Live now'}
              </div>
            </div>
          </div>

          {/* Last Known Location */}
          <div className="detail-location-box">
            <div className="stat-label">Last known location</div>
            <div className="location-value" id="detailLocation">
              {vehicle.currentLocation}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CORRIDOR & TELEMATICS TECH PANE */}
      {activeTab === 'corridor' && (
        <div className="detail-tab-pane active" id="paneDetailCorridor">
          {/* Freight Corridor & Route Progress */}
          <div className="detail-corridor-card" id="detailCorridorCard">
            <div className="corridor-header">
              <span className="corridor-title">
                🛣️ <span id="detailCorridorTitle">NH 48 Sriperumbudur Corridor</span>
              </span>
              <span className="corridor-pct" id="detailCorridorPct">
                {vehicle.status === 'driving' ? '72%' : '100%'}
              </span>
            </div>
            <div className="corridor-progress-bar">
              <div
                className="corridor-progress-fill"
                id="detailCorridorFill"
                style={{ width: vehicle.status === 'driving' ? '72%' : '100%' }}
              ></div>
            </div>
            <div className="corridor-checkpoint-row">
              <span className="corridor-sub">📍 Next Toll / Hub:</span>
              <span className="corridor-checkpoint-val" id="detailCheckpoint">
                {driver?.destination || 'Sriperumbudur Logistics Hub'}
              </span>
            </div>
          </div>

          {/* Live Trip & Operational Halt Status Card */}
          <div className="detail-trip-card" id="detailTripCard">
            {vehicle.status === 'driving' && activeTrip ? (
              <>
                <div className="trip-status-header">
                  <span className="trip-badge active">🟢 Active Trip</span>
                  <span className="trip-duration-live">⏱️ {activeTrip.duration}</span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">Destination:</span>
                  <span className="t-val highlight">
                    {activeTrip.endLocation && activeTrip.endLocation !== 'In Transit'
                      ? activeTrip.endLocation
                      : driver?.destination || 'Sriperumbudur Logistics Hub'}
                  </span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">From:</span>
                  <span className="t-val">
                    {activeTrip.startLocation} ({activeTrip.startTime})
                  </span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">Trip Halt:</span>
                  <span
                    className="t-val"
                    style={{
                      color: activeTrip.haltSeconds > 0 ? '#d97706' : '#16a34a',
                      fontWeight: 600,
                    }}
                  >
                    {activeTrip.haltTime || '00:00'}
                  </span>
                </div>
              </>
            ) : vehicle.status === 'halted' ? (
              <>
                <div className="trip-status-header">
                  <span className="trip-badge halt">⏸️ Halted (Speed 0)</span>
                  <span className="trip-duration-live" style={{ color: '#d97706' }}>
                    Stopped
                  </span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">Halt Duration:</span>
                  <span className="t-val" style={{ color: '#d97706', fontWeight: 700 }}>
                    {vehicle.haltSeconds ? `${Math.floor(vehicle.haltSeconds / 60)}m` : '2m 00s'} (
                    {vehicle.haltReason || 'Tea Break'})
                  </span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">Destination:</span>
                  <span className="t-val">{driver?.destination || 'Madhavaram Freight Hub'}</span>
                </div>
              </>
            ) : lastTrip ? (
              <>
                <div className="trip-status-header">
                  <span className="trip-badge completed">🏁 Last Trip Completed</span>
                  <span className="trip-duration-live">Ended {lastTrip.endTime}</span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">At:</span>
                  <span className="t-val">{lastTrip.endLocation || 'Chengalpattu'}</span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">Trip Halt:</span>
                  <span className="t-val">{lastTrip.haltTime}</span>
                </div>
              </>
            ) : (
              <>
                <div className="trip-status-header">
                  <span className="trip-badge available">⚪ Available / No Active Trip</span>
                </div>
                <div className="trip-info-row">
                  <span className="t-label">Status:</span>
                  <span className="t-val" style={{ color: '#64748b' }}>
                    Ready for dispatch
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Fleet Telematics Diagnostics Card */}
          <div className="detail-diagnostics-card" id="detailDiagnosticsCard">
            <div className="diag-card-header">
              <span className="diag-header-title">📡 Network & Diagnostics</span>
            </div>
            <div className="diag-row">
              <span className="diag-label">📡 Link Signal:</span>
              <span className="diag-val" id="detailSignalText" style={{ color: signalColor }}>
                {signalText}
              </span>
            </div>
            <div className="diag-row">
              <span className="diag-label">🔋 Battery:</span>
              <div className="battery-bar-wrapper">
                <div
                  className="battery-bar-fill"
                  id="detailBatteryFill"
                  style={{
                    width: `${batt}%`,
                    background: battColor,
                  }}
                ></div>
              </div>
              <span className="diag-val" id="detailBatteryPctText">
                {batt}%
              </span>
            </div>
          </div>

          {/* SIM Dispatch & Trip Actions Box */}
          <div className="detail-actions-box" id="detailActionsBox">
            {vehicle.source === 'sim' ? (
              vehicle.status !== 'driving' ? (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '7px 10px', fontWeight: 600 }}
                  onClick={handleStartSimTrip}
                >
                  ▶️ Admin: Start SIM Trip
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    style={{ flex: 1, justifyContent: 'center', padding: '7px 10px', fontWeight: 600 }}
                    onClick={handleEndSimTrip}
                  >
                    🛑 Admin: End Trip
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ padding: '7px 10px', fontWeight: 600 }}
                    onClick={handlePingTower}
                  >
                    📡 Ping Tower
                  </button>
                </div>
              )
            ) : (
              <div className="app-control-notice">
                🔒 Driver controls trip via Smartphone Mobile App
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ width: '100%', fontSize: '11px', padding: '6px 10px' }}
                onClick={() => driver && simulateMissedCall(driver.id)}
              >
                📞 Simulate Missed Call (1800-419-7890)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ width: '100%', fontSize: '11px', padding: '6px 10px' }}
                onClick={() => simulateGeofence(vehicle.id)}
              >
                🌐 Simulate Geofence Gate Trigger (500m)
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
