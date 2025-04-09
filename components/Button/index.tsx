import React from 'react';
import styled, { css, useTheme } from 'styled-components/native';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ThemeType } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const theme = useTheme() as ThemeType;

  return (
    <ButtonContainer
      onPress={onPress}
      type={type}
      disabled={disabled || isLoading}
      fullWidth={fullWidth}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={type === 'outline' ? theme.primary : theme.buttonText}
        />
      ) : (
        <ButtonText type={type}>{title}</ButtonText>
      )}
    </ButtonContainer>
  );
};

const ButtonContainer = styled(TouchableOpacity)<{
  type: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled: boolean;
  fullWidth: boolean;
}>`
  padding: 14px 20px;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-vertical: 8px;
  ${({ fullWidth }: { fullWidth: boolean }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
  ${({
    type,
    disabled,
    theme,
  }: {
    type: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled: boolean;
    theme: ThemeType;
  }) => {
    switch (type) {
      case 'primary':
        return css`
          background-color: ${disabled ? theme.separator : theme.primary};
        `;
      case 'secondary':
        return css`
          background-color: ${disabled ? theme.secondary : theme.card};
          border: 1px solid ${theme.primary};
        `;
      case 'danger':
        return css`
          background-color: ${disabled ? theme.separator : theme.red};
        `;
      case 'outline':
        return css`
          background-color: transparent;
          border: 1px solid ${disabled ? theme.separator : theme.primary};
        `;
      default:
        return null;
    }
  }}
`;

const ButtonText = styled(Text)<{
  type: 'primary' | 'secondary' | 'danger' | 'outline';
}>`
  font-size: 16px;
  font-weight: 600;
  color: ${({
    type,
    theme,
  }: {
    type: 'primary' | 'secondary' | 'danger' | 'outline';
    theme: ThemeType;
  }) =>
    type === 'primary' || type === 'danger' ? theme.buttonText : theme.primary};
`;

export default Button;
