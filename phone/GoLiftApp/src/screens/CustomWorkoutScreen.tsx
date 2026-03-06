import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check, 
  Dumbbell, 
  X, 
  Search,
  Activity,
  Calendar,
  Settings as SettingsIcon,
  ChevronDown
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import api from '../services/api';

const { width } = Dimensions.get('window');

// --- Types ---
interface Metadata {
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  duration_weeks: number;
}

interface SplitDay {
  type: 'workout' | 'recovery' | 'rest';
  name: string;
}

interface Exercise {
  id: string;
  name: string;
  target_muscle_group: string;
  equipment: string;
}

interface SelectedExercise {
  temp_id: string;
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number;
  rest_seconds: number;
  stage: string;
}

interface BuilderState {
  step: number;
  metadata: Metadata;
  weekly_split: Record<number, SplitDay>;
  exercises: Record<number, SelectedExercise[]>;
}

const INITIAL_STATE: BuilderState = {
  step: 1,
  metadata: {
    name: "",
    description: "",
    goal: "General Fitness",
    difficulty: "Intermediate",
    duration_weeks: 4
  },
  weekly_split: {
    1: { type: "workout", name: "Day 1" },
    2: { type: "workout", name: "Day 2" },
    3: { type: "rest", name: "Rest" },
    4: { type: "workout", name: "Day 4" },
    5: { type: "workout", name: "Day 5" },
    6: { type: "workout", name: "Day 6" },
    7: { type: "rest", name: "Rest" },
  },
  exercises: {}
};

export const CustomWorkoutScreen = () => {
  const navigation = useNavigation<any>();
  const [state, setState] = useState<BuilderState>(INITIAL_STATE);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showExercisePicker, setShowExercisePicker] = useState<number | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await api.get('/v1/exercise/all');
      setAvailableExercises(res.data);
    } catch (err) {
      console.error("Failed to fetch exercises", err);
    }
  };

  const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
  const prevStep = () => setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));

  // --- Step 1: Metadata ---
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basics</Text>
      <Text style={styles.stepSub}>What are we building?</Text>
      
      <Input
        label="Plan Name"
        value={state.metadata.name}
        onChangeText={(text) => setState(p => ({ ...p, metadata: { ...p.metadata, name: text } }))}
        placeholder="e.g. Summer Shred 2024"
      />
      
      <Input
        label="Description"
        value={state.metadata.description}
        onChangeText={(text) => setState(p => ({ ...p, metadata: { ...p.metadata, description: text } }))}
        placeholder="Describe your goals..."
        multiline
        numberOfLines={3}
      />

      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Duration (Weeks)</Text>
          <View style={styles.pickerContainer}>
            {[4, 6, 8, 12].map(w => (
              <TouchableOpacity 
                key={w}
                style={[styles.chip, state.metadata.duration_weeks === w && styles.chipActive]}
                onPress={() => setState(p => ({ ...p, metadata: { ...p.metadata, duration_weeks: w } }))}
              >
                <Text style={[styles.chipText, state.metadata.duration_weeks === w && styles.chipTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.pickerContainer}>
        {['Beginner', 'Intermediate', 'Advanced'].map(d => (
          <TouchableOpacity 
            key={d}
            style={[styles.chip, state.metadata.difficulty === d && styles.chipActive]}
            onPress={() => setState(p => ({ ...p, metadata: { ...p.metadata, difficulty: d } }))}
          >
            <Text style={[styles.chipText, state.metadata.difficulty === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button 
        label="Next: Weekly Split" 
        onPress={nextStep} 
        disabled={!state.metadata.name}
        style={styles.nextBtn}
      />
    </View>
  );

  // --- Step 2: Split ---
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Weekly Split</Text>
      <Text style={styles.stepSub}>Configure your weekly rhythm</Text>
      
      {Object.entries(state.weekly_split).map(([day, split]) => (
        <Card key={day} style={styles.splitCard}>
          <View style={styles.splitRow}>
            <View>
              <Text style={styles.dayName}>Day {day}</Text>
              <TextInput 
                style={styles.dayInput}
                value={split.name}
                onChangeText={(text) => setState(p => ({
                  ...p,
                  weekly_split: { ...p.weekly_split, [day]: { ...split, name: text } }
                }))}
              />
            </View>
            <View style={styles.typeSwitcher}>
              {['workout', 'recovery', 'rest'].map(t => (
                <TouchableOpacity 
                  key={t}
                  onPress={() => setState(p => ({
                    ...p,
                    weekly_split: { ...p.weekly_split, [day]: { ...split, type: t as any } }
                  }))}
                  style={[styles.typeBtn, split.type === t && styles.typeBtnActive]}
                >
                  <Text style={[styles.typeBtnText, split.type === t && styles.typeBtnTextActive]}>
                    {t.charAt(0).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
      ))}

      <View style={styles.btnRow}>
        <Button label="Back" onPress={prevStep} variant="secondary" style={styles.halfBtn} />
        <Button label="Next: Exercises" onPress={nextStep} style={styles.halfBtn} />
      </View>
    </View>
  );

  // --- Step 3: Day Editor ---
  const handleAddExercise = (day: number, ex: Exercise) => {
    const newEx: SelectedExercise = {
      temp_id: Math.random().toString(36).substr(2, 9),
      exercise_id: ex.id,
      name: ex.name,
      sets: 3,
      reps: "10-12",
      weight: 0,
      rest_seconds: 60,
      stage: "Main Work"
    };

    setState(p => ({
      ...p,
      exercises: {
        ...p.exercises,
        [day]: [...(p.exercises[day] || []), newEx]
      }
    }));
    setShowExercisePicker(null);
  };

  const removeExercise = (day: number, tempId: string) => {
    setState(p => ({
      ...p,
      exercises: {
        ...p.exercises,
        [day]: p.exercises[day].filter(e => e.temp_id !== tempId)
      }
    }));
  };

  const updateExercise = (day: number, tempId: string, field: keyof SelectedExercise, value: any) => {
    setState(p => ({
      ...p,
      exercises: {
        ...p.exercises,
        [day]: p.exercises[day].map(e => e.temp_id === tempId ? { ...e, [field]: value } : e)
      }
    }));
  };

  const renderExerciseItem = (day: number, ex: SelectedExercise) => (
    <Card key={ex.temp_id} style={styles.exCard}>
      <View style={styles.exHeader}>
        <Text style={styles.exName}>{ex.name}</Text>
        <TouchableOpacity onPress={() => removeExercise(day, ex.temp_id)}>
          <X size={20} color={COLORS.destructive} />
        </TouchableOpacity>
      </View>
      <View style={styles.exInputs}>
        <View style={styles.exInputGroup}>
          <Text style={styles.exLabel}>Sets</Text>
          <TextInput 
            keyboardType="numeric"
            value={ex.sets.toString()}
            onChangeText={(v) => updateExercise(day, ex.temp_id, 'sets', parseInt(v) || 0)}
            style={styles.exInput}
          />
        </View>
        <View style={styles.exInputGroup}>
          <Text style={styles.exLabel}>Reps</Text>
          <TextInput 
            value={ex.reps}
            onChangeText={(v) => updateExercise(day, ex.temp_id, 'reps', v)}
            style={styles.exInput}
          />
        </View>
        <View style={styles.exInputGroup}>
          <Text style={styles.exLabel}>Weight</Text>
          <TextInput 
            keyboardType="numeric"
            value={ex.weight.toString()}
            onChangeText={(v) => updateExercise(day, ex.temp_id, 'weight', parseFloat(v) || 0)}
            style={styles.exInput}
          />
        </View>
      </View>
    </Card>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Exercises</Text>
      <Text style={styles.stepSub}>Build your routine day by day</Text>

      {Object.entries(state.weekly_split)
        .filter(([_, split]) => split.type === 'workout')
        .map(([day, split]) => (
          <View key={day} style={styles.dayEditor}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{split.name}</Text>
              <TouchableOpacity 
                style={styles.addExBtn}
                onPress={() => setShowExercisePicker(parseInt(day))}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addExText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {(state.exercises[parseInt(day)] || []).map(ex => renderExerciseItem(parseInt(day), ex))}
          </View>
        ))}

      <View style={styles.btnRow}>
        <Button label="Back" onPress={prevStep} variant="secondary" style={styles.halfBtn} />
        <Button label="Review" onPress={nextStep} style={styles.halfBtn} />
      </View>
    </View>
  );

  // --- Step 4: Review ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare data for API
      const exercisesList: any[] = [];
      Object.entries(state.exercises).forEach(([day, exes]) => {
        exes.forEach((ex, idx) => {
          exercisesList.push({
            exercise_id: ex.exercise_id,
            day_number: parseInt(day),
            order_id: idx + 1,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_seconds: ex.rest_seconds,
            stage_of_exercises: ex.stage
          });
        });
      });

      const payload = {
        name: state.metadata.name,
        description: state.metadata.description,
        difficulty_level: state.metadata.difficulty,
        workout_type: state.metadata.goal,
        duration_weeks: state.metadata.duration_weeks,
        exercises: exercisesList
      };

      const res = await api.post('/v1/workout/user', payload);
      const newWorkoutId = res.data.id;

      Alert.alert(
        "Success!",
        "Workout plan created successfully. Would you like to activate it now?",
        [
          { text: "Later", onPress: () => navigation.navigate('BottomTabs') },
          { 
            text: "Activate", 
            onPress: async () => {
              try {
                await api.post(`/v1/workout/${newWorkoutId}/activate`);
                navigation.navigate('BottomTabs');
              } catch (e) {
                Alert.alert("Error", "Could not activate plan.");
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to create workout plan.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review</Text>
      <Text style={styles.stepSub}>Final check before publishing</Text>

      <Card style={styles.reviewCard}>
        <Text style={styles.reviewName}>{state.metadata.name}</Text>
        <Text style={styles.reviewMeta}>
          {state.metadata.difficulty} • {state.metadata.duration_weeks} Weeks
        </Text>
        <Text style={styles.reviewDesc}>{state.metadata.description}</Text>
      </Card>

      <Text style={styles.summaryLabel}>Routine Summary</Text>
      {Object.entries(state.weekly_split).map(([day, split]) => (
        <View key={day} style={styles.summaryRow}>
          <Text style={styles.summaryDay}>Day {day}: {split.name}</Text>
          <Text style={styles.summaryType}>
            {split.type === 'workout' ? `${(state.exercises[parseInt(day)] || []).length} Exercises` : split.type}
          </Text>
        </View>
      ))}

      <View style={styles.btnRow}>
        <Button label="Back" onPress={prevStep} variant="secondary" style={styles.halfBtn} />
        <Button 
          label={loading ? "Creating..." : "Create Plan"} 
          onPress={handleSubmit} 
          disabled={loading}
          style={styles.halfBtn} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Custom Builder</Text>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map(s => (
              <View 
                key={s} 
                style={[styles.progressDot, state.step >= s && styles.progressDotActive]} 
              />
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {state.step === 1 && renderStep1()}
        {state.step === 2 && renderStep2()}
        {state.step === 3 && renderStep3()}
        {state.step === 4 && renderStep4()}
      </ScrollView>

      {/* Exercise Picker Modal-ish */}
      {showExercisePicker !== null && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(null)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Search size={18} color={COLORS.text.secondaryDark} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={COLORS.text.secondaryDark}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <FlatList
              data={availableExercises.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.exerciseListItem}
                  onPress={() => handleAddExercise(showExercisePicker!, item)}
                >
                  <View>
                    <Text style={styles.listItemName}>{item.name}</Text>
                    <Text style={styles.listItemSub}>{item.target_muscle_group} • {item.equipment}</Text>
                  </View>
                  <Plus size={20} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 20,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  scroll: {
    padding: 24,
    paddingBottom: 60,
  },
  stepContainer: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  stepSub: {
    fontSize: 14,
    color: COLORS.text.secondaryDark,
    marginTop: -16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.secondaryDark,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipActive: {
    backgroundColor: COLORS.primaryTransparent,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text.secondaryDark,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primary,
  },
  nextBtn: {
    marginTop: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  halfBtn: {
    flex: 1,
  },
  splitCard: {
    padding: 16,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  dayInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    padding: 0,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 4,
  },
  typeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text.secondaryDark,
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  dayEditor: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryTransparent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addExText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exCard: {
    padding: 16,
    marginBottom: 10,
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  exInputGroup: {
    flex: 1,
  },
  exLabel: {
    fontSize: 10,
    color: COLORS.text.secondaryDark,
    marginBottom: 4,
  },
  exInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 24,
    backgroundColor: COLORS.primaryTransparent,
    borderColor: COLORS.primary,
  },
  reviewName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  reviewMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  reviewDesc: {
    fontSize: 14,
    color: COLORS.text.secondaryDark,
    marginTop: 12,
    lineHeight: 20,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  summaryDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryType: {
    fontSize: 12,
    color: COLORS.text.secondaryDark,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listItemSub: {
    fontSize: 12,
    color: COLORS.text.secondaryDark,
    marginTop: 2,
  }
});
