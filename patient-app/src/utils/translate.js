/**
 * Google Translate utility for AuraHealth MediKiosk multilingual support.
 * Uses the free Google Translate API endpoint — no API key required for
 * moderate page-load usage.  Falls back to the original English text
 * silently on any network/parse error so the UI never breaks.
 */

// Map our language display names → Google Translate / BCP-47 codes
export const LANG_CODE_MAP = {
  // ── Indian languages ─────────────────────────────────────
  English:           'en',
  Hindi:             'hi',
  Tamil:             'ta',
  Telugu:            'te',
  Kannada:           'kn',
  Malayalam:         'ml',
  Bengali:           'bn',
  Marathi:           'mr',
  Gujarati:          'gu',
  Punjabi:           'pa',
  Urdu:              'ur',
  Odia:              'or',
  Assamese:          'as',
  Nepali:            'ne',
  Sinhala:           'si',
  Konkani:           'kok',
  Sanskrit:          'sa',
  // ── International languages ──────────────────────────────
  Arabic:            'ar',
  French:            'fr',
  Spanish:           'es',
  German:            'de',
  Portuguese:        'pt',
  Russian:           'ru',
  Japanese:          'ja',
  Korean:            'ko',
  'Chinese (Simplified)':  'zh-CN',
  'Chinese (Traditional)': 'zh-TW',
  Italian:           'it',
  Turkish:           'tr',
  Indonesian:        'id',
  Vietnamese:        'vi',
  Thai:              'th',
  Swahili:           'sw',
  Afrikaans:         'af',
};

// Simple in-memory LRU-style cache: `"text::langCode"` → translated string
const _cache = new Map();

/**
 * Translate a single English string to the target language.
 *
 * @param {string} text      - Source text in English
 * @param {string} langName  - Language name matching LANGUAGES array (e.g. "Hindi")
 * @returns {Promise<string>} Translated string, or original on failure
 */
export async function translateText(text, langName) {
  if (!text || !langName || langName === 'English') return text;
  const langCode = LANG_CODE_MAP[langName];
  if (!langCode || langCode === 'en') return text;

  const cacheKey = `${text}::${langCode}`;
  if (_cache.has(cacheKey)) return _cache.get(cacheKey);

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Response: [ [ ["translated","original"], ... ], ... ]
    const translated = (json[0] || []).map((chunk) => chunk[0] || '').join('') || text;
    _cache.set(cacheKey, translated);
    return translated;
  } catch {
    return text; // always show something
  }
}

/**
 * Translate an array of English strings in parallel.
 *
 * @param {string[]} texts   Array of English strings
 * @param {string} langName  Language name
 * @returns {Promise<string[]>}
 */
export async function translateAll(texts, langName) {
  if (!langName || langName === 'English') return texts;
  return Promise.all(texts.map((t) => translateText(t, langName)));
}

/**
 * Translate an object's string values.
 *
 * @param {Record<string, string>} obj
 * @param {string} langName
 * @returns {Promise<Record<string, string>>}
 */
export async function translateObject(obj, langName) {
  if (!langName || langName === 'English') return obj;
  const entries = Object.entries(obj);
  const translated = await Promise.all(entries.map(([, v]) => translateText(v, langName)));
  return Object.fromEntries(entries.map(([k], i) => [k, translated[i]]));
}
