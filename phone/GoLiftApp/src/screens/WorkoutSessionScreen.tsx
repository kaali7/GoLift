import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  CheckCircle2,
  Trophy,
  Play,
  RotateCcw
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { GradientButton } from '../components/GradientButton';
import { Card } from '../components/Card';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  weight: number;
  sequence_order: number;
}

export const WorkoutSessionScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  
  // Timer state
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await api.get('/v1/session/active');
        if (Array.isArray(res.data)) {
          setExercises(res.data.sort((a, b) => a.sequence_order - b.sequence_order));
        }
      } catch (error) {
        console.error('Error starting session:', error);
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerActive]);

  const currentExercise = exercises[currentIndex];

  const handleNext = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setTimer(0);
      setIsTimerActive(true);
    } else if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSet(1);
      setTimer(0);
      setIsTimerActive(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await api.post('/v1/session/complete');
      setIsFinished(true);
    } catch (error) {
      console.error('Error completing session:', error);
      setIsFinished(true); // Fallback to success UI anyway
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.finishedContainer}>
        <View style={styles.successGlow} />
        <Trophy size={80} color="#F59E0B" style={styles.trophyIcon} />
        <Text style={styles.finishedTitle}>Workout Complete!</Text>
        <Text style={styles.finishedSubtitle}>You've successfully finished your training session.</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{exercises.length}</Text>
            <Text style={styles.summaryLabel}>Exercises</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{exercises.reduce((acc, ex) => acc + ex.sets, 0)}</Text>
            <Text style={styles.summaryLabel}>Total Sets</Text>
          </View>
        </View>

        <GradientButton 
          label="Back to Dashboard" 
          onPress={() => navigation.navigate('BottomTabs', { screen: 'Training' })} 
          size="lg"
          style={styles.finishedBtn}
        />
      </View>
    );
  }

  if (exercises.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#FFFFFF' }}>No active exercises found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: COLORS.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex * currentExercise.sets + currentSet) / (exercises.length * currentExercise.sets)) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>Exercise {currentIndex + 1} of {exercises.length}</Text>
        </View>
      </View>

      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseName}>{currentExercise.exercise_name}</Text>
        <Text style={styles.phaseLabel}>Main Training</Text>

        <View style={styles.setCircles}>
          {Array.from({ length: currentExercise.sets }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.setCircle, 
                i + 1 < currentSet && styles.setCircleDone,
                i + 1 === currentSet && styles.setCircleActive
              ]}
            >
              <Text style={[
                styles.setText,
                i + 1 === currentSet && styles.setCircleActiveText
              ]}>
                {i + 1 < currentSet ? <CheckCircle2 size={16} color="#FFFFFF" /> : i + 1}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.targetGrid}>
          <View style={styles.targetItem}>
             <Text style={styles.targetValue}>{currentExercise.reps}</Text>
             <Text style={styles.targetLabel}>Target Reps</Text>
          </View>
          <View style={styles.targetItem}>
             <Text style={styles.targetValue}>{currentExercise.weight}kg</Text>
             <Text style={styles.targetLabel}>Weight</Text>
          </View>
        </View>

        {isTimerActive && (
          <View style={styles.timerContainer}>
            <Clock size={20} color={COLORS.primary} />
            <Text style={styles.timerText}>Rest: {formatTime(timer)}</Text>
            <TouchableOpacity onPress={() => setIsTimerActive(false)}>
              <RotateCcw size={16} color={COLORS.text.secondaryDark} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <GradientButton 
          label={currentSet === currentExercise.sets && currentIndex === exercises.length - 1 ? "Finish Workout" : "Next Set"} 
          onPress={handleNext} 
          size="xl"
          style={styles.nextBtn}
          icon={<ChevronRight size={24} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.text.secondaryDark,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  exerciseContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  exerciseName: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 40,
  },
  setCircles: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 48,
  },
  setCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  setCircleActive: {
    backgroundColor: COLORS.primaryTransparent,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  setCircleDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  setText: {
    color: COLORS.text.secondaryDark,
    fontWeight: '900',
    fontSize: 16,
  },
  setCircleActiveText: {
    color: COLORS.primary,
  },
  targetGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-around',
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  targetLabel: {
    fontSize: 10,
    color: COLORS.text.secondaryDark,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  timerContainer: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 99,
  },
  timerText: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextBtn: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  finishedContainer: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  trophyIcon: {
    marginBottom: 32,
  },
  finishedTitle: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  finishedSubtitle: {
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  summaryGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.text.secondaryDark,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  finishedBtn: {
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
