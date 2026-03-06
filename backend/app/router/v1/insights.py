from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.db_conn import get_db
from app.database.model.user import User
from app.core.security import get_current_active_user
from app.schemas.insights import InsightOverview
from app.services.insight_service import InsightService

insights_router = APIRouter(
    prefix="/v1/insights",
    tags=["Insights"],
)

@insights_router.get("/overview", response_model=InsightOverview, status_code=status.HTTP_200_OK)
async def get_insight_overview(
    days: Optional[int] = 7,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a comprehensive overview of user workout insights, including summary,
    strength progress, muscle balance, and AI recommendations.
    """
    return await InsightService.get_overview(current_user, db, days=days)
