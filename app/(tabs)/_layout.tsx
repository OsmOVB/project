import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // REMOVE o cabeçalho padrão como "Início"
        tabBarHideOnKeyboard: true, // esconde a tab bar com o teclado
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: '/',
          tabBarLabel: 'Início',
          tabBarIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ size, color }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          tabBarLabel: 'Estoque',
          tabBarIcon: ({ size, color }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarLabel: 'Relatórios',
          tabBarIcon: ({ size, color }) => <Ionicons name="bar-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ size, color }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Configurações',
          tabBarIcon: ({ size, color }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
