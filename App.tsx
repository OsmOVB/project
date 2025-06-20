import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigation from './src/navigation';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';

function MainContent() {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      edges={['top', 'bottom']} 
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar style={theme.background === '#121212' ? 'light' : 'dark'} />
      <AppNavigation />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <MainContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
