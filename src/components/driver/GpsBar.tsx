import React, { useState } from 'react';
import { useDriver } from '../../context/DriverContext';

export const GpsBar: React.FC = () => {
  const { currentLocationName, currentLat, currentLng, setLocationManual, profile } = useDriver();
  const [testingGps, setTestingGps] = useState<boolean>(false);

  const handleTestGps = () => {
    if (navigator.geolocation) {
      setTestingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTestingGps(false);
          setLocationManual('Live Device GPS Locked', pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setTestingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const coordsDisplay = `${currentLocationName || 'Corridor GPS'} (${currentLat.toFixed(4)}°N, ${currentLng.toFixed(4)}°E)`;

  return (
    <div className="gps-bar locked" id="gpsBar" onClick={handleTestGps} title="Tap to refresh live device GPS location">
      <div className="gps-icon" id="gpsIcon">
        {testingGps ? '🔄' : '🛰️'}
      </div>
      <div className="gps-details">
        <div className="gps-status" id="gpsStatus">
          Corridor GPS Active ✓
        </div>
        <div className="gps-coords" id="gpsCoords">
          {coordsDisplay}
        </div>
        <div className="gps-accuracy" id="gpsAccuracy">
          Transport Corridor GPS · Tap to refresh
        </div>
      </div>
    </div>
  );
};

