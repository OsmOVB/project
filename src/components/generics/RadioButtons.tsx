import React from 'react';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { ButtonGroupProps, ButtonGroup } from './button-group/ButtonGroup';

type RadioButtonsProps<T> = Omit<ButtonGroupProps<T>, 'buttons' | 'selectedIndex' | 'onPress'> & {
  buttons: T[];
  selectedIndex: number;
  onPress: (index: number) => void;
  containerStyle?: ViewStyle; 
};

const Container = styled.View`
  width: 100%;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  /* Estilos adicionais para o ButtonGroup */
` as typeof ButtonGroup;

export const RadioButtons = <T extends string>({
  buttons,
  selectedIndex,
  onPress,
  containerStyle,
  selectedButtonColor,
}: RadioButtonsProps<T>) => {
  return (
    <Container style={containerStyle}>
      <StyledButtonGroup
        buttons={buttons}
        selectedIndex={selectedIndex}
        onPress={onPress}
        selectedButtonColor={selectedButtonColor}
      />
    </Container>
  );
};
