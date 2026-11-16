import React, { useState } from 'react';
import { useDriver } from '../../context/DriverContext';

const CORRIDOR_LOCATIONS: Record<string, { name: string; lat: number; lng: number }> = {
  chennai_port: { name: '⚓ Chennai Port Terminal', lat: 13.0850, lng: 80.2980 },
  sriperumbudur: { name: '🏭 Sriperumbudur Hub', lat: 12.9818, lng: 79.9442 },
  hosur: { name: '📦 Hosur SIPCOT Logistics', lat: 12.7409, lng: 77.8253 },
  coimbatore: { name: '🏢 Coimbatore Depot', lat: 11.0168, lng: 76.9558 },
};

export const DemoToolbar: React.FC = () => {
  const { setSpeedManual, setLocationManual } = useDriver();
  const [selectedLocKey, setSelectedLocKey] = useState<string>('chennai_port');

  const handleLocationChange = (key: string) => {
    setSelectedLocKey(key);
    if (key === 'real') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setLocationManual('🛰️ Auto Device GPS', pos.coords.latitude, pos.coords.longitude);
        });
      }
    } else {
      const target = CORRIDOR_LOCATIONS[key];
      if (target) {
        setLocationManual(target.name, target.lat, target.lng);
      }
    }
  };

  return (
    <details className="demo-drawer">
      <summary className="demo-summary">
        <span>🛠️ Testing & Speed Simulation Controls</span>
        <span style={{ fontSize: '10px', color: '#64748b' }}>Tap to toggle ▾</span>
      </summary>
      <div className="demo-content">
        <div className="demo-buttons">
          <button type="button" className="demo-btn drive" onClick={() => setSpeedManual(55)}>
            🚗 Drive 55
          </button>
          <button type="button" className="demo-btn overspeed" onClick={() => setSpeedManual(72)}>
            ⚡ Overspeed 72
          </button>
          <button type="button" className="demo-btn stop" onClick={() => setSpeedManual(0)}>
            🛑 Stop
          </button>
        </div>
        <div className="demo-loc-row">
          <span className="demo-loc-label">📍 Test Corridor:</span>
          <select
            id="demoLocationSelect"
            className="demo-loc-select"
            value={selectedLocKey}
            onChange={(e) => handleLocationChange(e.target.value)}
          >
            <option value="real">🛰️ Auto Device GPS</option>
            <option value="chennai_port">⚓ Chennai Port Terminal</option>
            <option value="sriperumbudur">🏭 Sriperumbudur Hub</option>
            <option value="hosur">📦 Hosur SIPCOT Logistics</option>
            <option value="coimbatore">🏢 Coimbatore Depot</option>
          </select>
        </div>
      </div>
    </details>
  );
};

