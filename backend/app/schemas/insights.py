from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import date, datetime
import uuid

class PeriodInfo(BaseModel):
    start_date: date
    end_date: date
    range: str

class Comparison(BaseModel):
    workouts_change_pct: float
    duration_change_pct: float

class WorkoutSummary(BaseModel):
    total_workouts: int
    total_duration_minutes: int
    completion_rate: float
    current_streak_days: int
    previous_period_comparison: Comparison

class OneRepMax(BaseModel):
    current: float
    previous: float
    unit: str
    change_pct: float

class VolumeTrendEntry(BaseModel):
    week: str
    volume: float

class StrengthProgressEntry(BaseModel):
    exercise_id: uuid.UUID
    exercise_name: str
    one_rep_max: OneRepMax
    volume_trend: List[VolumeTrendEntry]
    new_pr: bool

class StrengthProgress(BaseModel):
    top_exercises: List[StrengthProgressEntry]

class BestPerformingEntry(BaseModel):
    exercise_id: uuid.UUID
    exercise_name: str
    completion_rate: float
    average_rpe: float

class NeedsAttentionEntry(BaseModel):
    exercise_id: uuid.UUID
    exercise_name: str
    average_rpe: float
    rep_drop_pct: float
    reason: str

class ExercisePerformance(BaseModel):
    best_performing: List[BestPerformingEntry]
    needs_attention: List[NeedsAttentionEntry]

class RecoveryPattern(BaseModel):
    insight: str
    confidence: float

class RecoveryMetrics(BaseModel):
    avg_rpe_increase_per_set: float
    avg_rep_decrease_per_set: float
    avg_days_between_sessions: float

class RecoveryInsights(BaseModel):
    fatigue_score: float
    recovery_quality: str
    patterns: List[RecoveryPattern]
    metrics: RecoveryMetrics

class MuscleDistribution(BaseModel):
    muscle_group: str
    percentage: float

class MuscleImbalance(BaseModel):
    muscle_group: str
    issue: str
    recommended_change: str

class MuscleBalance(BaseModel):
    distribution: List[MuscleDistribution]
    imbalances: List[MuscleImbalance]

class EnergyTrendEntry(BaseModel):
    date: date
    energy_level: int

class WellbeingInsights(BaseModel):
    energy_trend: List[EnergyTrendEntry]
    mood_performance_correlation: float
    top_feedback_tags: List[str]

class AIRecommendation(BaseModel):
    model_version: str
    confidence_score: float
    reason: str
    generated_at: datetime

class ActionItem(BaseModel):
    type: str # increase_weight, add_recovery_day, etc.
    exercise_id: Optional[uuid.UUID] = None
    exercise_name: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    reason: str

class InsightOverview(BaseModel):
    period: PeriodInfo
    summary: WorkoutSummary
    strength_progress: StrengthProgress
    exercise_performance: ExercisePerformance
    recovery_insights: RecoveryInsights
    muscle_balance: MuscleBalance
    wellbeing_insights: WellbeingInsights
    ai_recommendations: AIRecommendation
    action_items: List[ActionItem]

    model_config = ConfigDict(from_attributes=True)
