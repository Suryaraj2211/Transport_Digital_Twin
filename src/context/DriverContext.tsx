import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DRIVER_PROFILES } from '../data/initialData';
import { DriverProfile } from '../types/fleet';

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

export const DriverProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('d1');
  const profile = DRIVER_PROFILES[selectedProfileId] || DRIVER_PROFILES['d1'];

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

  const [currentLat, setCurrentLat] = useState<number>(profile.startCoords[0]);
  const [currentLng, setCurrentLng] = useState<number>(profile.startCoords[1]);
  const [currentLocationName, setCurrentLocationName] = useState<string>(profile.startName);

  // When profile switches, update initial route coords
  useEffect(() => {
    if (!isOnTrip) {
      setCurrentLat(profile.startCoords[0]);
      setCurrentLng(profile.startCoords[1]);
      setCurrentLocationName(profile.startName);
      setTripStartLocation(profile.startName);
    }
  }, [profile, isOnTrip]);

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
      } else {
        setIsHalted(false);
      }
      sendSync('SPEED_UPDATE', {
        speed: spd,
        tripDistance: tripDistanceKm,
        kmToday: kmToday + tripDistanceKm,
      });
    },
    [sendSync, tripDistanceKm, kmToday]
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

    let waypointIdx = 0;
    const pts = profile.corridorPoints || [];

    const interval = setInterval(() => {
      setTripDurationSeconds((prev) => prev + 1);

      if (speed > 0) {
        const distInc = speed / 3600; // km per second
        setTripDistanceKm((prev) => {
          const nextDist = parseFloat((prev + distInc).toFixed(3));

          // Step along corridor points if available
          if (pts.length > 1) {
            waypointIdx = (waypointIdx + 1) % pts.length;
            const pt = pts[waypointIdx];
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
        // Halted timer
        setHaltSeconds((prev) => prev + 1);
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

