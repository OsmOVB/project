import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './NavigationService';
import AuthStack from './stacks/AuthStack';
import AppStack from './stacks/AppStack';
import { useAuth } from '../context/AuthContext';

export default function AppNavigation() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
