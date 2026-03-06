import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  LayoutTemplate, 
  Sparkles, 
  PenTool, 
  ChevronLeft,
  ArrowRight
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';

const { width } = Dimensions.get('window');

export const CreationHub = () => {
  const navigation = useNavigation<any>();

  const renderOption = (
    title: string, 
    description: string, 
    items: string[], 
    icon: any, 
    onPress: () => void,
    isHighlighted: boolean = false
  ) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.optionContainer}>
      <Card style={[styles.card, isHighlighted && styles.highlightedCard]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        
        <View style={styles.featureList}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={[styles.dot, { backgroundColor: isHighlighted ? COLORS.primary : COLORS.text.secondaryDark }]} />
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.footerText, isHighlighted && { color: COLORS.primary }]}>Get Started</Text>
          <ArrowRight size={16} color={isHighlighted ? COLORS.primary : COLORS.text.secondaryDark} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Setup Training</Text>
          <Text style={styles.subtitle}>Choose your path</Text>
        </View>
      </View>

      <View style={styles.options}>
        {renderOption(
          'Browse Templates',
          'Select from a library of proven workouts designed by fitness experts.',
          ['Beginner to Advanced', 'Proven methods', 'Ready instantly'],
          <LayoutTemplate size={32} color={COLORS.primary} />,
          () => navigation.navigate('TemplateSelection')
        )}

        {renderOption(
          'AI Generator',
          'Let our AI build a personalized plan based on your experience and goals.',
          ['Personalized volume', 'Adapts to profile', 'Smart progression'],
          <Sparkles size={32} color={COLORS.primary} />,
          () => navigation.navigate('MLFlow'),
          true
        )}

        {renderOption(
          'Build Custom',
          'Design your own weekly schedule from scratch with full control.',
          ['Custom exercises', 'Flexible splits', 'Total control'],
          <PenTool size={32} color={COLORS.primary} />,
          () => navigation.navigate('CustomWorkout')
        )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
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
  options: {
    gap: 16,
  },
  optionContainer: {
    width: '100%',
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
  highlightedCard: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.text.secondaryDark,
    lineHeight: 20,
    marginBottom: 20,
  },
  featureList: {
    gap: 8,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.text.secondaryDark,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.secondaryDark,
  },
});
