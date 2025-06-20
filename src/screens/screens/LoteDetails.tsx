// app/screens/LoteDetails.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { navigate } from '@/src/navigation/NavigationService';

export default function LoteDetails() {
  const [barris, setBarris] = useState<any[]>([]);
  const routeParams = navigate.getCurrentRoute()?.params;
  const { loteId = '', dataLote = '' } = (routeParams ?? {}) as {
    loteId?: string;
    dataLote?: string;
  };

  useEffect(() => {
    fetchBarris();
  }, []);

  async function fetchBarris() {
    const stockSnapshot = await getDocs(collection(db, 'stock'));
    const all = stockSnapshot.docs.map((doc) => doc.data());
    console.log('Barris fetched:', all);
    const barrisDoLote = all.filter(
      (item) =>
        String(item.batchId) === String(loteId) && item.batchDate === dataLote
    );

    setBarris(barrisDoLote);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Lote #{loteId} - {dataLote}
      </Text>
      {barris.map((barril, index) => (
        <View key={index} style={styles.card}>
          <Text>ID Produto: {barril.productItemId}</Text>
          <Text>Volume: {barril.volumeLiters}L</Text>
          <Text>QR Code: {barril.qrCode}</Text>
          <Text>Preço: R$ {barril.price?.toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
});
