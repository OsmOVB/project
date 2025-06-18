import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { navigationRef } from './NavigationService';
import Home from '../screens/tabs';
import Settings from '../screens/tabs/settings';
import Reports from '../screens/tabs/reports';
import Stock from '../screens/tabs/stock';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
    </Stack.Navigator>
  );
}

export default function AppNavigation() {
  const { theme } = useTheme();

  return (
     <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        screenOptions={ ({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle'; 

            if (route.name === 'Início') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Lotes') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Relatórios') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            } else if (route.name === 'Ajustes') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}

      >
        <Tab.Screen name="Início" component={HomeStack} />
        <Tab.Screen name="Lotes" component={Stock} />
        <Tab.Screen name="Relatórios" component={Reports} />
        <Tab.Screen name="Ajustes" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
