import React, { useState, useRef, useEffect } from 'react';
import { CoastalLocation, ChatMessage, AgentTraceStep } from '../../types';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { AgentLoadingIndicator } from './AgentLoadingIndicator';
import { useLanguage } from '../../context/LanguageContext';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Compass,
  Waves,
  Wind,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Radio,
  MapPin,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isThinking: boolean;
  activeTraceSteps?: AgentTraceStep[];
  selectedLocation: CoastalLocation;
  onSelectLocation: (loc: CoastalLocation) => void;
  onSendMessage: (query: string) => void;
  onClearChat?: () => void;
  fillHeight?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isThinking,
  activeTraceSteps = [],
  selectedLocation,
  onSelectLocation,
  onSendMessage,
  onClearChat,
  fillHeight = false
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const { t, language, getLocationName, getStateName } = useLanguage();

  // Auto-scroll ONLY inside the chat messages container itself.
  // CRITICAL: We NEVER call scrollIntoView or window scroll so the web page
  // viewport remains completely stable and never gets pointed or jumped to the bottom!
  const prevMessagesCountRef = useRef(messages.length);
  useEffect(() => {
    if (chatContainerRef.current && messages.length > prevMessagesCountRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages.length]);

  // Speech Recognition language mapping
  const getBcp47Locale = (lang: string) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'bn': return 'bn-IN';
      case 'mr': return 'mr-IN';
      case 'gu': return 'gu-IN';
      case 'kn': return 'kn-IN';
      case 'ml': return 'ml-IN';
      case 'pa': return 'pa-IN';
      case 'od': return 'or-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  };

  // Toggle Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.speechRecognitionNotSupported);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getBcp47Locale(language);

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

  // Text to Speech
  const toggleTextToSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert(t.voiceNotSupported);
      return;
    }

    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#>`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getBcp47Locale(language);

    utterance.onend = () => {
      setIsSpeakingId(null);
    };
    utterance.onerror = () => {
      setIsSpeakingId(null);
    };

    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    const query = input;
    setInput('');
    onSendMessage(query);
  };

  const selectedLocName = getLocationName(selectedLocation);
  const selectedStateName = getStateName(selectedLocation);

  // Dynamic suggested queries in selected language
  const suggestedQueries = t.suggestedQueries;

  return (
    <div
      id="orca-chat-interface"
      className={
        fillHeight
          ? "flex flex-col h-full min-h-[520px] md:min-h-[650px] bg-white rounded-lg border border-[#E4DCD0] shadow-xs overflow-hidden"
          : "flex flex-col h-[520px] sm:h-[600px] lg:h-[650px] bg-white rounded-lg border border-[#E4DCD0] shadow-xs overflow-hidden"
      }
    >
      
      {/* Chat Header */}
      <div className="p-3 sm:p-4 bg-[#FAF7F2] border-b border-[#E4DCD0] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-[#0B2545] flex items-center justify-center text-white shadow-xs shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-[#0B2545] flex items-center gap-1.5 uppercase tracking-wider truncate font-sans">
              <span>{t.agentTitle}</span>
              <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
            </h3>
            <p className="text-[11px] text-[#78716C] font-medium truncate">
              {t.agentSubtitle} &bull; <span className="text-[#0891B2] font-semibold">{selectedLocName}</span> ({selectedStateName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClearChat && messages.length > 1 && (
            <button
              onClick={onClearChat}
              className="text-[11px] text-[#78716C] hover:text-[#0B2545] px-2.5 py-1 rounded-md bg-[#F5EFE6] border border-[#DDD4C4] font-medium cursor-pointer transition-colors"
            >
              {t.clearChat}
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F5EFE6] border border-[#DDD4C4] text-[#0B2545] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#0891B2] shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[130px]">{selectedLocName}</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatContainerRef} className="chat-messages flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-[#FBF8F3]">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          const isSpeaking = isSpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              {isAgent && (
                <div className="w-8 h-8 rounded-md bg-[#0B2545] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-lg p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isAgent
                    ? 'bg-white text-[#1C1917] border border-[#E4DCD0]'
                    : 'bg-[#0B2545] text-white font-normal'
                }`}
              >
                {/* Agent Header info & TTS Button */}
                {isAgent && (
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#EAE2D3] text-[10px] text-[#78716C]">
                    <span className="font-mono text-[#0891B2] font-bold">
                      {msg.locationName || selectedLocName}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTextToSpeech(msg.id, msg.text)}
                        className="text-[#78716C] hover:text-[#0B2545] transition-colors p-1 cursor-pointer"
                        title={isSpeaking ? t.stopReading : t.readAloud}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#0891B2] animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="font-mono text-[#A8A29E]">{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Lead Specialist Agent Indicator */}
                {isAgent && msg.leadAgent && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded text-[11px] font-medium border bg-[#F5EFE6] border-[#DDD4C4] text-[#0B2545]`}>
                    <span className="text-xs">{msg.leadAgent.icon}</span>
                    <span className="font-semibold">{language === 'hi' ? msg.leadAgent.hindiName : msg.leadAgent.name}</span>
                    <span className="opacity-40">&bull;</span>
                    <span className="text-[10px] text-[#78716C] truncate">{language === 'hi' ? msg.leadAgent.hindiRole : msg.leadAgent.role}</span>
                  </div>
                )}

                {/* Message Body with Markdown formatting support */}
                <div className="space-y-2 whitespace-pre-line break-words leading-relaxed">
                  {msg.text}
                </div>

                {/* Fish Species Probability Card */}
                {msg.recommendedPFZ && msg.recommendedPFZ.speciesProbabilities && msg.recommendedPFZ.speciesProbabilities.length > 0 && (
                  <div className="mt-3 p-3 rounded-md bg-[#FAF7F2] border border-[#E4DCD0]">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B2545]">
                        <span>🐟</span>
                        <span>{language === 'hi' ? 'संभावित मछली प्रजातियां व उपलब्धता' : 'Species Catch Probability (PFZ Zone)'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#78716C]">
                        {msg.recommendedPFZ.distanceKm} km {msg.recommendedPFZ.bearing}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {msg.recommendedPFZ.speciesProbabilities.slice(0, 4).map((spec) => (
                        <div key={spec.name} className="p-2 rounded bg-white border border-[#DDD4C4] text-[11px]">
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-[#1C1917] font-semibold truncate">
                              {language === 'hi' ? spec.hindiName : spec.name}
                            </span>
                            <span className="font-mono font-bold text-[#0891B2] shrink-0 ml-1">
                              {spec.probability}%
                            </span>
                          </div>
                          <div className="w-full bg-[#EAE2D3] h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-[#0891B2] rounded-full"
                              style={{ width: `${spec.probability}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Telemetry Mini-Badges attached to agent response */}
                {msg.safety && (
                  <div className="mt-3 pt-2.5 border-t border-[#EAE2D3] flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      msg.safety.status === 'UNSAFE'
                        ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                        : msg.safety.status === 'CAUTION'
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                        : 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                    }`}>
                      {msg.safety.status === 'UNSAFE' ? t.stayAshore : msg.safety.status === 'CAUTION' ? t.caution : t.safe}
                    </span>

                    {msg.safety.criteria.thunderstormRisk && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#D97706] fill-[#D97706]" />
                        <span>{t.lightningAlert}</span>
                      </span>
                    )}

                    {msg.marineSnapshot && (
                      <span className="text-[10px] text-[#78716C] font-mono">
                        {t.wave}: {msg.marineSnapshot.waveHeight}m &bull; SST: {msg.marineSnapshot.seaSurfaceTemperature}°C
                      </span>
                    )}
                  </div>
                )}

                {/* Explainability Accordion Panel (optional audit details) */}
                {msg.explainability && (
                  <ExplainabilityPanel
                    explainability={msg.explainability}
                    toolCalls={msg.toolCalls}
                    defaultExpanded={false}
                  />
                )}
              </div>

              {!isAgent && (
                <div className="w-8 h-8 rounded-md bg-[#44403C] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {/* Temporary Loading-Only Indicator (disappears once final response is ready) */}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-[#0B2545] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs animate-pulse">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[94%] sm:max-w-[88%]">
              <AgentLoadingIndicator steps={activeTraceSteps} />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries in active language */}
      <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E4DCD0] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider whitespace-nowrap">{t.suggestedQueriesTitle}:</span>
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(q)}
            disabled={isThinking}
            className="px-3 py-1 rounded-md bg-[#F5EFE6] hover:bg-[#EAE2D3] text-[#0B2545] text-xs font-semibold whitespace-nowrap border border-[#DDD4C4] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form with Voice Support */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#FAF7F2] border-t border-[#E4DCD0] flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-2.5 rounded-md border transition-colors cursor-pointer ${
            isListening
              ? 'bg-[#DC2626] text-white border-[#DC2626] animate-pulse'
              : 'bg-[#F5EFE6] text-[#0B2545] hover:bg-[#EAE2D3] border-[#DDD4C4]'
          }`}
          title={isListening ? t.listening : t.voiceInput}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? t.listening : t.chatPlaceholder}
          disabled={isThinking}
          className="flex-1 bg-white border border-[#DDD4C4] focus:border-[#0891B2] rounded-md px-3.5 py-2 text-xs sm:text-sm text-[#0B2545] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#0891B2] transition-colors font-sans"
        />

        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="px-4 py-2 rounded-md bg-[#0891B2] hover:bg-[#0E7490] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>{t.send}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
