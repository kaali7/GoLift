from sqlalchemy import Column, String, Integer, Boolean, DateTime, Date, DECIMAL, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database.db_conn import Base

class WorkoutSet(Base):
    __tablename__ = "workout_sets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_exercise_id = Column(UUID(as_uuid=True), ForeignKey("session_exercises.id"), nullable=False, index=True)
    set_number = Column(Integer, nullable=False)
    weight_kg = Column(DECIMAL(5, 2))
    reps = Column(Integer, nullable=False)
    rest_seconds = Column(Integer)
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    session_exercise = relationship("SessionExercise", back_populates="workout_sets")
    feedback = relationship("UserFeedback", back_populates="workout_set")
    
    __table_args__ = (
        Index('idx_session_exercise_set', 'session_exercise_id', 'set_number'),
    )

class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"))
    workout_set_id = Column(UUID(as_uuid=True), ForeignKey("workout_sets.id"))
    feedback_type = Column(String(100))  # too_easy, too_hard, good, form_issue
    # rating = Column(Integer)  # 1-5 scale
    # comments = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="feedback")
    exercise = relationship("Exercise")
    workout_set = relationship("WorkoutSet", back_populates="feedback")

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(UUID(as_uuid=True), ForeignKey("exercises.id"), nullable=False, index=True)
    one_rep_max_kg = Column(DECIMAL(5, 2))
    training_volume_kg = Column(DECIMAL(8, 2))  # total weight lifted
    personal_record_date = Column(Date)
    # last_performed_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    exercise = relationship("Exercise")
    
    __table_args__ = (
        Index('idx_user_exercise', 'user_id', 'exercise_id'),
    )
    