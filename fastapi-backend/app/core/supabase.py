import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("kisan_guru.supabase")

_supabase_client = None

def get_supabase_client():
    """
    Returns an initialized Supabase Python client if credentials exist, else None.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            from supabase import create_client, Client
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase client initialized successfully")
            return _supabase_client
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            return None
    return None

async def check_supabase_health() -> Dict[str, Any]:
    """
    Checks the status of Supabase configuration and connectivity.
    """
    configured = bool(settings.SUPABASE_URL and (settings.SUPABASE_KEY or settings.SUPABASE_DB_URL))
    status_info = {
        "configured": configured,
        "supabase_url": settings.SUPABASE_URL or None,
        "has_anon_key": bool(settings.SUPABASE_KEY),
        "has_db_url": bool(settings.SUPABASE_DB_URL),
        "active_engine": "postgresql" if "postgresql" in settings.database_url else "sqlite",
        "connection_state": "idle"
    }

    if configured and settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            client = get_supabase_client()
            if client:
                status_info["connection_state"] = "connected"
            else:
                status_info["connection_state"] = "misconfigured"
        except Exception as e:
            status_info["connection_state"] = "error"
            status_info["error"] = str(e)
    elif "postgresql" in settings.database_url:
        status_info["connection_state"] = "connected_via_direct_postgres"
    else:
        status_info["connection_state"] = "using_local_sqlite"

    return status_info
