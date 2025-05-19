import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/src/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


export default function EditTypeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<StockItem | null>(null);

  const [tipoItemName, setTipoItemName] = useState('');
  const [marca, setMarca] = useState('');
  const [capacidade, setCapacidade] = useState('');

  useEffect(() => {
    fetchItem();
  }, []);

  async function fetchItem() {
    if (!id || typeof id !== 'string') return;
    const ref = doc(db, 'stock', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as StockItem;
      setItem({ ...data, id });
      setTipoItemName(data.tipoItemName);
      setMarca(data.marca);
      setCapacidade(data.capacidade);
    } else {
      Alert.alert('Erro', 'Item não encontrado');
      router.back();
    }
  }

  async function handleSave() {
    if (!id || typeof id !== 'string') return;
    if (!tipoItemName || !marca || !capacidade) {
      Alert.alert('Preencha todos os campos');
      return;
    }

    try {
      const ref = doc(db, 'stock', id);
      await updateDoc(ref, {
        tipoItemName,
        marca,
        capacidade,
      });

      Alert.alert('Sucesso', 'Item atualizado com sucesso');
      router.back();
    } catch (e) {
      Alert.alert('Erro ao salvar', String(e));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Produto</Text>

      <Text style={styles.label}>Tipo</Text>
      <TextInput
        style={styles.input}
        value={tipoItemName}
        onChangeText={setTipoItemName}
      />

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={styles.input}
        value={marca}
        onChangeText={setMarca}
      />

      <Text style={styles.label}>Capacidade</Text>
      <TextInput
        style={styles.input}
        value={capacidade}
        onChangeText={setCapacidade}
      />

      <Button title="Salvar" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 4,
    borderRadius: 6,
    marginBottom: 10
  }
});
