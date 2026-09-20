import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language, CoastalLocation } from '../types';
import {
  TranslationDictionary,
  LanguageMeta,
  LANGUAGES_LIST,
  getTranslation,
  LOCATIONS_I18N
} from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  languages: LanguageMeta[];
  currentLanguageMeta: LanguageMeta;
  getLocationName: (location: CoastalLocation | { id: string; name: string }) => string;
  getStateName: (location: CoastalLocation | { id: string; state: string }) => string;
  getCoastName: (location: CoastalLocation | { id: string; coast: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('orca_language_choice') as Language;
      if (saved && LANGUAGES_LIST.some(l => l.code === saved)) {
        return saved;
      }
    } catch {
      // ignore storage access errors
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('orca_language_choice', lang);
    } catch {
      // ignore storage access errors
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => getTranslation(language), [language]);

  const currentLanguageMeta = useMemo(() => {
    return LANGUAGES_LIST.find(l => l.code === language) || LANGUAGES_LIST[0];
  }, [language]);

  const getLocationName = (location: CoastalLocation | { id: string; name: string }) => {
    if (!location) return '';
    const locMap = LOCATIONS_I18N[language];
    if (locMap && locMap[location.id]) {
      return locMap[location.id].name;
    }
    return location.name;
  };

  const getStateName = (location: CoastalLocation | { id: string; state: string }) => {
    if (!location) return '';
    const locMap = LOCATIONS_I18N[language];
    if (locMap && locMap[location.id]) {
      return locMap[location.id].state;
    }
    return (location as CoastalLocation).state || '';
  };

  const getCoastName = (location: CoastalLocation | { id: string; coast: string }) => {
    if (!location) return '';
    const locMap = LOCATIONS_I18N[language];
    if (locMap && locMap[location.id]) {
      return locMap[location.id].coast;
    }
    return (location as CoastalLocation).coast || '';
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES_LIST,
        currentLanguageMeta,
        getLocationName,
        getStateName,
        getCoastName
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
