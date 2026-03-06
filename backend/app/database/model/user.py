from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, DECIMAL, Text, ForeignKey, Index, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.db_conn import Base

class User(Base):
    __tablename__ = "users"
    
    # user detail fields
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    membership_status = Column(String(50), default="pending")  # active, expired, pending
    role = Column(String(50), default="member")  # member, trainer, admin

    # verification or token field
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(100), nullable=True)
    verification_code_expires_at = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String(100), nullable=True)
    reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)

    # logout tokens
    token_version = Column(Integer, default=1)
    last_logout = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0)
    theme = Column(String(20), default="system")  # light, dark, system

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    workout_plans = relationship("UserWorkoutPlan", back_populates="user")
    body_measurements = relationship("BodyMeasurement", back_populates="user")
    workout_sessions = relationship("WorkoutSession", back_populates="user")
    # recommendations = relationship("ExerciseRecommendation", back_populates="user")
    user_workouts = relationship("UserWorkouts", back_populates="user")
    workout_recommendations = relationship("WorkoutRecommendation", back_populates="user")
    feedback = relationship("UserFeedback", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    date_of_birth = Column(Date)
    gender = Column(String(50))  # male, female, other
    height_cm = Column(DECIMAL(5, 2))
    weight_kg = Column(DECIMAL(5, 2))
    fitness_level = Column(String(50))  # beginner, intermediate, advanced
    primary_goal = Column(String(100))  # strength, hypertrophy, endurance, weight_loss
    experience_months = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")

class BodyMeasurement(Base):
    __tablename__ = "body_measurements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    measurement_date = Column(Date, nullable=False, index=True)
    body_fat_pct = Column(DECIMAL(4, 2))
    muscle_mass_kg = Column(DECIMAL(5, 2))
    chest_cm = Column(DECIMAL(5, 2))
    waist_cm = Column(DECIMAL(5, 2))
    hips_cm = Column(DECIMAL(5, 2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="body_measurements")
    
    __table_args__ = (
        Index('idx_user_measurement_date', 'user_id', 'measurement_date'),
    )