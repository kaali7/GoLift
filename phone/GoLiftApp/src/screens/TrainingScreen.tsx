import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { 
  Dumbbell, 
  ChevronRight,
  Plus
} from 'lucide-react-native';
import { Card } from '../components/Card';
import api from '../services/api';


export const TrainingScreen = () => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      await api.get('/v1/workout/active');
      await api.get('/v1/session/active');
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderStageHeader = (label: string, count: number) => (
    <View style={styles.stageHeader}>
      <View style={styles.stageTitleRow}>
        <Text style={styles.stageTitle}>{label}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addBtn}>
        <Plus size={16} color="#94A3B8" />
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
      >
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <Text style={styles.appName}>GoLift</Text>
                <View style={styles.avatarMini}>
                    <Text style={styles.avatarInitial}>K</Text>
                </View>
            </View>

            {/* Day Selector */}
            <View style={styles.daySelector}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                   <TouchableOpacity 
                    key={day} 
                    onPress={() => setSelectedDay(day)}
                    style={[styles.dayCircle, selectedDay === day && styles.dayCircleActive]}
                   >
                     <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
                     {day === 4 && <View style={styles.dayDot} />}
                   </TouchableOpacity>
                ))}
            </View>

            <View style={styles.workoutModeHeader}>
                <Text style={styles.dayHeader}>DAY {selectedDay}</Text>
                <View style={styles.modeBadge}>
                    <Dumbbell size={14} color="#8B5CF6" />
                    <Text style={styles.modeText}>WORKOUT MODE</Text>
                </View>
            </View>
        </View>

        <View style={styles.content}>
            {renderStageHeader('WARMUP', 1)}
            <Card style={styles.exerciseCard}>
                <View style={styles.exHeader}>
                    <Text style={styles.exTitle}>3/4 SIT-UP</Text>
                    <Plus size={18} color="#475569" style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
                <View style={styles.exStatsGrid}>
                    <View style={styles.exStatBox}><Text style={styles.exStatLabel}>SETS</Text><Text style={styles.exStatVal}>3</Text></View>
                    <View style={styles.exStatBox}><Text style={styles.exStatLabel}>REPS</Text><Text style={styles.exStatVal}>10</Text></View>
                    <View style={styles.exStatBox}><Text style={styles.exStatLabel}>KG</Text><Text style={styles.exStatVal}>0</Text></View>
                    <View style={styles.exStatBox}><Text style={styles.exStatLabel}>REST</Text><Text style={styles.exStatVal}>60</Text></View>
                </View>
            </Card>

            {renderStageHeader('MAIN', 0)}
            <View style={styles.emptyStage}>
                <Text style={styles.emptyStageText}>No exercises</Text>
            </View>

            {renderStageHeader('COOLDOWN', 0)}
            <View style={styles.emptyStage}>
                <Text style={styles.emptyStageText}>No exercises</Text>
            </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
         <TouchableOpacity style={styles.backBtn}>
            <Text style={styles.backText}>BACK</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.nextBtn}>
            <Text style={styles.nextText}>NEXT STEP</Text>
            <ChevronRight size={20} color="#FFFFFF" />
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B5CF6',
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#8B5CF6',
  },
  dayText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  dayDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  workoutModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeader: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  stageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 3,
  },
  countBadge: {
    backgroundColor: '#272C38',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
  },
  exHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  exTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  exStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exStatBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minWidth: 60,
  },
  exStatLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exStatVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyStage: {
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStageText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    gap: 12,
    backgroundColor: '#0F172A',
  },
  backBtn: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#64748B',
    fontWeight: '900',
    letterSpacing: 2,
  },
  nextBtn: {
    flex: 2,
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
