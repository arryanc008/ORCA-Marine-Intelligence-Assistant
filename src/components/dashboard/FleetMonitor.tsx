import React from 'react';
import { CoastalLocation, WeatherData, MarineData, SafetyAssessment, ZoneQualityAssessment } from '../../types';
import { COASTAL_LOCATIONS } from '../../data/locations';
import { useLanguage } from '../../context/LanguageContext';
import { Anchor, Waves, Wind, Thermometer, ShieldCheck, ShieldAlert, AlertTriangle, RefreshCw, ArrowUpRight, Zap } from 'lucide-react';

interface FleetMonitorProps {
  stationDataMap: Record<string, { weather: WeatherData; marine: MarineData; safety: SafetyAssessment; zoneQuality: ZoneQualityAssessment }>;
  onSelectLocation: (loc: CoastalLocation) => void;
  onScanAllStations: () => void;
  isScanningAll: boolean;
  selectedLocation: CoastalLocation;
}

export const FleetMonitor: React.FC<FleetMonitorProps> = ({
  stationDataMap,
  onSelectLocation,
  onScanAllStations,
  isScanningAll,
  selectedLocation
}) => {
  const { t, getLocationName, getStateName, getCoastName } = useLanguage();

  return (
    <div id="orca-fleet-monitor" className="bg-white rounded-lg border border-[#E4DCD0] p-4 sm:p-5 shadow-xs">
      
      {/* Header with Scan All button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE2D3]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-2 font-sans">
            <Anchor className="w-4 h-4 text-[#0891B2]" />
            <span>{t.fleetOverview}</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5 font-medium">
            {t.fleetSubtitle}
          </p>
        </div>

        <button
          id="scan-all-ports-btn"
          onClick={onScanAllStations}
          disabled={isScanningAll}
          className="px-3.5 py-2 rounded-md bg-[#0B2545] hover:bg-[#1E3A5F] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanningAll ? 'animate-spin' : ''}`} />
          <span>{isScanningAll ? t.scanningStations : t.scanAllPorts}</span>
        </button>
      </div>

      {/* 15 Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {COASTAL_LOCATIONS.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;
          const data = stationDataMap[loc.id];
          const safety = data?.safety;
          const marine = data?.marine;
          const weather = data?.weather;
          const zoneQuality = data?.zoneQuality;

          const locName = getLocationName(loc);
          const locState = getStateName(loc);
          const locCoast = getCoastName(loc);

          const safetyLabel = safety?.status === 'UNSAFE'
            ? t.stayAshore
            : safety?.status === 'CAUTION'
            ? t.caution
            : t.safe;

          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#FAF7F2] border-2 border-[#0891B2] shadow-xs'
                  : 'bg-white border-[#E4DCD0] hover:border-[#0891B2] hover:bg-[#FFFDF9]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-[#0B2545] group-hover:text-[#0891B2] transition-colors">
                      {locName}
                    </span>
                    <span className="text-[10px] text-[#44403C] font-semibold bg-[#F5EFE6] px-1.5 py-0.5 rounded border border-[#DDD4C4]">
                      {locState}
                    </span>
                  </div>
                  <div className="text-xs text-[#78716C] font-medium mt-0.5">
                    <span className="text-[#44403C] font-semibold">{locCoast}</span> &bull; {loc.harbor}
                  </div>
                </div>

                {/* Safety Status Pill */}
                {safety ? (
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 shrink-0 ${
                    safety.status === 'UNSAFE'
                      ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                      : safety.status === 'CAUTION'
                      ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      : 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                  }`}>
                    {safety.status === 'UNSAFE' ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                    ) : safety.status === 'CAUTION' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    )}
                    <span>{safetyLabel}</span>
                  </span>
                ) : isScanningAll ? (
                  <span className="px-2 py-0.5 rounded text-xs bg-[#F5EFE6] text-[#0891B2] border border-[#DDD4C4] flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2] animate-pulse"></span>
                    <span>{t.scanning}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs bg-[#F5EFE6] text-[#78716C] border border-[#DDD4C4] font-medium">
                    {t.fetchPending}
                  </span>
                )}
              </div>

              {/* Telemetry row */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-[#EAE2D3] text-xs">
                <div className="bg-[#FAF7F2] p-2 rounded-md text-center border border-[#E8E2D5]">
                  <div className="text-[10px] text-[#78716C] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Waves className="w-3 h-3 text-[#0891B2]" /> {t.wave}
                  </div>
                  <div className="font-bold text-[#0B2545] font-mono text-sm mt-0.5">
                    {marine ? `${marine.waveHeight}m` : '--'}
                  </div>
                </div>

                <div className="bg-[#FAF7F2] p-2 rounded-md text-center border border-[#E8E2D5]">
                  <div className="text-[10px] text-[#78716C] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-[#D97706]" /> {t.wind}
                  </div>
                  <div className="font-bold text-[#0B2545] font-mono text-sm mt-0.5">
                    {weather ? `${weather.windSpeed}k` : '--'}
                  </div>
                </div>

                <div className="bg-[#FAF7F2] p-2 rounded-md text-center border border-[#E8E2D5]">
                  <div className="text-[10px] text-[#78716C] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#0284C7]" /> {t.sst}
                  </div>
                  <div className="font-bold text-[#0B2545] font-mono text-sm mt-0.5">
                    {marine ? `${marine.seaSurfaceTemperature}°` : '--'}
                  </div>
                </div>
              </div>

              {/* Thunderstorm / Lightning Warning Alert */}
              {safety?.criteria?.thunderstormRisk && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-1 rounded-md border border-[#FDE68A]">
                  <Zap className="w-3 h-3 text-[#D97706] fill-[#D97706] shrink-0" />
                  <span className="line-clamp-1">{t.lightningAlert}</span>
                </div>
              )}

              {/* PFZ banner */}
              {zoneQuality && (
                <div className="mt-2.5 text-xs text-[#78716C] flex items-center justify-between font-sans">
                  <span>{t.pfz}: <strong className={zoneQuality.isPotentialFishingZone ? 'text-[#0D9488] font-bold' : 'text-[#78716C]'}>{zoneQuality.status}</strong></span>
                  <span className="text-[#0891B2] group-hover:translate-x-0.5 transition-transform flex items-center font-semibold text-xs">
                    {t.selectPort} <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
