
from fastapi import HTTPException, status

# connection to database and models
from sqlalchemy.orm import Session
from app.database.model import User, WorkoutTemplate, UserWorkoutPlan , UserWorkouts, TemplateExercise, UserExercise, WorkoutSession
from uuid import UUID

# import user schemas from schemas
from app.schemas.user import *
from app.schemas.workout import UserExerciseUpdate, UserExerciseBase, UserWorkoutPlanResponse, UserExerciseInDB


from app.core.logger import logger
import uuid
import datetime

# another service help 
from app.services.template_service import TemplateService


class WorkoutService:
    
    
    # ============ USER WORKOUT PLAN ACCOUNT SERVICES ===========

    # get all workout plan
    @staticmethod
    async def get_all_user_workout_plan(current_user:User, db:Session):
        logger.info("Accessing all workout plan process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id).all()

        if not workout_plan:
            return []
        
        logger.info("Accessing all workout plan process completed")
        return workout_plan

    # get active workout plan
    @staticmethod
    async def get_active_workout_plan(current_user:User, db:Session):
        logger.info("Accessing workout plan process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.status == "active").first()

        if not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="There is no active Workout Plan"
            )
        
        logger.info("Accessing workout plan process completed")
        return workout_plan
    
    # activate any workout plan  by workout id
    @staticmethod
    async def activate_any_workout_plan(workout_id:UUID, current_user:User, db:Session):
        logger.info("Active any workout plan process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.status == "active").first()
        if workout_plan:
            workout_plan.status = "deactivate"

        new_workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.id == workout_id).first()
        if not new_workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
            )
        new_workout_plan.status = "active"

        db.commit()
        
        logger.info("Active any workout plan process completed")
        return new_workout_plan

    # deactivate any workout plan by workout id
    @staticmethod
    async def deactivate_any_workout_plan(workout_id, current_user:User, db:Session):
        logger.info("Deactivate any workout plan process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.id == workout_id).first()
        if not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
            )
        workout_plan.status = "deactivate"

        db.commit()
        
        logger.info("Deactivate any workout plan process completed")
        return workout_plan

    # ============ USER WORKOUT Services: by temp, ml model , user ============

    # create workout plan by using Templates workout
    @staticmethod
    async def create_user_workout_plan_temp(template_id:UUID, current_user:User, db:Session):
        logger.info("Create workout plan by using Templates workout process started..")
        # check this workout is exits or not
        workout_temp = await TemplateService.get_workout_template_byID(template_id, db)

        logger.info("Checking is there workout plan or name is exist or not....")
        user_workout_plan_name = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.name == workout_temp.name).first()
        user_workout_plan_temp_id = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.template_id == template_id).first()
        if user_workout_plan_name or user_workout_plan_temp_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workout plan name and templated  already exists."
            )
        
        logger.info("Create copy of template workout plan process...")
        # create user workout (this will hold the editable exercises)
        user_workout = UserWorkouts(
            id=uuid.uuid4(),
            user_id=current_user.id,
            name=workout_temp.name,
            description=workout_temp.description,
            difficulty_level=workout_temp.difficulty_level,
            estimated_duration_minutes=workout_temp.estimated_duration_minutes,
            target_muscle_groups=workout_temp.target_muscle_groups,
            workout_type=workout_temp.workout_type
        )

        db.add(user_workout)

        logger.info("Create copy of template exercises list process...")
        # create copy of exercises list from template exercises for user workout plan
        workout_exercises = db.query(TemplateExercise).filter(TemplateExercise.template_id == template_id).all()
        for workout_exercise in workout_exercises:
            user_exercise_copy = UserExercise(
                id=uuid.uuid4(),
                user_workout_id=user_workout.id,
                exercise_id=workout_exercise.exercise_id,
                workout_day=workout_exercise.workout_day,
                day_number=workout_exercise.day_number,
                exercise_name=workout_exercise.exercise_name,
                stage_of_exercises=workout_exercise.stage_of_exercises,
                sequence_order=workout_exercise.sequence_order,
                sets=workout_exercise.sets,
                reps=workout_exercise.reps,
                weight=workout_exercise.weight,
                rest_seconds=workout_exercise.rest_seconds,
                notes=workout_exercise.notes,
                workout_type=workout_exercise.workout_type
            )
            db.add(user_exercise_copy)
        
        logger.info("Add the in user workout plan process...")
        # add the in user workout plan
        workout_temp_plan = UserWorkoutPlan(
            id=uuid.uuid4(),
            user_id=current_user.id,
            template_id=template_id,
            user_workout_id=user_workout.id,
            source_name= "temp",
            name = workout_temp.name,
            status="deactivate"
        )
        db.add(workout_temp_plan)

        db.commit()
        db.refresh(workout_temp_plan)

        logger.info("Create workout plan by using Templates workout process completed")
        return workout_temp_plan

    # TODO: create workout plan by using ml model
    @staticmethod
    async def create_user_workout_plan_ml(current_user: User, db: Session):
        logger.info("Create workout plan by using profile-based logic process started..")
        
        # 1. Get User Profile to understand fitness level and goals
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        
        if not user_profile:
            # Fallback if profile not found: pick any template
            template = db.query(WorkoutTemplate).first()
        else:
            # 2. Try to find a template that matches fitness level and goal
            template = db.query(WorkoutTemplate).filter(
                WorkoutTemplate.difficulty_level == user_profile.fitness_level,
                WorkoutTemplate.workout_type == user_profile.primary_goal
            ).first()
            
            # 2b. Fallback 1: match by fitness level only
            if not template:
                template = db.query(WorkoutTemplate).filter(
                    WorkoutTemplate.difficulty_level == user_profile.fitness_level
                ).first()
            
            # 2c. Fallback 2: match by goal only
            if not template:
                template = db.query(WorkoutTemplate).filter(
                    WorkoutTemplate.workout_type == user_profile.primary_goal
                ).first()
        
        # 3. Use default if still not found
        if not template:
            template = db.query(WorkoutTemplate).first()
            
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No suitable workout templates found to generate a plan."
            )

        logger.info(f"Selected template '{template.name}' for user {current_user.id}")
        
        # 4. Create the workout plan using the selected template
        return await WorkoutService.create_user_workout_plan_temp(template.id, current_user, db)

    # create workout plan by using user
    @staticmethod
    async def create_user_workout_plan_user(user_workout_input: UserWorkoutCreateWithExercises, current_user:User, db:Session):
        logger.info("Create workout plan by user process started..")
        # check is user workout plan name is already exit or not
        logger.info("Checking is there workout plan name is exist or not....")
        user_workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.name == user_workout_input.name).first()
        if user_workout_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Workout plan name already exists."
            )   
        
        logger.info("Creating workout plan by user requirement..")
        # create user workout plan
        workout_plan_by_user = UserWorkouts(
            id=uuid.uuid4(),
            user_id=current_user.id,
            name=user_workout_input.name,
            description=user_workout_input.description,
            difficulty_level=user_workout_input.difficulty_level,
            estimated_duration_minutes=user_workout_input.estimated_duration_minutes,
            target_muscle_groups=user_workout_input.target_muscle_groups,
            workout_type=user_workout_input.workout_type
        )
        db.add(workout_plan_by_user)

        logger.info("Add the all exercise in UserExercises tables")
        workout_plan_exercises = user_workout_input.exercises
        for workout_plan_exercise in workout_plan_exercises:
            user_exercise_add = UserExercise(
                id=uuid.uuid4(),
                user_workout_id=workout_plan_by_user.id,
                exercise_id=workout_plan_exercise.exercise_id,
                workout_day=workout_plan_exercise.workout_day,
                day_number=workout_plan_exercise.day_number,
                exercise_name=workout_plan_exercise.exercise_name,
                stage_of_exercises=workout_plan_exercise.stage_of_exercises,
                sequence_order=workout_plan_exercise.sequence_order,
                sets=workout_plan_exercise.sets,
                reps=workout_plan_exercise.reps,
                weight=workout_plan_exercise.weight,
                rest_seconds=workout_plan_exercise.rest_seconds,
                notes=workout_plan_exercise.notes,
                workout_type=workout_plan_exercise.workout_type
            )
            db.add(user_exercise_add)

        # logger.info("add Created workout by users in UserWorkoutPlan tables")
        # create user workout plan
        user_workout_plan = UserWorkoutPlan(
            id=uuid.uuid4(),
            user_id=current_user.id,
            name=user_workout_input.name,
            user_workout_id=workout_plan_by_user.id,
            source_name="user",
            status="deactivate"
        )

        db.add(user_workout_plan)
        db.commit()
        db.refresh(user_workout_plan)
        
        logger.info("Create workout plan by user process completed")
        return user_workout_plan    

    # ============ USER WORKOUT Routes: get, update, delete any workout plan ============

    # get specific workout from workout plan
    @staticmethod
    async def get_specific_workout_plan(workout_id:UUID, current_user:User, db:Session):
        logger.info("Accessing workout plan process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.id == workout_id).first()
        if not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
            )
        
        # Fetch exercises if associated with a user_workout
        exercises = []
        if workout_plan.user_workout_id:
             exercises = db.query(UserExercise).filter(UserExercise.user_workout_id == workout_plan.user_workout_id).all()

        # Construct response object explicitly to simple/dict to attach extra field
        # We can return the ORM object and just attach the property if we were using Pydantic ORM mode strictly,
        # but since 'template_exercises' is not a column, we might need to be explicit or ensure the schema maps it.
        # However, UserWorkoutPlan ORM does not have 'template_exercises'.
        # So we attach it to the logic.
        
        # Create a dict from the ORM object
        response = UserWorkoutPlanResponse.from_orm(workout_plan)
        # Explicitly convert ORM objects to Pydantic models to ensure valid serialization
        response.template_exercises = [UserExerciseInDB.from_orm(ex) for ex in exercises]
        
        logger.info("Accessing workout plan process completed")
        return response
    
    # update specific workout plan
    @staticmethod
    async def update_workout_plan(workout_id:UUID, workout_update:UserWorkoutUpdate, current_user:User, db:Session):
        logger.info("Updating workout plan process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.id == workout_id).first()
        if not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
            )
        # update workout plan 
        update_data = workout_update.dict(exclude_unset=True)

        # Update only provided fields
        for field, value in update_data.items():
            if value is not None and hasattr(workout_plan, field):
                setattr(workout_plan, field, value)

        db.add(workout_plan)
        db.commit()
        db.refresh(workout_plan)

        logger.info("Updating workout plan process completed")
        return workout_plan 
    
    # delete specific workout plan
    @staticmethod
    async def delete_workout_plan(workout_id:UUID, current_user:User, db:Session):
        logger.info("Deleting workout plan process started..")
        # check if this workout plan exists
        workout_plan = db.query(UserWorkoutPlan).filter(
            UserWorkoutPlan.user_id == current_user.id, 
            UserWorkoutPlan.id == workout_id
        ).first()
        
        if not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
            )

        # 1. Nullify workout_plan_id in existing sessions to avoid FK violation
        db.query(WorkoutSession).filter(
            WorkoutSession.workout_plan_id == workout_id
        ).update({"workout_plan_id": None}, synchronize_session=False)

        user_workout_id = workout_plan.user_workout_id
        
        # 2. Delete the user workout plan record first
        db.delete(workout_plan)
        db.commit() # Commit here to free up the FK link if necessary

        # 3. If it's a user-created workout, clean up associated exercises and main record
        if user_workout_id:
            logger.info(f"Cleaning up UserWorkout data for ID: {user_workout_id}")
            # Delete associated exercises
            db.query(UserExercise).filter(
                UserExercise.user_workout_id == user_workout_id
            ).delete(synchronize_session=False)
            
            # Delete the user workout record
            db.query(UserWorkouts).filter(
                UserWorkouts.id == user_workout_id
            ).delete(synchronize_session=False)
        
        db.commit()

        logger.info(f"Workout plan {workout_id} and its associated data deleted successfully")
        return {"message": "Workout plan deleted successfully", "id": str(workout_id)}
    
    # ============ USER WORKOUT EXERCISE Routes: get, add, update, delete ============
    
    # get workout exercise list from UserExercise table
    @staticmethod
    async def get_workout_exercises_list(workout_id:UUID, current_user:User, db:Session):
        logger.info("Accessing workout plan exercises process started..")
        # check this workout is exits or not
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.id == workout_id).first()
        if  not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
            )
        
        # get workout exercises
        workout_exercises = db.query(UserExercise).filter(UserExercise.user_workout_id == workout_plan.user_workout_id).all()
        
        logger.info("Accessing workout plan exercises process completed")
        return workout_exercises
    
    # update , remove exercise form workout plan
    @staticmethod
    async def update_workout_exercises_list(workout_id: UUID, exercise_update: List[UserExerciseUpdate], current_user: User, db: Session):
        logger.info("Updating workout plan exercises process started..")
        workout_plan = db.query(UserWorkoutPlan).filter(
            UserWorkoutPlan.user_id == current_user.id, 
            UserWorkoutPlan.id == workout_id
        ).first()

        if not workout_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout plan not found"
        )

        # Ensure the workout plan is linked to a user workout
        if not workout_plan.user_workout_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This workout plan is not editable (no associated user workout)"
        )

        logger.info(f"Syncing exercises for UserWorkout ID: {workout_plan.user_workout_id}")

        # get all the workout exercise list from database
        exercise_list = await WorkoutService.get_workout_exercises_list(workout_id, current_user, db)

        # get the id of exercises which are need to edit (using primary key id)
        update_ids = [exercise.id for exercise in exercise_update if exercise.id]

        # Create a mapping of id to update data for easier lookup
        update_data_map = {update.id: update for update in exercise_update if update.id}

        # run exercise list see if this present in editable list or not
        # if not present then delete from database, if yes then update in database
        for exercise in exercise_list:
            if exercise.id not in update_ids:
                # Delete exercises that are not in the update list
                db.delete(exercise)
            else:
                # Update existing exercises
                update_data = update_data_map.get(exercise.id)
                if update_data:
                    # Convert update_data to dict, excluding unset fields
                    update_dict = update_data.dict(exclude_unset=True)
                    
                    # Update exercise fields
                    for field, value in update_dict.items():
                        # skip id and exercise_id if they are in the update_dict to prevent accidental changes to PK/FK
                        if field in ['id', 'exercise_id']:
                            continue
                        if value is not None and hasattr(exercise, field):
                            setattr(exercise, field, value)
        
        # Add new exercises (those without an id)
        for update_item in exercise_update:
            if not update_item.id:
                 # Check if exercise_id is provided
                 if not update_item.exercise_id:
                     continue # Skip if no exercise_id for new item
                 
                 new_exercise = UserExercise(
                    id=uuid.uuid4(),
                    user_workout_id=workout_plan.user_workout_id,
                    exercise_id=update_item.exercise_id,
                    workout_day=update_item.workout_day,
                    day_number=update_item.day_number,
                    exercise_name=update_item.exercise_name or "Unknown Exercise", # Fallback or fetch if needed
                    stage_of_exercises=update_item.stage_of_exercises,
                    sequence_order=update_item.sequence_order,
                    sets=update_item.sets,
                    reps=update_item.reps,
                    weight=update_item.weight,
                    rest_seconds=update_item.rest_seconds,
                    notes=update_item.notes,
                    workout_type=update_item.workout_type
                 )
                 db.add(new_exercise)

    
        db.commit()
        
        # Re-fetch updated exercises to return them
        updated_exercises = db.query(UserExercise).filter(UserExercise.user_workout_id == workout_plan.user_workout_id).all()

        logger.info("Updating workout plan exercises process completed")
        return updated_exercises
    
    # update sets, reps, weight, and rest time in workout plan
    @staticmethod
    async def update_exercise_in_workout_plan(workout_id:UUID, exercise_id:UUID, exercise_update:UserExerciseRepsSetUpdate, current_user:User, db:Session):
        logger.info("Updating workout plan exercise process started..")
        # find the workout 
        workout_plan = db.query(UserWorkoutPlan).filter(UserWorkoutPlan.user_id == current_user.id, UserWorkoutPlan.id == workout_id).first()

        user_workout_plan = db.query(UserWorkouts).filter(UserWorkouts.user_id == current_user.id, UserWorkouts.id == workout_plan.user_workout_id).first()

        user_exercise = db.query(UserExercise).filter(UserExercise.user_workout_id == workout_plan.user_workout_id, UserExercise.exercise_id == exercise_id).first()

        if user_exercise:
            # update workout plan 
            update_data = exercise_update.dict(exclude_unset=True)

            # Update only provided fields
            for field, value in update_data.items():
                if value is not None and hasattr(user_exercise, field):
                    setattr(user_exercise, field, value)
            
            db.add(user_exercise)
            db.commit()
            db.refresh(user_exercise)

        logger.info("Updating workout plan exercise process completed")
        return workout_plan
       


