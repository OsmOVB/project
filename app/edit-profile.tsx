import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '@/src/components/Button';
import { useAuth } from '@/src/hooks/useAuth';
import { db } from '@/src/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const router = useRouter();

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        email,
      });
      Alert.alert('Sucesso', 'Informações atualizadas!');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar as informações.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Informações</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nome"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />

      <Button title="Salvar" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
});
