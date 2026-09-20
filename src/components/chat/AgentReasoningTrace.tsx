import React, { useState } from 'react';
import { AgentTraceStep } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  GitFork,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AgentReasoningTraceProps {
  steps?: AgentTraceStep[];
  isLive?: boolean;
}

export const AgentReasoningTrace: React.FC<AgentReasoningTraceProps> = ({
  steps = [],
  isLive = false
}) => {
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const { t } = useLanguage();

  if (!steps || steps.length === 0) return null;

  const toggleStepDetails = (stepId: string) => {
    setShowDetails((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const getAgentLabel = (step: AgentTraceStep) => {
    switch (step.toolName) {
      case 'getWeatherData':
        return t.weatherAgent;
      case 'getMarineData':
        return t.marineAgent;
      case 'assessFishingSafety':
        return t.riskAgent;
      case 'assessFishingZoneQuality':
        return t.fisheriesAgent;
      case 'findNearestPFZ':
        return t.pfzLocatorAgent;
      case 'checkGeofence':
        return t.geofenceAgent;
      default:
        return step.agentName;
    }
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const totalCount = steps.length;

  return (
    <div
      id="agent-reasoning-trace"
      className={`mt-3.5 rounded-lg border transition-all ${
        isLive
          ? 'bg-white border-[#0891B2] shadow-xs'
          : 'bg-white border-[#E4DCD0] shadow-xs'
      } overflow-hidden`}
    >
      {/* Trace Header */}
      <div className="px-3.5 py-2.5 bg-[#FAF7F2] border-b border-[#E4DCD0] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${isLive ? 'bg-[#0891B2] text-white' : 'bg-[#EAE2D3] text-[#0B2545]'}`}>
            <GitFork className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#0B2545]">
                {t.agentReasoningTrace}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-[#0891B2] border border-[#DDD4C4]">
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#0891B2] animate-pulse' : 'bg-[#16A34A]'}`} />
                {t.multiAgentCollab}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-[#78716C]">
          <span className="px-2 py-0.5 rounded bg-white text-[#0B2545] border border-[#DDD4C4] font-semibold">
            {completedCount}/{totalCount} {isLive ? t.stepExecuting : t.stepCompleted}
          </span>
        </div>
      </div>

      {/* Vertical Timeline / Stepper Body */}
      <div className="p-3.5 sm:p-4 bg-[#FAF7F2]">
        <div className="relative pl-6 sm:pl-7 space-y-3">
          {/* Vertical continuous guide line */}
          <div className="absolute left-2.5 sm:left-3 top-2.5 bottom-2.5 w-0.5 bg-[#DDD4C4]" />

          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isRunning = step.status === 'running';
            const isExpanded = Boolean(showDetails[step.id]);

            const agentDisplayName = getAgentLabel(step);

            return (
              <div key={step.id || idx} className="relative group">
                {/* Stepper Node Indicator */}
                <div
                  className={`absolute -left-6 sm:-left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-[#DCFCE7] border-2 border-[#16A34A] text-[#16A34A]'
                      : isRunning
                      ? 'bg-[#FEF3C7] border-2 border-[#D97706] text-[#D97706]'
                      : 'bg-white border border-[#DDD4C4] text-[#A8A29E]'
                  }`}
                >
                  {isRunning ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-[#D97706]" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DDD4C4]" />
                  )}
                </div>

                {/* Step Card Content */}
                <div
                  className={`rounded-md p-2.5 transition-all text-xs border ${
                    isRunning
                      ? 'bg-[#FEF3C7] border-[#FDE68A] shadow-xs'
                      : isCompleted
                      ? 'bg-white border-[#E4DCD0] shadow-xs hover:border-[#CBD5E1]'
                      : 'bg-[#F5EFE6] border-[#E8E2D5] text-[#A8A29E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                    {/* Primary Agent Label & Summary Line */}
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-sm shrink-0" role="img" aria-label="agent-icon">
                        {step.agentIcon}
                      </span>
                      <span className="font-bold text-[#0B2545] shrink-0">
                        {agentDisplayName}
                      </span>
                      <span className="text-[#0891B2] font-bold shrink-0">→</span>
                      <span className="font-mono text-[#44403C] truncate max-w-[280px] sm:max-w-[420px]">
                        {step.summary}
                      </span>
                    </div>

                    {/* Step Metrics & Accordion Trigger */}
                    <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                      {step.durationMs && (
                        <span className="text-[#78716C]">
                          {step.durationMs}ms
                        </span>
                      )}

                      {step.details && (
                        <button
                          onClick={() => toggleStepDetails(step.id)}
                          className="text-[#0891B2] hover:text-[#065F73] p-0.5 rounded hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                          title="View Tool I/O"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable JSON Payload Inspection */}
                  {isExpanded && step.details && (
                    <div className="mt-2 pt-2 border-t border-[#EAE2D3] font-mono text-[10px] text-[#44403C] bg-[#FAF7F2] p-2 rounded overflow-x-auto">
                      <div className="text-[#0891B2] font-bold mb-1">
                        tool: {step.toolName}()
                      </div>
                      <pre className="text-[#57534E] leading-tight">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
