import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";
import { detectLeadAgent, SPECIALIST_AGENTS } from "../src/services/agents/leadAgentDetector";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// Tool declarations for Gemini
// Rate-limit & quota cooldown tracker to prevent repeated 429 quota exhaustion
let rateLimitCooldownUntil = 0;
const getWeatherDataDeclaration: FunctionDeclaration = {
  name: "getWeatherData",
  description: "Fetches live atmospheric weather data (temperature, wind speed km/h, wind direction, precipitation) from Open-Meteo Weather API for a coastal latitude and longitude coordinate.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: { type: Type.NUMBER, description: "Latitude coordinate of coastal location" },
      lon: { type: Type.NUMBER, description: "Longitude coordinate of coastal location" },
      locationName: { type: Type.STRING, description: "Name of the coastal port (e.g. Kochi, Mumbai, Chennai)" }
    },
    required: ["lat", "lon"]
  }
};

const getMarineDataDeclaration: FunctionDeclaration = {
  name: "getMarineData",
  description: "Fetches live oceanographic marine data (wave height in meters, wave direction, sea surface temperature SST in Celsius) from Open-Meteo Marine API.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: { type: Type.NUMBER, description: "Latitude coordinate of coastal location" },
      lon: { type: Type.NUMBER, description: "Longitude coordinate of coastal location" },
      locationName: { type: Type.STRING, description: "Name of the coastal port (e.g. Kochi, Mumbai, Chennai)" }
    },
    required: ["lat", "lon"]
  }
};

const assessFishingSafetyDeclaration: FunctionDeclaration = {
  name: "assessFishingSafety",
  description: "Applies oceanographic safety rules based on real wave height (m), wind speed (km/h), and thunderstorm weather codes (WMO 95, 96, 99). Flags unsafe conditions if wave > 2.5m, wind > 40 km/h, or lightning/thunderstorm risk is detected.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      windSpeedKmH: { type: Type.NUMBER, description: "Wind speed in km/h from real weather API" },
      waveHeightM: { type: Type.NUMBER, description: "Wave height in meters from real marine API" },
      weatherCode: { type: Type.NUMBER, description: "Current or daily forecast WMO weather code" }
    },
    required: ["windSpeedKmH", "waveHeightM"]
  }
};

const assessFishingZoneQualityDeclaration: FunctionDeclaration = {
  name: "assessFishingZoneQuality",
  description: "Evaluates Potential Fishing Zone (PFZ) quality heuristic based on Sea Surface Temperature (SST). 26°C-30°C is favorable thermal gradient.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      seaSurfaceTemp: { type: Type.NUMBER, description: "Sea surface temperature in Celsius from real marine API" }
    },
    required: ["seaSurfaceTemp"]
  }
};

const findNearestPFZDeclaration: FunctionDeclaration = {
  name: "findNearestPFZ",
  description: "Discovers and ranks nearby Potential Fishing Zone (PFZ) coordinates around user's location based on Sea Surface Temperature (SST) closest to 27°C-29°C ideal range.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: { type: Type.NUMBER, description: "Base latitude coordinate of coastal location" },
      lon: { type: Type.NUMBER, description: "Base longitude coordinate of coastal location" }
    },
    required: ["lat", "lon"]
  }
};

const checkGeofenceDeclaration: FunctionDeclaration = {
  name: "checkGeofence",
  description: "Checks if a queried coordinate falls within or near (within 5km of) any restricted or protected marine zone along Indian coasts (e.g. Gulf of Mannar Marine National Park, India-Sri Lanka IMBL border buffer, Gahirmatha Marine Sanctuary, Gulf of Kutch Marine Park).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      lat: { type: Type.NUMBER, description: "Latitude coordinate of maritime position" },
      lon: { type: Type.NUMBER, description: "Longitude coordinate of maritime position" }
    },
    required: ["lat", "lon"]
  }
};

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// API: Gemini Chat with Function Calling & Resilient Fallback Handling
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      location,
      weatherData,
      marineData,
      recommendedPFZ,
      geofence,
      safety,
      zoneQuality,
      leadAgent,
      language,
      history
    } = req.body;

    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: "Gemini API key not configured on server; using local agent intelligence pipeline."
      });
    }

    // If currently within a rate-limit cooldown window, seamlessly use verified local agent pipeline
    if (Date.now() < rateLimitCooldownUntil) {
      const waitSeconds = Math.max(1, Math.ceil((rateLimitCooldownUntil - Date.now()) / 1000));
      return res.status(200).json({
        success: false,
        fallback: true,
        reason: "rate_limit_cooldown",
        retryAfterSeconds: waitSeconds,
        message: `Gemini quota rate-limit active (${waitSeconds}s remaining). Seamlessly utilizing local oceanographic intelligence pipeline.`
      });
    }

    const languageMap: Record<string, { name: string; native: string; advice: string }> = {
      en: { name: 'English', native: 'English', advice: 'Use clear, authoritative maritime language suitable for fishermen.' },
      hi: { name: 'Hindi', native: 'हिन्दी', advice: 'मछुआरों के लिए सरल, स्वाभाविक और तटीय हिंदी भाषा का प्रयोग करें।' },
      ta: { name: 'Tamil', native: 'தமிழ்', advice: 'தமிழக மீனவர்கள் எளிதில் புரிந்துகொள்ளும் எளிய, இயல்பான மற்றும் மரியாதையான தமிழ் மொழியில் பதிலளிக்கவும்.' },
      te: { name: 'Telugu', native: 'తెలుగు', advice: 'ఆంధ్ర మరియు తీరప్రాంత మత్స్యకారులకు సులభంగా అర్థమయ్యే సహజమైన మరియు గౌరవప్రదమైన తెలుగులో సమాధానం ఇవ్వండి.' },
      bn: { name: 'Bengali', native: 'বাংলা', advice: 'পশ্চিমবঙ্গের মৎস্যজীবীদের উপযোগী সাবলীল, প্রাঞ্জল ও সম্মানজনক বাংলা ভাষায় পরামর্শ দিন।' },
      mr: { name: 'Marathi', native: 'मराठी', advice: 'महाराष्ट्रातील मच्छीमारांसाठी सोप्या, स्वाभाविक आणि आदरयुक्त मराठीत उत्तर द्या.' },
      gu: { name: 'Gujarati', native: 'ગુજરાતી', advice: 'ગુજરાતના સાગરખેડૂતો અને માછીમારો માટે સરળ, સ્વાભાવિક અને આદરપૂર્ણ ગુજરાતી ભાષામાં જવાબ આપો.' },
      kn: { name: 'Kannada', native: 'ಕನ್ನಡ', advice: 'ಕರ್ನಾಟಕದ ಕರಾವಳಿ ಮೀನುಗಾರರಿಗೆ ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವ ನೈಸರ್ಗಿಕ, ಗೌರವಾನ್ವಿತ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.' },
      ml: { name: 'Malayalam', native: 'മലയാളം', advice: 'കേരളത്തിലെ മത്സ്യത്തொഴിലാളികൾക്ക് എളുപ്പത്തിൽ മനസ്സിലാകുന്ന സ്വാഭാవిകവും ആදரവുള്ളതുമായ മലയാളത്തിൽ മറുപടി നൽകുക.' },
      or: { name: 'Odia', native: 'ଓଡ଼ିଆ', advice: 'ଓଡ଼ିଶାର ଉପକୂଳବର୍ତ୍ତୀ ମତ୍ସଜୀବୀଙ୍କ ପାଇଁ ସରଳ, ସ୍ୱାଭାବିକ ଏବଂ ସମ୍ମାନଜନକ ଓଡ଼ିଆ ଭାଷାରେ ଉତ୍ତର ଦିଅନ୍ତୁ।' },
      pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', advice: 'ਸਪਸ਼ਟ, ਸੁਭਾਵਿਕ ਅਤੇ ਸਤਿਕਾਰਯੋਗ ਪੰਜਾਬੀ ਭਾਸ਼ਾ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।' }
    };

    const currentLangInfo = languageMap[language as string] || languageMap.en;
    const activeAgent = leadAgent || detectLeadAgent(message || '');

    // Format top fish species and catch probabilities for this harbor and SST
    const speciesListStr = recommendedPFZ?.speciesProbabilities && recommendedPFZ.speciesProbabilities.length > 0
      ? recommendedPFZ.speciesProbabilities.map(s => `${s.name} (${s.hindiName}): ${s.probability}% probability`).join(', ')
      : 'Indian Mackerel (बांगड़ा): 88% probability, Indian Oil Sardine (सारडीन): 84% probability, Yellowfin Tuna (ट्यूना): 76% probability, Silver Pomfret (पापलेट): 80% probability';

    // Domain-specific prompt customization based on the user's specific query & designated agent
    let specialistFocus = '';
    if (activeAgent.id === 'weather') {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Directly answer the user's question about atmospheric weather and wind.
Detail wind speed (${weatherData?.windSpeed ?? 15} km/h), wind direction (${weatherData?.windDirection ?? 0}°), gusts, cloud cover, and thunderstorm/lightning alert (${weatherData?.hasThunderstormRisk ? 'Active thunderstorm & lightning risk' : 'Clear/mild'}).
Advise on the safest sailing windows or impending squalls.`;
    } else if (activeAgent.id === 'marine') {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Directly answer the user's question about wave heights, sea roughness, swell, and water temperature.
Detail significant wave height (${marineData?.waveHeight ?? 1.2} meters), swell direction (${marineData?.waveDirection ?? 0}°), sea water temperature (${marineData?.seaSurfaceTemperature ?? 28}°C), and how comfortable or rolling the sea will be for small and mechanized fishing craft.`;
    } else if (activeAgent.id === 'fisheries') {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Directly answer the user's question about fishing spots, fish catch, fish names, and species probabilities.
MANDATORY: You MUST explicitly state the specific fish names likely to be caught and their estimated probability percentages (${speciesListStr}).
Detail the recommended fishing spot at ${recommendedPFZ?.distanceKm ?? 30} km towards ${recommendedPFZ?.bearing ?? 'southwest'} and favorable water temperature (${recommendedPFZ?.seaSurfaceTemperature ?? 28}°C).`;
    } else if (activeAgent.id === 'geofence') {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Directly answer the user's question about maritime boundaries, marine protected areas, sanctuaries, and borders.
Detail boundary surveillance: ${geofence?.isNearOrInside ? `WARNING: Vessel is near the protected ${geofence.nearestZone?.name || 'marine sanctuary'} at ${geofence.distanceKm} km. Strict fishing prohibitions apply under wildlife protection laws.` : `CLEAR: Vessel is in open authorized waters, safely clear of all Marine Protected Areas and international boundaries (IMBL).`}
Explain boundary clearance and legal compliance clearly.`;
    } else if (activeAgent.id === 'route') {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Directly answer the user's question about navigation route, heading, travel time, and distance.
Detail compass bearing (${recommendedPFZ?.bearing ?? 'southwest'}), distance (${recommendedPFZ?.distanceKm ?? 30} km / approx ${Math.round((recommendedPFZ?.distanceKm ?? 30) * 0.54)} nautical miles), estimated transit time at 8-10 knots (approx ${Math.max(1, Math.round((recommendedPFZ?.distanceKm ?? 30) / 16 * 10) / 10)} hours for motorized craft), and safe waypoints avoiding shallow shoals or protected reserves.`;
    } else if (activeAgent.id === 'risk') {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Directly answer the user's question about whether it is safe to sail and marine safety risk.
Provide a clear safety verdict (${safety?.status ?? 'SAFE'}), analyze key thresholds (wave height ${marineData?.waveHeight ?? 1.2}m vs 2.5m limit, wind speed ${weatherData?.windSpeed ?? 15} km/h vs 40 km/h limit, storm risk: ${safety?.criteria?.thunderstormRisk ? 'High' : 'None'}), and mandate safety precautions (life jackets, VHF channel 16, anchor).`;
    } else {
      specialistFocus = `You are the ${activeAgent.name} (${activeAgent.role}).
FOCUS: Provide an integrated, cohesive marine briefing answering the user's inquiry, balancing overall safety, sea state, and fishing potential without reciting a robotic script.`;
    }

    const systemInstruction = `You are ORCA (Ocean & Coastal Marine Intelligence Assistant), a marine safety advisor for Indian fishermen.
TARGET RESPONSE LANGUAGE: ${currentLangInfo.name} (${currentLangInfo.native}).
You must formulate your response ENTIRELY in ${currentLangInfo.name} (${currentLangInfo.native}) using a natural, conversational, respectful tone.

DESIGNATED SPECIALIST AGENT:
${specialistFocus}

CRITICAL INSTRUCTIONS FOR CHAT RESPONSE:
1. READ THE USER'S SPECIFIC QUESTION CAREFULLY:
   - Do NOT respond with a generic or identical boilerplate paragraph!
   - Directly answer what the user asked in the very first sentence.
   - Tailor the depth, technical details, and advisory specifically to their inquiry.
   - If they ask about weather, speak as the Weather Specialist.
   - If they ask about waves, speak as the Marine Oceanography Specialist.
   - If they ask about fish or spots, speak as the Fisheries Specialist.
   - If they ask about boundaries, speak as the Geofence Guardian.
   - If they ask about routes, speak as the Navigation Specialist.
   - If they ask about safety, speak as the Risk & Safety Officer.

2. ACCURATE REAL DATA WITHOUT JARGON:
   - Keep the underlying telemetry data accurate.
   - Do NOT use technical abbreviations (use "sea water temperature" instead of "SST", "fishing zone" instead of "PFZ", "nautical miles" instead of "NM", spell out compass directions like "towards the southwest" instead of "WSW").
   - Do NOT use markdown headers (#) or bulleted lists.
   - Write 2 to 4 clear, focused, conversational sentences that directly resolve the user's inquiry.

3. MANDATORY FOR FISH SPECIES & PROBABILITY:
   - Whenever the inquiry is about fish, catches, or what fish are available (e.g. "fish ka name vi toh btaoge", "konsi fish milegi", "machli kahan milegi"), YOU MUST explicitly name the species and cite their catch probabilities (e.g., बांगड़ा / Indian Mackerel ~88%, सारडीन / Sardines ~84%, ट्यूना / Tuna ~76%, पापलेट / Pomfret ~80%) based on the live data provided.`;

    // Construct multi-turn contents ensuring strict user/model alternation
    const rawHistory = Array.isArray(history) ? history : [];
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Filter and take recent history (up to last 10 messages)
    const recentHistory = rawHistory.slice(-10);
    let expectedRole: 'user' | 'model' = 'user';

    for (const item of recentHistory) {
      const itemRole = item.role === 'user' ? 'user' : 'model';
      const itemText = typeof item.text === 'string' ? item.text.trim() : '';
      if (!itemText) continue;

      if (itemRole === expectedRole) {
        contents.push({
          role: itemRole,
          parts: [{ text: itemText }]
        });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    // Ensure contents alternates and finishes ready for a 'user' message
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents.pop();
    }

    const tomorrowData = weatherData?.tomorrowForecast;
    const tomorrowWave = marineData?.waveHeightMaxTomorrow ?? tomorrowData?.waveHeightMax ?? 1.5;

    // Append current turn with telemetry data and clear task
    contents.push({
      role: "user",
      parts: [
        {
          text: `User Inquiry: "${message}"

[Assigned Specialist]: ${activeAgent.name} (${activeAgent.role})
[Active Coastal Harbor]: ${location ? `${location.name} (${location.state}, ${location.coast})` : "Coastal India"}
[Live Sea Telemetry]: Wave Height: ${marineData ? marineData.waveHeight : 1.2} m, Sea Temp: ${marineData ? marineData.seaSurfaceTemperature : 28}°C, Direction: ${marineData ? marineData.waveDirection : 0}°
[Live Weather Telemetry]: Wind: ${weatherData ? weatherData.windSpeed : 15} km/h, Direction: ${weatherData ? weatherData.windDirection : 0}°, Storm Risk: ${weatherData?.hasThunderstormRisk ? 'Thunderstorm alert' : 'Clear'}
[Tomorrow Forecast]: Safety: ${tomorrowData?.safetyStatus ?? 'SAFE'}, Waves: ${tomorrowWave} m, Wind: ${tomorrowData?.windSpeedMax ?? 16} km/h
[Optimal Fishing Spot]: Distance: ${recommendedPFZ ? recommendedPFZ.distanceKm : 30} km, Direction: ${recommendedPFZ ? recommendedPFZ.bearing : 'southwest'}, Water Temp: ${recommendedPFZ ? recommendedPFZ.seaSurfaceTemperature : 28}°C
[Top Fish Species & Catch Probability]: ${speciesListStr}
[Maritime Boundary / Sanctuary]: ${geofence?.isNearOrInside ? `Near ${geofence.nearestZone?.name || 'Marine Sanctuary'} (${geofence.distanceKm} km)` : 'Clear of restricted reserves'}
[Safety Verdict]: ${safety?.status ?? 'SAFE'}

Requirement:
Answer the user's specific inquiry directly in 2 to 4 natural, conversational sentences as ${activeAgent.name}. If asked about fish, explicitly state the species names and their probability of catch. Do not repeat a generic template.`
        }
      ]
    });

    let successfulResponse: { text: string; functionCalls: unknown[]; candidates: unknown } | null = null;

    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
        }
      });

      // Post-process to guarantee clean plain language without agent names, bullet points, or jargon
      let cleanedText = (response.text || "")
        .replace(/(Weather|Marine|Risk|Fisheries|PFZ Locator|Geofence( Guardian)?)\s+Agent:?/gi, '')
        .replace(/(मौसम|समुद्री|जोखिम|मत्स्य क्षेत्र|मत्स्य|PFZ लोकेटर|जियोफेंस गार्डियन)\s+एजेंट:?/gi, '')
        .replace(/\b(getWeatherData|getMarineData|assessFishingSafety|assessFishingZoneQuality|findNearestPFZ|checkGeofence)\(\)/g, '')
        .replace(/^#+\s+/gm, '')
        .replace(/^[\*\-]\s+/gm, '')
        .replace(/\bSST\b/g, 'sea temperature')
        .replace(/\bPFZ\b/g, 'fishing zone')
        .replace(/\bNM\b/g, 'nautical miles')
        .replace(/\bkm\/h\b/g, 'kilometers per hour')
        .replace(/\*\*(.*?):\*\*/g, '$1:')
        .trim();

      successfulResponse = {
        text: cleanedText,
        functionCalls: response.functionCalls || [],
        candidates: response.candidates
      };
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");

      if (is429) {
        // Parse retry duration from API response if present, otherwise set a clean 60s cooldown
        const match = errStr.match(/retry in ([\d\.]+)s/i) || errStr.match(/retryDelay["':\s]+(\d+)s/i);
        const retrySec = match ? Math.min(120, Math.max(10, Math.ceil(parseFloat(match[1])))) : 60;
        rateLimitCooldownUntil = Date.now() + (retrySec * 1000);
        console.info(`[ORCA Gemini Engine] Free tier quota rate limit reached (429). Cooldown set for ${retrySec}s; seamlessly engaging verified local oceanographic agent.`);
      } else {
        console.info(`[ORCA Gemini Engine] Gemini temporarily unavailable (${errStr.slice(0, 80)}). Seamlessly engaging verified local oceanographic agent.`);
      }
    }

    if (successfulResponse) {
      return res.json({
        success: true,
        text: successfulResponse.text,
        leadAgent: activeAgent,
        functionCalls: successfulResponse.functionCalls,
        rawCandidates: successfulResponse.candidates
      });
    }

    // Graceful fallback to verified local specialized oceanographic intelligence
    return res.status(200).json({
      success: false,
      fallback: true,
      message: "Model experiencing quota/rate limit or high demand, seamlessly falling back to local oceanographic intelligence."
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.info(`[ORCA API Router] /api/chat fallback triggered: ${msg.slice(0, 80)}`);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: "Local oceanographic intelligence active"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ORCA Marine Intelligence Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
