import React, { useEffect, useRef, useCallback } from 'react';
import * as L from 'leaflet';
import { useDriver } from '../../context/DriverContext';

export const DriverMiniMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const breadcrumbLineRef = useRef<L.Polyline | null>(null);
  const breadcrumbsRef = useRef<[number, number][]>([]);
  const arrowsRef = useRef<L.Marker[]>([]);

  const { profile, currentLat, currentLng } = useDriver();

  // Initialize Driver Mini Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = currentLat || profile.startCoords[0];
    const startLng = currentLng || profile.startCoords[1];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([startLat, startLng], 12);

    mapInstanceRef.current = map;

    // OpenStreetMap Streets
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // 1. Google Maps Navigation Route (Dual-Layer Blue Highway Ribbon)
    if (profile.corridorPoints && profile.corridorPoints.length > 0) {
      // Casing shadow
      L.polyline(profile.corridorPoints, {
        color: '#1e3a8a',
        weight: 7,
        opacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Vibrant Electric Blue route line
      L.polyline(profile.corridorPoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // 2. Render Direction Chevrons along each segment
      arrowsRef.current = [];
      const pts = profile.corridorPoints;
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
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
    }

    // 3. Start Marker (Green Origin Pin with bubble)
    if (profile.startCoords) {
      const startIcon = L.divIcon({
        className: 'nav-pin-wrap',
        html: `
          <div class="nav-pin-bubble start">🟢 START</div>
          <div class="nav-pin-stem"></div>
          <div class="nav-pin-dot start"></div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 40],
      });
      L.marker(profile.startCoords, { icon: startIcon, zIndexOffset: 800 }).addTo(map);
    }

    // 4. Destination Marker (Red Destination Pin with bubble)
    if (profile.destCoords) {
      const destIcon = L.divIcon({
        className: 'nav-pin-wrap',
        html: `
          <div class="nav-pin-bubble dest">DESTINATION</div>
          <div class="nav-pin-stem"></div>
          <div class="nav-pin-dot dest"></div>
        `,
        iconSize: [110, 40],
        iconAnchor: [55, 40],
      });
      L.marker(profile.destCoords, { icon: destIcon, zIndexOffset: 800 }).addTo(map);
    }

    // 5. Live Breadcrumb Path (Emerald Trail)
    breadcrumbsRef.current = [[startLat, startLng]];
    breadcrumbLineRef.current = L.polyline(breadcrumbsRef.current, {
      color: '#059669',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // 6. Custom Live Truck Marker Pin
    const truckIcon = L.divIcon({
      className: 'driver-truck-pin-wrap',
      html: `<div class="driver-truck-pin">🚚</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    markerRef.current = L.marker([startLat, startLng], {
      icon: truckIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    // Fit bounds to encompass start, destination, and truck
    if (profile.startCoords && profile.destCoords) {
      const bounds = L.latLngBounds([profile.startCoords, profile.destCoords]);
      bounds.extend([startLat, startLng]);
      map.fitBounds(bounds, { padding: [22, 22] });
    }

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        if (profile.startCoords && profile.destCoords) {
          const bounds = L.latLngBounds([profile.startCoords, profile.destCoords]);
          bounds.extend([startLat, startLng]);
          map.fitBounds(bounds, { padding: [22, 22] });
        }
      }
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [profile]);

  // Update marker position and breadcrumbs on coord change
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

  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current && currentLat && currentLng) {
      mapInstanceRef.current.setView([currentLat, currentLng], 13, { animate: true });
    } else if (mapInstanceRef.current && profile.startCoords && profile.destCoords) {
      const bounds = L.latLngBounds([profile.startCoords, profile.destCoords]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [22, 22], animate: true });
    }
  }, [currentLat, currentLng, profile]);

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
        <span id="mapRouteInfoText">{profile.routeInfo}</span>
      </div>
    </div>
  );
};
