/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CoastalLocation, WeatherData, MarineData, SafetyAssessment, ZoneQualityAssessment, ChatMessage, AgentTraceStep, PFZRecommendation, SafeRouteResult } from './types';
import { COASTAL_LOCATIONS } from './data/locations';
import { fetchWeatherData, fetchMarineData, assessFishingSafety, assessFishingZoneQuality, findNearestPFZ } from './services/marine/marineService';
import { processAgentInquiry, createTraceStepsForTelemetry } from './services/agents/agentEngine';
import { planAgentsForQuery, createInitialTraceStepsForPlan } from './services/agents/leadAgentDetector';
import { checkGeofence } from './data/restrictedZones';
import { suggestSafeRoute } from './services/marine/routeService';
import { useLanguage } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { AlertBanner } from './components/dashboard/AlertBanner';
import { LocationCard } from './components/dashboard/LocationCard';
import { CoastalMap } from './components/map/CoastalMap';
import { ChatInterface } from './components/chat/ChatInterface';
import { FleetMonitor } from './components/dashboard/FleetMonitor';
import { LiveFetchingBadge } from './components/dashboard/LoadingSkeleton';
import { Waves, Compass, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const { language, t, getLocationName, getStateName, getCoastName } = useLanguage();

  const [activeView, setActiveView] = useState<'dashboard' | 'map' | 'fleet'>('dashboard');
  const [selectedLocation, setSelectedLocation] = useState<CoastalLocation>(COASTAL_LOCATIONS[0]); // Kochi default

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [marine, setMarine] = useState<MarineData | null>(null);
  const [safety, setSafety] = useState<SafetyAssessment | null>(null);
  const [zoneQuality, setZoneQuality] = useState<ZoneQualityAssessment | null>(null);
  const [recommendedPFZ, setRecommendedPFZ] = useState<PFZRecommendation | null>(null);
  const [safeRoute, setSafeRoute] = useState<SafeRouteResult | null>(null);

  const [stationDataMap, setStationDataMap] = useState<Record<string, { weather: WeatherData; marine: MarineData; safety: SafetyAssessment; zoneQuality: ZoneQualityAssessment }>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTraceSteps, setActiveTraceSteps] = useState<AgentTraceStep[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);
  const [isScanningAll, setIsScanningAll] = useState<boolean>(false);
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  // Fetch telemetry for a single location
  const loadLocationTelemetry = useCallback(async (loc: CoastalLocation, appendChatMessage = false) => {
    setIsLoadingTelemetry(true);
    try {
      const [wData, mData, pfzData] = await Promise.all([
        fetchWeatherData(loc.lat, loc.lon),
        fetchMarineData(loc.lat, loc.lon),
        findNearestPFZ(loc.lat, loc.lon)
      ]);

      const geofenceData = checkGeofence(loc.lat, loc.lon);
      const sAssessment = assessFishingSafety(wData, mData);
      const zAssessment = assessFishingZoneQuality(mData.seaSurfaceTemperature);
      const locationTraceSteps = createTraceStepsForTelemetry(wData, mData, sAssessment, zAssessment, language, pfzData, geofenceData);

      const locName = getLocationName(loc);
      const locState = getStateName(loc);

      // Compute safe route with intermediate waypoints, geofence checks, and detour offsets
      const initialRoute = suggestSafeRoute(loc.lat, loc.lon, pfzData.lat, pfzData.lon, {
        marineSafety: {
          waveHeight: mData.waveHeight,
          windSpeed: wData.windSpeed,
          thunderstormRisk: sAssessment.criteria.thunderstormRisk
        },
        startName: locName,
        destName: `PFZ (${pfzData.distanceKm} km ${pfzData.bearing})`
      });

      setWeather(wData);
      setMarine(mData);
      setSafety(sAssessment);
      setZoneQuality(zAssessment);
      setRecommendedPFZ(pfzData);
      setSafeRoute(initialRoute);
      setAlertDismissed(false);

      // Cache into station map
      setStationDataMap((prev) => ({
        ...prev,
        [loc.id]: {
          weather: wData,
          marine: mData,
          safety: sAssessment,
          zoneQuality: zAssessment
        }
      }));

      if (appendChatMessage) {
        const geofenceWarning = geofenceData.isNearOrInside
          ? `> ⚠️ **${t.geofenceRestrictedNotice}** (${geofenceData.nearestZone ? (language === 'hi' ? geofenceData.nearestZone.hindiName : geofenceData.nearestZone.name) : ''} — ${geofenceData.isInside ? t.positionInsideZone : `${geofenceData.distanceKm} ${t.distanceKm} ${t.distanceFromPerimeter}`})\n\n`
          : '';

        const verdictLabel = sAssessment.status === 'SAFE' ? t.safe : sAssessment.status === 'CAUTION' ? t.caution : t.stayAshore;
        const reasonText = language === 'hi' ? sAssessment.hindiReason : sAssessment.reason;

        const welcomeText = `${geofenceWarning}⚓ ${t.switchedStation}: **${locName} (${locState})**\n\n- **${t.wave}**: ${mData.waveHeight}m | **${t.wind}**: ${wData.windSpeed} km/h | **${t.sst}**: ${mData.seaSurfaceTemperature}°C\n- **${t.safetyStatus}**: **${verdictLabel}**\n- **${t.recommendedPfz}**: **${pfzData.distanceKm} km** ${t.offshoreBearing} **${pfzData.bearing}** (SST ${pfzData.seaSurfaceTemperature}°C)\n\n${reasonText}`;

        const rulesList = [
          `Rule 1: ${t.wave} (${mData.waveHeight}m) & ${t.wind} (${wData.windSpeed} km/h) -> ${sAssessment.status}`,
          `Rule 2: ${t.sst} (${mData.seaSurfaceTemperature}°C) -> ${zAssessment.status}`,
          `Rule 3: PFZ -> ${pfzData.distanceKm}km (${pfzData.bearing}) SST ${pfzData.seaSurfaceTemperature}°C`
        ];

        if (geofenceData.isNearOrInside) {
          rulesList.unshift(`⚠️ ${t.geofenceRestrictedNotice}`);
        }

        const agentMsg: ChatMessage = {
          id: `station-switch-${Date.now()}`,
          sender: 'agent',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          locationId: loc.id,
          locationName: locName,
          safety: sAssessment,
          traceSteps: locationTraceSteps,
          recommendedPFZ: pfzData,
          suggestedRoute: initialRoute,
          geofenceAlert: geofenceData,
          weatherSnapshot: wData,
          marineSnapshot: mData,
          explainability: {
            locationName: locName,
            coordinates: { lat: loc.lat, lon: loc.lon },
            waveHeight: mData.waveHeight,
            windSpeed: wData.windSpeed,
            windDirection: wData.windDirection,
            seaSurfaceTemp: mData.seaSurfaceTemperature,
            safetyVerdict: sAssessment.status,
            zoneQuality: zAssessment.status,
            geofenceAlert: geofenceData,
            rulesApplied: rulesList,
            agentWorkflow: [
              `Fetched Open-Meteo Weather API for lat=${loc.lat}, lon=${loc.lon}`,
              `Fetched Open-Meteo Marine API for lat=${loc.lat}, lon=${loc.lon}`,
              `Assessed maritime navigational threshold limits`,
              `Evaluated thermal potential fishing zone gradient`,
              `Executed findNearestPFZ heuristic scanning 5 nearby sectors for 27-29°C SST convergence`,
              `Checked geofence against 4 Indian coastal restricted marine sanctuaries and IMBL boundaries`
            ]
          }
        };

        setMessages((prev) => [...prev, agentMsg]);
      }

      return { wData, mData, sAssessment, zAssessment, pfzData, geofenceData, locationTraceSteps };
    } catch (err) {
      console.warn(`Telemetry load notice for ${loc.name}:`, err);
      return null;
    } finally {
      setIsLoadingTelemetry(false);
    }
  }, [language, t, getLocationName, getStateName]);

  // Initial mount: load Kochi telemetry and welcome message
  useEffect(() => {
    const init = async () => {
      const telemetry = await loadLocationTelemetry(selectedLocation, false);
      const locName = getLocationName(selectedLocation);
      const locState = getStateName(selectedLocation);

      const initialGreeting: ChatMessage = {
        id: 'init-welcome',
        sender: 'agent',
        text: `👋 **${t.welcomeAgentGreeting}**\n\n📍 **${locName} (${locState})**\n\n${t.harborMapDesc}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locationId: selectedLocation.id,
        traceSteps: telemetry?.locationTraceSteps
      };

      setMessages([initialGreeting]);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Location Selection
  const handleSelectLocation = (loc: CoastalLocation) => {
    setSelectedLocation(loc);
    loadLocationTelemetry(loc, true);
  };

  // Handle User Message in Chat
  const handleSendMessage = async (query: string) => {
    const locName = getLocationName(selectedLocation);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      locationId: selectedLocation.id,
      locationName: locName
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setIsThinking(true);

    const plan = planAgentsForQuery(query);
    const initialSteps = createInitialTraceStepsForPlan(plan, language);
    setActiveTraceSteps(initialSteps);

    try {
      const result = await processAgentInquiry(
        query,
        selectedLocation,
        language,
        currentHistory,
        (updatedSteps) => {
          setActiveTraceSteps([...updatedSteps]);
        }
      );

      if (result.location.id !== selectedLocation.id) {
        setSelectedLocation(result.location);
        setWeather(result.weatherData);
        setMarine(result.marineData);
        setSafety(result.safety);
        setZoneQuality(result.zoneQuality);
      }
      setRecommendedPFZ(result.recommendedPFZ);
      if (result.suggestedRoute) {
        setSafeRoute(result.suggestedRoute);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: result.replyText,
        leadAgent: result.leadAgent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locationId: result.location.id,
        locationName: getLocationName(result.location),
        recommendedPFZ: result.recommendedPFZ,
        suggestedRoute: result.suggestedRoute,
        geofenceAlert: result.geofenceAlert,
        toolCalls: result.toolCalls,
        traceSteps: result.traceSteps,
        explainability: result.explainability,
        weatherSnapshot: result.weatherData,
        marineSnapshot: result.marineData,
        safety: result.safety
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.warn('Agent processing notice:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'agent',
        text: `⚠️ ${t.connectingApi}. Please retry your inquiry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
      setActiveTraceSteps([]);
    }
  };

  // Scan all 15 stations
  const handleScanAllStations = async () => {
    setIsScanningAll(true);
    try {
      const updates: Record<string, { weather: WeatherData; marine: MarineData; safety: SafetyAssessment; zoneQuality: ZoneQualityAssessment }> = {};
      
      for (const loc of COASTAL_LOCATIONS) {
        try {
          const [wData, mData] = await Promise.all([
            fetchWeatherData(loc.lat, loc.lon),
            fetchMarineData(loc.lat, loc.lon)
          ]);
          const s = assessFishingSafety(wData, mData);
          const z = assessFishingZoneQuality(mData.seaSurfaceTemperature);
          updates[loc.id] = { weather: wData, marine: mData, safety: s, zoneQuality: z };
        } catch (e) {
          console.warn(`Failed station scan for ${loc.name}:`, e);
        }
      }

      setStationDataMap((prev) => ({ ...prev, ...updates }));
    } finally {
      setIsScanningAll(false);
    }
  };

  const hasUnsafeAlert = Boolean(
    safety && (safety.status === 'UNSAFE' || safety.alertTriggered || safety.criteria?.thunderstormRisk)
  );

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#1C1917] flex flex-col font-sans">
      
      {/* Top Header with 11-Language Selector & Nav */}
      <Header
        selectedLocation={selectedLocation}
        hasUnsafeAlert={hasUnsafeAlert}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Floating Live API Telemetry Fetching Badge */}
      {(isLoadingTelemetry || isScanningAll) && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 shadow-lg">
          <LiveFetchingBadge isScanning={isScanningAll} />
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Quick Harbor Station Selection Ribbon */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] uppercase font-bold text-[#78716C] tracking-wider whitespace-nowrap">
            {t.portsTitle}:
          </span>
          {COASTAL_LOCATIONS.map((loc) => {
            const isSelected = loc.id === selectedLocation.id;
            const stationData = stationDataMap[loc.id];
            const isUnsafe = stationData?.safety?.status === 'UNSAFE';
            const locName = getLocationName(loc);

            return (
              <button
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B2545] text-white shadow-xs border border-[#0B2545]'
                    : 'bg-[#F2ECE1] text-[#44403C] hover:bg-[#E8E0D2] hover:text-[#0B2545] border border-[#DDD4C4]'
                }`}
              >
                {isUnsafe && <span className="w-2 h-2 rounded-full bg-[#DC2626]" />}
                <span>{locName}</span>
              </button>
            );
          })}
        </div>

        {/* Critical Unsafe Alert Banner */}
        {hasUnsafeAlert && !alertDismissed && safety && (
          <AlertBanner
            safety={safety}
            location={selectedLocation}
            onDismiss={() => setAlertDismissed(true)}
          />
        )}

        {/* Real Live Telemetry Station Card */}
        <LocationCard
          location={selectedLocation}
          weather={weather}
          marine={marine}
          safety={safety}
          zoneQuality={zoneQuality}
          isLoading={isLoadingTelemetry}
          onRefresh={() => loadLocationTelemetry(selectedLocation, true)}
          onAskAboutLocation={() => handleSendMessage(
            language === 'hi' 
              ? `कृपया ${getLocationName(selectedLocation)} के लिए संपूर्ण समुद्री सुरक्षा और मत्स्य क्षेत्र रिपोर्ट तैयार करें।` 
              : `Generate complete marine safety and fishing advisory report for ${getLocationName(selectedLocation)}.`
          )}
        />

        {/* View Switcher: Dashboard / Map / Fleet */}
        {activeView === 'dashboard' && (
          <div className="space-y-4">
            <div className="dashboard-workspace">
              {/* Left Column: Conversational Multi-Agent Chat (40-42% on desktop, 1st on mobile) */}
              <div className="dashboard-chat-panel order-1">
                <ChatInterface
                  messages={messages}
                  isThinking={isThinking}
                  activeTraceSteps={activeTraceSteps}
                  selectedLocation={selectedLocation}
                  onSelectLocation={handleSelectLocation}
                  onSendMessage={handleSendMessage}
                  fillHeight={true}
                />
              </div>

              {/* Right Column: Interactive Coastal Map (58-60% on desktop, 2nd on mobile) */}
              <div className="dashboard-map-panel order-2">
                <CoastalMap
                  selectedLocation={selectedLocation}
                  onSelectLocation={handleSelectLocation}
                  stationDataMap={stationDataMap}
                  recommendedPFZ={recommendedPFZ}
                  safeRoute={safeRoute}
                  onRouteGenerated={setSafeRoute}
                  fillHeight={true}
                />
              </div>
            </div>

            {/* Data Provenance & Real API Notice */}
            <div className="p-3 rounded-lg bg-[#F5EFE6] border border-[#DDD4C4] text-xs text-[#57534E] flex items-start gap-2 shadow-xs">
              <Info className="w-4 h-4 text-[#0891B2] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0B2545]">{t.realApiNotice}</strong>
              </div>
            </div>
          </div>
        )}

        {activeView === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] uppercase flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#0891B2]" />
                  {t.mapView}
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5 font-medium">
                  {t.harborMapDesc}
                </p>
              </div>
            </div>

            <CoastalMap
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              stationDataMap={stationDataMap}
              recommendedPFZ={recommendedPFZ}
              safeRoute={safeRoute}
              onRouteGenerated={setSafeRoute}
            />
          </div>
        )}

        {activeView === 'fleet' && (
          <FleetMonitor
            stationDataMap={stationDataMap}
            onSelectLocation={handleSelectLocation}
            onScanAllStations={handleScanAllStations}
            isScanningAll={isScanningAll}
            selectedLocation={selectedLocation}
          />
        )}
      </main>

      {/* Footer with Prominent Demonstration Disclaimer in Selected Language */}
      <footer id="orca-disclaimer-footer" className="border-t border-[#DDD4C4] bg-[#F5EFE6] py-6 text-xs text-[#78716C] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Explicit Demonstration Disclaimer Box */}
          <div className="p-3.5 sm:p-4 rounded-lg bg-[#FFFDF9] border border-[#DDD4C4] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#44403C]">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-md bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              </div>
              <p className="text-xs sm:text-sm font-normal leading-relaxed text-[#44403C]">
                <strong className="text-[#0B2545] font-bold uppercase tracking-wider text-[11px] block sm:inline sm:mr-1.5">
                  {t.maritimeNotice}:
                </strong>
                {t.footerDisclaimer}
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#0B2545] bg-[#F5EFE6] px-2.5 py-1 rounded border border-[#DDD4C4] shrink-0 self-start sm:self-auto font-semibold">
              {t.marineWeatherModels}
            </div>
          </div>

          {/* Attribution & Platform Specs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#DDD4C4] text-xs">
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4 text-[#0891B2]" />
              <span className="font-bold text-[#0B2545] uppercase tracking-wider">{t.appTitle} - {t.appSubtitle}</span>
              <span className="text-[#DDD4C4]">&bull;</span>
              <span className="text-[11px] text-[#0891B2] font-mono font-semibold">{t.zeroSimulatedData}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-[#78716C] text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                Open-Meteo Weather API
              </span>
              <span className="text-[#DDD4C4]">&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                Open-Meteo Marine API
              </span>
              <span className="text-[#DDD4C4]">&bull;</span>
              <span>Leaflet.js Mapping</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
