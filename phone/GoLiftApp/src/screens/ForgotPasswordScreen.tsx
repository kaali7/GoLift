import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
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

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/v1/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to send reset link.');
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
          <Text style={[TYPOGRAPHY.h1, styles.title]}>Forgot Password</Text>
          <Text style={TYPOGRAPHY.label}>Enter your email to receive a reset link</Text>
        </View>

        <View style={styles.form}>
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Reset link sent! Please check your email.</Text>
              <Button
                label="Back to Login"
                variant="ghost"
                onPress={() => navigation.navigate('Login')}
                style={styles.backButton}
              />
            </View>
          ) : (
            <>
              <Input
                label="Email Address"
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                label="Send Reset Link"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
              />

              <Button
                label="Back to Login"
                variant="ghost"
                onPress={() => navigation.navigate('Login')}
                style={styles.backButton}
              />
            </>
          )}
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
  errorText: {
    color: COLORS.destructive,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  successContainer: {
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
  backButton: {
    marginTop: 8,
  },
});
