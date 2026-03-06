from fastapi import APIRouter, Depends, HTTPException, status

# import scheme from user
from app.schemas.user import *

# database connection and models
from sqlalchemy.orm import Session
from app.database.db_conn import get_db
from uuid import UUID

from app.schemas.exercise import WorkoutTemplateBase, WorkoutTemplateCreate, WorkoutTemplateInDB, WorkoutTemplateWithExercises
from app.core.security import get_current_active_user

# import user services module form services
from app.services.template_service import TemplateService

temp_router = APIRouter(
    prefix="/v1/templates",
    tags=["Templates"],
)

# ========== TEMPLATE ROUTES ==========

# for accessing the list of workout template
@temp_router.get("/", response_model=List[WorkoutTemplateInDB])
async def get_all_workout_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    difficulty: Optional[str] = None,
    workout_type: Optional[str] = None
):
    response = await TemplateService.get_workout_templates(db, skip, limit, difficulty, workout_type)
    return response

# for accessing  workout template by id
@temp_router.get("/{template_id}", response_model=WorkoutTemplateWithExercises)
async def get_workout_templates(
    template_id: UUID,
    db: Session = Depends(get_db),
):
    response = await TemplateService.get_workout_template_byID(template_id, db)
    return response


# ========== TODO:  Create , Update, Delete template by Admin : TEMPLATE ROUTES ==========

@temp_router.post("/", response_model=WorkoutTemplateInDB, status_code=status.HTTP_201_CREATED)
async def create_workout_template(
    template_data: WorkoutTemplateCreate,
    db: Session = Depends(get_db)
):
    response = await TemplateService.create_workout_temp_admin(template_data, db)
    return response

@temp_router.patch("/{template_id}", response_model=WorkoutTemplateInDB, status_code=status.HTTP_201_CREATED)
async def update_workout_template(
    template_id: UUID,
    template_data: WorkoutTemplateCreate,
    db: Session = Depends(get_db)
):
    response = await TemplateService.update_workout_temp_admin(template_id,template_data, db)
    return response

@temp_router.delete("/templates", status_code=status.HTTP_404_NOT_FOUND)
async def delete_workout_template(
    template_id: UUID,
    db: Session = Depends(get_db)
):
    response = await TemplateService.delete_workout_temp_admin(template_id, db)
    return response