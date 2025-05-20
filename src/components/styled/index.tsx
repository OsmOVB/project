import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacityProps,
  TextProps,
} from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { ThemeType } from '../../theme';

// Container
export const Container = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return <View style={[styles.container, { backgroundColor: theme.background }]}>{children}</View>;
};

// Title
export const Title = ({ children }: TextProps) => {
  const { theme } = useTheme();
  return <Text style={[styles.title, { color: theme.text }]}>{children}</Text>;
};

// Subtitle
export const Subtitle = ({ children }: TextProps) => {
  const { theme } = useTheme();
  return <Text style={[styles.subtitle, { color: theme.subText }]}>{children}</Text>;
};

// Input
export const Input = (props: TextInputProps) => {
  const { theme } = useTheme();
  return (
    <TextInput
      {...props}
      placeholderTextColor={theme.subText}
      style={[
        styles.input,
        {
          backgroundColor: theme.inputBg,
          borderColor: theme.border,
          color: theme.text,
        },
        props.style,
      ]}
    />
  );
};

// ErrorText
export const ErrorText = ({ children }: TextProps) => {
  return <Text style={styles.errorText}>{children}</Text>;
};

// Button
export const Button = ({ children, style, ...rest }: TouchableOpacityProps & { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      {...rest}
      style={[
        styles.button,
        {
          backgroundColor: theme.primary,
        },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
};

// ButtonText
export const ButtonText = ({ children }: TextProps) => {
  const { theme } = useTheme();
  return <Text style={[styles.buttonText, { color: theme.buttonText }]}>{children}</Text>;
};

// Card
export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }, style]}>
      {children}
    </View>
  );
};

// CardTitle
export const CardTitle = ({ children }: TextProps) => {
  const { theme } = useTheme();
  return <Text style={[styles.cardTitle, { color: theme.text }]}>{children}</Text>;
};

// CardText
export const CardText = ({ children }: TextProps) => {
  const { theme } = useTheme();
  return <Text style={[styles.cardText, { color: theme.text }]}>{children}</Text>;
};

// ThemeToggle
export const ThemeToggle = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.themeToggle, { borderBottomColor: theme.border }]}>
      {children}
    </View>
  );
};

// ThemeToggleLabel
export const ThemeToggleLabel = ({ children }: TextProps) => {
  const { theme } = useTheme();
  return <Text style={[styles.themeToggleLabel, { color: theme.text }]}>{children}</Text>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    height: 55,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 8,
  },
  themeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  themeToggleLabel: {
    fontSize: 16,
  },
});
