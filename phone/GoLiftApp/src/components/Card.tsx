import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  description, 
  style, 
  contentStyle 
}) => {
  return (
    <View style={[styles.card, style]}>
      {(title || description) && (
        <View style={styles.header}>
          {title && <Text style={[TYPOGRAPHY.h2, styles.title]}>{title}</Text>}
          {description && <Text style={[TYPOGRAPHY.label, styles.description]}>{description}</Text>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface.dark, // Default to dark surface for premium look
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    // iOS shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    // Android shadow
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: COLORS.text.primaryDark,
    marginBottom: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 13,
    color: COLORS.text.secondaryDark,
    lineHeight: 18,
  },
  content: {
    // Optional content styling
  },
});
