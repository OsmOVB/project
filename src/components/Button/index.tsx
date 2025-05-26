import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { ThemeType } from '@/src/theme';

type TypeButton = 'primary' | 'secondary' | 'danger' | 'outline' | 'fab' | 'icon';

interface BaseButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

interface TextButtonProps extends BaseButtonProps {
  type?: Exclude<TypeButton, 'icon'>;
  title: string;
}

interface IconButtonProps extends BaseButtonProps {
  type: 'icon';
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title?: string;
}

type ButtonProps = TextButtonProps | IconButtonProps;

const Button: React.FC<ButtonProps> = (props) => {
  const { theme } = useTheme();
  const isIcon = props.type === 'icon';

  const containerStyle: ViewStyle[] = [
    !isIcon && styles.base,
    props.fullWidth && styles.fullWidth,
    isIcon
      ? styles.iconButton
      : getTypeStyle(props.type ?? 'primary', props.disabled ?? false, theme),
    props.style ?? {},
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle = getTextStyle(props.type ?? 'primary', theme);
  const iconColor = 'iconColor' in props && props.iconColor ? props.iconColor : theme.primary;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={props.onPress}
      disabled={props.disabled || props.isLoading}
      activeOpacity={0.8}
    >
      {props.isLoading ? (
        <ActivityIndicator color={theme.buttonText} />
      ) : isIcon ? (
        <View style={styles.iconWrapper}>
          <Ionicons name={props.iconName} size={20} color={iconColor} />
          {props.title && (
            <Text style={[styles.iconTitle, { color: iconColor }]}>{props.title}</Text>
          )}
        </View>
      ) : (
        <Text style={textStyle}>{props.title}</Text>
      )}
    </TouchableOpacity>
  );
};

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
        : theme.primary,
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
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Button;
