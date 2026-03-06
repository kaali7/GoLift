from app.database.db_conn import engine
from app.database.model import *
from app.core.logger import logger
from sqlalchemy import text 

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    # startup
    logger.info("🚀 Application Start")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅Database connection successfully")

    except Exception as e:
        logger.error(f"❌Database connection failed: {e}")
        raise

    yield

    # 🔻 Shutdown
    logger.info("🛑 Application shutting down...")
    engine.dispose()
    logger.info("✅ Database connections closed")