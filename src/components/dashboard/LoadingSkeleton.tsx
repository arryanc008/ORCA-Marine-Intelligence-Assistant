import React from 'react';
import { Compass, RefreshCw, MapPin, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LocationCardSkeletonProps {
  locationName?: string;
}

export const LocationCardSkeleton: React.FC<LocationCardSkeletonProps> = ({
  locationName = 'Harbor Station'
}) => {
  const { t } = useLanguage();

  return (
    <div
      id="orca-location-skeleton"
      className="bg-white rounded-lg border border-[#E4DCD0] p-4 sm:p-5 shadow-xs relative overflow-hidden"
      aria-label="Loading marine telemetry"
      role="status"
    >
      {/* Top subtle progress line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#EAE2D3] overflow-hidden">
        <div className="h-full bg-[#0891B2] w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>

      {/* Header section skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE2D3]">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-5 h-5 rounded-md bg-[#FAF7F2] flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-[#78716C]" />
            </div>
            <div className="h-6 w-48 bg-[#E8E2D5] rounded"></div>
            <div className="h-5 w-24 bg-[#E8E2D5] rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-[#FAF7F2] rounded"></div>
            <div className="h-4 w-28 bg-[#FAF7F2] rounded"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-md bg-[#FAF7F2] border border-[#E4DCD0] text-[#0B2545] text-xs font-semibold flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0891B2]" />
            <span className="font-mono text-[11px]">
              {t.connectingApi}
            </span>
          </div>
        </div>
      </div>

      {/* Dual Verdict Banners Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        {/* Safety verdict skeleton */}
        <div className="p-4 rounded-lg border border-[#E4DCD0] bg-[#FAF7F2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#E8E2D5] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#A8A29E]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-[#E8E2D5] rounded"></div>
              <div className="h-5 w-44 bg-[#DDD4C4] rounded"></div>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#0891B2]/40" />
        </div>

        {/* Fishing Zone PFZ verdict skeleton */}
        <div className="p-4 rounded-lg border border-[#E4DCD0] bg-[#FAF7F2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#E8E2D5] flex items-center justify-center">
              <div className="w-5 h-5 rounded bg-[#DDD4C4]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-[#E8E2D5] rounded"></div>
              <div className="h-5 w-48 bg-[#DDD4C4] rounded"></div>
            </div>
          </div>
          <div className="h-6 w-16 bg-[#E8E2D5] rounded"></div>
        </div>
      </div>

      {/* 6-Grid Telemetry Parameter Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-[#E4DCD0] rounded-lg p-3 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-[#E8E2D5] rounded"></div>
              <div className="w-4 h-4 rounded bg-[#FAF7F2]"></div>
            </div>
            <div className="space-y-1 mt-2">
              <div className="h-6 w-20 bg-[#DDD4C4] rounded"></div>
              <div className="h-2.5 w-14 bg-[#E8E2D5] rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer bar skeleton */}
      <div className="mt-4 pt-3.5 border-t border-[#EAE2D3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-[#E8E2D5] rounded"></div>
          <div className="h-5 w-16 bg-[#E8E2D5] rounded"></div>
          <span className="text-[11px] text-[#78716C] font-mono">
            {locationName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#78716C] text-[10px]">
          <Compass className="w-3 h-3 text-[#0891B2]" />
          <span>{t.modelInfo}</span>
        </div>
      </div>
    </div>
  );
};

export const LiveFetchingBadge: React.FC<{ isScanning?: boolean }> = ({
  isScanning = false
}) => {
  const { t } = useLanguage();

  return (
    <div
      id="live-api-fetching-badge"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0B2545] border border-[#1E3A5F] text-white text-xs font-semibold shadow-xs"
      role="status"
    >
      <RefreshCw className="w-3.5 h-3.5 text-[#0891B2] animate-spin" />
      <span>
        {isScanning ? t.scanningStations : t.fetchingLiveFeeds}
      </span>
      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
    </div>
  );
};
