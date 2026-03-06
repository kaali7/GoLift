# app/services/ml_data_service.py
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any
import uuid
from app.database.model import (
    User, UserProfile, BodyMeasurement, Exercise,
    WorkoutSession, SessionExercise, WorkoutSet,
    UserFeedback, MLTrainingData
)
from app.database.db_conn import SessionLocal

class MLDataService:
    """Service to extract and store workout data in ml_training_data table"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ================= EXTRACTION METHODS =================
    
    def extract_and_store_workout_data(self, workout_session_id: uuid.UUID):
        """
        Main method: Extract data from a completed workout session
        and store in ml_training_data table
        """
        # Get the workout session
        session = self.db.query(WorkoutSession).filter(
            WorkoutSession.id == workout_session_id,
            WorkoutSession.status == "completed"
        ).first()
        
        if not session:
            return None
        
        # Get all exercises in this session
        session_exercises = self.db.query(SessionExercise).filter(
            SessionExercise.workout_session_id == workout_session_id
        ).all()
        
        training_records = []
        
        for se in session_exercises:
            # Create one record per exercise in the session
            training_record = self._create_training_record(session, se)
            if training_record:
                self.db.add(training_record)
                training_records.append(training_record)
        
        self.db.commit()
        
        # Mark records as training ready
        for record in training_records:
            record.is_training_ready = True
            record.data_quality_score = self._calculate_data_quality(record)
        
        self.db.commit()
        
        return training_records
    
    def _create_training_record(self, session: WorkoutSession, 
                               session_exercise: SessionExercise) -> Optional[MLTrainingData]:
        """Create a single training data record"""
        
        user_id = session.user_id
        exercise_id = session_exercise.exercise_id
        
        # 1. Extract user profile data
        user_data = self._extract_user_data(user_id)
        
        # 2. Extract exercise data
        exercise_data = self._extract_exercise_data(exercise_id)
        
        # 3. Extract session context
        session_data = self._extract_session_data(session)
        
        # 4. Extract performance data for this exercise
        performance_data = self._extract_performance_data(session_exercise)
        
        # 5. Extract feedback
        feedback_data = self._extract_feedback_data(user_id, exercise_id, session.id)
        
        # 6. Calculate derived metrics
        derived_metrics = self._calculate_derived_metrics(performance_data)
        
        # 7. Create the record
        training_data = MLTrainingData(
            # Foreign keys
            user_id=user_id,
            exercise_id=exercise_id,
            workout_session_id=session.id,
            session_exercise_id=session_exercise.id,
            
            # User profile data
            age_years=user_data.get('age_years'),
            gender=user_data.get('gender'),
            height_cm=user_data.get('height_cm'),
            fitness_level=user_data.get('fitness_level'),
            primary_goal=user_data.get('primary_goal'),
            experience_months=user_data.get('experience_months', 0),
            current_weight_kg=user_data.get('current_weight_kg'),
            current_body_fat_pct=user_data.get('current_body_fat_pct'),
            bmi=user_data.get('bmi'),
            
            # Exercise data
            muscle_group=exercise_data.get('muscle_group'),
            equipment=exercise_data.get('equipment'),
            exercise_difficulty=exercise_data.get('difficulty_level'),
            
            # Session context
            session_date=session.start_time.date(),
            day_of_week=session_data.get('day_of_week'),
            time_of_day=session_data.get('time_of_day'),
            session_energy_level=session.energy_level,
            session_mood=session.mood,
            days_since_last_workout=session_data.get('days_since_last_workout'),
            total_session_duration_min=session.duration_minutes,
            
            # Performance data
            planned_sets=performance_data.get('planned_sets'),
            planned_reps_per_set=performance_data.get('planned_reps_per_set'),
            planned_weight_kg=performance_data.get('planned_weight_kg'),
            completed_sets=performance_data.get('completed_sets'),
            completed_reps_per_set=performance_data.get('completed_reps_per_set'),
            actual_weight_kg=performance_data.get('actual_weight_kg'),
            completion_rate=performance_data.get('completion_rate'),
            average_rpe=performance_data.get('average_rpe'),
            total_volume_kg=performance_data.get('total_volume_kg'),
            rpe_increase_per_set=derived_metrics.get('rpe_increase_per_set'),
            rep_decrease_per_set=derived_metrics.get('rep_decrease_per_set'),
            
            # Feedback
            feedback_rating=feedback_data.get('rating'),
            feedback_type=feedback_data.get('feedback_type'),
            feedback_comments=feedback_data.get('comments'),
            
            extraction_method="auto",
            created_at=datetime.now(datetime.timezone.utc)
        )
        
        return training_data
    
    # ================= HELPER EXTRACTION METHODS =================
    
    def _extract_user_data(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """Extract data from user_profiles and body_measurements tables"""
        user = self.db.query(User).filter(User.id == user_id).first()
        profile = self.db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).first()
        
        # Get latest body measurement
        measurement = self.db.query(BodyMeasurement).filter(
            BodyMeasurement.user_id == user_id
        ).order_by(BodyMeasurement.measurement_date.desc()).first()
        
        # Calculate age
        age = None
        if profile and profile.date_of_birth:
            today = date.today()
            age = today.year - profile.date_of_birth.year
            if (today.month, today.day) < (profile.date_of_birth.month, profile.date_of_birth.day):
                age -= 1
        
        # Calculate BMI
        bmi = None
        if measurement and measurement.weight_kg and profile and profile.height_cm:
            height_m = float(profile.height_cm) / 100
            bmi = float(measurement.weight_kg) / (height_m * height_m)
        
        return {
            'age_years': age,
            'gender': profile.gender if profile else None,
            'height_cm': profile.height_cm if profile else None,
            'fitness_level': profile.fitness_level if profile else None,
            'primary_goal': profile.primary_goal if profile else None,
            'experience_months': profile.experience_months if profile else 0,
            'current_weight_kg': measurement.weight_kg if measurement else None,
            'current_body_fat_pct': measurement.body_fat_pct if measurement else None,
            'bmi': bmi
        }
    
    def _extract_exercise_data(self, exercise_id: uuid.UUID) -> Dict[str, Any]:
        """Extract data from exercises table"""
        exercise = self.db.query(Exercise).filter(Exercise.id == exercise_id).first()
        
        return {
            'muscle_group': exercise.muscle_group if exercise else None,
            'equipment': exercise.equipment if exercise else None,
            'difficulty_level': exercise.difficulty_level if exercise else None
        }
    
    def _extract_session_data(self, session: WorkoutSession) -> Dict[str, Any]:
        """Extract contextual data from workout session"""
        
        # Time features
        start_time = session.start_time
        day_of_week = start_time.weekday()  # 0=Monday, 6=Sunday
        
        # Determine time of day
        hour = start_time.hour
        if hour < 12:
            time_of_day = "morning"
        elif hour < 17:
            time_of_day = "afternoon"
        else:
            time_of_day = "evening"
        
        # Days since last workout
        days_since_last = None
        last_session = self.db.query(WorkoutSession).filter(
            WorkoutSession.user_id == session.user_id,
            WorkoutSession.start_time < session.start_time,
            WorkoutSession.status == "completed"
        ).order_by(WorkoutSession.start_time.desc()).first()
        
        if last_session and last_session.start_time:
            days_since_last = (start_time.date() - last_session.start_time.date()).days
        
        return {
            'day_of_week': day_of_week,
            'time_of_day': time_of_day,
            'days_since_last_workout': days_since_last
        }
    
    def _extract_performance_data(self, session_exercise: SessionExercise) -> Dict[str, Any]:
        """Extract performance data from workout_sets table"""
        # Get all sets for this exercise
        sets = self.db.query(WorkoutSet).filter(
            WorkoutSet.session_exercise_id == session_exercise.id
        ).order_by(WorkoutSet.set_number).all()
        
        if not sets:
            return {}
        
        # Calculate totals and averages
        total_sets = len(sets)
        total_planned_reps = sum(s.planned_reps or 0 for s in sets)
        total_completed_reps = sum(s.completed_reps or 0 for s in sets)
        
        # Average per set
        planned_reps_per_set = total_planned_reps / total_sets if total_sets > 0 else 0
        completed_reps_per_set = total_completed_reps / total_sets if total_sets > 0 else 0
        
        # Weight calculations
        planned_weight = sets[0].planned_weight_kg if sets else None
        
        # Use actual weight if available, otherwise planned
        actual_weights = []
        for s in sets:
            if s.actual_weight_kg:
                actual_weights.append(s.actual_weight_kg)
            elif s.planned_weight_kg:
                actual_weights.append(s.planned_weight_kg)
        
        actual_weight = sum(actual_weights) / len(actual_weights) if actual_weights else None
        
        # RPE calculations
        rpe_scores = [s.rpe_score for s in sets if s.rpe_score is not None]
        avg_rpe = sum(rpe_scores) / len(rpe_scores) if rpe_scores else None
        
        # Completion rate
        completion_rate = total_completed_reps / total_planned_reps if total_planned_reps > 0 else 0
        
        # Total volume
        total_volume = 0
        for s in sets:
            weight = s.actual_weight_kg or s.planned_weight_kg or 0
            reps = s.completed_reps or 0
            total_volume += float(weight) * reps
        
        return {
            'planned_sets': total_sets,
            'planned_reps_per_set': planned_reps_per_set,
            'planned_weight_kg': planned_weight,
            'completed_sets': total_sets,  # Assuming all sets were attempted
            'completed_reps_per_set': completed_reps_per_set,
            'actual_weight_kg': actual_weight,
            'completion_rate': completion_rate,
            'average_rpe': avg_rpe,
            'total_volume_kg': total_volume
        }
    
    def _extract_feedback_data(self, user_id: uuid.UUID, exercise_id: uuid.UUID, 
                              session_id: uuid.UUID) -> Dict[str, Any]:
        """Extract feedback from user_feedback table"""
        feedback = self.db.query(UserFeedback).filter(
            UserFeedback.user_id == user_id,
            UserFeedback.exercise_id == exercise_id,
            UserFeedback.workout_set_id.in_(
                self.db.query(WorkoutSet.id).join(SessionExercise).filter(
                    SessionExercise.workout_session_id == session_id,
                    SessionExercise.exercise_id == exercise_id
                )
            )
        ).order_by(UserFeedback.created_at.desc()).first()
        
        return {
            'rating': feedback.rating if feedback else None,
            'feedback_type': feedback.feedback_type if feedback else None,
            'comments': feedback.comments if feedback else None
        }
    
    def _calculate_derived_metrics(self, performance_data: Dict) -> Dict[str, Any]:
        """Calculate derived metrics for ML features"""
        # These would be more complex in reality
        return {
            'rpe_increase_per_set': None,  # Would calculate from individual sets
            'rep_decrease_per_set': None   # Would calculate from individual sets
        }
    
    def _calculate_data_quality(self, record: MLTrainingData) -> float:
        """Calculate a data quality score 0.0 to 1.0"""
        score = 0.0
        total_fields = 0
        completed_fields = 0
        
        # Check required fields
        required_fields = [
            record.user_id, record.exercise_id, record.workout_session_id,
            record.session_date, record.planned_sets, record.completed_sets
        ]
        
        for field in required_fields:
            total_fields += 1
            if field is not None:
                completed_fields += 1
        
        # Check important fields
        important_fields = [
            record.age_years, record.fitness_level, record.current_weight_kg,
            record.muscle_group, record.completion_rate, record.average_rpe
        ]
        
        for field in important_fields:
            total_fields += 1
            if field is not None:
                completed_fields += 1
        
        return completed_fields / total_fields if total_fields > 0 else 0.0
    
    # ================= BATCH PROCESSING =================
    
    def backfill_historical_data(self, days_back: int = 90):
        """Extract data from historical workouts"""
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Get all completed sessions in date range
        sessions = self.db.query(WorkoutSession).filter(
            WorkoutSession.status == "completed",
            WorkoutSession.start_time >= cutoff_date
        ).all()
        
        total_records = 0
        
        for session in sessions:
            # Check if already extracted
            existing = self.db.query(MLTrainingData).filter(
                MLTrainingData.workout_session_id == session.id
            ).first()
            
            if not existing:
                records = self.extract_and_store_workout_data(session.id)
                if records:
                    total_records += len(records)
        
        return total_records
    
    def get_training_data_for_user(self, user_id: uuid.UUID, 
                                  limit: int = 100) -> list[MLTrainingData]:
        """Get ML training data for a specific user"""
        return self.db.query(MLTrainingData).filter(
            MLTrainingData.user_id == user_id,
            MLTrainingData.is_training_ready == True
        ).order_by(MLTrainingData.session_date.desc()).limit(limit).all()
    
    def export_to_csv(self, filepath: str):
        """Export training data to CSV for ML training"""
        import pandas as pd
        
        data = self.db.query(MLTrainingData).filter(
            MLTrainingData.is_training_ready == True
        ).all()
        
        # Convert to DataFrame
        df = pd.DataFrame([{
            'user_id': str(d.user_id),
            'exercise_id': str(d.exercise_id),
            'age': d.age_years,
            'gender': d.gender,
            'fitness_level': d.fitness_level,
            'experience_months': d.experience_months,
            'weight_kg': float(d.current_weight_kg) if d.current_weight_kg else None,
            'muscle_group': d.muscle_group,
            'equipment': d.equipment,
            'planned_sets': d.planned_sets,
            'completed_sets': d.completed_sets,
            'planned_reps': d.planned_reps_per_set,
            'completed_reps': d.completed_reps_per_set,
            'planned_weight_kg': float(d.planned_weight_kg) if d.planned_weight_kg else None,
            'actual_weight_kg': float(d.actual_weight_kg) if d.actual_weight_kg else None,
            'completion_rate': float(d.completion_rate) if d.completion_rate else None,
            'average_rpe': float(d.average_rpe) if d.average_rpe else None,
            'total_volume_kg': float(d.total_volume_kg) if d.total_volume_kg else None,
            'session_date': d.session_date,
            'day_of_week': d.day_of_week,
            'energy_level': d.session_energy_level,
            'days_since_last': d.days_since_last_workout
        } for d in data])
        
        df.to_csv(filepath, index=False)
        return len(df)