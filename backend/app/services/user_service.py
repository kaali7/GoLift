
from fastapi import HTTPException, status

# connection to database and models
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.model import User, UserProfile, BodyMeasurement, UserProgress, WorkoutSession, Exercise

# import user schemas from schemas
from app.schemas.user import *


from app.core.logger import logger
import uuid

class UserService:
    
    
    # ============ USER ACCOUNT SERVICES ============

    @staticmethod
    async def update_user(user_input:UserUpdate, current_user:User, db:Session):
        logger.info("User update process started")
        # Update user
        logger.info(f"Starting update for user ID: {current_user.id}")
        user = db.query(User).filter(User.id == current_user.id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found."
            )
        
        # Convert Pydantic model to dict, excluding None values
        update_data = user_input.dict(exclude_unset=True)

        # Update only provided fields
        for field, value in update_data.items():
            if value is not None and hasattr(user, field):
                setattr(user, field, value)

        db.commit()
        db.refresh(user)
        logger.info(f"User updated: {user.email}")
        return user 

    @staticmethod
    async def delete_user(current_user:User, db:Session):
        logger.info("User delete process started")
        # Delete user
        user = db.query(User).filter(User.id == current_user.id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found."
            )
        
        # Option: Hard delete
        db.query(User).filter(User.id == current_user.id).delete()
        db.commit()
        logger.info(f"User account deleted: {current_user.id}")
        return True

    # ============ USER PROFILE SERVICES ============

    @staticmethod
    async def get_user_profile(current_user:UserProfile, db:Session):

        logger.info("User profile information getting process start")
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found."
            )

        return UserProfileInDB.model_validate(user_profile)

    @staticmethod
    async def create_user_profile(user_input:UserProfileBase, current_user:User, db:Session):
        logger.info("User profile creation process started")
        # Check if profile already exists
        existing_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile already exists for this user."
            )

        # create a new profile
        profile_data = user_input.model_dump()
        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=current_user.id,
            **profile_data
        )

        db.add(profile)
        db.commit()
        db.refresh(profile)
        logger.info(f"Profile created for user: {current_user.id}")
        return profile

    @staticmethod
    async def update_user_profile(user_input:UserProfileUpdate, current_user:User, db:Session):
        logger.info("User profile update process started")
        # Retrieve user profile
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found."
            )

        # update the data of profile
        update_data = user_input.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None and hasattr(user_profile, field):
                setattr(user_profile, field, value)

      
        db.commit()
        db.refresh(user_profile)
        logger.info(f"Profile updated for user: {current_user.id}")
        return user_profile

    # ============ BODY METRIC SERVICES ============

    @staticmethod
    async def get_user_body_metrics(current_user:BodyMeasurementBase, db:Session):

        logger.info("User user Body Metric information getting process start")
        user_body_metric = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).first()

        if not user_body_metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User Body Metric not found."
            )

        return BodyMeasurementInDB.model_validate(user_body_metric)
    
    @staticmethod
    async def create_user_body_metrics(user_input:BodyMeasurementBase, current_user:User, db:Session):
        logger.info("User Body Metric creation process started")
        # Check if Body Metric already exists
        existing_body_metric = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).first()

        if existing_body_metric:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Body Metric already exists for this user."
            )

        # create a new Body Metric
        body_metric_data = user_input.model_dump()
        body_metric = BodyMeasurement(
            id=uuid.uuid4(),
            user_id=current_user.id,
            **body_metric_data
        )

        db.add(body_metric)
        db.commit()
        db.refresh(body_metric)
        logger.info(f"Body Metric created for user: {current_user.id}")
        return body_metric

    @staticmethod
    async def update_user_body_metrics(user_input:BodyMeasurementUpdate, current_user:User, db:Session):
        logger.info("User Body Metric update process started")
        # Retrieve user Body Metric
        user_body_metric = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).first()

        if not user_body_metric:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User Body Metric not found."
            )

        # update the data of profile
        update_data = user_input.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None and hasattr(user_body_metric, field):
                setattr(user_body_metric, field, value)

      
        db.commit()
        db.refresh(user_body_metric)
        logger.info(f"Body Metric updated for user: {current_user.id}")
        return user_body_metric

    @staticmethod
    async def get_insights(current_user:User, db:Session):
        logger.info(f"Generating insights for user: {current_user.id}")
        
        # 1. Calculate Total Workouts
        total_workouts = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.status == "completed"
        ).count()

        # 2. Calculate Total Weight Lifted
        total_volume = db.query(func.sum(UserProgress.training_volume_kg)).filter(
            UserProgress.user_id == current_user.id
        ).scalar() or 0.0

        # 3. Get Top Exercises with names
        top_progress = db.query(
            UserProgress.exercise_id,
            Exercise.name.label("exercise_name"),
            UserProgress.one_rep_max_kg,
            UserProgress.training_volume_kg,
            UserProgress.personal_record_date
        ).join(Exercise, UserProgress.exercise_id == Exercise.id).filter(
            UserProgress.user_id == current_user.id
        ).order_by(UserProgress.training_volume_kg.desc()).limit(5).all()

        # 4. Get Recent Progress
        recent_progress = db.query(
            UserProgress.exercise_id,
            Exercise.name.label("exercise_name"),
            UserProgress.one_rep_max_kg,
            UserProgress.training_volume_kg,
            UserProgress.personal_record_date
        ).join(Exercise, UserProgress.exercise_id == Exercise.id).filter(
            UserProgress.user_id == current_user.id
        ).order_by(UserProgress.updated_at.desc()).limit(5).all()

        logger.info("Insights generation complete")
        return {
            "total_workouts": total_workouts,
            "total_weight_lifted_kg": float(total_volume),
            "top_exercises": top_progress,
            "recent_progress": recent_progress
        }
    




