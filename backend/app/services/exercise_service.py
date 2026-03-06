
from fastapi import HTTPException, status

# connection to database and models
from sqlalchemy.orm import Session
from app.database.model import User,Exercise
from uuid import UUID

# import user schemas from schemas

from app.core.logger import logger
import uuid
import datetime


class ExerciseService:

    # ========== Exercise WORKOUT SERVICES ==========
    
    @staticmethod
    async def get_exercise_detail(exercise_id:UUID, db:Session):
        logger.info("Get the exercise detail  process started..")

        # check this exercise detail is exits or not
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()

        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="exercise detail not found."
            )
        
        logger.info("Get the exercise detail process completed")
        return exercise

    @staticmethod
    async def get_all_exercises_list(db:Session):
        logger.info("Get all exercise list process started..")
        exercises = db.query(Exercise).all()
        logger.info("Get all exercise list process completed")
        return exercises
