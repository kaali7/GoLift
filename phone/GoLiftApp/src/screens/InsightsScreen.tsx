import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { 
  TrendingUp, 
  Trophy, 
  Zap, 
  Clock, 
  Target,
  Flame,
  ChevronRight,
  TrendingDown
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import api from '../services/api';

const { width } = Dimensions.get('window');

export const InsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/v1/insights/overview');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: COLORS.background.dark,
    backgroundGradientTo: COLORS.background.dark,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
      fontWeight: 'bold',
      fontFamily: 'Inter-Medium',
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    }
  };

  const volumeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [1200, 1500, 1100, 1800, 2000, 2400, 2200],
      color: (opacity = 1) => COLORS.primary,
    }]
  };

  const muscleData = [
    { name: 'Chest', population: 25, color: COLORS.primary, legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Back', population: 20, color: '#A78BFA', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Legs', population: 35, color: '#10B981', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Arms', population: 20, color: '#3B82F6', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Analyzing performance...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>GoLift</Text>
        <View style={styles.avatarMini}>
          <Text style={styles.avatarInitial}>K</Text>
        </View>
      </View>

      {/* 4-Card Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Workouts', val: data?.summary.total_workouts || 0, icon: <TrendingUp size={14} color="#60A5FA" />, perc: '↓ 0%' },
          { label: 'Minutes', val: '0', icon: <Clock size={14} color="#818CF8" />, perc: '↓ 0%' },
          { label: 'Consistency', val: '0%', icon: <Target size={14} color="#A78BFA" />, perc: '' },
          { label: 'Streak', val: '0d', icon: <Flame size={14} color="#F87171" />, perc: '' },
        ].map((item, i) => (
          <Card key={i} style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconBox}>{item.icon}</View>
              {item.perc !== '' && <Text style={styles.percText}>{item.perc}</Text>}
            </View>
            <Text style={styles.statVal}>{item.val}</Text>
            <Text style={styles.statLab}>{item.label}</Text>
          </Card>
        ))}
      </View>

      {/* Strength Matrix Chart */}
      <Card style={styles.matrixCard}>
        <View style={styles.matrixHeader}>
          <Trophy size={18} color="#F59E0B" />
          <Text style={styles.matrixTitle}>STRENGTH MATRIX</Text>
        </View>
        <LineChart
          data={volumeData}
          width={width - 72}
          height={180}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withDots={false}
          withShadow={true}
        />
        <View style={styles.chartLabels}>
           <Text style={styles.chartLabel}>W-1</Text>
           <Text style={styles.chartLabel}>Current</Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PR TIMELINE</Text>
      </View>
      
      <View style={styles.timeline}>
        {[
            { name: 'Deadlift', val: '180kg', date: 'Yesterday' },
            { name: 'Bench Press', val: '100kg', date: '2 days ago' }
        ].map((pr, i) => (
            <Card key={i} style={styles.prItem}>
                <View style={styles.prContent}>
                    <View style={styles.prIconBox}>
                        <Trophy size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.prInfo}>
                        <Text style={styles.prName}>{pr.name}</Text>
                        <Text style={styles.prDate}>{pr.date}</Text>
                    </View>
                    <Text style={styles.prValue}>{pr.val}</Text>
                    <ChevronRight size={16} color={COLORS.text.secondaryDark} />
                </View>
            </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B5CF6', // GoLift Purple
    letterSpacing: -0.5,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#1E293B',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percText: {
    fontSize: 10,
    color: '#F87171',
    fontWeight: 'bold',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
  },
  statLab: {
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  matrixCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    marginBottom: 24,
  },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  matrixTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -20,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeline: {
    gap: 12,
  },
  prItem: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
  },
  prContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  prIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  prDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  prValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#8B5CF6',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
  },
});
