import React from 'react';
import { useDriver } from '../../context/DriverContext';

export const TripActions: React.FC = () => {
  const { profile, isOnTrip, handleStartTrip, handleEndTrip } = useDriver();

  return (
    <>
      {/* Pre-Trip Assigned Vehicle Card */}
      {!isOnTrip && (
        <div className="truck-card" id="assignedTruckCard">
          <div className="card-label">Assigned Vehicle</div>
          <div className="truck-plate" id="truckPlate">
            {profile.plate}
          </div>
          <div className="truck-model" id="truckModel">
            {profile.truckModel}
          </div>
        </div>
      )}

      {/* Big Action Button */}
      <div className="main-action-wrap">
        <button
          type="button"
          className={`action-btn ${isOnTrip ? 'end' : 'start'}`}
          id="mainActionBtn"
          onClick={isOnTrip ? handleEndTrip : handleStartTrip}
        >
          <span className="action-icon">{isOnTrip ? '🛑' : '🟢'}</span>
          <span className="action-text">{isOnTrip ? 'END TRIP' : 'START TRIP'}</span>
        </button>
      </div>
    </>
  );
};

