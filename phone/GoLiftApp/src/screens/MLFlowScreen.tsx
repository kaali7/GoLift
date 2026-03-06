import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  Sparkles, 
  ChevronLeft,
  CheckCircle2,
  Zap,
  Target
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import api from '../services/api';

export const MLFlowScreen = () => {
  const navigation = useNavigation<any>();
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<'intro' | 'generating' | 'success'>('intro');

  const handleGenerate = async () => {
    setGenerating(true);
    setStep('generating');
    try {
      await api.post('/v1/workout/generate');
      setStep('success');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      setStep('intro');
    } finally {
      setGenerating(false);
    }
  };

  const renderBenefit = (icon: any, title: string) => (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        {icon}
      </View>
      <Text style={styles.benefitText}>{title}</Text>
    </View>
  );

  if (step === 'generating') {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.animationContainer}>
          <View style={styles.orbitGlow} />
          <Sparkles size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.generatingTitle}>AI is Crafting Your Plan</Text>
        <Text style={styles.generatingText}>Analyzing your profile and optimizing volume...</Text>
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.successIcon}>
          <CheckCircle2 size={64} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text style={styles.successTitle}>Plan Optimized!</Text>
        <Text style={styles.successText}>Your personalized training schedule is ready to go.</Text>
        <GradientButton 
          label="View My Plan" 
          onPress={() => navigation.navigate('BottomTabs', { screen: 'Training' })} 
          size="lg"
          style={styles.successBtn}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>AI Generator</Text>
          <Text style={styles.subtitle}>Personalized Automation</Text>
        </View>
      </View>

      <View style={styles.introContent}>
        <View style={styles.iconCircle}>
          <Sparkles size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.introTitle}>Intelligent Training</Text>
        <Text style={styles.introDescription}>
          Our AI model analyzes your physical metrics and goals to create the most efficient workout split for your body.
        </Text>

        <View style={styles.benefitsGrid}>
          {renderBenefit(<Zap size={20} color={COLORS.primary} />, 'Optimized Volume')}
          {renderBenefit(<Target size={20} color={COLORS.primary} />, 'Smart Progression')}
          {renderBenefit(<CheckCircle2 size={20} color={COLORS.primary} />, 'Balanced Recovery')}
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            This plan will replace your current active workout. You can always change it later in your profile.
          </Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <GradientButton 
          label="Generate My Plan" 
          onPress={handleGenerate} 
          size="xl"
          style={styles.generateBtn}
        />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
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
    fontSize: 24,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: COLORS.text.secondaryDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  introContent: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  introTitle: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  introDescription: {
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  benefitsGrid: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    marginTop: 40,
    gap: 16,
  },
  generateBtn: {
    width: '100%',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.text.secondaryDark,
    fontWeight: '600',
  },
  animationContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  orbitGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    opacity: 0.1,
  },
  generatingTitle: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  generatingText: {
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  successTitle: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
    marginBottom: 40,
  },
  successBtn: {
    width: '100%',
  },
});
