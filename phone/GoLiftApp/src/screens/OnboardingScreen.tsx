import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Scale, 
  User,
  Activity,
  Sparkles,
  CheckCircle2
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import api from '../services/api';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 'basics', title: 'The Basics', subtitle: 'Who are we training?' },
  { id: 'metrics', title: 'Body Metrics', subtitle: 'Your current starting point' },
  { id: 'goals', title: 'Your Goals', subtitle: 'What are we aiming for?' }
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    goal: 'muscle_gain',
    experience_level: 'intermediate'
  });

  const handleNext = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/v1/users/onboarding', {
        ...form,
        age: parseInt(form.age),
        weight: parseFloat(form.weight),
        height: parseFloat(form.height)
      });
      navigation.navigate('CreationHub');
    } catch (error) {
      console.error('Onboarding failed:', error);
      // Even if it fails, navigate to dashboard to not block the user
      navigation.navigate('BottomTabs');
    } finally {
      setLoading(false);
    }
  };

  const renderStepBasics = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Gender</Text>
      <View style={styles.choiceGrid}>
        {['male', 'female', 'other'].map(g => (
          <TouchableOpacity 
            key={g} 
            onPress={() => setForm({...form, gender: g})}
            style={[styles.choiceBtn, form.gender === g && styles.choiceBtnActive]}
          >
            <Text style={[styles.choiceText, form.gender === g && styles.choiceTextActive]}>
               {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 25"
        placeholderTextColor={COLORS.text.secondaryDark}
        keyboardType="numeric"
        value={form.age}
        onChangeText={val => setForm({...form, age: val})}
      />
    </View>
  );

  const renderStepMetrics = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 75.5"
        placeholderTextColor={COLORS.text.secondaryDark}
        keyboardType="numeric"
        value={form.weight}
        onChangeText={val => setForm({...form, weight: val})}
      />
      
      <Text style={[styles.inputLabel, { marginTop: 20 }]}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 180"
        placeholderTextColor={COLORS.text.secondaryDark}
        keyboardType="numeric"
        value={form.height}
        onChangeText={val => setForm({...form, height: val})}
      />
    </View>
  );

  const renderStepGoals = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Primary Goal</Text>
      <View style={styles.verticalChoices}>
        {[
          { id: 'muscle_gain', label: 'Build Muscle', icon: <Activity size={18} color={COLORS.primary} /> },
          { id: 'fat_loss', label: 'Lose Fat', icon: <Target size={18} color="#10B981" /> },
          { id: 'strength', label: 'Pure Strength', icon: <Sparkles size={18} color="#F59E0B" /> }
        ].map(goal => (
          <TouchableOpacity 
            key={goal.id} 
            onPress={() => setForm({...form, goal: goal.id})}
            style={[styles.verticalChoiceBtn, form.goal === goal.id && styles.verticalChoiceActive]}
          >
            <View style={styles.choiceIcon}>{goal.icon}</View>
            <Text style={[styles.verticalChoiceText, form.goal === goal.id && styles.choiceTextActive]}>{goal.label}</Text>
            {form.goal === goal.id && <CheckCircle2 size={18} color={COLORS.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {currentStepIndex > 0 ? (
          <TouchableOpacity onPress={() => setCurrentStepIndex(currentStepIndex - 1)} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : <View style={{ width: 44 }} />}
        
        <View style={styles.progressDots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentStepIndex && styles.activeDot]} />
          ))}
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepHeader}>
           <Text style={styles.stepTitle}>{STEPS[currentStepIndex].title}</Text>
           <Text style={styles.stepSubtitle}>{STEPS[currentStepIndex].subtitle}</Text>
        </View>

        {currentStepIndex === 0 && renderStepBasics()}
        {currentStepIndex === 1 && renderStepMetrics()}
        {currentStepIndex === 2 && renderStepGoals()}
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton 
          label={loading ? "Saving Profile..." : (currentStepIndex === STEPS.length - 1 ? "Start Training" : "Continue")} 
          onPress={handleNext} 
          disabled={loading}
          size="xl"
          style={styles.nextBtn}
          icon={!loading && <ChevronRight size={24} color="#FFFFFF" />}
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
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    paddingBottom: 100,
  },
  stepHeader: {
    marginBottom: 40,
  },
  stepTitle: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 32,
    marginBottom: 8,
  },
  stepSubtitle: {
    color: COLORS.text.secondaryDark,
    fontSize: 16,
  },
  stepContainer: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.text.secondaryDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  choiceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  choiceBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: COLORS.primary,
  },
  choiceText: {
    color: COLORS.text.secondaryDark,
    fontWeight: '700',
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  verticalChoices: {
    gap: 12,
  },
  verticalChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  verticalChoiceActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: COLORS.primary,
  },
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  verticalChoiceText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.secondaryDark,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextBtn: {
    width: '100%',
  }
});
