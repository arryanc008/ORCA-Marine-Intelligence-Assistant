import React from 'react';
import { CoastalLocation, WeatherData, MarineData, SafetyAssessment, ZoneQualityAssessment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getWindDirectionText, getWeatherDescription } from '../../services/marine/marineService';
import { LocationCardSkeleton } from './LoadingSkeleton';
import {
  Waves,
  Wind,
  Thermometer,
  CloudRain,
  Compass,
  Fish,
  Anchor,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  MapPin,
  Zap
} from 'lucide-react';

interface LocationCardProps {
  location: CoastalLocation;
  weather: WeatherData | null;
  marine: MarineData | null;
  safety: SafetyAssessment | null;
  zoneQuality: ZoneQualityAssessment | null;
  isLoading: boolean;
  onRefresh: () => void;
  onAskAboutLocation: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  weather,
  marine,
  safety,
  zoneQuality,
  isLoading,
  onRefresh,
  onAskAboutLocation
}) => {
  const { t, getLocationName, getStateName, getCoastName } = useLanguage();
  const locationName = getLocationName(location);
  const stateName = getStateName(location);
  const coastName = getCoastName(location);

  // Render full animated skeleton while initial telemetry is fetching
  if (isLoading && (!weather || !marine)) {
    return <LocationCardSkeleton locationName={locationName} />;
  }

  const windDirText = weather ? getWindDirectionText(weather.windDirection) : '--';
  const weatherText = weather ? getWeatherDescription(weather.weatherCode) : '--';

  return (
    <div id="orca-location-card" className="bg-white rounded-lg border border-[#E4DCD0] p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all text-[#1C1917]">
      
      {/* Top Subtle Loading Progress Bar during Live Refresh */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#EAE2D3] overflow-hidden z-20">
          <div className="h-full bg-[#0891B2] w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Header section with responsive buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE2D3]">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-2xl font-bold text-[#0B2545] tracking-tight uppercase flex items-center gap-2 font-sans">
              <MapPin className="w-5 h-5 text-[#0891B2] shrink-0" />
              <span>{locationName}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold bg-[#F5EFE6] text-[#44403C] border border-[#DDD4C4] uppercase tracking-wider">
              {stateName} &bull; {coastName}
            </span>

            {/* Live refresh in-flight badge */}
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F5EFE6] border border-[#DDD4C4] text-[#0891B2] text-[10px] font-mono">
                <RefreshCw className="w-2.5 h-2.5 animate-spin text-[#0891B2]" />
                <span>{t.fetching}</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1 flex items-center gap-1.5 font-medium flex-wrap">
            <Anchor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0891B2] shrink-0" />
            <span className="text-[#0B2545] font-semibold">{location.harbor}</span>
            <span className="text-[#A8A29E] font-mono text-xs">({location.lat.toFixed(2)}°N, {location.lon.toFixed(2)}°E)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="refresh-telemetry-btn"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-md bg-[#F5EFE6] hover:bg-[#EAE2D3] text-[#0B2545] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#DDD4C4] transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            title={t.liveRefresh}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0891B2] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? t.fetching : t.liveRefresh}</span>
          </button>

          <button
            id="ask-agent-location-btn"
            onClick={onAskAboutLocation}
            className="flex-1 sm:flex-initial px-4 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-md bg-[#0891B2] hover:bg-[#0E7490] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{t.queryOrca}</span>
          </button>
        </div>
      </div>

      {/* Safety & PFZ Dual Verdict Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        
        {/* Safety Badge Card */}
        <div className={`p-3.5 sm:p-4 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
          safety?.status === 'UNSAFE'
            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            : safety?.status === 'CAUTION'
            ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md shrink-0 ${
              safety?.status === 'UNSAFE'
                ? 'bg-[#FEE2E2] text-[#DC2626]'
                : safety?.status === 'CAUTION'
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : 'bg-[#DCFCE7] text-[#16A34A]'
            }`}>
              {safety?.status === 'UNSAFE' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : safety?.status === 'CAUTION' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[#78716C]">{t.safetyStatus}</div>
              <div className="text-sm sm:text-base font-bold tracking-tight uppercase mt-0.5">
                {safety?.status === 'UNSAFE'
                  ? t.unsafeToVenture
                  : safety?.status === 'CAUTION'
                  ? t.cautionToVenture
                  : t.safeToVenture}
              </div>
              {safety?.criteria.thunderstormRisk && (
                <div className="inline-flex items-center gap-1 text-[11px] text-[#B45309] font-bold mt-1 bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FCD34D]">
                  <Zap className="w-3 h-3 text-[#D97706] fill-[#D97706] shrink-0" />
                  <span>{t.lightningAlert}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${
              safety?.status === 'UNSAFE' ? 'bg-[#DC2626]' : safety?.status === 'CAUTION' ? 'bg-[#D97706]' : 'bg-[#16A34A]'
            }`} />
          </div>
        </div>

        {/* Fishing Zone PFZ Badge Card */}
        <div className={`p-3.5 sm:p-4 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
          zoneQuality?.status === 'FAVORABLE'
            ? 'bg-[#F0FDFA] border-[#99F6E4] text-[#0F766E]'
            : zoneQuality?.status === 'MODERATE'
            ? 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]'
            : 'bg-[#FAF7F2] border-[#E8E2D5] text-[#44403C]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#CCFBF1] text-[#0D9488] shrink-0">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[#78716C]">{t.zoneStatus}</div>
              <div className="text-sm sm:text-base font-bold tracking-tight uppercase mt-0.5">
                {zoneQuality?.status === 'FAVORABLE'
                  ? t.favorableZone
                  : zoneQuality?.status === 'MODERATE'
                  ? t.moderateZone
                  : t.poorZone}
              </div>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white border border-[#DDD4C4] text-[#0B2545] shadow-2xs shrink-0">
            {marine ? `${marine.seaSurfaceTemperature}°C` : '--'}
          </span>
        </div>
      </div>

      {/* Real Live Marine & Atmospheric Telemetry Grid - 6 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        
        {/* Wave Height */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:bg-[#FFFDF9] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#78716C] font-bold uppercase tracking-wider">
            <span>{t.waveHeight}</span>
            <Waves className="w-4 h-4 text-[#0891B2]" />
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B2545] font-mono">
              {marine ? `${marine.waveHeight}m` : '--'}
            </div>
            <div className="text-[11px] text-[#78716C] mt-1 font-mono font-medium truncate">
              {marine?.waveHeightMax ? `${t.maxWave}: ${marine.waveHeightMax}m` : t.significant}
            </div>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:bg-[#FFFDF9] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#78716C] font-bold uppercase tracking-wider">
            <span>{t.windSpeed}</span>
            <Wind className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B2545] font-mono">
              {weather ? `${weather.windSpeed}` : '--'}<span className="text-xs text-[#78716C] ml-1 font-normal font-sans">km/h</span>
            </div>
            <div className="text-[11px] text-[#78716C] mt-1 font-mono font-medium truncate">
              {t.speedLimit}
            </div>
          </div>
        </div>

        {/* Wind Direction */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:bg-[#FFFDF9] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#78716C] font-bold uppercase tracking-wider">
            <span>{t.windDirection}</span>
            <Compass className="w-4 h-4 text-[#44403C]" />
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0B2545] font-mono">
              {windDirText} <span className="text-xs text-[#78716C] font-medium font-sans">{weather ? `(${weather.windDirection}°)` : ''}</span>
            </div>
            <div className="text-[11px] text-[#78716C] mt-1 font-mono font-medium truncate">
              {t.bearing}
            </div>
          </div>
        </div>

        {/* Sea Surface Temp (SST) */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:bg-[#FFFDF9] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#78716C] font-bold uppercase tracking-wider">
            <span>{t.seaSurfaceTemp}</span>
            <Thermometer className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B2545] font-mono">
              {marine ? `${marine.seaSurfaceTemperature}°C` : '--'}
            </div>
            <div className="text-[11px] text-[#78716C] mt-1 font-mono font-medium truncate">
              {t.pfzOptimal}
            </div>
          </div>
        </div>

        {/* Air Temperature */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:bg-[#FFFDF9] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#78716C] font-bold uppercase tracking-wider">
            <span>{t.temperature}</span>
            <Thermometer className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B2545] font-mono">
              {weather ? `${weather.temperature}°C` : '--'}
            </div>
            <div className="text-[11px] text-[#78716C] mt-1 font-mono font-medium truncate">
              {weather ? `${weather.tempMin}° - ${weather.tempMax}°` : '--'}
            </div>
          </div>
        </div>

        {/* Atmospheric Sky */}
        <div className="bg-[#FAF7F2] border border-[#E8E2D5] rounded-lg p-3 flex flex-col justify-between shadow-2xs hover:bg-[#FFFDF9] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#78716C] font-bold uppercase tracking-wider">
            <span>{t.weatherData}</span>
            <CloudRain className="w-4 h-4 text-[#0D9488]" />
          </div>
          <div className="mt-2 sm:mt-2.5">
            <div className="text-xs sm:text-sm font-bold text-[#0B2545] line-clamp-1">
              {weatherText}
            </div>
            <div className="text-[11px] text-[#78716C] mt-1 font-mono font-medium flex items-center justify-between flex-wrap gap-1">
              <span>{t.rainMm}: {weather?.precipitation ?? 0} mm</span>
              {weather?.hasThunderstormRisk && (
                <span className="text-[10px] text-[#B45309] font-bold inline-flex items-center gap-1 bg-[#FEF3C7] px-1.5 py-0.5 rounded border border-[#FCD34D]">
                  <Zap className="w-2.5 h-2.5 text-[#D97706] fill-[#D97706]" />
                  <span>{t.lightningAlert}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Target Catches Species List */}
      <div className="mt-4 pt-3.5 border-t border-[#EAE2D3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#78716C]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[#44403C] uppercase tracking-wider">{t.targetCatches}:</span>
          {location.commonCatches.map((species, i) => (
            <span key={i} className="px-2.5 py-1 rounded-md bg-[#F5EFE6] text-[#44403C] text-xs font-medium border border-[#DDD4C4]">
              {species}
            </span>
          ))}
        </div>

        <div className="text-xs text-[#78716C] font-mono">
          {weather?.fetchedAt ? `${t.lastUpdated}: ${new Date(weather.fetchedAt).toLocaleTimeString()}` : ''}
        </div>
      </div>
    </div>
  );
};
