import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <StatusBar style="inverted" translucent backgroundColor="transparent" />
          <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
