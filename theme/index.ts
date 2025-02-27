const darkTheme = {
  text: '#FFFFFF',
  primary: '#007AFF',
  secondary: '#1c1c1e',
  border: '#333333',
  notification: '#FF3B30',
  buttonText: '#FFFFFF',
  calendar: '#1c1c1e',
  background: "#1C1C1E",
  card: "#2C2C2E",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  separator: "#3A3A3C",
  blue: "#0A84FF",
  green: "#30D158",
  red: "#FF453A",
  button: "#0A84FF",
  alertBackground: "#2C2C2E",
};

const lightTheme = {
  text: '#000000',
  primary: '#007AFF',
  secondary: '#f0f0f0',
  border: '#CCCCCC',
  notification: '#FF3B30',
  buttonText: '#FFFFFF',
  calendar: '#f5f5f5',
  background: "#F2F2F7",
  card: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#8E8E93",
  separator: "#C6C6C8",
  blue: "#007AFF",
  green: "#34C759",
  red: "#FF3B30",
  button: "#007AFF",
  alertBackground: "#F5F5F7",
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
