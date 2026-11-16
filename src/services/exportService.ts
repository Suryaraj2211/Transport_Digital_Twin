import { Trip } from '../types/fleet';

export function exportTripsToCsv(trips: Trip[]) {
  const headers = [
    'Trip #',
    'Truck Plate',
    'Driver Name',
    'Start Time',
    'Start Location',
    'End Time',
    'End Location',
    'Duration',
    'Halt Time',
    'Avg Speed',
    'Distance',
    'Status',
  ];

  const rows = trips.map((t) => [
    t.tripNum,
    `"${t.truckPlate.replace(/"/g, '""')}"`,
    `"${t.driverName.replace(/"/g, '""')}"`,
    `"${t.startTime}"`,
    `"${t.startLocation.replace(/"/g, '""')}"`,
    `"${t.endTime || '--'}"`,
    `"${(t.endLocation || '--').replace(/"/g, '""')}"`,
    `"${t.duration || '--'}"`,
    `"${t.haltTime || '00:00'}"`,
    `"${t.avgSpeed}"`,
    `"${t.distance}"`,
    `"${t.status.toUpperCase()}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `v3-logistics-trips-${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

