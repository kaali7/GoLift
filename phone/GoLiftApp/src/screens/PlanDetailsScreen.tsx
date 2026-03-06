import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ChevronLeft, 
  Info,
  Calendar,
  Dumbbell,
  ArrowRight,
  Sparkles,
  Moon
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  day_number: number;
  stage_of_exercises: string;
  sets: number;
  reps: string;
  weight: number;
}

interface PlanDetails {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  template_exercises?: Exercise[];
  exercises?: Exercise[];
}

export const PlanDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { templateId, planId, isTemplate } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<PlanDetails | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const endpoint = isTemplate ? `/v1/templates/${templateId}` : `/v1/workout/${planId}`;
        const res = await api.get(endpoint);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching plan details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [templateId, planId, isTemplate]);

  const handleActivate = async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      if (isTemplate) {
        await api.post(`/v1/workout/temp?template_id=${data.id}`);
      } else {
        await api.post(`/v1/workout/${data.id}/activate`);
      }
      navigation.navigate('BottomTabs', { screen: 'Training' });
    } catch (error) {
      console.error('Failed to activate plan:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const planExercises = data?.template_exercises || data?.exercises || [];
  const days = Array.from(new Set(planExercises.map(ex => ex.day_number))).sort((a, b) => a - b);
  const dayExercises = planExercises.filter(ex => ex.day_number === selectedDay);

  const renderExerciseItem = (ex: Exercise) => (
    <View key={ex.id} style={styles.exerciseItem}>
      <View style={styles.exerciseDot} />
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{ex.exercise_name}</Text>
        <Text style={styles.exerciseStats}>
          {ex.sets} sets • {ex.reps} reps {ex.weight > 0 ? `• ${ex.weight}kg` : ''}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{data?.name}</Text>
          <Text style={styles.subtitle}>{data?.duration_weeks} Week Program</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Card style={styles.descCard}>
          <Text style={styles.description}>{data?.description}</Text>
        </Card>

        <View style={styles.daysHeader}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <Text style={styles.daysIndicator}>{days.length} Days / Week</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {days.length > 0 ? days.map(day => (
            <TouchableOpacity 
              key={day} 
              onPress={() => setSelectedDay(day)}
              style={[styles.dayTab, selectedDay === day && styles.activeDayTab]}
            >
              <Text style={[styles.dayTabText, selectedDay === day && styles.activeDayTabText]}>Day {day}</Text>
            </TouchableOpacity>
          )) : (
            <Text style={styles.noDaysText}>No scheduled days</Text>
          )}
        </ScrollView>

        <View style={styles.dayContent}>
          {dayExercises.length > 0 ? (
            <Card style={styles.dayCard}>
               <View style={styles.dayHeader}>
                  <Dumbbell size={20} color={COLORS.primary} />
                  <Text style={styles.dayTitle}>Workout Summary</Text>
               </View>
               <View style={styles.exercisesList}>
                  {dayExercises.map(renderExerciseItem)}
               </View>
            </Card>
          ) : (
            <View style={styles.restDayContainer}>
               <Moon size={40} color={COLORS.text.secondaryDark} />
               <Text style={styles.restDayTitle}>Rest & Recovery</Text>
               <Text style={styles.restDayText}>No exercises scheduled for this day.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton 
          label={submitting ? "Activating..." : (isTemplate ? "Activate This Program" : "Set as Active")} 
          onPress={handleActivate} 
          disabled={submitting}
          size="xl"
          style={styles.activateBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 20,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  descCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0,
    marginBottom: 32,
  },
  description: {
    color: COLORS.text.secondaryDark,
    lineHeight: 22,
    fontSize: 14,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  daysIndicator: {
    fontSize: 12,
    color: COLORS.text.secondaryDark,
    fontWeight: 'bold',
  },
  daysScroll: {
    marginBottom: 24,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 10,
  },
  activeDayTab: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    color: COLORS.text.secondaryDark,
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  activeDayTabText: {
    color: '#FFFFFF',
  },
  dayContent: {
    minHeight: 200,
  },
  dayCard: {
    padding: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  exercisesList: {
    gap: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  exerciseStats: {
    color: COLORS.text.secondaryDark,
    fontSize: 12,
  },
  restDayContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  restDayTitle: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  restDayText: {
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: COLORS.background.dark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  activateBtn: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDaysText: {
    color: COLORS.text.secondaryDark,
    fontStyle: 'italic',
  }
});
