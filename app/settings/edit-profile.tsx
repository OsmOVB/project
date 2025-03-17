import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { Container, Title, Button, ButtonText } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function EditProfile() {
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
});
