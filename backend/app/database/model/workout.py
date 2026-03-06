from sqlalchemy import Column, String, Integer,ARRAY ,Float, Boolean, DateTime, Date, DECIMAL, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.db_conn import Base


# here we decide it this exercise is active or not 
class UserWorkoutPlan(Base):
    __tablename__ = "user_workout_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_templates.id"), nullable=True)
    ml_recommendation_id = Column(UUID(as_uuid=True), ForeignKey("workout_recommendations.id"), nullable=True)
    user_workout_id = Column(UUID(as_uuid=True), ForeignKey("user_workouts.id"), nullable=True)

    source_name = Column(String(10))    # 'temp', 'ml', 'user'
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="active")  # active, deactivate
    # start_date = Column(Date, nullable=False)
    # end_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_plans")
    workout_sessions = relationship("WorkoutSession", back_populates="workout_plans")

    template = relationship("WorkoutTemplate", back_populates="workout_plans")
    ml_recommendation = relationship("WorkoutRecommendation", back_populates="workout_plans")
    user_workout = relationship("UserWorkouts", back_populates="workout_plans")
    # scheduled_workouts = relationship("ScheduledWorkout", back_populates="workout_plan")
    
    __table_args__ = (
        Index('idx_user_status', 'user_id', 'status'),
        Index('idx_source_check', 'template_id', 'ml_recommendation_id', 'user_workout_id'),
    )

# here table user create there any store and it does note change
class UserWorkouts(Base):
    __tablename__ = "user_workouts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    difficulty_level = Column(String(50))
    estimated_duration_minutes = Column(Integer)
    target_muscle_groups = Column(ARRAY(String))
    workout_type = Column(String(50)) 
    notes = Column(Text)  # Explanation of workouts
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="user_workouts")
    user_exercises = relationship("UserExercise", back_populates="user_workouts")
    workout_plans = relationship("UserWorkoutPlan", back_populates="user_workout")

    __table_args__ = (
        Index('idx_wr_user_created_at', 'user_id', 'created_at'),
    )

# here we are store exercise data of temp , ml , user so user can edit the temp and ml exercise without effecting the real one 
class UserExercise(Base):
    __tablename__ = "user_exercises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_workout_id = Column(UUID(as_uuid=True), ForeignKey("user_workouts.id"), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False, index=True)

    workout_day = Column(String(50)) # warmup , main exercise, relex
    day_number = Column(Integer, nullable=False)  # 1, 2, 3 for 3-day split
    exercise_name = Column(String(50)) # warmup , main exercise, relex
    stage_of_exercises = Column(String(50)) # warmup , main exercise, relex
    sequence_order = Column(Integer, nullable=False)
    sets = Column(Integer)
    reps = Column(String(50)) # for now let string because of 30 sec and 10 reps of any exercise, but for future change it 
    weight = Column(Float)
    rest_seconds = Column(Integer)
    notes = Column(Text) # warmup , main exercise, relex
    workout_type = Column(String(50)) 

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_workouts = relationship("UserWorkouts", back_populates="user_exercises")
    exercise = relationship("Exercise", back_populates="user_exercises")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    workout_plan_id = Column(UUID(as_uuid=True), ForeignKey("user_workout_plans.id"))
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    status = Column(String(50), default="in_progress")  # in_progress, completed, abandoned
    energy_level = Column(Integer)  # 1-5 scale
    mood = Column(String(50))  # great, good, average, poor, terrible
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_sessions")
    workout_plans = relationship("UserWorkoutPlan", back_populates="workout_sessions")
    session_exercises = relationship("SessionExercise", back_populates="workout_session")
    
    
    __table_args__ = (
        Index('idx_user_start_time', 'user_id', 'start_time'),
    )

class SessionExercise(Base):
    __tablename__ = "session_exercises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workout_session_id = Column(UUID(as_uuid=True), ForeignKey("workout_sessions.id"), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workout_session = relationship("WorkoutSession", back_populates="session_exercises")
    exercise = relationship("Exercise", back_populates="session_exercises")
    workout_sets = relationship("WorkoutSet", back_populates="session_exercise")
    
    __table_args__ = (
        Index('idx_session_order', 'workout_session_id', 'sequence_order'),
    )