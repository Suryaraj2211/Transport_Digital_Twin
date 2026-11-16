import React from 'react';
import { useDriver } from '../../context/DriverContext';

function formatHms(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const TripTelemetry: React.FC = () => {
  const {
    isOnTrip,
    tripStartTime,
    tripStartLocation,
    tripDurationSeconds,
    speed,
    tripDistanceKm,
    haltSeconds,
    haltReason,
    setHaltReasonManual,
  } = useDriver();

  if (!isOnTrip) return null;

  const isOverspeed = speed > 60;
  const isHalted = speed === 0;
  const gaugePercent = Math.min(100, Math.round((speed / 100) * 100));

  return (
    <div className="trip-panel" id="tripPanel">
      {/* Trip Start Info */}
      <div className="trip-info-card">
        <div className="card-label">Trip Started</div>
        <div className="trip-start-time" id="tripStartDisplay">
          {tripStartTime} at {tripStartLocation}
        </div>
      </div>

      {/* 3-COLUMN METRICS (DURATION · SPEED · DISTANCE) */}
      <div className="trip-metrics-grid-3">
        <div className="metric-card">
          <div className="card-label">Trip Time</div>
          <div className="metric-value" id="tripDuration">
            {formatHms(tripDurationSeconds)}
          </div>
          <div className="metric-sub">⏱️ Active</div>
        </div>

        <div className={`metric-card speed-card-compact ${isOverspeed ? 'overspeed-bg' : ''}`} id="speedCard">
          <div className="card-label">Current Speed</div>
          <div className="speed-compact-val">
            <span className="speed-number" id="speedNumber">
              {speed}
            </span>
            <span className="speed-unit">km/h</span>
            <span className="speed-limit-mini" title="Legal Highway Limit: 60 km/h">
              60
            </span>
          </div>
          <div className="speed-bar-track">
            <div
              className="speed-bar-fill"
              id="speedGaugeFill"
              style={{
                width: `${gaugePercent}%`,
                background: isOverspeed ? '#dc2626' : '#2563eb',
              }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="card-label">Distance</div>
          <div className="metric-value" style={{ color: '#2563eb' }}>
            <span id="tripLiveDistance">{tripDistanceKm.toFixed(2)}</span>
            <span className="metric-unit">km</span>
          </div>
          <div className="metric-sub">🛣️ Odometer</div>
        </div>
      </div>

      {/* Overspeed Warning Banner */}
      {isOverspeed && (
        <div className="overspeed-alert" id="overspeedAlert">
          ⚠️ OVERSPEED! Reduce speed under 60 km/h
        </div>
      )}

      {/* VEHICLE HALTED / REASON CHIPS */}
      {isHalted && (
        <div className="halt-card" id="haltCard">
          <div className="halt-header-row">
            <div className="halt-title">⏸️ Vehicle Halted</div>
            <div className="halt-timer" id="haltTimer">
              {formatHms(haltSeconds)}
            </div>
          </div>
          <span className="halt-reason-label">Quick select halt reason:</span>

          {/* Quick Touch-Friendly Reason Chips */}
          <div className="halt-pills-row" id="haltPillsRow">
            {[
              { id: 'toll', label: '🚧 Toll Plaza' },
              { id: 'loading', label: '📦 Loading/Unloading' },
              { id: 'tea', label: '☕ Tea Break' },
              { id: 'food', label: '🍱 Food Break' },
              { id: 'fuel', label: '⛽ Fuel Stop' },
              { id: 'traffic', label: '🚦 Traffic Jam' },
              { id: 'mechanical', label: '🔧 Tyre / Mechanical' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`halt-pill-btn ${haltReason === item.id ? 'active' : ''}`}
                onClick={() => setHaltReasonManual(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            className="halt-reason-select"
            id="haltReason"
            value={haltReason}
            onChange={(e) => setHaltReasonManual(e.target.value)}
          >
            <option value="">-- Select Reason --</option>
            <option value="toll">🚧 Toll Plaza</option>
            <option value="loading">📦 Loading / Unloading</option>
            <option value="tea">☕ Tea Break</option>
            <option value="food">🍽️ Food Break</option>
            <option value="fuel">⛽ Fuel Stop</option>
            <option value="mechanical">🔧 Mechanical Issue</option>
            <option value="traffic">🚦 Traffic</option>
            <option value="rest">😴 Rest Break</option>
          </select>
        </div>
      )}
    </div>
  );
};

