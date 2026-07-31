import io
import json
import logging
import re
import os
from typing import Dict, Any, List, Optional
import pypdf
import pdfplumber

from app import config

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients lazily to prevent load errors if keys are missing initially
_gemini_model = None
_qwen_client = None
_ft_model = None
_ft_tokenizer = None

def get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        genai.configure(api_key=config.GEMINI_API_KEY)
        # Using gemini-2.5-flash which is multimodal and fast
        _gemini_model = genai.GenerativeModel('gemini-2.5-flash')
    return _gemini_model

def get_qwen_client():
    global _qwen_client
    if _qwen_client is None:
        from openai import OpenAI
        _qwen_client = OpenAI(
            base_url=config.QWEN_API_BASE,
            api_key=config.QWEN_API_KEY
        )
    return _qwen_client

def get_fine_tuned_model_and_tokenizer():
    global _ft_model, _ft_tokenizer
    if _ft_model is None:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import PeftModel
        
        # Check if local adapter exists
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        project_root = os.path.dirname(app_dir)
        adapter_path = os.path.join(project_root, "models", "qwen-triage-adapter")
        base_model_id = config.LOCAL_FT_BASE_MODEL
        
        logger.info(f"Loading local tokenizer and base model: {base_model_id} on GPU...")
        _ft_tokenizer = AutoTokenizer.from_pretrained(base_model_id, trust_remote_code=True)
        _ft_tokenizer.pad_token = _ft_tokenizer.eos_token
        
        # Load in 4-bit for memory-saving VRAM efficiency
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4"
        )
        
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_id,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
        
        if os.path.exists(adapter_path):
            logger.info(f"Loading local fine-tuned LoRA adapter from: {adapter_path}")
            _ft_model = PeftModel.from_pretrained(base_model, adapter_path)
        else:
            logger.warning(f"LoRA adapter path NOT found at {adapter_path}. Defaulting to base model.")
            _ft_model = base_model
            
    return _ft_model, _ft_tokenizer

def run_local_ft_inference(prompt: str, system_prompt: str = "") -> str:
    import torch
    model, tokenizer = get_fine_tuned_model_and_tokenizer()
    
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    with torch.no_grad():
        generated_ids = model.generate(
            **inputs,
            max_new_tokens=512,
            do_sample=True,
            temperature=0.2,
            pad_token_id=tokenizer.eos_token_id
        )
        
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
    ]
    
    return tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]



def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts all text from a PDF file using pypdf and pdfplumber as fallback."""
    text = ""
    try:
        # Try pdfplumber first as it handles tabular layout better
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    pages_text.append(page_text)
            text = "\n".join(pages_text)
            
        if not text.strip():
            # Fallback to pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            pages_text = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    pages_text.append(page_text)
            text = "\n".join(pages_text)
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        raise ValueError("Failed to parse PDF document. Please ensure it is a valid PDF.")
    
    return text


# Schema definition template for LLM prompts
STRUCTURED_JSON_TEMPLATE = {
    "patient_info": {
        "name": "Patient Name (string or 'Unknown')",
        "age": "Age (string or 'Unknown')",
        "gender": "Gender (string or 'Unknown')",
        "admission_date": "Admission Date (string or 'Unknown')",
        "discharge_date": "Discharge Date (string or 'Unknown')",
        "hospital_name": "Hospital Name (string or 'Unknown')",
        "doctor_name": "Treating Doctor/Consultant (string or 'Unknown')"
    },
    "diagnosis": {
        "condition": "Primary diagnosis/medical condition in medical terms (string)",
        "summary_simple": "A very simple, clear explanation of the diagnosis in plain non-medical English (1-2 sentences)"
    },
    "medicines": [
        {
            "name": "Medicine Name and dosage, e.g. Pantocid 40mg (string)",
            "dosage": "Dosage instructions, e.g. 1 tablet (string)",
            "morning": "True if taken in morning, else False (boolean)",
            "afternoon": "True if taken in afternoon, else False (boolean)",
            "night": "True if taken at night, else False (boolean)",
            "instructions": "Specific intake instructions, e.g. Before food, After food (string)",
            "purpose_simple": "Explain in very simple words what this medicine is for, e.g., 'For stomach acidity', 'To control blood pressure' (string)",
            "duration": "Duration of medication, e.g., 5 days, or Continuous (string)"
        }
    ],
    "diet_and_lifestyle": {
        "allowed": ["List of things patient SHOULD eat or do (array of strings)"],
        "restricted": ["List of things patient MUST AVOID (food, activities, physical strains) (array of strings)"]
    },
    "warning_signs": [
        "List of specific clinical warning signs (red flags) that require immediate return to hospital (array of strings)"
    ],
    "follow_up": {
        "date": "Next follow-up date or timeline, e.g., '1 week later (July 20, 2026)' (string)",
        "instructions": "Specific follow-up instruction, e.g., 'Visit OPD with Blood Report' (string)"
    }
}


def clean_json_string(text: str) -> str:
    """Cleans code blocks, backticks, and extra wrapper strings to isolate JSON content."""
    text = text.strip()
    # Remove markdown code block fences if present
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL | re.IGNORECASE)
    if match:
        text = match.group(1).strip()
    return text


def parse_discharge_summary(file_bytes: bytes, filename: str, file_type: str) -> Dict[str, Any]:
    """Parses raw document bytes into the structured JSON schema using Gemini or Qwen 2.5."""
    extracted_text = ""
    is_pdf = file_type == "application/pdf" or filename.lower().endswith('.pdf')
    
    if is_pdf:
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        # If it's a text file
        try:
            extracted_text = file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            extracted_text = ""

    # Check for empty text (e.g. Scanned PDF / Image)
    if not extracted_text.strip() and config.LLM_PROVIDER != "gemini":
        raise ValueError(
            "The document appears to be a scanned image/PDF. "
            "Local Qwen 2.5 requires text input. Please set LLM_PROVIDER=gemini "
            "in your configuration to use Gemini's native multimodal OCR, or upload a text-readable PDF."
        )

    # Core System Prompt
    system_prompt = (
        "You are an expert clinical assistant. Parse the hospital discharge summary or prescription text "
        "and structure it EXACTLY into the following JSON schema. Ensure all explanations are simplified "
        "so that a non-medical family member can understand them. Translate clinical jargon into plain English terms.\n\n"
        f"JSON Schema Template:\n{json.dumps(STRUCTURED_JSON_TEMPLATE, indent=2)}\n\n"
        "Crucial requirements:\n"
        "1. Return ONLY the raw valid JSON, no introductory or concluding text.\n"
        "2. Do not leave fields empty or null. If something is not mentioned, use 'Not mentioned' or reasonable defaults.\n"
        "3. Simplify medicine purpose to plain English (e.g., 'For diabetes / blood sugar control' instead of 'Antihyperglycemic').\n"
        "4. Categorize medicine timings into morning, afternoon, and night boolean fields."
    )

    if config.LLM_PROVIDER == "gemini":
        try:
            model = get_gemini_model()
            # If Gemini is selected and extracted text is empty, it might be a scanned PDF or image.
            # Gemini-2.5-flash can read images directly.
            if not extracted_text.strip() and not is_pdf:
                # We assume it is an image upload (PNG, JPEG)
                from PIL import Image
                img = Image.open(io.BytesIO(file_bytes))
                response = model.generate_content([system_prompt, img])
            else:
                # For PDF text or normal text
                response = model.generate_content(f"{system_prompt}\n\nDocument Content:\n{extracted_text}")
            
            cleaned_resp = clean_json_string(response.text)
            parsed_data = json.loads(cleaned_resp)
            # Add full text context to cache for RAG
            parsed_data["_full_text_context"] = extracted_text if extracted_text else "Multimodal Image summary parsed by Gemini."
            return parsed_data
            
        except Exception as e:
            logger.error(f"Gemini processing error: {str(e)}")
            raise RuntimeError(f"Gemini processing failed: {str(e)}")
            
    elif config.LLM_PROVIDER == "qwen-local-ft":
        try:
            response_text = run_local_ft_inference(
                prompt=f"Document Content:\n{extracted_text}",
                system_prompt=system_prompt
            )
            cleaned_resp = clean_json_string(response_text)
            parsed_data = json.loads(cleaned_resp)
            parsed_data["_full_text_context"] = extracted_text
            return parsed_data
        except Exception as e:
            logger.error(f"Local Fine-tuned Qwen processing error: {str(e)}")
            raise RuntimeError(f"Local Fine-tuned Qwen processing failed: {str(e)}")
            
    else: # Qwen 2.5 Provider (Ollama or OpenAI-compatible)
        try:
            client = get_qwen_client()
            response = client.chat.completions.create(
                model=config.QWEN_MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Document Content:\n{extracted_text}"}
                ],
                temperature=0.1,
                response_format={"type": "json_object"} if "ollama" not in config.QWEN_API_BASE else None
            )
            cleaned_resp = clean_json_string(response.choices[0].message.content)
            parsed_data = json.loads(cleaned_resp)
            parsed_data["_full_text_context"] = extracted_text
            return parsed_data
            
        except Exception as e:
            logger.error(f"Qwen 2.5 processing error: {str(e)}")
            raise RuntimeError(f"Local Qwen 2.5 processing failed. Ensure Ollama is running and has pulled {config.QWEN_MODEL_NAME}. Error: {str(e)}")


def explain_in_language(summary_json: Dict[str, Any], target_language: str) -> Dict[str, Any]:
    """Translates user-facing summary information into target regional languages."""
    
    # We will strip the private _full_text_context before sending to translation
    cleaned_json = {k: v for k, v in summary_json.items() if not k.startswith('_')}
    
    system_prompt = (
        f"You are an empathetic, bilingual medical health assistant. Translate all the text values in the provided "
        f"discharge summary JSON to {target_language}. Use clear, low-literacy plain language terms suitable for "
        f"non-English speakers in India. Avoid complex translated terminology if simple regional equivalents exist.\n\n"
        f"CRITICAL INSTRUCTIONS:\n"
        f"1. Maintain the EXACT JSON structure, keys, and boolean values. Only translate the string values (e.g. names, simple purposes, instructions, lists).\n"
        f"2. Translate 'Allowed' and 'Restricted' diet items, 'Warning signs', 'Purpose simple', and 'Summary simple'.\n"
        f"3. Return ONLY the valid JSON object, without formatting fences or code wrappers."
    )

    if config.LLM_PROVIDER == "gemini":
        try:
            model = get_gemini_model()
            response = model.generate_content(
                f"{system_prompt}\n\nJSON to translate:\n{json.dumps(cleaned_json, indent=2)}"
            )
            cleaned_resp = clean_json_string(response.text)
            return json.loads(cleaned_resp)
        except Exception as e:
            logger.error(f"Gemini translation error: {str(e)}")
            return cleaned_json  # Fallback to English summary
            
    elif config.LLM_PROVIDER == "qwen-local-ft":
        try:
            response_text = run_local_ft_inference(
                prompt=f"JSON to translate:\n{json.dumps(cleaned_json, indent=2)}",
                system_prompt=system_prompt
            )
            cleaned_resp = clean_json_string(response_text)
            return json.loads(cleaned_resp)
        except Exception as e:
            logger.error(f"Local Fine-tuned Qwen translation error: {str(e)}")
            return cleaned_json
            
    else: # Qwen Provider
        try:
            client = get_qwen_client()
            response = client.chat.completions.create(
                model=config.QWEN_MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"JSON to translate:\n{json.dumps(cleaned_json, indent=2)}"}
                ],
                temperature=0.2,
                response_format={"type": "json_object"} if "ollama" not in config.QWEN_API_BASE else None
            )
            cleaned_resp = clean_json_string(response.choices[0].message.content)
            return json.loads(cleaned_resp)
        except Exception as e:
            logger.error(f"Qwen translation error: {str(e)}")
            return cleaned_json


def chat_about_document(
    summary_json: Dict[str, Any],
    full_text_context: str,
    chat_history: List[Dict[str, str]],
    user_query: str,
    language: str = "English"
) -> str:
    """Performs RAG / grounded question answering based on the document contents, in the target language."""
    
    # Exclude _full_text_context from structured data
    clean_summary = {k: v for k, v in summary_json.items() if not k.startswith('_')}
    
    system_prompt = (
        "You are CareEase AI Companion, an empathetic medical assistant helping a patient understand their discharge instruction.\n"
        "Answer the user's questions strictly using the provided Discharge Summary details. "
        "Explain in simple terms. Answer in the requested language.\n\n"
        "DIRECTIONS:\n"
        "1. Speak directly to the patient/family member. Be reassuring and helpful.\n"
        "2. Ground your answer strictly in the provided summary. If the answer is NOT in the summary, "
        "gently state: 'This is not mentioned in your discharge summary. I recommend consulting your doctor or hospital staff about this.'\n"
        "3. Do NOT hallucinate medical advice. Never prescribe other medications.\n"
        f"4. Output your response in the requested language: {language}.\n\n"
        f"Structured Summary Details:\n{json.dumps(clean_summary, indent=2)}\n\n"
        f"Full Original Document Context (RAG):\n{full_text_context}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for msg in chat_history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_query})

    if config.LLM_PROVIDER == "gemini":
        try:
            model = get_gemini_model()
            # Combine messages into string for simple model compatibility
            msg_history_str = ""
            for msg in messages:
                msg_history_str += f"{msg['role'].upper()}: {msg['content']}\n\n"
            response = model.generate_content(msg_history_str)
            return response.text
        except Exception as e:
            logger.error(f"Gemini chat error: {str(e)}")
            return "Sorry, I am having trouble connecting to my brain. Please try again."
            
    elif config.LLM_PROVIDER == "qwen-local-ft":
        try:
            import torch
            model, tokenizer = get_fine_tuned_model_and_tokenizer()
            text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = tokenizer([text], return_tensors="pt").to(model.device)
            with torch.no_grad():
                generated_ids = model.generate(
                    **inputs,
                    max_new_tokens=256,
                    do_sample=True,
                    temperature=0.3,
                    pad_token_id=tokenizer.eos_token_id
                )
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
            ]
            return tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        except Exception as e:
            logger.error(f"Local Fine-tuned Qwen chat error: {str(e)}")
            return "Sorry, I am having trouble answering right now."
            
    else: # Qwen Provider
        try:
            client = get_qwen_client()
            response = client.chat.completions.create(
                model=config.QWEN_MODEL_NAME,
                messages=messages,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Qwen chat error: {str(e)}")
            return "Sorry, I am having trouble answering right now. Ensure Ollama is running."
