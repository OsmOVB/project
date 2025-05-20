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
  textPrimary: string;
  textSecondary: string;
  separator: string;
  blue: string;
  green: string;
  red: string;
  button: string;
  alertBackground: string;
  subText: string;
  inputBg: string;
}


export const darkTheme: ThemeType = {
  text: '#FFFFFF',
  primary: '#6366f1',
  secondary: '#1c1c1e',
  border: '#333333',
  notification: '#FF3B30',
  buttonText: '#FFFFFF',
  calendar: '#1c1c1e',
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  separator: "#3A3A3C",
  blue: "#0A84FF",
  green: "#30D158",
  red: "#FF453A",
  button: '#6366f1',
  alertBackground: "#2C2C2E",
  subText: '#aaaaaa',
  background: '#121212',
  card: '#1e1e1e',
  inputBg: '#2c2c2c',
};

export const lightTheme: ThemeType = {
  primary: '#6366f1',
  secondary: '#f0f0f0',
  notification: '#FF3B30',
  buttonText: '#FFFFFF',
  calendar: '#f5f5f5',
  background: "#f9fafb",
  card: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#8E8E93",
  separator: "#C6C6C8",
  blue: "#007AFF",
  green: "#34C759",
  red: "#FF3B30",
  button: '#6366f1',
  alertBackground: "#F5F5F7",
  text: '#111827',
  subText: '#6b7280',
  inputBg: '#ffffff',
  border: '#e5e7eb',
};
