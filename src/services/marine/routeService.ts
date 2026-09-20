import { RouteWaypoint, SafeRouteResult } from '../../types';
import { checkGeofence } from '../../data/restrictedZones';
import { isPointOnLand } from './coastalGeography';

/**
 * Calculates great-circle distance between two coordinates using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface RouteSafetyOptions {
  numIntermediateWaypoints?: number; // default: 4 (between 3 and 4)
  marineSafety?: {
    waveHeight?: number; // meters
    windSpeed?: number; // km/h
    thunderstormRisk?: boolean;
  };
  startName?: string;
  destName?: string;
}

/**
 * suggestSafeRoute(startLat, startLon, destLat, destLon, options?):
 * 
 * Generates a simple straight-line path with 3-4 intermediate waypoints between start and destination,
 * checks each waypoint against checkGeofence() and marine safety thresholds, and if any
 * waypoint is unsafe (e.g. inside or within 5km of a restricted marine sanctuary, border zone,
 * or exceeding wave swell / wind gale thresholds), calculates and suggests a basic detour offset.
 */
export function suggestSafeRoute(
  startLat: number,
  startLon: number,
  destLat: number,
  destLon: number,
  options?: RouteSafetyOptions
): SafeRouteResult {
  const numWaypoints = options?.numIntermediateWaypoints && options.numIntermediateWaypoints >= 3 && options.numIntermediateWaypoints <= 4
    ? options.numIntermediateWaypoints
    : 4; // Generates 3-4 intermediate waypoints (default 4)

  const waypoints: RouteWaypoint[] = [];
  const restrictedZonesEncountered: string[] = [];

  // Route vector
  const dLat = destLat - startLat;
  const dLon = destLon - startLon;
  const lenDeg = Math.hypot(dLat, dLon);

  // Unit direction vector with fallback for degenerate cases
  const uLat = lenDeg > 0 ? dLat / lenDeg : 0;
  const uLon = lenDeg > 0 ? dLon / lenDeg : 1;

  // Perpendicular normal vectors (port / left and starboard / right)
  const norm1Lat = -uLon;
  const norm1Lon = uLat;
  const norm2Lat = uLon;
  const norm2Lon = -uLat;

  let detourCount = 0;

  // Marine safety thresholds (standard Indian maritime navigation limits)
  // Wave swell > 2.5m = critical hazard for small craft
  // Wind speed > 40 km/h = gale force
  const waveHeight = options?.marineSafety?.waveHeight;
  const windSpeed = options?.marineSafety?.windSpeed;
  const thunderstormRisk = Boolean(options?.marineSafety?.thunderstormRisk);

  const isWaveHazard = waveHeight !== undefined && waveHeight > 2.5;
  const isWindHazard = windSpeed !== undefined && windSpeed > 40;
  const hasMarineHazard = isWaveHazard || isWindHazard || thunderstormRisk;

  // Evaluate each intermediate waypoint along the straight-line path
  for (let i = 1; i <= numWaypoints; i++) {
    const fraction = i / (numWaypoints + 1);
    const rawLat = Number((startLat + fraction * dLat).toFixed(4));
    const rawLon = Number((startLon + fraction * dLon).toFixed(4));

    // Check waypoint against checkGeofence() and landmass
    const rawGeofence = checkGeofence(rawLat, rawLon);
    const isLand = isPointOnLand(rawLat, rawLon);
    const distanceFromStart = calculateHaversineDistanceKm(startLat, startLon, rawLat, rawLon);

    // Unsafe if inside or within 5km of restricted zone, on land, or exceeding marine safety thresholds
    const isUnsafe = rawGeofence.isNearOrInside || hasMarineHazard || isLand;

    let finalLat = rawLat;
    let finalLon = rawLon;
    let isDetour = false;
    let detourOffsetKm: number | undefined = undefined;
    let safetyStatus: 'SAFE' | 'CAUTION' | 'DETOUR' | 'UNSAFE' = 'SAFE';
    let activeGeofence = rawGeofence;
    let advisory: string | undefined = undefined;
    let hindiAdvisory: string | undefined = undefined;

    if (rawGeofence.isNearOrInside && rawGeofence.nearestZone) {
      if (!restrictedZonesEncountered.includes(rawGeofence.nearestZone.name)) {
        restrictedZonesEncountered.push(rawGeofence.nearestZone.name);
      }
    }

    if (isUnsafe) {
      // Suggest basic detour offset: test candidate offsets on port & starboard sides
      // Test progressively wider offsets: 0.08° (~9 km), 0.15° (~16.5 km), 0.25° (~28 km), 0.38° (~42 km)
      const offsetDeltas = [0.08, 0.15, 0.25, 0.38];
      let bestCandidate: { lat: number; lon: number; geofence: ReturnType<typeof checkGeofence>; clearance: number } | null = null;
      let maxClearanceCandidate: { lat: number; lon: number; geofence: ReturnType<typeof checkGeofence>; clearance: number } | null = null;

      for (const delta of offsetDeltas) {
        const c1Lat = Number((rawLat + norm1Lat * delta).toFixed(4));
        const c1Lon = Number((rawLon + norm1Lon * delta).toFixed(4));
        const c1Land = isPointOnLand(c1Lat, c1Lon);
        const g1 = checkGeofence(c1Lat, c1Lon);

        const c2Lat = Number((rawLat + norm2Lat * delta).toFixed(4));
        const c2Lon = Number((rawLon + norm2Lon * delta).toFixed(4));
        const c2Land = isPointOnLand(c2Lat, c2Lon);
        const g2 = checkGeofence(c2Lat, c2Lon);

        // Keep track of whichever candidate has highest clearance and is NOT on land
        let currentHigher = null;
        if (!c1Land && !c2Land) {
          currentHigher = g1.distanceKm >= g2.distanceKm
            ? { lat: c1Lat, lon: c1Lon, geofence: g1, clearance: g1.distanceKm }
            : { lat: c2Lat, lon: c2Lon, geofence: g2, clearance: g2.distanceKm };
        } else if (!c1Land) {
          currentHigher = { lat: c1Lat, lon: c1Lon, geofence: g1, clearance: g1.distanceKm };
        } else if (!c2Land) {
          currentHigher = { lat: c2Lat, lon: c2Lon, geofence: g2, clearance: g2.distanceKm };
        }

        if (currentHigher && (!maxClearanceCandidate || currentHigher.clearance > maxClearanceCandidate.clearance)) {
          maxClearanceCandidate = currentHigher;
        }

        // Prefer candidates that completely clear all restricted zone buffers AND are strictly in water
        const cand1Safe = !g1.isNearOrInside && !c1Land;
        const cand2Safe = !g2.isNearOrInside && !c2Land;

        if (cand1Safe && !cand2Safe) {
          bestCandidate = { lat: c1Lat, lon: c1Lon, geofence: g1, clearance: g1.distanceKm };
          break;
        } else if (cand2Safe && !cand1Safe) {
          bestCandidate = { lat: c2Lat, lon: c2Lon, geofence: g2, clearance: g2.distanceKm };
          break;
        } else if (cand1Safe && cand2Safe) {
          bestCandidate = g1.distanceKm >= g2.distanceKm
            ? { lat: c1Lat, lon: c1Lon, geofence: g1, clearance: g1.distanceKm }
            : { lat: c2Lat, lon: c2Lon, geofence: g2, clearance: g2.distanceKm };
          break;
        }
      }

      // If a candidate cleared the perimeter completely, or use the maximum clearance candidate
      const selectedOffset = bestCandidate || maxClearanceCandidate;

      if (selectedOffset) {
        finalLat = selectedOffset.lat;
        finalLon = selectedOffset.lon;
        isDetour = true;
        detourCount++;
        detourOffsetKm = calculateHaversineDistanceKm(rawLat, rawLon, finalLat, finalLon);
        safetyStatus = selectedOffset.geofence.isNearOrInside ? 'CAUTION' : 'DETOUR';
        activeGeofence = selectedOffset.geofence;

        const zoneName = rawGeofence.nearestZone?.name || 'Restricted Marine Zone';
        const hindiZoneName = rawGeofence.nearestZone?.hindiName || 'प्रतिबंधित समुद्री क्षेत्र';

        if (rawGeofence.isNearOrInside) {
          advisory = `Detour offset: +${detourOffsetKm} km to safely bypass ${zoneName} (${selectedOffset.clearance} km clearance from perimeter).`;
          hindiAdvisory = `मार्ग परिवर्तन (डिटूर): ${hindiZoneName} से सुरक्षित दूरी (+${detourOffsetKm} किमी ऑफसेट) बनाने हेतु सुझाई गई।`;
        } else if (isLand) {
          advisory = `Detour offset: +${detourOffsetKm} km seaward detour to bypass shoreline/landmass safely into open water.`;
          hindiAdvisory = `मार्ग परिवर्तन (डिटूर): तटीय भूमि क्षेत्र से बचाव हेतु समुद्र की ओर +${detourOffsetKm} किमी ऑफसेट।`;
        } else if (hasMarineHazard) {
          advisory = `Detour offset: +${detourOffsetKm} km coastal corridor detour to avoid hazardous open swell (${waveHeight ?? 0}m) / gale (${windSpeed ?? 0} km/h).`;
          hindiAdvisory = `मार्ग परिवर्तन (डिटूर): तेज लहरों (${waveHeight ?? 0} मी) व हवा से बचाव हेतु +${detourOffsetKm} किमी ऑफसेट।`;
        } else {
          advisory = `Detour offset: +${detourOffsetKm} km offset applied for navigational safety.`;
          hindiAdvisory = `नेविगेशन सुरक्षा हेतु +${detourOffsetKm} किमी डिटूर ऑफसेट लागू किया गया।`;
        }
      } else {
        safetyStatus = 'UNSAFE';
        advisory = rawGeofence.warningMessage || 'Waypoint falls inside restricted marine zone or hazardous sea state.';
        hindiAdvisory = rawGeofence.hindiWarningMessage || 'यह वेपॉइंट प्रतिबंधित क्षेत्र अथवा असुरक्षित समुद्री स्थिति में है।';
      }
    } else {
      safetyStatus = 'SAFE';
      advisory = 'Clear waters along navigational channel (clear of restricted zones and safe swell/wind).';
      hindiAdvisory = 'नेविगेशन चैनल में खुला व सुरक्षित समुद्री क्षेत्र (प्रतिबंधित सीमाओं और तेज लहरों से मुक्त)।';
    }

    waypoints.push({
      id: `wp-${i}`,
      index: i,
      label: isDetour ? `Waypoint ${i} (Detour)` : `Waypoint ${i}`,
      hindiLabel: isDetour ? `वेपॉइंट ${i} (डिटूर)` : `वेपॉइंट ${i}`,
      lat: finalLat,
      lon: finalLon,
      originalLat: rawLat,
      originalLon: rawLon,
      isDetour,
      detourOffsetKm,
      safetyStatus,
      distanceFromStartKm: distanceFromStart,
      geofenceResult: activeGeofence,
      advisory,
      hindiAdvisory
    });
  }

  // Construct full polyline coordinates: [start, ...waypoints, destination]
  const coordinates: [number, number][] = [
    [startLat, startLon],
    ...waypoints.map((wp) => [wp.lat, wp.lon] as [number, number]),
    [destLat, destLon]
  ];

  // Straight line coordinates for comparison
  const straightLineCoordinates: [number, number][] = [
    [startLat, startLon],
    ...waypoints.map((wp) => [wp.originalLat, wp.originalLon] as [number, number]),
    [destLat, destLon]
  ];

  // Calculate cumulative path distance
  let totalDistanceKm = 0;
  for (let j = 0; j < coordinates.length - 1; j++) {
    totalDistanceKm += calculateHaversineDistanceKm(
      coordinates[j][0],
      coordinates[j][1],
      coordinates[j + 1][0],
      coordinates[j + 1][1]
    );
  }
  totalDistanceKm = Math.round(totalDistanceKm * 10) / 10;

  const directDistanceKm = calculateHaversineDistanceKm(startLat, startLon, destLat, destLon);

  // Estimated transit time at ~8 knots (approx 14.8 km/h for mechanized/motorized craft)
  const estimatedTransitHours = Math.round((totalDistanceKm / 14.8) * 10) / 10;

  // Calculate safety score (0 - 100)
  let safetyScore = 95;
  if (detourCount > 0) safetyScore -= detourCount * 5;
  if (waypoints.some((wp) => wp.safetyStatus === 'UNSAFE')) safetyScore -= 35;
  safetyScore = Math.max(20, Math.min(100, safetyScore));

  const hasDetour = detourCount > 0;
  const startLabel = options?.startName || 'Departure Port';
  const destLabel = options?.destName || 'Target PFZ';

  const summary = hasDetour
    ? `Safe navigation path generated from ${startLabel} to ${destLabel} (${totalDistanceKm} km, ~${estimatedTransitHours} hrs). Includes ${detourCount} detour waypoint(s) to safely bypass restricted perimeters (${restrictedZonesEncountered.join(', ')}).`
    : `Direct safe navigation corridor confirmed from ${startLabel} to ${destLabel} (${totalDistanceKm} km, ~${estimatedTransitHours} hrs). All intermediate waypoints clear of restricted perimeters.`;

  const hindiSummary = hasDetour
    ? `${startLabel} से ${destLabel} तक सुरक्षित मार्ग (${totalDistanceKm} किमी, ~${estimatedTransitHours} घंटे)। प्रतिबंधित क्षेत्रों (${restrictedZonesEncountered.join(', ')}) से बचने हेतु ${detourCount} डिटूर वेपॉइंट जोड़े गए।`
    : `${startLabel} से ${destLabel} तक सीधा सुरक्षित समुद्री मार्ग (${totalDistanceKm} किमी, ~${estimatedTransitHours} घंटे)। सभी वेपॉइंट्स प्रतिबंधित सीमाओं से सुरक्षित दूरी पर हैं।`;

  return {
    start: { lat: startLat, lon: startLon, name: options?.startName },
    destination: { lat: destLat, lon: destLon, name: options?.destName },
    waypoints,
    coordinates,
    straightLineCoordinates,
    hasDetour,
    detourCount,
    totalDistanceKm,
    directDistanceKm,
    estimatedTransitHours,
    safetyScore,
    summary,
    hindiSummary,
    restrictedZonesEncountered
  };
}
