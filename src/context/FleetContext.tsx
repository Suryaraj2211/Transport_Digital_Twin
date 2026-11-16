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
  simulateMissedCall: (driverId: string) => void;
  simulateGeofence: (vehicleId: string) => void;
  broadcastEvent: (msg: SyncMessage) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const SYNC_CHANNEL_NAME = 'fleet-tracker-sync';

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Record<string, Driver>>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('v2');
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [mapType, setMapType] = useState<MapTileType>('satellite');
  const [routeFilterMode, setRouteFilterMode] = useState<'all' | 'selected'>('all');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((text: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
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

  // Listen to incoming BroadcastChannel / localStorage sync events
  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    const handleMessage = (data: any) => {
      if (!data) return;
      const action = data.action || (data.type !== 'DRIVER_ACTION' ? data.type : null);
      if (!action) return;

      if (action === 'START_TRIP') {
        const vehicleId = data.vehicleId || 'v1';
        setVehicles((prev) => {
          const current = prev[vehicleId];
          if (!current) return prev;
          const lat = data.lat || current.lat;
          const lng = data.lng || current.lng;
          const newRoute = current.route ? [...current.route, [lat, lng] as [number, number]] : [[lat, lng] as [number, number]];
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
            truckPlate: data.plate || 'TN 09 AB 1234',
            driverName: data.driverName || 'Driver',
            startTime: data.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            startLocation: data.startLocation || 'Chennai Central Freight Corridor',
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
        const vehicleId = data.vehicleId || 'v1';
        setVehicles((prev) => {
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
              return {
                ...t,
                status: 'completed',
                endTime: data.endTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endLocation: data.endLocation || 'Destination Hub',
                duration: data.duration || t.duration,
                distance: data.distance ? `${data.distance} km` : (data.distanceKm ? `${data.distanceKm.toFixed(1)} km` : t.distance),
                avgSpeed: data.avgSpeed ? `${data.avgSpeed} km/h` : t.avgSpeed,
              };
            }
            return t;
          })
        );

        addToast(`🛑 Trip ended: ${data.plate || 'Vehicle'} (${data.distance || data.distanceKm || '0'} km)`, 'info');
      } else if (action === 'SPEED_UPDATE') {
        const vehicleId = data.vehicleId || 'v1';
        setVehicles((prev) => {
          const current = prev[vehicleId];
          if (!current) return prev;
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              speed: typeof data.speed === 'number' ? data.speed : current.speed,
              distanceToday: data.kmToday ? data.kmToday : current.distanceToday,
              lastSeen: 'Live now',
            },
          };
        });
      } else if (action === 'LOCATION_UPDATE') {
        const vehicleId = data.vehicleId || 'v1';
        setVehicles((prev) => {
          const current = prev[vehicleId];
          if (!current) return prev;
          const lat = data.lat || current.lat;
          const lng = data.lng || current.lng;
          const newRoute = current.route ? [...current.route, [lat, lng] as [number, number]] : [[lat, lng] as [number, number]];
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
        const vehicleId = data.vehicleId || 'v1';
        setVehicles((prev) => {
          const current = prev[vehicleId];
          if (!current) return prev;
          return {
            ...prev,
            [vehicleId]: {
              ...current,
              status: 'halted',
              speed: 0,
              haltReason: data.haltReason || current.haltReason,
              haltSeconds: data.haltSeconds || current.haltSeconds,
            },
          };
        });
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
    const corridors = JSON.parse(JSON.stringify(FLEET_CORRIDORS));

    const interval = setInterval(() => {
      // 1. Advance moving vehicles along realistic road corridors
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

          // Corridor advancement
          const corridor = corridors[vid];
          if (corridor) {
            const pts = corridor.points;
            const targetPt = pts[corridor.targetIndex];
            if (targetPt) {
              const dLat = targetPt[0] - v.lat;
              const dLng = targetPt[1] - v.lng;
              const dist = Math.hypot(dLat, dLng);
              const step = Math.min(dist, 0.00020);

              if (dist <= 0.00025) {
                v.lat = targetPt[0];
                v.lng = targetPt[1];
                corridor.targetIndex += corridor.direction;
                if (corridor.targetIndex >= pts.length || corridor.targetIndex < 0) {
                  corridor.direction = -corridor.direction;
                  corridor.targetIndex += corridor.direction * 2;
                }
              } else {
                v.lat = +(v.lat + (dLat / dist) * step).toFixed(5);
                v.lng = +(v.lng + (dLng / dist) * step).toFixed(5);
              }
            }
          }

          // Dynamic Route Line Growth
          const route: Array<[number, number]> = v.route ? [...v.route] : [[v.lat, v.lng]];
          const lastPt = route[route.length - 1];
          if (!lastPt) {
            route.push([v.lat, v.lng]);
          } else {
            const distFromLast = Math.hypot(v.lat - lastPt[0], v.lng - lastPt[1]);
            if (distFromLast >= 0.00035) {
              route.push([v.lat, v.lng]);
              if (route.length > 200) route.shift();
            } else {
              route[route.length - 1] = [v.lat, v.lng];
            }
          }
          v.route = route;
          v.distanceToday = +(v.distanceToday + 0.02).toFixed(1);
          v.lastSeen = 'Live now';
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
    (v: { plate: string; model: string; type: VehicleType; source: TrackingSource; driverId: string }) => {
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
      const vehicleId = driver.assignedVehicle || 'v4';
      const vehicle = vehicles[vehicleId];
      if (!vehicle) return;

      if (vehicle.status === 'driving') {
        // End trip
        setVehicles((prev) => ({
          ...prev,
          [vehicleId]: {
            ...vehicle,
            status: 'halted',
            speed: 0,
            currentLocation: driver.destination || 'Destination Hub',
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
                endLocation: driver.destination || 'Destination Hub',
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
          endLocation: driver.destination,
        });

        addToast(
          `📞 Missed Call Received from ${driver.phone}! Trip for ${vehicle.plate} automatically completed!`,
          'info'
        );
      } else {
        // Start trip
        setVehicles((prev) => ({
          ...prev,
          [vehicleId]: {
            ...vehicle,
            status: 'driving',
            speed: 52,
            currentLocation: 'Madhavaram Central Depot (Departure)',
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
          startLocation: 'Madhavaram Central Depot',
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

      setVehicles((prev) => ({
        ...prev,
        [vehicleId]: {
          ...vehicle,
          status: 'driving',
          speed: 48,
          currentLocation: 'Madhavaram Depot 500m Gate Crossing (Auto Geofence Triggered)',
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
        startLocation: 'Madhavaram Depot Geofence Perimeter Gate',
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
        simulateMissedCall,
        simulateGeofence,
        broadcastEvent,
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
