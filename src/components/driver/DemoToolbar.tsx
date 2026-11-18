import React, { useState } from 'react';
import { useDriver } from '../../context/DriverContext';

const CORRIDOR_LOCATIONS: Record<string, { name: string; lat: number; lng: number }> = {
  koyambedu: { name: '🏬 Koyambedu Freight Hub', lat: 13.0694, lng: 80.1948 },
  maduravoyal: { name: '🌉 Maduravoyal Junction', lat: 13.0645, lng: 80.1605 },
  vanagaram: { name: '📦 Vanagaram Logistics Hub', lat: 13.0538, lng: 80.1340 },
  poonamallee: { name: '🏭 Poonamallee Freight Depot', lat: 13.0480, lng: 80.1050 },
  porur: { name: '🛣️ Porur Toll Plaza', lat: 13.0350, lng: 80.1550 },
  ambattur: { name: '🏭 Ambattur Industrial Estate', lat: 13.0900, lng: 80.1600 },
};

export const DemoToolbar: React.FC = () => {
  const { setSpeedManual, setLocationManual } = useDriver();
  const [selectedLocKey, setSelectedLocKey] = useState<string>('vanagaram');

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
            <option value="vanagaram">📦 Vanagaram Logistics Hub</option>
            <option value="maduravoyal">🌉 Maduravoyal Junction</option>
            <option value="koyambedu">🏬 Koyambedu Freight Hub</option>
            <option value="poonamallee">🏭 Poonamallee Freight Depot</option>
            <option value="porur">🛣️ Porur Toll Plaza</option>
            <option value="ambattur">🏭 Ambattur Industrial Estate</option>
          </select>
        </div>
      </div>
    </details>
  );
};

