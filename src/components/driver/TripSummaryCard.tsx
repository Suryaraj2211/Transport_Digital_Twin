import React from 'react';
import { useDriver } from '../../context/DriverContext';

export const TripSummaryCard: React.FC = () => {
  const { tripSummary } = useDriver();

  if (!tripSummary) return null;

  return (
    <div className="summary-card" id="tripSummary">
      <div className="summary-title">🏁 Trip Completed Summary</div>
      <div className="summary-row">
        <span className="summary-label">Start Point</span>
        <span className="summary-value" id="summaryStart">
          {tripSummary.start}
        </span>
      </div>
      <div className="summary-row">
        <span className="summary-label">End Point</span>
        <span className="summary-value" id="summaryEnd">
          {tripSummary.end}
        </span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Total Duration</span>
        <span className="summary-value" id="summaryDuration">
          {tripSummary.duration}
        </span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Distance Covered</span>
        <span className="summary-value" id="summaryDistance" style={{ color: '#2563eb' }}>
          {tripSummary.distance}
        </span>
      </div>
      <div className="summary-row">
        <span className="summary-label">Average Speed</span>
        <span className="summary-value" id="summaryAvgSpeed">
          {tripSummary.avgSpeed}
        </span>
      </div>
    </div>
  );
};

