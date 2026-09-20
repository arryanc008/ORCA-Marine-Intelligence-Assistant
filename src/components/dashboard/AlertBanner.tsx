import React from 'react';
import { ShieldAlert, Wind, Waves, Zap, X } from 'lucide-react';
import { SafetyAssessment, CoastalLocation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AlertBannerProps {
  safety: SafetyAssessment;
  location: CoastalLocation;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  safety,
  location,
  onDismiss
}) => {
  const { t, language, getLocationName, getCoastName } = useLanguage();
  const isThunderstorm = Boolean(safety.criteria.thunderstormRisk);
  const hasActiveAlert = safety.alertTriggered || safety.status === 'UNSAFE' || isThunderstorm;

  if (!hasActiveAlert) {
    return null;
  }

  const locationLabel = getLocationName(location);
  const coastLabel = getCoastName(location);
  const thunderstormCodes = safety.criteria.thunderstormCodes || [];

  return (
    <div
      id="orca-alert-banner"
      className="relative z-30 bg-[#FFF5F5] border border-[#FEB2B2] rounded-lg p-4 sm:p-4.5 shadow-sm mb-4"
      role="alert"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-[#FED7D7] text-[#C53030] border border-[#FEB2B2] shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#C53030] text-white">
                {t.criticalSafetyAdvisory}
              </span>
              <span className="text-xs font-semibold text-[#742A2A]">
                {locationLabel} &bull; {coastLabel}
              </span>
            </div>
            
            <h3 className="text-sm sm:text-base font-bold text-[#9B1C1C] mt-1 flex items-center gap-1.5">
              <span>{t.alertBanner}</span>
            </h3>

            <p className="text-xs text-[#4A5568] mt-1 leading-relaxed max-w-3xl font-medium">
              {language === 'hi' ? safety.hindiReason : safety.reason}
            </p>

            {/* Threshold Telemetry & Alert Types Chips (Thunderstorm, Wind, Wave) */}
            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
              {/* Lightning / Thunderstorm Risk Alert */}
              {isThunderstorm && (
                <span
                  id="alert-chip-thunderstorm"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]"
                >
                  <Zap className="w-3.5 h-3.5 text-[#B45309] fill-[#B45309]" />
                  <span>{t.lightningAlert}</span>
                  {thunderstormCodes.length > 0 && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#FDE68A] text-[#78350F] border border-[#F59E0B] font-semibold">
                      WMO {thunderstormCodes.join(', ')}
                    </span>
                  )}
                </span>
              )}

              {/* Excessive Wave Height Alert */}
              {safety.criteria.waveHeightSafe === false && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[11px] font-mono font-bold">
                  <Waves className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>{t.wave}: {safety.criteria.waveHeight}m (&gt;2.5m)</span>
                </span>
              )}

              {/* Excessive Wind Speed Alert */}
              {safety.criteria.windSpeedSafe === false && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-[11px] font-mono font-bold">
                  <Wind className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>{t.wind}: {safety.criteria.windSpeed} km/h (&gt;40 km/h)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#FED7D7] text-[#742A2A] border border-[#FEB2B2] transition-colors self-end sm:self-center shrink-0 cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-xs"
            title={t.dismiss}
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t.dismiss}</span>
          </button>
        )}
      </div>
    </div>
  );
};
