from fastapi import APIRouter, Depends, HTTPException, status

# import scheme from user
from app.schemas.user import *

# database connection and models
from sqlalchemy.orm import Session
from app.database.db_conn import get_db
from app.database.model.user import User, UserProfile, BodyMeasurement
from uuid import UUID
from app.core.security import get_current_active_user

# schema
from app.schemas.workout import *

# import user services module form services
from app.services.user_service import UserService
from app.services.workout_service import WorkoutService


workout_router = APIRouter(
    prefix="/v1/workout",
    tags=["Workouts"],
)


# ============ USER WORKOUT Routes: get active , active, deactivate ============

# get all workout plan
@workout_router.get("/get_all", status_code=status.HTTP_200_OK)
async def get_all_workout_plan(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    response = await WorkoutService.get_all_user_workout_plan(current_user, db)
    return response

# get active plan of workout
@workout_router.get("/active", status_code=status.HTTP_200_OK)
async def get_current_active_workout_plan(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.get_active_workout_plan(current_user, db)
    return response

# active specific workout plan
@workout_router.post("/{workout_id}/activate", status_code=status.HTTP_201_CREATED)
async def active_workout_plan(
        workout_id: UUID,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.activate_any_workout_plan(workout_id, current_user, db)
    return response

# deactivate specific workout plan
@workout_router.post("/{workout_id}/deactivate", status_code=status.HTTP_201_CREATED)
async def deactivate_workout_plan(
        workout_id: UUID,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.deactivate_any_workout_plan(workout_id, current_user, db)
    return response

# ============ USER WORKOUT Routes: by temp, ml model , user ============
# Create new workout plan from template
@workout_router.post("/temp", status_code=status.HTTP_201_CREATED)
async def create_user_workout_plan_temp(
        template_id:UUID,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.create_user_workout_plan_temp(template_id, current_user, db)
    return response

# TODO: generate a new workout plan from ml model
@workout_router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_workout_plan(
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.create_user_workout_plan_ml(current_user, db)
    return response

# Create new workout plan from user by own
@workout_router.post("/user", status_code=status.HTTP_201_CREATED)
async def generate_workout_plan(
        user_workout: UserWorkoutCreateWithExercises,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.create_user_workout_plan_user(user_workout, current_user, db)
    return response

# ============ USER WORKOUT Routes: get, update, delete any workout plan ============

# get workout plan
@workout_router.get("/{workout_id}", status_code=status.HTTP_200_OK, response_model=UserWorkoutPlanResponse)
async def get_specific_workout_plan(
        workout_id:UUID,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.get_specific_workout_plan(workout_id, current_user, db)
    return response

# update workout plan
@workout_router.put("/{workout_id}", status_code=status.HTTP_201_CREATED)
async def update_workout_plan(
        workout_id:UUID,    
        workout_update:UserWorkoutUpdate,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.update_workout_plan(workout_id, workout_update, current_user, db)
    return response

# delete workout plan
@workout_router.delete("/{workout_id}", status_code=status.HTTP_200_OK)
async def delete_workout_plan(
        workout_id:UUID,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.delete_workout_plan(workout_id, current_user, db)
    return response

# ============ USER WORKOUT EXERCISE Routes: get, update ============

# get exercise list
@workout_router.get("/{workout_id}/exercise", status_code=status.HTTP_200_OK)
async def get_workout_exercise(
        workout_id:UUID,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.get_workout_exercises_list(workout_id, current_user, db)
    return response

# update exercise of workout plan
@workout_router.patch("/{workout_id}/exercise", status_code=status.HTTP_201_CREATED)
async def update_workout_exercise(
        workout_id:UUID,
        exercise_update:List[UserExerciseUpdate],
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.update_workout_exercises_list(workout_id, exercise_update, current_user, db)
    return response

# {exercise_update: set, reps, rest, weight}
# update reps/sets in exercise in workout plan
@workout_router.patch("/{workout_id}/exercise/{exercise_id}", status_code=status.HTTP_201_CREATED)
async def update_exercise_in_workout_plan(
        workout_id:UUID,
        exercise_id:UUID,
        exercise_update:UserExerciseRepsSetUpdate,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    response = await WorkoutService.update_exercise_in_workout_plan(workout_id, exercise_id, exercise_update, current_user, db)
    return response     
