import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDocs, collection } from 'firebase/firestore';

import { useRouter } from 'expo-router';
import { db } from '@/src/firebase/config';

export default function Lotes() {
  const [lotes, setLotes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchLotes();
  }, []);

  async function fetchLotes() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const allItems = snapshot.docs.map(doc => doc.data());
    const grouped: Record<string, any> = {};

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

  return (
    <ScrollView style={styles.container}>
      {lotes.map((lote, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => router.push({
            pathname: '/stock/lote_details',
            params: { loteId: lote.loteId, dataLote: lote.dataLote }
          })}
        >
          <Text style={styles.cardTitle}>Lote #{lote.loteId}</Text>
          <Text>Data: {lote.dataLote}</Text>
          <Text>Total de Barris: {lote.items.length}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
});
