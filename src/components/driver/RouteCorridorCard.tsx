import React from 'react';
import { useDriver } from '../../context/DriverContext';

export const RouteCorridorCard: React.FC = () => {
  const { profile } = useDriver();

  return (
    <div className="route-corridor-card">
      <div className="route-leg">
        <span className="route-dot start"></span>
        <div className="route-text">
          <span className="route-lbl">START</span>
          <span className="route-name" id="routeStartName">
            {profile.startName}
          </span>
        </div>
      </div>
      <div className="route-arrow-icon">➔</div>
      <div className="route-leg">
        <span className="route-dot dest"></span>
        <div className="route-text">
          <span className="route-lbl">DESTINATION</span>
          <span className="route-name" id="routeDestName">
            {profile.destName}
          </span>
        </div>
      </div>
    </div>
  );
};

