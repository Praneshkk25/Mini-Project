import os
from pathlib import Path

# Safe environment loading without hard dependency on python-dotenv
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(BASE_DIR, '.env')

def _load_env_file(filepath: str):
    """Simple parser to load key-value pairs from .env if python-dotenv is not installed."""
    if not os.path.exists(filepath):
        return
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k, v = k.strip(), v.strip()
                    if k and k not in os.environ:
                        os.environ[k] = v.strip('"').strip("'")
    except Exception:
        pass

try:
    from dotenv import load_dotenv
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
    else:
        load_dotenv()
except ImportError:
    _load_env_file(dotenv_path)

# Configuration parameters
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "medgemma").lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Ollama / MedGemma parameters
OLLAMA_API_BASE = os.getenv("OLLAMA_API_BASE", "http://localhost:11434/v1")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "ollama")
MEDGEMMA_MODEL_NAME = os.getenv("MEDGEMMA_MODEL_NAME", "medgemma-aura")

# Qwen parameters (fallback)
QWEN_API_BASE = os.getenv("QWEN_API_BASE", "http://localhost:11434/v1")
QWEN_API_KEY = os.getenv("QWEN_API_KEY", "ollama")
QWEN_MODEL_NAME = os.getenv("QWEN_MODEL_NAME", "qwen2.5:14b")

# Local Fine-Tuned checkpoints parameters
LOCAL_FT_BASE_MODEL = os.getenv("LOCAL_FT_BASE_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")

# Provider logging
if LLM_PROVIDER in ["medgemma", "ollama"]:
    print(f"[INFO] Using MedGemma clinical model with endpoint: {OLLAMA_API_BASE} and model: {MEDGEMMA_MODEL_NAME}")
elif LLM_PROVIDER == "gemini" and not GEMINI_API_KEY:
    print("Warning: LLM_PROVIDER is set to 'gemini' but GEMINI_API_KEY is not set.")
elif LLM_PROVIDER == "qwen":
    print(f"Using Qwen provider with endpoint: {QWEN_API_BASE} and model: {QWEN_MODEL_NAME}")
elif LLM_PROVIDER == "qwen-local-ft":
    print(f"Using local Hugging Face Qwen fine-tuned model adapter on base: {LOCAL_FT_BASE_MODEL}")
