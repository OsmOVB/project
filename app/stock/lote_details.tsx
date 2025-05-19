import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/src/firebase/config';
import { Ionicons } from '@expo/vector-icons';

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
    const docs: StockItem[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as StockItem)
    );
    const filtrados = docs.filter(
      (item) => item.loteId == loteId && item.dataLote == dataLote
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
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Lote #{loteId}</Text>
      <Text style={styles.subtitle}>🗓️ Data: {dataLote}</Text>

      {barris.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>
            Tipo: <Text style={styles.value}>{item.tipoItemName}</Text>
          </Text>
          <Text style={styles.label}>
            Marca: <Text style={styles.value}>{item.marca}</Text>
          </Text>
          <Text style={styles.label}>
            Capacidade: <Text style={styles.value}>{item.capacidade}</Text>
          </Text>

          <View style={styles.qrActions}>
            {/* Gerar QR Code */}
            <TouchableOpacity style={styles.qrButton} onPress={() => {}}>
              <Ionicons name="qr-code-outline" size={22} color="#000" />
              <Text style={styles.qrText}>Gerar QR Code</Text>
            </TouchableOpacity>

            {/* Vincular QR Existente */}
            <TouchableOpacity style={styles.qrButton} onPress={() => {}}>
              <Ionicons name="qr-code-outline" size={22} color="#000" />
              <Text style={styles.qrText}>Ler QR Existente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: '/stock/edit-type/[id]',
                  params: { id: item.id },
                })
              }
            >
              <Ionicons name="create-outline" size={22} color="#007AFF" />
              <Text style={styles.edit}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  value: {
    fontWeight: 'normal',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  edit: {
    color: '#007AFF',
    fontWeight: '500',
  },
  delete: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  qrText: {
    fontWeight: '500',
    color: '#333',
  },
});
