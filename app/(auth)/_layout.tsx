//app/(auth)/_layout.tsx
import React from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import { Stack } from 'expo-router';

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
