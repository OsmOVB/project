import React from 'react';
import { Button, ButtonText } from '@styles/global';
import { ButtonProps } from './types';

export const CancelButton = ({
  padding,
  width,
  disabled,
  onPress,
  label = 'Cancelar',
  textColor = '#7C7C7C',
  borderColor = '#7C7C7C',
}: ButtonProps) => (
  <Button
    disabled={disabled}
    width={width}
    padding={padding}
    borderWidth={1.5}
    borderColor={borderColor}
    backgroundColor='#FFF'
    onPress={onPress}
  >
    <ButtonText
      color={textColor}
    >
      {label}
    </ButtonText>
  </Button>
);

