/**
 * Google Translate utility for AuraHealth Multilingual support.
 * Uses the free Google Translate API endpoint.
 * Falls back to original English text silently on error.
 */

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

const _cache = new Map();

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
    const translated = (json[0] || []).map((chunk) => chunk[0] || '').join('') || text;
    _cache.set(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}
