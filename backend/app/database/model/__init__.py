# Import all models for Alembic
from app.database.model.exercise import Exercise, WorkoutTemplate, TemplateExercise
from app.database.model.ml import MLModel,WorkoutRecommendation,ExerciseRecommendation,MLTrainingData
from app.database.model.tracking import WorkoutSet, UserFeedback, UserProgress
from app.database.model.user import User, UserProfile, BodyMeasurement
from app.database.model.user_auth import TokenBlacklist
from app.database.model.workout import  UserWorkoutPlan, UserWorkouts, UserExercise, WorkoutSession, SessionExercise


# Export all models for easy import
__all__ = [
    # User models
    "User",
    "UserProfile",
    "BodyMeasurement",
    
    # Exercise models
    "Exercise",
    "WorkoutTemplate",
    "TemplateExercise",
    
    # Workout models
    "UserWorkoutPlan",
    "UserWorkouts",
    "UserExercise",
    "WorkoutSession",
    "SessionExercise",
    
    # Tracking models
    "WorkoutSet",
    "UserFeedback",
    "UserProgress",
    
    # ML models
    "MLModel",
    "WorkoutRecommendation",
    "ExerciseRecommendation",
    "MLTrainingData",
    
    # Auth models
    "TokenBlacklist"
]