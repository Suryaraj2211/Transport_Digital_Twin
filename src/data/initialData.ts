import { Vehicle, Driver, Trip, DriverProfile } from '../types/fleet';

function formatTodayAt(hours: number, minutes: number): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export interface FleetCorridor {
  points: Array<[number, number]>;
  targetIndex: number;
  direction: number;
}

export const FLEET_CORRIDORS: Record<string, FleetCorridor> = {
  v1: {
    points: [
      [13.0694, 80.1948], // Koyambedu Central Freight Hub
      [13.0645, 80.1605], // Maduravoyal Flyover
      [13.0538, 80.1340], // Vanagaram Junction
      [13.0460, 80.1050], // Poonamallee Entry
      [13.0440, 80.0880], // Poonamallee Bypass (NH 48)
      [13.0360, 80.0550], // Nazarathpet Outer Ring
      [13.0240, 80.0220], // Chembarambakkam North Bypass (NH 48)
      [13.0125, 79.9950], // Pappanchatram Toll
      [12.9980, 79.9730], // Irungattukottai SIPCOT
      [12.9890, 79.9550], // Pennalur Flyover
      [12.9818, 79.9442], // Sriperumbudur Logistics Hub
    ],
    targetIndex: 8,
    direction: 1,
  },
  v2: {
    points: [
      [12.9249, 80.1200], // Tambaram GST Road
      [12.8400, 80.0600], // Maraimalai Nagar Industrial Corridor
      [12.7900, 80.0200], // Singaperumal Koil Bypass
      [12.7450, 80.0000], // Paranur Toll Plaza
      [12.7000, 79.9800], // Chengalpattu Toll Plaza
      [12.6600, 79.9600], // Palur Bypass NH 32
      [12.6200, 79.9400], // Madurantakam North Corridor
    ],
    targetIndex: 5,
    direction: 1,
  },
  v3: {
    points: [
      [12.9818, 79.9442], // Sriperumbudur West
      [12.9150, 79.8400], // Damal Junction NH 48
      [12.8700, 79.7700], // Enathur Bypass
      [12.8350, 79.7000], // Kanchipuram Freight Bypass
      [12.8050, 79.6200], // Ocheri Highway
      [12.7750, 79.5400], // Ranipet Logistics Terminal
    ],
    targetIndex: 4,
    direction: 1,
  },
  v4: {
    points: [
      [13.1400, 79.9100], // Tiruvallur Industrial Hub NH 716
      [13.1250, 80.0200], // Thirumazhisai Freight Corridor
      [13.1150, 80.0900], // Poonamallee Bypass
      [13.1000, 80.1600], // Maduravoyal Cloverleaf Interchange
      [13.0800, 80.2000], // Koyambedu Wholesale Terminal
    ],
    targetIndex: 1,
    direction: 1,
  },
  v5: {
    points: [
      [13.2900, 80.2600], // Minjur Logistics Hub (Outer Ring Road)
      [13.2300, 80.2600], // Ennore North Port Expressway
      [13.1700, 80.2600], // Manali Oil Refinery & Chemical Bay
      [13.1300, 80.2100], // Madhavaram Container Terminal
      [13.0900, 80.1600], // Ambattur Industrial Corridor
    ],
    targetIndex: 1,
    direction: 1,
  },
  v6: {
    points: [
      [13.0350, 80.1550], // Porur Toll Plaza (Chennai Bypass NH 48)
      [13.0550, 80.1580], // Vanagaram Industrial Corridor
      [13.0650, 80.1600], // Maduravoyal Cloverleaf Interchange
      [13.0900, 80.1600], // Ambattur Industrial Estate North Bay
      [13.1250, 80.1650], // Madhavaram / Red Hills Freight Terminal
    ],
    targetIndex: 4,
    direction: 1,
  },
};

export const INITIAL_VEHICLES: Record<string, Vehicle> = {
  v1: {
    id: 'v1',
    plate: 'TN 09 AB 1234',
    model: 'Tata Prima 4028.S',
    type: 'Truck 28T',
    source: 'app',
    driverId: 'd1',
    status: 'halted',
    speed: 0,
    currentLocation: 'NH 48, Sriperumbudur Logistics Hub',
    lat: 12.9818,
    lng: 79.9442,
    battery: 88,
    accuracy: 12,
    lastSeen: '8 s ago',
    distanceToday: 214.5,
    route: [
      [13.0694, 80.1948],
      [13.0450, 80.1500],
      [13.0400, 80.0800],
      [13.0100, 80.0200],
      [12.9818, 79.9442],
    ],
  },
  v2: {
    id: 'v2',
    plate: 'TN 22 CD 5678',
    model: 'Ashok Leyland 2820',
    type: 'Truck 28T',
    source: 'app',
    driverId: 'd2',
    status: 'driving',
    speed: 46,
    currentLocation: 'GST Road, Chengalpattu Toll Plaza',
    lat: 12.7000,
    lng: 79.9800,
    battery: 74,
    accuracy: 15,
    lastSeen: '5 s ago',
    distanceToday: 168.0,
    route: [
      [12.9249, 80.1200],
      [12.8400, 80.0600],
      [12.7900, 80.0200],
      [12.7450, 80.0000],
      [12.7000, 79.9800],
    ],
  },
  v3: {
    id: 'v3',
    plate: 'KA 01 EF 9012',
    model: 'Eicher Pro 6028',
    type: 'Truck 28T',
    source: 'app',
    driverId: 'd3',
    status: 'driving',
    speed: 52,
    currentLocation: 'NH 48, Kanchipuram Freight Bypass',
    lat: 12.8350,
    lng: 79.7000,
    battery: 92,
    accuracy: 8,
    lastSeen: '3 s ago',
    distanceToday: 248.4,
    route: [
      [12.9818, 79.9442],
      [12.9150, 79.8400],
      [12.8700, 79.7700],
      [12.8350, 79.7000],
    ],
  },
  v4: {
    id: 'v4',
    plate: 'TN 38 GH 3456',
    model: 'Mahindra Furio 7',
    type: 'LCV 7T',
    source: 'sim',
    driverId: 'd4',
    status: 'halted',
    speed: 0,
    currentLocation: 'NH 716, Tiruvallur Industrial Hub',
    lat: 13.1400,
    lng: 79.9100,
    battery: 65,
    accuracy: 20,
    lastSeen: 'Stopped · 2 min ago',
    distanceToday: 98.7,
    route: [
      [13.1000, 80.1600],
      [13.1150, 80.0900],
      [13.1250, 80.0200],
      [13.1400, 79.9100],
    ],
    haltReason: 'Unloading Bay',
    haltSeconds: 600,
  },
  v5: {
    id: 'v5',
    plate: 'AP 39 JK 7788',
    model: 'BharatBenz 3128',
    type: 'Truck 28T',
    source: 'sim',
    driverId: 'd5',
    status: 'offline',
    speed: 0,
    currentLocation: 'Ennore Port Expressway, Minjur Logistics Hub',
    lat: 13.2900,
    lng: 80.2600,
    battery: 12,
    accuracy: 35,
    lastSeen: 'No signal · last seen 42 min ago',
    distanceToday: 187.3,
    route: [
      [13.1700, 80.2600],
      [13.2300, 80.2600],
      [13.2900, 80.2600],
    ],
  },
  v6: {
    id: 'v6',
    plate: 'TN 07 LM 2468',
    model: 'Tata Signa 4825',
    type: 'Truck 28T',
    source: 'app',
    driverId: 'd6',
    status: 'driving',
    speed: 48,
    currentLocation: 'Chennai Bypass, Ambattur Industrial Estate',
    lat: 13.0900,
    lng: 80.1600,
    battery: 81,
    accuracy: 14,
    lastSeen: '6 s ago',
    distanceToday: 82.5,
    route: [
      [13.0350, 80.1550],
      [13.0550, 80.1580],
      [13.0650, 80.1600],
      [13.0900, 80.1600],
    ],
  },
};

export const INITIAL_DRIVERS: Record<string, Driver> = {
  d1: {
    id: 'd1',
    name: 'Murugan K',
    phone: '+91 98401 23456',
    phoneType: 'smart',
    device: 'Samsung Galaxy M14 (App GPS)',
    assignedVehicle: 'v1',
    destination: 'Sriperumbudur Industrial Hub',
    licence: 'TN01 20210001234',
    licenceExpiry: '2027-03-15',
    onDutySince: '06:15',
  },
  d2: {
    id: 'd2',
    name: 'Selvam R',
    phone: '+91 98402 34567',
    phoneType: 'smart',
    device: 'Redmi Note 12 (App GPS)',
    assignedVehicle: 'v2',
    destination: 'Chengalpattu Logistics Bay',
    licence: 'TN22 20200005678',
    licenceExpiry: '2026-08-22',
    onDutySince: '06:30',
  },
  d3: {
    id: 'd3',
    name: 'Imran Pasha',
    phone: '+91 98403 45678',
    phoneType: 'smart',
    device: 'OnePlus Nord CE (App GPS)',
    assignedVehicle: 'v3',
    destination: 'Kanchipuram Freight Bypass',
    licence: 'KA01 20210009012',
    licenceExpiry: '2028-05-18',
    onDutySince: '05:00',
  },
  d4: {
    id: 'd4',
    name: 'Ravi Kumar',
    phone: '+91 98404 56789',
    phoneType: 'button',
    device: 'Nokia 105 (Keypad Phone · Airtel SIM)',
    assignedVehicle: 'v4',
    destination: 'Tiruvallur Industrial Freight Hub',
    licence: 'TN38 20220003456',
    licenceExpiry: '2028-01-10',
    onDutySince: '07:10',
  },
  d5: {
    id: 'd5',
    name: 'Venkatesh P',
    phone: '+91 98405 67890',
    phoneType: 'button',
    device: 'Samsung Guru 1200 (Keypad · Jio SIM)',
    assignedVehicle: 'v5',
    destination: 'Ennore / Minjur North Port Hub',
    licence: 'AP39 20210007788',
    licenceExpiry: '2029-06-15',
    onDutySince: '05:40',
  },
  d6: {
    id: 'd6',
    name: 'Anbu Selvan',
    phone: '+91 98406 78901',
    phoneType: 'smart',
    device: 'Vivo Y20 (App GPS)',
    assignedVehicle: 'v6',
    destination: 'Ambattur / Madhavaram Freight Hub',
    licence: 'TN07 20200002468',
    licenceExpiry: '2027-11-20',
    onDutySince: '07:45',
  },
};

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    tripNum: 1,
    truckPlate: 'TN 09 AB 1234',
    driverName: 'Murugan K',
    startTime: formatTodayAt(6, 12),
    startLocation: 'Koyambedu Logistics Yard',
    endTime: formatTodayAt(8, 45),
    endLocation: 'Sriperumbudur Depot',
    duration: '2h 33m',
    durationSeconds: 9180,
    haltTime: '15m 00s',
    haltSeconds: 900,
    avgSpeed: '52 km/h',
    distance: '128.4 km',
    distanceNum: 128.4,
    status: 'completed',
  },
  {
    id: 'trip-2',
    tripNum: 2,
    truckPlate: 'TN 22 CD 5678',
    driverName: 'Selvam R',
    startTime: formatTodayAt(6, 40),
    startLocation: 'Tambaram Depot',
    endTime: formatTodayAt(9, 10),
    endLocation: 'Chengalpattu Toll Plaza',
    duration: '2h 30m',
    durationSeconds: 9000,
    haltTime: '8m 00s',
    haltSeconds: 480,
    avgSpeed: '48 km/h',
    distance: '112.6 km',
    distanceNum: 112.6,
    status: 'completed',
  },
  {
    id: 'trip-3',
    tripNum: 3,
    truckPlate: 'TN 38 GH 3456',
    driverName: 'Ravi Kumar',
    startTime: formatTodayAt(7, 15),
    startLocation: 'Ambattur North Depot',
    endTime: formatTodayAt(8, 50),
    endLocation: 'Tiruvallur Industrial Hub',
    duration: '1h 35m',
    durationSeconds: 5700,
    haltTime: '10m 00s',
    haltSeconds: 600,
    avgSpeed: '42 km/h',
    distance: '46.5 km',
    distanceNum: 46.5,
    status: 'completed',
  },
  {
    id: 'trip-4',
    tripNum: 4,
    truckPlate: 'AP 39 JK 7788',
    driverName: 'Venkatesh P',
    startTime: formatTodayAt(5, 45),
    startLocation: 'Manali Freight Yard',
    endTime: formatTodayAt(7, 20),
    endLocation: 'Minjur Logistics Hub',
    duration: '1h 35m',
    durationSeconds: 5700,
    haltTime: '5m 00s',
    haltSeconds: 300,
    avgSpeed: '45 km/h',
    distance: '48.0 km',
    distanceNum: 48.0,
    status: 'completed',
  },
  {
    id: 'trip-5',
    tripNum: 5,
    truckPlate: 'TN 09 AB 1234',
    driverName: 'Murugan K',
    startTime: formatTodayAt(9, 30),
    startLocation: 'Poonamallee Bypass (NH 48)',
    endTime: '--',
    endLocation: 'In Transit',
    duration: '1h 14m',
    durationSeconds: 4440,
    haltTime: '00:00',
    haltSeconds: 0,
    avgSpeed: '56 km/h',
    distance: '42.5 km',
    distanceNum: 42.5,
    status: 'active',
  },
];

export const DRIVER_PROFILES: Record<string, DriverProfile> = {
  d1: {
    vehicleId: 'v1',
    plate: 'TN 09 AB 1234',
    driverName: 'Murugan K',
    driverId: 'd1',
    truckModel: 'Tata Prima 4028.S · Heavy 28T',
    speedLimit: 60,
    startName: 'Chennai Central Freight Corridor',
    startCoords: [13.0694, 80.1948],
    destName: 'Sriperumbudur Logistics Hub (NH 48)',
    destCoords: [12.9818, 79.9442],
    routeInfo: 'via NH 48 · 29 km · ~40 min',
    corridorPoints: [
      [13.0694, 80.1948],
      [13.0645, 80.1605],
      [13.0538, 80.1340],
      [13.0460, 80.1050],
      [13.0440, 80.0880],
      [13.0360, 80.0550],
      [13.0240, 80.0220],
      [13.0125, 79.9950],
      [12.9980, 79.9730],
      [12.9890, 79.9550],
      [12.9818, 79.9442],
    ],
  },
  d2: {
    vehicleId: 'v2',
    plate: 'TN 22 CD 5678',
    driverName: 'Selvam R',
    driverId: 'd2',
    truckModel: 'Ashok Leyland 2820 · Heavy 28T',
    speedLimit: 60,
    startName: 'Tambaram GST Freight Yard',
    startCoords: [12.9249, 80.1200],
    destName: 'Chengalpattu Logistics Terminal (NH 32)',
    destCoords: [12.7000, 79.9800],
    routeInfo: 'via GST Road (NH 32) · 28 km · ~38 min',
    corridorPoints: [
      [12.9249, 80.1200],
      [12.9050, 80.0950],
      [12.8850, 80.0800],
      [12.8450, 80.0600],
      [12.8000, 80.0350],
      [12.7650, 80.0150],
      [12.7300, 79.9950],
      [12.7000, 79.9800],
    ],
  },
  d3: {
    vehicleId: 'v3',
    plate: 'KA 01 EF 9012',
    driverName: 'Imran Pasha',
    driverId: 'd3',
    truckModel: 'Eicher Pro 6028 · Heavy 28T',
    speedLimit: 60,
    startName: 'Sriperumbudur West Terminal',
    startCoords: [12.9818, 79.9442],
    destName: 'Kanchipuram Freight Bypass (NH 48)',
    destCoords: [12.8350, 79.7000],
    routeInfo: 'via NH 48 Express · 32 km · ~42 min',
    corridorPoints: [
      [12.9818, 79.9442],
      [12.9650, 79.8800],
      [12.9350, 79.8400],
      [12.8950, 79.7750],
      [12.8650, 79.7350],
      [12.8350, 79.7000],
    ],
  },
  d6: {
    vehicleId: 'v6',
    plate: 'TN 07 LM 2468',
    driverName: 'Anbu Selvan',
    driverId: 'd6',
    truckModel: 'Tata Signa 4825 · Heavy 28T',
    speedLimit: 60,
    startName: 'Porur Toll Plaza (Chennai Bypass)',
    startCoords: [13.0350, 80.1550],
    destName: 'Ambattur Industrial Estate North Bay',
    destCoords: [13.0900, 80.1600],
    routeInfo: 'via Chennai Bypass · 8 km · ~12 min',
    corridorPoints: [
      [13.0350, 80.1550],
      [13.0520, 80.1580],
      [13.0645, 80.1605],
      [13.0800, 80.1620],
      [13.0900, 80.1600],
    ],
  },
};
