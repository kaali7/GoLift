
from fastapi import HTTPException, status

# connection to database and models
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.model import User,UserExercise,UserProgress , WorkoutTemplate, UserWorkoutPlan , TemplateExercise, WorkoutSession, Exercise, WorkoutSet, SessionExercise, UserFeedback
from uuid import UUID

# import user schemas from schemas
from app.schemas.user import *
from app.schemas.exercise import TemplateExerciseInDB, ExerciseInDB, WorkoutPlanExerciseInDB, UserExerciseInDB
from app.schemas.workout import SessionWorkoutCompleteInput, SessionExerciseCompleteInput

from app.core.logger import logger
import uuid
import datetime

# another service help 
from app.services.template_service import TemplateService
from app.services.workout_service import WorkoutService

class SessionService:

    # ========== SESSION WORKOUT SERVICES ==========
    
    @staticmethod
    async def get_current_active_workout_plan(current_user:User, db:Session):
        logger.info("Get the active workout plan process started..")
        # check this workout plan is exits or not
        workout_temp = await WorkoutService.get_active_workout_plan(current_user, db)

        user_workout_id = getattr(workout_temp, "user_workout_id", None)        
        if user_workout_id is None:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Active workout plan missing workout plans id")

        # find day number of this week 
        today = datetime.date.today()
        
        # Check if a session for this plan has already been completed today
        completed_session = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == current_user.id,
            WorkoutSession.workout_plan_id == workout_temp.id,
            WorkoutSession.status == "completed",
            func.date(WorkoutSession.start_time) == today
        ).first()

        if completed_session:
            logger.info("Workout session already completed for today")
            return {"status": "completed", "message": "exercise is complete"}

        user_workout_id = getattr(workout_temp, "user_workout_id", None)        
        if user_workout_id is None:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Active workout plan missing workout plans id")

        day_number = today.isocalendar()[2]

        # get workout plan
        query = db.query(UserExercise).filter(
            UserExercise.user_workout_id == user_workout_id,
            UserExercise.day_number == day_number
        )

        exercises = query.all()

        logger.info("Get the active workout plan process completed")
        return exercises


    @staticmethod
    async def start_current_active_workout_plan(current_user:User, db:Session):
        logger.info("Start workout plan process started..")
        workout_plan = await WorkoutService.get_active_workout_plan(current_user, db)
        workout_plan_id = getattr(workout_plan, "id", None)

        start_session = WorkoutSession(
            id=uuid.uuid4(),
            user_id = current_user.id,
            workout_plan_id=workout_plan_id,
            start_time=datetime.datetime.now(datetime.timezone.utc),
        )

        session_id = start_session.id

        db.add(start_session)
        db.commit()
        db.refresh(start_session)

        logger.info("Start workout plan process end..")
        return {"session_id": session_id, "workout_plan_id": workout_plan_id}

    @staticmethod
    async def complete_current_active_workout_plan(session_id:UUID, user_input:SessionWorkoutCompleteInput ,current_user:User, db:Session):
        logger.info("Complete workout plan process started..")
        # get exercise of that workout plan     
        complete_session = db.query(WorkoutSession).filter(WorkoutSession.id == session_id).first()

        if not complete_session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout session not found")

        start_time = complete_session.start_time
        end_time = datetime.datetime.now(datetime.timezone.utc)
        calculated_duration_ms = (end_time - start_time).total_seconds() # this is in second
        print(calculated_duration_ms)

        complete_session.duration_minutes = calculated_duration_ms/60 # this is in minute
        complete_session.energy_level = user_input.energy_level
        complete_session.mood = user_input.mood
        complete_session.notes = user_input.notes
        complete_session.status = user_input.status
        complete_session.end_time = end_time
        db.commit()
        
        # calculate and add progress for each exercise in the session
        session_exercises = db.query(SessionExercise).filter(SessionExercise.workout_session_id == session_id).all()
        
        for se in session_exercises:
            # get all sets for this specific session exercise
            sets = db.query(WorkoutSet).filter(WorkoutSet.session_exercise_id == se.id).all()
            if not sets:
                continue
            
            # calculate one rep max (max weight across all sets)
            one_rep_max_kg = max([float(s.weight_kg or 0) for s in sets])
            
            # calculate total volume (sum of weight * reps for all sets)
            training_volume_kg = sum([float(s.weight_kg or 0) * (s.reps or 0) for s in sets])
            
            # add or update progress
            user_progress = UserProgress(
                id=uuid.uuid4(),
                user_id=current_user.id,
                exercise_id = se.exercise_id,
                one_rep_max_kg= one_rep_max_kg,
                training_volume_kg= training_volume_kg,
                personal_record_date=end_time.date(),
            )
            db.add(user_progress)
        
        db.commit()
        db.refresh(complete_session)

        logger.info("Complete workout plan process end..")
        return complete_session

    # ========== SESSION EXERCISE SERVICES ==========
    @staticmethod
    async def start_current_exercise_workout_plan(session_id: UUID, order_id: int, current_user:User, db:Session):
        logger.info("Start current Exercise of workout plan process started..")
        # get exercise of that workout plan 
        current_workout_plan = await SessionService.get_current_active_workout_plan(current_user, db)
        current_exercise = UserExerciseInDB.model_validate(current_workout_plan[order_id])

        exercise_id = current_exercise.exercise_id
        current_exercise_detail = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        current_exercise_detail_db = ExerciseInDB.model_validate(current_exercise_detail)

        # Get or create an active workout session for the user
        exercise_session = SessionExercise(
            id=uuid.uuid4(),
            workout_session_id=session_id,
            sequence_order=order_id, 
            exercise_id=exercise_id,
            start_time = datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(exercise_session)
        db.commit()
        db.refresh(exercise_session)

        full_detail_current_exercise = WorkoutPlanExerciseInDB.model_validate({
            "exercise_session_id": exercise_session.id,
            "workout_plan_data": current_exercise,
            "exercise_data": current_exercise_detail_db
        })

        logger.info("Start current Exercise of workout plan process end..")
        return full_detail_current_exercise

    @staticmethod
    async def complete_sendFeedback_current_exercise_workout_plan(exercise_session_id:UUID, user_input:  SessionExerciseCompleteInput,current_user:User, db:Session):
        logger.info("Complete current Exercise of workout plan process started..")
        # 1. get exercise session and validate
        exercise_session = db.query(SessionExercise).filter(SessionExercise.id == exercise_session_id).first()
        if not exercise_session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise session not found")
        
        exercise_id = exercise_session.exercise_id

        # 2. update exercise session timing
        start_time = exercise_session.start_time
        end_time = datetime.datetime.now(datetime.timezone.utc)
        duration_seconds = (end_time - start_time).total_seconds()

        exercise_session.duration_minutes = int(duration_seconds / 60)
        exercise_session.end_time = end_time

        # 3. create workout_set first
        workout_set_id = uuid.uuid4()
        exercise_workout_set = WorkoutSet(
            id=workout_set_id,
            session_exercise_id = exercise_session.id, 
            set_number = user_input.workout_sets, 
            reps = user_input.workout_reps,
            weight_kg = user_input.workout_weight,
            rest_seconds = user_input.workout_time,
            completed_at = end_time
        )
        db.add(exercise_workout_set)

        # 4. create feedback linked to the set
        exercise_feedback = UserFeedback(
            id=uuid.uuid4(),
            user_id=current_user.id,
            exercise_id=exercise_id,
            workout_set_id=workout_set_id,
            feedback_type = user_input.feedback_type
        )
        db.add(exercise_feedback)

        db.commit()
        db.refresh(exercise_session)

        logger.info("Complete current Exercise of workout plan process end..")
        return exercise_session






    
    






