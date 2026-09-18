import logging
from typing import Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from app.services import llm_service, tts_service
from app import config
from app.database import init_db
from app.routes import (
    queues, beds, inventory, city_wide, auth, appointments, heart_predictor,
    billing, monitoring, intake, consultations, audit, ambulance, ai,
    prescriptions, documents, followups, notifications
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database tables and seed mock data
init_db()

app = FastAPI(
    title="CareEase AI & Integrated Hospital Operations Backend", 
    version="2.0.0",
    description="Multi-Portal Healthcare Management Console + MediKiosk AI Clinical Intake + Real-Time Telemetry"
)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon/development. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include hospital operations & portal routers
app.include_router(auth.router)
app.include_router(intake.router)
app.include_router(ai.router)
app.include_router(consultations.router)
app.include_router(appointments.router)
app.include_router(prescriptions.router)
app.include_router(documents.router)
app.include_router(followups.router)
app.include_router(billing.router)
app.include_router(notifications.router)
app.include_router(heart_predictor.router)
app.include_router(queues.router)
app.include_router(beds.router)
app.include_router(inventory.router)
app.include_router(city_wide.router)
app.include_router(monitoring.router)
app.include_router(audit.router)
app.include_router(ambulance.router)

# Real-Time WebSocket endpoint for patient vital streaming
@app.websocket("/ws/monitoring")
async def websocket_monitoring(websocket: WebSocket):
    await monitoring.handle_monitoring_websocket(websocket)


# AI Discharge Assistant schemas
class ExplainRequest(BaseModel):
    summary_json: Dict[str, Any]
    language: str


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    summary_json: Dict[str, Any]
    full_text_context: str
    chat_history: List[ChatMessage]
    user_query: str
    language: str = "English"


@app.get("/")
def read_root():
    return {
        "message": "CareEase AI & Hospital Operations API Gateway",
        "endpoints": {
            "OPD Queues Status": "/api/queues/status",
            "OPD Queues List": "/api/queues/list",
            "Bed Occupancy Status": "/api/beds/status",
            "Bed Occupancy Forecast": "/api/beds/forecast",
            "Inventory Stock Catalog": "/api/inventory/list",
            "Inventory Dispensations": "/api/inventory/dispensations",
            "City Integration Beds": "/api/city-wide/beds",
            "City Integration Queues": "/api/city-wide/queues",
            "City Integration Emergency": "/api/city-wide/emergency-status",
            "City Integration Inventory": "/api/city-wide/inventory",
            "Ambulance Dispatch": "/api/ambulance/dispatch"
        }
    }


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Uploads a PDF or text file, extracts content, and returns the parsed English JSON."""
    try:
        filename = file.filename
        file_type = file.content_type
        logger.info(f"Received file: {filename} of type: {file_type}")
        
        # Read file bytes
        file_bytes = await file.read()
        
        # Parse document
        parsed_data = llm_service.parse_discharge_summary(file_bytes, filename, file_type)
        return parsed_data
        
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Failed to process document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@app.post("/api/explain")
async def explain_document(request: ExplainRequest):
    """Translates the structured summary into the target Indian language."""
    try:
        translated_data = llm_service.explain_in_language(request.summary_json, request.language)
        return translated_data
    except Exception as e:
        logger.error(f"Failed to translate document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@app.post("/api/chat")
async def chat_interaction(request: ChatRequest):
    """Grounded QA conversation about the active document."""
    try:
        # Convert Pydantic chat history models to plain dicts
        history = [{"role": msg.role, "content": msg.content} for msg in request.chat_history]
        
        reply = llm_service.chat_about_document(
            summary_json=request.summary_json,
            full_text_context=request.full_text_context,
            chat_history=history,
            user_query=request.user_query,
            language=request.language
        )
        return {"response": reply}
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed to respond: {str(e)}")


@app.get("/api/tts")
async def text_to_speech(
    text: str = Query(..., description="Text to speak"),
    language: str = Query("English", description="Target language")
):
    """Streams generated MP3 speech for the given text."""
    try:
        audio_stream = tts_service.generate_speech_stream(text, language)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS endpoint failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
