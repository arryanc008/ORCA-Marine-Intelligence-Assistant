export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu' | 'kn' | 'ml' | 'or' | 'pa';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  script: string;
  region: string;
}

export interface CoastalLocation {
  id: string;
  name: string;
  hindiName: string;
  state: string;
  hindiState: string;
  coast: 'Arabian Sea' | 'Bay of Bengal';
  hindiCoast: string;
  lat: number;
  lon: number;
  harbor: string;
  commonCatches: string[];
}

export interface TomorrowForecast {
  date?: string;
  tempMax?: number;
  tempMin?: number;
  windSpeedMax?: number; // km/h
  weatherCode?: number;
  precipitation?: number; // mm
  hasThunderstormRisk?: boolean;
  thunderstormCodes?: number[];
  waveHeightMax?: number; // meters
  safetyStatus?: 'SAFE' | 'CAUTION' | 'UNSAFE';
  safetyReason?: string;
  hindiSafetyReason?: string;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number; // km/h
  windDirection: number; // degrees
  precipitation: number; // mm
  weatherCode: number;
  dailyWeatherCodes?: number[];
  hasThunderstormRisk?: boolean;
  thunderstormCodes?: number[];
  tempMax?: number;
  tempMin?: number;
  tomorrowForecast?: TomorrowForecast;
  fetchedAt: string;
  isRealData: boolean;
}

export interface MarineData {
  waveHeight: number; // meters
  waveDirection: number; // degrees
  seaSurfaceTemperature: number; // °C
  waveHeightMax?: number;
  waveHeightMaxTomorrow?: number;
  fetchedAt: string;
  isRealData: boolean;
}

export interface ActiveAlert {
  type: 'WIND' | 'WAVE' | 'THUNDERSTORM';
  title: string;
  hindiTitle?: string;
  description: string;
  hindiDescription?: string;
  severity: 'CRITICAL' | 'WARNING' | 'CAUTION';
  wmoCode?: number;
}

export interface SafetyAssessment {
  status: 'SAFE' | 'CAUTION' | 'UNSAFE';
  reason: string;
  hindiReason: string;
  isSafeToVenture: boolean;
  alertTriggered: boolean;
  criteria: {
    windSpeedKmH: number;
    waveHeightM: number;
    windThresholdExceeded: boolean;
    waveThresholdExceeded: boolean;
    thunderstormRisk?: boolean;
    thunderstormCodes?: number[];
  };
  activeAlerts?: ActiveAlert[];
}

export interface ZoneQualityAssessment {
  status: 'FAVORABLE' | 'MODERATE' | 'POOR';
  description: string;
  hindiDescription: string;
  seaSurfaceTemp: number;
  isPotentialFishingZone: boolean;
  thermalCategory: 'Optimal (26-30°C)' | 'Sub-optimal Cooler (<26°C)' | 'Warm / Depleted (>30°C)';
}

export interface FishSpeciesProbability {
  name: string;
  hindiName: string;
  localName?: string;
  probability: number;
  seasonTier: 'Peak' | 'High' | 'Moderate';
  depthZone: 'Pelagic (Surface)' | 'Demersal (Mid-depth)' | 'Bottom (Benthic)';
  hindiDepthZone: string;
}

export interface PFZRecommendation {
  lat: number;
  lon: number;
  seaSurfaceTemperature: number;
  distanceKm: number;
  bearing: string;
  bearingDegrees: number;
  idealRange: string;
  score: number;
  candidatePoints: Array<{
    lat: number;
    lon: number;
    seaSurfaceTemperature: number;
    distanceKm: number;
    score: number;
  }>;
  evaluatedAt: string;
  speciesProbabilities?: FishSpeciesProbability[];
}

export interface RestrictedZoneProperties {
  id: string;
  name: string;
  hindiName: string;
  category: 'MPA' | 'BORDER' | 'SANCTUARY' | 'DEFENSE';
  typeLabel: string;
  hindiTypeLabel?: string;
  description: string;
  hindiDescription?: string;
  legalNotice: string;
  fillColor?: string;
  strokeColor?: string;
}

export interface GeofenceCheckResult {
  isNearOrInside: boolean;
  isInside: boolean;
  distanceKm: number;
  nearestZone?: RestrictedZoneProperties;
  warningMessage?: string;
  hindiWarningMessage?: string;
}

export interface AgentToolCall {
  toolName: 'missionPlanner' | 'getWeatherData' | 'getMarineData' | 'assessFishingSafety' | 'assessFishingZoneQuality' | 'findNearestPFZ' | 'checkGeofence';
  input: Record<string, unknown>;
  output: unknown;
  timestamp: number;
  executionMs: number;
}

export interface AgentTraceStep {
  id: string;
  toolName: 'missionPlanner' | 'getWeatherData' | 'getMarineData' | 'assessFishingSafety' | 'assessFishingZoneQuality' | 'findNearestPFZ' | 'checkGeofence' | 'synthesizeAdvisory' | 'suggestSafeRoute' | string;
  agentName: string;
  hindiAgentName?: string;
  agentIcon: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  summary: string;
  hindiSummary?: string;
  details?: Record<string, unknown>;
  timestamp: number;
  durationMs?: number;
}

export interface ExplainabilityData {
  locationName: string;
  coordinates: { lat: number; lon: number };
  waveHeight: number;
  windSpeed: number;
  windDirection: number;
  seaSurfaceTemp: number;
  safetyVerdict: 'SAFE' | 'CAUTION' | 'UNSAFE';
  zoneQuality: 'FAVORABLE' | 'MODERATE' | 'POOR';
  geofenceAlert?: GeofenceCheckResult;
  thunderstormRisk?: boolean;
  thunderstormCodes?: number[];
  rulesApplied: string[];
  agentWorkflow: string[];
}

export interface LeadAgentInfo {
  id: 'weather' | 'marine' | 'fisheries' | 'geofence' | 'risk' | 'route' | 'coordinator';
  name: string;
  hindiName: string;
  role: string;
  hindiRole: string;
  icon: string;
  badgeColor: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  locationId?: string;
  locationName?: string;
  leadAgent?: LeadAgentInfo;
  toolCalls?: AgentToolCall[];
  traceSteps?: AgentTraceStep[];
  explainability?: ExplainabilityData;
  weatherSnapshot?: WeatherData;
  marineSnapshot?: MarineData;
  recommendedPFZ?: PFZRecommendation;
  geofenceAlert?: GeofenceCheckResult;
  safety?: SafetyAssessment;
  suggestedRoute?: SafeRouteResult;
}

export interface RouteWaypoint {
  id: string;
  index: number;
  label: string;
  hindiLabel: string;
  lat: number;
  lon: number;
  originalLat: number;
  originalLon: number;
  isDetour: boolean;
  detourOffsetKm?: number;
  safetyStatus: 'SAFE' | 'CAUTION' | 'DETOUR' | 'UNSAFE';
  distanceFromStartKm: number;
  geofenceResult: GeofenceCheckResult;
  advisory?: string;
  hindiAdvisory?: string;
}

export interface SafeRouteResult {
  start: { lat: number; lon: number; name?: string };
  destination: { lat: number; lon: number; name?: string };
  waypoints: RouteWaypoint[];
  coordinates: [number, number][]; // [lat, lon][] for Leaflet Polyline
  straightLineCoordinates: [number, number][];
  hasDetour: boolean;
  detourCount: number;
  totalDistanceKm: number;
  directDistanceKm: number;
  estimatedTransitHours: number; // calculated at ~8 knots (14.8 km/h)
  safetyScore: number; // 0 - 100
  summary: string;
  hindiSummary: string;
  restrictedZonesEncountered: string[];
}
