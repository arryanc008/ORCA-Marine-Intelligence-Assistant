import { LeadAgentInfo } from '../../types';

export const SPECIALIST_AGENTS: Record<string, LeadAgentInfo> = {
  weather: {
    id: 'weather',
    name: 'Weather Agent',
    hindiName: 'मौसम विशेषज्ञ एजेंट',
    role: 'Atmospheric & Wind Specialist',
    hindiRole: 'वायुमंडलीय व पवन विशेषज्ञ',
    icon: '🌦️',
    badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30'
  },
  marine: {
    id: 'marine',
    name: 'Marine Agent',
    hindiName: 'समुद्री महासागर एजेंट',
    role: 'Ocean Dynamics & Sea-State Specialist',
    hindiRole: 'महासागरीय तरंग व जल स्थिति विशेषज्ञ',
    icon: '🌊',
    badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
  },
  fisheries: {
    id: 'fisheries',
    name: 'Fisheries & PFZ Agent',
    hindiName: 'मत्स्य क्षेत्र व प्रजाति एजेंट',
    role: 'Potential Fishing Zones & Species Specialist',
    hindiRole: 'मत्स्य क्षेत्र एवं प्रजाति विशेषज्ञ',
    icon: '🐟',
    badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
  },
  geofence: {
    id: 'geofence',
    name: 'Geofence Guardian Agent',
    hindiName: 'जियोफेंस गार्डियन एजेंट',
    role: 'Maritime Boundary & Sanctuary Specialist',
    hindiRole: 'समुद्री सीमा व अभयारण्य विशेषज्ञ',
    icon: '⚓',
    badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/30'
  },
  route: {
    id: 'route',
    name: 'Route & Navigation Agent',
    hindiName: 'नेविगेशन व मार्ग एजेंट',
    role: 'Coastal Navigation & Heading Specialist',
    hindiRole: 'तटीय नेविगेशन व मार्ग विशेषज्ञ',
    icon: '🧭',
    badgeColor: 'text-blue-300 bg-blue-500/15 border-blue-500/30'
  },
  risk: {
    id: 'risk',
    name: 'Risk & Safety Agent',
    hindiName: 'सुरक्षा व जोखिम एजेंट',
    role: 'Marine Safety & Advisory Officer',
    hindiRole: 'समुद्री सुरक्षा एवं जोखिम अधिकारी',
    icon: '🛡️',
    badgeColor: 'text-rose-300 bg-rose-500/15 border-rose-500/30'
  },
  coordinator: {
    id: 'coordinator',
    name: 'ORCA Fleet Coordinator',
    hindiName: 'ओरका फ्लीट समन्वयक',
    role: 'Integrated Multi-Agent Briefing',
    hindiRole: 'एकीकृत बहु-एजेंट समन्वय',
    icon: '🛰️',
    badgeColor: 'text-teal-300 bg-teal-500/15 border-teal-500/30'
  }
};

export type AgentStepId = 'planner' | 'weather' | 'marine' | 'risk' | 'fisheries' | 'geofence' | 'route';

export interface PlannedAgentExecution {
  leadAgent: LeadAgentInfo;
  requiredAgentIds: AgentStepId[];
  rationale: string;
  hindiRationale: string;
}

/**
 * Carefully reads the user's question and accurately identifies which specialized
 * marine agent should take the lead role in generating the response.
 */
export function detectLeadAgent(query: string): LeadAgentInfo {
  return planAgentsForQuery(query).leadAgent;
}

/**
 * Plans the specific subset of agents needed for a given user inquiry.
 * Avoids executing or displaying all agents when the query only pertains to a specific domain.
 */
export function planAgentsForQuery(query: string): PlannedAgentExecution {
  const q = (query || '').toLowerCase();

  // 1. Fisheries & Fish Species Inquiry (Names of fishes, probability, catch, tuna, mackerel, sardine, pomfret, etc.)
  if (
    /(fish|fishing|species|probability|probablity|catch|tuna|mackerel|sardine|pomfret|hilsa|ribbonfish|seerfish|surmai|bangda|tarli|bombil|prawn|shrimp|spot|pfz|hunting|feeding ground|मछली|मच्छी|शिकार|मत्स्य|पकड़|प्रजाति|नाम|संभावना|कहाँ मछली मिलेगी|अच्छी जगह|टूना|बांगड़ा|तारली|सुरमई|पापलेट|हिल्सा)/i.test(q)
  ) {
    return {
      leadAgent: SPECIALIST_AGENTS.fisheries,
      requiredAgentIds: ['planner', 'fisheries', 'marine'],
      rationale: 'Inquiry focuses on fish species, catch probability, and fishing zones.',
      hindiRationale: 'प्रश्न विशिष्ट रूप से मछली की प्रजातियों, मिलने की संभावना और मत्स्य क्षेत्र से संबंधित है।'
    };
  }

  // 2. Geofence & Boundary check (Borders, MPAs, Sanctuaries, IMBL, Coast Guard, buffer, legal limits)
  if (
    /(border|boundary|imbl|geofence|sanctuary|protected|reserve|national park|restricted|sri lanka|pakistan|bangladesh|arrest|navy|coast guard|buffer|fine|trespass|सीमा|बॉर्डर|संरक्षित|अभयारण्य|पार्क|प्रतिबंधित|तटरक्षक|चालान)/i.test(q)
  ) {
    return {
      leadAgent: SPECIALIST_AGENTS.geofence,
      requiredAgentIds: ['planner', 'geofence'],
      rationale: 'Inquiry focuses on maritime sanctuary buffers and international boundary lines.',
      hindiRationale: 'प्रश्न समुद्री सीमा, अभयारण्य और प्रतिबंधित क्षेत्रों से संबंधित है।'
    };
  }

  // 3. Route & Navigation inquiry (Distance, heading, compass, waypoints, how to reach, travel time)
  if (
    /(route|heading|compass|direction|navigate|waypoint|how to get there|how to reach|travel time|distance there|distance to it|path to|steer|bearing|nautical miles|मार्ग|रास्ता|दिशा|पहुंच|दूरी|समय|नेविगेशन)/i.test(q)
  ) {
    return {
      leadAgent: SPECIALIST_AGENTS.route,
      requiredAgentIds: ['planner', 'route', 'geofence'],
      rationale: 'Inquiry focuses on compass heading, distance, transit route, and safe transit corridors.',
      hindiRationale: 'प्रश्न नौकायन मार्ग, दिशा, दूरी और सुरक्षित नेविगेशन से संबंधित है।'
    };
  }

  // 4. Marine oceanography (Waves, swell, sea state, rough sea, water temp, tide, currents)
  if (
    /(wave|waves|swell|sea state|rough sea|water temp|water temperature|sea temp|sea surface temp|tide|tidal|current|currents|chop|surf|rolling|pitching|लहरें|लहर|मौजा|समुद्र की स्थिति|पानी का तापमान|ज्वार|भाटा|समुद्री धारा)/i.test(q)
  ) {
    return {
      leadAgent: SPECIALIST_AGENTS.marine,
      requiredAgentIds: ['planner', 'marine', 'risk'],
      rationale: 'Inquiry focuses on wave dynamics, sea swell, and surface roughness.',
      hindiRationale: 'प्रश्न समुद्री लहरों, हलचल और महासागरीय जल स्थिति से संबंधित है।'
    };
  }

  // 5. Weather & Atmospheric conditions (Wind, gusts, rain, storm, thunderstorm, cyclone, clouds, lightning)
  if (
    /(weather|wind|winds|breeze|gust|gusts|rain|raining|storm|thunderstorm|cyclone|cloud|clouds|lightning|barometer|monsoon|overcast|हवा|पवन|बारिश|वर्षा|तूफान|आंधी|चक्रवात|बादल|मौसम|बिजली)/i.test(q)
  ) {
    const hasHazardWord = /(storm|thunderstorm|cyclone|lightning|danger|warning|तूफान|आंधी|चक्रवात|बिजली|खतरा)/i.test(q);
    return {
      leadAgent: SPECIALIST_AGENTS.weather,
      requiredAgentIds: hasHazardWord ? ['planner', 'weather', 'risk'] : ['planner', 'weather'],
      rationale: 'Inquiry focuses on atmospheric wind, gusts, and storm forecasting.',
      hindiRationale: 'प्रश्न वायुमंडलीय हवा, आंधी और मौसम पूर्वानुमान से संबंधित है।'
    };
  }

  // 6. Safety & Risk verdict (Can I go, safe to sail, danger, hazard, life jacket, stay ashore, warning)
  if (
    /(safe|safety|danger|dangerous|risk|hazard|life jacket|warning|can i go|should i go|can we sail|stay ashore|go ahead|boat safety|alert|precaution|surakshit|suraksha|सुरक्षित|खतरा|जोखिम|जाना चाहिए|क्या मैं जा सकता हूँ|क्या आज नाव ले जाएं|चेतावनी)/i.test(q)
  ) {
    return {
      leadAgent: SPECIALIST_AGENTS.risk,
      requiredAgentIds: ['planner', 'weather', 'marine', 'risk'],
      rationale: 'Inquiry requires safety evaluation of combined wind, wave, and storm criteria.',
      hindiRationale: 'प्रश्न नौकायन सुरक्षा, खतरे और समुद्री जोखिम मूल्यांकन से संबंधित है।'
    };
  }

  // Default: General Fleet Coordinator (Comprehensive multi-factor briefing)
  return {
    leadAgent: SPECIALIST_AGENTS.coordinator,
    requiredAgentIds: ['planner', 'weather', 'marine', 'risk', 'fisheries', 'geofence'],
    rationale: 'General multi-domain inquiry requiring complete coastal briefing.',
    hindiRationale: 'व्यापक बहु-एजेंट तटीय सुरक्षा व संचालन ब्रीफिंग।'
  };
}

import { AgentTraceStep, Language } from '../../types';

export function createInitialTraceStepsForPlan(
  plan: PlannedAgentExecution,
  language: Language = 'en'
): AgentTraceStep[] {
  const agentDefs: Record<AgentStepId, { toolName: string; agentName: string; hindiAgentName: string; icon: string; pendingSummary: string; pendingHindiSummary: string }> = {
    planner: {
      toolName: 'missionPlanner',
      agentName: 'Planner Agent',
      hindiAgentName: 'प्लानर एजेंट',
      icon: '🧭',
      pendingSummary: 'Formulating targeted mission plan...',
      pendingHindiSummary: 'मिशन योजना व एजेंट समन्वय जारी...'
    },
    weather: {
      toolName: 'getWeatherData',
      agentName: 'Weather Agent',
      hindiAgentName: 'मौसम विशेषज्ञ एजेंट',
      icon: '🌦️',
      pendingSummary: 'Waiting for atmospheric telemetry inquiry...',
      pendingHindiSummary: 'वायुमंडलीय मौसम डेटा की प्रतीक्षा...'
    },
    marine: {
      toolName: 'getMarineData',
      agentName: 'Marine Agent',
      hindiAgentName: 'समुद्री महासागर एजेंट',
      icon: '🌊',
      pendingSummary: 'Waiting for oceanographic telemetry inquiry...',
      pendingHindiSummary: 'समुद्री तरंगों व तापमान विश्लेषण की प्रतीक्षा...'
    },
    risk: {
      toolName: 'assessFishingSafety',
      agentName: 'Risk & Safety Agent',
      hindiAgentName: 'सुरक्षा व जोखिम एजेंट',
      icon: '🛡️',
      pendingSummary: 'Waiting for safety evaluation...',
      pendingHindiSummary: 'सुरक्षा मूल्यांकन की प्रतीक्षा...'
    },
    fisheries: {
      toolName: 'findNearestPFZ',
      agentName: 'Fisheries & Species Agent',
      hindiAgentName: 'मत्स्य क्षेत्र व प्रजाति एजेंट',
      icon: '🐟',
      pendingSummary: 'Waiting for fish species probability & PFZ analysis...',
      pendingHindiSummary: 'मछली प्रजाति संभावना व मत्स्य क्षेत्र विश्लेषण की प्रतीक्षा...'
    },
    geofence: {
      toolName: 'checkGeofence',
      agentName: 'Geofence Guardian Agent',
      hindiAgentName: 'जियोफेंस गार्डियन एजेंट',
      icon: '⚓',
      pendingSummary: 'Waiting for marine boundary check...',
      pendingHindiSummary: 'समुद्री सीमा व अभयारण्य जांच की प्रतीक्षा...'
    },
    route: {
      toolName: 'suggestSafeRoute',
      agentName: 'Route & Navigation Agent',
      hindiAgentName: 'नेविगेशन व मार्ग एजेंट',
      icon: '🧭',
      pendingSummary: 'Waiting for safe navigational routing...',
      pendingHindiSummary: 'नेविगेशन मार्ग गणना की प्रतीक्षा...'
    }
  };

  return plan.requiredAgentIds.map((id, index) => {
    const def = agentDefs[id] || agentDefs.planner;
    const isFirst = index === 0;
    return {
      id: `step-${id}`,
      toolName: def.toolName,
      agentName: def.agentName,
      hindiAgentName: def.hindiAgentName,
      agentIcon: def.icon,
      status: isFirst ? 'running' : 'pending',
      summary: language === 'hi' ? def.pendingHindiSummary : def.pendingSummary,
      hindiSummary: def.pendingHindiSummary,
      timestamp: Date.now()
    };
  });
}
