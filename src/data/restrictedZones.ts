import { GeofenceCheckResult, RestrictedZoneProperties } from '../types';

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  properties: RestrictedZoneProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // [lon, lat]
  };
}

export interface RestrictedZonesFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Illustrative GeoJSON polygons representing 4 sample restricted & protected
 * marine zones along Indian coasts (Gulf of Mannar, India-Sri Lanka IMBL,
 * Gahirmatha Sanctuary, and Gulf of Kutch Marine National Park).
 */
export const RESTRICTED_ZONES_GEOJSON: RestrictedZonesFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'gulf-of-mannar-mpa',
      properties: {
        id: 'gulf-of-mannar-mpa',
        name: 'Gulf of Mannar Marine National Park & Biosphere Reserve',
        hindiName: 'मन्नार की खाड़ी समुद्री राष्ट्रीय उद्यान और बायोस्फीयर रिजर्व',
        category: 'MPA',
        typeLabel: 'Marine Protected Area (MPA)',
        hindiTypeLabel: 'समुद्री संरक्षित क्षेत्र (MPA)',
        description: 'Eco-sensitive coral reef, sea grass, and dugong conservation sanctuary. Mechanized commercial trawling and destructive bottom gear prohibited.',
        hindiDescription: 'पर्यावरण-संवेदनशील प्रवाल भित्ति (कोरल) और डुगोंग संरक्षण क्षेत्र। यंत्रीकृत वाणिज्यिक ट्रॉलिंग प्रतिबंधित है।',
        legalNotice: 'Wildlife Protection Act (1972) / Coastal Regulation Zone (CRZ-I). Entry strictly restricted to traditional non-motorized craft in designated buffer zones.',
        fillColor: '#ef4444', // Red / Crimson
        strokeColor: '#b91c1c'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [78.18, 8.75],
            [78.50, 8.95],
            [79.22, 9.24],
            [79.35, 9.18],
            [78.75, 8.82],
            [78.22, 8.68],
            [78.18, 8.75]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'india-srilanka-imbl',
      properties: {
        id: 'india-srilanka-imbl',
        name: 'India - Sri Lanka International Maritime Boundary Line (IMBL) Buffer',
        hindiName: 'भारत - श्रीलंका अंतर्राष्ट्रीय समुद्री सीमा रेखा (IMBL) बफर जोन',
        category: 'BORDER',
        typeLabel: 'International Maritime Boundary Zone',
        hindiTypeLabel: 'अंतर्राष्ट्रीय समुद्री सीमा क्षेत्र',
        description: 'High-security sovereign maritime frontier monitored by Indian Coast Guard and Navy. Crossing without diplomatic authorization leads to detention and vessel seizure.',
        hindiDescription: 'भारतीय तटरक्षक बल और नौसेना द्वारा निगरानी किया जाने वाला उच्च सुरक्षा समुद्री सीमा क्षेत्र। अनधिकृत रूप से पार करना प्रतिबंधित है।',
        legalNotice: '1974 & 1976 Indo-Sri Lankan Maritime Agreements. Fishermen advised to maintain at least 5 nautical miles safety buffer west of the median line.',
        fillColor: '#f97316', // Orange / Amber
        strokeColor: '#c2410c'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [79.28, 9.20],
            [79.45, 9.50],
            [79.72, 9.88],
            [79.98, 10.30],
            [79.88, 10.33],
            [79.60, 9.92],
            [79.36, 9.54],
            [79.20, 9.25],
            [79.28, 9.20]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'gahirmatha-marine-sanctuary',
      properties: {
        id: 'gahirmatha-marine-sanctuary',
        name: 'Gahirmatha Marine Sanctuary & Defense Security Zone',
        hindiName: 'गहिरमाथा समुद्री अभयारण्य और रक्षा सुरक्षा क्षेत्र',
        category: 'SANCTUARY',
        typeLabel: 'Marine Wildlife Sanctuary & Missile Range Buffer',
        hindiTypeLabel: 'समुद्री वन्यजीव अभयारण्य और रक्षा क्षेत्र',
        description: 'World largest nesting ground for endangered Olive Ridley sea turtles (arribada) and exclusion corridor around APJ Abdul Kalam Island (Wheeler Island) test range.',
        hindiDescription: 'संकटापन्न ओलिव रिडले समुद्री कछुओं का प्रमुख प्रजनन अभयारण्य और व्हीलर द्वीप रक्षा परीक्षण सुरक्षा गलियारा।',
        legalNotice: 'Odisha Marine Fisheries Regulation Act (OMFRA). Mechanized fishing banned up to 20 km offshore from Gahirmatha to Rushikulya river mouths.',
        fillColor: '#dc2626',
        strokeColor: '#991b1b'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [86.78, 20.40],
            [87.12, 20.55],
            [87.26, 20.85],
            [87.05, 20.90],
            [86.72, 20.65],
            [86.78, 20.40]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'gulf-of-kutch-marine-park',
      properties: {
        id: 'gulf-of-kutch-marine-park',
        name: 'Gulf of Kutch Marine National Park & Coral Reserve',
        hindiName: 'कच्छ की खाड़ी समुद्री राष्ट्रीय उद्यान और प्रवाल रिजर्व',
        category: 'MPA',
        typeLabel: 'Marine National Park & Sanctuary',
        hindiTypeLabel: 'समुद्री राष्ट्रीय उद्यान और अभयारण्य',
        description: 'First marine national park of India protecting 42 islands, live scleractinian coral reefs, mangroves, and marine mammals in southern Gulf of Kutch.',
        hindiDescription: 'भारत का पहला समुद्री राष्ट्रीय उद्यान, जो 42 द्वीपों, प्रवाल भित्तियों, मैंग्रोव और समुद्री जीवों की रक्षा करता है।',
        legalNotice: 'Indian Wildlife Protection Act (1972). Bottom dredging, commercial fish harvesting, and chemical discharge are strictly unlawful.',
        fillColor: '#e11d48', // Rose / Red
        strokeColor: '#9f1239'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [69.18, 22.45],
            [69.45, 22.65],
            [69.95, 22.70],
            [70.05, 22.58],
            [69.60, 22.48],
            [69.25, 22.38],
            [69.18, 22.45]
          ]
        ]
      }
    }
  ]
};

/**
 * Checks if a given (lat, lon) is inside a polygon using Ray-Casting algorithm.
 * Note: GeoJSON coordinates are [lon, lat].
 */
function isPointInPolygon(lat: number, lon: number, polygonCoords: number[][]): boolean {
  let inside = false;
  const n = polygonCoords.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygonCoords[i][0]; // lon
    const yi = polygonCoords[i][1]; // lat
    const xj = polygonCoords[j][0]; // lon
    const yj = polygonCoords[j][1]; // lat

    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Computes minimum distance from a point to a line segment in kilometers.
 */
function distanceToSegmentKm(
  pLat: number,
  pLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): number {
  const avgLatRad = ((pLat + aLat + bLat) / 3) * (Math.PI / 180);
  const cosLat = Math.cos(avgLatRad);
  const kx = 111.139 * cosLat;
  const ky = 111.139;

  const px = pLon * kx;
  const py = pLat * ky;
  const ax = aLon * kx;
  const ay = aLat * ky;
  const bx = bLon * kx;
  const by = bLat * ky;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const distx = px - ax;
    const disty = py - ay;
    return Math.sqrt(distx * distx + disty * disty);
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projx = ax + t * dx;
  const projy = ay + t * dy;
  const distx = px - projx;
  const disty = py - projy;
  return Math.sqrt(distx * distx + disty * disty);
}

/**
 * Computes shortest distance in km from a point (lat, lon) to a polygon perimeter.
 */
function distanceToPolygonPerimeterKm(lat: number, lon: number, polygonCoords: number[][]): number {
  let minDistance = Infinity;
  for (let i = 0; i < polygonCoords.length - 1; i++) {
    const aLon = polygonCoords[i][0];
    const aLat = polygonCoords[i][1];
    const bLon = polygonCoords[i + 1][0];
    const bLat = polygonCoords[i + 1][1];

    const d = distanceToSegmentKm(lat, lon, aLat, aLon, bLat, bLon);
    if (d < minDistance) {
      minDistance = d;
    }
  }
  return minDistance;
}

/**
 * checkGeofence(lat, lon):
 * Checks if a queried point falls within or near (within 5km of) any restricted marine zone.
 */
export function checkGeofence(lat: number, lon: number): GeofenceCheckResult {
  let nearestZone: RestrictedZoneProperties | undefined = undefined;
  let minDistanceKm = Infinity;
  let isInside = false;

  for (const feature of RESTRICTED_ZONES_GEOJSON.features) {
    const ring = feature.geometry.coordinates[0];
    const inside = isPointInPolygon(lat, lon, ring);

    if (inside) {
      isInside = true;
      minDistanceKm = 0;
      nearestZone = feature.properties;
      break; // Directly inside
    }

    const dist = distanceToPolygonPerimeterKm(lat, lon, ring);
    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      nearestZone = feature.properties;
    }
  }

  // Rounded to 1 decimal place
  const roundedDist = Math.round(minDistanceKm * 10) / 10;
  const isNearOrInside = isInside || roundedDist <= 5.0;

  if (isNearOrInside && nearestZone) {
    const warningMessage = `⚠️ This location is near a restricted/protected marine zone. (${nearestZone.name} - ${isInside ? 'INSIDE ZONE' : `${roundedDist} km from perimeter`}). Navigation and commercial fishing subject to strict maritime regulations.`;
    const hindiWarningMessage = `⚠️ यह स्थान एक प्रतिबंधित/संरक्षित समुद्री क्षेत्र के निकट है। (${nearestZone.hindiName} - ${isInside ? 'क्षेत्र के भीतर' : `सीमा से ${roundedDist} किमी`})। वाणिज्यिक मत्स्य पालन और पोत प्रवेश सख्त नियमों के अधीन है।`;

    return {
      isNearOrInside: true,
      isInside,
      distanceKm: roundedDist,
      nearestZone,
      warningMessage,
      hindiWarningMessage
    };
  }

  return {
    isNearOrInside: false,
    isInside: false,
    distanceKm: roundedDist,
    nearestZone
  };
}

export const RESTRICTED_MARINE_ZONES = RESTRICTED_ZONES_GEOJSON.features;

