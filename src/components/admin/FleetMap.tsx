import React, { useEffect, useRef, useCallback } from 'react';
import * as L from 'leaflet';
import { useFleet } from '../../context/FleetContext';
import { Vehicle } from '../../types/fleet';

interface FleetMapProps {
  onSelectVehicle: (id: string) => void;
}

const DEFAULT_MAP_CENTER: [number, number] = [12.985, 80.03];
const DEFAULT_MAP_ZOOM = 10;

export const FleetMap: React.FC<FleetMapProps> = ({ onSelectVehicle }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const satelliteGroupRef = useRef<L.LayerGroup | null>(null);
  const streetsLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const routeLayersRef = useRef<Record<string, L.Polyline>>({});
  const routeCasingsRef = useRef<Record<string, L.Polyline>>({});
  const originMarkersRef = useRef<Record<string, L.CircleMarker>>({});

  const {
    vehicles,
    drivers,
    selectedVehicleId,
    mapType,
    setMapType,
    routeFilterMode,
    setRouteFilterMode,
  } = useFleet();

  // Fit map to show all vehicles and routes (matching fitMapToAllVehicles in admin.js)
  const fitMapToAllVehicles = useCallback((animate = false) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const coords: [number, number][] = [];
    Object.values(vehicles).forEach((v) => {
      if (v.lat && v.lng && v.lat >= 12.6 && v.lat <= 13.4) {
        coords.push([v.lat, v.lng]);
      }
      if (v.route && Array.isArray(v.route)) {
        v.route.forEach((pt) => {
          if (pt && pt.length >= 2 && pt[0] >= 12.6 && pt[0] <= 13.4) {
            coords.push([pt[0], pt[1]]);
          }
        });
      }
    });

    if (coords.length > 0) {
      map.fitBounds(coords, {
        padding: [45, 45],
        maxZoom: 10,
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

    const satelliteGroup = L.layerGroup([satelliteBase, satellitePlaces]);
    satelliteGroupRef.current = satelliteGroup;

    // 3. Streets Layer (OSM)
    const streetsLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 2,
      maxNativeZoom: 19,
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap | V3 Logistics',
    });
    streetsLayerRef.current = streetsLayer;

    // Default layer
    satelliteGroup.addTo(map);

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        fitMapToAllVehicles(false);
      }
    }, 150);

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        fitMapToAllVehicles(false);
      }
    }, 450);

    return () => {
      // Clean up all marker references so re-mount creates them cleanly on the new map
      Object.values(markersRef.current).forEach((m) => {
        try { map.removeLayer(m); } catch (e) {}
      });
      markersRef.current = {};

      Object.values(routeLayersRef.current).forEach((l) => {
        try { map.removeLayer(l); } catch (e) {}
      });
      routeLayersRef.current = {};

      Object.values(routeCasingsRef.current).forEach((c) => {
        try { map.removeLayer(c); } catch (e) {}
      });
      routeCasingsRef.current = {};

      Object.values(originMarkersRef.current).forEach((o) => {
        try { map.removeLayer(o); } catch (e) {}
      });
      originMarkersRef.current = {};

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
  }, [mapType]);

  // Update Markers and Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const getVehicleCat = (v: Vehicle): string => {
      if (v.status === 'driving') return 'moving';
      if (v.status === 'halted') return 'halt';
      return 'offline';
    };

    const vList = Object.values(vehicles);

    // Update vehicle markers
    vList.forEach((v) => {
      const cat = getVehicleCat(v);
      const isSelected = v.id === selectedVehicleId;
      const lat = v.lat || 13.0827;
      const lng = v.lng || 80.2707;

      const iconHtml = `
        <div class="custom-map-pin">
            <div class="map-pin-icon-circle ${cat} ${isSelected ? 'selected' : ''}">
                <span>🚚</span>
            </div>
            <div class="map-pin-pointer"></div>
            <div class="map-pin-label">
                <span class="pin-status-dot ${cat}"></span>
                <span>${v.plate}</span>
            </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'truck-pin-wrapper',
        iconSize: [110, 72],
        iconAnchor: [55, 47],
        popupAnchor: [0, -47],
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

    // Clean old routes
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

    // Render Routes
    vList.forEach((v) => {
      if (!v.route || v.route.length < 2) return;
      if (routeFilterMode === 'selected' && v.id !== selectedVehicleId) return;

      const isSelected = v.id === selectedVehicleId;
      const strokeColor = isSelected ? '#1d4ed8' : '#0284c7';
      const strokeWidth = isSelected ? 5.5 : 3.5;
      const strokeOpacity = isSelected ? 1.0 : 0.85;
      const dashArray = isSelected ? undefined : '7, 9';

      // 1. Underlay white casing so polyline never blends into background
      const casing = L.polyline(v.route, {
        color: '#ffffff',
        weight: isSelected ? 9 : 6.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
      routeCasingsRef.current[v.id] = casing;

      // 2. Main polyline
      const line = L.polyline(v.route, {
        color: strokeColor,
        weight: strokeWidth,
        opacity: strokeOpacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      const driver = v.driverId ? drivers[v.driverId] : null;
      const driverName = driver ? driver.name : 'Unassigned';
      line.bindTooltip(`<b>${v.plate}</b> · ${driverName} · ${v.model}`, {
        sticky: true,
        direction: 'top',
        offset: [0, -10],
      });

      line.on('click', () => {
        onSelectVehicle(v.id);
      });

      routeLayersRef.current[v.id] = line;

      // 3. Origin dispatch point marker
      const startPt = v.route[0];
      const originDot = L.circleMarker(startPt, {
        radius: isSelected ? 5.5 : 4,
        color: strokeColor,
        fillColor: '#ffffff',
        fillOpacity: 1.0,
        weight: 2.5,
      }).addTo(map);

      originDot.bindTooltip(`📍 Origin: ${v.plate} dispatch point`, {
        direction: 'top',
        offset: [0, -6],
      });

      originDot.on('click', () => {
        onSelectVehicle(v.id);
      });

      originMarkersRef.current[v.id] = originDot;
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

  // Smooth pan to selected vehicle (skip initial mount so overview bounds fit all vehicles)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const map = mapInstanceRef.current;
    const v = vehicles[selectedVehicleId];
    if (map && v && v.lat && v.lng) {
      map.panTo([v.lat, v.lng], { animate: true, duration: 0.5 });
    }
  }, [selectedVehicleId]);

  const handleShowAllVehicles = () => {
    fitMapToAllVehicles(true);
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const toggleRouteFilter = () => {
    setRouteFilterMode(routeFilterMode === 'all' ? 'selected' : 'all');
  };

  return (
    <div className="live-map-center">
      <div className="live-map-overlay-top">
        <div className="live-status-pill">
          <span className="live-pulse-dot"></span>
          <span>Live - refreshes every 5 s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-toggle-route-filter"
            id="btnToggleRouteFilter"
            onClick={toggleRouteFilter}
            title="Toggle between all routes and selected vehicle route only"
          >
            <span id="routeFilterIcon">{routeFilterMode === 'all' ? '🛣️' : '🎯'}</span>{' '}
            <span id="routeFilterText">{routeFilterMode === 'all' ? 'All Routes' : 'Selected Only'}</span>
          </button>
          <button type="button" className="btn-show-all-vehicles" onClick={handleShowAllVehicles}>
            Show all vehicles
          </button>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div ref={mapContainerRef} id="fleetMap" className="live-leaflet-map" style={{ width: '100%', height: '100%' }}></div>

      {/* Map Type Switcher Dock */}
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
                <path d="M0 20C10 20 14 14 24 16C30 17 33 11 36 8V36H0V20Z" fill="#86efac" />
                <path d="M0 26C10 22 18 28 36 22" stroke="#0284c7" strokeWidth="3" />
              </svg>
            </div>
            <span className="map-card-name">Streets</span>
          </button>
        </div>
      </div>

      {/* Dedicated Zoom Controls */}
      <div className="map-zoom-dock">
        <button type="button" className="btn-map-zoom-ctrl" onClick={handleZoomIn} title="Zoom in">
          +
        </button>
        <div className="zoom-divider"></div>
        <button type="button" className="btn-map-zoom-ctrl" onClick={handleZoomOut} title="Zoom out">
          −
        </button>
      </div>
    </div>
  );
};
