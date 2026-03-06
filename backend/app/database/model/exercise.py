from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.db_conn import Base

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    body_part = Column(String(100), index=True)  # Changed from bodyPart
    target_muscle = Column(String(100), index=True)
    muscle_group = Column(String(100))  # chest, back, legs, shoulders, arms, core
    equipment = Column(String(100))  # barbell, dumbbell, machine, bodyweight, cable
    instructions = Column(Text)
    tutorial_url = Column(String(500))
    icon = Column(String(500))  # URL or path to icon
    description = Column(Text)
    difficulty_level = Column(String(50))  # beginner, intermediate, advanced
    difficulty_reason = Column(Text)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_exercises = relationship("UserExercise", back_populates="exercise")
    template_exercises = relationship("TemplateExercise", back_populates="exercise")
    session_exercises = relationship("SessionExercise", back_populates="exercise")
    exercise_recommendations = relationship("ExerciseRecommendation", back_populates="exercise")  

class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    difficulty_level = Column(String(50))
    estimated_duration_minutes = Column(Integer)
    target_muscle_groups = Column(ARRAY(String))
    workout_type = Column(String(50)) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    template_exercises = relationship("TemplateExercise", back_populates="template")
    workout_plans = relationship("UserWorkoutPlan", back_populates="template") 


class TemplateExercise(Base):
    __tablename__ = "template_exercises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_templates.id"), nullable=False, index=True)
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
    template = relationship("WorkoutTemplate", back_populates="template_exercises")
    exercise = relationship("Exercise", back_populates="template_exercises")

