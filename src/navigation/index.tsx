import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import type { RootStackParamList } from './types';
import { navigationRef } from './NavigationService';

// telas
import Home from '../screens/tabs';
import Settings from '../screens/tabs/settings';
import Reports from '../screens/tabs/reports';
import Stock from '../screens/tabs/stock';
import CreateOrder from '../screens/orders/create';
import Batches from '../screens/stock/lotes';
import LoteDetails from '../screens/stock/LoteDetails';
import ManageDeliveries from '../screens/admin/ManageDeliveries';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabRoutes() {
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

export default function AppNavigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeMain" component={TabRoutes} />
        <Stack.Screen name="OrderCreate" component={CreateOrder} />
        <Stack.Screen name="Batches" component={Batches} />
        <Stack.Screen name="LoteDetails" component={LoteDetails} />
        <Stack.Screen name="ManageDeliveries" component={ManageDeliveries} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
