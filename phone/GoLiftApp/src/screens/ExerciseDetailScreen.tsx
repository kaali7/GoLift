import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ChevronLeft, 
  Trophy, 
  Target, 
  Info,
  Play,
  Dumbbell
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface ExerciseDetail {
  id: string;
  name: string;
  description: string;
  muscles_targeted: string[];
  equipment_needed: string[];
  instructions: string[];
  difficulty: string;
}

export const ExerciseDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { exerciseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await api.get(`/v1/exercises/${exerciseId}`);
        setExercise(res.data);
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [exerciseId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#FFFFFF' }}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageHeader}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(11,11,15,1)']}
            style={styles.imageOverlay}
          />
          <View style={styles.placeholderImage}>
            <Dumbbell size={80} color="rgba(139, 92, 246, 0.2)" />
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
               <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{exercise.difficulty || 'Intermediate'}</Text>
               </View>
            </View>
            <Text style={styles.name}>{exercise.name}</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
               <Target size={20} color={COLORS.primary} />
               <Text style={styles.statLabel}>Target</Text>
               <Text style={styles.statValue}>{exercise.muscles_targeted?.[0] || 'Strength'}</Text>
            </View>
            <View style={styles.statItemDivider} />
            <View style={styles.statItem}>
               <Dumbbell size={20} color={COLORS.primary} />
               <Text style={styles.statLabel}>Equipment</Text>
               <Text style={styles.statValue}>{exercise.equipment_needed?.[0] || 'Dumbbells'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Execution Guide</Text>
          <View style={styles.instructionsContainer}>
             {exercise.instructions?.length > 0 ? (
               exercise.instructions.map((step, index) => (
                 <View key={index} style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                       <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                 </View>
               ))
             ) : (
               <Text style={styles.noDataText}>Start position, movement, and finish position instruction details go here.</Text>
             )}
          </View>

          <Text style={styles.sectionTitle}>Muscle Focus</Text>
          <View style={styles.muscleTags}>
             {(exercise.muscles_targeted || ['Chest', 'Triceps', 'Shoulders']).map((muscle, index) => (
               <View key={index} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>{muscle}</Text>
               </View>
             ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
         <GradientButton 
           label="View Form Video" 
           onPress={() => {}} 
           variant="secondary"
           size="lg"
           style={styles.actionBtn}
           icon={<Play size={18} color={COLORS.primary} />}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageHeader: {
    height: 300,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -20,
    zIndex: 2,
  },
  headerInfo: {
    marginBottom: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  difficultyText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 28,
    marginBottom: 12,
  },
  description: {
    color: COLORS.text.secondaryDark,
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statItemDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.text.secondaryDark,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 8,
  },
  instructionsContainer: {
    marginBottom: 32,
  },
  instructionStep: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 22,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  muscleTagText: {
    color: COLORS.text.secondaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#0B0B0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtn: {
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: COLORS.text.secondaryDark,
    fontStyle: 'italic',
    fontSize: 13,
  }
});
