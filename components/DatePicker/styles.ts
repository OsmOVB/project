import styled from 'styled-components/native';

export const Container = styled.View`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: #ccc;
  padding: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
`;

export const DateText = styled.Text`
  flex: 1;
  font-size: 16px;
  color: #333;
`;

export const IconContainer = styled.View`
  margin-left: 10px;
`;

export const DateInput = styled.TextInput`
  font-size: 16px;
  color: #333;
  padding: 5px;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 4px;
  text-align: center;
  min-width: 50px;
`;
