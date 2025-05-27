import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  RefreshControl,
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
import { Stock } from '@/src/types';
import { useFocusEffect } from 'expo-router';
import { BackHandler } from 'react-native';

interface BatchGroup {
  batchId: string;
  batchDate: string;
  items: Stock[];
}

export default function Batches() {
  const [batches, setBatches] = useState<BatchGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      router.replace('/stock');
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [])
);

  useEffect(() => {
    fetchBatches();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBatches();
    setRefreshing(false);
  };

  async function fetchBatches() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const allItems: Stock[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Stock)
    );

    const grouped: Record<string, BatchGroup> = {};

    allItems.forEach((item) => {
      const key = `${item.batchId}_${item.batchDate}`;
      if (!grouped[key]) {
        grouped[key] = {
          batchId: String(item.batchId),
          batchDate: item.batchDate,
          items: [],
        };
      }
      grouped[key].items.push(item);
    });

    setBatches(Object.values(grouped));
  }

  function handleDeleteBatch(batchId: string, batchDate: string) {
    Alert.alert('Delete Batch', 'Are you sure you want to delete this batch?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const snapshot = await getDocs(
            query(
              collection(db, 'stock'),
              where('batchId', '==', batchId),
              where('batchDate', '==', batchDate)
            )
          );
          const deletions = snapshot.docs.map((docSnap) =>
            deleteDoc(doc(db, 'stock', docSnap.id))
          );
          await Promise.all(deletions);
          fetchBatches();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={[styles.header, { color: theme.textPrimary }]}>
        Lotes de Produtos
      </Text>

      {batches.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary }}>
            Nenhum lote encontrado.
          </Text>
        </View>
      ) : (
        batches.map((batch, index) => (
          <Card key={index} style={{ backgroundColor: theme.card }}>
            <Button
              type="card"
              onPress={() =>
                router.push({
                  pathname: '/stock/lote_details',
                  params: { loteId: batch.batchId, dataLote: batch.batchDate },
                })
              }
            >
              <CardTitle style={{ color: theme.primary }}>
                Lote: {batch.batchId}
              </CardTitle>
              <Text style={[styles.batchDate, { color: theme.text }]}>
                {dateUtils.formatDateString(batch.batchDate)}
              </Text>   
              <Text style={[styles.batchItems, { color: theme.text }]}>
                {batch.items.length}{' '}
                produto(s)
              </Text>
            </Button>
            <Button
              title="Apagar Lote"
              type="icon"
              iconColor={theme.red}
              iconName="trash"
              onPress={() => handleDeleteBatch(batch.batchId, batch.batchDate)}
              style={{ marginTop: 8 }}
            />
          </Card>
        ))
      )}
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
  batchDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  batchItems: {
    fontSize: 14,
  },
});
