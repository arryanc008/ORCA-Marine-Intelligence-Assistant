import { CoastalLocation, FishSpeciesProbability } from '../types';

export interface RegionalFishCatalog {
  speciesName: string;
  hindiName: string;
  localName: Record<string, string>;
  baseProbability: number;
  optimalTempMin: number;
  optimalTempMax: number;
  seasonTier: 'Peak' | 'High' | 'Moderate';
  depthZone: 'Pelagic (Surface)' | 'Demersal (Mid-depth)' | 'Bottom (Benthic)';
  hindiDepthZone: string;
  commercialValue: 'High' | 'Very High' | 'Medium';
  notes: string;
  hindiNotes: string;
}

// Master catalog of commercial marine fishes across Indian coastal waters
export const INDIAN_MARINE_FISHES: RegionalFishCatalog[] = [
  // Arabian Sea & West Coast Species
  {
    speciesName: 'Indian Mackerel',
    hindiName: 'बांगड़ा (मैकेरल)',
    localName: {
      hi: 'बांगड़ा',
      ta: 'கானாங்கெளுத்தி (Mackerel)',
      te: 'కానగంతలు (Mackerel)',
      ml: 'അയില (Ayila)',
      mr: 'बांगडा (Bangda)',
      gu: 'બાંગડા (Bangda)'
    },
    baseProbability: 88,
    optimalTempMin: 26.5,
    optimalTempMax: 29.5,
    seasonTier: 'Peak',
    depthZone: 'Pelagic (Surface)',
    hindiDepthZone: 'सतही जल (Pelagic)',
    commercialValue: 'High',
    notes: 'Large schooling pelagic fish congregating along warm plankton-rich coastal thermal fronts.',
    hindiNotes: 'प्लवक (प्लैंकटन) से भरपूर सतही गर्म जलधाराओं में बड़े झुंडों में पाई जाती है।'
  },
  {
    speciesName: 'Indian Oil Sardine',
    hindiName: 'तारली / सारडीन',
    localName: {
      hi: 'सारडीन (तारली)',
      ta: 'மத்தி (Mathi)',
      te: 'కవ్వల్లు (Sardines)',
      ml: 'മത്തി / ചാള (Mathi)',
      mr: 'तारली (Tarli)',
      gu: 'તારલી (Tarli)'
    },
    baseProbability: 84,
    optimalTempMin: 26.0,
    optimalTempMax: 29.0,
    seasonTier: 'Peak',
    depthZone: 'Pelagic (Surface)',
    hindiDepthZone: 'सतही जल (Pelagic)',
    commercialValue: 'High',
    notes: 'Forms dense surface shoals near coastal upwelling zones with rich chlorophyll concentration.',
    hindiNotes: 'अपवेलिंग क्षेत्रों में समृद्ध क्लोरोफिल वाली सतही जलधाराओं में विशाल झुंड बनाती है।'
  },
  {
    speciesName: 'Yellowfin Tuna',
    hindiName: 'येलोफिन ट्यूना (टूना)',
    localName: {
      hi: 'ट्यूना',
      ta: 'சூரை (Soorai Tuna)',
      te: 'టూనా (Tuna)',
      ml: 'ചൂര (Choora Tuna)',
      mr: 'कुपा / ट्यूना (Tuna)',
      gu: 'ટ્યુના (Tuna)'
    },
    baseProbability: 76,
    optimalTempMin: 27.0,
    optimalTempMax: 29.8,
    seasonTier: 'High',
    depthZone: 'Pelagic (Surface)',
    hindiDepthZone: 'गहरी समुद्री सतही धारा (Pelagic)',
    commercialValue: 'Very High',
    notes: 'Fast predatory pelagic fish prowling continental shelf edges and thermal front boundaries.',
    hindiNotes: 'महाद्वीपीय शेल्फ ढलान और थर्मल फ्रंट सीमाओं पर घूमने वाली उच्च मूल्यवान शिकारी मछली।'
  },
  {
    speciesName: 'Silver Pomfret',
    hindiName: 'सफेद पापलेट (पॉम्फ्रेट)',
    localName: {
      hi: 'पापलेट',
      ta: 'வவ்வால் (Vavval Pomfret)',
      te: 'చందమామ (Pomfret)',
      ml: 'ആവോലി (Aavoli Pomfret)',
      mr: 'पापलेट (Paplet)',
      gu: 'વીચલો / પાપલેટ (Pomfret)'
    },
    baseProbability: 80,
    optimalTempMin: 26.0,
    optimalTempMax: 28.5,
    seasonTier: 'High',
    depthZone: 'Demersal (Mid-depth)',
    hindiDepthZone: 'मध्यम गहराई जल (Demersal)',
    commercialValue: 'Very High',
    notes: 'Prized table fish found in muddy and sandy continental shelf grounds.',
    hindiNotes: 'रेतीले और दलदली महाद्वीपीय शेल्फ क्षेत्रों में पाई जाने वाली अत्यंत स्वादिष्ट व महंगी मछली।'
  },
  {
    speciesName: 'King Seerfish / Surmai',
    hindiName: 'सुरमई (किंगफिश)',
    localName: {
      hi: 'सुरमई',
      ta: 'வஞ்சிரம் (Vanjaram)',
      te: 'వనజరం / కొణాం (Vanjaram)',
      ml: 'നെയ്മീൻ / അയക്കൂറ (Neymeen)',
      mr: 'सुरमई (Surmai)',
      gu: 'સુરમાઈ (Surmai)'
    },
    baseProbability: 72,
    optimalTempMin: 26.5,
    optimalTempMax: 29.2,
    seasonTier: 'High',
    depthZone: 'Pelagic (Surface)',
    hindiDepthZone: 'तटीय चट्टानी व सतही क्षेत्र',
    commercialValue: 'Very High',
    notes: 'Elite pelagic predator hunting near coastal reefs and current convergence lines.',
    hindiNotes: 'तटीय रीफ और समुद्री धाराओं के मिलन स्थल पर शिकार करने वाली प्रमुख वाणिज्यिक मछली।'
  },
  {
    speciesName: 'Ribbonfish',
    hindiName: 'रिबनफिश (वागटी / सवलाई)',
    localName: {
      hi: 'रिबनफिश',
      ta: 'சவாலை (Savalai)',
      te: 'సావళ్ళ / రిబ్బన్ (Ribbonfish)',
      ml: 'വാള (Vaala)',
      mr: 'वागटी / रिबनफिश',
      gu: 'પટ્ટી / રીબનફિશ'
    },
    baseProbability: 82,
    optimalTempMin: 25.5,
    optimalTempMax: 29.5,
    seasonTier: 'High',
    depthZone: 'Demersal (Mid-depth)',
    hindiDepthZone: 'मध्यम व तलहटी जल',
    commercialValue: 'High',
    notes: 'Abundant in trawl grounds off Andhra Pradesh, Gujarat, and Maharashtra shelves.',
    hindiNotes: 'आंध्र प्रदेश, गुजरात और महाराष्ट्र के ट्रॉलिंग समुद्री क्षेत्रों में प्रचुर मात्रा में उपलब्ध।'
  },
  {
    speciesName: 'Hilsa / Ilish',
    hindiName: 'हिल्सा (इलीश)',
    localName: {
      hi: 'हिल्सा मछली',
      bn: 'ইলিশ (Ilish)',
      or: 'ଇଲିସି (Ilisi)',
      te: 'పులస (Pulasa)',
      ta: 'ஹில்சா (Hilsa)'
    },
    baseProbability: 86,
    optimalTempMin: 26.0,
    optimalTempMax: 29.5,
    seasonTier: 'Peak',
    depthZone: 'Pelagic (Surface)',
    hindiDepthZone: 'डेल्टा व तटीय जल',
    commercialValue: 'Very High',
    notes: 'Legendary prized fish in the northern Bay of Bengal (West Bengal & Odisha waters).',
    hindiNotes: 'उत्तरी बंगाल की खाड़ी (पश्चिम बंगाल व ओडिशा) की सबसे प्रसिद्ध व उच्च मूल्यवान मछली।'
  },
  {
    speciesName: 'Bombay Duck',
    hindiName: 'बोंबिल (बॉम्बे डक)',
    localName: {
      hi: 'बोंबिल',
      mr: 'बोंबील (Bombil)',
      gu: 'બુમલા (Bumla)'
    },
    baseProbability: 85,
    optimalTempMin: 25.0,
    optimalTempMax: 28.5,
    seasonTier: 'Peak',
    depthZone: 'Bottom (Benthic)',
    hindiDepthZone: 'तलहटी क्षेत्र (Benthic)',
    commercialValue: 'High',
    notes: 'Signature coastal bottom dweller of Maharashtra and Gulf of Khambhat (Gujarat).',
    hindiNotes: 'महाराष्ट्र और गुजरात (खंभात की खाड़ी) के तटीय कीचड़दार समुद्री तल की विशिष्ट मछली।'
  },
  {
    speciesName: 'Karikkadi & Tiger Prawns',
    hindiName: 'झींगा / कोलंबी (प्रॉन)',
    localName: {
      hi: 'झींगा (प्रॉन)',
      ta: 'இறால் (Eraal Prawn)',
      te: 'రొయ్యలు (Royyalu)',
      ml: 'ചെമ്മീൻ / കരിക്കാടി (Chemmeen)',
      mr: 'कोळंबी (Kolambi)',
      gu: 'ઝીંગા (Zinga)'
    },
    baseProbability: 78,
    optimalTempMin: 25.5,
    optimalTempMax: 29.0,
    seasonTier: 'High',
    depthZone: 'Bottom (Benthic)',
    hindiDepthZone: 'समुद्री तलहटी (Benthic)',
    commercialValue: 'Very High',
    notes: 'High-value crustacean shoals found in soft sediment continental shelf beds.',
    hindiNotes: 'नरम तलछट वाले महाद्वीपीय शेल्फ क्षेत्रों में मिलने वाला उच्च मूल्यवान समुद्री झींगा।'
  }
];

/**
 * Computes location-specific, water-temperature modulated fish species probabilities.
 */
export function calculateFishSpeciesProbabilities(
  location: CoastalLocation,
  seaSurfaceTemperature: number
): FishSpeciesProbability[] {
  const isBayOfBengal = location.coast === 'Bay of Bengal';
  const stateLower = (location.state || '').toLowerCase();
  const locId = location.id.toLowerCase();

  // Filter candidates relevant to the location's coast/state
  const candidates = INDIAN_MARINE_FISHES.filter((fish) => {
    if (fish.speciesName === 'Hilsa / Ilish') {
      return stateLower.includes('bengal') || stateLower.includes('odisha') || isBayOfBengal;
    }
    if (fish.speciesName === 'Bombay Duck') {
      return stateLower.includes('maharashtra') || stateLower.includes('gujarat');
    }
    if (fish.speciesName === 'Indian Oil Sardine') {
      return !stateLower.includes('bengal'); // Most abundant in West coast & South East
    }
    return true;
  });

  // Calculate modulated probability for each species
  const results: FishSpeciesProbability[] = candidates.map((fish) => {
    let prob = fish.baseProbability;

    // Thermal corridor bonus / penalty
    if (seaSurfaceTemperature >= fish.optimalTempMin && seaSurfaceTemperature <= fish.optimalTempMax) {
      const distFromCenter = Math.abs(seaSurfaceTemperature - (fish.optimalTempMin + fish.optimalTempMax) / 2);
      if (distFromCenter <= 0.8) {
        prob += 4; // Perfect sweet spot
      }
    } else if (seaSurfaceTemperature > fish.optimalTempMax) {
      const excess = seaSurfaceTemperature - fish.optimalTempMax;
      prob -= Math.round(excess * 6); // Fish dive deeper when surface is too warm
    } else if (seaSurfaceTemperature < fish.optimalTempMin) {
      const deficit = fish.optimalTempMin - seaSurfaceTemperature;
      prob -= Math.round(deficit * 5);
    }

    // Local harbor affinity bonus
    if (locId === 'kochi' && (fish.speciesName.includes('Sardine') || fish.speciesName.includes('Mackerel'))) {
      prob += 3;
    } else if (locId === 'mumbai' && (fish.speciesName.includes('Pomfret') || fish.speciesName.includes('Bombay Duck'))) {
      prob += 4;
    } else if (locId === 'chennai' && (fish.speciesName.includes('Seerfish') || fish.speciesName.includes('Tuna'))) {
      prob += 3;
    } else if (locId === 'visakhapatnam' && (fish.speciesName.includes('Ribbonfish') || fish.speciesName.includes('Tuna'))) {
      prob += 4;
    } else if (locId === 'veraval' && (fish.speciesName.includes('Ribbonfish') || fish.speciesName.includes('Pomfret'))) {
      prob += 3;
    }

    // Cap between 40% and 94%
    const boundedProb = Math.min(94, Math.max(40, prob));

    return {
      name: fish.speciesName,
      hindiName: fish.hindiName,
      localName: fish.localName[location.id] || fish.localName.hi || fish.hindiName,
      probability: boundedProb,
      seasonTier: fish.seasonTier,
      depthZone: fish.depthZone,
      hindiDepthZone: fish.hindiDepthZone
    };
  });

  // Sort by highest probability first and return top 5
  results.sort((a, b) => b.probability - a.probability);
  return results.slice(0, 5);
}
