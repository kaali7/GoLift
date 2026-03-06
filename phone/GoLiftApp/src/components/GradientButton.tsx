import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  colors?: string[];
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  colors,
}) => {
  const isPrimary = variant === 'primary';
  const gradientColors = colors || (isPrimary ? COLORS.gradients.primary : undefined);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, height: 36 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 28, fontSize: 17, height: 52 };
      case 'xl':
        return { paddingVertical: 16, paddingHorizontal: 32, fontSize: 19, height: 64 };
      case 'md':
      default:
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: 15, height: 44 };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => (
    loading ? (
      <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? COLORS.primary : "#FFFFFF"} />
    ) : (
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            TYPOGRAPHY.button,
            styles.text,
            isPrimary || variant === 'danger' ? { color: '#FFFFFF' } : { color: COLORS.primary },
            { fontSize: sizeStyles.fontSize },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </View>
    )
  );

  if (isPrimary && gradientColors) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.base, { height: sizeStyles.height }, disabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: 14 }]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles.secondaryBase,
        variant === 'danger' && styles.dangerBase,
        variant === 'ghost' && styles.ghostBase,
        { height: sizeStyles.height },
        disabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBase: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  dangerBase: {
    backgroundColor: COLORS.destructive,
    borderColor: COLORS.destructive,
  },
  ghostBase: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.5,
  },
});
