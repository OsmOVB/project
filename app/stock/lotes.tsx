import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {
  getDocs,
  collection,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '@/src/firebase/config';
import { useTheme } from '@/src/context/ThemeContext';
import { Card, CardTitle } from '@/src/components/styled';
import Button from '@/src/components/Button';
import { dateUtils } from '@/src/utils/date';

interface StockItem {
  id: string;
  loteId: string;
  dataLote: string;
  tipoItemName: string;
  marca: string;
  capacidade: string;
}

export default function Lotes() {
  const [lotes, setLotes] = useState<
    { loteId: string; dataLote: string; items: StockItem[] }[]
  >([]);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetchLotes();
  }, []);

  async function fetchLotes() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const allItems: StockItem[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as StockItem)
    );
    const grouped: Record<
      string,
      { loteId: string; dataLote: string; items: StockItem[] }
    > = {};

    allItems.forEach((item) => {
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
          const snapshot = await getDocs(
            query(
              collection(db, 'stock'),
              where('loteId', '==', loteId),
              where('dataLote', '==', dataLote)
            )
          );
          const deletions = snapshot.docs.map((docSnap) =>
            deleteDoc(doc(db, 'stock', docSnap.id))
          );
          await Promise.all(deletions);
          fetchLotes();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.header, { color: theme.textPrimary }]}>
        📦 Lotes de Produtos
      </Text>

      {lotes.map((lote, index) => (
        <Card key={index} style={{ backgroundColor: theme.card }}>
          <Button
            type="card"
            onPress={() =>
              router.push({
                pathname: '/stock/lote_details',
                params: { loteId: lote.loteId, dataLote: lote.dataLote },
              })
            }
          >
            <CardTitle style={{ color: theme.primary }}>
              Lote: {lote.loteId}
            </CardTitle>
            <Text style={[styles.loteDate, { color: theme.text }]}>
              🗓️ {dateUtils.formatDateString(lote.dataLote)}
            </Text>
            <Text style={[styles.loteItems, { color: theme.text }]}>
              📋 {lote.items.length} Produto(s)
            </Text>
          </Button>
          <Button
            title="Apagar Lote"
            type="icon"
            iconColor={theme.red}
            iconName="trash"
            onPress={() => handleDeleteLote(lote.loteId, lote.dataLote)}
            style={{ marginTop: 8 }}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  loteDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  loteItems: {
    fontSize: 14,
  },
  deleteButton: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
