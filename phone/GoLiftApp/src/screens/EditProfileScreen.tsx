import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    date_of_birth: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    fitness_level: '',
    primary_goal: '',
    experience_months: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/v1/users/me/profile');
      if (res.data) {
        setFormData(prev => ({
          ...prev,
          date_of_birth: res.data.date_of_birth || '',
          gender: res.data.gender || '',
          height_cm: res.data.height_cm?.toString() || '',
          weight_kg: res.data.weight_kg?.toString() || '',
          fitness_level: res.data.fitness_level || '',
          primary_goal: res.data.primary_goal || '',
          experience_months: res.data.experience_months?.toString() || ''
        }));
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update basic user info
      await api.patch('/v1/users/me', {
        full_name: formData.full_name,
        email: formData.email
      });

      // Update detailed profile info
      await api.patch('/v1/users/me/profile', {
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        fitness_level: formData.fitness_level || null,
        primary_goal: formData.primary_goal || null,
        experience_months: formData.experience_months ? parseInt(formData.experience_months) : null
      });

      await updateUser({ full_name: formData.full_name, email: formData.email });
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Input 
            label="Full Name"
            value={formData.full_name}
            onChangeText={(v) => setFormData(p => ({ ...p, full_name: v }))}
          />
          <Input 
            label="Email"
            value={formData.email}
            editable={false}
          />
          
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input 
                label="Height (cm)"
                value={formData.height_cm}
                onChangeText={(v) => setFormData(p => ({ ...p, height_cm: v }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Input 
                label="Weight (kg)"
                value={formData.weight_kg}
                onChangeText={(v) => setFormData(p => ({ ...p, weight_kg: v }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input 
            label="Primary Goal"
            value={formData.primary_goal}
            onChangeText={(v) => setFormData(p => ({ ...p, primary_goal: v }))}
            placeholder="e.g. Muscle Gain, Weight Loss"
          />

          <Input 
            label="Fitness Level"
            value={formData.fitness_level}
            onChangeText={(v) => setFormData(p => ({ ...p, fitness_level: v }))}
            placeholder="e.g. Intermediate"
          />

          <Button 
            label={loading ? "Saving..." : "Save Profile"} 
            onPress={handleSave} 
            disabled={loading}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: {
    padding: 24,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    marginTop: 20,
  }
});
