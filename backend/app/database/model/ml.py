from sqlalchemy import Column, String, Integer,ARRAY, Float, Boolean, DateTime, Date, DECIMAL, Text, ForeignKey, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.db_conn import Base

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    model_type = Column(String(100))  # weight_recommendation, exercise_selection, progression
    version = Column(String(50), nullable=False)
    training_data_until = Column(Date)
    performance_metrics = Column(JSON)
    model_path = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    workout_recommendations  = relationship("WorkoutRecommendation", back_populates="model")

class WorkoutRecommendation(Base):
    __tablename__ = "workout_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    difficulty_level = Column(String(50))
    estimated_duration_minutes = Column(Integer)
    target_muscle_groups = Column(ARRAY(String))
    workout_type = Column(String(50)) 

    # model 
    model_id = Column(UUID(as_uuid=True), ForeignKey("ml_models.id"), nullable=False)
    version = Column(String(50), nullable=False)
    accepted = Column(Boolean, default=False)
    confidence_score = Column(DECIMAL(3, 2))  # 0.00 to 1.00
    performance_metrics = Column (JSON)
    reason = Column(Text)  # Explanation for the recommendation

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_recommendations")
    model = relationship("MLModel", back_populates="workout_recommendations")
    exercise_recommendations = relationship("ExerciseRecommendation", back_populates="workout_recommendation")
    workout_plans = relationship("UserWorkoutPlan", back_populates="ml_recommendation")  

    __table_args__ = (
        Index('idx_user_created_at', 'user_id', 'created_at'),
    )

class ExerciseRecommendation(Base):
    __tablename__ = "exercise_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey("workout_recommendations.id"), nullable=False, index=True)
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
    workout_recommendation  = relationship("WorkoutRecommendation", back_populates="exercise_recommendations")
    exercise = relationship("Exercise", back_populates="exercise_recommendations")

class MLTrainingData(Base):
    """Table to store ML training data extracted from workouts"""
    __tablename__ = "ml_training_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign keys to link with existing data
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False, index=True)
    workout_session_id = Column(UUID(as_uuid=True), ForeignKey("workout_sessions.id"), nullable=False, index=True)
    session_exercise_id = Column(UUID(as_uuid=True), ForeignKey("session_exercises.id"), nullable=True)
    workout_set_id = Column(UUID(as_uuid=True), ForeignKey("workout_sets.id"), nullable=True)
    
    # ================= USER PROFILE DATA =================
    # From user_profiles table
    age_years = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)  # 'male', 'female', 'other'
    height_cm = Column(DECIMAL(5, 2), nullable=True)
    fitness_level = Column(String(50), nullable=True)  # 'beginner', 'intermediate', 'advanced'
    primary_goal = Column(String(100), nullable=True)  # 'strength', 'hypertrophy', 'endurance', 'weight_loss'
    experience_months = Column(Integer, default=0)
    
    # From body_measurements table
    current_weight_kg = Column(DECIMAL(5, 2), nullable=True)
    current_body_fat_pct = Column(DECIMAL(4, 2), nullable=True)
    bmi = Column(DECIMAL(4, 2), nullable=True)
    
    # ================= EXERCISE DATA =================
    # From exercises table
    muscle_group = Column(String(100), nullable=True)  # 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'
    equipment = Column(String(100), nullable=True)  # 'barbell', 'dumbbell', 'machine', 'bodyweight', 'cable'
    exercise_difficulty = Column(String(50), nullable=True)  # 'beginner', 'intermediate', 'advanced'
    
    # ================= WORKOUT SESSION DATA =================
    # From workout_sessions table
    session_date = Column(Date, nullable=False)
    day_of_week = Column(Integer, nullable=True)  # 0=Monday, 6=Sunday
    time_of_day = Column(String(20), nullable=True)  # 'morning', 'afternoon', 'evening'
    session_energy_level = Column(Integer, nullable=True)  # 1-5 scale
    session_mood = Column(String(50), nullable=True)  # 'great', 'good', 'average', 'poor', 'terrible'
    days_since_last_workout = Column(Integer, nullable=True)
    total_session_duration_min = Column(Integer, nullable=True)
    
    # ================= EXERCISE PERFORMANCE DATA =================
    # For Model B: Volume Prediction (REGRESSION TARGETS)
    planned_sets = Column(Integer, nullable=True)
    planned_reps_per_set = Column(Integer, nullable=True)
    planned_weight_kg = Column(DECIMAL(5, 2), nullable=True)
    
    completed_sets = Column(Integer, nullable=True)
    completed_reps_per_set = Column(Integer, nullable=True)
    actual_weight_kg = Column(DECIMAL(5, 2), nullable=True)
    
    # Performance metrics
    completion_rate = Column(DECIMAL(4, 3), nullable=True)  # 0.000 to 1.000
    average_rpe = Column(DECIMAL(3, 1), nullable=True)  # 1.0 to 10.0
    total_volume_kg = Column(DECIMAL(8, 2), nullable=True)  # weight × reps × sets
    
    # Fatigue indicators
    rpe_increase_per_set = Column(DECIMAL(3, 1), nullable=True)  # How much harder each set felt
    rep_decrease_per_set = Column(Integer, nullable=True)  # Reps dropped each set
    
    # ================= TARGET VARIABLES =================
    # For Model A: Exercise Selection (to be predicted)
    exercise_was_appropriate = Column(Boolean, nullable=True)  # True if user completed with good form
    
    # For Model B: Next Session Prediction
    next_recommended_sets = Column(Integer, nullable=True)
    next_recommended_reps = Column(Integer, nullable=True)
    next_recommended_weight_kg = Column(DECIMAL(5, 2), nullable=True)
    
    # ================= FEEDBACK DATA =================
    # From user_feedback table
    feedback_rating = Column(Integer, nullable=True)  # 1-5 scale
    feedback_type = Column(String(100), nullable=True)  # 'too_easy', 'too_hard', 'good', 'form_issue'
    feedback_comments = Column(Text, nullable=True)
    
    # ================= METADATA =================
    extraction_method = Column(String(50), default="auto")  # 'auto', 'manual', 'backfill'
    data_quality_score = Column(DECIMAL(3, 2), nullable=True)  # 0.00 to 1.00
    is_training_ready = Column(Boolean, default=False)  # Mark when ready for ML training
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="ml_training_records")
    exercise = relationship("Exercise", backref="ml_training_records")
    workout_session = relationship("WorkoutSession", backref="ml_training_records")
    session_exercise = relationship("SessionExercise", backref="ml_training_records")
    workout_set = relationship("WorkoutSet", backref="ml_training_records")
    
    __table_args__ = (
        Index('idx_user_exercise_date', 'user_id', 'exercise_id', 'session_date'),
        Index('idx_training_ready', 'is_training_ready', 'data_quality_score'),
        Index('idx_extraction_date', 'created_at'),
    )