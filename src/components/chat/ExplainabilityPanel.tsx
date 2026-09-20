import React, { useState } from 'react';
import { ExplainabilityData, AgentToolCall } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, ChevronUp, Cpu, CheckCircle2, ShieldCheck, Activity, AlertTriangle, Zap } from 'lucide-react';

interface ExplainabilityPanelProps {
  explainability: ExplainabilityData;
  toolCalls?: AgentToolCall[];
  defaultExpanded?: boolean;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  explainability,
  toolCalls = [],
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { t, language } = useLanguage();

  const {
    waveHeight,
    windSpeed,
    seaSurfaceTemp,
    safetyVerdict,
    rulesApplied,
    geofenceAlert,
    thunderstormRisk,
    thunderstormCodes
  } = explainability;

  const safetyBadgeText = safetyVerdict === 'SAFE' ? t.safe : safetyVerdict === 'CAUTION' ? t.caution : t.stayAshore;

  return (
    <div id="orca-explainability-panel" className="mt-3 rounded-lg border border-[#E4DCD0] bg-white overflow-hidden shadow-xs text-xs">
      
      {/* Clickable Header Accordion */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between bg-[#FAF7F2] hover:bg-[#F5EFE6] text-[#0B2545] transition-colors border-b border-[#E4DCD0] cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Cpu className="w-3.5 h-3.5 text-[#0891B2]" />
          <span className="font-bold text-xs uppercase tracking-wider text-[#0B2545]">{t.explainabilityTitle}</span>
          <span className="px-2 py-0.5 text-[10px] rounded bg-white text-[#44403C] border border-[#DDD4C4] font-medium font-mono">
            {t.wave}: {waveHeight}m | {t.wind}: {windSpeed}km/h | {t.sst}: {seaSurfaceTemp}°C &rarr; {safetyBadgeText}
          </span>
          {thunderstormRisk && (
            <span className="px-2 py-0.5 text-[10px] rounded font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
              <span>{t.lightningAlert}</span>
            </span>
          )}
          {geofenceAlert?.isNearOrInside && (
            <span className="px-2 py-0.5 text-[10px] rounded font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] flex items-center gap-1">
              <span>⚠️</span>
              <span>{t.geofenceAlert}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#0891B2] font-semibold shrink-0">
          <span>{isExpanded ? t.collapse : t.explain}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-white">
          
          {/* Thunderstorm Alert Banner */}
          {thunderstormRisk && (
            <div className="p-3 rounded-md bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-[#B45309]">
                <Zap className="w-4 h-4 text-[#D97706] shrink-0 fill-[#D97706]" />
                <span>{t.lightningAlert}</span>
                {thunderstormCodes && thunderstormCodes.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#B45309] border border-[#FDE68A]">
                    WMO {thunderstormCodes.join(', ')}
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] text-[#78350F] pl-6 leading-relaxed">
                {t.lightningDesc}
              </div>
            </div>
          )}

          {/* Geofence Restricted Zone Warning Banner if near or inside */}
          {geofenceAlert?.isNearOrInside && (
            <div className="p-3 rounded-md bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs text-[#DC2626]">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>⚠️ {t.geofenceAlert}</span>
              </div>
              <div className="mt-1 text-[11px] text-[#7F1D1D] pl-6 leading-relaxed">
                <span className="font-bold text-[#991B1B]">
                  {geofenceAlert.nearestZone ? (language === 'hi' ? geofenceAlert.nearestZone.hindiName : geofenceAlert.nearestZone.name) : ''}
                </span>
                <span className="text-[#991B1B]"> ({geofenceAlert.isInside ? t.positionInsideZone : `${geofenceAlert.distanceKm} ${t.distanceKm} ${t.distanceFromPerimeter}`}).</span>
                <div className="text-[10px] text-[#B91C1C] mt-1 font-mono">
                  ⚖️ {geofenceAlert.nearestZone?.legalNotice}
                </div>
              </div>
            </div>
          )}

          {/* Telemetry Mathematical Threshold Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            {/* Wave Check */}
            <div className={`p-2.5 rounded-md border ${
              waveHeight > 2.5
                ? 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]'
                : waveHeight > 1.8
                ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
            }`}>
              <div className="font-bold text-[10px] uppercase tracking-wider flex items-center justify-between">
                <span>{t.waveCheck}</span>
                <span>{waveHeight > 2.5 ? t.exceeded : t.withinLimit}</span>
              </div>
              <div className="font-mono text-sm font-bold mt-1">
                {waveHeight}m <span className="text-[10px] font-normal opacity-80 font-sans">({t.limitM})</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5 font-medium">
                {waveHeight > 2.5 ? t.heavySwell : t.withinLimit}
              </div>
            </div>

            {/* Wind Check */}
            <div className={`p-2.5 rounded-md border ${
              windSpeed > 40
                ? 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]'
                : windSpeed > 28
                ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]'
                : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
            }`}>
              <div className="font-bold text-[10px] uppercase tracking-wider flex items-center justify-between">
                <span>{t.windVelocity}</span>
                <span>{windSpeed > 40 ? t.exceeded : t.withinLimit}</span>
              </div>
              <div className="font-mono text-sm font-bold mt-1">
                {windSpeed} km/h <span className="text-[10px] font-normal opacity-80 font-sans">({t.limitKmh})</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5 font-medium">
                {windSpeed > 40 ? t.galeHazard : t.withinLimit}
              </div>
            </div>

            {/* SST Check */}
            <div className={`p-2.5 rounded-md border ${
              seaSurfaceTemp >= 26 && seaSurfaceTemp <= 30
                ? 'bg-[#F0FDFA] border-[#99F6E4] text-[#0F766E]'
                : 'bg-[#FAF7F2] border-[#E8E2D5] text-[#44403C]'
            }`}>
              <div className="font-bold text-[10px] uppercase tracking-wider flex items-center justify-between">
                <span>{t.thermalSST}</span>
                <span>{seaSurfaceTemp >= 26 && seaSurfaceTemp <= 30 ? t.optimalPfzThermal : t.coolerWaters}</span>
              </div>
              <div className="font-mono text-sm font-bold mt-1">
                {seaSurfaceTemp}°C <span className="text-[10px] font-normal opacity-80 font-sans">({t.optimalRange})</span>
              </div>
              <div className="text-[10px] opacity-80 mt-0.5 font-medium">
                {seaSurfaceTemp >= 26 && seaSurfaceTemp <= 30
                  ? t.optimalPfzThermal
                  : seaSurfaceTemp < 26
                  ? t.coolerWaters
                  : t.warmWaters}
              </div>
            </div>
          </div>

          {/* Rules Applied List */}
          {rulesApplied && rulesApplied.length > 0 && (
            <div className="p-3 bg-[#FAF7F2] rounded-md border border-[#E8E2D5] text-[#44403C]">
              <div className="font-bold text-xs text-[#0B2545] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0891B2]" />
                <span>{t.rulesEvaluated}</span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#78716C] pl-4 list-disc">
                {rulesApplied.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Multi-Agent Tool Invocations Telemetry Trace */}
          {toolCalls && toolCalls.length > 0 && (
            <div className="p-3 bg-[#FAF7F2] rounded-md border border-[#E8E2D5] text-[#78716C]">
              <div className="font-bold text-xs text-[#0B2545] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0891B2]" />
                  <span>{t.toolInvocationsTitle}</span>
                </span>
                <span className="text-[10px] font-mono text-[#78716C]">
                  {toolCalls.length} calls
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[10px]">
                {toolCalls.map((tc, idx) => (
                  <div key={idx} className="p-2 rounded bg-white border border-[#DDD4C4] flex items-start justify-between gap-2">
                    <div className="truncate">
                      <span className="text-[#0891B2] font-bold">{tc.toolName}</span>
                      <span className="text-[#78716C] ml-1.5">({JSON.stringify(tc.input)})</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#78716C]">{tc.executionMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
