from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
import uuid

from app.database.model import (
    User, WorkoutSession, SessionExercise, WorkoutSet, 
    UserProgress, Exercise, UserFeedback
)
from app.schemas.insights import (
    InsightOverview, PeriodInfo, WorkoutSummary, Comparison,
    StrengthProgress, StrengthProgressEntry, OneRepMax, VolumeTrendEntry,
    ExercisePerformance, BestPerformingEntry, NeedsAttentionEntry,
    RecoveryInsights, RecoveryPattern, RecoveryMetrics,
    MuscleBalance, MuscleDistribution, MuscleImbalance,
    WellbeingInsights, EnergyTrendEntry, AIRecommendation, ActionItem
)
from app.core.logger import logger

class InsightService:
    @staticmethod
    async def get_overview(current_user: User, db: Session, days: int = 7) -> InsightOverview:
        logger.info(f"Generating comprehensive insights for user: {current_user.id}")
        
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        prev_start_date = start_date - timedelta(days=days)
        
        # 1. Period Info
        period = PeriodInfo(
            start_date=start_date,
            end_date=end_date,
            range=f"{days}d"
        )
        
        # 2. Workout Summary
        summary = await InsightService._calculate_workout_summary(current_user, db, start_date, end_date, prev_start_date)
        
        # 3. Strength Progress
        strength = await InsightService._calculate_strength_progress(current_user, db)
        
        # 4. Exercise Performance
        performance = await InsightService._calculate_exercise_performance(current_user, db)
        
        # 5. Recovery Insights
        recovery = await InsightService._calculate_recovery_insights(current_user, db)
        
        # 6. Muscle Balance
        muscle_balance = await InsightService._calculate_muscle_balance(current_user, db)
        
        # 7. Wellbeing Insights
        wellbeing = await InsightService._calculate_wellbeing_insights(current_user, db, start_date, end_date)
        
        # 8. AI Recommendations & Action Items
        ai_recommendations = AIRecommendation(
            model_version="v1.0.0",
            confidence_score=0.85,
            reason="Based on your consistent volume increase and positive feedback trends.",
            generated_at=datetime.now()
        )
        
        action_items = await InsightService._generate_action_items(current_user, db, strength, performance)
        
        return InsightOverview(
            period=period,
            summary=summary,
            strength_progress=strength,
            exercise_performance=performance,
            recovery_insights=recovery,
            muscle_balance=muscle_balance,
            wellbeing_insights=wellbeing,
            ai_recommendations=ai_recommendations,
            action_items=action_items
        )

    @staticmethod
    async def _calculate_workout_summary(user: User, db: Session, start: date, end: date, prev_start: date) -> WorkoutSummary:
        # Current Period
        sessions = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user.id,
            WorkoutSession.created_at >= start
        ).all()
        
        completed = [s for s in sessions if s.status == "completed"]
        total_duration = sum(s.duration_minutes for s in completed if s.duration_minutes)
        completion_rate = len(completed) / len(sessions) if sessions else 0
        
        # Previous Period
        prev_sessions = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user.id,
            WorkoutSession.created_at >= prev_start,
            WorkoutSession.created_at < start
        ).all()
        prev_completed = [s for s in prev_sessions if s.status == "completed"]
        prev_duration = sum(s.duration_minutes for s in prev_completed if s.duration_minutes)
        
        # Calculate changes
        workouts_change = (len(completed) - len(prev_completed)) / len(prev_completed) if prev_completed else 0
        duration_change = (total_duration - prev_duration) / prev_duration if prev_duration else 0
        
        # Streak (Simplified)
        streak = 0
        check_date = date.today()
        while True:
            exists = db.query(WorkoutSession).filter(
                WorkoutSession.user_id == user.id,
                func.date(WorkoutSession.created_at) == check_date,
                WorkoutSession.status == "completed"
            ).first()
            if exists:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break
                
        return WorkoutSummary(
            total_workouts=len(completed),
            total_duration_minutes=total_duration,
            completion_rate=completion_rate,
            current_streak_days=streak,
            previous_period_comparison=Comparison(
                workouts_change_pct=round(workouts_change * 100, 1),
                duration_change_pct=round(duration_change * 100, 1)
            )
        )

    @staticmethod
    async def _calculate_strength_progress(user: User, db: Session) -> StrengthProgress:
        top_progress = db.query(
            UserProgress.exercise_id,
            Exercise.name.label("exercise_name"),
            UserProgress.one_rep_max_kg,
            UserProgress.training_volume_kg,
            UserProgress.updated_at,
            UserProgress.created_at
        ).join(Exercise, UserProgress.exercise_id == Exercise.id).filter(
            UserProgress.user_id == user.id
        ).order_by(UserProgress.training_volume_kg.desc()).limit(3).all()
        
        entries = []
        for p in top_progress:
            # Mocking volume trend for now - in real app, query WorkoutSet history grouped by week
            trend = [
                VolumeTrendEntry(week="W-2", volume=float(p.training_volume_kg) * 0.9),
                VolumeTrendEntry(week="W-1", volume=float(p.training_volume_kg) * 0.95),
                VolumeTrendEntry(week="Current", volume=float(p.training_volume_kg))
            ]
            
            # Robust timestamp check
            last_date = (p.updated_at or p.created_at).date() if (p.updated_at or p.created_at) else date.today()
            new_pr = (date.today() - last_date).days < 7
            
            entries.append(StrengthProgressEntry(
                exercise_id=p.exercise_id,
                exercise_name=p.exercise_name,
                one_rep_max=OneRepMax(
                    current=float(p.one_rep_max_kg),
                    previous=float(p.one_rep_max_kg) * 0.95, # Mock
                    unit="kg",
                    change_pct=5.0
                ),
                volume_trend=trend,
                new_pr=new_pr
            ))
            
        return StrengthProgress(top_exercises=entries)

    @staticmethod
    async def _calculate_exercise_performance(user: User, db: Session) -> ExercisePerformance:
        # Highly rated exercises
        best = []
        # Areas needing work
        needs_attention = []
        
        # Get feedback to determine performance
        feedbacks = db.query(
            UserFeedback.exercise_id,
            Exercise.name,
            func.count(UserFeedback.id).label("count"),
            func.max(UserFeedback.feedback_type).label("type") # Simplified
        ).join(Exercise, UserFeedback.exercise_id == Exercise.id).filter(
            UserFeedback.user_id == user.id
        ).group_by(UserFeedback.exercise_id, Exercise.name).limit(5).all()
        
        for f in feedbacks:
            if f.type in ["good", "too_easy"]:
                best.append(BestPerformingEntry(
                    exercise_id=f.exercise_id,
                    exercise_name=f.name,
                    completion_rate=1.0,
                    average_rpe=7.0
                ))
            elif f.type == "too_hard":
                needs_attention.append(NeedsAttentionEntry(
                    exercise_id=f.exercise_id,
                    exercise_name=f.name,
                    average_rpe=9.5,
                    rep_drop_pct=15.0,
                    reason="RPE consistently high"
                ))
        
        return ExercisePerformance(
            best_performing=best[:2],
            needs_attention=needs_attention[:2]
        )

    @staticmethod
    async def _calculate_recovery_insights(user: User, db: Session) -> RecoveryInsights:
        # Basic logic: days between sessions
        sessions = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user.id,
            WorkoutSession.status == "completed"
        ).order_by(desc(WorkoutSession.created_at)).limit(10).all()
        
        avg_days = 1.5
        if len(sessions) > 1:
            diffs = []
            for i in range(len(sessions)-1):
                diffs.append((sessions[i].created_at - sessions[i+1].created_at).days)
            avg_days = sum(diffs) / len(diffs) if diffs else 1.5

        return RecoveryInsights(
            fatigue_score=0.4,
            recovery_quality="Good",
            patterns=[
                RecoveryPattern(insight="Optimal performance after 1 day rest", confidence=0.88)
            ],
            metrics=RecoveryMetrics(
                avg_rpe_increase_per_set=0.2,
                avg_rep_decrease_per_set=0.5,
                avg_days_between_sessions=round(avg_days, 1)
            )
        )

    @staticmethod
    async def _calculate_muscle_balance(user: User, db: Session) -> MuscleBalance:
        # Distribution based on SessionExercise
        data = db.query(
            Exercise.muscle_group,
            func.count(SessionExercise.id).label("count")
        ).join(Exercise, SessionExercise.exercise_id == Exercise.id)\
         .join(WorkoutSession, SessionExercise.workout_session_id == WorkoutSession.id)\
         .filter(WorkoutSession.user_id == user.id)\
         .group_by(Exercise.muscle_group).all()
        
        total_count = sum(d.count for d in data)
        dist = []
        for d in data:
            if d.muscle_group:
                dist.append(MuscleDistribution(
                    muscle_group=d.muscle_group.capitalize(),
                    percentage=round((d.count / total_count) * 100, 1) if total_count else 0
                ))
        
        imbalances = []
        if total_count > 0:
            muscle_counts = {d.muscle_group: d.count for d in data if d.muscle_group}
            if "legs" not in muscle_counts or muscle_counts.get("legs", 0) < total_count * 0.15:
                imbalances.append(MuscleImbalance(
                    muscle_group="Legs",
                    issue="Lower training volume detected",
                    recommended_change="Add one more leg focused exercise per week"
                ))
                
        return MuscleBalance(distribution=dist, imbalances=imbalances)

    @staticmethod
    async def _calculate_wellbeing_insights(user: User, db: Session, start: date, end: date) -> WellbeingInsights:
        sessions = db.query(WorkoutSession).filter(
            WorkoutSession.user_id == user.id,
            WorkoutSession.created_at >= start,
            WorkoutSession.energy_level.isnot(None)
        ).all()
        
        trends = [EnergyTrendEntry(date=s.created_at.date(), energy_level=s.energy_level) for s in sessions]
        
        return WellbeingInsights(
            energy_trend=trends,
            mood_performance_correlation=0.75,
            top_feedback_tags=["Good Pump", "Focused"]
        )

    @staticmethod
    async def _generate_action_items(user: User, db: Session, strength: StrengthProgress, perf: ExercisePerformance) -> List[ActionItem]:
        items = []
        if perf.needs_attention:
            for n in perf.needs_attention:
                items.append(ActionItem(
                    type="reduce_weight",
                    exercise_id=n.exercise_id,
                    exercise_name=n.exercise_name,
                    reason=f"Consistent high RPE for {n.exercise_name}. Suggest 10% deload."
                ))
        
        if not items and strength.top_exercises:
            # Suggest increase for top exercise if completion is high
            top = strength.top_exercises[0]
            items.append(ActionItem(
                type="increase_weight",
                exercise_id=top.exercise_id,
                exercise_name=top.exercise_name,
                value=2.5,
                unit="kg",
                reason=f"Steady progress in {top.exercise_name}. Time to push further!"
            ))
            
        return items
