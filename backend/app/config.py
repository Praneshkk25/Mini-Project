import os
from pathlib import Path
from dotenv import load_dotenv

# Get the path of the current file and find the .env file in parent directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(BASE_DIR, '.env')

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv()  # Fallback to system environment

# Configuration parameters
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "qwen").lower()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Qwen OpenAI-compatible parameters
QWEN_API_BASE = os.getenv("QWEN_API_BASE", "http://localhost:11434/v1")
QWEN_API_KEY = os.getenv("QWEN_API_KEY", "ollama")
QWEN_MODEL_NAME = os.getenv("QWEN_MODEL_NAME", "qwen2.5:14b")

# Local Fine-Tuned checkpoints parameters
LOCAL_FT_BASE_MODEL = os.getenv("LOCAL_FT_BASE_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")

# Validate based on choice
if LLM_PROVIDER == "gemini" and not GEMINI_API_KEY:
    print("Warning: LLM_PROVIDER is set to 'gemini' but GEMINI_API_KEY is not set.")
elif LLM_PROVIDER == "qwen":
    print(f"Using Qwen provider with endpoint: {QWEN_API_BASE} and model: {QWEN_MODEL_NAME}")
elif LLM_PROVIDER == "qwen-local-ft":
    print(f"Using local Hugging Face Qwen fine-tuned model adapter on base: {LOCAL_FT_BASE_MODEL}")

