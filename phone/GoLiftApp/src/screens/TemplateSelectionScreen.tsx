import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, 
  Calendar, 
  Trophy,
  ArrowRight,
  Info
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { GradientButton } from '../components/GradientButton';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface Template {
  id: string;
  name: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
}

export const TemplateSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/v1/templates/');
        setTemplates(res.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const renderTemplateCard = ({ item }: { item: Template }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('PlanDetails', { templateId: item.id, isTemplate: true })}
      activeOpacity={0.8}
    >
      <Card style={styles.templateCard}>
        <View style={styles.cardHeader}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{item.difficulty_level}</Text>
          </View>
          <View style={styles.durationBadge}>
            <Calendar size={12} color={COLORS.text.secondaryDark} />
            <Text style={styles.durationText}>{item.duration_weeks}W</Text>
          </View>
        </View>
        
        <Text style={styles.templateName}>{item.name}</Text>
        <Text numberOfLines={2} style={styles.templateDesc}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailsText}>View Schedule</Text>
          <ArrowRight size={16} color={COLORS.primary} />
        </View>
      </Card>
    </TouchableOpacity>
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
        <View>
          <Text style={styles.title}>Expert Plans</Text>
          <Text style={styles.subtitle}>Select a training template</Text>
        </View>
      </View>

      <FlatList
        data={templates}
        renderItem={renderTemplateCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Info size={48} color={COLORS.text.secondaryDark} />
            <Text style={styles.emptyText}>No templates found</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 24,
    paddingBottom: 40,
  },
  templateCard: {
    marginBottom: 16,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  difficultyText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: COLORS.text.secondaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  templateName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  templateDesc: {
    fontSize: 13,
    color: COLORS.text.secondaryDark,
    lineHeight: 18,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
  },
  viewDetailsText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.text.secondaryDark,
  }
});
