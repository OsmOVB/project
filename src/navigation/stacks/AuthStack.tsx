import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import Login from '@/src/screens/auth/login';
import ForgotPassword from '@/src/screens/auth/ForgotPassword';
import Register from '@/src/screens/auth/register';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
  <Stack.Screen name="Register" component={Register} />
  <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}
