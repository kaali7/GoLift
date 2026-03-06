
from fastapi import HTTPException, status

# connection to database and models
from sqlalchemy.orm import Session
from app.database.model import WorkoutTemplate , TemplateExercise


# import user schemas from schemas
from app.schemas.exercise import WorkoutTemplateBase, WorkoutTemplateCreate, WorkoutTemplateWithExercises
from uuid import UUID


from app.core.logger import logger

class TemplateService:
    
    
    # ============ TEMPLATE SERVICES ============

    @staticmethod
    async def get_workout_templates(db: Session, skip: int = 0, limit: int = 100, difficulty: str = None, workout_type: str = None):
        logger.info("Access the list of workout templates process started")
        # get all the workout from template
        query = db.query(WorkoutTemplate)

        if difficulty:
            query = query.filter(WorkoutTemplate.difficulty_level == difficulty)
        
        if workout_type:
            query = query.filter(WorkoutTemplate.workout_type == workout_type)

        
        templates = query.offset(skip).limit(limit).all()

        logger.info("Access the list of workout templates process end")

        return templates

    @staticmethod
    async def get_workout_template_byID(template_id: UUID,db: Session):
        logger.info("Access the workout of templates process started.. ")
        # get a the workout from template
        template = db.query(WorkoutTemplate).filter(
            WorkoutTemplate.id == template_id,
            # WorkoutTemplate.is_active == True  # TODO: here for future
            ).first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout template not found"
            )
        
        exercises = db.query(TemplateExercise).filter(TemplateExercise.template_id == template_id).all()
        
        template_workout_plan = WorkoutTemplateWithExercises.model_validate(template)
        template_workout_plan.template_exercises = exercises

        logger.info("Access the workout of templates process end")
        return template_workout_plan

    # ============ Create , Update, Delete template by Admin : TEMPLATE SERVICES ============
    @staticmethod
    async def create_workout_temp_admin(template_data: WorkoutTemplateBase ,db: Session):
        pass

    @staticmethod
    async def update_workout_temp_admin(template_id :UUID,template_data:WorkoutTemplateCreate, db:Session):
        pass

    @staticmethod
    async def delete_workout_temp_admin(template_id: UUID,db: Session):
        pass

