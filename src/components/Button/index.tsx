import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { ThemeType } from '@/src/theme';

type TypeButton = 'primary' | 'secondary' | 'danger' | 'outline' | 'fab';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  type?: TypeButton;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const { theme } = useTheme(); // <- tema sem styled-components

  const isFab = type === 'fab';

  const containerStyle: ViewStyle[] = [
    !isFab && styles.base,
    fullWidth && styles.fullWidth,
    isFab ? fabStyle(theme) : getTypeStyle(type, disabled, theme),
    style ?? {},
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle = getTextStyle(type, theme);

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={type === 'outline' ? theme.primary : theme.buttonText}
        />
      ) : isFab ? (
        <AntDesign name="plus" size={26} color={theme.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

function fabStyle(theme: any): ViewStyle {
  return {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.primary,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  };
}

function getTypeStyle(
  type: TypeButton,
  disabled: boolean,
  theme: ThemeType
): ViewStyle {
  const base: ViewStyle = {
    height: 50,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  };

  switch (type) {
    case 'primary':
      return {
        ...base,
        backgroundColor: disabled ? theme.separator : theme.primary,
      };
    case 'secondary':
      return {
        ...base,
        backgroundColor: disabled ? theme.secondary : theme.card,
        borderWidth: 1,
        borderColor: theme.primary,
      };
    case 'danger':
      return {
        ...base,
        backgroundColor: disabled ? theme.separator : theme.red,
      };
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.separator : theme.primary,
      };
    default:
      return base;
  }
}

function getTextStyle(type: TypeButton, theme: ThemeType): TextStyle {
return {
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
  color:
    type === 'primary' || type === 'danger'
      ? theme.buttonText
      : type === 'secondary'
      ? theme.textPrimary
      : type === 'outline' || type === 'fab'
      ? theme.primary
      : theme.buttonText,
};

}

const styles = StyleSheet.create({
  base: {
    height: 60,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;
