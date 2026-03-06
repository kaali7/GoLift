from fastapi import APIRouter, Depends, HTTPException, status

# import scheme from user
from app.schemas.exercise import *
from app.schemas.workout import SessionWorkoutCompleteInput, SessionExerciseCompleteInput

# database connection and models
from sqlalchemy.orm import Session
from app.database.db_conn import get_db
from app.database.model.user import User
from uuid import UUID
from typing import List

from app.core.security import get_current_active_user

# import user services module form services
from app.services.exercise_service import ExerciseService

exercise_router = APIRouter(
    prefix="/v1/exercise",
    tags=["Exercise"],
)

# ========== Exercise WORKOUT ROUTES ==========

@exercise_router.get("/get", response_model=ExerciseInDB, status_code=status.HTTP_200_OK)
async def get_exercise_detail(
        exercise_id : UUID,
        db: Session = Depends(get_db)
):
    response = await ExerciseService.get_exercise_detail(exercise_id, db)
    return response

@exercise_router.get("/all", response_model=List[ExerciseInDB], status_code=status.HTTP_200_OK)
async def get_all_exercises(
        db: Session = Depends(get_db)
):
    response = await ExerciseService.get_all_exercises_list(db)
    return response
    
