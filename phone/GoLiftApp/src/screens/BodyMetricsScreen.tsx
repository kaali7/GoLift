import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Calendar, Activity as ActivityIcon } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import api from '../services/api';

interface BodyMetric {
  id: string;
  measurement_date: string;
  body_fat_pct: number;
  muscle_mass_kg?: number;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  notes?: string;
}

export const BodyMetricsScreen = () => {
  const navigation = useNavigation();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [form, setForm] = useState({
    body_fat_pct: '',
    muscle_mass_kg: '',
    weight_kg: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    notes: ''
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/v1/users/me/body-metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async () => {
    setAdding(true);
    try {
      const payload = {
        measurement_date: new Date().toISOString().split('T')[0],
        body_fat_pct: parseFloat(form.body_fat_pct) || 0,
        muscle_mass_kg: parseFloat(form.muscle_mass_kg) || null,
        chest_cm: parseFloat(form.chest_cm) || null,
        waist_cm: parseFloat(form.waist_cm) || null,
        hips_cm: parseFloat(form.hips_cm) || null,
        notes: form.notes || null
      };

      await api.post('/v1/users/me/body-metrics', payload);
      Alert.alert("Success", "Measurements recorded");
      setShowAddForm(false);
      fetchMetrics();
    } catch (err) {
      Alert.alert("Error", "Failed to add measurements");
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Body Metrics</Text>
        <TouchableOpacity 
          onPress={() => setShowAddForm(!showAddForm)}
          style={[styles.addBtn, showAddForm && styles.addBtnActive]}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {showAddForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>New Entry</Text>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input 
                  label="Body Fat %"
                  value={form.body_fat_pct}
                  onChangeText={(v) => setForm(p => ({ ...p, body_fat_pct: v }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Input 
                  label="Muscle Mass (kg)"
                  value={form.muscle_mass_kg}
                  onChangeText={(v) => setForm(p => ({ ...p, muscle_mass_kg: v }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input 
                  label="Chest (cm)"
                  value={form.chest_cm}
                  onChangeText={(v) => setForm(p => ({ ...p, chest_cm: v }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Input 
                  label="Waist (cm)"
                  value={form.waist_cm}
                  onChangeText={(v) => setForm(p => ({ ...p, waist_cm: v }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Button 
              label={adding ? "Saving..." : "Save Entry"} 
              onPress={handleAddMetric}
              disabled={adding}
              style={styles.saveBtn}
            />
          </Card>
        )}

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : metrics.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIcon size={48} color={COLORS.text.secondaryDark} />
            <Text style={styles.emptyText}>No measurements recorded yet.</Text>
          </View>
        ) : (
          metrics.map((m) => (
            <Card key={m.id} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={styles.dateLabel}>
                  <Calendar size={14} color={COLORS.primary} />
                  <Text style={styles.dateText}>{m.measurement_date}</Text>
                </View>
                <Text style={styles.fatPct}>{m.body_fat_pct}% BF</Text>
              </View>
              <View style={styles.metricGrid}>
                {m.muscle_mass_kg && (
                  <View style={styles.metricItem}>
                    <Text style={styles.mValue}>{m.muscle_mass_kg}</Text>
                    <Text style={styles.mLabel}>Muscle (kg)</Text>
                  </View>
                )}
                {m.chest_cm && (
                  <View style={styles.metricItem}>
                    <Text style={styles.mValue}>{m.chest_cm}</Text>
                    <Text style={styles.mLabel}>Chest (cm)</Text>
                  </View>
                )}
                {m.waist_cm && (
                  <View style={styles.metricItem}>
                    <Text style={styles.mValue}>{m.waist_cm}</Text>
                    <Text style={styles.mLabel}>Waist (cm)</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
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
    flex: 1,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addBtnActive: {
    backgroundColor: COLORS.primary,
  },
  scroll: {
    padding: 24,
    gap: 16,
  },
  formCard: {
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    borderColor: COLORS.primaryTransparent,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    marginTop: 10,
  },
  metricCard: {
    padding: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  dateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.secondaryDark,
  },
  fatPct: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  metricItem: {
    minWidth: 70,
  },
  mValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  mLabel: {
    fontSize: 10,
    color: COLORS.text.secondaryDark,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: COLORS.text.secondaryDark,
    fontSize: 14,
  }
});
