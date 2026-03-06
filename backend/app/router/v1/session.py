from fastapi import APIRouter, Depends, HTTPException, status

# import scheme from user
from app.schemas.exercise import *
from app.schemas.workout import SessionWorkoutCompleteInput, SessionExerciseCompleteInput

# database connection and models
from sqlalchemy.orm import Session
from app.database.db_conn import get_db
from app.database.model.user import User
from uuid import UUID
from typing import List, Union

from app.core.security import get_current_active_user

# import user services module form services
from app.services.session_service import SessionService

session_router = APIRouter(
    prefix="/v1/session",
    tags=["Sessions"],
)

# ========== SESSION WORKOUT ROUTES ==========

@session_router.get("/active", response_model=Union[List[UserExerciseInDB], dict], status_code=status.HTTP_200_OK)
async def get_workout_plan(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await SessionService.get_current_active_workout_plan(current_user, db)
    return response

@session_router.get("/start", status_code=status.HTTP_200_OK)
async def start_workout_plan(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await SessionService.start_current_active_workout_plan(current_user, db)
    return response

@session_router.post("/complete", status_code=status.HTTP_201_CREATED)
async def complete_workout_plan(
        session_id: UUID,
        user_input: SessionWorkoutCompleteInput,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await SessionService.complete_current_active_workout_plan(session_id,user_input, current_user, db)
    return response

# ========== SESSION EXERCISE and Feedback ROUTES ==========

# future work : TODO: Routes: /{session_id}/{order_id}/start/{set_number}
@session_router.post("/{session_id}/{order_id}/start", response_model=WorkoutPlanExerciseInDB, status_code=status.HTTP_200_OK)
async def get_workout_plan_exercise(
        session_id: UUID,
        order_id: int,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await SessionService.start_current_exercise_workout_plan(session_id,order_id, current_user, db)
    return response

# future work : TODO: Routes: /{session_id}/{order_id}/complete_feedback/{set_number}
@session_router.post("/{exercise_session_id}/complete_feedback", status_code=status.HTTP_200_OK)
async def complete_workout_plan_exercise_feedback(
        exercise_session_id: UUID,
        user_input: SessionExerciseCompleteInput,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await SessionService.complete_sendFeedback_current_exercise_workout_plan(exercise_session_id,user_input,  current_user, db)
    return response
    
