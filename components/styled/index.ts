import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { ThemeType } from '../../theme';

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: ThemeType }) => theme.background};
  padding: 20px;
  padding-top: 60px;
`;

export const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }: { theme: ThemeType }) => theme.text};
  margin-bottom: 24px;
  letter-spacing: -0.5px;
`;

export const Input = styled.TextInput`
  width: 100%;
  height: 50px;
  background-color: ${({ theme }: { theme: ThemeType }) => theme.secondary};
  border-radius: 12px;
  padding: 0 15px;
  margin-bottom: 15px;
  font-size: 16px;
  color: ${({ theme }: { theme: ThemeType }) => theme.text};
`;

export const Button = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: ${({ theme }: { theme: ThemeType }) => theme.primary};
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

export const GradientButton = styled(LinearGradient).attrs(({ theme }: { theme: ThemeType }) => ({
  colors: [theme.primary, theme.secondary],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
}))`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

export const ButtonText = styled.Text`
  color: ${({ theme }: { theme: ThemeType }) => theme.buttonText};
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.5px;
`;

export const ErrorText = styled.Text`
  color: #ff3b30;
  font-size: 14px;
  margin-bottom: 10px;
  margin-left: 5px;
`;

export const Card = styled.View`
  background-color: ${({ theme }: { theme: ThemeType }) => theme.card};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

export const CardTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }: { theme: ThemeType }) => theme.text};
  margin-bottom: 12px;
`;

export const CardText = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: ThemeType }) => theme.text};
  margin-bottom: 8px;
`;

export const ThemeToggle = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }: { theme: ThemeType }) => theme.border};
`;

export const ThemeToggleLabel = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: ThemeType }) => theme.text};
`;