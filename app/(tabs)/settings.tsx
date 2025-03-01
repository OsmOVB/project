import React from 'react';
import { View, ScrollView, StyleSheet, Text, Switch } from 'react-native';
import { Container, Title, Button, ButtonText, Card, CardTitle, ThemeToggle, ThemeToggleLabel } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeContext } from '../../context/ThemeContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useThemeContext();
  const [notifications, setNotifications] = React.useState(true);

  return (
    <Container>
      <ScrollView>
        <Title>Configurações</Title>

        {user && <ProfileCard user={user} />}

        <View style={[styles.infoContainer, { backgroundColor: darkMode ? '#1c1c1e' : '#f0f0f0' }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>Nome</Text>
            <Text style={[styles.value, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>{user?.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>Email</Text>
            <Text style={[styles.value, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>Função</Text>
            <Text style={[styles.value, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
            </Text>
          </View>

          {user?.address && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>Endereço</Text>
              <Text style={[styles.value, { color: darkMode ? '#FFFFFF' : '#1c1c1e' }]}>{user.address}</Text>
            </View>
          )}
        </View>

        <Button style={{ marginTop: 20 }}>
          <ButtonText>Editar Perfil</ButtonText>
        </Button>

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
            <Button onPress={() => router.push('/users' as any)} style={styles.button}>
              <ButtonText>Gerenciar Usuários</ButtonText>
            </Button>
            <Button onPress={() => router.push('/settings/company' as any)} style={styles.button}>
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

interface Usuario {
  nome: string;
  papel: 'admin' | 'entregador' | 'cliente' | 'consumidor';
  // Add other properties from the User type here
  // Assuming User type has properties 'name' and 'role'
  name: string;
  role: 'admin' | 'entregador' | 'cliente' | 'consumidor';
}

function ProfileCard({ user }: { user: Usuario }) {
  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#007AFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{user?.nome}</Text>
          <Text style={styles.role}>
            {user?.papel === 'admin' ? 'Administrador' :
              user?.papel === 'entregador' ? 'Entregador' : 'Cliente'}
          </Text>
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
  infoContainer: {
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
});