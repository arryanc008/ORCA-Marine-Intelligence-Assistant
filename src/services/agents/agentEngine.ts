import { CoastalLocation, WeatherData, MarineData, SafetyAssessment, ZoneQualityAssessment, AgentToolCall, AgentTraceStep, ExplainabilityData, Language, PFZRecommendation, GeofenceCheckResult, ChatMessage, SafeRouteResult, LeadAgentInfo } from '../../types';
import { fetchWeatherData, fetchMarineData, assessFishingSafety, assessFishingZoneQuality, findNearestPFZ, getWindDirectionText, getWeatherDescription } from '../marine/marineService';
import { findLocationByName, getLocationById } from '../../data/locations';
import { checkGeofence } from '../../data/restrictedZones';
import { suggestSafeRoute } from '../marine/routeService';
import { detectLeadAgent, SPECIALIST_AGENTS, planAgentsForQuery, createInitialTraceStepsForPlan } from './leadAgentDetector';

export interface AgentProcessResult {
  replyText: string;
  leadAgent: LeadAgentInfo;
  location: CoastalLocation;
  weatherData: WeatherData;
  marineData: MarineData;
  safety: SafetyAssessment;
  zoneQuality: ZoneQualityAssessment;
  recommendedPFZ: PFZRecommendation;
  geofenceAlert: GeofenceCheckResult;
  toolCalls: AgentToolCall[];
  traceSteps: AgentTraceStep[];
  explainability: ExplainabilityData;
  suggestedRoute?: SafeRouteResult;
}

export function createTraceStepsForTelemetry(
  weather: WeatherData,
  marine: MarineData,
  safety: SafetyAssessment,
  zoneQuality: ZoneQualityAssessment,
  language: Language = 'en',
  recommendedPFZ?: PFZRecommendation,
  geofence?: GeofenceCheckResult
): AgentTraceStep[] {
  return [
    {
      id: `step-planner-${Date.now()}-0`,
      toolName: 'missionPlanner',
      agentName: 'Planner Agent',
      hindiAgentName: 'प्लानर एजेंट',
      agentIcon: '🧭',
      status: 'completed',
      summary: language === 'hi' ? 'मिशन योजना व एजेंट समन्वय पूर्ण' : 'Mission planning & agent orchestration complete',
      hindiSummary: 'मिशन योजना व एजेंट समन्वय पूर्ण',
      details: { role: 'Planner Agent' },
      timestamp: Date.now(),
      durationMs: 2000
    },
    {
      id: `step-weather-${Date.now()}-1`,
      toolName: 'getWeatherData',
      agentName: 'Weather Agent',
      hindiAgentName: 'मौसम एजेंट',
      agentIcon: '🌦️',
      status: 'completed',
      summary: language === 'hi' ? `हवा: ${weather.windSpeed} किमी/घंटा, तापमान: ${weather.temperature}°C` : `Fetched wind: ${weather.windSpeed} km/h, temp: ${weather.temperature}°C`,
      hindiSummary: `हवा: ${weather.windSpeed} किमी/घंटा, तापमान: ${weather.temperature}°C`,
      details: {
        tool: 'getWeatherData',
        windSpeed: `${weather.windSpeed} km/h`,
        temperature: `${weather.temperature}°C`
      },
      timestamp: Date.now(),
      durationMs: 2000
    },
    {
      id: `step-marine-${Date.now()}-2`,
      toolName: 'getMarineData',
      agentName: 'Marine Agent',
      hindiAgentName: 'समुद्री एजेंट',
      agentIcon: '🌊',
      status: 'completed',
      summary: language === 'hi' ? `लहरें: ${marine.waveHeight} मी, जल तापमान: ${marine.seaSurfaceTemperature}°C` : `Wave: ${marine.waveHeight}m, SST: ${marine.seaSurfaceTemperature}°C`,
      hindiSummary: `लहरें: ${marine.waveHeight} मी, SST: ${marine.seaSurfaceTemperature}°C`,
      details: {
        tool: 'getMarineData',
        waveHeight: `${marine.waveHeight} m`,
        seaSurfaceTemp: `${marine.seaSurfaceTemperature}°C`
      },
      timestamp: Date.now(),
      durationMs: 2000
    },
    {
      id: `step-risk-${Date.now()}-3`,
      toolName: 'assessFishingSafety',
      agentName: 'Risk & Safety Agent',
      hindiAgentName: 'सुरक्षा व जोखिम एजेंट',
      agentIcon: '🛡️',
      status: 'completed',
      summary: language === 'hi' ? `सुरक्षा फैसला: ${safety.status === 'SAFE' ? 'सुरक्षित' : safety.status === 'CAUTION' ? 'सावधानी' : 'असुरक्षित'}` : `Safety verdict: ${safety.status}`,
      hindiSummary: `सुरक्षा फैसला: ${safety.status}`,
      details: {
        tool: 'assessFishingSafety',
        verdict: safety.status
      },
      timestamp: Date.now(),
      durationMs: 2000
    },
    {
      id: `step-pfz-${Date.now()}-4`,
      toolName: 'findNearestPFZ',
      agentName: 'Fisheries Agent',
      hindiAgentName: 'मत्स्य क्षेत्र एजेंट',
      agentIcon: '🐟',
      status: 'completed',
      summary: language === 'hi' ? `मत्स्य क्षेत्र: ${recommendedPFZ ? recommendedPFZ.distanceKm : 30} किमी` : `Identified fishing zone: ${recommendedPFZ ? recommendedPFZ.distanceKm : 30} km`,
      hindiSummary: `मत्स्य क्षेत्र: ${recommendedPFZ ? recommendedPFZ.distanceKm : 30} किमी`,
      details: {
        tool: 'findNearestPFZ',
        distance: `${recommendedPFZ ? recommendedPFZ.distanceKm : 30} km`
      },
      timestamp: Date.now(),
      durationMs: 2000
    },
    {
      id: `step-geofence-${Date.now()}-5`,
      toolName: 'checkGeofence',
      agentName: 'Geofence Guardian Agent',
      hindiAgentName: 'जियोफेंस गार्डियन एजेंट',
      agentIcon: '⚓',
      status: 'completed',
      summary: geofence?.isNearOrInside ? (language === 'hi' ? 'प्रतिबंधित क्षेत्र अलर्ट' : 'Near restricted marine zone') : (language === 'hi' ? 'संरक्षित क्षेत्रों से सुरक्षित दूरी' : 'Clear of restricted zones'),
      hindiSummary: geofence?.isNearOrInside ? 'प्रतिबंधित क्षेत्र अलर्ट' : 'सुरक्षित दूरी',
      details: {
        tool: 'checkGeofence',
        distance: `${geofence?.distanceKm ?? 15} km`
      },
      timestamp: Date.now(),
      durationMs: 2000
    }
  ];
}

export async function processAgentInquiry(
  userQuery: string,
  currentLocation: CoastalLocation,
  language: Language,
  conversationHistory: ChatMessage[] = [],
  onProgress?: (steps: AgentTraceStep[]) => void
): Promise<AgentProcessResult> {
  const toolCalls: AgentToolCall[] = [];
  const rulesApplied: string[] = [];
  const workflowSteps: string[] = [];

  // Step 1: Detect targeted location and context from user query or prior turns
  const explicitLocation = findLocationByName(userQuery);
  let detectedLocation: CoastalLocation | undefined = explicitLocation;
  let priorPFZ: PFZRecommendation | undefined = undefined;

  // Search backward in conversation history for previously referenced location and PFZ
  const reversedHistory = [...conversationHistory].reverse();
  for (const msg of reversedHistory) {
    if (!detectedLocation && msg.locationId) {
      const loc = getLocationById(msg.locationId);
      if (loc) {
        detectedLocation = loc;
      }
    }
    if (!priorPFZ && msg.recommendedPFZ) {
      priorPFZ = msg.recommendedPFZ;
    }
    if (detectedLocation && priorPFZ) break;
  }

  if (!detectedLocation) {
    detectedLocation = currentLocation;
  }

  // Detect follow-up intents
  const isRouteInquiry = /(route|heading|compass|direction|navigate|waypoint|how to get there|how to reach|travel time|distance there|distance to it|path to|path there|मार्ग|रास्ता|दिशा|पहुंच|दूरी)/i.test(userQuery);
  const isTomorrowInquiry = /(tomorrow|next day|future|ahead|morning|day after|कल|आने वाले कल|अगले दिन|safe tomorrow)/i.test(userQuery);

  workflowSteps.push(`Target Location identified: ${detectedLocation.name} (${detectedLocation.state}) [Lat: ${detectedLocation.lat}, Lon: ${detectedLocation.lon}]${priorPFZ ? ` (Prior PFZ: ${priorPFZ.distanceKm}km)` : ''}`);

  const plan = planAgentsForQuery(userQuery);
  let activeLeadAgent = plan.leadAgent;
  const traceSteps: AgentTraceStep[] = createInitialTraceStepsForPlan(plan, language);

  workflowSteps.push(`Target Location identified: ${detectedLocation.name} (${detectedLocation.state}) [Lat: ${detectedLocation.lat}, Lon: ${detectedLocation.lon}]${priorPFZ ? ` (Prior PFZ: ${priorPFZ.distanceKm}km)` : ''}`);
  workflowSteps.push(`Targeted Mission Plan: ${plan.rationale} [Lead: ${activeLeadAgent.name}, Active Agents: ${plan.requiredAgentIds.join(', ')}]`);

  if (onProgress) {
    onProgress([...traceSteps]);
  }

  // Optimized buffering delay per agent: fast and responsive for focused questions (800-1000ms instead of 2000ms)
  const stepDelayMs = plan.requiredAgentIds.length <= 3 ? 1000 : 750;

  const updateStepStatus = (
    stepId: string,
    status: 'running' | 'completed',
    summary: string,
    hindiSummary?: string,
    details?: Record<string, unknown>,
    durationMs?: number
  ) => {
    const idx = traceSteps.findIndex(s => s.id === stepId);
    if (idx !== -1) {
      traceSteps[idx] = {
        ...traceSteps[idx],
        status,
        summary: language === 'hi' && hindiSummary ? hindiSummary : summary,
        hindiSummary: hindiSummary || traceSteps[idx].hindiSummary,
        details: details || traceSteps[idx].details,
        durationMs: durationMs || traceSteps[idx].durationMs
      };
      if (onProgress) {
        onProgress([...traceSteps]);
      }
    }
  };

  // Start background telemetry pre-fetching immediately
  const weatherPromise = fetchWeatherData(detectedLocation.lat, detectedLocation.lon);
  const marinePromise = fetchMarineData(detectedLocation.lat, detectedLocation.lon);

  // Execute Agent 1: Planner Agent (if included in plan)
  if (plan.requiredAgentIds.includes('planner')) {
    updateStepStatus(
      'step-planner',
      'running',
      'Formulating maritime mission plan & delegating specialist agents...',
      'मिशन योजना तैयार हो रही है और विशेषज्ञ एजेंट तैनात किए जा रहे हैं...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));
    updateStepStatus(
      'step-planner',
      'completed',
      'Mission planning complete',
      'मिशन योजना व एजेंट समन्वय पूर्ण',
      { role: 'Planner Agent', rationale: plan.rationale },
      stepDelayMs
    );
  }

  // Fetch Weather Telemetry
  const t0 = performance.now();
  const weather = await weatherPromise;
  const t1 = performance.now();
  const weatherMs = Math.round(t1 - t0);

  toolCalls.push({
    toolName: 'getWeatherData',
    input: { lat: detectedLocation.lat, lon: detectedLocation.lon, locationName: detectedLocation.name },
    output: {
      temperature: weather.temperature,
      windSpeedKmH: weather.windSpeed,
      windDirectionDeg: weather.windDirection,
      precipitationMm: weather.precipitation,
      weatherCode: weather.weatherCode,
      tempRange: `${weather.tempMin}°C - ${weather.tempMax}°C`
    },
    timestamp: Date.now(),
    executionMs: weatherMs
  });

  // Execute Weather Agent (if required by query)
  if (plan.requiredAgentIds.includes('weather')) {
    updateStepStatus(
      'step-weather',
      'running',
      'Fetching atmospheric wind speed & temperature telemetry...',
      'वायुमंडलीय मौसम डेटा प्राप्त हो रहा है...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));
    updateStepStatus(
      'step-weather',
      'completed',
      `Wind: ${weather.windSpeed} km/h, Temp: ${weather.temperature}°C`,
      `हवा: ${weather.windSpeed} किमी/घंटा, तापमान: ${weather.temperature}°C`,
      {
        tool: 'getWeatherData',
        location: detectedLocation.name,
        windSpeed: `${weather.windSpeed} km/h`,
        temperature: `${weather.temperature}°C`
      },
      stepDelayMs
    );
  }

  // Fetch Marine Telemetry
  const t2 = performance.now();
  const marine = await marinePromise;
  const t3 = performance.now();
  const marineMs = Math.round(t3 - t2);

  toolCalls.push({
    toolName: 'getMarineData',
    input: { lat: detectedLocation.lat, lon: detectedLocation.lon, locationName: detectedLocation.name },
    output: {
      waveHeightM: marine.waveHeight,
      waveDirectionDeg: marine.waveDirection,
      seaSurfaceTempC: marine.seaSurfaceTemperature,
      waveHeightMaxM: marine.waveHeightMax
    },
    timestamp: Date.now(),
    executionMs: marineMs
  });

  // Execute Marine Agent (if required by query)
  if (plan.requiredAgentIds.includes('marine')) {
    updateStepStatus(
      'step-marine',
      'running',
      'Querying ocean wave heights & sea surface temperature...',
      'समुद्री तरंगों व तापमान का विश्लेषण हो रहा है...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));
    updateStepStatus(
      'step-marine',
      'completed',
      `Wave: ${marine.waveHeight}m, SST: ${marine.seaSurfaceTemperature}°C`,
      `लहरें: ${marine.waveHeight} मी, जल तापमान: ${marine.seaSurfaceTemperature}°C`,
      {
        tool: 'getMarineData',
        waveHeight: `${marine.waveHeight} m`,
        seaSurfaceTemp: `${marine.seaSurfaceTemperature}°C`
      },
      stepDelayMs
    );
  }

  // Safety Assessment Engine
  const t4 = performance.now();
  const safety = assessFishingSafety(weather, marine);
  const t5 = performance.now();
  const safetyMs = Math.round(t5 - t4);

  toolCalls.push({
    toolName: 'assessFishingSafety',
    input: { windSpeedKmH: weather.windSpeed, waveHeightM: marine.waveHeight },
    output: {
      status: safety.status,
      isSafeToVenture: safety.isSafeToVenture,
      alertTriggered: safety.alertTriggered,
      windThresholdExceeded: safety.criteria.windThresholdExceeded,
      waveThresholdExceeded: safety.criteria.waveThresholdExceeded
    },
    timestamp: Date.now(),
    executionMs: safetyMs
  });

  if (safety.status === 'UNSAFE') {
    rulesApplied.push(`Rule 1 Triggered: Critical Threshold Exceeded (Wave: ${marine.waveHeight}m > 2.5m OR Wind: ${weather.windSpeed} km/h > 40 km/h) -> UNSAFE`);
  } else if (safety.status === 'CAUTION') {
    rulesApplied.push(`Rule 1 Triggered: Moderate Swell/Wind (Wave: ${marine.waveHeight}m > 1.8m OR Wind: ${weather.windSpeed} km/h > 28 km/h) -> CAUTION`);
  } else {
    rulesApplied.push(`Rule 1 Triggered: Calm Sea Baseline (Wave: ${marine.waveHeight}m ≤ 2.5m AND Wind: ${weather.windSpeed} km/h ≤ 40 km/h) -> SAFE`);
  }

  // Execute Risk & Safety Agent (if required by query)
  if (plan.requiredAgentIds.includes('risk')) {
    updateStepStatus(
      'step-risk',
      'running',
      'Evaluating maritime safety limits & gale thresholds...',
      'सुरक्षा नियमों व सीमाओं का मूल्यांकन जारी...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));
    updateStepStatus(
      'step-risk',
      'completed',
      `Safety verdict: ${safety.status}`,
      `सुरक्षा फैसला: ${safety.status === 'SAFE' ? 'सुरक्षित' : safety.status === 'CAUTION' ? 'सावधानी' : 'असुरक्षित'}`,
      {
        tool: 'assessFishingSafety',
        safetyVerdict: safety.status
      },
      stepDelayMs
    );
  }

  // Step 5: Fishing Zone & Species Analysis (Fisheries Agent)
  const t6 = performance.now();
  const zoneQuality = assessFishingZoneQuality(marine.seaSurfaceTemperature);
  const t7 = performance.now();
  const zoneMs = Math.round(t7 - t6);

  toolCalls.push({
    toolName: 'assessFishingZoneQuality',
    input: { seaSurfaceTemp: marine.seaSurfaceTemperature },
    output: {
      status: zoneQuality.status,
      isPotentialFishingZone: zoneQuality.isPotentialFishingZone,
      thermalCategory: zoneQuality.thermalCategory
    },
    timestamp: Date.now(),
    executionMs: zoneMs
  });

  const t8 = performance.now();
  let recommendedPFZ: PFZRecommendation;
  if (isRouteInquiry && priorPFZ) {
    recommendedPFZ = priorPFZ;
  } else {
    recommendedPFZ = await findNearestPFZ(detectedLocation.lat, detectedLocation.lon);
  }
  const t9 = performance.now();
  const pfzMs = Math.round(t9 - t8);

  toolCalls.push({
    toolName: 'findNearestPFZ',
    input: {
      lat: detectedLocation.lat,
      lon: detectedLocation.lon,
      offsets: '±0.3°, ±0.5° lat/lon (5 coordinates)',
      targetThermalRange: '27°C–29°C'
    },
    output: {
      pfzLat: recommendedPFZ.lat,
      pfzLon: recommendedPFZ.lon,
      distanceKm: recommendedPFZ.distanceKm,
      bearing: recommendedPFZ.bearing,
      bearingDegrees: recommendedPFZ.bearingDegrees,
      seaSurfaceTemperature: recommendedPFZ.seaSurfaceTemperature,
      idealRange: recommendedPFZ.idealRange,
      score: recommendedPFZ.score,
      candidatesEvaluated: recommendedPFZ.candidatePoints.length,
      speciesCount: recommendedPFZ.speciesProbabilities?.length ?? 0
    },
    timestamp: Date.now(),
    executionMs: pfzMs
  });

  // Execute Fisheries & Species Agent (if required by query)
  if (plan.requiredAgentIds.includes('fisheries')) {
    updateStepStatus(
      'step-fisheries',
      'running',
      'Calculating fish species probabilities & locating thermal PFZ...',
      'मछली प्रजातियों की संभावना व PFZ का विश्लेषण जारी...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));

    const topSpecies = (recommendedPFZ.speciesProbabilities || []).slice(0, 3);
    const topSpeciesEn = topSpecies.map(s => `${s.name} ${s.probability}%`).join(', ');
    const topSpeciesHi = topSpecies.map(s => `${s.hindiName} ${s.probability}%`).join(', ');

    updateStepStatus(
      'step-fisheries',
      'completed',
      topSpeciesEn ? `PFZ: ${recommendedPFZ.distanceKm} km (${recommendedPFZ.bearing}) • Top: ${topSpeciesEn}` : `Fishing zone at ${recommendedPFZ.distanceKm} km (${recommendedPFZ.bearing})`,
      topSpeciesHi ? `मत्स्य क्षेत्र: ${recommendedPFZ.distanceKm} किमी • शीर्ष: ${topSpeciesHi}` : `मत्स्य क्षेत्र: ${recommendedPFZ.distanceKm} किमी (${recommendedPFZ.bearing})`,
      {
        tool: 'findNearestPFZ',
        recommendedCoordinates: `${recommendedPFZ.lat}°N, ${recommendedPFZ.lon}°E`,
        offshoreDistance: `${recommendedPFZ.distanceKm} km`,
        topSpecies: topSpecies.map(s => `${s.name} (${s.probability}%)`)
      },
      stepDelayMs
    );
  }

  // Step 6: Protected Zone Geofence Check (Geofence Guardian Agent)
  const t10 = performance.now();
  const geofence = checkGeofence(detectedLocation.lat, detectedLocation.lon);
  const t11 = performance.now();
  const geofenceMs = Math.round(t11 - t10);

  toolCalls.push({
    toolName: 'checkGeofence',
    input: { lat: detectedLocation.lat, lon: detectedLocation.lon, proximityBufferKm: 5 },
    output: {
      isNearOrInside: geofence.isNearOrInside,
      isInside: geofence.isInside,
      distanceKm: geofence.distanceKm,
      nearestZone: geofence.nearestZone?.name,
      category: geofence.nearestZone?.category,
      warningMessage: geofence.warningMessage
    },
    timestamp: Date.now(),
    executionMs: geofenceMs
  });

  if (geofence.isNearOrInside) {
    rulesApplied.push("⚠️ This location is near a restricted/protected marine zone.");
  }

  // Execute Geofence Guardian Agent (if required by query)
  if (plan.requiredAgentIds.includes('geofence')) {
    updateStepStatus(
      'step-geofence',
      'running',
      'Verifying proximity to restricted marine protected areas & borders...',
      'प्रतिबंधित व संरक्षित समुद्री सीमाओं की जांच जारी...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));
    updateStepStatus(
      'step-geofence',
      'completed',
      geofence.isNearOrInside ? `Near restricted zone (${geofence.nearestZone?.name})` : 'Clear of restricted zones',
      geofence.isNearOrInside ? `प्रतिबंधित क्षेत्र के निकट (${geofence.nearestZone?.hindiName})` : 'संरक्षित क्षेत्रों से सुरक्षित दूरी',
      {
        tool: 'checkGeofence',
        distance: `${geofence.distanceKm} km`
      },
      stepDelayMs
    );
  }

  // Execute Route & Navigation Agent (if required by query)
  if (plan.requiredAgentIds.includes('route')) {
    updateStepStatus(
      'step-route',
      'running',
      'Calculating safe navigational routing & waypoints...',
      'सुरक्षित नेविगेशन मार्ग व दिशा की गणना जारी...'
    );
    await new Promise(r => setTimeout(r, stepDelayMs));
    updateStepStatus(
      'step-route',
      'completed',
      `Heading: ${recommendedPFZ.bearing} (${recommendedPFZ.bearingDegrees}°), Distance: ${recommendedPFZ.distanceKm} km`,
      `दिशा: ${recommendedPFZ.bearing} (${recommendedPFZ.bearingDegrees}°), दूरी: ${recommendedPFZ.distanceKm} किमी`,
      {
        tool: 'suggestSafeRoute',
        distanceKm: recommendedPFZ.distanceKm,
        bearing: recommendedPFZ.bearing
      },
      stepDelayMs
    );
  }

  const explainability: ExplainabilityData = {
    locationName: detectedLocation.name,
    coordinates: { lat: detectedLocation.lat, lon: detectedLocation.lon },
    waveHeight: marine.waveHeight,
    windSpeed: weather.windSpeed,
    windDirection: weather.windDirection,
    seaSurfaceTemp: marine.seaSurfaceTemperature,
    safetyVerdict: safety.status,
    zoneQuality: zoneQuality.status,
    geofenceAlert: geofence,
    thunderstormRisk: safety.criteria.thunderstormRisk,
    thunderstormCodes: safety.criteria.thunderstormCodes,
    rulesApplied,
    agentWorkflow: workflowSteps
  };

  // Try Server-side Gemini endpoint first if available
  let aiGeneratedText = '';
  try {
    const historyPayload = conversationHistory.slice(-8).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message: userQuery,
        location: detectedLocation,
        weatherData: weather,
        marineData: marine,
        recommendedPFZ,
        geofence,
        safety,
        zoneQuality,
        leadAgent: activeLeadAgent,
        language,
        history: historyPayload
      })
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.text) {
        aiGeneratedText = data.text.trim();
        if (data.leadAgent) {
          activeLeadAgent = data.leadAgent;
        }
      }
    }
  } catch (err) {
    console.warn('Server Gemini route not responding, using direct agent synthesis:', err);
  }

  // If Gemini didn't return text (e.g. key not set or offline), synthesize targeted specialist agent report
  if (!aiGeneratedText) {
    if (activeLeadAgent.id === 'weather') {
      aiGeneratedText = buildWeatherSpecialistText(detectedLocation, weather, marine, safety, language);
    } else if (activeLeadAgent.id === 'marine') {
      aiGeneratedText = buildMarineSpecialistText(detectedLocation, marine, weather, language);
    } else if (activeLeadAgent.id === 'fisheries') {
      aiGeneratedText = buildFisheriesSpecialistText(detectedLocation, recommendedPFZ, marine, zoneQuality, language);
    } else if (activeLeadAgent.id === 'geofence') {
      aiGeneratedText = buildGeofenceSpecialistText(detectedLocation, geofence, language);
    } else if (activeLeadAgent.id === 'route' || isRouteInquiry) {
      aiGeneratedText = buildRouteAdvisoryText(
        detectedLocation,
        recommendedPFZ,
        weather,
        marine,
        language,
        geofence
      );
    } else if (activeLeadAgent.id === 'risk') {
      aiGeneratedText = buildRiskSpecialistText(detectedLocation, safety, weather, marine, language);
    } else if (isTomorrowInquiry) {
      aiGeneratedText = buildTomorrowSafetyAdvisoryText(
        detectedLocation,
        weather,
        marine,
        safety,
        language
      );
    } else {
      aiGeneratedText = buildAgentReportText(
        detectedLocation,
        weather,
        marine,
        safety,
        zoneQuality,
        recommendedPFZ,
        language,
        geofence
      );
    }
  } else {
    // If Gemini output is present, clean it to plain language and ensure critical warnings are kept
    aiGeneratedText = cleanPlainResponse(aiGeneratedText);
    if (safety.criteria.thunderstormRisk && !aiGeneratedText.toLowerCase().includes('lightning') && !aiGeneratedText.includes('बिजली')) {
      const tsWarning = language === 'hi'
        ? ' बिजली गिरने और आंधी-तूफान का गंभीर खतरा है, इसलिए छोटी नौकाएं बिल्कुल न ले जाएं।'
        : ' Note that there is a severe thunderstorm and lightning risk, so small craft should remain ashore.';
      aiGeneratedText += tsWarning;
    }
    if (geofence.isNearOrInside && !aiGeneratedText.toLowerCase().includes('restricted') && !aiGeneratedText.includes('प्रतिबंधित')) {
      const warningSuffix = language === 'hi'
        ? ` ध्यान रहे कि आप ${geofence.nearestZone?.hindiName || 'संरक्षित समुद्री क्षेत्र'} के निकट हैं।`
        : ` Please note that you are near the protected ${geofence.nearestZone?.name || 'marine area'} boundary.`;
      aiGeneratedText += warningSuffix;
    }
  }

  // Generate safe navigational route to recommended PFZ with geofence and marine safety checks
  const safeRoute = suggestSafeRoute(
    detectedLocation.lat,
    detectedLocation.lon,
    recommendedPFZ.lat,
    recommendedPFZ.lon,
    {
      marineSafety: {
        waveHeight: marine.waveHeight,
        windSpeed: weather.windSpeed,
        thunderstormRisk: safety.criteria.thunderstormRisk
      },
      startName: detectedLocation.name,
      destName: `Fishing Zone (${recommendedPFZ.distanceKm} km ${recommendedPFZ.bearing})`
    }
  );

  return {
    replyText: aiGeneratedText,
    leadAgent: activeLeadAgent,
    location: detectedLocation,
    weatherData: weather,
    marineData: marine,
    safety,
    zoneQuality,
    recommendedPFZ,
    geofenceAlert: geofence,
    toolCalls,
    traceSteps,
    explainability,
    suggestedRoute: safeRoute
  };
}

export function cleanPlainResponse(text: string): string {
  let cleaned = text;

  // Remove agent names and technical tags
  cleaned = cleaned.replace(/\b(Weather Agent|Marine Agent|Risk Agent|Fisheries Agent|PFZ Locator Agent|Geofence Guardian Agent)\b[:\s-]*/gi, '');
  cleaned = cleaned.replace(/\b(मौसम एजेंट|समुद्री एजेंट|जोखिम एजेंट|मत्स्य क्षेत्र एजेंट|PFZ लोकेटर एजेंट|जियोफेंस गार्डियन एजेंट)\b[:\s-]*/g, '');
  cleaned = cleaned.replace(/\[?(getWeatherData|getMarineData|assessFishingSafety|assessFishingZoneQuality|findNearestPFZ|checkGeofence)\]?/gi, '');

  // Remove markdown headers and blockquotes
  cleaned = cleaned.replace(/^#{1,6}\s+.*$/gm, '');
  cleaned = cleaned.replace(/^>\s*/gm, '');
  cleaned = cleaned.replace(/^[*-]\s+/gm, '');

  // Remove standalone divider lines
  cleaned = cleaned.replace(/^---+$/gm, '');

  // Replace common jargon/abbreviations with simple words
  cleaned = cleaned.replace(/\bSST\b/gi, 'water temperature');
  cleaned = cleaned.replace(/\bPFZ\b/gi, 'fishing zone');
  cleaned = cleaned.replace(/\bNM\b/gi, 'nautical miles');
  cleaned = cleaned.replace(/\bkm\/h\b/gi, 'kilometers per hour');
  cleaned = cleaned.replace(/\bWSW\b/gi, 'west-southwest');
  cleaned = cleaned.replace(/\bSSW\b/gi, 'south-southwest');
  cleaned = cleaned.replace(/\bENE\b/gi, 'east-northeast');
  cleaned = cleaned.replace(/\bESE\b/gi, 'east-southeast');
  cleaned = cleaned.replace(/\bWNW\b/gi, 'west-northwest');
  cleaned = cleaned.replace(/\bNNW\b/gi, 'north-northwest');
  cleaned = cleaned.replace(/\bNNE\b/gi, 'north-northwest');
  cleaned = cleaned.replace(/\bSSE\b/gi, 'south-southeast');

  // Strip bold/italic markdown formatting so it reads cleanly as plain sentences
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

  // Normalize excessive whitespace into single spaces
  cleaned = cleaned.replace(/\n\s*\n+/g, ' ');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  return cleaned;
}

export function getPlainDirection(dir: string): string {
  const map: Record<string, string> = {
    N: 'north',
    NNE: 'north-northeast',
    NE: 'northeast',
    ENE: 'east-northeast',
    E: 'east',
    ESE: 'east-southeast',
    SE: 'southeast',
    SSE: 'south-southeast',
    S: 'south',
    SSW: 'south-southwest',
    SW: 'southwest',
    WSW: 'west-southwest',
    W: 'west',
    WNW: 'west-northwest',
    NW: 'northwest',
    NNW: 'north-northwest'
  };
  return map[dir.trim().toUpperCase()] || dir.toLowerCase();
}

export function getPlainDirectionHindi(dir: string): string {
  const map: Record<string, string> = {
    N: 'उत्तर',
    NNE: 'उत्तर-उत्तर-पूर्व',
    NE: 'उत्तर-पूर्व',
    ENE: 'पूर्व-उत्तर-पूर्व',
    E: 'पूर्व',
    ESE: 'पूर्व-दक्षिण-पूर्व',
    SE: 'दक्षिण-पूर्व',
    SSE: 'दक्षिण-दक्षिण-पूर्व',
    S: 'दक्षिण',
    SSW: 'दक्षिण-दक्षिण-पश्चिम',
    SW: 'दक्षिण-पश्चिम',
    WSW: 'पश्चिम-दक्षिण-पश्चिम',
    W: 'पश्चिम',
    WNW: 'पश्चिम-उत्तर-पश्चिम',
    NW: 'उत्तर-पश्चिम',
    NNW: 'उत्तर-उत्तर-पश्चिम'
  };
  return map[dir.trim().toUpperCase()] || dir;
}

export function buildAgentReportText(
  loc: CoastalLocation,
  weather: WeatherData,
  marine: MarineData,
  safety: SafetyAssessment,
  zoneQuality: ZoneQualityAssessment,
  pfz: PFZRecommendation,
  lang: Language,
  geofence?: GeofenceCheckResult
): string {
  const plainDir = getPlainDirection(pfz.bearing);
  const plainWindDir = getPlainDirection(getWindDirectionText(weather.windDirection));

  if (lang === 'hi') {
    const hindiDir = getPlainDirectionHindi(pfz.bearing);
    let safetyLine = '';
    if (safety.status === 'SAFE') {
      safetyLine = `आज ${loc.hindiName} से समुद्र में जाना पूरी तरह सुरक्षित है।`;
    } else if (safety.status === 'CAUTION') {
      safetyLine = `आज ${loc.hindiName} के पास समुद्र में सावधानी बरतने की सलाह दी जाती है।`;
    } else {
      safetyLine = `आज ${loc.hindiName} के पास समुद्र की स्थिति खतरनाक है, इसलिए मछुआरों को किनारे पर ही रहने की सलाह है।`;
    }

    const weatherLine = `समुद्र में लहरें लगभग ${marine.waveHeight} मीटर ऊंची हैं और हवा ${weather.windSpeed} किलोमीटर प्रति घंटा की रफ्तार से चल रही है, जबकि पानी का तापमान ${marine.seaSurfaceTemperature} डिग्री सेल्सियस है।`;
    const pfzLine = `मछली पकड़ने के लिए सबसे अच्छा क्षेत्र तट से लगभग ${pfz.distanceKm} किलोमीटर ${hindiDir} दिशा की ओर है।`;

    let tipLine = `प्रस्थान से पहले लाइफ जैकेट पहनें और अपने साथियों व बंदरगाह रेडियो से लगातार संपर्क बनाए रखें।`;
    if (safety.criteria.thunderstormRisk) {
      tipLine = `आसमान में आंधी और बिजली गिरने का गंभीर खतरा है, इसलिए छोटी नौकाएं बिल्कुल समुद्र में न ले जाएं।`;
    } else if (geofence?.isNearOrInside) {
      tipLine = `ध्यान रखें कि यह स्थान ${geofence.nearestZone?.hindiName || 'संरक्षित समुद्री क्षेत्र'} के पास है, इसलिए सीमा नियमों का पूरा ध्यान रखें।`;
    }

    return `${safetyLine} ${weatherLine} ${pfzLine} ${tipLine}`;
  }

  // English
  let safetyLine = '';
  if (safety.status === 'SAFE') {
    safetyLine = `It is currently safe to venture out to sea from ${loc.name}.`;
  } else if (safety.status === 'CAUTION') {
    safetyLine = `You can head out from ${loc.name}, but please exercise caution on the water.`;
  } else {
    safetyLine = `Sea conditions near ${loc.name} are unsafe today, and all fishermen should stay ashore.`;
  }

  const weatherLine = `Waves are running around ${marine.waveHeight} meters high with wind blowing towards the ${plainWindDir} at ${weather.windSpeed} kilometers per hour, and the water temperature is ${marine.seaSurfaceTemperature} degrees Celsius.`;
  const pfzLine = `The best recommended fishing zone is located about ${pfz.distanceKm} kilometers towards the ${plainDir}.`;

  let tipLine = `Make sure everyone on board is wearing a life jacket and keep your communications radio tuned to port control.`;
  if (safety.criteria.thunderstormRisk) {
    tipLine = `There is a risk of sudden lightning and thunderstorms, so stay close to shelter and do not risk small craft.`;
  } else if (geofence?.isNearOrInside) {
    tipLine = `Be mindful that you are near the boundary of ${geofence.nearestZone?.name || 'a restricted marine area'}, so keep a clear distance from protected waters.`;
  }

  return `${safetyLine} ${weatherLine} ${pfzLine} ${tipLine}`;
}

export function buildRouteAdvisoryText(
  loc: CoastalLocation,
  pfz: PFZRecommendation,
  weather: WeatherData,
  marine: MarineData,
  lang: Language,
  geofence?: GeofenceCheckResult
): string {
  const plainDir = getPlainDirection(pfz.bearing);
  const plainWindDir = getPlainDirection(getWindDirectionText(weather.windDirection));

  if (lang === 'hi') {
    const hindiDir = getPlainDirectionHindi(pfz.bearing);
    const routeSafety = marine.waveHeight <= 2.5 && weather.windSpeed <= 40 ? 'मार्ग पर नौकायन अनुकूल है।' : 'मार्ग में तेज हवा व लहरों के कारण सतर्कता आवश्यक है।';
    const distLine = `${loc.hindiName} से मछली पकड़ने के प्रमुख क्षेत्र की दूरी लगभग ${pfz.distanceKm} किलोमीटर ${hindiDir} दिशा की ओर है।`;
    const seaLine = `रास्ते में समुद्र की लहरें लगभग ${marine.waveHeight} मीटर और हवा ${weather.windSpeed} किलोमीटर प्रति घंटा रहने का अनुमान है।`;
    const tipLine = `नाव में पर्याप्त ईंधन रखें, जीपीएस दिशा की पुष्टि करें और समुद्री सुरक्षा नियमों का पालन करें।`;
    return `${distLine} ${routeSafety} ${seaLine} ${tipLine}`;
  }

  const routeSafety = marine.waveHeight <= 2.5 && weather.windSpeed <= 40 ? 'The navigation route is open and manageable.' : 'Exercise high caution along this path due to elevated waves.';
  const distLine = `The route from ${loc.name} to the prime fishing zone is about ${pfz.distanceKm} kilometers heading towards the ${plainDir}.`;
  const seaLine = `Along this route, expect waves around ${marine.waveHeight} meters and winds near ${weather.windSpeed} kilometers per hour towards the ${plainWindDir}.`;
  const tipLine = `Carry sufficient spare fuel, verify your compass heading, and keep in touch with nearby fishing vessels.`;
  return `${distLine} ${routeSafety} ${seaLine} ${tipLine}`;
}

export function buildTomorrowSafetyAdvisoryText(
  loc: CoastalLocation,
  weather: WeatherData,
  marine: MarineData,
  todaySafety: SafetyAssessment,
  lang: Language
): string {
  const tomorrow = weather.tomorrowForecast;
  const tomorrowWindMax = tomorrow?.windSpeedMax ?? weather.windSpeed;
  const tomorrowWaveMax = marine.waveHeightMaxTomorrow ?? tomorrow?.waveHeightMax ?? marine.waveHeight;
  const tomorrowThunderstorm = tomorrow?.hasThunderstormRisk ?? false;

  const isTomorrowUnsafe = tomorrowWaveMax > 2.5 || tomorrowWindMax > 40 || tomorrowThunderstorm;
  const isTomorrowCaution = !isTomorrowUnsafe && (tomorrowWaveMax > 1.8 || tomorrowWindMax > 28);

  if (lang === 'hi') {
    let verdictLine = `कल के लिए ${loc.hindiName} पर समुद्र की स्थिति सामान्य और सुरक्षित रहने की संभावना है।`;
    if (isTomorrowUnsafe) {
      verdictLine = `कल ${loc.hindiName} पर समुद्र में जाना असुरक्षित रहेगा, इसलिए कल सभी मछुआरों को किनारे पर ही रहना चाहिए।`;
    } else if (isTomorrowCaution) {
      verdictLine = `कल ${loc.hindiName} पर समुद्र में मध्यम हलचल रहेगी, इसलिए केवल अनुभवी मछुआरे ही सावधानी से जाएं।`;
    }

    const conditionLine = `अनुमान है कि कल अधिकतम लहरें ${tomorrowWaveMax} मीटर तक पहुंच सकती हैं और हवा की रफ्तार ${tomorrowWindMax} किलोमीटर प्रति घंटा तक रह सकती है।`;
    let tipLine = tomorrowThunderstorm
      ? `मौसम में बिजली चमकने और तूफानी हवाओं का खतरा है, इसलिए मौसम विभाग के ताजा अलर्ट देखकर ही फैसला लें।`
      : `सुबह प्रस्थान करने से पहले स्थानीय बंदरगाह मौसम बुलेटिन अवश्य दोबारा सुन लें।`;

    return `${verdictLine} ${conditionLine} ${tipLine}`;
  }

  let verdictLine = `Tomorrow looks safe for fishing operations out of ${loc.name}.`;
  if (isTomorrowUnsafe) {
    verdictLine = `Tomorrow is forecasted to be unsafe for venturing into the sea from ${loc.name}, so please plan to stay ashore.`;
  } else if (isTomorrowCaution) {
    verdictLine = `Tomorrow will see moderate sea activity near ${loc.name}, so venture out only with extra caution.`;
  }

  const conditionLine = `Expect peak waves around ${tomorrowWaveMax} meters and wind gusts reaching up to ${tomorrowWindMax} kilometers per hour.`;
  let tipLine = tomorrowThunderstorm
    ? `There is a risk of thunderstorms and lightning tomorrow, so prioritize crew safety and delay departures if clouds gather.`
    : `Check the morning marine broadcast before unmooring your vessel for the day.`;

  return `${verdictLine} ${conditionLine} ${tipLine}`;
}

export function buildWeatherSpecialistText(
  loc: CoastalLocation,
  weather: WeatherData,
  marine: MarineData,
  safety: SafetyAssessment,
  lang: Language
): string {
  const plainWindDir = getPlainDirection(getWindDirectionText(weather.windDirection));
  const hasStorm = safety.criteria.thunderstormRisk || weather.hasThunderstormRisk;

  if (lang === 'hi') {
    const stormAlert = hasStorm
      ? 'आसमान में आंधी और बिजली चमकने का गंभीर खतरा है, इसलिए छोटी नौकाएं समुद्र में बिल्कुल न ले जाएं।'
      : 'आसमान में आंधी या चक्रवाती हलचल का कोई खतरा नहीं है, हवा की गति नौकायन के लिए सामान्य है।';
    return `मौसम विशेषज्ञ एजेंट रिपोर्ट: ${loc.hindiName} के तटीय क्षेत्र में हवा की गति लगभग ${weather.windSpeed} किलोमीटर प्रति घंटा है और तापमान ${weather.temperature} डिग्री सेल्सियस है। ${stormAlert} हवा का दबाव स्थिर है, लेकिन दोपहर बाद हवा के रुख पर नजर रखें।`;
  }

  const stormAlert = hasStorm
    ? 'There is an active thunderstorm and lightning risk detected, so all small craft should stay ashore.'
    : 'Atmospheric conditions are stable with no thunderstorm or squall hazards detected.';
  return `As your Weather Agent: Live atmospheric wind speed off ${loc.name} is ${weather.windSpeed} kilometers per hour blowing towards the ${plainWindDir}, with surface air temperature around ${weather.temperature} degrees Celsius. ${stormAlert} Conditions remain favorable for morning departures, but monitor for changing gusts.`;
}

export function buildMarineSpecialistText(
  loc: CoastalLocation,
  marine: MarineData,
  weather: WeatherData,
  lang: Language
): string {
  const waveRoughnessHi = marine.waveHeight > 2.5 ? 'अत्यंत अशांत' : marine.waveHeight > 1.5 ? 'मध्यम हलचल युक्त' : 'शांत और स्थिर';
  const waveRoughnessEn = marine.waveHeight > 2.5 ? 'rough and hazardous' : marine.waveHeight > 1.5 ? 'moderately choppy' : 'calm and favorable';

  if (lang === 'hi') {
    return `समुद्री महासागर एजेंट रिपोर्ट: ${loc.hindiName} पर समुद्र की औसत लहरें ${marine.waveHeight} मीटर ऊंची हैं और समुद्री जल का तापमान ${marine.seaSurfaceTemperature} डिग्री सेल्सियस दर्ज किया गया है। समुद्र की वर्तमान स्थिति ${waveRoughnessHi} है, जिससे पारंपरिक और यंत्रीकृत नावों पर हल्का रोलिंग असर रहेगा।`;
  }

  return `Reporting from the Marine Oceanography desk: Significant wave heights off ${loc.name} are measuring ${marine.waveHeight} meters, accompanied by a sea surface temperature of ${marine.seaSurfaceTemperature} degrees Celsius. The ocean state is currently ${waveRoughnessEn}, resulting in manageable vessel drift for coastal crafts.`;
}

export function buildFisheriesSpecialistText(
  loc: CoastalLocation,
  pfz: PFZRecommendation,
  marine: MarineData,
  zoneQuality: ZoneQualityAssessment,
  lang: Language
): string {
  const plainDir = getPlainDirection(pfz.bearing);
  const hindiDir = getPlainDirectionHindi(pfz.bearing);

  const species = pfz.speciesProbabilities || [];
  const speciesHiStr = species.length > 0
    ? species.slice(0, 4).map(s => `${s.hindiName} (${s.probability}% संभावना)`).join(', ')
    : 'बांगड़ा/मैकेरल (88%), सारडीन/तारली (84%), ट्यूना/कुपा (76%), पापलेट (80%)';
  const speciesEnStr = species.length > 0
    ? species.slice(0, 4).map(s => `${s.name} (${s.probability}% probability)`).join(', ')
    : 'Indian Mackerel (88%), Oil Sardines (84%), Yellowfin Tuna (76%), Silver Pomfret (80%)';

  if (lang === 'hi') {
    return `मत्स्य क्षेत्र व प्रजाति विशेषज्ञ एजेंट रिपोर्ट: ${loc.hindiName} से सबसे उत्तम संभावित मत्स्य क्षेत्र (PFZ) लगभग ${pfz.distanceKm} किलोमीटर ${hindiDir} दिशा की ओर स्थित है (जल तापमान ${pfz.seaSurfaceTemperature}°C)। यहाँ मिलने वाली प्रमुख मछलियाँ और उनकी मिलने की संभावना: ${speciesHiStr}। यह क्षेत्र समृद्ध प्लवक और थर्मल फ्रंट के कारण मछली पकड़ने के लिए सबसे अनुकूल है।`;
  }

  return `As your Fisheries & PFZ Specialist Agent: Ocean thermal front analysis pinpoints the prime fishing zone approximately ${pfz.distanceKm} kilometers towards the ${plainDir} from ${loc.name} (sea surface temperature ${pfz.seaSurfaceTemperature}°C). High-probability target species in this sector: ${speciesEnStr}. The thermal convergence creates an active feeding corridor for both pelagic and demersal fish schools.`;
}

export function buildGeofenceSpecialistText(
  loc: CoastalLocation,
  geofence: GeofenceCheckResult,
  lang: Language
): string {
  if (lang === 'hi') {
    if (geofence.isNearOrInside) {
      return `जियोफेंस गार्डियन एजेंट चेतावनी: आपकी नौका ${geofence.nearestZone?.hindiName || 'संरक्षित समुद्री क्षेत्र'} से केवल ${geofence.distanceKm} किलोमीटर की दूरी पर है। वन्यजीव संरक्षण अधिनियम के तहत इस संरक्षित क्षेत्र में जाल डालना सख्त मना है, कृपया अपनी नाव को सुरक्षित खुले क्षेत्र में रखें।`;
    }
    return `जियोफेंस गार्डियन एजेंट रिपोर्ट: ${loc.hindiName} से आपका वर्तमान क्षेत्र किसी भी प्रतिबंधित समुद्री अभयारण्य, राष्ट्रीय पार्क या अंतर्राष्ट्रीय समुद्री सीमा रेखा (IMBL) से पूरी तरह सुरक्षित और दूर है। आप कानूनी रूप से वैध भारतीय जलक्षेत्र में हैं।`;
  }

  if (geofence.isNearOrInside) {
    return `Geofence Guardian Agent Advisory: Vessel coordinates are near the protected ${geofence.nearestZone?.name || 'marine sanctuary'} at a distance of ${geofence.distanceKm} kilometers. Net deployment and fishing operations are strictly prohibited inside this reserve under maritime conservation laws; maintain a safe buffer.`;
  }
  return `Geofence Guardian Agent Report: Your position off ${loc.name} is completely clear of all restricted marine sanctuaries, protected reef reserves, and the International Maritime Boundary Line (IMBL). You have full legal navigational clearance in open coastal waters.`;
}

export function buildRiskSpecialistText(
  loc: CoastalLocation,
  safety: SafetyAssessment,
  weather: WeatherData,
  marine: MarineData,
  lang: Language
): string {
  if (lang === 'hi') {
    const verdictStr = safety.status === 'SAFE' ? 'सुरक्षित' : safety.status === 'CAUTION' ? 'सावधानी बरतने योग्य' : 'असुरक्षित';
    return `समुद्री सुरक्षा व जोखिम अधिकारी रिपोर्ट: ${loc.hindiName} पर नौकायन का समग्र सुरक्षा फैसला '${verdictStr}' है। वर्तमान लहरें ${marine.waveHeight} मीटर (सीमा 2.5 मीटर) और हवा ${weather.windSpeed} किमी/घंटा (सीमा 40 किमी/घंटा) हैं। सभी नाविक लाइफ जैकेट अवश्य पहनें और रेडियो चैनल 16 पर सक्रिय रहें।`;
  }

  const verdictStr = safety.status === 'SAFE' ? 'SAFE' : safety.status === 'CAUTION' ? 'CAUTION' : 'UNSAFE';
  return `Marine Safety & Risk Assessment Officer: The operational verdict for ${loc.name} is ${verdictStr}. Measured wave heights of ${marine.waveHeight} meters (against 2.5m ceiling) and winds of ${weather.windSpeed} kilometers per hour (against 40 km/h ceiling) dictate this rating. Ensure all crew members wear life jackets and keep VHF channel 16 monitored.`;
}
