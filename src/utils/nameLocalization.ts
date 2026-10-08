/**
 * Bilingual Name & Designation Localization Engine
 * 
 * Translates and transliterates Indian/Marathi names, designations, and honorifics
 * seamlessly between English (Latin script) and Marathi (देवनागरी).
 * 
 * Examples:
 * - formatUserName('vaishali somnath gorde', 'mr') => 'वैशाली सोमनाथ गोर्डे'
 * - formatUserName('श्री. अमोल संभाजी पाटील', 'en') => 'Shri. Amol Sambhaji Patil'
 * - formatUserName('roshan', 'mr') => 'रोशन'
 * - formatUserName('श्री. राहुल कदम (लिपिक)', 'en') => 'Shri. Rahul Kadam (Clerk)'
 */

// Common Honorifics and Titles Map
const HONORIFIC_MAP_EN_TO_MR: Record<string, string> = {
  'shri.': 'श्री.',
  'shri': 'श्री.',
  'mr.': 'श्री.',
  'mr': 'श्री.',
  'sau.': 'सौ.',
  'sau': 'सौ.',
  'mrs.': 'सौ.',
  'mrs': 'सौ.',
  'smt.': 'श्रीमती',
  'smt': 'श्रीमती',
  'ku.': 'कु.',
  'miss': 'कु.',
  'dr.': 'डॉ.',
  'dr': 'डॉ.'
};

const HONORIFIC_MAP_MR_TO_EN: Record<string, string> = {
  'श्री.': 'Shri.',
  'श्री': 'Shri.',
  'सौ.': 'Sau.',
  'सौ': 'Sau.',
  'श्रीमती': 'Smt.',
  'श्रीमती.': 'Smt.',
  'कु.': 'Ku.',
  'कु': 'Ku.',
  'डॉ.': 'Dr.',
  'डॉ': 'Dr.'
};

// Common Designation / Role Terms Map
const TERM_MAP_MR_TO_EN: Record<string, string> = {
  'लिपिक': 'Clerk',
  'कर लिपिक': 'Tax Clerk',
  'कर वसुली लिपिक': 'Tax Collection Clerk',
  'सरपंच': 'Sarpanch',
  'उपसरपंच': 'Up-Sarpanch',
  'ग्रामसेवक': 'Gram Sevak',
  'ग्रामविकास अधिकारी': 'Gram Sevak',
  'सदस्य': 'Member',
  'वॉर्ड सदस्य': 'Ward Member',
  'कर्मचारी': 'Staff',
  'गटविकास अधिकारी': 'BDO',
  'मुख्य प्रशासकीय अधिकारी': 'Chief Administrative Officer',
  'मुख्य प्रशासक': 'Super Admin',
  'नागरिक': 'Citizen',
  'लोकप्रतिनिधी': 'Representative',
  'प्रशासन': 'Administration'
};

const TERM_MAP_EN_TO_MR: Record<string, string> = {
  'clerk': 'लिपिक',
  'tax clerk': 'कर लिपिक',
  'sarpanch': 'सरपंच',
  'upsarpanch': 'उपसरपंच',
  'up-sarpanch': 'उपसरपंच',
  'gram sevak': 'ग्रामविकास अधिकारी',
  'gramsevak': 'ग्रामविकास अधिकारी',
  'ward member': 'वॉर्ड सदस्य',
  'member': 'सदस्य',
  'staff': 'कर्मचारी',
  'bdo': 'गटविकास अधिकारी (BDO)',
  'admin': 'ॲडमिन',
  'super admin': 'मुख्य प्रशासक (Super Admin)',
  'citizen': 'नागरिक'
};

// Comprehensive Marathi Name Dictionary (First Names, Middle Names, Surnames)
const NAME_DICTIONARY: [string, string][] = [
  // Specific users
  ['roshan', 'रोशन'],
  ['vaishali', 'वैशाली'],
  ['somnath', 'सोमनाथ'],
  ['gorde', 'गोर्डे'],
  ['amol', 'अमोल'],
  ['sambhaji', 'संभाजी'],
  ['patil', 'पाटील'],
  ['suvarna', 'सुवर्णा'],
  ['dattatray', 'दत्तात्रय'],
  ['dattatreya', 'दत्तात्रय'],
  ['pawar', 'पवार'],
  ['samadhan', 'समाधान'],
  ['vishnu', 'विष्णू'],
  ['thorat', 'थोरात'],
  ['arvind', 'अरविंद'],
  ['deshmukh', 'देशमुख'],
  ['prabhakar', 'प्रभाकर'],
  ['rahul', 'राहुल'],
  ['kadam', 'कदम'],
  ['gunjal', 'गुंजाळ'],
  ['ghule', 'घुले'],

  // Common Surnames
  ['shinde', 'शिंदे'],
  ['jadhav', 'जाधव'],
  ['more', 'मोरे'],
  ['chavan', 'चव्हाण'],
  ['gaikwad', 'गायकवाड'],
  ['kapse', 'कापसे'],
  ['tamboli', 'तांबोळी'],
  ['bhosale', 'भोसले'],
  ['sawant', 'सावंत'],
  ['jagtap', 'जगताप'],
  ['wagh', 'वाघ'],
  ['joshi', 'जोशी'],
  ['kulkarni', 'कुलकर्णी'],
  ['raut', 'राऊत'],
  ['kale', 'काळे'],
  ['mane', 'माने'],
  ['shelar', 'शेलार'],
  ['kharat', 'खरात'],
  ['landge', 'लांडगे'],
  ['phalke', 'फाळके'],
  ['darekar', 'दरेकर'],
  ['dighe', 'दिघे'],
  ['tambe', 'तांबे'],
  ['navale', 'नवले'],
  ['avhad', 'आव्हाड'],
  ['daund', 'दौंड'],
  ['bhor', 'भोर'],
  ['hande', 'हांडे'],
  ['vikhe', 'विखे'],
  ['kute', 'कुटे'],
  ['kotkar', 'कोतकर'],
  ['kokate', 'कोकाटे'],
  ['londhe', 'लोंढे'],
  ['ghadge', 'घाडगे'],
  ['salunke', 'साळुंके'],
  ['sonawane', 'सोनवणे'],
  ['nikam', 'निकम'],
  ['bankar', 'बनकर'],
  ['darade', 'दराडे'],
  ['sangale', 'सांगळे'],
  ['mhaske', 'म्हस्के'],
  ['lahane', 'लहाने'],
  ['handore', 'हांडोरे'],
  ['gite', 'गीते'],
  ['karpe', 'कर्पे'],
  ['lande', 'लांडे'],
  ['kharde', 'खर्डे'],
  ['dhakane', 'ढाकणे'],
  ['borude', 'बोरुडे'],
  ['zaware', 'झावरे'],
  ['fartade', 'फरताडे'],
  ['walunj', 'वाळुंज'],
  ['bhalerao', 'भालेराव'],
  ['gaykar', 'गायकर'],
  ['pote', 'पोटे'],
  ['shirole', 'शिरोळे'],
  ['auti', 'आवटी'],
  ['gholap', 'घोलप'],
  ['korde', 'कोरडे'],
  ['kakade', 'काकडे'],
  ['shelke', 'शेळके'],
  ['nalawade', 'नलवडे'],
  ['khairnar', 'खैरनार'],
  ['pingle', 'पिंगळे'],
  ['dhikale', 'ढिकले'],
  ['kasar', 'कासार'],
  ['bhapkar', 'भापकर'],
  ['walhekar', 'वाल्हेकर'],
  ['wani', 'वाणी'],
  ['bhagat', 'भगत'],
  ['koli', 'कोळी'],
  ['babar', 'बाबर'],
  ['gade', 'गाडे'],
  ['kendre', 'केन्द्रे'],
  ['sharma', 'शर्मा'],
  ['gupta', 'गुप्ता'],
  ['verma', 'वर्मा'],

  // Common First & Middle Names
  ['yash', 'यश'],
  ['sachin', 'सचिन'],
  ['rajesh', 'राजेश'],
  ['suresh', 'सुरेश'],
  ['ramesh', 'रमेश'],
  ['ganesh', 'गणेश'],
  ['mahesh', 'महेश'],
  ['vijay', 'विजय'],
  ['ajay', 'अजय'],
  ['sanjay', 'संजय'],
  ['anil', 'अनिल'],
  ['sunil', 'सुनील'],
  ['deepak', 'दीपक'],
  ['dipak', 'दीपक'],
  ['prashant', 'प्रशांत'],
  ['prakash', 'प्रकाश'],
  ['santosh', 'संतोष'],
  ['sandip', 'संदीप'],
  ['sandeep', 'संदीप'],
  ['manoj', 'मनोज'],
  ['nitin', 'नितीन'],
  ['vikas', 'विकास'],
  ['pravin', 'प्रवीण'],
  ['praveen', 'प्रवीण'],
  ['nilesh', 'निलेश'],
  ['sagar', 'सागर'],
  ['pritam', 'प्रीतम'],
  ['tushar', 'तुषार'],
  ['swapnil', 'स्वप्नील'],
  ['yogesh', 'योगेश'],
  ['rohan', 'रोहन'],
  ['akshay', 'अक्षय'],
  ['suraj', 'सूरज'],
  ['chetan', 'चेतन'],
  ['kiran', 'किरण'],
  ['vishal', 'विशाल'],
  ['mayur', 'मयूर'],
  ['rohit', 'रोहित'],
  ['abhishek', 'अभिषेक'],
  ['aditya', 'आदित्य'],
  ['shubham', 'शुभम'],
  ['omkar', 'ओंकार'],
  ['tanmay', 'तन्मय'],
  ['sanket', 'संकेत'],
  ['pratik', 'प्रतीक'],
  ['sourabh', 'सौरभ'],
  ['saurabh', 'सौरभ'],
  ['aniket', 'अनिकेत'],
  ['ashish', 'आशिष'],
  ['amit', 'अमित'],
  ['sumit', 'सुमित'],
  ['kunal', 'कुणाल'],
  ['akash', 'आकाश'],
  ['kavita', 'कविता'],
  ['sunita', 'सुनिता'],
  ['anita', 'अनिता'],
  ['pooja', 'पूजा'],
  ['puja', 'पूजा'],
  ['priya', 'प्रिया'],
  ['snehal', 'स्नेहल'],
  ['shital', 'शीतल'],
  ['sheetal', 'शीतल'],
  ['archana', 'अर्चना'],
  ['rupali', 'रूपाली'],
  ['swati', 'स्वाती'],
  ['ashwini', 'अश्विनी'],
  ['priyanka', 'प्रियंका'],
  ['manisha', 'मनीषा'],
  ['sangita', 'संगीता'],
  ['sangeeta', 'संगीता'],
  ['rekha', 'रेखा'],
  ['shobha', 'शोभा'],
  ['radha', 'राधा'],
  ['geeta', 'गीता'],
  ['gita', 'गीता'],
  ['seema', 'सीमा'],
  ['komal', 'कोमल'],
  ['neha', 'नेहा'],
  ['payal', 'पायल'],
  ['dipali', 'दिपाली'],
  ['deepali', 'दिपाली'],
  ['jyoti', 'ज्योती'],
  ['sharda', 'शारदा'],
  ['savita', 'सविता'],
  ['meena', 'मीना'],
  ['sarika', 'सारिका'],
  ['urmila', 'उर्मिला'],
  ['mangal', 'मंगल'],
  ['vandana', 'वंदना'],
  ['pushpa', 'पुष्पा'],
  ['lata', 'लता'],
  ['pratibha', 'प्रतिभा'],
  ['vidya', 'विद्या'],
  ['tanvi', 'तन्वी'],
  ['pallavi', 'पल्लवी'],
  ['sneha', 'स्नेहा'],
  ['sonali', 'सोनाली']
];

// Bidirectional maps
const enToMrMap = new Map<string, string>();
const mrToEnMap = new Map<string, string>();

NAME_DICTIONARY.forEach(([en, mr]) => {
  enToMrMap.set(en.toLowerCase(), mr);
  mrToEnMap.set(mr, capitalize(en));
});

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Checks if a string contains Devanagari characters.
 */
export function isMarathiScript(str?: string): boolean {
  if (!str) return false;
  return /[\u0900-\u097F]/.test(str);
}

/**
 * Phonetic Latin -> Devanagari Transliteration Fallback
 */
export function transliterateLatinToDevanagari(text: string): string {
  if (!text) return '';

  const consonants: Record<string, string> = {
    kh: 'ख', gh: 'घ', ch: 'च', chh: 'छ', jh: 'झ', th: 'थ', dh: 'ध', ph: 'फ', bh: 'भ', sh: 'श',
    k: 'क', g: 'ग', j: 'ज', t: 'त', d: 'द', n: 'न', p: 'प', b: 'ब', m: 'म', y: 'य', r: 'र',
    l: 'ल', v: 'व', w: 'व', s: 'स', h: 'ह', z: 'झ'
  };

  const matras: Record<string, string> = {
    aa: 'ा', ee: 'ी', oo: 'ू', ai: 'ै', au: 'ौ',
    a: '', i: 'ि', u: 'ु', e: 'े', o: 'ो'
  };

  const vowels: Record<string, string> = {
    aa: 'आ', ee: 'ई', oo: 'ऊ', ai: 'ऐ', au: 'औ',
    a: 'अ', i: 'इ', u: 'उ', e: 'ए', o: 'ओ'
  };

  let word = text.toLowerCase().trim();
  let result = '';
  let i = 0;

  while (i < word.length) {
    // Check 3-char
    const tri = word.slice(i, i + 3);
    if (tri === 'chh') {
      result += 'छ';
      i += 3;
      continue;
    }

    // Check 2-char consonants
    const duo = word.slice(i, i + 2);
    if (consonants[duo]) {
      result += consonants[duo];
      i += 2;
      // Check for attached vowel
      const vDuo = word.slice(i, i + 2);
      if (matras[vDuo] !== undefined) {
        result += matras[vDuo];
        i += 2;
      } else if (matras[word[i]] !== undefined) {
        result += matras[word[i]];
        i += 1;
      }
      continue;
    }

    // Check 1-char consonant
    const single = word[i];
    if (consonants[single]) {
      result += consonants[single];
      i += 1;
      // Check attached vowel
      const vDuo = word.slice(i, i + 2);
      if (matras[vDuo] !== undefined) {
        result += matras[vDuo];
        i += 2;
      } else if (matras[word[i]] !== undefined) {
        result += matras[word[i]];
        i += 1;
      }
      continue;
    }

    // Standalone vowel
    const vowDuo = word.slice(i, i + 2);
    if (vowels[vowDuo]) {
      result += vowels[vowDuo];
      i += 2;
      continue;
    }
    if (vowels[single]) {
      result += vowels[single];
      i += 1;
      continue;
    }

    result += single;
    i++;
  }

  return result;
}

/**
 * Phonetic Devanagari -> Latin Transliteration Fallback
 */
export function transliterateDevanagariToLatin(text: string): string {
  if (!text) return '';

  const devanagariMap: Record<string, string> = {
    'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo', 'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au', 'अं': 'An',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l', 'क्ष': 'ksh', 'ज्ञ': 'dny',
    'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', '्': ''
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += devanagariMap[char] || char;
  }

  return result;
}

/**
 * Formats an individual word or name component.
 */
function formatSingleNameWord(word: string, targetLang: 'mr' | 'en'): string {
  const cleanWord = word.trim();
  if (!cleanWord) return '';

  const lower = cleanWord.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');

  if (targetLang === 'mr') {
    // English -> Marathi
    if (HONORIFIC_MAP_EN_TO_MR[lower]) return HONORIFIC_MAP_EN_TO_MR[lower];
    if (TERM_MAP_EN_TO_MR[lower]) return TERM_MAP_EN_TO_MR[lower];
    if (enToMrMap.has(lower)) return enToMrMap.get(lower)!;
    if (isMarathiScript(cleanWord)) return cleanWord;
    return transliterateLatinToDevanagari(cleanWord);
  } else {
    // Marathi -> English
    if (HONORIFIC_MAP_MR_TO_EN[cleanWord]) return HONORIFIC_MAP_MR_TO_EN[cleanWord];
    if (TERM_MAP_MR_TO_EN[cleanWord]) return TERM_MAP_MR_TO_EN[cleanWord];
    if (mrToEnMap.has(cleanWord)) return mrToEnMap.get(cleanWord)!;
    if (!isMarathiScript(cleanWord)) return capitalize(cleanWord);
    return capitalize(transliterateDevanagariToLatin(cleanWord));
  }
}

/**
 * Main User Name Localization Function
 * 
 * Given any user name (Marathi or English, with honorifics, titles, or brackets):
 * Returns clean name in the requested language ('mr' | 'en').
 */
export function formatUserName(name?: string, lang: 'mr' | 'en' = 'mr'): string {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  // Handle special administrative accounts
  if (trimmed.includes('Super Admin') || trimmed.includes('मुख्य प्रशासक') || trimmed.includes('System Administrator')) {
    return lang === 'mr' ? 'मुख्य प्रशासकीय अधिकारी (Super Admin)' : 'Chief Administrative Officer (Super Admin)';
  }
  if (trimmed.includes('BDO') || trimmed.includes('गटविकास अधिकारी')) {
    const personName = trimmed.replace(/\(BDO\)|\(गटविकास अधिकारी\)/gi, '').trim();
    const formattedPerson = formatNameTokens(personName, lang);
    return lang === 'mr' ? `${formattedPerson} (BDO)` : `${formattedPerson} (BDO)`;
  }

  return formatNameTokens(trimmed, lang);
}

function formatNameTokens(text: string, lang: 'mr' | 'en'): string {
  // Check if string contains parentheses e.g. "श्री. राहुल कदम (लिपिक)"
  const bracketMatch = text.match(/\(([^)]+)\)/);
  let bracketContent = '';
  let mainText = text;

  if (bracketMatch) {
    bracketContent = bracketMatch[1].trim();
    mainText = text.replace(/\([^)]+\)/, '').trim();
  }

  // Tokenize main text
  const tokens = mainText.split(/\s+/).filter(Boolean);
  const formattedTokens = tokens.map(token => formatSingleNameWord(token, lang));

  let finalName = formattedTokens.join(' ');

  // Format bracket content if present
  if (bracketContent) {
    let localizedBracket = bracketContent;
    if (lang === 'mr') {
      localizedBracket = TERM_MAP_EN_TO_MR[bracketContent.toLowerCase()] || bracketContent;
    } else {
      localizedBracket = TERM_MAP_MR_TO_EN[bracketContent] || bracketContent;
    }
    finalName += ` (${localizedBracket})`;
  }

  return finalName;
}

/**
 * Formats designation strings cleanly based on language.
 */
export function formatDesignation(designation?: string, lang: 'mr' | 'en' = 'mr'): string {
  if (!designation) return '';
  const clean = designation.trim();

  if (clean.toLowerCase().includes('sarpanch') || clean.includes('सरपंच')) {
    return lang === 'mr' ? 'सरपंच (Gram Panchayat Head)' : 'Sarpanch (Gram Panchayat Head)';
  }
  if (clean.toLowerCase().includes('upsarpanch') || clean.includes('उपसरपंच')) {
    return lang === 'mr' ? 'उपसरपंच (Deputy Head)' : 'Up-Sarpanch (Deputy Head)';
  }
  if (clean.toLowerCase().includes('gram sevak') || clean.includes('ग्रामसेवक') || clean.includes('ग्रामविकास')) {
    return lang === 'mr' ? 'ग्रामविकास अधिकारी (Gram Sevak)' : 'Village Development Officer (Gram Sevak)';
  }
  if (clean.toLowerCase().includes('bdo') || clean.includes('गटविकास')) {
    return lang === 'mr' ? 'गटविकास अधिकारी (BDO - Taluka)' : 'Block Development Officer (BDO)';
  }
  if (clean.toLowerCase().includes('clerk') || clean.includes('लिपिक')) {
    return lang === 'mr' ? 'कर वसुली लिपिक (Tax Clerk)' : 'Tax Assessment & Collection Clerk';
  }
  if (clean.toLowerCase().includes('member') || clean.includes('सदस्य')) {
    return lang === 'mr' ? 'वॉर्ड प्रतिनिधी (Ward Member)' : 'Ward Representative (Member)';
  }
  if (clean.toLowerCase().includes('citizen') || clean.includes('नागरिक')) {
    return lang === 'mr' ? 'नोंदणीकृत नागरिक (Citizen)' : 'Registered Citizen (Resident)';
  }

  return formatUserName(clean, lang);
}
