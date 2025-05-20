import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Text,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/src/firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { Card, CardTitle } from '@/src/components/styled';

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
  const { theme } = useTheme();

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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>📦 Lote #{loteId}</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>🗓️ Data: {dataLote}</Text>

      {barris.map((item, i) => (
        <Card key={i} style={{ backgroundColor: theme.card }}>
          <CardTitle>{item.tipoItemName}</CardTitle>

          <Text style={[styles.label, { color: theme.text }]}>
            Marca: <Text style={styles.value}>{item.marca}</Text>
          </Text>
          <Text style={[styles.label, { color: theme.text }]}>
            Capacidade: <Text style={styles.value}>{item.capacidade}</Text>
          </Text>

          <View style={styles.qrActions}>
            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: theme.inputBg }]}
              onPress={() => {}}
            >
              <Ionicons name="qr-code-outline" size={20} color={theme.text} />
              <Text style={[styles.qrText, { color: theme.text }]}>Gerar QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: theme.inputBg }]}
              onPress={() => {}}
            >
              <Ionicons name="qr-code-outline" size={20} color={theme.text} />
              <Text style={[styles.qrText, { color: theme.text }]}>Ler QR Existente</Text>
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
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={[styles.edit, { color: theme.primary }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
              <Text style={[styles.delete, { color: theme.danger }]}>Apagar</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  value: {
    fontWeight: 'normal',
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
    fontWeight: '500',
  },
  delete: {
    fontWeight: '500',
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 6,
    flex: 1,
  },
  qrText: {
    fontWeight: '500',
  },
});
