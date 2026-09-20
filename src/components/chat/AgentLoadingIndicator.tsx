import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AgentTraceStep } from '../../types';
import {
  Compass,
  CloudSun,
  Waves,
  ShieldCheck,
  Fish,
  Anchor,
  CheckCircle2,
  Loader2,
  Cpu,
  Sparkles
} from 'lucide-react';

interface AgentLoadingIndicatorProps {
  steps?: AgentTraceStep[];
}

interface AgentMetadata {
  id: string;
  name: string;
  localName: Record<string, string>;
  role: Record<string, string>;
  icon: React.ComponentType<{ className?: string }>;
}

const AGENTS_LIST: AgentMetadata[] = [
  {
    id: 'planner',
    name: 'Planner Agent',
    localName: {
      en: 'Planner Agent',
      hi: 'प्लानर एजेंट (Planner Agent)',
      ta: 'திட்டமிடல் முகவர் (Planner Agent)',
      te: 'ప్లానర్ ఏజెంట్ (Planner Agent)',
      bn: 'প্ল্যানার এজেন্ট (Planner Agent)',
      mr: 'प्लॅनर एजंट (Planner Agent)',
      gu: 'પ્લાનર એજન્ટ (Planner Agent)',
      kn: 'ಪ್ಲಾನರ್ ಏಜೆಂಟ್ (Planner Agent)',
      ml: 'പ്ലാനർ ഏജന്റ് (Planner Agent)',
      or: 'ପ୍ଲାନର୍ ଏଜେଣ୍ଟ (Planner Agent)',
      pa: 'ਪਲੈਨਰ ਏਜੰਟ (Planner Agent)'
    },
    role: {
      en: 'Orchestrating mission plan & delegating sub-agents',
      hi: 'मिशन योजना बनाना और अन्य एजेंटों को कार्य सौंपना',
      ta: 'பணி திட்டமிடல் மற்றும் முகவர்களை வழிநடத்துதல்',
      te: 'మిషన్ ప్రణాళిక మరియు ఏజెంట్లను నడిపించడం',
      bn: 'মিশন পরিকল্পনা এবং অন্যান্য এজেন্টদের পরিচালনা',
      mr: 'मिशन नियोजन आणि इतर एजंटांचे समन्वय',
      gu: 'મિશન આયોજન અને પેટા-એજન્ટોનું સંકલન',
      kn: 'ಮಿಷನ್ ಯೋಜನೆ ಮತ್ತು ಇತರ ಏಜೆಂಟರ ಸಮನ್ವಯ',
      ml: 'മിഷൻ ആസൂത്രണവും ഏജന്റുകളുടെ ഏകോപനവും',
      or: 'ମିଶନ୍ ଯୋଜନା ଓ ଏଜେଣ୍ଟ ସମନ୍ୱୟ',
      pa: 'ਮਿਸ਼ਨ ਯੋਜਨਾਬੰਦੀ ਅਤੇ ਏਜੰਟਾਂ ਦਾ ਤਾਲਮੇਲ'
    },
    icon: Compass
  },
  {
    id: 'weather',
    name: 'Weather Agent',
    localName: {
      en: 'Weather Agent',
      hi: 'मौसम एजेंट (Weather Agent)',
      ta: 'வானிலை முகவர் (Weather Agent)',
      te: 'వాతావరణ ఏజెంట్ (Weather Agent)',
      bn: 'আবহাওয়া এজেন্ট (Weather Agent)',
      mr: 'हवामान एजंट (Weather Agent)',
      gu: 'હવામાન એજન્ટ (Weather Agent)',
      kn: 'ಹವಾಮಾನ ಏಜೆಂಟ್ (Weather Agent)',
      ml: 'കാലാവസ്ഥാ ഏജന്റ് (Weather Agent)',
      or: 'ପାଣିପାଗ ଏଜେଣ୍ଟ (Weather Agent)',
      pa: 'ਮੌਸਮ ਏਜੰਟ (Weather Agent)'
    },
    role: {
      en: 'Fetching atmospheric wind speed & temperature telemetry',
      hi: 'वायुमंडलीय हवा की गति और तापमान की जांच',
      ta: 'காற்றின் வேகம் மற்றும் வெப்பநிலை பகுப்பாய்வு',
      te: 'గాలి వేగం మరియు ఉష్ణోగ్రత తనిఖీ',
      bn: 'বাতাসের গতি এবং তাপমাত্রা বিশ্লেষণ',
      mr: 'वाऱ्याचा वेग आणि तापमान विश्लेषण',
      gu: 'પવનની ગતિ અને તાપમાનનું વિશ્લેષણ',
      kn: 'ಗಾಳಿಯ ವೇಗ ಮತ್ತು ತಾಪಮಾನ ವಿಶ್ಲೇಷಣೆ',
      ml: 'കാറ്റിന്റെ വേഗതയും താപനിലയും വിശകലനം',
      or: 'ପବନ ଗତି ଓ ତାପମାତ୍ରା ବିଶ୍ଳେଷଣ',
      pa: 'ਹਵਾ ਦੀ ਗਤੀ ਅਤੇ ਤਾਪਮਾਨ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ'
    },
    icon: CloudSun
  },
  {
    id: 'marine',
    name: 'Marine Agent',
    localName: {
      en: 'Marine Agent',
      hi: 'समुद्री एजेंट (Marine Agent)',
      ta: 'கடல்சார் முகவர் (Marine Agent)',
      te: 'మెరైన్ ఏజెంట్ (Marine Agent)',
      bn: 'সামুদ্রিক এজেন্ট (Marine Agent)',
      mr: 'सागरी एजंट (Marine Agent)',
      gu: 'દરિયાઈ એજન્ટ (Marine Agent)',
      kn: 'ಮೆರಿನ್ ಏಜೆಂಟ್ (Marine Agent)',
      ml: 'മറൈൻ ഏജന്റ് (Marine Agent)',
      or: 'ସାମୁଦ୍ରିକ ଏଜେଣ୍ଟ (Marine Agent)',
      pa: 'ਸਮੁੰਦਰੀ ਏਜੰਟ (Marine Agent)'
    },
    role: {
      en: 'Querying ocean wave heights & sea surface temperature',
      hi: 'समुद्री लहरों की ऊंचाई और जल सतह तापमान की जांच',
      ta: 'கடல் அலை உயரம் மற்றும் கடல் பரப்பு வெப்பநிலை',
      te: 'సముద్ర అలల ఎత్తు మరియు నీటి ఉష్ణోగ్రత',
      bn: 'সমুদ্রের ঢেউয়ের উচ্চতা ও পানির তাপমাত্রা',
      mr: 'सागरी लाटांची उंची आणि पाण्याचे तापमान',
      gu: 'દરિયાઈ મોજાંની ઊંચાઈ અને તાપમાન',
      kn: 'ಸಮುದ್ರದ ಅಲೆಗಳ ಎತ್ತರ ಮತ್ತು ನೀರಿನ ತಾಪಮಾನ',
      ml: 'തിരമാലയുടെ ഉയരവും കടൽ താപനിലയും',
      or: 'ସମୁଦ୍ର ଢେଉ ଉଚ୍ଚତା ଓ ଜଳ ତାପମାତ୍ରା',
      pa: 'ਸਮੁੰਦਰੀ ਲਹਿਰਾਂ ਦੀ ਉਚਾਈ ਅਤੇ ਤਾਪਮਾਨ'
    },
    icon: Waves
  },
  {
    id: 'risk',
    name: 'Risk & Safety Agent',
    localName: {
      en: 'Risk & Safety Agent',
      hi: 'सुरक्षा व जोखिम एजेंट (Risk & Safety Agent)',
      ta: 'பாதுகாப்பு மற்றும் இடர் முகவர் (Safety Agent)',
      te: 'భద్రత మరియు రిస్క్ ఏజెంట్ (Safety Agent)',
      bn: 'নিরাপত্তা ও ঝুঁকি এজেন্ট (Safety Agent)',
      mr: 'सुरक्षा आणि जोखीम एजंट (Safety Agent)',
      gu: 'સુરક્ષા અને જોખમ એજન્ટ (Safety Agent)',
      kn: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಅಪಾಯ ಏಜೆಂಟ್ (Safety Agent)',
      ml: 'സുരക്ഷാ & റിസ്ക് ഏജന്റ് (Safety Agent)',
      or: 'ସୁରକ୍ଷା ଓ ବିପଦ ଏଜେଣ୍ଟ (Safety Agent)',
      pa: 'ਸੁਰੱਖਿਆ ਅਤੇ ਜੋਖਮ ਏਜੰਟ (Safety Agent)'
    },
    role: {
      en: 'Evaluating wave & gale thresholds for fishing safety',
      hi: 'सुरक्षा नियमों व सीमाओं का गहन मूल्यांकन',
      ta: 'மீன்பிடி பாதுகாப்பு விதிகள் மற்றும் வரம்புகளை சரிபார்த்தல்',
      te: 'భద్రతా పరిమితులు మరియు నిబంధనల మూల్యాంకనం',
      bn: 'নিরাপত্তা নিয়মাবলী ও ঝুঁকির পরিমাপ',
      mr: 'सुरक्षा निकष आणि जोखीम मर्यादांचे मूल्यांकन',
      gu: 'સુરક્ષા નિયમો અને જોખમ મર્યાદાઓનું મૂલ્યાંકન',
      kn: 'ಸುರಕ್ಷತಾ ಮಿತಿಗಳು ಮತ್ತು ನಿಯಮಗಳ ಮೌಲ್ಯಮಾಪನ',
      ml: 'സുരക്ഷാ നിയമങ്ങളും പരിധികളും വിലയിരുത്തുന്നു',
      or: 'ସୁରକ୍ଷା ନିୟମ ଓ ବିପଦ ସୀମା ଯାଞ୍ଚ',
      pa: 'ਸੁਰੱਖਿਆ ਨਿਯਮਾਂ ਅਤੇ ਸੀਮਾਵਾਂ ਦਾ ਮੁਲਾਂਕਣ'
    },
    icon: ShieldCheck
  },
  {
    id: 'fisheries',
    name: 'Fisheries Agent',
    localName: {
      en: 'Fisheries Agent',
      hi: 'मत्स्य क्षेत्र एजेंट (Fisheries Agent)',
      ta: 'மீன்பிடி பகுதி முகவர் (Fisheries Agent)',
      te: 'చేపల వేట ఏజెంట్ (Fisheries Agent)',
      bn: 'মৎস্য এলাকা এজেন্ট (Fisheries Agent)',
      mr: 'मत्स्यव्यवसाय एजंट (Fisheries Agent)',
      gu: 'મત્સ્યઉદ્યોગ એજન્ટ (Fisheries Agent)',
      kn: 'ಮೀನುಗಾರಿಕೆ ಏಜೆಂಟ್ (Fisheries Agent)',
      ml: 'ഫിഷറീസ് ഏജന്റ് (Fisheries Agent)',
      or: 'ମତ୍ସ୍ୟ କ୍ଷେତ୍ର ଏଜେଣ୍ଟ (Fisheries Agent)',
      pa: 'ਮੱਛੀ ਪਾਲਣ ਏਜੰਟ (Fisheries Agent)'
    },
    role: {
      en: 'Identifying optimal potential fishing zone coordinates',
      hi: 'सर्वोत्तम संभावित मत्स्य क्षेत्र (PFZ) की खोज',
      ta: 'சிறந்த சாத்தியமான மீன்பிடி பகுதிகளை கண்டறிதல்',
      te: 'ఉత్తమ సంభావ్య చేపల వేట ప్రాంతాన్ని కనుగొనడం',
      bn: 'সেরা মাছ ধরার এলাকা ও স্থানাঙ্ক চিহ্নিতকরণ',
      mr: 'संभाव्य सर्वोत्तम मासेमारी क्षेत्र शोधणे',
      gu: 'શ્રેષ્ઠ સંભવિત માછીમારી વિસ્તાર શોધવો',
      kn: 'ಉತ್ತಮ ಮೀನುಗಾರಿಕಾ ವಲಯವನ್ನು ಗುರುತಿಸುವುದು',
      ml: 'സാധ്യതയുള്ള മികച്ച മത്സ്യബന്ധന മേഖല കണ്ടെത്തുന്നു',
      or: 'ସର୍ବୋତ୍ତମ ମାଛ ଧରିବା ଅଞ୍ଚଳ ଚିହ୍ନଟ',
      pa: 'ਵਧੀਆ ਸੰਭਾਵਿਤ ਮੱਛੀ ਫੜਨ ਵਾਲਾ ਖੇਤਰ ਲੱਭਣਾ'
    },
    icon: Fish
  },
  {
    id: 'geofence',
    name: 'Geofence Guardian Agent',
    localName: {
      en: 'Geofence Guardian Agent',
      hi: 'जियोफेंस गार्डियन एजेंट (Geofence Guardian Agent)',
      ta: 'ஜியோஃபென்ஸ் பாதுகாப்பு முகவர் (Geofence Agent)',
      te: 'జియోఫెన్స్ గార్డియన్ ఏజెంట్ (Geofence Agent)',
      bn: 'জিওফেন্স গার্ডিয়ান এজেন্ট (Geofence Agent)',
      mr: 'जिओफेन्स गार्डियन एजंट (Geofence Agent)',
      gu: 'જીઓફેન્સ ગાર્ડિયન એજન્ટ (Geofence Agent)',
      kn: 'ಜಿಯೋಫೆನ್ಸ್ ಗಾರ್ಡಿಯನ್ ಏಜೆಂಟ್ (Geofence Agent)',
      ml: 'ജിയോഫെൻസ് ഗാർഡിയൻ ഏജന്റ് (Geofence Agent)',
      or: 'ଜିଓଫେନ୍ସ ଗାର୍ଡିଆନ୍ ଏଜେଣ୍ଟ (Geofence Agent)',
      pa: 'ਜੀਓਫੈਂਸ ਗਾਰਡੀਅਨ ਏਜੰਟ (Geofence Agent)'
    },
    role: {
      en: 'Verifying proximity to restricted & marine protected areas',
      hi: 'प्रतिबंधित व संरक्षित समुद्री सीमाओं की जांच',
      ta: 'பாதுகாக்கப்பட்ட மற்றும் தடைசெய்யப்பட்ட கடல் எல்லைகளை சரிபார்த்தல்',
      te: 'రక్షిత మరియు నిషేధిత సముద్ర సరిహద్దుల తనిఖీ',
      bn: 'সংরক্ষিত ও নিষিদ্ধ সামুদ্রিক সীমানা পরীক্ষা',
      mr: 'संरक्षित आणि प्रतिबंधित सागरी सीमांची तपासणी',
      gu: 'પ્રતિબંધિત અને સંરક્ષિત દરિયાઈ સીમાઓની ચકાસણી',
      kn: 'ನಿರ್ಬಂಧಿತ ಮತ್ತು ಸಂರಕ್ಷಿತ ಸಮುದ್ರ ಗಡಿಗಳ ಪರಿಶೀಲನೆ',
      ml: 'സംരക്ഷിതവും നിരോധിതവുമായ സമുദ്ര അതിർത്തികൾ പരിശോധിക്കുന്നു',
      or: 'ନିଷିଦ୍ଧ ଓ ସଂରକ୍ଷିତ ସାମୁଦ୍ରିକ ସୀମା ଯାଞ୍ଚ',
      pa: 'ਪ੍ਰਤੀਬੰਧਿਤ ਅਤੇ ਸੁਰੱਖਿਅਤ ਸਮੁੰਦਰੀ ਹੱਦਾਂ ਦੀ ਜਾਂਚ'
    },
    icon: Anchor
  }
];

export const AgentLoadingIndicator: React.FC<AgentLoadingIndicatorProps> = ({ steps = [] }) => {
  const { language } = useLanguage();

  const activeSteps = steps && steps.length > 0 ? steps : [];
  const totalCount = activeSteps.length > 0 ? activeSteps.length : AGENTS_LIST.length;
  const completedCount = activeSteps.filter((s) => s.status === 'completed').length;
  const runningIdx = activeSteps.findIndex((s) => s.status === 'running');
  const allCompleted = totalCount > 0 && completedCount >= totalCount;

  // Active step index driven by actual incoming steps array
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);

  useEffect(() => {
    if (activeSteps.length === 0) {
      const timer = setInterval(() => {
        setFallbackIndex((prev) => (prev < AGENTS_LIST.length ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeSteps.length]);

  const getIconForStep = (stepId: string, toolName?: string) => {
    const s = `${stepId} ${toolName || ''}`.toLowerCase();
    if (s.includes('planner') || s.includes('mission')) return Compass;
    if (s.includes('weather')) return CloudSun;
    if (s.includes('marine')) return Waves;
    if (s.includes('risk') || s.includes('safety')) return ShieldCheck;
    if (s.includes('fisheries') || s.includes('pfz') || s.includes('species')) return Fish;
    if (s.includes('geofence') || s.includes('boundary')) return Anchor;
    if (s.includes('route') || s.includes('navigate')) return Compass;
    return Cpu;
  };

  return (
    <div
      id="orca-multi-agent-loading-screen"
      className="rounded-lg border border-[#E4DCD0] bg-white p-4 shadow-xs transition-all duration-500 max-w-xl text-[#1C1917]"
    >
      {/* Header with Live Multi-Agent Pulse */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE2D3]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#FAF7F2] border border-[#E4DCD0] flex items-center justify-center text-[#0891B2]">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
              <span>Targeted Agent System Active</span>
              <span className={`w-2 h-2 rounded-full ${allCompleted ? 'bg-[#16A34A]' : 'bg-[#0891B2] animate-ping'} inline-block`} />
            </div>
            <p className="text-[11px] text-[#78716C]">
              {allCompleted
                ? (language === 'hi'
                  ? `${totalCount} चयनित एजेंटों ने विश्लेषण पूरा कर लिया है • अंतिम रिपोर्ट तैयार हो रही है...`
                  : `All ${totalCount} targeted agents complete • Final advisory report being prepared...`)
                : (language === 'hi'
                  ? `प्रश्न के अनुसार ${totalCount} आवश्यक एजेंट सक्रिय किए जा रहे हैं...`
                  : `Deploying ${totalCount} targeted specialists for this question...`)}
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E4DCD0] text-[#0B2545] shrink-0">
          {allCompleted ? `${totalCount} of ${totalCount} Ready` : `${completedCount} of ${totalCount} Ready`}
        </div>
      </div>

      {/* Agents List - Appearing dynamically based on the planned steps */}
      <div className="space-y-2">
        {activeSteps.length > 0 ? (
          activeSteps.map((step) => {
            const Icon = getIconForStep(step.id, step.toolName);
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'running';
            const agentLabel = language === 'hi' && step.hindiAgentName ? step.hindiAgentName : step.agentName;
            const summaryDesc = language === 'hi' && step.hindiSummary ? step.hindiSummary : (step.summary || '');

            return (
              <div
                key={step.id}
                className={`rounded-md p-2.5 transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-[#FAF7F2] border-[#0891B2] shadow-xs'
                    : isCompleted
                    ? 'bg-white border-[#E4DCD0] text-[#44403C]'
                    : 'bg-[#F5EFE6] border-transparent text-[#A8A29E]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Agent Icon and Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-[#0891B2] text-white'
                          : isCompleted
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : 'bg-[#EAE2D3] text-[#78716C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isCurrent
                              ? 'text-[#0B2545]'
                              : isCompleted
                              ? 'text-[#1C1917]'
                              : 'text-[#78716C]'
                          }`}
                        >
                          {agentLabel}
                        </h4>
                      </div>
                      <p className="text-[10.5px] text-[#78716C] truncate max-w-sm">
                        {summaryDesc}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center">
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[10.5px] text-[#D97706] font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin text-[#D97706]" />
                        <span>{language === 'hi' ? 'बफरिंग...' : 'Buffering...'}</span>
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1 text-[11px] text-[#16A34A] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span className="hidden sm:inline">Ready</span>
                      </div>
                    ) : (
                      <span className="text-[10.5px] text-[#A8A29E] font-medium">
                        {language === 'hi' ? 'प्रतीक्षारत' : 'Pending'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Buffering Animated Progress Bar under the Active Agent */}
                {isCurrent && (
                  <div className="mt-2 h-1 w-full bg-[#EAE2D3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0891B2] rounded-full animate-[bufferBar_1.5s_ease-in-out_infinite]"
                      style={{
                        animation: 'bufferBar 1.5s ease-in-out infinite'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          AGENTS_LIST.slice(0, Math.max(1, fallbackIndex)).map((agent, index) => {
            const Icon = agent.icon;
            const isCompleted = index < fallbackIndex;
            const isCurrent = index === fallbackIndex;
            const agentLabel = agent.localName[language] || agent.name;
            const roleDesc = agent.role[language] || agent.role.en;

            return (
              <div
                key={agent.id}
                className={`rounded-md p-2.5 transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-[#FAF7F2] border-[#0891B2] shadow-xs'
                    : isCompleted
                    ? 'bg-white border-[#E4DCD0] text-[#44403C]'
                    : 'bg-[#F5EFE6] border-transparent text-[#A8A29E]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-[#0891B2] text-white'
                          : isCompleted
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : 'bg-[#EAE2D3] text-[#78716C]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#0B2545]' : 'text-[#44403C]'}`}>
                        {agentLabel}
                      </h4>
                      <p className="text-[10.5px] text-[#78716C] truncate max-w-sm">{roleDesc}</p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center">
                    {isCurrent ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[10.5px] text-[#D97706] font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin text-[#D97706]" />
                        <span>Buffering...</span>
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-1 text-[11px] text-[#16A34A] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span className="hidden sm:inline">Ready</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Synthesis status when all agents finish */}
      {allCompleted && (
        <div className="mt-3 pt-2.5 border-t border-[#EAE2D3] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#0B2545] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#0891B2] animate-spin" />
            <span>
              {language === 'hi'
                ? `सभी ${totalCount} चयनित एजेंट तैयार • अंतिम रिपोर्ट संकलित की जा रही है...`
                : `All ${totalCount} targeted agents ready • Synthesizing final advisory...`}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A] text-[10.5px] font-bold font-mono border border-[#BBF7D0] shrink-0">
            {totalCount}/{totalCount} Ready
          </span>
        </div>
      )}

      <style>{`
        @keyframes bufferBar {
          0% { width: 0%; transform: translateX(0%); }
          50% { width: 75%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
