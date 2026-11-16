import React from 'react';
import { useDriver } from '../../context/DriverContext';

function formatHaltMm(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ShiftMetrics: React.FC = () => {
  const { tripsCompletedToday, totalHaltSeconds } = useDriver();

  return (
    <div className="stats-grid">
      <div className="stat-box">
        <div className="stat-value" id="statTrips">
          {tripsCompletedToday}
        </div>
        <div className="stat-label">Trips Completed Today</div>
      </div>
      <div className="stat-box">
        <div className="stat-value" id="statHalt">
          {formatHaltMm(totalHaltSeconds)}
        </div>
        <div className="stat-label">Total Halt Time</div>
      </div>
    </div>
  );
};

