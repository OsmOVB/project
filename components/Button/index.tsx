import React from 'react';
import styled, { css } from 'styled-components/native';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

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
    return (
        <ButtonContainer
            onPress={onPress}
            type={type}
            disabled={disabled || isLoading}
            fullWidth={fullWidth}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color={type === 'outline' ? '#007AFF' : '#fff'} />
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
    ${({ type, disabled }: { type: 'primary' | 'secondary' | 'danger' | 'outline'; disabled: boolean }) => {
        switch (type) {
            case 'primary':
                return css`
                    background-color: ${disabled ? '#A0CFFF' : '#007AFF'};
                `;
            case 'secondary':
                return css`
                    background-color: ${disabled ? '#E0E0E0' : '#F3F4F6'};
                    border: 1px solid #007AFF;
                `;
            case 'danger':
                return css`
                    background-color: ${disabled ? '#F5B7B1' : '#FF3B30'};
                `;
            case 'outline':
                return css`
                    background-color: transparent;
                    border: 1px solid ${disabled ? '#A0CFFF' : '#007AFF'};
                `;
            default:
                return null;
        }
    }}
`;

const ButtonText = styled(Text)<{ type: 'primary' | 'secondary' | 'danger' | 'outline' }>`
    font-size: 16px;
    font-weight: 600;
    color: ${({ type }: { type: 'primary' | 'secondary' | 'danger' | 'outline' }) =>
        type === 'primary' || type === 'danger' ? '#FFFFFF' : '#007AFF'};
`;

export default Button;
