import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { getDocs, collection, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '@/src/firebase/config';

interface StockItem {
  id: string;
  loteId: string;
  dataLote: string;
  tipoItemName: string;
  marca: string;
  capacidade: string;
}

export default function Lotes() {
  const [lotes, setLotes] = useState<{ loteId: string; dataLote: string; items: StockItem[] }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchLotes();
  }, []);

  async function fetchLotes() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const allItems: StockItem[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockItem));
    const grouped: Record<string, { loteId: string; dataLote: string; items: StockItem[] }> = {};

    allItems.forEach(item => {
      const key = `${item.loteId}_${item.dataLote}`;
      if (!grouped[key]) {
        grouped[key] = {
          loteId: item.loteId,
          dataLote: item.dataLote,
          items: [],
        };
      }
      grouped[key].items.push(item);
    });

    setLotes(Object.values(grouped));
  }

  function handleDeleteLote(loteId: string, dataLote: string) {
    Alert.alert('Apagar Lote', 'Deseja apagar todos os produtos deste lote?', [
      { text: 'Cancelar' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          const snapshot = await getDocs(query(
            collection(db, 'stock'),
            where('loteId', '==', loteId),
            where('dataLote', '==', dataLote)
          ));
          const deletions = snapshot.docs.map(docSnap =>
            deleteDoc(doc(db, 'stock', docSnap.id))
          );
          await Promise.all(deletions);
          fetchLotes();
        }
      }
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📦 Lotes de Produtos</Text>

      {lotes.map((lote, index) => (
        <View key={index} style={styles.card}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() =>
              router.push({
                pathname: '/stock/lote_details',
                params: { loteId: lote.loteId, dataLote: lote.dataLote }
              })
            }
          >
            <Text style={styles.loteTitle}>Lote #{lote.loteId}</Text>
            <Text style={styles.loteDate}>🗓️ {lote.dataLote}</Text>
            <Text style={styles.loteItems}>📋 {lote.items.length} Produto(s)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteLote(lote.loteId, lote.dataLote)}
          >
            <Text style={styles.deleteText}>Apagar Lote</Text>
          </TouchableOpacity>
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    marginBottom: 12,
  },
  loteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#007AFF',
  },
  loteDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  loteItems: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
