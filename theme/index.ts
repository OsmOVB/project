const darkTheme = {
  background: '#000000',
  text: '#FFFFFF',
  primary: '#007AFF',
  secondary: '#1c1c1e',
  border: '#333333',
  card: '#1c1c1e',
  notification: '#FF3B30',
  buttonText: '#FFFFFF',
  calendar: '#1c1c1e',
};

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#007AFF',
  secondary: '#f0f0f0',
  border: '#CCCCCC',
  card: '#FFFFFF',
  notification: '#FF3B30',
  buttonText: '#FFFFFF',
  calendar: '#f5f5f5',
};

export { darkTheme, lightTheme };

export interface ThemeType {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  card: string;
  notification: string;
  buttonText: string;
  calendar: string;
}
