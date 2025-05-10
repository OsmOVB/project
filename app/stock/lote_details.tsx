import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/src/firebase/config';

interface StockItem {
  id: string;
  loteId: string;
  dataLote: string;
  tipoItemName: string;
  marca: string;
  capacidade: string;
}

export default function LoteDetails() {
  const { loteId, dataLote } = useLocalSearchParams();
  const [barris, setBarris] = useState<StockItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchBarris();
  }, []);

  async function fetchBarris() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const docs: StockItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockItem));
    const filtrados = docs.filter(
      item => item.loteId == loteId && item.dataLote == dataLote
    );
    setBarris(filtrados);
  }

  function handleDeleteItem(itemId: string) {
    Alert.alert('Confirmar', 'Deseja apagar este item?', [
      { text: 'Cancelar' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'stock', itemId));
          fetchBarris();
        }
      }
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lote #{loteId} - {dataLote}</Text>
      {barris.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>Tipo: <Text style={styles.value}>{item.tipoItemName}</Text></Text>
          <Text style={styles.label}>Marca: <Text style={styles.value}>{item.marca}</Text></Text>
          <Text style={styles.label}>Capacidade: <Text style={styles.value}>{item.capacidade}</Text></Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => 
              router.push({
                pathname: '/stock/edit-type/[id]',
                params: { id: item.id }
              })
            }>
              <Text style={styles.edit}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
              <Text style={styles.delete}>Apagar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16
  },
  value: {
    fontWeight: 'normal'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 16
  },
  edit: {
    color: 'blue'
  },
  delete: {
    color: 'red'
  }
});
