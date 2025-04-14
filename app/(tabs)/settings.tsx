import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Switch } from 'react-native';
import { Container, Title, Button, ButtonText, Card, CardTitle, ThemeToggle, ThemeToggleLabel } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeContext } from '../../context/ThemeContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useThemeContext();
  const [notifications, setNotifications] = useState(true);

  return (
    <Container>
      <ScrollView>
        <Title>Configurações</Title>

        {user && <ProfileCard user={user} />}

        {/* <Button style={{ marginTop: 10 }} onPress={() => router.push('/settings/edit-profile')}>
          <ButtonText>Editar Perfil</ButtonText>
        </Button> */}

        <Card>
          <CardTitle>Preferências</CardTitle>

          <ThemeToggle>
            <ThemeToggleLabel>Modo Escuro</ThemeToggleLabel>
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
            />
          </ThemeToggle>

          <SettingItem label="Notificações">
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
            />
          </SettingItem>
        </Card>

        {user?.role === 'admin' && (
          <Card>
            <CardTitle>Administração</CardTitle>
            <Button onPress={() => router.push('/users')} style={styles.button}>
              <ButtonText>Gerenciar Usuários</ButtonText>
            </Button>
            <Button onPress={() => router.push('/settings/company')} style={styles.button}>
              <ButtonText>Configurações da Empresa</ButtonText>
            </Button>
          </Card>
        )}

        <Card>
          <CardTitle>Suporte</CardTitle>
          <Button onPress={() => { }} style={styles.button}>
            <ButtonText>Central de Ajuda</ButtonText>
          </Button>
          <Button onPress={() => { }} style={styles.button}>
            <ButtonText>Reportar Problema</ButtonText>
          </Button>
        </Card>

        <Button
          onPress={logout}
          style={[styles.button, styles.logoutButton]}
        >
          <ButtonText>Sair</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

function ProfileCard({ user }: { user: any }) {
  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#007AFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</Text>
        </View>
      </View>
    </Card>
  );
}

function SettingItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#666',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1c1c1e',
  },
  button: {
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
    marginBottom: 40,
  },
});
