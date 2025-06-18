// app/screens/LoteDetails.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebase/config';

export default function LoteDetails() {
  const { loteId, dataLote } = useLocalSearchParams();
  const [barris, setBarris] = useState<any[]>([]);

  useEffect(() => {
    fetchBarris();
  }, []);

  async function fetchBarris() {
    const stockSnapshot = await getDocs(collection(db, 'stock'));
    const all = stockSnapshot.docs.map(doc => doc.data());
    const barrisDoLote = all.filter(item => item.loteId == loteId && item.dataLote == dataLote);
    setBarris(barrisDoLote);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lote #{loteId} - {dataLote}</Text>
      {barris.map((barril, index) => (
        <View key={index} style={styles.card}>
          <Text>{barril.tipoItemName} - {barril.liters}L</Text>
          <Text>Quantidade: {barril.quantity}</Text>
          <Text>Sequência: {barril.sequenciaLote}</Text>
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
