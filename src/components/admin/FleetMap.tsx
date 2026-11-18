import React, { useEffect, useRef, useCallback } from 'react';
import * as L from 'leaflet';
import { useFleet, cleanVehicleRoute } from '../../context/FleetContext';
import { Vehicle, Driver } from '../../types/fleet';
import { FLEET_CORRIDORS } from '../../data/initialData';

interface FleetMapProps {
  onSelectVehicle: (id: string) => void;
}

export const ROUTE_PALETTES: Record<
  string,
  {
    main: string;
    dark: string;
    light: string;
    accent: string;
    labelBg: string;
    name: string;
  }
> = {
  v1: {
    main: '#2563eb', // Vibrant Royal Blue (NH 48 West)
    dark: '#1d4ed8',
    light: '#60a5fa',
    accent: '#3b82f6',
    labelBg: '#eff6ff',
    name: 'NH 48 West Corridor',
  },
  v2: {
    main: '#9333ea', // Royal Purple (GST South Corridor)
    dark: '#7e22ce',
    light: '#c084fc',
    accent: '#a855f7',
    labelBg: '#faf5ff',
    name: 'GST South Express',
  },
  v3: {
    main: '#059669', // Emerald Green (CTH North-West Corridor)
    dark: '#047857',
    light: '#34d399',
    accent: '#10b981',
    labelBg: '#ecfdf5',
    name: 'CTH North-West Express',
  },
  v4: {
    main: '#ea580c', // Bright Amber / Orange (Kundrathur South-West)
    dark: '#c2410c',
    light: '#fb923c',
    accent: '#f97316',
    labelBg: '#fff7ed',
    name: 'Kundrathur South-West',
  },
  v5: {
    main: '#e11d48', // Crimson Rose (100 Ft Inner Ring Central-East)
    dark: '#be123c',
    light: '#fb7185',
    accent: '#f43f5e',
    labelBg: '#fff1f2',
    name: '100 Ft Central-East',
  },
  v6: {
    main: '#0891b2', // Cyan / Teal (Ambattur Industrial Avenue North)
    dark: '#0e7490',
    light: '#22d3ee',
    accent: '#06b6d4',
    labelBg: '#ecfeff',
    name: 'Ambattur Industrial North',
  },
};

const DEFAULT_MAP_CENTER: [number, number] = [13.042, 80.120];
const DEFAULT_MAP_ZOOM = 12;

/**
 * Calculates bearing heading in degrees from point 1 to point 2
 */
function calculateHeading(p1: [number, number], p2: [number, number]): number {
  if (!p1 || !p2) return 0;
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Retrieve comprehensive destination information and forward corridor waypoints for a vehicle
 */
function getVehicleDestinationInfo(v: Vehicle, driver: Driver | null, isTripEnded: boolean = false) {
  if (!v) return null;
  const destName = v.destination || (driver && driver.destination) || 'Logistics Hub';
  let destCoords: [number, number] | null = null;
  let forwardWaypoints: [number, number][] = [];

  const corridor = FLEET_CORRIDORS[v.id];
  if (corridor && corridor.points && corridor.points.length > 0) {
    const pts = corridor.points;
    destCoords = pts[pts.length - 1];

    // If trip has already ended, vehicle has arrived — no forward corridor preview needed!
    if (isTripEnded) {
      return {
        name: destName,
        coords: destCoords,
        forwardWaypoints: [],
        eta: 'Arrived',
        remainingDist: '0 km',
      };
    }

    if (v.lat && v.lng) {
      forwardWaypoints.push([v.lat, v.lng]);

      // Dynamically find the closest waypoint to the truck's current live position
      let closestIdx = 0;
      let minDistance = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - v.lat, pts[i][1] - v.lng);
        if (d < minDistance) {
          minDistance = d;
          closestIdx = i;
        }
      }

      // Only add future waypoints forward towards destination (never backward/reverse)
      for (let i = closestIdx + 1; i < pts.length; i++) {
        forwardWaypoints.push(pts[i]);
      }
    }

    if (forwardWaypoints.length < 2 && destCoords) {
      forwardWaypoints.push(destCoords);
    }
  }

  return {
    name: destName,
    coords: destCoords,
    forwardWaypoints,
    eta: v.eta || 'On Schedule',
    remainingDist: v.remainingDist || 'En Route',
  };
}

export const FleetMap: React.FC<FleetMapProps> = ({ onSelectVehicle }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const satelliteGroupRef = useRef<L.LayerGroup | null>(null);
  const streetsLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const routeLayersRef = useRef<Record<string, L.Polyline>>({});
  const routeCasingsRef = useRef<Record<string, L.Polyline>>({});
  const originMarkersRef = useRef<Record<string, L.Marker | L.CircleMarker>>({});
  const destMarkersRef = useRef<Record<string, L.Marker>>({});
  const forwardCorridorLayersRef = useRef<Record<string, L.Polyline>>({});
  const forwardCorridorCasingsRef = useRef<Record<string, L.Polyline>>({});
  const directionArrowsRef = useRef<L.Marker[]>([]);
  const simTowerPingLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    vehicles,
    drivers,
    trips,
    selectedVehicleId,
    mapType,
    setMapType,
    routeFilterMode,
    setRouteFilterMode,
    simTowerPing,
  } = useFleet();

  // Fit map to show all vehicles and routes (Chennai Metropolitan Freight Belt)
  const fitMapToAllVehicles = useCallback((animate = false) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Force Leaflet to recognize full container dimensions before computing bounds
    map.invalidateSize({ pan: false });

    const coords: [number, number][] = [];
    Object.values(vehicles).forEach((v) => {
      if (v.lat && v.lng && v.lat >= 12.90 && v.lat <= 13.20 && v.lng >= 80.00 && v.lng <= 80.25) {
        coords.push([v.lat, v.lng]);
      }
      if (v.route && Array.isArray(v.route)) {
        v.route.forEach((pt) => {
          if (pt && pt.length >= 2 && pt[0] >= 12.90 && pt[0] <= 13.20 && pt[1] >= 80.00 && pt[1] <= 80.25) {
            coords.push([pt[0], pt[1]]);
          }
        });
      }
    });

    if (coords.length > 0) {
      map.fitBounds(coords, {
        padding: [45, 45],
        maxZoom: 12.5,
        animate: animate,
      });
    } else {
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);
    }
  }, [vehicles]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      minZoom: 4,
      maxZoom: 19,
    }).setView(DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM);

    mapInstanceRef.current = map;

    // 1. Satellite Base Layer (ESRI World Imagery)
    const satelliteBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        minZoom: 2,
        maxNativeZoom: 18,
        maxZoom: 20,
        zIndex: 1,
        attribution: 'Tiles &copy; Esri | V3 Logistics',
      }
    );

    // 2. Satellite Places Layer (City/Town Names)
    const satellitePlaces = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        minZoom: 2,
        maxNativeZoom: 18,
        maxZoom: 20,
        zIndex: 2,
      }
    );

    // Group Satellite layers together
    const satelliteGroup = L.layerGroup([satelliteBase, satellitePlaces]);
    satelliteGroupRef.current = satelliteGroup;

    // 3. Streets Layer (OSM Clean Modern)
    const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 2,
      maxNativeZoom: 19,
      maxZoom: 20,
      zIndex: 1,
      attribution: '&copy; OpenStreetMap contributors | V3 Logistics',
    });
    streetsLayerRef.current = streetsLayer;

    // Default to Satellite
    satelliteGroup.addTo(map);

    // Dynamic zoom class handler to adapt marker size automatically
    const handleZoomChange = () => {
      const z = map.getZoom();
      if (mapContainerRef.current) {
        if (z < 11) {
          mapContainerRef.current.classList.add('map-zoom-low');
        } else {
          mapContainerRef.current.classList.remove('map-zoom-low');
        }
      }
    };
    map.on('zoomend', handleZoomChange);
    handleZoomChange();

    // Continuous staged invalidateSize calls to guarantee tile loading across all screen sizes and CDN latency
    const timers = [50, 150, 300, 600, 1200].map((delay) =>
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
          if (delay === 150 || delay === 600) {
            fitMapToAllVehicles(false);
            handleZoomChange();
          }
        }
      }, delay)
    );

    // Automatic ResizeObserver: guarantees map tiles automatically re-render and fill 100% on any container size change
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
      map.off('zoomend', handleZoomChange);
      Object.keys(markersRef.current).forEach((vid) => {
        map.removeLayer(markersRef.current[vid]);
      });
      markersRef.current = {};

      Object.keys(routeLayersRef.current).forEach((vid) => {
        map.removeLayer(routeLayersRef.current[vid]);
      });
      routeLayersRef.current = {};

      Object.keys(routeCasingsRef.current).forEach((vid) => {
        map.removeLayer(routeCasingsRef.current[vid]);
      });
      routeCasingsRef.current = {};

      Object.keys(originMarkersRef.current).forEach((vid) => {
        map.removeLayer(originMarkersRef.current[vid]);
      });
      originMarkersRef.current = {};

      Object.keys(destMarkersRef.current).forEach((vid) => {
        map.removeLayer(destMarkersRef.current[vid]);
      });
      destMarkersRef.current = {};

      Object.keys(forwardCorridorLayersRef.current).forEach((vid) => {
        map.removeLayer(forwardCorridorLayersRef.current[vid]);
      });
      forwardCorridorLayersRef.current = {};

      Object.keys(forwardCorridorCasingsRef.current).forEach((vid) => {
        map.removeLayer(forwardCorridorCasingsRef.current[vid]);
      });
      forwardCorridorCasingsRef.current = {};

      directionArrowsRef.current.forEach((marker) => {
        if (map.hasLayer(marker)) map.removeLayer(marker);
      });
      directionArrowsRef.current = [];

      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map type changes (Satellite vs Streets)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const satGroup = satelliteGroupRef.current;
    const streetsLayer = streetsLayerRef.current;

    if (satGroup && map.hasLayer(satGroup)) map.removeLayer(satGroup);
    if (streetsLayer && map.hasLayer(streetsLayer)) map.removeLayer(streetsLayer);

    if (mapType === 'streets') {
      if (streetsLayer) streetsLayer.addTo(map);
    } else {
      if (satGroup) satGroup.addTo(map);
    }

    map.invalidateSize({ pan: false });
  }, [mapType]);

  // Handle authentic LBS Cell Tower Ping Visualization
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (simTowerPingLayerRef.current) {
      if (map.hasLayer(simTowerPingLayerRef.current)) {
        map.removeLayer(simTowerPingLayerRef.current);
      }
      simTowerPingLayerRef.current = null;
    }

    if (!simTowerPing) return;

    // Authentic LBS Triangulation Circle (Coverage radius ~850m)
    const lbsCircle = L.circle([simTowerPing.lat, simTowerPing.lng], {
      radius: 850,
      color: '#2563eb',
      weight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.16,
      dashArray: '6, 6',
    });

    // Cell Tower Marker with pulsating antenna badge
    const towerIcon = L.divIcon({
      className: 'sim-bts-pulse-marker',
      html: `
        <div style="background:#1e3a8a; color:#fff; border:2px solid #60a5fa; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 18px rgba(37,99,235,0.85); font-size:16px;">
            📡
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const towerMarker = L.marker([simTowerPing.lat, simTowerPing.lng], { icon: towerIcon }).bindTooltip(
      `<b>${simTowerPing.carrier} Telecom BTS</b><br>Cell ID: ${simTowerPing.towerId}<br>Signal: ${simTowerPing.rssi} dBm`,
      {
        permanent: true,
        direction: 'top',
        offset: [0, -18],
        className: 'sim-tower-tooltip',
      }
    );

    const layerGroup = L.layerGroup([lbsCircle, towerMarker]);
    layerGroup.addTo(map);
    simTowerPingLayerRef.current = layerGroup;

    map.panTo([simTowerPing.lat, simTowerPing.lng], { animate: true });

    return () => {
      if (simTowerPingLayerRef.current && map.hasLayer(simTowerPingLayerRef.current)) {
        map.removeLayer(simTowerPingLayerRef.current);
        simTowerPingLayerRef.current = null;
      }
    };
  }, [simTowerPing]);

  // Update Markers, Heading Arrows, Routes & Destinations (does NOT alter map pan or zoom)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const getVehicleCat = (v: Vehicle): string => {
      if (v.status === 'driving') return 'moving';
      if (v.status === 'halted') return 'halt';
      return 'offline';
    };

    const vList = Object.values(vehicles);

    // 1. Update vehicle markers with Directional Heading Arrow
    vList.forEach((v) => {
      const activeTrip = trips.find((t) => t.status === 'active' && t.truckPlate === v.plate);
      const isTripEnded = !activeTrip && (v.lastSeen?.toLowerCase().includes('trip ended') || v.lastSeen?.toLowerCase().includes('arrived'));
      const cat = isTripEnded ? 'arrived' : getVehicleCat(v);
      const isSelected = v.id === selectedVehicleId;
      const lat = v.lat || 13.0827;
      const lng = v.lng || 80.2707;

      // Heading Direction Bezel for Moving Vehicles (Blue pointer matching user's Image)
      let headingBezelHtml = '';
      if (cat === 'moving') {
        const clean = cleanVehicleRoute(v);
        if (clean && clean.length >= 2) {
          let p1 = clean[clean.length - 2];
          const p2 = clean[clean.length - 1];
          if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 0.0001 && clean.length >= 3) {
            p1 = clean[clean.length - 3];
          }
          const heading = calculateHeading(p1, p2);
          headingBezelHtml = `
              <div class="heading-bezel" style="transform: rotate(${heading}deg);">
                  <span class="heading-arrow-marker">▲</span>
              </div>
          `;
        }
      }

      const palette = ROUTE_PALETTES[v.id] || { main: '#2563eb', dark: '#1d4ed8', light: '#60a5fa', accent: '#3b82f6', labelBg: '#eff6ff', name: 'Corridor' };

      const iconHtml = `
        <div class="custom-map-pin">
            <div class="map-pin-icon-circle ${cat} ${isSelected ? 'selected' : ''}" style="${isSelected ? `box-shadow: 0 0 0 3px #ffffff, 0 0 0 5px ${palette.main}; border-color: ${palette.main};` : `border-color: #ffffff;`}">
                <span>🚚</span>
                ${headingBezelHtml}
            </div>
            <div class="map-pin-pointer" style="${isSelected ? `border-top-color: ${palette.main};` : ''}"></div>
            <div class="map-pin-label ${isSelected ? 'selected' : ''}" style="${isSelected ? `border-color: ${palette.main}; box-shadow: 0 2px 10px rgba(0,0,0,0.3);` : ''}">
                <span class="pin-status-dot ${cat}" style="${cat === 'moving' ? `background-color: ${palette.main};` : ''}"></span>
                <span style="font-weight: 700;">${v.plate}</span>
            </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'truck-pin-wrapper',
        iconSize: [96, 56],
        iconAnchor: [48, 37],
        popupAnchor: [0, -37],
      });

      const zIndexVal = isSelected ? 3000 : 1500;

      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng([lat, lng]);
        markersRef.current[v.id].setIcon(customIcon);
        if (!map.hasLayer(markersRef.current[v.id])) {
          markersRef.current[v.id].addTo(map);
        }
        markersRef.current[v.id].setZIndexOffset(zIndexVal);
      } else {
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: zIndexVal,
        }).addTo(map);

        marker.on('click', () => {
          onSelectVehicle(v.id);
        });
        markersRef.current[v.id] = marker;
      }
    });

    // Remove obsolete markers
    Object.keys(markersRef.current).forEach((vid) => {
      if (!vehicles[vid]) {
        map.removeLayer(markersRef.current[vid]);
        delete markersRef.current[vid];
      }
    });

    // Clean old routes, casings, origins, destinations, and direction arrows
    Object.keys(routeLayersRef.current).forEach((vid) => {
      map.removeLayer(routeLayersRef.current[vid]);
      delete routeLayersRef.current[vid];
    });
    Object.keys(routeCasingsRef.current).forEach((vid) => {
      map.removeLayer(routeCasingsRef.current[vid]);
      delete routeCasingsRef.current[vid];
    });
    Object.keys(originMarkersRef.current).forEach((vid) => {
      map.removeLayer(originMarkersRef.current[vid]);
      delete originMarkersRef.current[vid];
    });
    Object.keys(destMarkersRef.current).forEach((vid) => {
      map.removeLayer(destMarkersRef.current[vid]);
      delete destMarkersRef.current[vid];
    });
    Object.keys(forwardCorridorLayersRef.current).forEach((vid) => {
      map.removeLayer(forwardCorridorLayersRef.current[vid]);
      delete forwardCorridorLayersRef.current[vid];
    });
    Object.keys(forwardCorridorCasingsRef.current).forEach((vid) => {
      map.removeLayer(forwardCorridorCasingsRef.current[vid]);
      delete forwardCorridorCasingsRef.current[vid];
    });
    directionArrowsRef.current.forEach((marker) => {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    directionArrowsRef.current = [];

    // Render Routes, Origins, and Destinations
    vList.forEach((v) => {
      const cleanRoute = cleanVehicleRoute(v);
      if (!cleanRoute || cleanRoute.length < 2) return;
      if (routeFilterMode === 'selected' && v.id !== selectedVehicleId) return;

      const activeTrip = trips.find((t) => t.status === 'active' && t.truckPlate === v.plate);
      const isTripEnded = !activeTrip && (v.lastSeen?.toLowerCase().includes('trip ended') || v.lastSeen?.toLowerCase().includes('arrived'));
      const isSelected = v.id === selectedVehicleId;
      const palette = ROUTE_PALETTES[v.id] || { main: '#2563eb', dark: '#1d4ed8', light: '#60a5fa', accent: '#3b82f6', labelBg: '#eff6ff', name: 'Corridor' };
      const strokeColor = isSelected ? palette.dark : palette.main;
      const strokeWidth = isSelected ? 5.5 : 3.8;
      const strokeOpacity = isSelected ? 1.0 : (routeFilterMode === 'all' ? 0.95 : 0.35);
      const dashArray = isSelected ? undefined : '8, 8';

      // 1. Underlay white casing so polyline never blends into background
      const casing = L.polyline(cleanRoute, {
        color: '#ffffff',
        weight: isSelected ? 9.5 : 7,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routeCasingsRef.current[v.id] = casing;

      // 2. Main polyline with distinct route color
      const line = L.polyline(cleanRoute, {
        color: strokeColor,
        weight: strokeWidth,
        opacity: strokeOpacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const driver = v.driverId ? drivers[v.driverId] : null;
      const driverName = driver ? driver.name : 'Unassigned';
      line.bindTooltip(`<b>${v.plate}</b> · ${palette.name}<br>Driver: ${driverName} · ${v.model}`, {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
      });

      line.on('click', () => {
        onSelectVehicle(v.id);
      });

      routeLayersRef.current[v.id] = line;

      // 3. Origin checkpoint marker with Start badge
      const originCoord = cleanRoute[0];
      if (originCoord && originCoord.length >= 2) {
        const startTimeStr = v.startTime || driver?.onDutySince || '06:12';
        const startLocStr = v.startLocation || 'Logistics Depot';

        if (isSelected) {
          const startDivIcon = L.divIcon({
            className: 'map-start-pin-wrapper',
            html: `
              <div class="map-start-pin" style="border-color: ${palette.main};">
                <div class="map-start-badge" style="background: ${palette.dark}; color: #ffffff;">Start ${startTimeStr}</div>
                <div class="map-start-dot" style="background: ${palette.main};"></div>
              </div>
            `,
            iconSize: [84, 38],
            iconAnchor: [42, 34],
          });

          const startMarker = L.marker(originCoord, {
            icon: startDivIcon,
            zIndexOffset: 2800,
          }).addTo(map);

          startMarker.bindTooltip(
            `📍 <b>Starting Point:</b> ${startLocStr}<br>⏱️ <b>Departed:</b> ${startTimeStr}`,
            { direction: 'top', offset: [0, -32] }
          );

          startMarker.on('click', () => {
            onSelectVehicle(v.id);
          });

          originMarkersRef.current[v.id] = startMarker;
        } else {
          const originDot = L.circleMarker(originCoord, {
            radius: 4.5,
            color: strokeColor,
            fillColor: '#ffffff',
            fillOpacity: 1.0,
            weight: 2.5,
          }).addTo(map);

          originDot.bindTooltip(`📍 Origin: ${v.plate} (${palette.name})`, {
            direction: 'top',
            offset: [0, -6],
          });

          originDot.on('click', () => {
            onSelectVehicle(v.id);
          });

          originMarkersRef.current[v.id] = originDot;
        }
      }

      // 4. Destination Pin & Forward Highway Corridor Preview (matching user's Image)
      if (isSelected) {
        const destInfo = getVehicleDestinationInfo(v, driver, isTripEnded);
        if (destInfo && destInfo.coords) {
          // A. Forward Highway Corridor Polyline (Destination Way Preview)
          if (destInfo.forwardWaypoints && destInfo.forwardWaypoints.length >= 2) {
            const forwardCasing = L.polyline(destInfo.forwardWaypoints, {
              color: '#ffffff',
              weight: 8,
              opacity: 0.92,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map);
            forwardCorridorCasingsRef.current[v.id] = forwardCasing;

            const forwardLine = L.polyline(destInfo.forwardWaypoints, {
              color: palette.main,
              weight: 4.5,
              opacity: 0.95,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map);

            forwardLine.bindTooltip(
              `🛣️ <b>${palette.name} Preview:</b> To ${destInfo.name}<br>⏱️ <b>ETA:</b> ${destInfo.eta} · <b>Remaining:</b> ${destInfo.remainingDist}`,
              { sticky: true, direction: 'top', offset: [0, -10] }
            );

            forwardCorridorLayersRef.current[v.id] = forwardLine;

            // Render directional chevrons (➤) along forward route segments
            for (let i = 0; i < destInfo.forwardWaypoints.length - 1; i++) {
              const p1 = destInfo.forwardWaypoints[i];
              const p2 = destInfo.forwardWaypoints[i + 1];
              const midLat = (p1[0] + p2[0]) / 2;
              const midLng = (p1[1] + p2[1]) / 2;

              const dLat = p2[0] - p1[0];
              const dLng = (p2[1] - p1[1]) * Math.cos((p1[0] * Math.PI) / 180);
              const bearing = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);

              const arrowIcon = L.divIcon({
                className: 'route-dir-arrow-wrap',
                html: `<div class="route-dir-arrow" style="transform: rotate(${bearing - 90}deg); color: ${palette.dark};">➤</div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              });

              const arrowMarker = L.marker([midLat, midLng], {
                icon: arrowIcon,
                interactive: false,
                zIndexOffset: 1500,
              }).addTo(map);

              directionArrowsRef.current.push(arrowMarker);
            }
          }

          // B. Destination Pin Marker (Compact, Sleek Pin 🏁 Madhavaram / Sriperumbudur)
          const shortDestName = (destInfo.name || 'Destination')
            .replace(/logistics\s*(park|hub|yard|terminal)?/i, '')
            .replace(/industrial\s*(hub|estate|bay)?/i, '')
            .replace(/freight\s*(hub|terminal|bay|bypass)?/i, '')
            .trim()
            .split(/[\s·,/]+/)[0] || 'Destination';

          const destDivIcon = L.divIcon({
            className: 'map-dest-pin-wrapper',
            html: `
              <div class="map-dest-pin" style="border-color: ${palette.main};">
                <div class="map-dest-badge" style="background: ${palette.dark}; color: #ffffff;">🏁 ${shortDestName}</div>
                <div class="map-dest-dot" style="background: ${palette.main};"></div>
              </div>
            `,
            iconSize: [92, 30],
            iconAnchor: [46, 26],
          });

          const destMarker = L.marker(destInfo.coords, {
            icon: destDivIcon,
            zIndexOffset: 2900,
          }).addTo(map);

          destMarker.bindTooltip(
            `🏁 <b>Destination:</b> ${destInfo.name}<br>⏱️ <b>ETA:</b> ${destInfo.eta}<br>🛣️ <b>Remaining Distance:</b> ${destInfo.remainingDist}<br>🚚 <b>Assigned Truck:</b> ${v.plate}`,
            { direction: 'top', offset: [0, -28] }
          );

          destMarker.on('click', () => {
            onSelectVehicle(v.id);
          });

          destMarkersRef.current[v.id] = destMarker;
        }
      }
    });

    if (selectedVehicleId) {
      if (routeCasingsRef.current[selectedVehicleId]) routeCasingsRef.current[selectedVehicleId].bringToFront();
      if (routeLayersRef.current[selectedVehicleId]) routeLayersRef.current[selectedVehicleId].bringToFront();
    }

    // Ensure all vehicle truck markers float on top of route polylines and are in DOM
    Object.keys(markersRef.current).forEach((vid) => {
      const marker = markersRef.current[vid];
      if (marker) {
        if (!map.hasLayer(marker)) {
          marker.addTo(map);
        }
        marker.setZIndexOffset(vid === selectedVehicleId ? 3000 : 1500);
      }
    });
  }, [vehicles, drivers, selectedVehicleId, routeFilterMode, onSelectVehicle]);

  // Camera pan ONLY when the user explicitly changes selected vehicle (NEVER on periodic ticker ticks)
  const prevSelectedVehicleIdRef = useRef<string | null>(null);
  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;

  useEffect(() => {
    // If it's the very first mount, skip so fitMapToAllVehicles sets the overview
    if (prevSelectedVehicleIdRef.current === null) {
      prevSelectedVehicleIdRef.current = selectedVehicleId;
      return;
    }

    // Only pan if the user selected a DIFFERENT vehicle
    if (prevSelectedVehicleIdRef.current !== selectedVehicleId) {
      prevSelectedVehicleIdRef.current = selectedVehicleId;

      const map = mapInstanceRef.current;
      if (!map) return;
      const v = vehiclesRef.current[selectedVehicleId];
      if (v && v.lat && v.lng) {
        map.panTo([v.lat, v.lng], {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [selectedVehicleId]);

  return (
    <div className="live-map-center">
      {/* 1. Live Map Overlay Top Bar (Live Status + Route Filter + Show All Vehicles) */}
      <div className="live-map-overlay-top">
        <div className="live-status-pill">
          <span className="live-pulse-dot"></span>
          <span>Live - refreshes every 5 s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`btn-toggle-route-filter ${routeFilterMode === 'selected' ? 'focused' : ''}`}
            id="btnToggleRouteFilter"
            onClick={() => setRouteFilterMode(routeFilterMode === 'all' ? 'selected' : 'all')}
            title="Toggle between all routes and selected vehicle route only"
          >
            <span id="routeFilterIcon">{routeFilterMode === 'selected' ? '🎯' : '🛣️'}</span>{' '}
            <span id="routeFilterText">
              {routeFilterMode === 'selected' ? 'Focused Route' : 'All Routes'}
            </span>
          </button>
          <button
            type="button"
            className="btn-show-all-vehicles"
            onClick={() => fitMapToAllVehicles(true)}
          >
            Show all vehicles
          </button>
        </div>
      </div>

      {/* 2. Map Canvas Element */}
      <div ref={mapContainerRef} id="fleetMap" className="live-leaflet-map" style={{ width: '100%', height: '100%' }} />

      {/* 3. Bottom-Left: Map Type Switcher Dock (Satellite vs Streets Thumbnail Cards) */}
      <div className="map-type-dock" id="mapTypeDock">
        <span className="map-type-dock-title">Map type</span>
        <div className="map-type-cards-row">
          <button
            type="button"
            className={`map-type-card ${mapType === 'satellite' ? 'active' : ''}`}
            id="cardMapSatellite"
            onClick={() => setMapType('satellite')}
            title="Satellite Aerial View (ESRI World Imagery)"
          >
            <div className="map-card-thumb thumb-satellite">
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="6" fill="#1e293b" />
                <path d="M0 16L36 24" stroke="#64748b" strokeWidth="4" />
                <path d="M10 0L24 36" stroke="#475569" strokeWidth="3" />
                <circle cx="18" cy="18" r="10" fill="#14532d" opacity="0.6" />
              </svg>
            </div>
            <span className="map-card-name">Satellite</span>
          </button>
          <button
            type="button"
            className={`map-type-card ${mapType === 'streets' ? 'active' : ''}`}
            id="cardMapStreets"
            onClick={() => setMapType('streets')}
            title="Detailed Street View (OpenStreetMap)"
          >
            <div className="map-card-thumb thumb-default">
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="6" fill="#bae6fd" />
                <path
                  d="M0 20C10 20 14 14 24 16C30 17 33 11 36 8V36H0V20Z"
                  fill="#86efac"
                />
                <path d="M0 26C10 22 18 28 36 22" stroke="#0284c7" strokeWidth="3" />
              </svg>
            </div>
            <span className="map-card-name">Streets</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom-Center: Status Legend Dock Pill */}
      <div className="map-legend-dock">
        <span className="legend-item">
          <span className="legend-dot moving"></span> Moving
        </span>
        <span className="legend-item">
          <span className="legend-dot halt"></span> Halt
        </span>
        <span className="legend-item">
          <span className="legend-dot offline"></span> Offline
        </span>
        <span
          className="legend-item"
          style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '8px' }}
        >
          <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '12px' }}>┅┅</span> Dest. Way
        </span>
        <span className="legend-item">
          <span style={{ fontSize: '12px' }}>🏁</span> Destination
        </span>
      </div>

      {/* 5. Bottom-Right: Dedicated Zoom Controls Dock (+ and −) */}
      <div className="map-zoom-dock">
        <button
          type="button"
          className="btn-map-zoom-ctrl"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom in"
        >
          +
        </button>
        <div className="zoom-divider"></div>
        <button
          type="button"
          className="btn-map-zoom-ctrl"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
};
