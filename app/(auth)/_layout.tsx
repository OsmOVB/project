//app/(auth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@/src/context/ThemeContext';

export default function AuthLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </ThemeProvider>
  );
}
