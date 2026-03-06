import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  KeyboardTypeOptions 
} from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

interface InputProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText = () => {},
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  containerStyle,
  inputStyle,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[TYPOGRAPHY.label, styles.label]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        style={[
          styles.input,
          TYPOGRAPHY.body,
          error ? styles.inputError : styles.inputNormal,
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    color: COLORS.text.primaryLight,
  },
  inputNormal: {
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.background.light,
  },
  inputError: {
    borderColor: COLORS.destructive,
    backgroundColor: '#FEF2F2',
  },
  inputDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#9CA3AF',
  },
  errorText: {
    color: COLORS.destructive,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
