import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { DRIVER_PROFILES, INITIAL_DRIVERS, INITIAL_VEHICLES, FLEET_CORRIDORS } from '../data/initialData';
import { DriverProfile, Driver, Vehicle } from '../types/fleet';

interface DriverSummary {
  start: string;
  end: string;
  duration: string;
  distance: string;
  avgSpeed: string;
}

interface DriverContextType {
  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;
  profiles: Record<string, DriverProfile>;
  profile: DriverProfile;
  isOnTrip: boolean;
  tripStartTime: string;
  tripStartLocation: string;
  tripDurationSeconds: number;
  speed: number;
  tripDistanceKm: number;
  kmToday: number;
  tripsCompletedToday: number;
  isHalted: boolean;
  haltSeconds: number;
  totalHaltSeconds: number;
  haltReason: string;
  tripSummary: DriverSummary | null;
  currentLat: number;
  currentLng: number;
  currentLocationName: string;
  handleStartTrip: () => void;
  handleEndTrip: () => void;
  setSpeedManual: (spd: number) => void;
  setHaltReasonManual: (reason: string) => void;
  setLocationManual: (name: string, lat: number, lng: number) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

const SYNC_CHANNEL_NAME = 'fleet-tracker-sync';
const FLEET_STORAGE_VERSION = 'v6_distinct_routes_chennai';

const loadStoredDrivers = (): Record<string, Driver> => {
  if (typeof window !== 'undefined') {
    try {
      const ver = localStorage.getItem('fleet_data_version');
      if (ver !== FLEET_STORAGE_VERSION) {
        return INITIAL_DRIVERS;
      }
      const stored = localStorage.getItem('fleet_drivers_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }
  return INITIAL_DRIVERS;
};

const loadStoredVehicles = (): Record<string, Vehicle> => {
  if (typeof window !== 'undefined') {
    try {
      const ver = localStorage.getItem('fleet_data_version');
      if (ver !== FLEET_STORAGE_VERSION) {
        return INITIAL_VEHICLES;
      }
      const stored = localStorage.getItem('fleet_vehicles_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          const firstV = Object.values(parsed)[0] as Vehicle;
          if (firstV && firstV.lat && (firstV.lat < 12.98 || firstV.lat > 13.15 || firstV.lng < 80.00 || firstV.lng > 80.25)) {
            return INITIAL_VEHICLES;
          }
          return parsed;
        }
      }
    } catch (e) {}
  }
  return INITIAL_VEHICLES;
};

const buildDriverProfiles = (
  rawDrivers: Record<string, Driver>,
  rawVehicles: Record<string, Vehicle>
): Record<string, DriverProfile> => {
  const result: Record<string, DriverProfile> = {};

  // Seed with base initial profiles only if the driver does NOT have a button phone
  Object.keys(DRIVER_PROFILES).forEach((k) => {
    const p = DRIVER_PROFILES[k];
    const d = rawDrivers[p.driverId];
    if (!d || d.phoneType !== 'button') {
      result[k] = { ...p };
    }
  });

  Object.values(rawDrivers).forEach((d) => {
    // Exclude Button Phone drivers! (Feature phones lack web browsers/apps; they track via Telecom SIM LBS)
    if (d.phoneType === 'button') {
      delete result[d.id];
      return;
    }

    const assignedV = d.assignedVehicle ? rawVehicles[d.assignedVehicle] : null;

    if (result[d.id]) {
      // PRESERVE the authentic startCoords, destCoords, startName, destName, and corridorPoints!
      const base = result[d.id];
      result[d.id] = {
        ...base,
        driverName: d.name,
        destName: d.destination || base.destName,
        plate: assignedV ? assignedV.plate : base.plate,
        truckModel: assignedV ? `${assignedV.model} · ${assignedV.type}` : base.truckModel,
        vehicleId: assignedV ? assignedV.id : base.vehicleId,
        corridorPoints: base.corridorPoints,
        startCoords: base.startCoords,
        destCoords: base.destCoords,
        startName: base.startName,
      };
    } else {
      // For any newly added driver, get road corridor from FLEET_CORRIDORS
      const corridor = assignedV && FLEET_CORRIDORS[assignedV.id] ? FLEET_CORRIDORS[assignedV.id].points : null;
      const corridorPoints: Array<[number, number]> = corridor || [
        [13.0694, 80.1948],
        [13.0538, 80.1340],
        [13.0240, 80.0220],
        [12.9818, 79.9442],
      ];
      const startCoords: [number, number] = corridorPoints[0];
      const destCoords: [number, number] = corridorPoints[corridorPoints.length - 1];
      const startName = (assignedV && assignedV.startLocation) || 'Central Freight Yard';
      const destName = d.destination || (assignedV && assignedV.destination) || 'Destination Freight Hub';

      result[d.id] = {
        driverId: d.id,
        driverName: d.name,
        vehicleId: assignedV ? assignedV.id : d.assignedVehicle || '',
        plate: assignedV ? assignedV.plate : d.assignedVehicle ? 'Truck ' + d.assignedVehicle : 'Unassigned Truck',
        truckModel: assignedV ? `${assignedV.model} · ${assignedV.type}` : 'Freight Carrier',
        speedLimit: 60,
        startName,
        startCoords,
        destName,
        destCoords,
        routeInfo: assignedV ? `Corridor · ${assignedV.plate}` : 'Active Delivery Corridor',
        corridorPoints,
      };
    }
  });

  return result;
};

export const DriverProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [driversMap, setDriversMap] = useState<Record<string, Driver>>(loadStoredDrivers);
  const [vehiclesMap, setVehiclesMap] = useState<Record<string, Vehicle>>(loadStoredVehicles);

  // Sync with Admin portal in real-time across tabs/windows
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
      bc.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'DRIVERS_UPDATED' && data.drivers) {
          setDriversMap(data.drivers);
        } else if (data.type === 'VEHICLES_UPDATED' && data.vehicles) {
          setVehiclesMap(data.vehicles);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'fleet_drivers_data' && e.newValue) {
        try {
          setDriversMap(JSON.parse(e.newValue));
        } catch (err) {}
      } else if (e.key === 'fleet_vehicles_data' && e.newValue) {
        try {
          setVehiclesMap(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const profiles = useMemo(
    () => buildDriverProfiles(driversMap, vehiclesMap),
    [driversMap, vehiclesMap]
  );

  const getInitialProfileId = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const truckParam = params.get('truck');
      const driverParam = params.get('driver');
      const initialMap = buildDriverProfiles(loadStoredDrivers(), loadStoredVehicles());
      if (truckParam) {
        const found = Object.values(initialMap).find(
          (p) => p.plate.toLowerCase() === truckParam.toLowerCase()
        );
        if (found) return found.driverId;
      }
      if (driverParam && initialMap[driverParam]) {
        return driverParam;
      }
      return Object.keys(initialMap)[0] || 'd1';
    }
    return 'd1';
  };

  const [selectedProfileId, setSelectedProfileId] = useState<string>(getInitialProfileId);
  const profile = profiles[selectedProfileId] || Object.values(profiles)[0];

  const [isOnTrip, setIsOnTrip] = useState<boolean>(false);
  const [tripStartTime, setTripStartTime] = useState<string>('');
  const [tripStartLocation, setTripStartLocation] = useState<string>(profile.startName);
  const [tripDurationSeconds, setTripDurationSeconds] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [tripDistanceKm, setTripDistanceKm] = useState<number>(0);
  const [kmToday, setKmToday] = useState<number>(0);
  const [tripsCompletedToday, setTripsCompletedToday] = useState<number>(0);

  const [isHalted, setIsHalted] = useState<boolean>(false);
  const [haltSeconds, setHaltSeconds] = useState<number>(0);
  const [totalHaltSeconds, setTotalHaltSeconds] = useState<number>(0);
  const [haltReason, setHaltReason] = useState<string>('');
  const [tripSummary, setTripSummary] = useState<DriverSummary | null>(null);
  const waypointIdxRef = useRef<number>(0);

  const [currentLat, setCurrentLat] = useState<number>(profile.startCoords[0]);
  const [currentLng, setCurrentLng] = useState<number>(profile.startCoords[1]);
  const [currentLocationName, setCurrentLocationName] = useState<string>(profile.startName);

  // Ensure selectedProfileId is always a valid smartphone profile
  useEffect(() => {
    if (!profiles[selectedProfileId] && Object.keys(profiles).length > 0) {
      setSelectedProfileId(Object.keys(profiles)[0]);
    }
  }, [profiles, selectedProfileId]);

  // When profile switches, update initial route coords
  useEffect(() => {
    if (!isOnTrip && profile) {
      setCurrentLat(profile.startCoords[0]);
      setCurrentLng(profile.startCoords[1]);
      setCurrentLocationName(profile.startName);
      setTripStartLocation(profile.startName);
    }
  }, [profile?.driverId, profile?.vehicleId, isOnTrip]);

  const sendSync = useCallback(
    (action: string, extraData: any = {}) => {
      const payload = {
        type: 'DRIVER_ACTION',
        action,
        vehicleId: profile.vehicleId,
        plate: profile.plate,
        driverName: profile.driverName,
        lat: currentLat,
        lng: currentLng,
        timestamp: Date.now(),
        ...extraData,
      };

      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
          bc.postMessage(payload);
          bc.close();
        }
        localStorage.setItem(`fleet_driver_${profile.vehicleId}_sync`, JSON.stringify(payload));
        localStorage.setItem('fleet_sync_event', JSON.stringify(payload));
      } catch (err) {
        console.warn('Sync failed:', err);
      }
    },
    [profile, currentLat, currentLng]
  );

  const handleStartTrip = useCallback(() => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsOnTrip(true);
    setTripStartTime(timeNow);
    setTripStartLocation(currentLocationName);
    setTripDurationSeconds(0);
    setTripDistanceKm(0);
    setSpeed(45);
    setIsHalted(false);
    setHaltSeconds(0);
    setHaltReason('');
    setTripSummary(null);
    setTotalHaltSeconds(0);
    waypointIdxRef.current = 0; // Reset corridor waypoint index

    sendSync('START_TRIP', {
      startTime: timeNow,
      startLocation: currentLocationName,
      speed: 45,
    });
  }, [currentLocationName, sendSync]);

  const handleEndTrip = useCallback(() => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const h = Math.floor(tripDurationSeconds / 3600);
    const m = Math.floor((tripDurationSeconds % 3600) / 60);
    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m ${tripDurationSeconds % 60}s`;

    const avg = tripDurationSeconds > 0 ? Math.round((tripDistanceKm / (tripDurationSeconds / 3600)) || 45) : 45;

    const summary: DriverSummary = {
      start: tripStartLocation,
      end: profile.destName,
      duration: durationStr,
      distance: `${tripDistanceKm.toFixed(2)} km`,
      avgSpeed: `${avg} km/h`,
    };

    setTripSummary(summary);
    setIsOnTrip(false);
    setSpeed(0);
    setIsHalted(false);
    setTripsCompletedToday((prev) => prev + 1);
    setKmToday((prev) => +(prev + tripDistanceKm).toFixed(1));

    sendSync('END_TRIP', {
      endTime: timeNow,
      endLocation: profile.destName,
      duration: durationStr,
      distanceKm: tripDistanceKm,
      distance: tripDistanceKm.toFixed(2),
      avgSpeed: avg,
      haltSeconds: totalHaltSeconds,
      haltReason,
    });
  }, [
    tripDurationSeconds,
    tripDistanceKm,
    tripStartLocation,
    profile,
    totalHaltSeconds,
    haltReason,
    sendSync,
  ]);

  const setSpeedManual = useCallback(
    (spd: number) => {
      setSpeed(spd);
      if (spd === 0) {
        setIsHalted(true);
        sendSync('HALT_UPDATE', {
          haltReason: haltReason || 'Stop',
          haltSeconds,
        });
      } else {
        setIsHalted(false);
      }
      sendSync('SPEED_UPDATE', {
        speed: spd,
        tripDistance: tripDistanceKm,
        kmToday: kmToday + tripDistanceKm,
      });
    },
    [sendSync, tripDistanceKm, kmToday, haltReason, haltSeconds]
  );

  const setHaltReasonManual = useCallback(
    (reason: string) => {
      setHaltReason(reason);
      sendSync('HALT_UPDATE', {
        haltReason: reason,
        haltSeconds,
      });
    },
    [sendSync, haltSeconds]
  );

  const setLocationManual = useCallback(
    (name: string, lat: number, lng: number) => {
      setCurrentLocationName(name);
      setCurrentLat(lat);
      setCurrentLng(lng);
      sendSync('LOCATION_UPDATE', {
        locationName: name,
        lat,
        lng,
        speed,
        distanceKm: tripDistanceKm,
      });
    },
    [sendSync, speed, tripDistanceKm]
  );

  // Live timer & corridor motion simulation when on active trip
  useEffect(() => {
    if (!isOnTrip) return;

    const pts = profile.corridorPoints || [];

    const interval = setInterval(() => {
      setTripDurationSeconds((prev) => prev + 1);

      if (speed > 0) {
        const distInc = speed / 3600; // km per second
        setTripDistanceKm((prev) => {
          const nextDist = parseFloat((prev + distInc).toFixed(3));

          // Step along corridor points if available — NEVER wrap back to start
          if (pts.length > 1) {
            const nextIdx = waypointIdxRef.current + 1;
            if (nextIdx < pts.length) {
              waypointIdxRef.current = nextIdx;
            }
            // Stay at the last waypoint once reached (don't loop back)
            const pt = pts[waypointIdxRef.current];
            setCurrentLat(pt[0]);
            setCurrentLng(pt[1]);

            // Broadcast location update
            sendSync('LOCATION_UPDATE', {
              lat: pt[0],
              lng: pt[1],
              speed,
              distanceKm: nextDist,
            });
          }

          return nextDist;
        });
      } else {
        // Halted timer - increment and sync periodically
        setHaltSeconds((prev) => {
          const next = prev + 1;
          if (next % 3 === 0) {
            sendSync('HALT_UPDATE', {
              haltReason: haltReason || 'Stop',
              haltSeconds: next,
            });
          }
          return next;
        });
        setTotalHaltSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOnTrip, speed, profile, sendSync]);

  return (
    <DriverContext.Provider
      value={{
        selectedProfileId,
        setSelectedProfileId,
        profiles,
        profile,
        isOnTrip,
        tripStartTime,
        tripStartLocation,
        tripDurationSeconds,
        speed,
        tripDistanceKm,
        kmToday,
        tripsCompletedToday,
        isHalted,
        haltSeconds,
        totalHaltSeconds,
        haltReason,
        tripSummary,
        currentLat,
        currentLng,
        currentLocationName,
        handleStartTrip,
        handleEndTrip,
        setSpeedManual,
        setHaltReasonManual,
        setLocationManual,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = (): DriverContextType => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};

