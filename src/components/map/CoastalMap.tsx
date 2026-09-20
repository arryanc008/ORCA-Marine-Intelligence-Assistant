import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CoastalLocation, WeatherData, MarineData, SafetyAssessment, ZoneQualityAssessment, PFZRecommendation, SafeRouteResult } from '../../types';
import { COASTAL_LOCATIONS } from '../../data/locations';
import { RESTRICTED_MARINE_ZONES, checkGeofence } from '../../data/restrictedZones';
import { suggestSafeRoute } from '../../services/marine/routeService';
import { findValidOffshorePFZ } from '../../services/marine/coastalGeography';
import { useLanguage } from '../../context/LanguageContext';
import { Compass, Navigation, RotateCcw, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface CoastalMapProps {
  selectedLocation: CoastalLocation;
  onSelectLocation: (loc: CoastalLocation) => void;
  stationDataMap: Record<string, { weather: WeatherData; marine: MarineData; safety: SafetyAssessment; zoneQuality: ZoneQualityAssessment }>;
  recommendedPFZ?: PFZRecommendation | null;
  safeRoute?: SafeRouteResult | null;
  onRouteGenerated?: (route: SafeRouteResult) => void;
  fillHeight?: boolean;
}

export const CoastalMap: React.FC<CoastalMapProps> = ({
  selectedLocation,
  onSelectLocation,
  stationDataMap,
  recommendedPFZ,
  safeRoute,
  onRouteGenerated,
  fillHeight = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const zoneLayersRef = useRef<L.Polygon[]>([]);
  const pfzMarkerRef = useRef<L.Marker | null>(null);
  const pfzBoundaryRef = useRef<L.Circle | null>(null);
  const pfzLineRef = useRef<L.Polyline | null>(null);
  const vesselMarkerRef = useRef<L.Marker | null>(null);

  // Dynamic Route Polyline Refs
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowRef = useRef<L.Polyline | null>(null);
  const straightLineRef = useRef<L.Polyline | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
  const destMarkerRef = useRef<L.Marker | null>(null);

  const [activeRoute, setActiveRoute] = useState<SafeRouteResult | null>(safeRoute || null);
  const [customDestination, setCustomDestination] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [isClickRoutingEnabled, setIsClickRoutingEnabled] = useState<boolean>(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);

  const { t, language, getLocationName, getStateName, getCoastName } = useLanguage();

  // Sync prop safeRoute into state
  useEffect(() => {
    if (safeRoute) {
      setActiveRoute(safeRoute);
    }
  }, [safeRoute]);

  // Fit bounds helper
  const handleFitRoute = useCallback(() => {
    if (mapInstanceRef.current && routePolylineRef.current) {
      try {
        const bounds = routePolylineRef.current.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 9 });
        }
      } catch (err) {
        console.warn('Could not fit bounds to route:', err);
      }
    }
  }, []);

  // Reset route back to default PFZ
  const handleResetToPFZ = useCallback(() => {
    setCustomDestination(null);
    if (recommendedPFZ) {
      const stationInfo = stationDataMap[selectedLocation.id];
      const marineSafety = stationInfo ? {
        waveHeight: stationInfo.marine.waveHeight,
        windSpeed: stationInfo.weather.windSpeed,
        thunderstormRisk: stationInfo.safety.criteria.thunderstormRisk
      } : undefined;

      const newRoute = suggestSafeRoute(
        selectedLocation.lat,
        selectedLocation.lon,
        recommendedPFZ.lat,
        recommendedPFZ.lon,
        {
          marineSafety,
          startName: getLocationName(selectedLocation),
          destName: `PFZ (${recommendedPFZ.distanceKm} km ${recommendedPFZ.bearing})`
        }
      );
      setActiveRoute(newRoute);
      if (onRouteGenerated) {
        onRouteGenerated(newRoute);
      }
    }
  }, [recommendedPFZ, selectedLocation, stationDataMap, onRouteGenerated, getLocationName]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.0, 78.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        className: 'dark-maritime-tiles',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | Open-Meteo Telemetry',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Auto-invalidate size on container dimension updates to ensure high-resolution canvas
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (vesselMarkerRef.current) {
        vesselMarkerRef.current.remove();
        vesselMarkerRef.current = null;
      }
      if (pfzBoundaryRef.current) {
        pfzBoundaryRef.current.remove();
        pfzBoundaryRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Restricted Marine Geofence Polygons
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    zoneLayersRef.current.forEach(layer => layer.remove());
    zoneLayersRef.current = [];

    RESTRICTED_MARINE_ZONES.forEach(feature => {
      const props = feature.properties;
      const isBorder = props.category === 'BORDER';
      const isSanctuary = props.category === 'SANCTUARY' || props.category === 'MPA';
      const isDefense = props.category === 'DEFENSE';

      const strokeColor = props.strokeColor || (isBorder ? '#DC2626' : isDefense ? '#D97706' : '#DC2626');
      const fillColor = props.fillColor || (isBorder ? '#DC2626' : isDefense ? '#D97706' : '#DC2626');

      // Convert GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
      const latLngs = feature.geometry.coordinates[0].map(([lon, lat]) => [lat, lon] as [number, number]);

      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        weight: 2,
        dashArray: isDefense ? '6, 6' : undefined,
        fillColor: fillColor,
        fillOpacity: 0.18,
      }).addTo(map);

      const zoneName = language === 'hi' ? props.hindiName : props.name;

      const popupContent = `
        <div class="p-2.5 font-sans text-[#F1F5F9] min-w-[220px]">
          <div class="flex items-center gap-2 border-b border-[#1E3A5F] pb-1.5 mb-1.5">
            <span class="text-base">⚠️</span>
            <div>
              <h4 class="font-bold text-xs text-[#F87171] uppercase tracking-wider">${t.restrictedMarineZone}</h4>
              <p class="font-bold text-sm text-[#F1F5F9]">${zoneName}</p>
            </div>
          </div>
          <div class="text-[11px] text-[#CBD5E1] space-y-1">
            <div class="flex justify-between">
              <span class="text-[#94A3B8]">Category:</span>
              <span class="font-mono text-[#FBBF24] font-bold">${props.typeLabel}</span>
            </div>
            <div class="text-[11px] text-[#E2E8F0] leading-snug pt-1">
              ${language === 'hi' ? props.hindiDescription : props.description}
            </div>
            <div class="pt-1.5 border-t border-[#1E3A5F] text-[10px] text-[#F87171] font-medium">
              ⚖️ ${props.legalNotice}
            </div>
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent);
      polygon.bindTooltip(zoneName, { permanent: false, direction: 'center' });
      zoneLayersRef.current.push(polygon);
    });
  }, [language, t]);

  // Render 15 Coastal Harbor Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m: any) => m?.remove?.());
    markersRef.current = {};

    COASTAL_LOCATIONS.forEach(loc => {
      const stationInfo = stationDataMap[loc.id];
      const isSelected = loc.id === selectedLocation.id;
      const isUnsafe = stationInfo?.safety?.status === 'UNSAFE';
      const isCaution = stationInfo?.safety?.status === 'CAUTION';

      // Marine Teal for safe/normal, Amber for caution, Muted Red for unsafe
      const pinBg = isUnsafe
        ? 'bg-[#DC2626]'
        : isCaution
        ? 'bg-[#D97706]'
        : 'bg-[#0891B2]';

      const waveText = stationInfo ? `${stationInfo.marine.waveHeight}m` : '--';
      const windText = stationInfo ? `${stationInfo.weather.windSpeed} km/h` : '--';
      const sstText = stationInfo ? `${stationInfo.marine.seaSurfaceTemperature}°C` : '--';

      const localizedName = getLocationName(loc);
      const localizedState = getStateName(loc);
      const localizedCoast = getCoastName(loc);

      const customIcon = L.divIcon({
        className: 'custom-harbor-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${isSelected ? `
              <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0891B2] border-2 border-[#0B2545]"></span>
              </span>
            ` : ''}
            <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border border-[#0B2545]/80 shadow-md text-white transition-transform group-hover:scale-115 ${pinBg} ${isSelected ? 'ring-2 ring-[#0891B2] ring-offset-1 ring-offset-[#073B4C] scale-110' : ''}">
              ⚓
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-[#0B2545]/90 text-[#F1F5F9] text-[10px] font-bold border border-[#1E3A5F] whitespace-nowrap shadow-xs pointer-events-none">
              ${localizedName}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([loc.lat, loc.lon], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div class="p-2 min-w-[210px] font-sans text-[#F1F5F9]">
          <div class="flex items-center justify-between border-b border-[#1E3A5F] pb-1.5 mb-2">
            <div>
              <h3 class="font-bold text-sm text-[#F1F5F9]">${localizedName}</h3>
              <p class="text-[11px] text-[#94A3B8] font-medium">${localizedState} &bull; ${localizedCoast}</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              isUnsafe ? 'bg-[#7F1D1D]/80 text-[#FCA5A5] border border-[#DC2626]' :
              isCaution ? 'bg-[#78350F]/80 text-[#FDE68A] border border-[#D97706]' :
              'bg-[#064E3B]/80 text-[#5EEAD4] border border-[#0D9488]'
            }">
              ${stationInfo?.safety?.status || t.safe}
            </span>
          </div>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between items-center text-[#CBD5E1]">
              <span class="text-[#94A3B8] font-medium">🌊 ${t.wave}:</span>
              <strong class="text-[#38BDF8] font-mono font-bold">${waveText}</strong>
            </div>
            <div class="flex justify-between items-center text-[#CBD5E1]">
              <span class="text-[#94A3B8] font-medium">💨 ${t.wind}:</span>
              <strong class="text-[#38BDF8] font-mono font-bold">${windText}</strong>
            </div>
            <div class="flex justify-between items-center text-[#CBD5E1]">
              <span class="text-[#94A3B8] font-medium">🌡️ ${t.sst}:</span>
              <strong class="text-[#2DD4BF] font-mono font-bold">${sstText}</strong>
            </div>
            ${stationInfo?.safety?.criteria?.thunderstormRisk ? `
              <div class="pt-1.5 mt-1 border-t border-[#1E3A5F] text-[#FBBF24] font-bold text-[11px] flex items-center gap-1">
                <span>⚡</span>
                <span>${t.lightningAlert}</span>
              </div>
            ` : ''}
          </div>
          <button id="popup-select-${loc.id}" class="mt-2.5 w-full py-1.5 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs">
            ${t.analyzeStation}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectLocation(loc);
      });

      markersRef.current[loc.id] = marker;
    });
  }, [selectedLocation, language, t, stationDataMap, onSelectLocation, getLocationName, getStateName, getCoastName]);

  // Pan to selected location
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lon], 7, {
        duration: 1.2
      });
      const marker = markersRef.current[selectedLocation.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedLocation]);

  // Render Vessel/Fishing Boat Marker (White/Teal icon) at Selected Location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    const map = mapInstanceRef.current;

    if (vesselMarkerRef.current) {
      vesselMarkerRef.current.remove();
      vesselMarkerRef.current = null;
    }

    const localizedName = getLocationName(selectedLocation);

    const vesselIcon = L.divIcon({
      className: 'custom-vessel-marker',
      html: `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full bg-[#0891B2] text-white border-2 border-white shadow-md flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110">
            ⛵
          </div>
          <div class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-[#0B2545]/90 text-[#38BDF8] font-mono text-[9px] font-bold border border-[#1E3A5F] whitespace-nowrap shadow-xs pointer-events-none">
            ${localizedName} Fleet
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });

    const vesselMarker = L.marker([selectedLocation.lat - 0.05, selectedLocation.lon + 0.05], {
      icon: vesselIcon,
      zIndexOffset: 950
    }).addTo(map);

    vesselMarker.bindPopup(`
      <div class="p-2 font-sans text-[#F1F5F9] text-xs min-w-[200px]">
        <div class="font-bold text-[#38BDF8] flex items-center gap-1.5 border-b border-[#1E3A5F] pb-1.5 mb-1.5">
          <span>⛵</span> <span>Active Fishing Vessel</span>
        </div>
        <div class="text-[11px] text-[#CBD5E1] space-y-1">
          <div>Harbor Base: <strong class="text-[#F1F5F9]">${localizedName}</strong></div>
          <div class="text-[10px] text-[#94A3B8] font-mono">${(selectedLocation.lat - 0.05).toFixed(3)}°N, ${(selectedLocation.lon + 0.05).toFixed(3)}°E</div>
          <div class="text-[10px] text-[#2DD4BF] pt-1 border-t border-[#1E3A5F]">Status: Connected &bull; Telemetry Active</div>
        </div>
      </div>
    `);

    vesselMarkerRef.current = vesselMarker;
  }, [selectedLocation, getLocationName]);

  // Render Highlighted Potential Fishing Zone (PFZ) Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (pfzMarkerRef.current) {
      pfzMarkerRef.current.remove();
      pfzMarkerRef.current = null;
    }
    if (pfzBoundaryRef.current) {
      pfzBoundaryRef.current.remove();
      pfzBoundaryRef.current = null;
    }
    if (pfzLineRef.current) {
      pfzLineRef.current.remove();
      pfzLineRef.current = null;
    }

    if (!recommendedPFZ) return;

    // Validate that the PFZ coordinate and entire 12km boundary are strictly offshore in open sea
    const validPFZ = findValidOffshorePFZ(
      selectedLocation.lat,
      selectedLocation.lon,
      {
        targetDistanceKm: recommendedPFZ.distanceKm,
        targetBearingDeg: recommendedPFZ.bearingDegrees,
        zoneRadiusKm: 12,
        minBufferKm: 6
      }
    );

    // Amber/Orange PFZ Boundary circle (~12km radius strictly in open seawater)
    const pfzCircle = L.circle([validPFZ.lat, validPFZ.lon], {
      radius: 12000,
      color: '#F59E0B',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#F59E0B',
      fillOpacity: 0.12
    }).addTo(map);
    pfzCircle.bindTooltip(`${t.pfzLegend} (~12km Boundary)`, { permanent: false, direction: 'center' });
    pfzBoundaryRef.current = pfzCircle;

    const pfzIcon = L.divIcon({
      className: 'custom-pfz-marker',
      html: `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[#D97706] text-white border-2 border-white shadow-md transition-transform group-hover:scale-110">
            🐟
          </div>

          <div class="absolute -bottom-6 px-2 py-0.5 rounded bg-[#0B2545]/95 text-[#FBBF24] text-[10px] font-bold tracking-wide border border-[#F59E0B]/50 shadow-xs whitespace-nowrap flex items-center gap-1 z-30">
            <span class="uppercase">${t.pfzLegend}</span>
            <span class="text-[#F59E0B] font-mono text-[9px] font-bold">
              ${validPFZ.distanceKm} km
            </span>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20]
    });

    const pfzMarker = L.marker([validPFZ.lat, validPFZ.lon], {
      icon: pfzIcon,
      zIndexOffset: 1000
    }).addTo(map);

    const pfzPopupContent = `
      <div class="p-2 min-w-[240px] font-sans text-[#F1F5F9]">
        <div class="flex items-center gap-2 border-b border-[#1E3A5F] pb-2 mb-2">
          <div class="w-7 h-7 rounded-full bg-[#78350F] text-[#FBBF24] flex items-center justify-center font-bold text-sm">
            🐟
          </div>
          <div>
            <h4 class="font-bold text-sm text-[#F1F5F9]">
              ${t.pfzLegend}
            </h4>
            <p class="text-[10px] text-[#94A3B8] font-medium">
              ${t.pfzSatelliteModel}
            </p>
          </div>
        </div>

        <div class="space-y-1.5 text-xs bg-[#07213E] p-2 rounded border border-[#1E3A5F] font-medium">
          <div class="flex justify-between items-center text-[#CBD5E1]">
            <span class="text-[#94A3B8]">📍 ${t.offshoreDistance}:</span>
            <strong class="text-[#F1F5F9] font-mono font-bold">
              ${validPFZ.distanceKm} km (${validPFZ.bearing} - ${validPFZ.bearingDegrees}°)
            </strong>
          </div>
          <div class="flex justify-between items-center text-[#CBD5E1]">
            <span class="text-[#94A3B8]">🌡️ ${t.seaSurfaceTemp}:</span>
            <strong class="text-[#2DD4BF] font-mono font-bold">
              ${recommendedPFZ.seaSurfaceTemperature}°C (${recommendedPFZ.idealRange})
            </strong>
          </div>
          <div class="flex justify-between items-center text-[#CBD5E1]">
            <span class="text-[#94A3B8]">🎯 ${t.coordinates}:</span>
            <span class="text-[#38BDF8] font-mono text-[11px]">
              ${validPFZ.lat.toFixed(3)}°N, ${validPFZ.lon.toFixed(3)}°E
            </span>
          </div>
          <div class="pt-1.5 border-t border-[#1E3A5F] text-[11px] text-[#94A3B8] leading-snug">
            ${t.pfzThermalDesc}
          </div>
        </div>
      </div>
    `;

    pfzMarker.bindPopup(pfzPopupContent);
    pfzMarkerRef.current = pfzMarker;

    if (!customDestination) {
      const stationInfo = stationDataMap[selectedLocation.id];
      const marineSafety = stationInfo ? {
        waveHeight: stationInfo.marine.waveHeight,
        windSpeed: stationInfo.weather.windSpeed,
        thunderstormRisk: stationInfo.safety.criteria.thunderstormRisk
      } : undefined;

      const generated = suggestSafeRoute(
        selectedLocation.lat,
        selectedLocation.lon,
        validPFZ.lat,
        validPFZ.lon,
        {
          marineSafety,
          startName: getLocationName(selectedLocation),
          destName: `PFZ (${validPFZ.distanceKm} km ${validPFZ.bearing})`
        }
      );
      setActiveRoute(generated);
      if (onRouteGenerated) {
        onRouteGenerated(generated);
      }
    }
  }, [recommendedPFZ, selectedLocation, language, t, stationDataMap, customDestination, onRouteGenerated, getLocationName]);

  // Click-to-route anywhere at sea
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isClickRoutingEnabled) return;
      const clickedLat = Number(e.latlng.lat.toFixed(4));
      const clickedLon = Number(e.latlng.lng.toFixed(4));

      if (clickedLat < 4 || clickedLat > 25 || clickedLon < 65 || clickedLon > 95) {
        return;
      }

      const label = `${clickedLat}°N, ${clickedLon}°E`;
      setCustomDestination({ lat: clickedLat, lon: clickedLon, label });

      const stationInfo = stationDataMap[selectedLocation.id];
      const marineSafety = stationInfo ? {
        waveHeight: stationInfo.marine.waveHeight,
        windSpeed: stationInfo.weather.windSpeed,
        thunderstormRisk: stationInfo.safety.criteria.thunderstormRisk
      } : undefined;

      const newRoute = suggestSafeRoute(
        selectedLocation.lat,
        selectedLocation.lon,
        clickedLat,
        clickedLon,
        {
          marineSafety,
          startName: getLocationName(selectedLocation),
          destName: `${t.targetDestination} (${label})`
        }
      );

      setActiveRoute(newRoute);
      if (onRouteGenerated) {
        onRouteGenerated(newRoute);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isClickRoutingEnabled, selectedLocation, stationDataMap, onRouteGenerated, getLocationName, t]);

  // Render or update safe route polylines and intermediate waypoints
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (routeGlowRef.current) {
      routeGlowRef.current.remove();
      routeGlowRef.current = null;
    }
    if (straightLineRef.current) {
      straightLineRef.current.remove();
      straightLineRef.current = null;
    }
    waypointMarkersRef.current.forEach(m => m.remove());
    waypointMarkersRef.current = [];

    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    if (!activeRoute) return;

    if (customDestination) {
      const destIcon = L.divIcon({
        className: 'custom-target-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-[#DC2626] text-white font-bold flex items-center justify-center text-xs border border-white shadow-md">
              🎯
            </div>
            <div class="px-1.5 py-0.5 mt-1 rounded bg-[#0B2545]/90 text-[#FCA5A5] font-mono text-[9px] font-bold border border-[#DC2626] whitespace-nowrap shadow-xs">
              ${customDestination.label}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -18]
      });

      const destMarker = L.marker([customDestination.lat, customDestination.lon], {
        icon: destIcon,
        zIndexOffset: 950
      }).addTo(map);

      destMarker.bindPopup(`
        <div class="p-2 font-sans text-[#F1F5F9] text-xs">
          <div class="font-bold text-[#F87171] flex items-center gap-1 mb-1">
            <span>🎯</span> <span>${t.targetDestination}</span>
          </div>
          <div class="font-mono text-[11px] text-[#CBD5E1]">${customDestination.lat}°N, ${customDestination.lon}°E</div>
          <div class="text-[10px] text-[#94A3B8] mt-1">${t.generatingCorridor}</div>
        </div>
      `);
      destMarkerRef.current = destMarker;
    }

    // Detour/Bypass: muted red dashed line
    if (activeRoute.hasDetour && activeRoute.directCoordinates && activeRoute.directCoordinates.length > 0) {
      const straightPoly = L.polyline(activeRoute.directCoordinates, {
        color: '#DC2626',
        weight: 2,
        dashArray: '6, 6',
        opacity: 0.8
      }).addTo(map);

      straightPoly.bindTooltip(t.directStraightLine, { permanent: false, direction: 'center' });
      straightLineRef.current = straightPoly;
    }

    // Safe route: subtle teal/green solid line (avoid excessive glow effects)
    const routeColor = activeRoute.hasDetour ? '#F59E0B' : '#0D9488';
    const mainPoly = L.polyline(activeRoute.coordinates, {
      color: routeColor,
      weight: 3,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    const tooltipText = activeRoute.hasDetour
      ? `${t.safeDetourRoute}: ${activeRoute.totalDistanceKm} km (~${activeRoute.estimatedTransitHours} hrs, ${activeRoute.detourCount} detour)`
      : `${t.safeDirectRoute}: ${activeRoute.totalDistanceKm} km (~${activeRoute.estimatedTransitHours} hrs)`;

    mainPoly.bindTooltip(tooltipText, { permanent: false, direction: 'center' });

    const routePopupContent = `
      <div class="p-2.5 font-sans text-[#F1F5F9] min-w-[260px] max-w-[300px]">
        <div class="flex items-center justify-between border-b border-[#1E3A5F] pb-2 mb-2">
          <div class="flex items-center gap-1.5 font-bold text-sm text-[#F1F5F9]">
            <span>${activeRoute.hasDetour ? '🔄' : '🧭'}</span>
            <span>${t.safeRoute}</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${activeRoute.hasDetour ? 'bg-[#78350F]/80 text-[#FDE68A] border border-[#D97706]' : 'bg-[#064E3B]/80 text-[#5EEAD4] border border-[#0D9488]'}">
            ${activeRoute.hasDetour ? t.detour : t.safe}
          </span>
        </div>

        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between py-0.5 border-b border-[#1E3A5F]">
            <span class="text-[#94A3B8]">${t.departure}:</span>
            <span class="font-semibold text-[#F1F5F9]">${activeRoute.start.name || getLocationName(selectedLocation)}</span>
          </div>
          <div class="flex justify-between py-0.5 border-b border-[#1E3A5F]">
            <span class="text-[#94A3B8]">${t.destination}:</span>
            <span class="font-semibold text-[#38BDF8]">${activeRoute.destination.name || 'PFZ Target'}</span>
          </div>
          <div class="flex justify-between py-0.5 border-b border-[#1E3A5F]">
            <span class="text-[#94A3B8]">${t.totalDistance}:</span>
            <span class="font-bold text-[#FBBF24]">${activeRoute.totalDistanceKm} km (${(activeRoute.totalDistanceKm / 1.852).toFixed(1)} NM)</span>
          </div>
          <div class="flex justify-between py-0.5 border-b border-[#1E3A5F]">
            <span class="text-[#94A3B8]">${t.estTime}:</span>
            <span class="font-semibold text-[#F1F5F9]">~${activeRoute.estimatedTransitHours} hrs (@8 kn)</span>
          </div>
          <div class="flex justify-between py-0.5">
            <span class="text-[#94A3B8]">${t.waypoints}:</span>
            <span class="font-mono text-[#2DD4BF]">${activeRoute.waypoints.length} points (${activeRoute.detourCount} detour)</span>
          </div>
        </div>

        ${activeRoute.restrictedZonesEncountered.length > 0 ? `
          <div class="mt-2.5 pt-2 border-t border-[#1E3A5F] text-[11px] text-[#FCA5A5] bg-[#7F1D1D]/70 p-1.5 rounded border border-[#DC2626]">
            ⚠️ <strong>${t.bypassed}:</strong> ${activeRoute.restrictedZonesEncountered.join(', ')}
          </div>
        ` : ''}
      </div>
    `;
    mainPoly.bindPopup(routePopupContent);

    routePolylineRef.current = mainPoly;

    activeRoute.waypoints.forEach((wp) => {
      const isDetour = wp.isDetour;
      const wpIcon = L.divIcon({
        className: 'custom-route-waypoint',
        html: `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group">
            <div class="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight border border-white shadow-xs flex items-center gap-1 transition-transform group-hover:scale-115 select-none ${
              isDetour
                ? 'bg-[#D97706] text-white'
                : 'bg-[#0891B2] text-white'
            }">
              <span>${isDetour ? '🔄' : '⚓'}</span>
              <span>WP ${wp.index}</span>
            </div>
          </div>
        `,
        iconSize: [44, 20],
        iconAnchor: [22, 10],
        popupAnchor: [0, -12]
      });

      const wpMarker = L.marker([wp.lat, wp.lon], {
        icon: wpIcon,
        zIndexOffset: isDetour ? 850 : 800
      }).addTo(map);

      const wpPopup = `
        <div class="p-2 font-sans text-[#F1F5F9] min-w-[240px] max-w-[280px]">
          <div class="flex items-center justify-between border-b border-[#1E3A5F] pb-1.5 mb-2">
            <div class="font-bold text-xs ${isDetour ? 'text-[#FBBF24]' : 'text-[#38BDF8]'} flex items-center gap-1">
              <span>${isDetour ? '🔄' : '⚓'}</span>
              <span>${language === 'hi' ? wp.hindiLabel : wp.label}</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${
              wp.safetyStatus === 'SAFE' 
                ? 'bg-[#064E3B]/80 text-[#5EEAD4] border border-[#0D9488]'
                : wp.safetyStatus === 'DETOUR'
                ? 'bg-[#78350F]/80 text-[#FDE68A] border border-[#D97706]'
                : 'bg-[#7F1D1D]/80 text-[#FCA5A5] border border-[#DC2626]'
            }">
              ${wp.safetyStatus}
            </span>
          </div>

          <div class="space-y-1 text-xs">
            <div class="text-[11px] font-mono text-[#38BDF8]">
              ${wp.lat.toFixed(4)}°N, ${wp.lon.toFixed(4)}°E
            </div>
            <div class="text-[11px] text-[#CBD5E1]">
              ${t.fromDeparture}: <strong class="text-[#F1F5F9]">${wp.distanceFromStartKm} km</strong>
            </div>
            ${isDetour && wp.detourOffsetKm ? `
              <div class="text-[11px] text-[#FDE68A] bg-[#78350F]/70 p-1 rounded border border-[#D97706]">
                🔄 <strong>${t.detourOffset}:</strong> +${wp.detourOffsetKm} km
              </div>
            ` : ''}
            ${wp.marineSafetyViolations && wp.marineSafetyViolations.length > 0 ? `
              <div class="text-[10px] text-[#FCA5A5]">
                ⚠️ <strong>${t.marineRiskReason}:</strong> ${wp.marineSafetyViolations.join(', ')}
              </div>
            ` : ''}
            ${wp.nearestZoneEncountered ? `
              <div class="text-[10px] text-[#FBBF24] mt-1">
                🛡️ ${t.nearestBoundary}: <strong>${wp.nearestZoneEncountered}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      wpMarker.bindPopup(wpPopup);
      waypointMarkersRef.current.push(wpMarker);
    });
  }, [activeRoute, customDestination, language, t, selectedLocation, getLocationName]);

  return (
    <div
      id="orca-coastal-map-container"
      className={
        fillHeight
          ? "flex flex-col w-full h-full min-h-[520px] md:min-h-[650px] rounded-lg overflow-hidden border border-[#E4DCD0] shadow-xs bg-white"
          : "flex flex-col w-full rounded-lg overflow-hidden border border-[#E4DCD0] shadow-xs bg-white"
      }
    >
      
      {/* Professional GIS Header Bar */}
      <div className="bg-[#FAF7F2] px-4 py-3 border-b border-[#E4DCD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#0B2545] uppercase tracking-wider font-sans">
              Live Maritime Situation Map
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5EFE6] text-[#44403C] font-semibold border border-[#DDD4C4]">
              15 STATIONS
            </span>
          </div>
          <p className="text-[11px] text-[#78716C] mt-0.5">
            Real-time telemetry, EEZ boundaries, and active coastal stations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClickRoutingEnabled(!isClickRoutingEnabled)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isClickRoutingEnabled
                ? 'bg-[#0B2545] text-white border-[#0B2545]'
                : 'bg-[#F5EFE6] text-[#44403C] border-[#DDD4C4]'
            }`}
            title="Toggle click anywhere at sea to compute safe route"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isClickRoutingEnabled ? 'Route Click: ON' : 'Route Click: OFF'}</span>
          </button>
        </div>
      </div>

      <div
        className={
          fillHeight
            ? "relative w-full flex-1 h-full min-h-[520px] md:min-h-[600px] lg:min-h-[650px] map-container"
            : "relative w-full h-[520px] sm:h-[600px] lg:h-[650px]"
        }
      >
        {/* Primary Leaflet Tile Stage */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Legend (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#0B2545]/90 backdrop-blur-xs p-3 rounded-lg border border-[#1E3A5F] text-[11px] space-y-1.5 shadow-md max-w-[240px] pointer-events-auto text-[#E2E8F0]">
          <div className="font-bold text-[#F1F5F9] uppercase tracking-wider text-[10px] border-b border-[#1E3A5F] pb-1 flex items-center justify-between">
            <span>{t.mapView}</span>
            <span className="text-[9px] text-[#94A3B8] font-mono">15 HARBORS</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#38BDF8] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2] border border-[#0B2545]"></span> {t.safeLegend}
          </div>
          <div className="flex items-center gap-1.5 text-[#FBBF24] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] border border-[#0B2545]"></span> {t.moderateLegend}
          </div>
          <div className="flex items-center gap-1.5 text-[#F87171] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-[#0B2545]"></span> {t.unsafeLegend}
          </div>
          <div className="flex items-center gap-1.5 text-[#2DD4BF] font-semibold border-t border-[#1E3A5F] pt-1 mt-1">
            <span className="w-3.5 h-1 bg-[#0D9488] rounded-full inline-block"></span> {t.safeRoutePolyline}
          </div>
          <div className="flex items-center gap-1.5 text-[#F87171] font-medium">
            <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[#DC2626] inline-block"></span> {t.detourBypassLine}
          </div>
          <div className="flex items-center gap-1.5 text-[#CBD5E1] font-medium">
            <span className="px-1 py-0.2 rounded text-[9px] bg-[#0891B2] text-white font-bold">WP</span> {t.checkedWaypoints}
          </div>
          <div className="flex items-center gap-1.5 text-[#38BDF8] font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0891B2] text-white border border-white text-[9px] flex items-center justify-center font-bold">⛵</span> Vessel / Boat
          </div>
          <div className="flex items-center gap-1.5 text-[#FBBF24] font-bold border-t border-[#1E3A5F] pt-1 mt-1">
            <span className="text-xs">🐟</span> {t.pfzLegend} (Boundary)
          </div>
          <div className="flex items-center gap-1.5 text-[#F87171] font-semibold">
            <span className="w-3 h-2 rounded-2xs bg-[#DC2626]/25 border border-[#DC2626] inline-block"></span> {t.restrictedZoneLegend}
          </div>
        </div>

        {/* Floating Route HUD on Map (Top-Right) */}
        {activeRoute && (
          <div className={`absolute top-3 right-3 z-20 bg-[#0B2545]/90 backdrop-blur-xs border border-[#1E3A5F] text-xs shadow-md transition-all text-[#F1F5F9] ${
            isHudCollapsed
              ? 'p-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-[#163864]'
              : 'p-3 rounded-lg max-w-[calc(100%-24px)] sm:max-w-[310px]'
          }`}>
            {isHudCollapsed ? (
              <button
                onClick={() => setIsHudCollapsed(false)}
                className="flex items-center gap-2 text-[#F1F5F9] text-[11px] font-bold px-2 py-0.5 cursor-pointer"
                title="Expand Route HUD"
              >
                <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{t.route}: {activeRoute.totalDistanceKm} km</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] ml-1" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 border-b border-[#1E3A5F] pb-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#F1F5F9]">
                    <Compass className="w-4 h-4 text-[#38BDF8]" />
                    <span className="truncate">{t.safeRoute}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeRoute.hasDetour
                        ? 'bg-[#78350F]/80 text-[#FDE68A] border border-[#D97706]'
                        : 'bg-[#064E3B]/80 text-[#5EEAD4] border border-[#0D9488]'
                    }`}>
                      {activeRoute.hasDetour ? `⚠️ ${t.detour}` : `🛡️ ${t.safe}`}
                    </span>
                    <button
                      onClick={() => setIsHudCollapsed(true)}
                      className="p-1 rounded text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#163864] cursor-pointer"
                      title="Minimize HUD"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-[#CBD5E1]">
                    <span className="text-[#94A3B8]">{t.route}:</span>
                    <span className="font-medium text-[#F1F5F9] truncate max-w-[160px]" title={`${activeRoute.start.name} → ${activeRoute.destination.name}`}>
                      {activeRoute.start.name || getLocationName(selectedLocation)} → {activeRoute.destination.name || 'PFZ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">{t.distance}:</span>
                    <span className="font-bold text-[#38BDF8]">
                      {activeRoute.totalDistanceKm} km <span className="text-[#94A3B8] font-normal font-sans">({(activeRoute.totalDistanceKm / 1.852).toFixed(1)} NM)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">{t.estTime}:</span>
                    <span className="text-[#F1F5F9] font-medium">~{activeRoute.estimatedTransitHours} hrs (@8 kn)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">{t.waypoints}:</span>
                    <span className="text-[#2DD4BF] font-mono font-semibold">
                      {activeRoute.waypoints.length} points {activeRoute.detourCount > 0 ? `(${activeRoute.detourCount} detour)` : ''}
                    </span>
                  </div>

                  {activeRoute.restrictedZonesEncountered.length > 0 && (
                    <div className="text-[10px] text-[#FCA5A5] bg-[#7F1D1D]/70 p-1.5 rounded border border-[#DC2626] mt-1">
                      🔄 <strong>{t.detour}:</strong> {activeRoute.restrictedZonesEncountered.join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[#1E3A5F]">
                  <button
                    onClick={handleFitRoute}
                    className="flex-1 px-2.5 py-1.5 rounded-md bg-[#0891B2] hover:bg-[#067A97] text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="Center and fit map view to entire route"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{t.fitRoute}</span>
                  </button>

                  {customDestination && (
                    <button
                      onClick={handleResetToPFZ}
                      className="px-2.5 py-1.5 rounded-md bg-[#163864] hover:bg-[#1E4578] text-[#F1F5F9] border border-[#1E3A5F] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Reset to Recommended Fishing Zone"
                    >
                      <RotateCcw className="w-3 h-3 text-[#38BDF8]" />
                      <span>PFZ</span>
                    </button>
                  )}
                </div>

                <div className="text-[9px] text-[#94A3B8] text-center mt-1.5 font-medium">
                  {t.clickToRoute}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
