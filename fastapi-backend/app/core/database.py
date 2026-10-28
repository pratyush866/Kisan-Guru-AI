from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Compatibility shim for older aiosqlite builds used in local development.
try:
    import aiosqlite.core
    if not hasattr(aiosqlite.core.Connection, "create_function"):
        async def _create_function(self, *args, **kwargs):
            return None

        aiosqlite.core.Connection.create_function = _create_function
except Exception:
    pass

# Configure async engine with pooled limits and connection recycling
if settings.database_url.startswith("sqlite"):
    engine = create_async_engine(
        settings.database_url,
        echo=settings.DEBUG,
        pool_pre_ping=True
    )
else:
    engine = create_async_engine(
        settings.database_url,
        echo=settings.DEBUG,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_recycle=1800,
        pool_pre_ping=True
    )

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Base class for declarative mapping
Base = declarative_base()

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency utility to yield connection pools per HTTP request.
    Rolls back automatically in the event of unhandled transactional errors.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
