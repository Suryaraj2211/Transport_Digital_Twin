export type VehicleType = 'Truck 28T' | 'Truck 16T' | 'LCV 7T' | 'LCV 3.5T';
export type TrackingSource = 'app' | 'sim' | 'gps';
export type VehicleStatus = 'driving' | 'halted' | 'offline';
export type PhoneType = 'smart' | 'button';
export type TripStatus = 'active' | 'completed';

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: VehicleType;
  source: TrackingSource;
  driverId: string;
  status: VehicleStatus;
  speed: number;
  currentLocation: string;
  lat: number;
  lng: number;
  battery: number;
  accuracy: number;
  lastSeen: string;
  distanceToday: number;
  route: Array<[number, number]>;
  haltReason?: string;
  haltSeconds?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  phoneType: PhoneType;
  device: string;
  assignedVehicle: string;
  destination: string;
  licence: string;
  licenceExpiry: string;
  onDutySince: string;
}

export interface Trip {
  id: string;
  tripNum: number;
  truckPlate: string;
  driverName: string;
  startTime: string;
  startLocation: string;
  endTime: string;
  endLocation: string;
  duration: string;
  durationSeconds: number;
  haltTime: string;
  haltSeconds: number;
  avgSpeed: string;
  distance: string;
  distanceNum: number;
  status: TripStatus;
}

export interface DriverProfile {
  vehicleId: string;
  plate: string;
  driverName: string;
  driverId: string;
  truckModel: string;
  speedLimit: number;
  startName: string;
  startCoords: [number, number];
  destName: string;
  destCoords: [number, number];
  routeInfo: string;
  corridorPoints: Array<[number, number]>;
}

export type FilterCategory = 'all' | 'moving' | 'halt' | 'offline';
export type MapTileType = 'satellite' | 'streets';

export interface SyncMessage {
  type: 'START_TRIP' | 'END_TRIP' | 'SPEED_UPDATE' | 'LOCATION_UPDATE' | 'HALT_UPDATE';
  vehicleId?: string;
  plate?: string;
  driverName?: string;
  startTime?: string;
  startLocation?: string;
  endTime?: string;
  endLocation?: string;
  duration?: string;
  distance?: string;
  avgSpeed?: string;
  speed?: number;
  lat?: number;
  lng?: number;
  locationName?: string;
  haltReason?: string;
  haltSeconds?: number;
  timestamp?: number;
}

