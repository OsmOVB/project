import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Switch } from 'react-native';
import { Container, Title, Button, ButtonText, Card, CardTitle, ThemeToggle, ThemeToggleLabel } from '../../../src/components/styled';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { useAuth } from '@/src/context/AuthContext';
import { navigate } from '@/src/navigation/NavigationService';

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme, theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    if (user?.companyId) {
      const fetchCompany = async () => {
        const snap = await getDoc(doc(db, 'companies', user.companyId!));
        if (snap.exists()) setCompanyName(snap.data().name);
      };
      fetchCompany();
    }
  }, [user?.companyId]);

  return (
    <Container>
      <ScrollView>
        <Title style={{ color: theme.textPrimary }}>Configurações</Title>

        {user && <ProfileCard user={user} companyName={companyName} />}

        <Card>
          <CardTitle>Preferências</CardTitle>

          <ThemeToggle>
            <ThemeToggleLabel style={{ color: theme.textPrimary }}>Modo Escuro</ThemeToggleLabel>
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
            <Button
              onPress={() =>
                // router.push('/admin/ManageDeliveries')
                navigate.to('ManageDeliveries')
              }
              style={styles.button}
            >
              <ButtonText>Gerenciar Entregadores</ButtonText>
            </Button>
          </Card>
        )}

        <Card>
          <CardTitle>Suporte</CardTitle>
          <Button onPress={() =>
            // router.push('/help/HelpCenterScreen')
            console.log('Central de Ajuda')
          } style={styles.button}>
            <ButtonText>Central de Ajuda</ButtonText>
          </Button>
          <Button onPress={() => {
            // router.push('/help/ReportProblemScreen')
            console.log('Reportar Problema');
          }} style={styles.button}>
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

function ProfileCard({ user, companyName }: { user: any, companyName: string }) {
  // const router = useRouter();
  const { theme } = useTheme();

  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.card }]}>
          <Ionicons name="person" size={40} color="#007AFF" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{user?.name}</Text>
          <Text style={[styles.role, { color: theme.textSecondary }]}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
          </Text>
          {companyName && <Text style={[styles.company, { color: theme.textSecondary }]}>{companyName}</Text>}
        </View>
      </View>

      <Button
        onPress={() =>
          //  router.push('/edit-profile')
          console.log('Edit Profile')}
        style={styles.editButton}
      >
        <ButtonText>Editar informações</ButtonText>
      </Button>
    </Card>
  );
}

function SettingItem({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View style={styles.settingItem}>
      <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
        {label}
      </Text>
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
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
  },
  company: {
    fontSize: 14,
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
  },
  button: {
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
    marginBottom: 40,
  },
  editButton: {
    marginTop: 15,
    alignSelf: 'flex-start',
  },
});
// att   