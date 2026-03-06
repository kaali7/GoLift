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
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

export const VerifyEmailScreen = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email = route.params?.email || '';

  const handleSubmit = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/v1/auth/verify', {
        email,
        verification_code: code,
      });
      setSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Verification failed. Please check the code.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/v1/auth/resend_verification_code', { email });
      // Might want to show a toast here
    } catch (err: any) {
      setError('Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.h1, styles.title]}>Verify Email</Text>
          <Text style={TYPOGRAPHY.label}>Enter the code sent to {email}</Text>
        </View>

        <View style={styles.form}>
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>Email verified successfully! Redirecting...</Text>
            </View>
          ) : (
            <>
              <Input
                label="Verification Code"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                label="Verify"
                onPress={handleSubmit}
                loading={loading}
                style={styles.button}
              />

              <Button
                label="Resend Code"
                variant="ghost"
                onPress={handleResend}
                style={styles.resendButton}
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
  resendButton: {
    marginTop: 8,
  },
});
