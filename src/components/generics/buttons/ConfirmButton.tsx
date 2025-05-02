import React from 'react';
import { Button, ButtonText } from '@styles/global';
import { ButtonProps } from './types';

export const ConfirmButton = ({
  width,
  padding,
  disabled,
  opacity,
  onPress,
  label,
  backgroundColor = '#007AE6',
  bold,
}: ButtonProps) => (
  <Button
    width={width}
    padding={padding}
    backgroundColor={backgroundColor}
    disabled={disabled}
    onPress={onPress}
    style={{ opacity: opacity ?? 1 }}
  >
    <ButtonText fontWeight={bold ? 'bold' : 'normal'}>
      {label || 'Não Selecionar'}
    </ButtonText>
  </Button>
);

