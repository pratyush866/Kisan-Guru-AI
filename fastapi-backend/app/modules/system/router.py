from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import os
import re

from app.core.config import settings
from app.core.database import get_db_session, engine
from app.core.supabase import check_supabase_health, get_supabase_client

router = APIRouter(prefix="/system", tags=["System & Cloud Database"])

class SupabaseConfigRequest(BaseModel):
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    supabase_db_url: Optional[str] = None

class TestConnectionRequest(BaseModel):
    db_url: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

@router.get("/db-status")
async def get_database_status(db: AsyncSession = Depends(get_db_session)):
    """
    Returns real-time database architecture, health, table statistics, and Supabase integration status.
    """
    is_postgres = "postgresql" in settings.database_url
    is_supabase = bool(settings.SUPABASE_URL or ("supabase.co" in settings.database_url))

    counts = {}
    table_names = [
        "users", "crops", "diagnostic_reports", "rental_listings", 
        "rental_bookings", "chat_sessions", "pest_reports", "pest_library"
    ]

    for table in table_names:
        try:
            res = await db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            counts[table] = res.scalar() or 0
        except Exception:
            counts[table] = 0

    supabase_health = await check_supabase_health()

    masked_db_url = settings.database_url
    if "@" in masked_db_url:
        prefix, host = masked_db_url.split("@", 1)
        scheme = prefix.split("://")[0] if "://" in prefix else ""
        masked_db_url = f"{scheme}://****:****@{host}"

    return {
        "status": "healthy",
        "engine": "postgresql" if is_postgres else "sqlite",
        "mode": "Supabase Cloud PostgreSQL" if is_supabase else ("Local PostgreSQL" if is_postgres else "Local SQLite (Offline Resilience)"),
        "is_supabase": is_supabase,
        "database_url_masked": masked_db_url,
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        "supabase_url": settings.SUPABASE_URL or "",
        "table_counts": counts,
        "total_records": sum(counts.values()),
        "supabase_health": supabase_health
    }

@router.post("/test-connection")
async def test_cloud_connection(payload: TestConnectionRequest):
    """
    Tests direct database or Supabase credentials before saving.
    """
    result = {"success": False, "message": ""}
    
    # Test direct Postgres URI if provided
    if payload.db_url:
        test_url = payload.db_url.strip()
        if test_url.startswith("postgresql://"):
            test_url = "postgresql+asyncpg://" + test_url[len("postgresql://"):]
        elif test_url.startswith("postgres://"):
            test_url = "postgresql+asyncpg://" + test_url[len("postgres://"):]
        
        try:
            from sqlalchemy.ext.asyncio import create_async_engine
            test_engine = create_async_engine(test_url, connect_args={"timeout": 5})
            async with test_engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            await test_engine.dispose()
            return {"success": True, "message": "Successfully connected to PostgreSQL database!"}
        except Exception as e:
            return {"success": False, "message": f"Database connection failed: {str(e)}"}

    # Test Supabase API key
    if payload.supabase_url and payload.supabase_key:
        try:
            from supabase import create_client
            client = create_client(payload.supabase_url.strip(), payload.supabase_key.strip())
            # Simple ping
            res = client.auth.get_session()
            return {"success": True, "message": "Successfully authenticated with Supabase Project API!"}
        except Exception as e:
            return {"success": False, "message": f"Supabase auth check failed: {str(e)}"}

    return {"success": False, "message": "Please provide a Database URL or Supabase credentials to test."}

@router.post("/save-db-config")
async def save_database_config(payload: SupabaseConfigRequest):
    """
    Persists Supabase credentials to backend .env file.
    """
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
    
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

    def update_or_add_env(key: str, val: Optional[str]):
        if val is None:
            return
        found = False
        for i, line in enumerate(lines):
            if line.startswith(f"{key}="):
                lines[i] = f"{key}={val}\n"
                found = True
                break
        if not found and val.strip():
            lines.append(f"{key}={val}\n")

    if payload.supabase_url is not None:
        update_or_add_env("SUPABASE_URL", payload.supabase_url.strip())
        settings.SUPABASE_URL = payload.supabase_url.strip()
    if payload.supabase_key is not None:
        update_or_add_env("SUPABASE_KEY", payload.supabase_key.strip())
        settings.SUPABASE_KEY = payload.supabase_key.strip()
    if payload.supabase_db_url is not None:
        update_or_add_env("SUPABASE_DB_URL", payload.supabase_db_url.strip())
        settings.SUPABASE_DB_URL = payload.supabase_db_url.strip()

    try:
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(lines)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist configuration to .env: {str(e)}"
        )

    return {
        "success": True, 
        "message": "Configuration saved successfully. System will utilize Supabase cloud connection.",
        "active_engine": settings.database_url.split("://")[0]
    }
