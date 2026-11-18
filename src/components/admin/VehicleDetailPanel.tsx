import React, { useState, useEffect } from 'react';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types/fleet';

interface VehicleDetailPanelProps {
  onClose?: () => void;
}

const VEHICLE_CORRIDOR_MAP: Record<string, { name: string; checkpoint: string; pct: number }> = {
  v1: { name: 'NH 48 West Poonamallee Corridor', checkpoint: 'Poonamallee Depot', pct: 65 },
  v2: { name: 'GST South Express Corridor', checkpoint: 'Meenambakkam Cargo Bay', pct: 58 },
  v3: { name: 'CTH Road North-West Corridor', checkpoint: 'Thirumullaivoyal Bay', pct: 72 },
  v4: { name: 'South-West Mangadu/Kundrathur Rd', checkpoint: 'Moulivakkam Hub Gate', pct: 45 },
  v5: { name: '100 Feet Inner Ring Road', checkpoint: 'Vadapalani Junction', pct: 80 },
  v6: { name: 'Ambattur Industrial Estate Avenue', checkpoint: 'Mogappair West Gate', pct: 60 },
};

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({ onClose }) => {
  const {
    vehicles,
    drivers,
    trips,
    selectedVehicleId,
    adminStartSimTrip,
    adminEndSimTrip,
    addToast,
    switchVehicleTrackingMode,
    updateVehicleSimPhone,
    initiateSimConsent,
    openSimDrawer,
    pingSimLbs,
    sendAppPortalLinkSms,
  } = useFleet();

  const [activeTab, setActiveTab] = useState<'overview' | 'corridor'>('overview');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If vehicle changes, automatically expand panel
  useEffect(() => {
    setIsCollapsed(false);
  }, [selectedVehicleId]);

  const vehicle: Vehicle | undefined = vehicles[selectedVehicleId] || Object.values(vehicles)[0];
  const driver = vehicle && vehicle.driverId ? drivers[vehicle.driverId] : null;

  const [phoneDraft, setPhoneDraft] = useState<string>('');

  useEffect(() => {
    if (vehicle) {
      setPhoneDraft(vehicle.simPhone || driver?.phone || '');
    }
  }, [vehicle?.id, vehicle?.simPhone, driver?.phone]);

  if (!vehicle) return null;

  const getCat = (v: Vehicle): 'moving' | 'halt' | 'offline' => {
    if (v.status === 'driving') return 'moving';
    if (v.status === 'halted') return 'halt';
    return 'offline';
  };

  const cat = getCat(vehicle);

  // Find active trip for this vehicle
  const activeTrip = trips.find((t) => t.status === 'active' && t.truckPlate === vehicle.plate);
  const lastTrip = trips.find((t) => t.truckPlate === vehicle.plate);

  const isTripEnded =
    !activeTrip &&
    (vehicle.lastSeen?.toLowerCase().includes('trip ended') ||
      vehicle.lastSeen?.toLowerCase().includes('arrived') ||
      (lastTrip && lastTrip.status === 'completed' && vehicle.status === 'halted' && !vehicle.haltReason));

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

  const corridorInfo = VEHICLE_CORRIDOR_MAP[vehicle.id] || {
    name: vehicle.currentLocation || 'State Freight Corridor',
    checkpoint: vehicle.destination || driver?.destination || 'Logistics Checkpoint Hub',
    pct: vehicle.status === 'driving' ? 65 : 100,
  };
  const corridorPct = vehicle.status === 'driving' ? `${corridorInfo.pct}%` : '100%';

  // If panel is collapsed, render a sleek docked vertical tab on the right
  if (isCollapsed) {
    return (
      <aside
        className="live-vehicle-detail-panel collapsed"
        id="liveVehicleDetailPanel"
        onClick={() => setIsCollapsed(false)}
        title={`Click to open ${vehicle.plate} Details`}
      >
        <button
          type="button"
          className="btn-expand-detail-tab"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
          title={`Expand ${vehicle.plate} Details`}
        >
          <span className="expand-chevron">◀</span>
          <span className={`expand-dot ${pillClass}`}></span>
          <span className="expand-plate-vertical">{vehicle.plate}</span>
        </button>
      </aside>
    );
  }

  const sourceBadgeText =
    vehicle.source === 'sim'
      ? '📶 Telecom SIM LBS'
      : vehicle.source === 'gps'
        ? '🛰️ GPS Device'
        : '📱 Driver App GPS';

  const initials = driver
    ? driver.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const distanceVal =
    timeframe === 'today'
      ? vehicle.distanceToday || 120
      : timeframe === 'week'
        ? (vehicle.distanceToday || 120) * 4.2
        : (vehicle.distanceToday || 120) * 16.5;

  const handleStartSimTrip = () => {
    adminStartSimTrip(vehicle.id);
  };

  const handleEndSimTrip = () => {
    adminEndSimTrip(vehicle.id);
  };

  const handlePingTower = () => {
    pingSimLbs(vehicle.id);
  };

  const handleSaveSimPhone = () => {
    if (phoneDraft.trim()) {
      updateVehicleSimPhone(vehicle.id, phoneDraft.trim());
      addToast(`Updated SIM phone for ${vehicle.plate}: ${phoneDraft.trim()}`, 'success');
    }
  };

  const handleInitiateConsent = () => {
    const cleanPhone = phoneDraft.trim();
    if (cleanPhone) {
      updateVehicleSimPhone(vehicle.id, cleanPhone);
    }
    initiateSimConsent(vehicle.id, cleanPhone);
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
  const simConsent = vehicle.simConsentStatus || 'none';
  const isButtonDriver = driver?.phoneType === 'button';
  const isSimMode = vehicle.source === 'sim';
  const isOptimalMatch = (isButtonDriver && isSimMode) || (!isButtonDriver && !isSimMode);

  return (
    <aside className="live-vehicle-detail-panel" id="liveVehicleDetailPanel">
      {/* Header */}
      <div className="detail-panel-header">
        <div className="detail-header-main">
          <div className="detail-title-row">
            <h3 className="detail-plate" id="detailPlate">
              {vehicle.plate}
            </h3>
            <span
              className={`detail-status-pill ${pillClass}`}
              id="detailStatusPill"
              style={
                pillClass === 'moving'
                  ? { backgroundColor: '#e0f2fe', color: '#0284c7' }
                  : pillClass === 'arrived'
                  ? { backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }
                  : undefined
              }
            >
              {pillText}
            </span>
          </div>

          <div className="detail-sub-header">
            <span className="detail-model" id="detailModel">
              {vehicle.model} · {vehicle.type}
            </span>
          </div>

          <div className="detail-tags-row">
            <span
              className={`source-badge ${vehicle.source}`}
              id="detailSourceBadge"
              onClick={() => setActiveTab('corridor')}
              title="Click to view tracking and consent options"
              style={{ cursor: 'pointer' }}
            >
              {sourceBadgeText}
            </span>
            <span className="detail-battery-pill" style={{ color: battColor }}>
              🔋 {batt}%
            </span>
          </div>
        </div>

        <div className="detail-header-actions">
          <button
            type="button"
            className="btn-collapse-detail"
            onClick={() => setIsCollapsed(true)}
            title="Collapse panel (Maximize Map)"
          >
            ❯
          </button>
          <button
            type="button"
            className="btn-close-detail"
            onClick={onClose || (() => setIsCollapsed(true))}
            title="Close details"
          >
            ✕
          </button>
        </div>
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
                {timeframe === 'today'
                  ? `Today · since ${driver?.onDutySince || '06:30'}`
                  : timeframe === 'week'
                    ? 'This Week'
                    : 'This Month'}
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

          {/* Unified Section: 4-Stats Grid + Journey Arc */}
          <div className="detail-stats-section">
            <div className="detail-stats-grid">
              <div className="stat-cell">
                <div className="stat-label">Speed</div>
                <div className="stat-value speed-highlight" id="detailSpeed">
                  {vehicle.speed > 0 ? `${vehicle.speed} km/h` : '—'}
                </div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">Last update</div>
                <div className="stat-value" id="detailLastUpdate">
                  {vehicle.lastSeen || 'Live now'}
                </div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">Driver phone battery</div>
                <div className="stat-value" id="detailBattery">
                  {batt}%
                </div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">GPS accuracy</div>
                <div className="stat-value" id="detailAccuracy">
                  {vehicle.accuracy || 12} m
                </div>
              </div>
            </div>

            {/* Starting Point, Current Location & Destination/ETA (Full Journey Arc) */}
            <div className="detail-locations-group">
              <div className="location-cell">
                <div className="stat-label">
                  Starting point · <span id="detailStartTime">{vehicle.startTime || '06:12'}</span>
                </div>
                <div className="stat-value location-val" id="detailStartLocation">
                  {vehicle.startLocation || 'Logistics Depot'}
                </div>
              </div>
              <div className="location-cell">
                <div className="stat-label">Current location</div>
                <div className="stat-value location-val" id="detailLocation">
                  {vehicle.currentLocation}
                </div>
              </div>
              <div className="location-cell">
                <div className="stat-label">
                  Destination &amp; ETA · <span id="detailEta">{vehicle.eta || '11:45 AM'}</span>
                </div>
                <div className="stat-value location-val destination-val" id="detailDestination">
                  {vehicle.destination || driver?.destination || 'Destination Hub'}{' '}
                  <span className="eta-rem-dist" id="detailRemainingDist">
                    ({vehicle.remainingDist || '24 km left'})
                  </span>
                </div>
              </div>
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
                  🛣️ <span id="detailCorridorTitle">{corridorInfo.name}</span>
                </span>
                <span className="corridor-pct" id="detailCorridorPct">
                  {corridorPct}
                </span>
              </div>
              <div className="corridor-progress-bar">
                <div
                  className="corridor-progress-fill"
                  id="detailCorridorFill"
                  style={{ width: corridorPct }}
                ></div>
              </div>
              <div className="corridor-checkpoint-row">
                <span className="corridor-sub">📍 Next Toll / Hub:</span>
                <span className="corridor-checkpoint-val" id="detailCheckpoint">
                  {corridorInfo.checkpoint}
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
                        : vehicle.destination || driver?.destination || corridorInfo.checkpoint}
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
              ) : isTripEnded && lastTrip ? (
                <>
                  <div className="trip-status-header">
                    <span className="trip-badge completed" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                      🏁 Trip Completed
                    </span>
                    <span className="trip-duration-live" style={{ color: '#059669', fontWeight: 600 }}>
                      Arrived {lastTrip.endTime}
                    </span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Arrived At:</span>
                    <span className="t-val" style={{ fontWeight: 600, color: '#0f172a' }}>
                      {lastTrip.endLocation || vehicle.currentLocation}
                    </span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Total Duration:</span>
                    <span className="t-val">{lastTrip.duration || '42m'}</span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Distance:</span>
                    <span className="t-val" style={{ color: '#2563eb', fontWeight: 600 }}>
                      {lastTrip.distance || `${vehicle.distanceToday || 38.5} km`}
                    </span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Total Halt:</span>
                    <span className="t-val" style={{ color: '#d97706', fontWeight: 600 }}>
                      {lastTrip.haltTime || '00:00'}
                    </span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Total Halt:</span>
                    <span className="t-val" style={{ color: '#d97706', fontWeight: 600 }}>
                      {lastTrip.haltTime || '00:00'}
                    </span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Next Status:</span>
                    <span className="t-val" style={{ color: '#059669', fontWeight: 600 }}>
                      ✅ Ready for Next Dispatch
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
                      {vehicle.haltReason || 'Break'})
                    </span>
                  </div>
                  <div className="trip-info-row">
                    <span className="t-label">Destination:</span>
                    <span className="t-val">{vehicle.destination || driver?.destination || corridorInfo.checkpoint}</span>
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
                    <span className="t-val">{lastTrip.endLocation || vehicle.currentLocation}</span>
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

          {/* SIM Dispatch & Trip Actions Box matching Transport_Digital_Twin */}
          <div className="detail-actions-box" id="detailActionsBox">
            {/* Header with Driver Handset Type */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tracking Mode
              </div>
              <span className={`tracking-device-badge ${isButtonDriver ? 'button' : 'smartphone'}`}>
                {isButtonDriver ? '📞 Keypad / Button Phone' : '📱 Smartphone (GPS)'}
              </span>
            </div>

            {/* Smart Context & Recommendation Banner */}
            <div className={`tracking-recommend-box ${isOptimalMatch ? 'match' : 'mismatch'}`}>
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{isOptimalMatch ? '💡' : '⚠️'}</span>
              <div>
                <strong>{isOptimalMatch ? 'Recommended Mode Active: ' : 'Mode Notice: '}</strong>
                {isButtonDriver
                  ? isSimMode
                    ? `Driver ${driver?.name || 'assigned'} uses a basic keypad phone (${driver?.device || 'Feature Phone'}). Triangulated via cellular carrier towers.`
                    : `Driver ${driver?.name || 'assigned'} uses a keypad phone without web apps. Switch to Telecom SIM LBS for carrier tracking.`
                  : !isSimMode
                    ? `Driver ${driver?.name || 'assigned'} has a smartphone. Tracking with high-precision satellite GPS via Driver Web/PWA Portal.`
                    : `Driver has a smartphone. You can switch to Smartphone App for real-time turn-by-turn map updates.`}
              </div>
            </div>

            {/* Segmented Switcher with Dual Subtitles */}
            <div className="tracking-mode-segmented" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f1f5f9', borderRadius: '8px', padding: '3px', gap: '4px', marginBottom: '10px' }}>
              <button
                type="button"
                className={`mode-segment-btn ${!isSimMode ? 'active' : ''}`}
                style={{
                  border: 'none',
                  padding: '7px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: !isSimMode ? '#ffffff' : 'transparent',
                  color: !isSimMode ? '#0f172a' : '#64748b',
                  boxShadow: !isSimMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
                onClick={() => switchVehicleTrackingMode(vehicle.id, 'app')}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 700 }}>📱 Smartphone App</span>
                <span style={{ fontSize: '9.5px', color: !isSimMode ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>Satellite GPS · Live Turn</span>
              </button>
              <button
                type="button"
                className={`mode-segment-btn ${isSimMode ? 'active' : ''}`}
                style={{
                  border: 'none',
                  padding: '7px 6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isSimMode ? '#ffffff' : 'transparent',
                  color: isSimMode ? '#0f172a' : '#64748b',
                  boxShadow: isSimMode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
                onClick={() => switchVehicleTrackingMode(vehicle.id, 'sim')}
              >
                <span style={{ fontSize: '11.5px', fontWeight: 700 }}>📶 Telecom SIM LBS</span>
                <span style={{ fontSize: '9.5px', color: isSimMode ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>Cellular Towers · Keypad</span>
              </button>
            </div>

            {isSimMode ? (
              <div className="sim-consent-card">
                <div className="sim-consent-header">
                  <div className="sim-consent-title-wrap">
                    <span className="sim-consent-icon">📶</span>
                    <span className="sim-consent-title">Telecom SIM LBS Consent</span>
                  </div>
                  <span className="sim-carrier-pill">DoT 56161</span>
                </div>

                <div className="sim-phone-input-wrap">
                  <span className="sim-country-prefix">+91</span>
                  <input
                    type="tel"
                    className="sim-phone-input"
                    value={phoneDraft.replace(/^\+91\s*/, '')}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={14}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s]/g, '');
                      setPhoneDraft('+91 ' + val.trim());
                    }}
                    onBlur={handleSaveSimPhone}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInitiateConsent();
                    }}
                    title="Driver SIM Phone Number"
                  />
                </div>

                <div className="sim-consent-btn-row">
                  <button
                    type="button"
                    className={`btn-initiate-consent ${simConsent === 'pending' ? 'resend' : ''}`}
                    onClick={handleInitiateConsent}
                  >
                    {simConsent === 'pending' ? '🔄 Resend Consent' : 'Initiate Consent'}
                  </button>
                  <button
                    type="button"
                    className="btn-check-status"
                    onClick={() => {
                      addToast(
                        simConsent === 'approved'
                          ? `🟢 DoT Consent Status: Active & Verified for ${vehicle.plate}`
                          : simConsent === 'pending'
                          ? `🟡 DoT Consent Status: Pending driver SMS reply YES to 56161`
                          : `⚪ DoT Consent Status: Not initiated`,
                        'info'
                      );
                    }}
                  >
                    Check Status
                  </button>
                </div>

                {simConsent === 'approved' ? (
                  <div className="sim-status-banner approved">
                    <div className="status-badge-row">
                      <span className="status-badge-title">🟢 Consent Approved & Active</span>
                      <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600 }}>SMS 'YES' Verified</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#065f46' }}>
                      Cellular tower triangulation active for <strong>{vehicle.simPhone || 'driver handset'}</strong>.
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ flex: 1, justifyContent: 'center', padding: '6px 8px', fontSize: '11.5px', fontWeight: 600 }}
                        onClick={handlePingTower}
                      >
                        📡 Ping Tower LBS
                      </button>
                      {vehicle.status !== 'driving' ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          style={{ flex: 1, justifyContent: 'center', padding: '6px 8px', fontSize: '11.5px', fontWeight: 600 }}
                          onClick={handleStartSimTrip}
                        >
                          ▶️ Start SIM Trip
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          style={{ flex: 1, justifyContent: 'center', padding: '6px 8px', fontSize: '11.5px', fontWeight: 600 }}
                          onClick={handleEndSimTrip}
                        >
                          🛑 End Trip
                        </button>
                      )}
                    </div>
                  </div>
                ) : simConsent === 'pending' ? (
                  <div className="sim-status-banner pending">
                    <div className="status-badge-row">
                      <span className="status-badge-title">🟡 DoT Consent Pending</span>
                      <button
                        type="button"
                        className="btn-open-sim-drawer"
                        onClick={() => openSimDrawer(vehicle.id)}
                        title="Simulate SMS reply on keypad phone simulator"
                      >
                        📱 Open Phone Sim
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#92400e' }}>
                      DoT SMS dispatched to <strong>{vehicle.simPhone || 'driver'}</strong>. Waiting for reply <code>YES</code> to <strong>56161</strong>.
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#78350f' }}>
                      💡 Click <strong>"Open Phone Sim"</strong> above to simulate driver receiving SMS and tapping "Reply YES".
                    </div>
                  </div>
                ) : simConsent === 'denied' ? (
                  <div className="sim-status-banner denied">
                    <div className="status-badge-row">
                      <span className="status-badge-title">🔴 Consent Declined</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#991b1b' }}>
                      Driver sent reply "NO" to 56161. Triangulation blocked per DoT privacy guidelines. Re-initiate if needed.
                    </div>
                  </div>
                ) : (
                  <div className="sim-status-banner none">
                    <div className="status-badge-row">
                      <span className="status-badge-title">⚪ Consent Not Initiated</span>
                      <button
                        type="button"
                        className="btn-open-sim-drawer"
                        onClick={() => openSimDrawer(vehicle.id)}
                        title="Preview handset simulator"
                      >
                        📱 Test Sim
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Enter 10-digit mobile number and click <strong>Initiate Consent</strong> to dispatch the DoT telecom verification SMS.
                    </div>
                  </div>
                )}

                <div className="dot-consent-notice">
                  ⚖️ <strong>DoT Compliance:</strong> Under DoT Telecommunications Order 2020, carrier SIM tracking without verifiable driver SMS consent is punishable.
                </div>
              </div>
            ) : (
              <div className="app-tracking-card">
                <div className="app-card-header">
                  <div className="app-card-title-wrap">
                    <span style={{ fontSize: '14px' }}>📱</span>
                    <span className="app-card-title">Smartphone Driver App</span>
                  </div>
                  <span className="app-status-badge">🟢 Satellite GPS</span>
                </div>

                <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                  Tracking uses device satellite GPS via Driver Web/PWA Portal. <em>No DoT telecom SMS consent required</em> because driver approves browser GPS permissions directly.
                </div>

                <div
                  className="app-phone-row"
                  style={{
                    background: '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '11.5px' }}>Assigned Driver & Phone:</span>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>
                    {driver?.name || 'Driver'} · {(driver && driver.phone) || vehicle.simPhone || 'Not assigned'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '7px 10px', fontWeight: 600, fontSize: '11.5px' }}
                    onClick={() => sendAppPortalLinkSms(vehicle.id)}
                  >
                    📲 Send App Link via SMS
                  </button>
                  <a
                    href={`/driver/?truck=${encodeURIComponent(vehicle.plate)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '7px 10px', fontWeight: 600, fontSize: '11.5px' }}
                  >
                    ↗️ Test Driver App
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
