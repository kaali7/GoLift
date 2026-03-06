import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import api from '../services/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    const { email, password, full_name } = formData;
    if (!email || !password || !full_name) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/v1/auth/register', formData);
      // On success, go to verification
      navigation.navigate('VerifyEmail', { email });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.h1, styles.title]}>Create Account</Text>
          <Text style={TYPOGRAPHY.label}>Join GoLift to start your fitness journey</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.full_name}
            onChangeText={(val) => setFormData({ ...formData, full_name: val })}
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            placeholder="example@email.com"
            value={formData.email}
            onChangeText={(val) => setFormData({ ...formData, email: val })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(val) => setFormData({ ...formData, password: val })}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            label="Sign Up"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={TYPOGRAPHY.body}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    color: COLORS.text.primaryLight,
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.destructive,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
