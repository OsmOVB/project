import React from 'react';
import { ThemeProvider } from '../../context/ThemeContext';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { BlurView } from 'expo-blur';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet, StatusBar } from 'react-native';

export default function CustomTabsLayout() {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                ...Platform.select({
                  ios: {
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 85,
                    paddingBottom: 20,
                  },
                  android: {
                    backgroundColor: '#fff',
                    height: 60,
                    paddingBottom: 8,
                  },
                  web: {
                    backgroundColor: '#fff',
                    height: 60,
                    paddingBottom: 8,
                  },
                }),
              },
              tabBarBackground: Platform.OS === 'ios' ? () => (
                <BlurView
                  tint="light"
                  intensity={95}
                  style={StyleSheet.absoluteFill}
                />
              ) : undefined,
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#8E8E93',
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Início',
                tabBarIcon: ({ size, color }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            {user?.role === 'admin' && (
              <Tabs.Screen
                name="stock"
                options={{
                  title: 'Estoque',
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="cube" size={size} color={color} />
                  ),
                }}
              />
            )}
            <Tabs.Screen
              name="orders"
              options={{
                title: 'Pedidos',
                tabBarIcon: ({ size, color }) => (
                  <Ionicons name="list" size={size} color={color} />
                ),
              }}
            />
            {user?.role === 'admin' && (
              <Tabs.Screen
                name="reports"
                options={{
                  title: 'Relatórios',
                  tabBarIcon: ({ size, color }) => (
                    <Ionicons name="bar-chart" size={size} color={color} />
                  ),
                }}
              />
            )}
            <Tabs.Screen
              name="settings"
              options={{
                title: 'Configurações',
                tabBarIcon: ({ size, color }) => (
                  <Ionicons name="settings" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Ajuste conforme o tema do seu app
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Corrige sobreposição no Android
  },
});
