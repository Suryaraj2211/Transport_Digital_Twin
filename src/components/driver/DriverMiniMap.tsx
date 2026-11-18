import React, { useEffect, useRef, useCallback } from 'react';
import * as L from 'leaflet';
import { useDriver } from '../../context/DriverContext';

export const DriverMiniMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const casingLineRef = useRef<L.Polyline | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const breadcrumbLineRef = useRef<L.Polyline | null>(null);
  const breadcrumbsRef = useRef<[number, number][]>([]);
  const arrowsRef = useRef<L.Marker[]>([]);

  const { profile, currentLat, currentLng } = useDriver();

  // Helper to render direction chevrons along highway segments
  const renderArrows = (map: L.Map, points: Array<[number, number]>) => {
    arrowsRef.current.forEach((m) => {
      if (map.hasLayer(m)) map.removeLayer(m);
    });
    arrowsRef.current = [];

    if (!points || points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midLat = (p1[0] + p2[0]) / 2;
      const midLng = (p1[1] + p2[1]) / 2;

      const dLat = p2[0] - p1[0];
      const dLng = (p2[1] - p1[1]) * Math.cos((p1[0] * Math.PI) / 180);
      const bearing = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);

      const arrowIcon = L.divIcon({
        className: 'route-dir-arrow-wrap',
        html: `<div class="route-dir-arrow" style="transform: rotate(${bearing - 90}deg);">➤</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const arrowMarker = L.marker([midLat, midLng], {
        icon: arrowIcon,
        interactive: false,
        zIndexOffset: 100,
      }).addTo(map);

      arrowsRef.current.push(arrowMarker);
    }
  };

  // Helper icons matching Transport_Digital_Twin exactly
  const getStartIcon = () =>
    L.divIcon({
      className: 'nav-pin-wrap',
      html: `
        <div class="nav-pin-bubble start">🟢 START</div>
        <div class="nav-pin-stem"></div>
        <div class="nav-pin-dot start"></div>
      `,
      iconSize: [80, 40],
      iconAnchor: [40, 40],
    });

  const getDestIcon = () =>
    L.divIcon({
      className: 'nav-pin-wrap',
      html: `
        <div class="nav-pin-bubble dest">🏁 DESTINATION</div>
        <div class="nav-pin-stem"></div>
        <div class="nav-pin-dot dest"></div>
      `,
      iconSize: [110, 40],
      iconAnchor: [55, 40],
    });

  const getTruckIcon = () =>
    L.divIcon({
      className: 'driver-truck-pin-wrap',
      html: `<div class="driver-truck-pin">🚚</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

  // 1. Initialize Map and Draw Complete Route Ribbon & Pins
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map = mapInstanceRef.current;
    const startCoords = profile?.startCoords || [13.0694, 80.1948];
    const destCoords = profile?.destCoords || [12.9818, 79.9442];
    const corridorPoints =
      profile?.corridorPoints && profile.corridorPoints.length > 1
        ? profile.corridorPoints
        : [startCoords, destCoords];

    // Create Leaflet map instance if not already created
    if (!map) {
      map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(startCoords, 12);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // 1. Casing Shadow Line
    if (!casingLineRef.current || !map.hasLayer(casingLineRef.current)) {
      casingLineRef.current = L.polyline(corridorPoints, {
        color: '#1e3a8a',
        weight: 7,
        opacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      casingLineRef.current.setLatLngs(corridorPoints);
    }

    // 2. Vibrant Google Electric Blue Highway Ribbon
    if (!routeLineRef.current || !map.hasLayer(routeLineRef.current)) {
      routeLineRef.current = L.polyline(corridorPoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      routeLineRef.current.setLatLngs(corridorPoints);
    }

    // 3. Direction Chevrons along highway
    renderArrows(map, corridorPoints);

    // 4. Start Marker (Green Origin Pin)
    if (!startMarkerRef.current || !map.hasLayer(startMarkerRef.current)) {
      startMarkerRef.current = L.marker(startCoords, {
        icon: getStartIcon(),
        zIndexOffset: 800,
      }).addTo(map);
    } else {
      startMarkerRef.current.setLatLng(startCoords);
    }

    // 5. Destination Marker (Red Destination Pin with 🏁)
    if (!destMarkerRef.current || !map.hasLayer(destMarkerRef.current)) {
      destMarkerRef.current = L.marker(destCoords, {
        icon: getDestIcon(),
        zIndexOffset: 800,
      }).addTo(map);
    } else {
      destMarkerRef.current.setLatLng(destCoords);
    }

    // 6. Live Truck Marker Pin
    const curLat = currentLat || startCoords[0];
    const curLng = currentLng || startCoords[1];

    if (!markerRef.current || !map.hasLayer(markerRef.current)) {
      markerRef.current = L.marker([curLat, curLng], {
        icon: getTruckIcon(),
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([curLat, curLng]);
    }

    // 7. Breadcrumb Path
    breadcrumbsRef.current = [[curLat, curLng]];
    if (!breadcrumbLineRef.current || !map.hasLayer(breadcrumbLineRef.current)) {
      breadcrumbLineRef.current = L.polyline(breadcrumbsRef.current, {
        color: '#059669',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      breadcrumbLineRef.current.setLatLngs(breadcrumbsRef.current);
    }

    // 8. Fit bounds to encompass the entire route from Start to Destination
    const fitTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const bounds = L.latLngBounds([startCoords, destCoords]);
        bounds.extend([curLat, curLng]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35] });
      }
    }, 150);

    return () => {
      clearTimeout(fitTimer);
    };
  }, [profile?.driverId, profile?.vehicleId]);

  // 2. Smooth Live Coordinate Updates (moves only truck pin & breadcrumb trail without reloading map)
  useEffect(() => {
    if (markerRef.current && currentLat && currentLng) {
      markerRef.current.setLatLng([currentLat, currentLng]);

      breadcrumbsRef.current.push([currentLat, currentLng]);
      if (breadcrumbsRef.current.length > 250) breadcrumbsRef.current.shift();
      if (breadcrumbLineRef.current) {
        breadcrumbLineRef.current.setLatLngs(breadcrumbsRef.current);
      }
    }
  }, [currentLat, currentLng]);

  // 3. Recenter Button handler (fits view back to route)
  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !profile) return;

    if (profile.startCoords && profile.destCoords) {
      const bounds = L.latLngBounds([profile.startCoords, profile.destCoords]);
      if (currentLat && currentLng) {
        bounds.extend([currentLat, currentLng]);
      }
      map.fitBounds(bounds, { padding: [35, 35], animate: true });
    } else if (currentLat && currentLng) {
      map.setView([currentLat, currentLng], 13, { animate: true });
    }
  }, [currentLat, currentLng, profile]);

  // 4. Safe cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        casingLineRef.current = null;
        routeLineRef.current = null;
        startMarkerRef.current = null;
        destMarkerRef.current = null;
        markerRef.current = null;
        breadcrumbLineRef.current = null;
        arrowsRef.current = [];
      }
    };
  }, []);

  return (
    <div className="map-card-wrapper">
      <div className="map-floating-overlay">
        <button
          type="button"
          className="btn-map-recenter"
          id="btnRecenterMap"
          onClick={handleRecenter}
          title="Recenter on truck / route"
        >
          🎯
        </button>
      </div>
      <div ref={mapContainerRef} id="driverMap" className="driver-mini-map"></div>
      <div className="map-route-info-badge" id="mapRouteInfoBadge">
        <span className="route-info-icon">🛣️</span>
        <span id="mapRouteInfoText">{profile?.routeInfo}</span>
      </div>
    </div>
  );
};
