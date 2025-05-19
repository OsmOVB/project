import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Text,
} from 'react-native';
import { Container, Title, Button, ButtonText } from '../../src/components/styled';
import { useAuth } from '@/src/hooks/useAuth';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase/config';
import { useThemeContext } from '@/src/context/ThemeContext';

export default function EditProfile() {
  const { darkMode } = useThemeContext();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name, address });

      setUser({ ...user, name, address });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  return (
    <Container>
      <ScrollView>
        <Title>Editar Perfil</Title>

        <View
          style={[
            styles.infoContainer,
            { backgroundColor: darkMode ? '#1c1c1e' : '#f0f0f0' },
          ]}
        >
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
              ]}
            >
              Nome
            </Text>
            <Text
              style={[
                styles.value,
                { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
              ]}
            >
              {user?.name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
              ]}
            >
              Email
            </Text>
            <Text
              style={[
                styles.value,
                { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
              ]}
            >
              {user?.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text
              style={[
                styles.label,
                { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
              ]}
            >
              Função
            </Text>
            <Text
              style={[
                styles.value,
                { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
              ]}
            >
              {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : ''}
            </Text>
          </View>

          {user?.address && (
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.label,
                  { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
                ]}
              >
                Endereço
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: darkMode ? '#FFFFFF' : '#1c1c1e' },
                ]}
              >
                {user.address}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Endereço"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <Button onPress={handleSave}>
          <ButtonText>Salvar Alterações</ButtonText>
        </Button>

        <Button onPress={() => router.back()} style={styles.cancelButton}>
          <ButtonText>Cancelar</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
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
