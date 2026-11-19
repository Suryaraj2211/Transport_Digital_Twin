import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Vehicle,
  Driver,
  Trip,
  FilterCategory,
  MapTileType,
  SyncMessage,
  VehicleType,
  TrackingSource,
  PhoneType,
  SimConsentStatus,
  SimTowerPing,
} from '../types/fleet';
import { INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_TRIPS, FLEET_CORRIDORS } from '../data/initialData';
import { sendDriverSms } from '../services/smsService';

export interface ToastItem {
  id: string;
  text: string;
  type: 'info' | 'success' | 'alert';
}

interface FleetContextType {
  vehicles: Record<string, Vehicle>;
  drivers: Record<string, Driver>;
  trips: Trip[];
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  filter: FilterCategory;
  setFilter: (f: FilterCategory) => void;
  mapType: MapTileType;
  setMapType: (m: MapTileType) => void;
  routeFilterMode: 'all' | 'selected';
  setRouteFilterMode: (m: 'all' | 'selected') => void;
  toasts: ToastItem[];
  addToast: (text: string, type?: 'info' | 'success' | 'alert') => void;
  addVehicle: (v: {
    plate: string;
    model: string;
    type: VehicleType;
    source: TrackingSource;
    driverId: string;
    simPhone?: string;
  }) => void;
  editVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => boolean;
  addDriver: (d: {
    name: string;
    phone: string;
    phoneType: PhoneType;
    device?: string;
    assignedVehicle?: string;
    destination?: string;
    licence?: string;
    licenceExpiry?: string;
  }) => Promise<void>;
  editDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  adminStartSimTrip: (vehicleId: string) => void;
  adminEndSimTrip: (vehicleId: string) => void;
  simulateMissedCall: (driverId: string) => void;
  simulateGeofence: (vehicleId: string) => void;
  broadcastEvent: (msg: SyncMessage) => void;
  activeSimDrawerVehicleId: string | null;
  openSimDrawer: (vehicleId: string) => void;
  closeSimDrawer: () => void;
  switchVehicleTrackingMode: (vehicleId: string, mode: TrackingSource) => void;
  updateVehicleSimPhone: (vehicleId: string, phone: string) => void;
  initiateSimConsent: (vehicleId: string, customPhone?: string) => void;
  updateSimConsentStatus: (vehicleId: string, status: SimConsentStatus) => void;
  pingSimLbs: (vehicleId: string) => void;
  sendAppPortalLinkSms: (vehicleId: string) => void;
  simTowerPing: SimTowerPing | null;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const SYNC_CHANNEL_NAME = 'fleet-tracker-sync';
export const FLEET_STORAGE_VERSION = 'v11_exact_road_constrained_tick';

const loadInitialDrivers = (): Record<string, Driver> => {
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

function projectPointOnSegment(p: [number, number], a: [number, number], b: [number, number]) {
  const dx = b[1] - a[1];
  const dy = b[0] - a[0];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { dist: Math.hypot(p[0] - a[0], p[1] - a[1]), t: 0 };
  let t = ((p[1] - a[1]) * dx + (p[0] - a[0]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const projLat = a[0] + t * dy;
  const projLng = a[1] + t * dx;
  const dist = Math.hypot(p[0] - projLat, p[1] - projLng);
  return { dist, t };
}

export function cleanVehicleRoute(v: Vehicle): Array<[number, number]> {
  if (!v || !v.lat || !v.lng) return [];
  const corridor = FLEET_CORRIDORS[v.id];
  if (!corridor || !corridor.points || corridor.points.length === 0) {
    return v.route || [[v.lat, v.lng]];
  }
  const pts = corridor.points;
  if (pts.length === 1) return [[v.lat, v.lng]];

  // Find which corridor segment [pts[i] -> pts[i+1]] the truck is currently traversing
  let bestSeg = 0;
  let minD = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const res = projectPointOnSegment([v.lat, v.lng], pts[i], pts[i + 1]);
    if (res.dist < minD) {
      minD = res.dist;
      bestSeg = i;
    }
  }

  // Traversed waypoints strictly up to the start of current segment (already passed)
  const cleanRoute: Array<[number, number]> = [];
  for (let i = 0; i <= bestSeg; i++) {
    cleanRoute.push(pts[i]);
  }

  // Append live truck position if not directly on top of the last passed waypoint
  const lastPt = cleanRoute[cleanRoute.length - 1];
  if (!lastPt || Math.hypot(lastPt[0] - v.lat, lastPt[1] - v.lng) > 0.00015) {
    cleanRoute.push([v.lat, v.lng]);
  }

  return cleanRoute;
}

const loadInitialVehicles = (): Record<string, Vehicle> => {
  if (typeof window !== 'undefined') {
    try {
      const ver = localStorage.getItem('fleet_data_version');
      if (ver !== FLEET_STORAGE_VERSION) {
        localStorage.removeItem('fleet_vehicles_data');
        localStorage.removeItem('fleet_drivers_data');
        localStorage.setItem('fleet_data_version', FLEET_STORAGE_VERSION);
        return INITIAL_VEHICLES;
      }
      const stored = localStorage.getItem('fleet_vehicles_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          const firstV = Object.values(parsed)[0] as Vehicle;
          if (firstV && firstV.lat && (firstV.lat < 12.98 || firstV.lat > 13.15 || firstV.lng < 80.00 || firstV.lng > 80.25)) {
            // Outdated distant coordinates detected — purge and reset
            localStorage.removeItem('fleet_vehicles_data');
            localStorage.removeItem('fleet_drivers_data');
            localStorage.setItem('fleet_data_version', FLEET_STORAGE_VERSION);
            return INITIAL_VEHICLES;
          }
          // Sanitize every vehicle's route to guarantee no loops
          Object.keys(parsed).forEach((k) => {
            parsed[k].route = cleanVehicleRoute(parsed[k]);
          });
          return parsed;
        }
      }
    } catch (e) {}
  }
  return INITIAL_VEHICLES;
};

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>(loadInitialVehicles);
  const [drivers, setDrivers] = useState<Record<string, Driver>>(loadInitialDrivers);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('v2');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [mapType, setMapType] = useState<MapTileType>('satellite');
  const [routeFilterMode, setRouteFilterMode] = useState<'all' | 'selected'>('all');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeSimDrawerVehicleId, setActiveSimDrawerVehicleId] = useState<string | null>(null);
  const [simTowerPing, setSimTowerPing] = useState<SimTowerPing | null>(null);

  const addToast = useCallback((text: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setToasts((prev) => {
      // Prevent duplicate toasts with the identical message
      if (prev.some((t) => t.text === text)) {
        return prev;
      }
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, 4000);
      return [...prev, { id, text, type }];
    });
  }, []);

  const broadcastEvent = useCallback((msg: any) => {
    try {
      const payload = {
        type: 'DRIVER_ACTION',
        action: msg.action || msg.type,
        ...msg,
      };
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.postMessage(payload);
        bc.close();
      }
      const vehicleId = msg.vehicleId || 'v1';
      localStorage.setItem(`fleet_driver_${vehicleId}_sync`, JSON.stringify(payload));
      localStorage.setItem('fleet_sync_event', JSON.stringify({ ...payload, timestamp: Date.now() }));
    } catch (e) {
      console.warn('Broadcast failed:', e);
    }
  }, []);

  // Sync drivers & vehicles to localStorage & notify driver portal
  useEffect(() => {
    try {
      localStorage.setItem('fleet_drivers_data', JSON.stringify(drivers));
      broadcastEvent({ type: 'DRIVERS_UPDATED', drivers });
    } catch (e) {}
  }, [drivers, broadcastEvent]);

  useEffect(() => {
    try {
      localStorage.setItem('fleet_vehicles_data', JSON.stringify(vehicles));
      broadcastEvent({ type: 'VEHICLES_UPDATED', vehicles });
    } catch (e) {}
  }, [vehicles, broadcastEvent]);

  // Listen to incoming BroadcastChannel / localStorage sync events
  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    const resolveVehicleId = (data: any, vehicleMap: Record<string, Vehicle>): string | null => {
      if (data.vehicleId && vehicleMap[data.vehicleId]) return data.vehicleId;
      if (data.plate) {
        const found = Object.keys(vehicleMap).find(
          (k) => vehicleMap[k].plate.trim().toUpperCase() === data.plate.trim().toUpperCase()
        );
        if (found) return found;
      }
      return null;
    };

    const handleMessage = (data: any) => {
      if (!data) return;
      const action = data.action || (data.type !== 'DRIVER_ACTION' ? data.type : null);
      if (!action) return;

      if (action === 'START_TRIP') {
        setVehicles((prev) => {
          const vehicleId = resolveVehicleId(data, prev) || Object.keys(prev)[0];
          const current = prev[vehicleId];
          if (!current) return prev;
          const lat = data.lat || current.lat;
          const lng = data.lng || current.lng;
          // Fresh trip starts with origin coordinate only (clears old completed trip route)
          const newRoute: Array<[number, number]> = [[lat, lng] as [number, number]];
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              status: 'driving',
              speed: data.speed || 55,
              currentLocation: data.startLocation || current.currentLocation,
              lat,
              lng,
              route: newRoute,
              lastSeen: 'Live now',
            },
          };
        });

        // Add to trips
        setTrips((prev) => {
          const newTripNum = prev.length > 0 ? Math.max(...prev.map((t) => t.tripNum)) + 1 : 1;
          const newTrip: Trip = {
            id: `trip-${Date.now()}`,
            tripNum: newTripNum,
            truckPlate: data.plate || 'Vehicle',
            driverName: data.driverName || 'Driver',
            startTime: data.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            startLocation: data.startLocation || 'Departure Corridor',
            endTime: '--',
            endLocation: 'In Transit',
            duration: '00:00:01',
            durationSeconds: 1,
            haltTime: '00:00',
            haltSeconds: 0,
            avgSpeed: `${data.speed || 55} km/h`,
            distance: `${data.distance || '0.00'} km`,
            distanceNum: parseFloat(data.distance || '0'),
            status: 'active',
          };
          return [newTrip, ...prev];
        });

        addToast(`🟢 Trip started: ${data.plate || 'Vehicle'} — ${data.driverName || 'Driver'}`, 'success');
      } else if (action === 'END_TRIP') {
        setVehicles((prev) => {
          const vehicleId = resolveVehicleId(data, prev);
          if (!vehicleId) return prev;
          const current = prev[vehicleId];
          if (!current) return prev;
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              status: 'halted',
              speed: 0,
              currentLocation: data.endLocation || current.currentLocation,
              lastSeen: 'Trip ended just now',
            },
          };
        });

        // Update active trip to completed
        setTrips((prev) =>
          prev.map((t) => {
            if (t.status === 'active' && (!data.plate || t.truckPlate === data.plate)) {
              const haltSec = data.haltSeconds ?? t.haltSeconds ?? 0;
              const m = Math.floor(haltSec / 60);
              const s = haltSec % 60;
              return {
                ...t,
                status: 'completed',
                endTime: data.endTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endLocation: data.endLocation || 'Destination Hub',
                duration: data.duration || t.duration,
                distance: data.distance ? `${data.distance} km` : (data.distanceKm ? `${data.distanceKm.toFixed(1)} km` : t.distance),
                avgSpeed: data.avgSpeed ? `${data.avgSpeed} km/h` : t.avgSpeed,
                haltSeconds: haltSec,
                haltTime: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
              };
            }
            return t;
          })
        );

        addToast(`🛑 Trip ended: ${data.plate || 'Vehicle'} (${data.distance || data.distanceKm || '0'} km)`, 'info');
      } else if (action === 'SPEED_UPDATE') {
        const newSpeed = typeof data.speed === 'number' ? data.speed : 0;
        setVehicles((prev) => {
          const vehicleId = resolveVehicleId(data, prev);
          if (!vehicleId) return prev;
          const current = prev[vehicleId];
          if (!current) return prev;
          const isHalt = newSpeed === 0;
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              speed: newSpeed,
              status: isHalt ? 'halted' : 'driving',
              haltReason: isHalt ? (current.haltReason || 'Stop') : undefined,
              distanceToday: data.kmToday ? data.kmToday : current.distanceToday,
              lastSeen: 'Live now',
            },
          };
        });
      } else if (action === 'LOCATION_UPDATE') {
        setVehicles((prev) => {
          const vehicleId = resolveVehicleId(data, prev);
          if (!vehicleId) return prev;
          const current = prev[vehicleId];
          if (!current) return prev;
          const lat = data.lat || current.lat;
          const lng = data.lng || current.lng;
          const lastPt = current.route && current.route.length > 0 ? current.route[current.route.length - 1] : null;
          const isDuplicate = lastPt && Math.abs(lastPt[0] - lat) < 0.00005 && Math.abs(lastPt[1] - lng) < 0.00005;
          const newRoute = isDuplicate
            ? current.route
            : current.route
            ? [...current.route, [lat, lng] as [number, number]]
            : [[lat, lng] as [number, number]];
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              currentLocation: data.locationName || current.currentLocation,
              lat,
              lng,
              route: newRoute,
              speed: typeof data.speed === 'number' ? data.speed : current.speed,
              lastSeen: 'Live now',
            },
          };
        });
      } else if (action === 'HALT_UPDATE') {
        setVehicles((prev) => {
          const vehicleId = resolveVehicleId(data, prev);
          if (!vehicleId) return prev;
          const current = prev[vehicleId];
          if (!current) return prev;
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              status: 'halted',
              speed: 0,
              haltReason: data.haltReason || current.haltReason || 'Stop',
              haltSeconds: data.haltSeconds ?? current.haltSeconds,
              lastSeen: 'Live now',
            },
          };
        });

        // Also sync active trip's haltTime live in Trips list
        setTrips((prev) =>
          prev.map((t) => {
            if (t.status === 'active' && (!data.plate || t.truckPlate === data.plate)) {
              const sec = data.haltSeconds ?? t.haltSeconds ?? 0;
              const m = Math.floor(sec / 60);
              const s = sec % 60;
              return {
                ...t,
                haltSeconds: sec,
                haltTime: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
              };
            }
            return t;
          })
        );
      }
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = (event) => handleMessage(event.data);
    }

    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      if (
        (e.key && e.key.startsWith('fleet_driver_') && e.key.endsWith('_sync')) ||
        e.key === 'fleet_sync_event'
      ) {
        try {
          handleMessage(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [addToast]);

  // 2-Second Corridor Simulation & Active Duration Ticker (Identical to vanilla admin.js tick())
  useEffect(() => {
    interface SimulationState {
      points: Array<[number, number]>;
      segIdx: number;
      t: number;
      initialized: boolean;
    }
    const simStates: Record<string, SimulationState> = {};

    Object.keys(FLEET_CORRIDORS).forEach((vid) => {
      const corr = FLEET_CORRIDORS[vid];
      if (corr && corr.points && corr.points.length >= 2) {
        simStates[vid] = {
          points: corr.points,
          segIdx: 0,
          t: 0,
          initialized: false,
        };
      }
    });

    const interval = setInterval(() => {
      // 1. Advance moving vehicles strictly along realistic road corridors
      setVehicles((prev) => {
        let changed = false;
        const next = { ...prev };

        Object.keys(next).forEach((vid) => {
          const v = { ...next[vid] };
          if (v.status !== 'driving' || !v.lat || !v.lng) return;

          changed = true;
          // Random slight speed fluctuation
          const delta = (Math.random() - 0.49) * 2;
          v.speed = Math.max(40, Math.min(65, Math.round(v.speed + delta)));

          // Corridor advancement - strictly constrained along road centerline segments
          const sim = simStates[vid];
          if (sim && sim.points.length >= 2) {
            const pts = sim.points;

            // Initialize segIdx and fractional progress t based on current vehicle coordinates
            if (!sim.initialized) {
              let bestSeg = 0;
              let bestT = 0;
              let minD = Infinity;
              for (let i = 0; i < pts.length - 1; i++) {
                const res = projectPointOnSegment([v.lat, v.lng], pts[i], pts[i + 1]);
                if (res.dist < minD) {
                  minD = res.dist;
                  bestSeg = i;
                  bestT = res.t;
                }
              }
              sim.segIdx = bestSeg;
              sim.t = bestT;
              sim.initialized = true;
            }

            let p1 = pts[sim.segIdx];
            let p2 = pts[sim.segIdx + 1];
            let segDist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
            if (segDist < 0.00001) segDist = 0.00001;

            // Step in degrees per 2 seconds based on vehicle speed (at 50 km/h: ~0.00028 degrees)
            const stepDist = (v.speed / 50) * 0.00028;
            sim.t += stepDist / segDist;

            while (sim.t >= 1.0) {
              sim.t -= 1.0;
              sim.segIdx += 1;
              if (sim.segIdx >= pts.length - 1) {
                // Reached destination corridor end: cycle seamlessly back to the beginning
                sim.segIdx = 0;
                sim.t = 0.0;
                break;
              }
              p1 = pts[sim.segIdx];
              p2 = pts[sim.segIdx + 1];
              segDist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
              if (segDist < 0.00001) segDist = 0.00001;
            }

            p1 = pts[sim.segIdx];
            p2 = pts[sim.segIdx + 1];
            v.lat = +(p1[0] + sim.t * (p2[0] - p1[0])).toFixed(5);
            v.lng = +(p1[1] + sim.t * (p2[1] - p1[1])).toFixed(5);
            v.route = cleanVehicleRoute(v);
            v.distanceToday = +(v.distanceToday + 0.02).toFixed(1);
            v.lastSeen = 'Live now';
          }

          next[vid] = v;
        });

        return changed ? next : prev;
      });

      // 2. Increment active trip duration & distance
      setTrips((prev) =>
        prev.map((t) => {
          if (t.status === 'active') {
            const nextSec = t.durationSeconds + 2;
            const h = Math.floor(nextSec / 3600);
            const m = Math.floor((nextSec % 3600) / 60);
            const s = nextSec % 60;
            const dur =
              h > 0
                ? `${h}h ${String(m).padStart(2, '0')}m`
                : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            const newDist = +(t.distanceNum + 0.02).toFixed(2);
            return {
              ...t,
              durationSeconds: nextSec,
              duration: dur,
              distanceNum: newDist,
              distance: `${newDist} km`,
            };
          }
          return t;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addVehicle = useCallback(
    (v: {
      plate: string;
      model: string;
      type: VehicleType;
      source: TrackingSource;
      driverId: string;
      simPhone?: string;
    }) => {
      const newId = `v${Date.now().toString().slice(-4)}`;
      const newVehicle: Vehicle = {
        id: newId,
        plate: v.plate.trim().toUpperCase(),
        model: v.model.trim() || 'Heavy Hauler',
        type: v.type,
        source: v.source,
        driverId: v.driverId || '',
        status: 'halted',
        speed: 0,
        currentLocation: 'Madhavaram Central Depot',
        lat: 13.1492,
        lng: 80.2312,
        battery: 95,
        accuracy: 15,
        lastSeen: 'Registered just now',
        distanceToday: 0.0,
        simPhone: v.simPhone || '',
        simConsentStatus: v.source === 'sim' ? 'none' : undefined,
        route: [
          [13.1492, 80.2312],
          [13.1550, 80.2280],
        ],
      };

      setVehicles((prev) => ({ ...prev, [newId]: newVehicle }));

      // If driver selected, assign truck to driver
      if (v.driverId) {
        setDrivers((prev) => {
          const d = prev[v.driverId];
          if (!d) return prev;
          return {
            ...prev,
            [v.driverId]: { ...d, assignedVehicle: newId },
          };
        });
      }

      addToast(`✅ Added vehicle ${newVehicle.plate}`, 'success');
    },
    [addToast]
  );

  const editVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...updates } };
    });
    addToast(`Saved changes for vehicle`, 'success');
  }, [addToast]);

  const deleteVehicle = useCallback(
    (id: string): boolean => {
      const current = vehicles[id];
      if (!current) return false;
      if (current.status === 'driving') {
        addToast(`⚠️ Cannot delete vehicle ${current.plate} while on active trip!`, 'alert');
        return false;
      }
      setVehicles((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      // Unassign driver
      setDrivers((prev) => {
        const next = { ...prev };
        for (const dId in next) {
          if (next[dId].assignedVehicle === id) {
            next[dId] = { ...next[dId], assignedVehicle: '' };
          }
        }
        return next;
      });
      if (selectedVehicleId === id) {
        setSelectedVehicleId(Object.keys(vehicles)[0] || '');
      }
      addToast(`🗑️ Vehicle ${current.plate} removed`, 'info');
      return true;
    },
    [vehicles, selectedVehicleId, addToast]
  );

  const addDriver = useCallback(
    async (d: {
      name: string;
      phone: string;
      phoneType: PhoneType;
      device?: string;
      assignedVehicle?: string;
      destination?: string;
      licence?: string;
      licenceExpiry?: string;
    }) => {
      const newId = `d${Date.now().toString().slice(-4)}`;
      const newDriver: Driver = {
        id: newId,
        name: d.name.trim(),
        phone: d.phone.trim(),
        phoneType: d.phoneType,
        device: d.device?.trim() || (d.phoneType === 'smart' ? 'Android Smartphone' : 'Button Phone'),
        assignedVehicle: d.assignedVehicle || '',
        destination: d.destination?.trim() || 'Sriperumbudur Logistics Hub',
        licence: d.licence?.trim() || 'TN01 ' + Math.floor(10000000 + Math.random() * 90000000),
        licenceExpiry: d.licenceExpiry || '2028-12-31',
        onDutySince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setDrivers((prev) => ({ ...prev, [newId]: newDriver }));

      // If vehicle assigned, update vehicle's driverId
      if (d.assignedVehicle) {
        setVehicles((prev) => {
          const v = prev[d.assignedVehicle!];
          if (!v) return prev;
          return {
            ...prev,
            [d.assignedVehicle!]: { ...v, driverId: newId },
          };
        });
      }

      addToast(`✅ Driver ${newDriver.name} added`, 'success');

      // Trigger background silent Indian SMS dispatch via backend API
      const assignedTruck = d.assignedVehicle ? vehicles[d.assignedVehicle]?.plate : 'Assigned Fleet Truck';
      sendDriverSms({
        driverName: newDriver.name,
        phone: newDriver.phone,
        truckPlate: assignedTruck || 'Fleet Truck',
        destination: newDriver.destination,
      });
    },
    [vehicles, addToast]
  );

  const editDriver = useCallback((id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...updates } };
    });
    addToast(`Saved changes for driver`, 'success');
  }, [addToast]);

  const deleteDriver = useCallback(
    (id: string) => {
      const current = drivers[id];
      if (!current) return;
      setDrivers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      // Unassign vehicle
      setVehicles((prev) => {
        const next = { ...prev };
        for (const vId in next) {
          if (next[vId].driverId === id) {
            next[vId] = { ...next[vId], driverId: '' };
          }
        }
        return next;
      });
      addToast(`🗑️ Driver ${current.name} removed`, 'info');
    },
    [drivers, addToast]
  );

  const simulateMissedCall = useCallback(
    (driverId: string) => {
      const driver = drivers[driverId];
      if (!driver) {
        addToast(`Select a driver first to simulate missed call`, 'alert');
        return;
      }
      const vehicleId =
        driver.assignedVehicle ||
        Object.keys(vehicles).find((vid) => vehicles[vid].driverId === driverId);
      if (!vehicleId || !vehicles[vehicleId]) {
        addToast(`⚠️ No vehicle assigned to driver ${driver.name}`, 'alert');
        return;
      }
      const vehicle = vehicles[vehicleId];

      if (vehicle.status === 'driving') {
        // End trip
        const endLocation = driver.destination || vehicle.destination || 'Destination Hub';
        setVehicles((prev) => ({
          ...prev,
          [vehicleId]: {
            ...vehicle,
            status: 'halted',
            speed: 0,
            currentLocation: endLocation,
            lastSeen: 'Trip completed via Missed Call',
          },
        }));

        setTrips((prev) =>
          prev.map((t) => {
            if (t.status === 'active' && t.truckPlate === vehicle.plate) {
              return {
                ...t,
                status: 'completed',
                endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endLocation,
              };
            }
            return t;
          })
        );

        broadcastEvent({
          type: 'END_TRIP',
          vehicleId,
          plate: vehicle.plate,
          driverName: driver.name,
          endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endLocation,
        });

        addToast(
          `📞 Missed Call Received from ${driver.phone}! Trip for ${vehicle.plate} automatically completed!`,
          'info'
        );
      } else {
        // Start trip
        const startLocation = vehicle.startLocation || vehicle.currentLocation || 'Depot (Departure)';
        setVehicles((prev) => ({
          ...prev,
          [vehicleId]: {
            ...vehicle,
            status: 'driving',
            speed: 52,
            currentLocation: startLocation,
            lastSeen: 'Just started via Missed Call',
          },
        }));

        const newTripNum = trips.length > 0 ? Math.max(...trips.map((t) => t.tripNum)) + 1 : 1;
        const newTrip: Trip = {
          id: `trip-${Date.now()}`,
          tripNum: newTripNum,
          truckPlate: vehicle.plate,
          driverName: driver.name,
          startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          startLocation,
          endTime: '--',
          endLocation: 'In Transit',
          duration: '00:00:01',
          durationSeconds: 1,
          haltTime: '00:00',
          haltSeconds: 0,
          avgSpeed: '52 km/h',
          distance: '0.00 km',
          distanceNum: 0,
          status: 'active',
        };
        setTrips((prev) => [newTrip, ...prev]);

        broadcastEvent({
          type: 'START_TRIP',
          vehicleId,
          plate: vehicle.plate,
          driverName: driver.name,
          startTime: newTrip.startTime,
          startLocation: newTrip.startLocation,
          speed: 52,
        });

        addToast(
          `📞 Missed Call Received from ${driver.phone}! Trip for ${vehicle.plate} automatically started!`,
          'success'
        );
      }
    },
    [drivers, vehicles, trips, broadcastEvent, addToast]
  );

  const simulateGeofence = useCallback(
    (vehicleId: string) => {
      const vehicle = vehicles[vehicleId];
      if (!vehicle) return;
      const driver = drivers[vehicle.driverId];
      const driverName = driver ? driver.name : 'Assigned Driver';
      const hubName = vehicle.startLocation || vehicle.currentLocation || 'Depot Hub';

      setVehicles((prev) => ({
        ...prev,
        [vehicleId]: {
          ...vehicle,
          status: 'driving',
          speed: 48,
          currentLocation: `${hubName} 500m Gate Crossing (Auto Geofence Triggered)`,
          lastSeen: 'Live corridor tracking',
        },
      }));

      const newTripNum = trips.length > 0 ? Math.max(...trips.map((t) => t.tripNum)) + 1 : 1;
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        tripNum: newTripNum,
        truckPlate: vehicle.plate,
        driverName: driverName,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startLocation: `${hubName} Geofence Perimeter Gate`,
        endTime: '--',
        endLocation: 'In Transit',
        duration: '00:00:01',
        durationSeconds: 1,
        haltTime: '00:00',
        haltSeconds: 0,
        avgSpeed: '48 km/h',
        distance: '0.00 km',
        distanceNum: 0,
        status: 'active',
      };
      setTrips((prev) => [newTrip, ...prev]);

      broadcastEvent({
        type: 'START_TRIP',
        vehicleId,
        plate: vehicle.plate,
        driverName,
        startTime: newTrip.startTime,
        startLocation: newTrip.startLocation,
        speed: 48,
      });

      addToast(
        `🌐 Geofence Exit Triggered (500m Boundary)! Trip for ${vehicle.plate} automatically started!`,
        'success'
      );
    },
    [vehicles, drivers, trips, broadcastEvent, addToast]
  );

  const openSimDrawer = useCallback((vehicleId: string) => {
    setActiveSimDrawerVehicleId(vehicleId);
  }, []);

  const closeSimDrawer = useCallback(() => {
    setActiveSimDrawerVehicleId(null);
  }, []);

  const switchVehicleTrackingMode = useCallback(
    (vehicleId: string, mode: TrackingSource) => {
      const v = vehicles[vehicleId];
      if (!v) return;
      if (v.source === mode) return; // Ignore if already in this mode

      const driver = drivers[v.driverId];
      let simConsentStatus = v.simConsentStatus;
      let simPhone = v.simPhone;

      if (mode === 'sim') {
        if (!simConsentStatus || simConsentStatus === 'none') {
          simConsentStatus = driver && driver.phoneType === 'button' ? 'pending' : 'none';
        }
        if (!simPhone && driver && driver.phone) {
          simPhone = driver.phone;
        }
        addToast(
          `📶 Switched ${v.plate} to Telecom SIM LBS Tracking. Enter driver phone and initiate DoT consent.`,
          'info'
        );
      } else {
        addToast(`📱 Switched ${v.plate} to Smartphone Driver App GPS Tracking.`, 'info');
      }

      setVehicles((prev) => {
        const cur = prev[vehicleId];
        if (!cur) return prev;
        return {
          ...prev,
          [vehicleId]: {
            ...cur,
            source: mode,
            simConsentStatus,
            simPhone,
          },
        };
      });
    },
    [vehicles, drivers, addToast]
  );

  const updateVehicleSimPhone = useCallback((vehicleId: string, phone: string) => {
    setVehicles((prev) => {
      const v = prev[vehicleId];
      if (!v) return prev;
      return {
        ...prev,
        [vehicleId]: { ...v, simPhone: phone },
      };
    });
  }, []);

  const initiateSimConsent = useCallback(
    (vehicleId: string, customPhone?: string) => {
      const v = vehicles[vehicleId];
      if (!v) return;
      const driver = drivers[v.driverId];
      const phoneToUse = customPhone || v.simPhone;

      setVehicles((prev) => ({
        ...prev,
        [vehicleId]: {
          ...prev[vehicleId],
          simConsentStatus: 'pending',
          simPhone: phoneToUse || prev[vehicleId].simPhone,
        },
      }));
      // Dispatch DoT 56161 consent SMS via gateway
      sendDriverSms({
        vehicleId,
        driverPhone: phoneToUse,
        type: 'sim_consent',
        plate: v.plate,
        driverName: driver?.name,
      });
      addToast(
        `📨 DoT Consent SMS dispatched to ${phoneToUse || 'driver'}!\nWaiting for driver reply YES to 56161.`,
        'info'
      );
      setActiveSimDrawerVehicleId(vehicleId);
    },
    [vehicles, drivers, addToast]
  );

  const adminStartSimTrip = useCallback(
    (vehicleId: string) => {
      const v = vehicles[vehicleId];
      if (!v) return;
      const driver = drivers[v.driverId];

      // Check existing active trip for this vehicle
      const existingActive = trips.find((t) => t.status === 'active' && t.truckPlate === v.plate);
      if (existingActive) {
        addToast(`⚠️ Trip #${existingActive.tripNum} is already ACTIVE for ${v.plate}!`, 'info');
        return;
      }

      const carrier =
        driver && driver.device && driver.device.toLowerCase().includes('jio') ? 'Jio' : 'Airtel';
      const cellId = carrier === 'Jio' ? 'JIO-BTS-8821' : 'AIRTEL-BTS-4819';
      const startLoc = v.startLocation || v.currentLocation || 'Logistics Depot';

      setVehicles((prev) => {
        const cur = prev[vehicleId];
        if (!cur) return prev;
        return {
          ...prev,
          [vehicleId]: {
            ...cur,
            status: 'driving',
            speed: 48,
            currentLocation: `${startLoc} (Linked to ${cellId})`,
            lastSeen: 'Live now',
            route: cur.route && cur.route.length > 0 ? cur.route : [[cur.lat, cur.lng]],
          },
        };
      });

      const newTripNum = trips.length > 0 ? Math.max(...trips.map((t) => t.tripNum)) + 1 : 1;
      const newTrip: Trip = {
        id: `trip-sim-${Date.now()}`,
        tripNum: newTripNum,
        truckPlate: v.plate,
        driverName: driver ? driver.name : 'Unknown Driver',
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startLocation: `${startLoc} (${cellId})`,
        endTime: '--',
        endLocation: 'In Transit',
        duration: '00:00:01',
        durationSeconds: 1,
        haltTime: '00:00',
        haltSeconds: 0,
        avgSpeed: '48 km/h',
        distance: '0.00 km',
        distanceNum: 0,
        status: 'active',
      };

      setTrips((prev) => [newTrip, ...prev]);

      // Broadcast event so other tabs/portal sync
      broadcastEvent({
        type: 'START_TRIP',
        vehicleId,
        plate: v.plate,
        driverName: driver ? driver.name : 'Unknown Driver',
        startTime: newTrip.startTime,
        startLocation: newTrip.startLocation,
      });

      addToast(
        `📶 Telecom SIM LBS Tracking active for ${v.plate}!\nStatus updated to Driving. Driver (${driver ? driver.name : 'Assigned'}) notified via SMS.`,
        'success'
      );
    },
    [vehicles, drivers, trips, broadcastEvent, addToast]
  );

  const adminEndSimTrip = useCallback(
    (vehicleId: string) => {
      const v = vehicles[vehicleId];
      if (!v) return;
      const driver = drivers[v.driverId];

      const carrier =
        driver && driver.device && driver.device.toLowerCase().includes('jio') ? 'Jio' : 'Airtel';
      const cellId = carrier === 'Jio' ? 'JIO-BTS-9104' : 'AIRTEL-BTS-5022';
      const endLoc = v.destination || (driver && driver.destination) || 'Destination Freight Hub';

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setVehicles((prev) => {
        const cur = prev[vehicleId];
        if (!cur) return prev;
        return {
          ...prev,
          [vehicleId]: {
            ...cur,
            status: 'halted',
            speed: 0,
            currentLocation: `${endLoc} (Trip Completed)`,
            lastSeen: 'Trip completed via SIM LBS',
          },
        };
      });

      setTrips((prev) =>
        prev.map((t) => {
          if (t.status === 'active' && t.truckPlate === v.plate) {
            return {
              ...t,
              status: 'completed',
              endTime: nowTime,
              endLocation: `${endLoc} (${cellId})`,
            };
          }
          return t;
        })
      );

      broadcastEvent({
        type: 'END_TRIP',
        vehicleId,
        plate: v.plate,
        driverName: driver ? driver.name : 'Unknown Driver',
        endTime: nowTime,
        endLocation: endLoc,
      });

      addToast(`🛑 Telecom SIM LBS Trip Completed for ${v.plate}! Status changed to Halted.`, 'info');
    },
    [vehicles, drivers, broadcastEvent, addToast]
  );

  const updateSimConsentStatus = useCallback(
    (vehicleId: string, status: SimConsentStatus) => {
      setVehicles((prev) => {
        const v = prev[vehicleId];
        if (!v) return prev;
        return {
          ...prev,
          [vehicleId]: { ...v, simConsentStatus: status },
        };
      });
      const v = vehicles[vehicleId];
      const plate = v ? v.plate : 'Vehicle';
      if (status === 'approved') {
        addToast(
          `✅ DoT Consent Approved! Driver sent YES from ${v?.simPhone || 'device'}.\nLBS Cell Tower Triangulation active for ${plate}.`,
          'success'
        );
      } else if (status === 'denied') {
        addToast(
          `🛑 DoT Consent Declined! Driver sent NO.\nCell tower triangulation disabled for ${plate}.`,
          'alert'
        );
      }
    },
    [vehicles, addToast]
  );

  const pingSimLbs = useCallback(
    (vehicleId: string) => {
      const v = vehicles[vehicleId];
      if (!v) return;
      const driver = drivers[v.driverId];
      const carrier =
        driver && driver.device && driver.device.toLowerCase().includes('jio') ? 'Jio' : 'Airtel';
      const towerId = carrier === 'Jio' ? '#8821' : '#4819';
      const randomRssi = -68 - Math.floor(Math.random() * 12);

      // Trigger map LBS visualization (850m circle + BTS antenna)
      setSimTowerPing({
        vehicleId,
        lat: v.lat,
        lng: v.lng,
        carrier,
        towerId,
        rssi: randomRssi,
        timestamp: Date.now(),
      });

      // Auto remove after 8 seconds
      setTimeout(() => {
        setSimTowerPing((cur) => (cur && cur.vehicleId === vehicleId ? null : cur));
      }, 8000);

      addToast(
        `📡 Cell Tower LBS Triangulation:\nCarrier: ${carrier} Telecom · Tower: ${towerId}\nSignal: ${randomRssi} dBm (Strong) · Coords: ${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}`,
        'info'
      );
    },
    [vehicles, drivers, addToast]
  );

  const sendAppPortalLinkSms = useCallback(
    (vehicleId: string) => {
      const v = vehicles[vehicleId];
      if (!v) return;
      const driver = drivers[v.driverId];
      const phone = (driver && driver.phone) || v.simPhone;
      if (!phone) {
        addToast(`⚠️ Please enter or assign a driver phone number for ${v.plate} first!`, 'alert');
        return;
      }
      // Dispatch driver portal link via SMS gateway
      sendDriverSms({
        vehicleId,
        driverPhone: phone,
        type: 'driver_link',
        plate: v.plate,
        driverName: driver?.name,
      });
      addToast(
        `📲 Driver App Portal SMS sent to ${phone}!\n"Login link: ${window.location.origin}/driver/?truck=${encodeURIComponent(v.plate)}"`,
        'success'
      );
    },
    [vehicles, drivers, addToast]
  );

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        selectedVehicleId,
        setSelectedVehicleId,
        filter,
        setFilter,
        mapType,
        setMapType,
        routeFilterMode,
        setRouteFilterMode,
        toasts,
        addToast,
        addVehicle,
        editVehicle,
        deleteVehicle,
        addDriver,
        editDriver,
        deleteDriver,
        adminStartSimTrip,
        adminEndSimTrip,
        simulateMissedCall,
        simulateGeofence,
        broadcastEvent,
        activeSimDrawerVehicleId,
        openSimDrawer,
        closeSimDrawer,
        switchVehicleTrackingMode,
        updateVehicleSimPhone,
        initiateSimConsent,
        updateSimConsentStatus,
        pingSimLbs,
        sendAppPortalLinkSms,
        simTowerPing,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = (): FleetContextType => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
