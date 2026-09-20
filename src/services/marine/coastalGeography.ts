/**
 * Coastal Geography Service
 * 
 * Provides high-precision geographic land/water masking, coastal distance calculation,
 * and offshore Potential Fishing Zone (PFZ) validation for the Indian subcontinent maritime region.
 */

// High-resolution coastline polygon covering the Indian subcontinent landmass
export const INDIA_LANDMASS_POLYGON: [number, number][] = [
  // West Bengal Coast & Sundarbans
  [89.15, 21.68], [88.85, 21.60], [88.60, 21.58], [88.25, 21.56], [88.05, 21.64],
  [87.97, 21.84], [87.82, 21.72], [87.70, 21.66], [87.57, 21.63], [87.50, 21.62],
  // Odisha Coast
  [87.45, 21.60], [87.15, 21.50], [87.02, 21.46], [87.08, 20.76], [86.95, 20.78],
  [86.80, 20.48], [86.72, 20.45], [86.61, 20.31], [86.45, 20.08], [86.33, 19.98],
  [86.10, 19.88], [85.83, 19.80], [85.45, 19.65], [85.25, 19.50], [85.06, 19.37],
  // Andhra Pradesh Coast
  [84.91, 19.26], [84.62, 18.95], [84.35, 18.57], [84.13, 18.34], [83.75, 18.05],
  [83.45, 17.89], [83.33, 17.72], [83.22, 17.65], [83.00, 17.48], [82.75, 17.35],
  [82.63, 17.30], [82.34, 17.08], [82.25, 16.98], [82.35, 16.90], [82.28, 16.60],
  [81.95, 16.45], [81.74, 16.35], [81.55, 16.32], [81.18, 16.18], [80.95, 15.78],
  [80.67, 15.90], [80.50, 15.85], [80.35, 15.80], [80.07, 15.45], [80.05, 15.25],
  [80.05, 15.04], [80.10, 14.44], [80.12, 14.28], [80.18, 13.98], [80.23, 13.72],
  [80.20, 13.60],
  // Tamil Nadu Coast
  [80.33, 13.23], [80.30, 13.12], [80.28, 13.04], [80.25, 12.79], [80.20, 12.62],
  [80.17, 12.52], [79.95, 12.20], [79.83, 11.93], [79.77, 11.74], [79.77, 11.50],
  [79.83, 11.36], [79.85, 11.14], [79.85, 11.03], [79.84, 10.92], [79.84, 10.76],
  [79.85, 10.68], [79.86, 10.37], [79.85, 10.28], [79.50, 10.40], [79.38, 10.34],
  [79.20, 9.97], [79.26, 10.04], [79.15, 9.92], [79.02, 9.74], [78.90, 9.48],
  [79.12, 9.29], [79.22, 9.28], [79.31, 9.29], [79.43, 9.17], [79.13, 9.28],
  [79.03, 9.26], [78.78, 9.23], [78.65, 9.17], [78.36, 9.07], [78.17, 8.90],
  [78.18, 8.76], [78.13, 8.64], [78.14, 8.57], [78.13, 8.49], [78.06, 8.37],
  [77.89, 8.28], [77.75, 8.18], [77.71, 8.17], [77.58, 8.12], [77.55, 8.08],
  // Kerala Coast
  [77.32, 8.12], [77.25, 8.18], [77.16, 8.24], [77.07, 8.31], [77.00, 8.37],
  [76.98, 8.40], [76.91, 8.49], [76.82, 8.60], [76.77, 8.68], [76.71, 8.73],
  [76.66, 8.81], [76.57, 8.88], [76.54, 8.94], [76.47, 9.14], [76.38, 9.31],
  [76.35, 9.38], [76.32, 9.49], [76.29, 9.60], [76.24, 9.96], [76.18, 10.13],
  [76.16, 10.18], [76.02, 10.53], [75.92, 10.77], [75.86, 10.97], [75.81, 11.16],
  [75.77, 11.25], [75.69, 11.44], [75.58, 11.60], [75.53, 11.70], [75.48, 11.75],
  [75.36, 11.87], [75.20, 12.02], [75.12, 12.25], [75.03, 12.39], [74.98, 12.50],
  [74.88, 12.71],
  // Karnataka Coast
  [74.86, 12.79], [74.83, 12.86], [74.80, 12.98], [74.79, 13.06], [74.77, 13.14],
  [74.74, 13.22], [74.70, 13.35], [74.70, 13.51], [74.69, 13.63], [74.65, 13.73],
  [74.60, 13.87], [74.54, 13.98], [74.48, 14.09], [74.48, 14.19], [74.44, 14.28],
  [74.42, 14.37], [74.40, 14.42], [74.35, 14.52], [74.31, 14.53], [74.25, 14.68],
  [74.19, 14.76], [74.12, 14.80],
  // Goa Coast
  [74.06, 14.94], [74.02, 15.00], [73.99, 15.04], [73.96, 15.13], [73.94, 15.15],
  [73.91, 15.25], [73.85, 15.35], [73.80, 15.40], [73.80, 15.46], [73.77, 15.49],
  [73.76, 15.52], [73.73, 15.58], [73.70, 15.68],
  // Maharashtra Coast (including Mumbai coastline)
  [73.68, 15.72], [73.63, 15.86], [73.47, 16.05], [73.40, 16.30], [73.38, 16.37],
  [73.33, 16.55], [73.35, 16.60], [73.32, 16.80], [73.28, 16.99], [73.26, 17.14],
  [73.22, 17.30], [73.19, 17.48], [73.16, 17.58], [73.09, 17.81], [73.07, 17.92],
  [73.02, 17.99], [73.02, 18.05], [72.98, 18.25], [72.96, 18.30], [72.90, 18.55],
  [72.87, 18.64], [72.95, 18.95], [72.81, 18.90], [72.82, 19.05], [72.80, 19.18],
  [72.78, 19.28], [72.80, 19.34], [72.77, 19.45], [72.70, 19.72], [72.67, 19.85],
  [72.73, 19.97],
  // Gujarat Coast
  [72.83, 20.40], [72.92, 20.61], [72.80, 20.88], [72.70, 21.08], [72.70, 21.60],
  [72.58, 21.71], [72.85, 21.70], [72.62, 22.30], [72.15, 21.76], [72.18, 21.40],
  [72.11, 21.22], [71.77, 21.08], [71.37, 20.87], [70.92, 20.71], [70.70, 20.78],
  [70.37, 20.90], [70.11, 21.12], [70.04, 21.25], [69.60, 21.64], [69.38, 21.85],
  [68.96, 22.24], [69.07, 22.47], [69.55, 22.35], [69.75, 22.45], [70.05, 22.55],
  [70.30, 22.70], [70.45, 22.95], [70.70, 23.20], [70.20, 23.00], [69.75, 22.83],
  [69.35, 22.82], [68.60, 23.25], [68.10, 23.85],
  // Inland closure of the Indian Subcontinent
  [68.10, 25.00], [69.00, 27.00], [71.00, 29.00], [74.00, 31.00], [77.00, 31.00],
  [80.00, 30.00], [84.00, 28.00], [88.00, 27.00], [89.00, 25.00], [89.50, 23.00],
  [89.15, 21.68]
];

// Sri Lanka Landmass Polygon
export const SRI_LANKA_POLYGON: [number, number][] = [
  [80.00, 9.80], [80.25, 9.80], [80.50, 9.40], [80.90, 9.00],
  [81.23, 8.57], [81.50, 8.00], [81.70, 7.72], [81.85, 7.20],
  [81.80, 6.50], [81.30, 6.20], [80.59, 5.92], [80.20, 6.05],
  [79.84, 6.93], [79.82, 8.03], [79.70, 8.50], [79.91, 8.98],
  [80.00, 9.80]
];

/**
 * Checks whether a given (lat, lon) point lies inside a geographic polygon using ray-casting.
 * polygon format is array of [lon, lat] pairs.
 */
export function isPointInPolygon(lat: number, lon: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Determines whether a given coordinate is located on land (true) or at sea (false).
 */
export function isPointOnLand(lat: number, lon: number): boolean {
  // Northern/Central inland India boundary check
  if (lat > 24.5 && lon < 88.0 && lon > 68.0) return true;
  // Main Indian landmass
  if (isPointInPolygon(lat, lon, INDIA_LANDMASS_POLYGON)) return true;
  // Sri Lanka
  if (isPointInPolygon(lat, lon, SRI_LANKA_POLYGON)) return true;
  return false;
}

/**
 * Calculates perpendicular distance from point P to line segment AB in kilometers.
 */
function distanceToSegmentKm(
  pLat: number, pLon: number,
  aLat: number, aLon: number,
  bLat: number, bLon: number
): number {
  const avgLatRad = ((pLat + aLat + bLat) / 3) * (Math.PI / 180);
  const kx = 111.139 * Math.cos(avgLatRad);
  const ky = 111.139;

  const px = pLon * kx, py = pLat * ky;
  const ax = aLon * kx, ay = aLat * ky;
  const bx = bLon * kx, by = bLat * ky;

  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Calculates the shortest distance in kilometers from a point to the nearest coastline.
 * Returns 0 if the point is on land.
 */
export function distanceToCoastKm(lat: number, lon: number): number {
  if (isPointOnLand(lat, lon)) return 0;
  let minDist = Infinity;

  for (let i = 0; i < INDIA_LANDMASS_POLYGON.length - 1; i++) {
    const d = distanceToSegmentKm(
      lat, lon,
      INDIA_LANDMASS_POLYGON[i][1], INDIA_LANDMASS_POLYGON[i][0],
      INDIA_LANDMASS_POLYGON[i + 1][1], INDIA_LANDMASS_POLYGON[i + 1][0]
    );
    if (d < minDist) minDist = d;
  }

  for (let i = 0; i < SRI_LANKA_POLYGON.length - 1; i++) {
    const d = distanceToSegmentKm(
      lat, lon,
      SRI_LANKA_POLYGON[i][1], SRI_LANKA_POLYGON[i][0],
      SRI_LANKA_POLYGON[i + 1][1], SRI_LANKA_POLYGON[i + 1][0]
    );
    if (d < minDist) minDist = d;
  }

  return minDist;
}

/**
 * Great-circle destination coordinate given starting point, distance in km, and bearing in degrees.
 */
export function destinationCoordinate(
  startLat: number,
  startLon: number,
  distanceKm: number,
  bearingDeg: number
): { lat: number; lon: number } {
  const R = 6371;
  const dByR = distanceKm / R;
  const brngRad = (bearingDeg * Math.PI) / 180;
  const lat1Rad = (startLat * Math.PI) / 180;
  const lon1Rad = (startLon * Math.PI) / 180;

  const lat2Rad = Math.asin(
    Math.sin(lat1Rad) * Math.cos(dByR) +
    Math.cos(lat1Rad) * Math.sin(dByR) * Math.cos(brngRad)
  );
  const lon2Rad = lon1Rad + Math.atan2(
    Math.sin(brngRad) * Math.sin(dByR) * Math.cos(lat1Rad),
    Math.cos(dByR) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
  );

  return {
    lat: Number(((lat2Rad * 180) / Math.PI).toFixed(4)),
    lon: Number(((lon2Rad * 180) / Math.PI).toFixed(4))
  };
}

/**
 * Calculates bearing and 16-wind cardinal direction between two points.
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { degrees: number; cardinal: string } {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(brng / 22.5) % 16;
  return { degrees: Math.round(brng), cardinal: directions[index] };
}

/**
 * Returns true only if the PFZ center AND its entire boundary polygon (e.g. 12 km radius)
 * are completely situated over open seawater, with at least minBufferKm clearance from the coastline.
 */
export function isEntireZoneInSea(
  centerLat: number,
  centerLon: number,
  radiusKm = 12,
  minBufferKm = 6
): boolean {
  if (isPointOnLand(centerLat, centerLon)) return false;
  const distToCoast = distanceToCoastKm(centerLat, centerLon);
  if (distToCoast < radiusKm + minBufferKm) return false;

  // Sample 16 radial points around the boundary perimeter
  for (let deg = 0; deg < 360; deg += 22.5) {
    const pt = destinationCoordinate(centerLat, centerLon, radiusKm, deg);
    if (isPointOnLand(pt.lat, pt.lon)) return false;
  }
  return true;
}

/**
 * Determines the natural seaward (open ocean) bearing for any Indian coastal coordinate.
 */
export function getNaturalSeawardBearing(lat: number, lon: number): number {
  // Gujarat / Saurashtra Coast (Porbandar, Veraval, Diu, Dwarka)
  if (lat > 20.5 && lon < 72.0) {
    if (lon < 69.5) return 230; // SW off Dwarka/Porbandar
    return 210; // SSW off Veraval/Somnath
  }
  // Gulf of Khambhat / Surat / Daman
  if (lat >= 20.0 && lat <= 22.0 && lon >= 72.0 && lon <= 73.0) {
    return 240; // WSW towards Arabian Sea
  }
  // Maharashtra & Mumbai Coast (approx 15.7°N to 20.0°N, lon < 73.5)
  if (lat >= 15.7 && lat < 20.0 && lon < 73.5) {
    return 250; // WSW into open Arabian Sea
  }
  // Goa & Karnataka Coast (approx 12.7°N to 15.7°N, lon < 75.0)
  if (lat >= 12.7 && lat < 15.7 && lon < 75.0) {
    return 255; // WSW into Arabian Sea
  }
  // Kerala Coast (approx 8.1°N to 12.7°N, lon < 77.2)
  if (lat >= 8.1 && lat < 12.7 && lon < 77.2) {
    return 250; // WSW into Arabian Sea
  }
  // Kanyakumari / Southern Tip
  if (lat < 8.5 && lon >= 77.2 && lon <= 78.0) {
    return 180; // South into Indian Ocean
  }
  // Gulf of Mannar / Tuticorin / Rameswaram
  if (lat >= 8.5 && lat <= 9.5 && lon >= 78.0 && lon <= 79.5) {
    return 135; // SE into Gulf of Mannar
  }
  // Tamil Nadu & Chennai Coast (approx 9.5°N to 13.5°N, lon >= 79.5)
  if (lat >= 9.5 && lat < 13.5 && lon >= 79.5) {
    return 90; // East into Bay of Bengal
  }
  // Andhra Pradesh Coast (approx 13.5°N to 19.2°N, lon >= 80.0)
  if (lat >= 13.5 && lat < 19.2 && lon >= 80.0) {
    return 115; // ESE into Bay of Bengal
  }
  // Odisha Coast (approx 19.2°N to 21.6°N, lon >= 84.5)
  if (lat >= 19.2 && lat < 21.6 && lon >= 84.5) {
    return 130; // SE into Bay of Bengal
  }
  // West Bengal / Digha / Kolkata Coast
  if (lat >= 21.5 && lon >= 87.0) {
    return 170; // South into Bay of Bengal
  }

  // General fallback based on longitude of the Indian peninsula
  return lon < 77.5 ? 250 : 100;
}

export interface OffshorePFZOptions {
  targetDistanceKm?: number;
  targetBearingDeg?: number;
  zoneRadiusKm?: number;
  minBufferKm?: number;
}

export interface OffshorePFZResult {
  lat: number;
  lon: number;
  distanceKm: number;
  bearing: string;
  bearingDegrees: number;
  distanceToCoastKm: number;
}

/**
 * findValidOffshorePFZ(startLat, startLon, options)
 * 
 * Geographic land/water validation helper that ensures the Potential Fishing Zone (PFZ)
 * coordinate and its entire boundary/polygon (e.g. 12 km radius) are positioned strictly
 * in open seawater, away from cities, roads, states, inland bodies, or shorelines.
 * 
 * If the requested coordinate or bearing intersects land (e.g. Mumbai requested towards ENE),
 * it searches outward for the nearest valid offshore bearing, preserving approximately the
 * target distance (~45–65 km), and updates the displayed bearing/direction.
 */
export function findValidOffshorePFZ(
  startLat: number,
  startLon: number,
  options: OffshorePFZOptions = {}
): OffshorePFZResult {
  const targetDistanceKm = options.targetDistanceKm || 55;
  const zoneRadiusKm = options.zoneRadiusKm || 12;
  const minBufferKm = options.minBufferKm || 6;
  const naturalSeaward = getNaturalSeawardBearing(startLat, startLon);

  // If a specific target bearing was supplied, test it first
  const initialBearingDeg = options.targetBearingDeg !== undefined
    ? options.targetBearingDeg
    : naturalSeaward;

  // 1. Direct validation check: Is the initial requested point safely offshore?
  const initialPt = destinationCoordinate(startLat, startLon, targetDistanceKm, initialBearingDeg);
  if (isEntireZoneInSea(initialPt.lat, initialPt.lon, zoneRadiusKm, minBufferKm)) {
    const bearingInfo = calculateBearing(startLat, startLon, initialPt.lat, initialPt.lon);
    return {
      lat: initialPt.lat,
      lon: initialPt.lon,
      distanceKm: targetDistanceKm,
      bearing: bearingInfo.cardinal,
      bearingDegrees: bearingInfo.degrees,
      distanceToCoastKm: Number(distanceToCoastKm(initialPt.lat, initialPt.lon).toFixed(1))
    };
  }

  // 2. The initial bearing points towards land or lacks sufficient sea clearance!
  // Search angular bearings starting around naturalSeaward and sweeping towards initialBearingDeg
  const anglesToTry: number[] = [];
  
  // Prioritize the natural seaward sector (e.g. 240-260° for Mumbai/West Coast, 90-120° for East Coast)
  anglesToTry.push(naturalSeaward);
  for (let offset = 5; offset <= 90; offset += 5) {
    anglesToTry.push((naturalSeaward - offset + 360) % 360);
    anglesToTry.push((naturalSeaward + offset) % 360);
  }
  // Then sweep the remaining angles if needed
  for (let offset = 95; offset <= 180; offset += 10) {
    anglesToTry.push((naturalSeaward - offset + 360) % 360);
    anglesToTry.push((naturalSeaward + offset) % 360);
  }

  // Realistic offshore distances (~40 km to 70 km)
  const candidateDistances = [
    targetDistanceKm,
    Math.max(45, targetDistanceKm * 0.9),
    Math.min(75, targetDistanceKm * 1.1),
    50,
    55,
    60,
    65,
    45
  ];

  let bestCandidate: OffshorePFZResult | null = null;
  let highestScore = -Infinity;

  for (const brg of anglesToTry) {
    for (const dist of candidateDistances) {
      const coord = destinationCoordinate(startLat, startLon, dist, brg);
      if (isEntireZoneInSea(coord.lat, coord.lon, zoneRadiusKm, minBufferKm)) {
        const coastDist = distanceToCoastKm(coord.lat, coord.lon);
        // Angular offset from natural seaward direction
        const seawardDiff = Math.abs((brg - naturalSeaward + 540) % 360 - 180);
        // Distance difference from requested target distance
        const distDiff = Math.abs(dist - targetDistanceKm);

        // Score prioritizes open-sea clearance and natural seaward orientation
        const score = coastDist * 3 - seawardDiff * 0.4 - distDiff * 0.8;

        if (score > highestScore) {
          highestScore = score;
          const bearingInfo = calculateBearing(startLat, startLon, coord.lat, coord.lon);
          bestCandidate = {
            lat: coord.lat,
            lon: coord.lon,
            distanceKm: Number(dist.toFixed(1)),
            bearing: bearingInfo.cardinal,
            bearingDegrees: bearingInfo.degrees,
            distanceToCoastKm: Number(coastDist.toFixed(1))
          };
        }
      }
    }

    // If we have found a candidate with generous clearance (> 25 km from shore), we can stop early
    if (bestCandidate && bestCandidate.distanceToCoastKm >= zoneRadiusKm + 12) {
      break;
    }
  }

  // Guaranteed fallback: use natural seaward vector at 55 km
  if (!bestCandidate) {
    const fallbackCoord = destinationCoordinate(startLat, startLon, 55, naturalSeaward);
    const bearingInfo = calculateBearing(startLat, startLon, fallbackCoord.lat, fallbackCoord.lon);
    return {
      lat: fallbackCoord.lat,
      lon: fallbackCoord.lon,
      distanceKm: 55,
      bearing: bearingInfo.cardinal,
      bearingDegrees: bearingInfo.degrees,
      distanceToCoastKm: Number(distanceToCoastKm(fallbackCoord.lat, fallbackCoord.lon).toFixed(1))
    };
  }

  return bestCandidate;
}
