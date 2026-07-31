import io
import logging
from gtts import gTTS

logger = logging.getLogger(__name__)

# Map of display language names to standard gTTS locale tags
LANGUAGE_TAGS = {
    "hindi": "hi",
    "tamil": "ta",
    "telugu": "te",
    "kannada": "kn",
    "bengali": "bn",
    "marathi": "mr",
    "malayalam": "ml",
    "english": "en"
}

def generate_speech_stream(text: str, language: str) -> io.BytesIO:
    """Generates an MP3 audio byte stream for the given text and language."""
    lang_lower = language.lower()
    lang_code = LANGUAGE_TAGS.get(lang_lower, "en")
    
    try:
        # Generate speech via gTTS
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Save to an in-memory bytes buffer
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        return mp3_fp
    except Exception as e:
        logger.error(f"gTTS audio generation failed: {str(e)}")
        raise RuntimeError(f"Failed to generate text-to-speech: {str(e)}")
