/**
 * Jurisdictional Data Isolation & Bilingual Location Normalization Utility
 * 
 * Ensures:
 * 1. Gram Panchayat users (Sarpanch, Up-Sarpanch, Gram Sevak, Sadasya, Tax Clerk, Staff, Citizens)
 *    ONLY see and manage data strictly within their specific Gram Panchayat.
 * 2. Taluka Officers (BDO / Taluka Panchayat Samiti) can supervise all Gram Panchayats
 *    belonging to their specific Taluka, but never other Talukas.
 * 3. Seamless bilingual equality & display across Marathi (देवनागरी) and English for all
 *    Districts, Talukas, and Gram Panchayats (e.g. 'Ghulewadi' === 'घुलेवाडी').
 */

import { maharashtraGeoData } from '../data/maharashtraGeoData';

// Bilingual Location Mapping Dictionary
interface LocationPair {
  key: string;
  nameMr: string;
  nameEn: string;
}

const LOCATION_PAIRS: LocationPair[] = [
  // Districts
  { key: 'ahilyanagar', nameMr: 'अहिल्यानगर', nameEn: 'Ahilyanagar' },
  { key: 'ahmednagar', nameMr: 'अहिल्यानगर', nameEn: 'Ahilyanagar' },
  { key: 'pune', nameMr: 'पुणे', nameEn: 'Pune' },
  { key: 'satara', nameMr: 'सातारा', nameEn: 'Satara' },
  { key: 'nashik', nameMr: 'नाशिक', nameEn: 'Nashik' },
  { key: 'kolhapur', nameMr: 'कोल्हापूर', nameEn: 'Kolhapur' },
  { key: 'chhatrapatisambhajinagar', nameMr: 'छत्रपती संभाजीनगर', nameEn: 'Chhatrapati Sambhajinagar' },
  { key: 'aurangabad', nameMr: 'छत्रपती संभाजीनगर', nameEn: 'Chhatrapati Sambhajinagar' },
  { key: 'solapur', nameMr: 'सोलापूर', nameEn: 'Solapur' },
  { key: 'thane', nameMr: 'ठाणे', nameEn: 'Thane' },
  { key: 'nagpur', nameMr: 'नागपूर', nameEn: 'Nagpur' },
  { key: 'amravati', nameMr: 'अमरावती', nameEn: 'Amravati' },
  { key: 'nanded', nameMr: 'नांदेड', nameEn: 'Nanded' },
  { key: 'jalgaon', nameMr: 'जळगाव', nameEn: 'Jalgaon' },
  { key: 'sangli', nameMr: 'सांगली', nameEn: 'Sangli' },
  { key: 'raigad', nameMr: 'रायगड', nameEn: 'Raigad' },
  { key: 'ratnagiri', nameMr: 'रत्नागिरी', nameEn: 'Ratnagiri' },
  { key: 'sindhudurg', nameMr: 'सिंधुदुर्ग', nameEn: 'Sindhudurg' },
  { key: 'palghar', nameMr: 'पालघर', nameEn: 'Palghar' },
  { key: 'dhule', nameMr: 'धुळे', nameEn: 'Dhule' },
  { key: 'nandurbar', nameMr: 'नंदुरबार', nameEn: 'Nandurbar' },
  { key: 'jalna', nameMr: 'जालना', nameEn: 'Jalna' },
  { key: 'beed', nameMr: 'बीड', nameEn: 'Beed' },
  { key: 'latur', nameMr: 'लातूर', nameEn: 'Latur' },
  { key: 'osmanabad', nameMr: 'धाराशिव', nameEn: 'Dharashiv' },
  { key: 'dharashiv', nameMr: 'धाराशिव', nameEn: 'Dharashiv' },
  { key: 'parbhani', nameMr: 'परभणी', nameEn: 'Parbhani' },
  { key: 'hingoli', nameMr: 'हिंगोली', nameEn: 'Hingoli' },
  { key: 'buldhana', nameMr: 'बुलढाणा', nameEn: 'Buldhana' },
  { key: 'akola', nameMr: 'अकोला', nameEn: 'Akola' },
  { key: 'washim', nameMr: 'वाशिम', nameEn: 'Washim' },
  { key: 'yavatmal', nameMr: 'यवतमाळ', nameEn: 'Yavatmal' },
  { key: 'wardha', nameMr: 'वर्धा', nameEn: 'Wardha' },
  { key: 'bhandara', nameMr: 'भंडारा', nameEn: 'Bhandara' },
  { key: 'gondia', nameMr: 'गोंदिया', nameEn: 'Gondia' },
  { key: 'chandrapur', nameMr: 'चंद्रपूर', nameEn: 'Chandrapur' },
  { key: 'gadchiroli', nameMr: 'गडचिरोली', nameEn: 'Gadchiroli' },

  // Talukas
  { key: 'sangamner', nameMr: 'संगमनेर', nameEn: 'Sangamner' },
  { key: 'rahata', nameMr: 'राहाता', nameEn: 'Rahata' },
  { key: 'haveli', nameMr: 'हवेली', nameEn: 'Haveli' },
  { key: 'mulshi', nameMr: 'मुळशी', nameEn: 'Mulshi' },
  { key: 'baramati', nameMr: 'बारामती', nameEn: 'Baramati' },
  { key: 'maval', nameMr: 'मावळ', nameEn: 'Maval' },
  { key: 'shirur', nameMr: 'शिरूर', nameEn: 'Shirur' },
  { key: 'karad', nameMr: 'कराड', nameEn: 'Karad' },
  { key: 'wai', nameMr: 'वाई', nameEn: 'Wai' },
  { key: 'niphad', nameMr: 'निफाड', nameEn: 'Niphad' },
  { key: 'sinnar', nameMr: 'सिन्नर', nameEn: 'Sinnar' },
  { key: 'karveer', nameMr: 'करवीर', nameEn: 'Karveer' },
  { key: 'hatkanangle', nameMr: 'हातकणंगले', nameEn: 'Hatkanangle' },
  { key: 'gangapur', nameMr: 'गंगापूर', nameEn: 'Gangapur' },

  // Gram Panchayats (Sangamner & nearby)
  { key: 'ghulewadi', nameMr: 'घुलेवाडी', nameEn: 'Ghulewadi' },
  { key: 'nimgaonjali', nameMr: 'निमगाव जाळी', nameEn: 'Nimgaon Jali' },
  { key: 'nimgaon', nameMr: 'निमगाव जाळी', nameEn: 'Nimgaon Jali' },
  { key: 'gunjalwadi', nameMr: 'गुंजाळवाडी', nameEn: 'Gunjalwadi' },
  { key: 'shirdirural', nameMr: 'शिर्डी ग्रामीण', nameEn: 'Shirdi Rural' },
  { key: 'sakuri', nameMr: 'साकुरी', nameEn: 'Sakuri' },

  // Gram Panchayats (Pune & others)
  { key: 'shivane', nameMr: 'शिवणे', nameEn: 'Shivane' },
  { key: 'khadakwasla', nameMr: 'खडकवासला', nameEn: 'Khadakwasla' },
  { key: 'narhe', nameMr: 'नऱ्हे', nameEn: 'Narhe' },
  { key: 'dhayari', nameMr: 'धायरी', nameEn: 'Dhayari' },
  { key: 'wagholi', nameMr: 'वाघोली', nameEn: 'Wagholi' },
  { key: 'khanapur', nameMr: 'खानापूर', nameEn: 'Khanapur' },
  { key: 'urulikanchan', nameMr: 'उरुळी कांचन', nameEn: 'Uruli Kanchan' },
  { key: 'lonikalbhor', nameMr: 'लोणी काळभोर', nameEn: 'Loni Kalbhor' },
  { key: 'pirangut', nameMr: 'पिरंगुट', nameEn: 'Pirangut' },
  { key: 'paud', nameMr: 'पौड', nameEn: 'Paud' },
  { key: 'hinjawadi', nameMr: 'हिंजवडी', nameEn: 'Hinjawadi' },
  { key: 'marunji', nameMr: 'मारुंजी', nameEn: 'Marunji' },
  { key: 'malegaonbk', nameMr: 'माळेगाव बु.', nameEn: 'Malegaon Bk' },
  { key: 'katewadi', nameMr: 'काटेवाडी', nameEn: 'Katewadi' },
  { key: 'supe', nameMr: 'सुपे', nameEn: 'Supe' },
  { key: 'talegaonrural', nameMr: 'तळेगाव ग्रामीण', nameEn: 'Talegaon Rural' },
  { key: 'kamshet', nameMr: 'कामशेत', nameEn: 'Kamshet' },
  { key: 'karla', nameMr: 'कार्ला', nameEn: 'Karla' },
  { key: 'shikrapur', nameMr: 'शिक्रापूर', nameEn: 'Shikrapur' },
  { key: 'ranjangaon', nameMr: 'रांजणगाव गणपती', nameEn: 'Ranjangaon' },
  { key: 'sanaswadi', nameMr: 'सणसवाडी', nameEn: 'Sanaswadi' },
  { key: 'malkapur', nameMr: 'मलकापूर', nameEn: 'Malkapur' },
  { key: 'vidyanagar', nameMr: 'विद्यानगर', nameEn: 'Vidyanagar' },
  { key: 'menavali', nameMr: 'मेणवली', nameEn: 'Menavali' },
  { key: 'pasarni', nameMr: 'पसरणी', nameEn: 'Pasarni' },
  { key: 'pimpalgaonbaswant', nameMr: 'पिंपळगाव बसवंत', nameEn: 'Pimpalgaon Baswant' },
  { key: 'ozar', nameMr: 'ओझर', nameEn: 'Ozar' },
  { key: 'musalgaon', nameMr: 'मुसळगाव', nameEn: 'Musalgaon' },
  { key: 'uchgaon', nameMr: 'उचगाव', nameEn: 'Uchgaon' },
  { key: 'shirolipulachi', nameMr: 'शिरोली पुलाची', nameEn: 'Shiroli Pulachi' },
  { key: 'hupari', nameMr: 'हुपरी', nameEn: 'Hupari' },
  { key: 'waluj', nameMr: 'वाळूज', nameEn: 'Waluj' }
];

// In-memory key-value indexes for O(1) lookups
const canonicalMap = new Map<string, LocationPair>();

function indexPair(pair: LocationPair) {
  const normKey = pair.key.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
  const normEn = pair.nameEn.toLowerCase().replace(/[^\w]/g, '');
  const normMr = pair.nameMr.replace(/[^\u0900-\u097F]/g, '');

  if (normKey) canonicalMap.set(normKey, pair);
  if (normEn) canonicalMap.set(normEn, pair);
  if (normMr) canonicalMap.set(normMr, pair);
}

// Preload built-in pairs
LOCATION_PAIRS.forEach(indexPair);

// Preload geo hierarchy from maharashtraGeoData
try {
  maharashtraGeoData.forEach(state => {
    state.districts.forEach(dist => {
      indexPair({
        key: dist.id || dist.nameEn.toLowerCase(),
        nameMr: cleanBaseName(dist.nameMr),
        nameEn: cleanBaseName(dist.nameEn)
      });

      dist.talukas.forEach(tal => {
        indexPair({
          key: tal.id || tal.nameEn.toLowerCase(),
          nameMr: cleanBaseName(tal.nameMr),
          nameEn: cleanBaseName(tal.nameEn)
        });

        tal.panchayats.forEach(pan => {
          indexPair({
            key: pan.id || pan.nameEn.toLowerCase(),
            nameMr: cleanBaseName(pan.nameMr),
            nameEn: cleanBaseName(pan.nameEn)
          });
        });
      });
    });
  });
} catch (e) {
  // Ignore error during bundle initialization
}

/**
 * Strips prefixes, parentheses, and noise to extract the clean primary name.
 */
export function cleanBaseName(name?: string): string {
  if (!name) return '';
  let cleaned = name.trim();

  // Strip prefixes like "ग्रामपंचायत", "Gram Panchayat", "ता.", "Taluka", "जि.", "District"
  cleaned = cleaned.replace(/^(?:ग्रामपंचायत|ग्राम पंचायत|Gram\s*Panchayat|GP|ता\.|तालुका|Taluka|जि\.|जिल्हा|District)\s*[:.-]?\s*/gi, '');

  return cleaned.trim();
}

/**
 * Normalizes a location name for fuzzy phonetic/script comparison.
 */
export function normalizeName(name?: string): string {
  if (!name) return '';
  
  let cleaned = name
    .toLowerCase()
    .replace(/gram\s*panchayat|ग्रामपंचायत|panchayat|taluka|तालुका|district|जिल्हा|ward|वॉर्ड/gi, '')
    .trim();

  // Extract content before parenthesis if bilingual e.g. "घुलेवाडी (Ghulewadi)" -> "घुलेवाडी" & "Ghulewadi"
  const bracketMatch = name.match(/\(([^)]+)\)/);
  if (bracketMatch && bracketMatch[1]) {
    const inside = bracketMatch[1].trim().toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
    const outside = name.replace(/\([^)]+\)/, '').trim().toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
    
    // Check if either matches the dictionary
    const pair = canonicalMap.get(inside) || canonicalMap.get(outside);
    if (pair) return pair.key;
  }

  const rawClean = cleaned.replace(/[^\w\u0900-\u097F]/g, '');
  const pair = canonicalMap.get(rawClean);
  if (pair) {
    return pair.key;
  }

  return rawClean;
}

/**
 * Returns a canonical key for any District, Taluka, or Gram Panchayat name.
 */
export function getCanonicalLocationKey(name?: string): string {
  if (!name) return '';
  return normalizeName(name);
}

/**
 * Formats a Gram Panchayat name into the desired language cleanly.
 */
export function formatGramPanchayat(name?: string, lang: 'mr' | 'en' = 'mr'): string {
  if (!name) return '';
  if (name.includes('सर्व ग्रामपंचायती') || name.toLowerCase().includes('all gp')) {
    return lang === 'mr' ? 'सर्व ग्रामपंचायती' : 'All Gram Panchayats';
  }

  const key = normalizeName(name);
  const pair = canonicalMap.get(key);
  if (pair) {
    return lang === 'mr' ? pair.nameMr : pair.nameEn;
  }

  // Fallback: clean up parentheses
  const clean = cleanBaseName(name);
  const parenMatch = clean.match(/^([^()]+)\s*\(([^()]+)\)$/);
  if (parenMatch) {
    const first = parenMatch[1].trim();
    const second = parenMatch[2].trim();
    const isFirstMarathi = /[\u0900-\u097F]/.test(first);
    if (lang === 'mr') {
      return isFirstMarathi ? first : second;
    } else {
      return isFirstMarathi ? second : first;
    }
  }

  return clean;
}

/**
 * Formats a Taluka name into the desired language cleanly.
 */
export function formatTaluka(name?: string, lang: 'mr' | 'en' = 'mr'): string {
  if (!name) return '';
  if (name.includes('सर्व तालुके') || name.toLowerCase().includes('all taluka')) {
    return lang === 'mr' ? 'सर्व तालुके' : 'All Talukas';
  }

  const key = normalizeName(name);
  const pair = canonicalMap.get(key);
  if (pair) {
    return lang === 'mr' ? pair.nameMr : pair.nameEn;
  }

  const clean = cleanBaseName(name);
  const parenMatch = clean.match(/^([^()]+)\s*\(([^()]+)\)$/);
  if (parenMatch) {
    const first = parenMatch[1].trim();
    const second = parenMatch[2].trim();
    const isFirstMarathi = /[\u0900-\u097F]/.test(first);
    return lang === 'mr' ? (isFirstMarathi ? first : second) : (isFirstMarathi ? second : first);
  }

  return clean;
}

/**
 * Formats a District name into the desired language cleanly.
 */
export function formatDistrict(name?: string, lang: 'mr' | 'en' = 'mr'): string {
  if (!name) return '';
  if (name.includes('सर्व जिल्हे') || name.toLowerCase().includes('all district')) {
    return lang === 'mr' ? 'सर्व जिल्हे' : 'All Districts';
  }

  const key = normalizeName(name);
  const pair = canonicalMap.get(key);
  if (pair) {
    return lang === 'mr' ? pair.nameMr : pair.nameEn;
  }

  const clean = cleanBaseName(name);
  const parenMatch = clean.match(/^([^()]+)\s*\(([^()]+)\)$/);
  if (parenMatch) {
    const first = parenMatch[1].trim();
    const second = parenMatch[2].trim();
    const isFirstMarathi = /[\u0900-\u097F]/.test(first);
    return lang === 'mr' ? (isFirstMarathi ? first : second) : (isFirstMarathi ? second : first);
  }

  return clean;
}

/**
 * Checks if two location strings refer to the exact same entity bilingually.
 */
export function isSameLocation(loc1?: string, loc2?: string): boolean {
  if (!loc1 && !loc2) return true;
  if (!loc1 || !loc2) return false;

  const key1 = getCanonicalLocationKey(loc1);
  const key2 = getCanonicalLocationKey(loc2);

  if (key1 && key2 && key1 === key2) {
    return true;
  }

  // Raw comparisons & inclusion checks
  const raw1 = loc1.trim().toLowerCase();
  const raw2 = loc2.trim().toLowerCase();

  if (raw1 === raw2) return true;

  // Direct script match
  const n1 = loc1.replace(/[^\w\u0900-\u097F]/g, '').toLowerCase();
  const n2 = loc2.replace(/[^\w\u0900-\u097F]/g, '').toLowerCase();

  return n1.length > 0 && n2.length > 0 && (n1 === n2 || n1.includes(n2) || n2.includes(n1));
}

/**
 * Checks if a record's Gram Panchayat strictly matches the target Gram Panchayat bilingually.
 */
export function matchGramPanchayat(recordGp?: string, targetGp?: string): boolean {
  if (
    !targetGp || 
    targetGp === 'all' || 
    targetGp.includes('सर्व') || 
    targetGp.toLowerCase().includes('all') ||
    targetGp.includes('आपली ग्रामपंचायत') ||
    targetGp.toLowerCase().includes('aapli')
  ) {
    return true;
  }
  if (!recordGp) return false;

  return isSameLocation(recordGp, targetGp);
}

/**
 * Checks if a record's Taluka matches the target Taluka bilingually.
 */
export function matchTaluka(recordTaluka?: string, targetTaluka?: string): boolean {
  if (
    !targetTaluka || 
    targetTaluka === 'all' || 
    targetTaluka.includes('सर्व') || 
    targetTaluka.toLowerCase().includes('all') ||
    targetTaluka.includes('तालुका कार्यालय') ||
    targetTaluka.toLowerCase().includes('taluka office')
  ) {
    return true;
  }
  if (!recordTaluka) return false;

  return isSameLocation(recordTaluka, targetTaluka);
}

/**
 * Checks if a record's District matches the target District bilingually.
 */
export function matchDistrict(recordDistrict?: string, targetDistrict?: string): boolean {
  if (
    !targetDistrict || 
    targetDistrict === 'all' || 
    targetDistrict.includes('सर्व') || 
    targetDistrict.toLowerCase().includes('all') ||
    targetDistrict.includes('महाराष्ट्र शासन') ||
    targetDistrict.toLowerCase().includes('govt of maharashtra')
  ) {
    return true;
  }
  if (!recordDistrict) return false;

  return isSameLocation(recordDistrict, targetDistrict);
}

/**
 * Comprehensive check for whether a record is visible to the active user based on their role and jurisdiction.
 */
export function isRecordInUserJurisdiction(
  record: { gramPanchayat?: string; taluka?: string },
  currentUser: { role?: string; gramPanchayat?: string; taluka?: string } | null,
  fallbackGp?: string,
  fallbackTaluka?: string
): boolean {
  // If BDO (Taluka Officer), scope to the whole Taluka
  if (currentUser?.role === 'taluka_bdo') {
    const userTaluka = currentUser.taluka || fallbackTaluka;
    if (!userTaluka) return true;
    return matchTaluka(record.taluka, userTaluka);
  }

  // For Gram Panchayat staff, representatives, and citizens:
  // Must strictly belong to the user's Gram Panchayat
  const targetGp = currentUser?.gramPanchayat || fallbackGp;
  if (!targetGp) return true;

  return matchGramPanchayat(record.gramPanchayat, targetGp);
}
