# Architecture

## Overview

ORCA is a single Node.js process. In development, Express serves the API and mounts
Vite as middleware for the React app. In production, Express serves the built files
from `dist/`.

```
 Browser (React)                              Express server              External
┌──────────────────────────────┐          ┌──────────────────┐      ┌──────────────┐
│ ChatInterface / Map / Cards  │          │  POST /api/chat  │─────▶│ Gemini API   │
│            │                 │  fetch   │  GET /api/health │      └──────────────┘
│   agentEngine (orchestrator) │─────────▶│                  │
│      │          │            │          └──────────────────┘
│ marineService  leadAgent     │─────────────────────────────────▶ Open-Meteo
│ routeService   Detector      │                                   (weather + marine)
└──────────────────────────────┘
```

The browser fetches live telemetry itself and runs the deterministic safety logic.
The server is only needed to talk to Gemini, which keeps the API key off the client.

## Request flow

1. **Plan.** `leadAgentDetector` reads the question and picks a lead agent and the
   list of agents that must run (`planAgentsForQuery`).
2. **Gather.** `marineService` fetches weather and marine data from Open-Meteo for
   the selected station.
3. **Assess.** The deterministic tools run locally:
   - `assessFishingSafety`: safety verdict from wave height, wind and storm codes
   - `assessFishingZoneQuality`: fishing-zone quality from sea-surface temperature
   - `findNearestPFZ`: ranks nearby sectors by closeness to the 27–29 °C ideal
   - `checkGeofence`: distance to restricted marine zones
   - `suggestSafeRoute`: waypoint checks and detour suggestion
4. **Explain.** `agentEngine` builds the reasoning trace and explainability data
   shown in the UI.
5. **Reply.** The client calls `POST /api/chat` with the question and telemetry.
   Gemini writes a short conversational answer as the lead agent. If it returns
   `fallback: true` (no key, quota reached, error), the client builds the answer from
   the local text builders in `agentEngine`. The user always gets a response.

## Agents

| Agent                     | Responsibility                               |
| ------------------------- | -------------------------------------------- |
| Weather Agent             | Wind, precipitation, storm risk              |
| Marine Agent              | Wave height and direction, sea state         |
| Fisheries & PFZ Agent     | Fishing zones, species, catch probability    |
| Geofence Guardian Agent   | Sanctuaries and maritime boundaries          |
| Route & Navigation Agent  | Headings, waypoints, detours                 |
| Risk & Safety Agent       | Overall go / no-go advisory                  |
| ORCA Fleet Coordinator    | Combines several agents into one briefing    |

## Safety rules

| Condition                                  | Result |
| ------------------------------------------ | ------ |
| Wave height above 2.5 m                    | Unsafe |
| Wind speed above 40 km/h                   | Unsafe |
| Thunderstorm forecast (WMO 95, 96, 99)     | Unsafe |

The same rules are applied to tomorrow's forecast for next-day advisories.

## Fishing-zone heuristic

Sea-surface temperature between 26 and 30 °C is treated as a favourable thermal
range. `findNearestPFZ` scans nearby offshore sectors and ranks them by how close
their temperature is to 27–29 °C, discarding points that fall on land.

## Restricted zones

Defined in `src/data/restrictedZones.ts`:

- Gulf of Mannar Marine National Park
- India–Sri Lanka IMBL buffer
- Gahirmatha Marine Sanctuary
- Gulf of Kutch Marine Park

A position inside a zone, or within 5 km of it, raises an alert.

## Internationalisation

`src/i18n/` holds one dictionary per language: English, Hindi, Tamil, Telugu,
Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia and Punjabi. `types.ts` defines the
dictionary shape, `extendedI18n.ts` adds the extra UI strings, and `locationsI18n.ts`
translates station, state and coast names. `LanguageContext` exposes the active
dictionary through `useLanguage()`.

## Adding things

- **New coastal station:** add an entry in `src/data/locations.ts` and its names in
  `src/i18n/locationsI18n.ts`.
- **New restricted zone:** add it to `src/data/restrictedZones.ts`.
- **New language:** create `src/i18n/<code>.ts`, register it in `src/i18n/index.ts`
  and add the code to the `Language` type in `src/types.ts`.
