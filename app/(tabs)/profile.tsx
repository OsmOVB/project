import React from 'react';
import { View, ScrollView, StyleSheet, Text, Switch } from 'react-native';
import { Container, Title, Button, ButtonText, ThemeToggle, ThemeToggleLabel } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { darkMode } = useThemeContext();

  return (
    <Container>
      <ScrollView>
        <Title>Perfil</Title>
        
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

        <Button 
          onPress={logout}
          style={{ backgroundColor: '#FF3B30', marginTop: 10 }}
        >
          <ButtonText>Sair</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
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
});