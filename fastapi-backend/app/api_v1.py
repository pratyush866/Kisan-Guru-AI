from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.crop.router import router as crop_router
from app.modules.rental.router import router as rental_router
from app.modules.ai.router import router as ai_router
from app.modules.recommendation.router import router as recommendation_router
from app.modules.pest.router import router as pest_router
from app.modules.irrigation.router import router as irrigation_router

# Core API Version 1 Router Aggregator
api_v1_router = APIRouter()

# Register all vertical feature routers
api_v1_router.include_router(auth_router)
api_v1_router.include_router(crop_router)
api_v1_router.include_router(rental_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(recommendation_router)
api_v1_router.include_router(pest_router)
api_v1_router.include_router(irrigation_router)
