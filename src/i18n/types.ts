import { Language } from '../types';

export interface BaseTranslationDictionary {
  // App Header & Branding
  appTitle: string;
  appSubtitle: string;
  badgeLive: string;
  tagline: string;
  selectLocation: string;
  allLocations: string;
  scanAllPorts: string;
  scanning: string;
  scanActiveStations: string;
  languageSelectLabel: string;

  // Navigation
  dashboardView: string;
  mapView: string;
  fleetView: string;

  // Station & Telemetry Card
  liveConditions: string;
  weatherData: string;
  marineData: string;
  temperature: string;
  windSpeed: string;
  windDirection: string;
  precipitation: string;
  waveHeight: string;
  wavePeriod: string;
  waveDirection: string;
  seaSurfaceTemp: string;
  maxWave: string;
  significant: string;
  bearing: string;
  rainMm: string;
  harbor: string;
  targetCatches: string;
  coordinates: string;
  liveRefresh: string;
  queryAgent: string;
  fetching: string;
  lastUpdated: string;
  speedLimit: string;
  pfzOptimal: string;

  // Safety Assessment & Verdicts
  safetyStatus: string;
  zoneStatus: string;
  safeToVenture: string;
  cautionToVenture: string;
  unsafeToVenture: string;
  favorableZone: string;
  moderateZone: string;
  poorZone: string;
  safeBadge: string;
  cautionBadge: string;
  unsafeBadge: string;
  favorableBadge: string;
  moderateBadge: string;
  suboptimalBadge: string;
  safeDesc: string;
  cautionDesc: string;
  unsafeDesc: string;

  // Tomorrow Forecast
  tomorrowForecast: string;
  projectedSafety: string;
  maxWaveTomorrow: string;
  maxWindTomorrow: string;
  thunderstormRisk: string;

  // Critical Alerts
  alertBanner: string;
  lightningAlert: string;
  lightningSubtitle: string;
  emergencyAlert: string;
  criticalSafetyAdvisory: string;
  dismiss: string;
  viewHarbor: string;
  lightningHazardDetail: string;

  // Explainability & Rules
  explainabilityTitle: string;
  explainabilitySubtitle: string;
  agentWorkflow: string;
  rule1Label: string;
  rule2Label: string;
  rule3Label: string;
  rule4Label: string;
  rulesPassed: string;
  rulesWarning: string;
  rulesExceeded: string;
  telemetryInputs: string;
  inspectDetails: string;
  hideDetails: string;
  stepExecuting: string;
  stepCompleted: string;

  // Agent Chat & Reasoning
  agentTitle: string;
  agentSubtitle: string;
  chatPlaceholder: string;
  send: string;
  voiceInput: string;
  listening: string;
  suggestedQueriesTitle: string;
  thinking: string;
  clearChat: string;
  agentReasoningTrace: string;
  multiAgentCollab: string;
  activeAgentsOrchestrated: string;
  weatherAgent: string;
  marineAgent: string;
  riskAgent: string;
  fisheriesAgent: string;
  pfzLocatorAgent: string;
  geofenceAgent: string;

  // Navigation Routing & Geofence
  suggestedRouteTitle: string;
  route: string;
  distance: string;
  estTime: string;
  waypoints: string;
  detourActive: string;
  safeDirect: string;
  fitRoute: string;
  resetToPFZ: string;
  clickSeaHelp: string;
  detourApplied: string;
  detourExplanation: string;
  geofenceWarningTitle: string;
  geofenceInsideWarning: string;
  geofenceNearbyWarning: string;

  // Map Legend
  mapIndicators: string;
  safeHarbor: string;
  coastalStation: string;
  potentialFishingZone: string;
  restrictedZone: string;
  transitPath: string;
  detourBypass: string;

  // Fleet Monitor
  fleetOverview: string;
  stationStatus: string;
  viewStation: string;
  fetchPending: string;

  // Loading & Skeletons
  loadingData: string;
  connectingApi: string;
  queryingFeeds: string;
  scanningStations: string;
  liveTelemetryFetching: string;
  retry: string;

  // Footer & Disclaimer
  maritimeNotice: string;
  disclaimerText: string;
  zeroSimulated: string;
  openMeteoWeather: string;
  openMeteoMarine: string;
  leafletMapping: string;
  modelsActive: string;
}

export interface ExtendedTranslationFields {
  liveData: string;
  unsafeSeaAlert: string;
  selectLanguage: string;
  safeLegend: string;
  moderateLegend: string;
  unsafeLegend: string;
  safeRoutePolyline: string;
  detourBypassLine: string;
  checkedWaypoints: string;
  pfzLegend: string;
  restrictedZoneLegend: string;
  safeRoute: string;
  detour: string;
  safe: string;
  caution: string;
  stayAshore: string;
  clickToRoute: string;
  wave: string;
  wind: string;
  sst: string;
  geofenceAlert: string;
  collapse: string;
  explain: string;
  lightningDesc: string;
  positionInsideZone: string;
  distanceKm: string;
  distanceFromPerimeter: string;
  waveCheck: string;
  windVelocity: string;
  thermalSST: string;
  exceeded: string;
  withinLimit: string;
  limitM: string;
  limitKmh: string;
  heavySwell: string;
  galeHazard: string;
  optimalPfzThermal: string;
  coolerWaters: string;
  warmWaters: string;
  optimalRange: string;
  rulesEvaluated: string;
  toolInvocationsTitle: string;
  fleetSubtitle: string;
  pfz: string;
  selectPort: string;
  modelInfo: string;
  fetchingLiveFeeds: string;
  queryOrca: string;
  portsTitle: string;
  footerDisclaimer: string;
  marineWeatherModels: string;
  switchedStation: string;
  recommendedPfz: string;
  offshoreBearing: string;
  geofenceRestrictedNotice: string;
  welcomeAgentGreeting: string;
  harborMapDesc: string;
  directStraightLine: string;
  safeDetourRoute: string;
  safeDirectRoute: string;
  departure: string;
  destination: string;
  totalDistance: string;
  hoursAtSpeed: string;
  bypassed: string;
  fromDeparture: string;
  detourOffset: string;
  marineRiskReason: string;
  nearestBoundary: string;
  targetDestination: string;
  generatingCorridor: string;
  analyzeStation: string;
  offshoreDistance: string;
  pfzSatelliteModel: string;
  pfzThermalDesc: string;
  restrictedMarineZone: string;
  zeroSimulatedData: string;
  suggestedQueries: string[];
  realApiNotice: string;
  clickToSelect: string;
  voiceNotSupported: string;
  speechRecognitionNotSupported: string;
  readAloud: string;
  stopReading: string;
}

export type TranslationDictionary = BaseTranslationDictionary & ExtendedTranslationFields;

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  script: string;
  region: string;
}
