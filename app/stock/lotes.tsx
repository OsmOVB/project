import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { getDocs, collection, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '@/src/firebase/config';

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
          const snapshot = await getDocs(query(collection(db, 'stock'),
            where('loteId', '==', loteId),
            where('dataLote', '==', dataLote)));
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
      {lotes.map((lote, index) => (
        <View key={index} style={styles.card}>
          <TouchableOpacity onPress={() =>
            router.push({ pathname: '/stock/lote_details', params: { loteId: lote.loteId, dataLote: lote.dataLote } })
          }>
            <Text style={styles.title}>Lote #{lote.loteId}</Text>
            <Text style={styles.subtitle}>Data: {lote.dataLote}</Text>
            <Text style={styles.count}><Text style={{ fontStyle: 'italic' }}>Items:</Text> {lote.items.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteLote(lote.loteId, lote.dataLote)}>
            <Text style={styles.delete}>Apagar Lote</Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4
  },
  count: {
    marginTop: 8,
    fontSize: 14
  },
  delete: {
    color: 'red',
    marginTop: 8
  }
});
