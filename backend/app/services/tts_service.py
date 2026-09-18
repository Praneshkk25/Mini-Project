import io
import logging
from gtts import gTTS

logger = logging.getLogger(__name__)

# Map of display language names, ISO-639 codes, and BCP-47 prefixes → gTTS locale codes
# Covers all Indian regional languages + major world languages
LANGUAGE_TAGS = {
    # ── Indian languages ──────────────────────────────
    "english":    "en",
    "en":         "en",
    "en-in":      "en",
    "en-us":      "en",
    "en-gb":      "en",

    "hindi":      "hi",
    "hi":         "hi",
    "hi-in":      "hi",

    "tamil":      "ta",
    "ta":         "ta",
    "ta-in":      "ta",
    "ta-lk":      "ta",

    "telugu":     "te",
    "te":         "te",
    "te-in":      "te",

    "kannada":    "kn",
    "kn":         "kn",
    "kn-in":      "kn",

    "bengali":    "bn",
    "bn":         "bn",
    "bn-in":      "bn",
    "bn-bd":      "bn",

    "marathi":    "mr",
    "mr":         "mr",
    "mr-in":      "mr",

    "malayalam":  "ml",
    "ml":         "ml",
    "ml-in":      "ml",

    "gujarati":   "gu",
    "gu":         "gu",
    "gu-in":      "gu",

    "punjabi":    "pa",
    "pa":         "pa",
    "pa-in":      "pa",

    "urdu":       "ur",
    "ur":         "ur",
    "ur-in":      "ur",
    "ur-pk":      "ur",

    "odia":       "bn",        # gTTS has no Odia tag; Bengali is closest supported phonetically
    "or":         "bn",
    "or-in":      "bn",

    "assamese":   "bn",        # gTTS has no Assamese tag; Bengali is closest supported phonetically
    "as":         "bn",
    "as-in":      "bn",

    "nepali":     "ne",
    "ne":         "ne",
    "ne-np":      "ne",

    "sinhala":    "si",
    "si":         "si",
    "si-lk":      "si",

    "konkani":    "hi",        # no dedicated gTTS tag; fallback to Hindi
    "kok":        "hi",

    "sanskrit":   "hi",        # no dedicated gTTS tag; fallback to Hindi
    "sa":         "hi",

    # ── International languages ───────────────────────
    "arabic":       "ar",
    "ar":           "ar",
    "ar-sa":        "ar",

    "french":       "fr",
    "fr":           "fr",
    "fr-fr":        "fr",

    "spanish":      "es",
    "es":           "es",
    "es-es":        "es",

    "german":       "de",
    "de":           "de",
    "de-de":        "de",

    "portuguese":   "pt",
    "pt":           "pt",
    "pt-br":        "pt",
    "pt-pt":        "pt",

    "russian":      "ru",
    "ru":           "ru",
    "ru-ru":        "ru",

    "japanese":     "ja",
    "ja":           "ja",
    "ja-jp":        "ja",

    "korean":       "ko",
    "ko":           "ko",
    "ko-kr":        "ko",

    "chinese (simplified)":  "zh-CN",
    "chinese simplified":    "zh-CN",
    "zh-cn":                 "zh-CN",
    "zh":                    "zh-CN",

    "chinese (traditional)": "zh-TW",
    "chinese traditional":   "zh-TW",
    "zh-tw":                 "zh-TW",

    "italian":      "it",
    "it":           "it",
    "it-it":        "it",

    "turkish":      "tr",
    "tr":           "tr",
    "tr-tr":        "tr",

    "indonesian":   "id",
    "id":           "id",
    "id-id":        "id",

    "vietnamese":   "vi",
    "vi":           "vi",
    "vi-vn":        "vi",

    "thai":         "th",
    "th":           "th",
    "th-th":        "th",

    "swahili":      "sw",
    "sw":           "sw",
    "sw-ke":        "sw",

    "afrikaans":    "af",
    "af":           "af",
}

def resolve_lang_code(language: str) -> str:
    """Resolves a language string (name, code, or locale) to a valid gTTS code."""
    if not language:
        return "en"
    cleaned = language.strip().lower()
    
    # 1. Direct lookup
    if cleaned in LANGUAGE_TAGS:
        return LANGUAGE_TAGS[cleaned]
        
    # 2. Extract base if formatted like "Hindi (हिन्दी)"
    if "(" in cleaned:
        base = cleaned.split("(")[0].strip()
        if base in LANGUAGE_TAGS:
            return LANGUAGE_TAGS[base]
            
    # 3. Extract prefix if formatted like "hi-IN" or "hi_IN"
    base_prefix = cleaned.replace("_", "-").split("-")[0]
    if base_prefix in LANGUAGE_TAGS:
        return LANGUAGE_TAGS[base_prefix]
        
    return "en"

def generate_speech_stream(text: str, language: str) -> io.BytesIO:
    """Generates an MP3 audio byte stream for the given text and language."""
    lang_code = resolve_lang_code(language)
    logger.info(f"Generating TTS for language '{language}' -> resolved code '{lang_code}'")
    
    try:
        # Generate speech via gTTS
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to an in-memory bytes buffer
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        return mp3_fp
    except Exception as e:
        logger.error(f"gTTS audio generation failed for lang '{lang_code}': {str(e)}")
        raise RuntimeError(f"Failed to generate text-to-speech: {str(e)}")
