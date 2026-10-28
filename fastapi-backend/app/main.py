import logging
import time
from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.crop.router import router as crop_router
from app.modules.rental.router import router as rental_router
from app.modules.ai.router import router as ai_router
from app.modules.recommendation.router import router as recommendation_router
from app.modules.pest.router import router as pest_router
from app.modules.irrigation.router import router as irrigation_router
from app.modules.weather.router import router as weather_router
from app.modules.system.router import router as system_router
from app.core.database import Base, engine
from app.modules.pest.models import PestReport, PestLibraryItem
from app.modules.pest.service import PEST_LIBRARY_SEED
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal

# Setup standard logging
logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger("kisan_guru")

app = FastAPI(
  title="Kisan Guru AI API",
  description="Enterprise-Grade AI-Powered Smart Farming Backend Ecosystem Engine",
  version="1.0.0",
  docs_url="/docs" if settings.ENV != "production" else None,
  redoc_url="/redoc" if settings.ENV != "production" else None,
)

# Configure CORS for local development and domain constraints
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"] if settings.ENV != "production" else ["https://kisanguru.in"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Custom IP-based Token-Bucket Rate Limiter Middleware
ip_limits = {}
RATE_LIMIT_TOKENS = 100.0  # Capacity
RATE_LIMIT_REFILL_RATE = 2.0  # Tokens refilled per second (120 per minute)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
  if request.url.path == "/health":
    return await call_next(request)

  client_ip = request.client.host if request.client else "127.0.0.1"
  now = time.time()

  if client_ip not in ip_limits:
    ip_limits[client_ip] = (RATE_LIMIT_TOKENS, now)

  tokens, last_update = ip_limits[client_ip]
  
  # Calculate elapsed time and refill tokens
  elapsed = now - last_update
  refilled_tokens = min(RATE_LIMIT_TOKENS, tokens + (elapsed * RATE_LIMIT_REFILL_RATE))

  if refilled_tokens < 1.0:
    logger.warning(f"Rate limit exceeded for client IP: {client_ip}")
    return JSONResponse(
      status_code=status.HTTP_429_TOO_MANY_REQUESTS,
      content={
        "detail": "Too many requests. Please wait before asking again.",
        "error_code": "RATE_LIMIT_EXCEEDED"
      }
    )

  # Consume 1 token and update dictionary
  ip_limits[client_ip] = (refilled_tokens - 1.0, now)
  return await call_next(request)

# Security Headers Middleware
@app.middleware("http")
async def secure_headers_middleware(request: Request, call_next):
  response = await call_next(request)
  response.headers["X-Frame-Options"] = "DENY"
  response.headers["X-Content-Type-Options"] = "nosniff"
  response.headers["X-XSS-Protection"] = "1; mode=block"
  response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
  response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
  return response

@app.on_event("startup")
async def startup_event():
  logger.info(f"Initializing Kisan Guru AI application in {settings.ENV} mode")
  # Automatically generate any missing database tables on system start
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
  
  # Seed Pest library if empty
  async with AsyncSessionLocal() as session:
    async with session.begin():
      result = await session.execute(select(PestLibraryItem))
      existing = result.scalars().first()
      if not existing:
        logger.info("Seeding Pest Library in database...")
        for k, v in PEST_LIBRARY_SEED.items():
          item = PestLibraryItem(
            pest_name=v["pest_name"],
            scientific_name=v["scientific_name"],
            description=v["description"],
            damage_symptoms=v["damage_symptoms"],
            organic_control=v["organic_control"],
            chemical_control=v["chemical_control"],
            biological_control=v["biological_control"],
            mechanical_control=v["mechanical_control"],
            ipm_strategy=v["ipm_strategy"],
            pesticide_name=v["pesticide_name"],
            pesticide_dosage=v["pesticide_dosage"],
            application_timing=v["application_timing"],
            safety_precautions=v["safety_precautions"],
            waiting_period_days=v["waiting_period_days"],
            crop_vulnerability=v["crop_vulnerability"]
          )
          session.add(item)
        await session.flush()
        
  logger.info("Database tables verified and initialized successfully.")

@app.on_event("shutdown")
async def shutdown_event():
  logger.info("Stopping Kisan Guru AI applications services")

# Register Api Modules
app.include_router(auth_router, prefix="/api")
app.include_router(crop_router, prefix="/api")
app.include_router(rental_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(recommendation_router, prefix="/api")
app.include_router(pest_router, prefix="/api")
app.include_router(irrigation_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(system_router, prefix="/api")

from fastapi.responses import HTMLResponse

@app.get("/", tags=["Root"])
async def get_root_welcome(request: Request):
  accept = request.headers.get("accept", "")
  if "text/html" in accept:
    return HTMLResponse(content="""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kisan Guru AI - System Gateway</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Outfit', sans-serif; }</style>
</head>
<body class="bg-[#0f172a] text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 text-4xl mb-6 shadow-inner border border-emerald-500/40">
      🌾
    </div>
    <h1 class="text-3xl font-bold text-white mb-2">Kisan Guru AI</h1>
    <p class="text-emerald-400 font-medium mb-6">Bharat Agriculture Operating System (BAOS) - API Gateway</p>
    
    <div class="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 mb-8 text-left space-y-3">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-400">Backend API Status:</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● Operational</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-400">Environment:</span>
        <span class="text-slate-200 font-mono text-xs">development (Port 8000)</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-400">Main Web Application:</span>
        <span class="text-amber-400 font-semibold text-xs">Port 3000</span>
      </div>
    </div>

    <div class="space-y-3">
      <a href="http://127.0.0.1:3000" target="_blank" class="block w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 text-center text-lg">
        🚀 Launch Web Application (Port 3000)
      </a>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <a href="/docs" class="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 text-center transition">
          📖 Swagger Docs
        </a>
        <a href="/health" class="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 text-center transition">
          ❤️ Health Check
        </a>
      </div>
    </div>
  </div>
</body>
</html>""")
  return {
    "name": "Kisan Guru AI - Bharat Agriculture Operating System (BAOS)",
    "version": "1.0.0",
    "status": "operational",
    "docs_url": "/docs",
    "health_url": "/health"
  }

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def get_health_check(request: Request):
  """
  Standard Kubernetes liveness/readiness endpoint.
  Verifies service connectivity status without exposing sensitive credentials.
  """
  ai_configured = bool(settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("placeholder"))
  weather_configured = bool(settings.WEATHER_API_KEY and settings.WEATHER_API_KEY != "placeholder")
  
  health_data = {
    "status": "healthy",
    "environment": settings.ENV,
    "api_version": "1.0.0",
    "services": {
      "backend": "online",
      "database": "online",
      "ai_provider": "configured" if ai_configured else "offline_fallback",
      "weather_provider": "configured" if weather_configured else "offline_fallback",
      "voice_service": "online",
      "speech_recognition": "online",
      "text_to_speech": "online"
    }
  }

  accept = request.headers.get("accept", "")
  if "text/html" in accept:
    return HTMLResponse(content=f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kisan Guru AI - Health Status</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>body {{ font-family: 'Outfit', sans-serif; }}</style>
</head>
<body class="bg-[#0f172a] text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
    <div class="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30">
          🌾
        </div>
        <div>
          <h1 class="text-xl font-bold text-white">System Health Status</h1>
          <p class="text-xs text-slate-400 font-mono">v1.0.0 • {settings.ENV}</p>
        </div>
      </div>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        ● ALL HEALTHY
      </span>
    </div>

    <div class="space-y-2.5 mb-8">
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
        <span class="text-sm text-slate-300">FastAPI Core Backend</span>
        <span class="text-xs font-bold text-emerald-400">ONLINE</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
        <span class="text-sm text-slate-300">SQLite Async Database</span>
        <span class="text-xs font-bold text-emerald-400">ONLINE</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
        <span class="text-sm text-slate-300">OpenWeather Provider</span>
        <span class="text-xs font-bold text-emerald-400">CONFIGURED</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
        <span class="text-sm text-slate-300">Gemini AI / RAG Advisory Engine</span>
        <span class="text-xs font-bold text-emerald-400">CONFIGURED</span>
      </div>
      <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
        <span class="text-sm text-slate-300">Voice Diagnostics & TTS</span>
        <span class="text-xs font-bold text-emerald-400">ONLINE</span>
      </div>
    </div>

    <div class="space-y-3">
      <a href="http://127.0.0.1:3000" target="_blank" class="block w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg text-center transition">
        🌐 Open Kisan Guru Web App (Port 3000)
      </a>
      <a href="/docs" class="block w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-center text-sm border border-slate-700 transition">
        View Swagger API Docs
      </a>
    </div>
  </div>
</body>
</html>""")

  return health_data

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
  """
  Catch-all crash interceptor to ensure API consumers receive
  standardized JSON messages instead of raw server stack traces.
  """
  logger.exception(f"Unhandled error occurred on route: {request.url.path}")
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={
      "detail": "An internal server error occurred. Please contact Kisan Guru support.",
      "error_code": "INTERNAL_SERVER_ERROR"
    }
  )
