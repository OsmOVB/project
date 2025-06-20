import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';

import Home from '@/src/screens/tabs';
import Settings from '@/src/screens/tabs/settings';
import Reports from '@/src/screens/tabs/reports';
import Stock from '@/src/screens/tabs/stock';
import { TabStackParamList } from '../types';

const Tab = createBottomTabNavigator<TabStackParamList>();

export default function TabRoutes() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';

          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Lotes') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'Relatórios') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Ajustes') iconName = focused ? 'settings' : 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={Home} />
      <Tab.Screen name="Lotes" component={Stock} />
      <Tab.Screen name="Relatórios" component={Reports} />
      <Tab.Screen name="Ajustes" component={Settings} />
    </Tab.Navigator>
  );
}
