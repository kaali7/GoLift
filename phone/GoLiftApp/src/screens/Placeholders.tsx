import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.container}>
    <Text style={[styles.text, TYPOGRAPHY.h1]}>{name} Screen</Text>
    <Text style={TYPOGRAPHY.body}>Placeholder for {name} functionality</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
  },
  text: {
    color: COLORS.primary,
    marginBottom: 8,
  },
});

export const LoginScreen = () => <PlaceholderScreen name="Login" />;
export const RegisterScreen = () => <PlaceholderScreen name="Register" />;
export const VerifyEmailScreen = () => <PlaceholderScreen name="Verify Email" />;
export const ForgotPasswordScreen = () => <PlaceholderScreen name="Forgot Password" />;
export const ResetPasswordScreen = () => <PlaceholderScreen name="Reset Password" />;

export const TrainingScreen = () => <PlaceholderScreen name="Training" />;
export const InsightsScreen = () => <PlaceholderScreen name="Insights" />;
export const ProfileScreen = () => <PlaceholderScreen name="Profile" />;
export const SettingsScreen = () => <PlaceholderScreen name="Settings" />;
export const ExerciseDetailScreen = () => <PlaceholderScreen name="Exercise Detail" />;
export const WorkoutSessionScreen = () => <PlaceholderScreen name="Workout Session" />;
export const OnboardingScreen = () => <PlaceholderScreen name="Onboarding" />;
export const PlanDetailsScreen = () => <PlaceholderScreen name="Plan Details" />;
export const TemplateSelectionScreen = () => <PlaceholderScreen name="Template Selection" />;
export const DashboardScreen = () => <PlaceholderScreen name="Dashboard" />;
