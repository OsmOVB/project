import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/src/firebase/config';

export default function LoteDetails() {
  const { loteId, dataLote } = useLocalSearchParams();
  const [barris, setBarris] = useState<any[]>([]);

  useEffect(() => {
    fetchBarris();
  }, []);

  async function fetchBarris() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const docs = snapshot.docs.map(doc => doc.data());
    const filtrados = docs.filter(
      item => item.loteId == loteId && item.dataLote == dataLote
    );
    setBarris(filtrados);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lote #{loteId} - {dataLote}</Text>
      {barris.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text>Tipo: {item.tipoItemName}</Text>
          <Text>Litros: {item.liters}</Text>
          <Text>Quantidade: {item.quantity}</Text>
          <Text>Sequência: {item.sequenciaLote}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
});
