import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { 
  Settings, 
  Award, 
  Activity, 
  Flame,
  Trophy,
  Sparkles
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation<any>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        await Promise.all([
          api.get('/v1/users/me/body-metrics'),
          api.get('/v1/workout/get_all')
        ]);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <View style={styles.badge}>
            <Award size={14} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.userName}>{user?.full_name || 'Athlete'}</Text>
        <Text style={styles.userSub}>Level 12 • Powerlifter</Text>
        
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigate('Settings')}>
            <Settings size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>PERSONAL RECORDS</Text>
      <View style={styles.prGrid}>
          {[
              { name: 'BENCH PRESS', val: '100kg', icon: <Flame size={16} color="#F59E0B" /> },
              { name: 'SQUAT', val: '140kg', icon: <Trophy size={16} color="#8B5CF6" /> },
              { name: 'DEADLIFT', val: '180kg', icon: <Sparkles size={16} color="#10B981" /> },
              { name: 'OHP', val: '65kg', icon: <Activity size={16} color="#3B82F6" /> }
          ].map((pr, i) => (
              <Card key={i} style={styles.prCard}>
                  <View style={styles.prIconBox}>{pr.icon}</View>
                  <Text style={styles.prVal}>{pr.val}</Text>
                  <Text style={styles.prLab}>{pr.name}</Text>
              </Card>
          ))}
      </View>

      <Text style={styles.sectionTitle}>ACTIVITY TIMELINE</Text>
      <View style={styles.timeline}>
          {[
              { title: 'Push Day Session', date: 'Today, 08:30 AM', vol: '4,500kg' },
              { title: 'Leg Day Core', date: 'Yesterday, 06:15 PM', vol: '8,200kg' }
          ].map((act, i) => (
              <Card key={i} style={styles.timelineCard}>
                   <View style={styles.timelineContent}>
                        <View style={styles.timelineIcon}>
                            <Activity size={18} color="#8B5CF6" />
                        </View>
                        <View style={styles.timelineInfo}>
                            <Text style={styles.timelineTitle}>{act.title}</Text>
                            <Text style={styles.timelineDate}>{act.date}</Text>
                        </View>
                        <Text style={styles.timelineVol}>{act.vol}</Text>
                   </View>
              </Card>
          ))}
      </View>

      <Text style={styles.sectionTitle}>BODY METRICS</Text>
      <Card style={styles.metricsCard}>
         <View style={styles.metricRow}>
            <Text style={styles.metricLab}>WEIGHT</Text>
            <Text style={styles.metricVal}>85kg</Text>
         </View>
         <View style={styles.metricDivider} />
         <View style={styles.metricRow}>
            <Text style={styles.metricLab}>HEIGHT</Text>
            <Text style={styles.metricVal}>180cm</Text>
         </View>
      </Card>

      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#8B5CF6',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userSub: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topActions: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 32,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  prGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
  },
  prCard: {
      width: (width - 52) / 2,
      padding: 16,
      borderRadius: 24,
      backgroundColor: '#1E293B',
  },
  prIconBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
  },
  prVal: {
      fontSize: 20,
      fontWeight: '900',
      color: '#FFFFFF',
  },
  prLab: {
      fontSize: 9,
      color: '#64748B',
      textTransform: 'uppercase',
      marginTop: 2,
      letterSpacing: 1,
  },
  timeline: {
      gap: 12,
  },
  timelineCard: {
      padding: 12,
      borderRadius: 20,
      backgroundColor: '#1E293B',
  },
  timelineContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  timelineIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
  },
  timelineInfo: {
      flex: 1,
      marginLeft: 12,
  },
  timelineTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
  },
  timelineDate: {
      fontSize: 10,
      color: '#64748B',
  },
  timelineVol: {
      fontSize: 14,
      fontWeight: '900',
      color: '#10B981',
  },
  metricsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricLab: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
  },
  metricVal: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  metricDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  logoutBtn: {
    marginTop: 48,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#F87171',
    fontWeight: '900',
    letterSpacing: 2,
  }
});
