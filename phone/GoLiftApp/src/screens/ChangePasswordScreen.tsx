import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import api from '../services/api';

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdate = async () => {
    if (form.newPassword.length < 6) {
      return Alert.alert("Error", "New password must be at least 6 characters.");
    }
    if (form.newPassword !== form.confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    setLoading(true);
    try {
      await api.post('/v1/auth/change-password', {
        old_password: form.oldPassword,
        new_password: form.newPassword
      });
      Alert.alert("Success", "Password changed successfully");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to change password. Please check your old password.");
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
        <Text style={styles.title}>Security</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.iconCircle}>
            <Lock size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.pageSubtitle}>Update your password regularly to keep your account secure.</Text>

          <Input 
            label="Current Password"
            secureTextEntry
            value={form.oldPassword}
            onChangeText={(v) => setForm(p => ({ ...p, oldPassword: v }))}
          />
          <Input 
            label="New Password"
            secureTextEntry
            value={form.newPassword}
            onChangeText={(v) => setForm(p => ({ ...p, newPassword: v }))}
          />
          <Input 
            label="Confirm New Password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={(v) => setForm(p => ({ ...p, confirmPassword: v }))}
          />

          <Button 
            label={loading ? "Updating..." : "Update Password"} 
            onPress={handleUpdate} 
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pageSubtitle: {
    color: COLORS.text.secondaryDark,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  saveBtn: {
    marginTop: 20,
    width: '100%',
  }
});
