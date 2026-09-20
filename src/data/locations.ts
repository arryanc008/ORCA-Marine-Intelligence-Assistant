import { CoastalLocation } from '../types';

export const COASTAL_LOCATIONS: CoastalLocation[] = [
  {
    id: 'kochi',
    name: 'Kochi',
    hindiName: 'कोच्चि',
    state: 'Kerala',
    hindiState: 'केरल',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 9.9312,
    lon: 76.2673,
    harbor: 'Cochin Fisheries Harbour (Thoppumpady)',
    commonCatches: ['Sardines', 'Mackerel', 'Squid', 'Karikkadi Prawns']
  },
  {
    id: 'chennai',
    name: 'Chennai',
    hindiName: 'चेन्नई',
    state: 'Tamil Nadu',
    hindiState: 'तमिलनाडु',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 13.0827,
    lon: 80.2707,
    harbor: 'Kasimedu Fishing Harbour',
    commonCatches: ['Seer fish (Vanjaram)', 'Tuna', 'White Prawns', 'Crabs']
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    hindiName: 'विशाखापट्टनम',
    state: 'Andhra Pradesh',
    hindiState: 'आंध्र प्रदेश',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 17.6868,
    lon: 83.2185,
    harbor: 'Vizag Fishing Harbour',
    commonCatches: ['Tiger Prawns', 'Ribbon Fish', 'Croaker', 'Yellowfin Tuna']
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    hindiName: 'मुंबई',
    state: 'Maharashtra',
    hindiState: 'महाराष्ट्र',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 19.0760,
    lon: 72.8777,
    harbor: 'Sassoon Docks & Bhaucha Dhakka',
    commonCatches: ['Bombay Duck (Bombil)', 'Silver Pomfret', 'Surmai', 'Jawas Prawns']
  },
  {
    id: 'veraval',
    name: 'Veraval',
    hindiName: 'वेरावल',
    state: 'Gujarat',
    hindiState: 'गुजरात',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 20.9077,
    lon: 70.3667,
    harbor: 'Veraval Major Fishing Port',
    commonCatches: ['Ribbon Fish', 'Croaker (Ghol)', 'Cuttlefish', 'Squid']
  },
  {
    id: 'paradip',
    name: 'Paradip',
    hindiName: 'पारादीप',
    state: 'Odisha',
    hindiState: 'ओडिशा',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 20.3167,
    lon: 86.6167,
    harbor: 'Paradip Fishing Harbour (Mahanadi Mouth)',
    commonCatches: ['Hilsa (Ilish)', 'Pomfret', 'Sea Bream', 'Penaeid Prawns']
  },
  {
    id: 'mangaluru',
    name: 'Mangaluru',
    hindiName: 'मंगलुरु',
    state: 'Karnataka',
    hindiState: 'कर्नाटक',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 12.9141,
    lon: 74.8560,
    harbor: 'Old Port / Bunder Fishing Jetty',
    commonCatches: ['Oil Sardines', 'Indian Mackerel (Bangude)', 'Kingfish', 'Squid']
  },
  {
    id: 'puri',
    name: 'Puri',
    hindiName: 'पुरी',
    state: 'Odisha',
    hindiState: 'ओडिशा',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 19.8135,
    lon: 85.8312,
    harbor: 'Puri Coastal Landing Center / Astaranga',
    commonCatches: ['Anchovies', 'Threadfin Bream', 'Hilsa', 'Prawns']
  },
  {
    id: 'tuticorin',
    name: 'Tuticorin (Thoothukudi)',
    hindiName: 'तूतीकोरिन (थूथुकुडी)',
    state: 'Tamil Nadu',
    hindiState: 'तमिलनाडु',
    coast: 'Bay of Bengal',
    hindiCoast: 'मन्नार की खाड़ी / बंगाल की खाड़ी',
    lat: 8.7642,
    lon: 78.1348,
    harbor: 'Thoothukudi Fishing Harbour (Gulf of Mannar)',
    commonCatches: ['Skipjack Tuna', 'Parrotfish', 'Emperor Fish', 'Crabs']
  },
  {
    id: 'ratnagiri',
    name: 'Ratnagiri',
    hindiName: 'रत्नागिरी',
    state: 'Maharashtra',
    hindiState: 'महाराष्ट्र',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 16.9944,
    lon: 73.3000,
    harbor: 'Mirkarwada Fishing Harbour',
    commonCatches: ['Mackerel', 'Silver Pomfret', 'Lobster', 'Squid']
  },
  {
    id: 'digha',
    name: 'Digha',
    hindiName: 'दीघा',
    state: 'West Bengal',
    hindiState: 'पश्चिम बंगाल',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 21.6270,
    lon: 87.5090,
    harbor: 'Digha Mohana Coastal Fish Auction Center',
    commonCatches: ['Hilsa (Ilish)', 'Bhetki', 'Topse', 'Giant Tiger Prawns']
  },
  {
    id: 'kakinada',
    name: 'Kakinada',
    hindiName: 'काकीनाडा',
    state: 'Andhra Pradesh',
    hindiState: 'आंध्र प्रदेश',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 16.9891,
    lon: 82.2475,
    harbor: 'Kakinada Commercial & Fishing Port (Coringa)',
    commonCatches: ['Scampi', 'Mud Crabs', 'Anchovies', 'Seer Fish']
  },
  {
    id: 'porbandar',
    name: 'Porbandar',
    hindiName: 'पोरबंदर',
    state: 'Gujarat',
    hindiState: 'गुजरात',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 21.6417,
    lon: 69.6293,
    harbor: 'Porbandar All-Weather Fishing Port',
    commonCatches: ['Croakers', 'Ribbonfish', 'Cuttlefish', 'Tuna']
  },
  {
    id: 'karwar',
    name: 'Karwar',
    hindiName: 'कारवार',
    state: 'Karnataka',
    hindiState: 'कर्नाटक',
    coast: 'Arabian Sea',
    hindiCoast: 'अरब सागर',
    lat: 14.8022,
    lon: 74.1297,
    harbor: 'Baithkol Fishing Harbour',
    commonCatches: ['Mackerel', 'Sardine', 'Kingfish', 'Squid']
  },
  {
    id: 'nagapattinam',
    name: 'Nagapattinam',
    hindiName: 'नागापट्टिनम',
    state: 'Tamil Nadu',
    hindiState: 'तमिलनाडु',
    coast: 'Bay of Bengal',
    hindiCoast: 'बंगाल की खाड़ी',
    lat: 10.7672,
    lon: 79.8449,
    harbor: 'Nagapattinam Port & Poompuhar Outflow',
    commonCatches: ['Snappers', 'Barracuda', 'Sardines', 'Tiger Prawns']
  }
];

export const getLocationById = (id: string): CoastalLocation => {
  const found = COASTAL_LOCATIONS.find((loc) => loc.id === id);
  return found || COASTAL_LOCATIONS[0];
};

export const findLocationByName = (text: string): CoastalLocation | undefined => {
  const normalized = text.toLowerCase().trim();
  return COASTAL_LOCATIONS.find((loc) => 
    normalized.includes(loc.name.toLowerCase()) || 
    normalized.includes(loc.id) ||
    normalized.includes(loc.state.toLowerCase()) ||
    normalized.includes(loc.hindiName)
  );
};
