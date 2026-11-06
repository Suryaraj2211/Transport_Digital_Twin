export type OperationalStatus = 'AVAILABLE' | 'ON_TRIP' | 'UNDER_MAINTENANCE' | 'IMPOUNDED';

export type TelematicsStatus = 'moving' | 'idle' | 'offline';

export type TrackingMode = 
  | 'SMARTPHONE_GPS'
  | 'HARDWARE_GPS_STANDARD'
  | 'HARDWARE_GPS_AIS140'
  | 'SIM_CELLULAR_LBS'
  | 'FASTAG_RFID_PLAZA'
  | 'IVR_KEYPAD_CHECKIN'
  | 'MANUAL_CHECKPOINT';

export type CommunicationChannel = 
  | 'SMARTPHONE_APP'
  | 'KEYPAD_FEATURE_PHONE_SMS'
  | 'KEYPAD_FEATURE_PHONE_IVR'
  | 'SHARED_CABIN_TABLET';

export type DriverDutyStatus = 'OFF_DUTY' | 'ON_DUTY_AVAILABLE' | 'ON_DUTY_EN_ROUTE';

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  type: string;
  year: number;
  chassisNumber?: string;
  engineNumber?: string;
  payloadCapacityTonnes: number;
  tankCapacityLitres: number;
  fuelType: 'Diesel' | 'CNG' | 'LNG' | 'Electric';
  driverId: string;
  status: TelematicsStatus;
  operationalStatus: OperationalStatus;
  activeTrackingMode: TrackingMode;
  speed: number;
  lastSeen: string;
  location: string;
  since: string;
  battery: string;
  accuracy: string;
  odometer: number;
  km: {
    today: number;
    week: number;
    month: number;
  };
  trail: [number, number][] | null;
  documents?: {
    rcExpiry: string;
    fcExpiry: string;
    insuranceExpiry: string;
    permitExpiry: string;
    pucExpiry: string;
  };
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licence: string;
  licenceClasses?: string[];
  expiry: string;
  soon: boolean;
  dutyStatus: DriverDutyStatus;
  preferredChannel: CommunicationChannel;
  preferredLanguage: string;
  dailyBata: number;
  safetyScore: number;
  totalTrips: number;
  aadhaarMasked?: string;
  assignedVehicleId?: string;
}

export interface AssignmentHistory {
  id: string;
  vid: string;
  plate: string;
  did: string;
  driver: string;
  from: string;
  to: string; // 'Current' or date
  channel: 'PUSH_NOTIFICATION' | 'IVR_VOICE_CALL' | 'TWO_WAY_SMS' | 'DIRECT_ADMIN';
  status: 'ACTIVE' | 'TERMINATED' | 'REJECTED';
}

export interface FleetStats {
  totalVehicles: number;
  movingCount: number;
  idleCount: number;
  offlineCount: number;
  fleetDistanceToday: number;
  totalDrivers: number;
  onDutyDrivers: number;
  documentsExpiringSoon: number;
}
