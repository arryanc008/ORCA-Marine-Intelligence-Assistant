import { Language } from '../types';
import { TranslationDictionary, LanguageMeta } from './types';
import { en } from './en';
import { hi } from './hi';
import { ta } from './ta';
import { te } from './te';
import { bn } from './bn';
import { mr } from './mr';
import { gu } from './gu';
import { kn } from './kn';
import { ml } from './ml';
import { or } from './or';
import { pa } from './pa';
import { EXTENDED_TRANSLATIONS } from './extendedI18n';

export * from './types';
export * from './locationsI18n';
export * from './extendedI18n';

export const LANGUAGES_LIST: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', region: 'All India' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'North / Central' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu & Puducherry' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra Pradesh' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra & Goa' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala & Lakshadweep' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'North' }
];

const enrich = (base: any, lang: Language): TranslationDictionary => {
  return {
    ...base,
    ...EXTENDED_TRANSLATIONS[lang]
  };
};

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: enrich(en, 'en'),
  hi: enrich(hi, 'hi'),
  ta: enrich(ta, 'ta'),
  te: enrich(te, 'te'),
  bn: enrich(bn, 'bn'),
  mr: enrich(mr, 'mr'),
  gu: enrich(gu, 'gu'),
  kn: enrich(kn, 'kn'),
  ml: enrich(ml, 'ml'),
  or: enrich(or, 'or'),
  pa: enrich(pa, 'pa')
};

export const getTranslation = (lang: Language): TranslationDictionary => {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
};
