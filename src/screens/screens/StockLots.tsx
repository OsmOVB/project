// app/screens/StockLots.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebase/config';
import { useRouter } from 'expo-router';
import Button from '@/src/components/Button';

export default function StockLots() {
  const [lotes, setLotes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchLotes();
  }, []);

  async function fetchLotes() {
    const stockSnapshot = await getDocs(collection(db, 'stock'));
    const allItems = stockSnapshot.docs.map((doc) => doc.data());

    const grouped = allItems.reduce((acc, item) => {
      const key = `${item.loteId}_${item.dataLote}`;
      if (!acc[key])
        acc[key] = { loteId: item.loteId, dataLote: item.dataLote, items: [] };
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, any>);

    setLotes(Object.values(grouped));
  }

  return (
    <ScrollView style={styles.container}>
      {lotes.map((lote, index) => (
        <Button
          key={index}
          onPress={() =>
            router.push({
              pathname: '/screens/LoteDetails',
              params: { loteId: lote.loteId, dataLote: lote.dataLote },
            })
          }
          title={`Ver Lote ${lote.loteId} - ${lote.dataLote} (${lote.items.length} itens)`}
          style={{ marginVertical: 8 }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },

});
