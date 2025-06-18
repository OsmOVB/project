import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

import { ThemeProvider, useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/hooks/useAuth';

function InnerLayout() {
  const { theme } = useTheme();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(theme.background);
    NavigationBar.setButtonStyleAsync(theme.background === '#121212' ? 'light' : 'dark');
  }, [theme]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.background === '#121212' ? 'light' : 'dark'} />
      {/* <Slot /> */}
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const { user } = useAuth();
  // const segments = useSegments();

  // useEffect(() => {
  //   const inAuthGroup = segments[0] === '(auth)';
  //   if (user && inAuthGroup) {
  //     // router.replace('/(tabs)');
  //   } else if (!user && !inAuthGroup) {
  //     // router.replace('/(auth)/login');
  //   }
  // }, [user, segments]);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <InnerLayout />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
