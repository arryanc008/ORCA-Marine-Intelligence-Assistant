import React, { useState, useRef, useEffect } from 'react';
import {
  Anchor,
  Compass,
  ShieldAlert,
  LayoutDashboard,
  Radio,
  Globe,
  Check,
  ChevronDown
} from 'lucide-react';
import { CoastalLocation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  selectedLocation: CoastalLocation;
  hasUnsafeAlert: boolean;
  activeView: 'dashboard' | 'map' | 'fleet';
  onViewChange: (view: 'dashboard' | 'map' | 'fleet') => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLocation,
  hasUnsafeAlert,
  activeView,
  onViewChange
}) => {
  const { language, setLanguage, t, languages, currentLanguageMeta, getLocationName, getStateName } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locName = getLocationName(selectedLocation);
  const locState = getStateName(selectedLocation);

  return (
    <header id="orca-header" className="sticky top-0 z-40 bg-[#0B2545] border-b border-[#13315C] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0891B2] rounded-md flex items-center justify-center text-white shrink-0 shadow-sm">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white uppercase font-sans">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#13315C] border border-[#1E4E8C] rounded text-[10px] text-[#A5C4E7] font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                  <span>{t.liveData}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#8DA9C4] hidden sm:block font-normal">
                {t.appSubtitle} &bull; <span className="text-white font-medium">{locName}</span> ({locState})
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Enterprise software styling) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#06182E] p-1 rounded-md border border-[#13315C]">
            <button
              id="nav-chat-btn"
              onClick={() => onViewChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#0891B2] text-white shadow-xs'
                  : 'text-[#8DA9C4] hover:text-white hover:bg-[#13315C]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t.dashboardView}</span>
            </button>
            <button
              id="nav-map-btn"
              onClick={() => onViewChange('map')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeView === 'map'
                  ? 'bg-[#0891B2] text-white shadow-xs'
                  : 'text-[#8DA9C4] hover:text-white hover:bg-[#13315C]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.mapView}</span>
            </button>
            <button
              id="nav-fleet-btn"
              onClick={() => onViewChange('fleet')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeView === 'fleet'
                  ? 'bg-[#0891B2] text-white shadow-xs'
                  : 'text-[#8DA9C4] hover:text-white hover:bg-[#13315C]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{t.fleetView}</span>
            </button>
          </nav>

          {/* Right Controls: Alert status & Multi-Language Selector Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {hasUnsafeAlert && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#451A1A] border border-[#DC2626] text-[#FCA5A5] text-[11px] font-bold shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-[#FCA5A5] shrink-0" />
                <span>{t.unsafeSeaAlert}</span>
              </div>
            )}

            {/* 11 Indian Languages Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                id="language-selector-btn"
                type="button"
                onClick={() => setIsLangDropdownOpen(prev => !prev)}
                aria-expanded={isLangDropdownOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#13315C] hover:bg-[#1D406E] text-white border border-[#1E4E8C] text-xs font-medium shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-[#0891B2] cursor-pointer"
                title={t.selectLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-[#8DA9C4] shrink-0" />
                <span className="font-semibold text-white">
                  {currentLanguageMeta.nativeName}
                </span>
                <span className="text-[#8DA9C4] text-[11px] hidden sm:inline">
                  ({currentLanguageMeta.name})
                </span>
                <ChevronDown className={`w-3 h-3 text-[#8DA9C4] transition-transform ${isLangDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Language Menu - Light creme card with dark text */}
              {isLangDropdownOpen && (
                <div
                  id="language-dropdown-menu"
                  role="listbox"
                  className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#FFFDF9] border border-[#DDD4C4] rounded-lg shadow-xl p-1.5 z-50 text-xs max-h-96 overflow-y-auto text-[#1C1917]"
                >
                  <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#78716C] border-b border-[#EAE2D3] mb-1 flex items-center justify-between">
                    <span>{t.selectLanguage}</span>
                    <span className="text-[#0891B2] font-mono font-bold">11 Languages</span>
                  </div>

                  <div className="space-y-0.5">
                    {languages.map((item) => {
                      const isSelected = item.code === language;
                      return (
                        <button
                          key={item.code}
                          id={`lang-select-${item.code}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setLanguage(item.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left cursor-pointer ${
                            isSelected
                              ? 'bg-[#E0F2FE] text-[#0284C7] font-bold'
                              : 'text-[#44403C] hover:bg-[#F5EFE6] hover:text-[#0B2545]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold">
                                {item.nativeName}
                              </span>
                              <span className="text-[11px] text-[#78716C]">
                                &bull; {item.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#A8A29E] truncate">
                              {item.region}
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-[#0284C7] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#13315C] text-xs">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              activeView === 'dashboard' ? 'text-white bg-[#0891B2] font-semibold' : 'text-[#8DA9C4]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t.dashboardView}</span>
          </button>
          <button
            onClick={() => onViewChange('map')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              activeView === 'map' ? 'text-white bg-[#0891B2] font-semibold' : 'text-[#8DA9C4]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t.mapView}</span>
          </button>
          <button
            onClick={() => onViewChange('fleet')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              activeView === 'fleet' ? 'text-white bg-[#0891B2] font-semibold' : 'text-[#8DA9C4]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t.fleetView}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
