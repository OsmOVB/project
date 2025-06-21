import {
  ScrollView,
  StyleSheet,
  Alert,
  View,
  Text,
  RefreshControl,
} from 'react-native';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTheme } from '@/src/context/ThemeContext';
import { Product, Stock } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';
import { navigate } from '@/src/navigation/NavigationService';
import Button from '@/src/components/Button';
import { qrCodeUtils } from '@/src/utils/qrCodeUtils';
import { Card, CardTitle } from '@/src/components/styled';
import { dateUtils } from '@/src/utils/date';
import { db } from '@/src/firebase/config';
import ScanItemsModal from '@/src/components/modal/ScanItemsModal';

export default function LoteDetails() {
  // const { loteId, dataLote } = useLocalSearchParams();
  const [items, setItems] = useState<(Stock & { productInfo?: Product })[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);
  const [qrItem, setQrItem] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  // const [loteId, setLoteId] = useState<string>('');

  const { theme } = useTheme();
  const { user } = useAuth();
  // const router = useRouter();
  const routeParams = navigate.getCurrentRoute()?.params;
  const { loteId = '', dataLote = '' } = (routeParams ?? {}) as {
    loteId?: string;
    dataLote?: string;
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  async function fetchItems() {
    if (!user?.companyId) return;

    const stockQuery = query(
      collection(db, 'stock'),
      where('companyId', '==', user.companyId),
      where('batchId', '==', Number(loteId)),
      where('batchDate', '==', dataLote)
    );

    const productQuery = query(
      collection(db, 'product'),
      where('companyId', '==', user.companyId)
    );

    const [stockSnapshot, productSnapshot] = await Promise.all([
      getDocs(stockQuery),
      getDocs(productQuery),
    ]);

    const productMap = new Map<string, Product>();
    productSnapshot.docs.forEach((doc) => {
      productMap.set(doc.id, { id: doc.id, ...doc.data() } as Product);
    });

    const enrichedItems = stockSnapshot.docs.map((doc) => {
      const stock = { id: doc.id, ...doc.data() } as Stock;
      return {
        ...stock,
        productInfo: productMap.get(stock.productItemId),
      };
    });

    setItems(enrichedItems);
  }

  async function handleDeleteItem(itemId: string) {
    Alert.alert('Confirmar', 'Deseja apagar este item?', [
      { text: 'Cancelar' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'stock', itemId));
          fetchItems();
        },
      },
    ]);
  }

  const handleQrScanned = async (scannedCode: string) => {
    try {
      console.log(`🟡 QR Code escaneado: ${scannedCode}`);

      if (!user?.companyId) throw new Error('Empresa não identificada.');

      const stockQuery = query(
        collection(db, 'stock'),
        where('qrCode', '==', scannedCode),
        where('companyId', '==', user.companyId)
      );

      const snapshot = await getDocs(stockQuery);
      console.log(`🔍 Snapshot docs count: ${snapshot.size}`);

      if (snapshot.empty) {
        console.warn(
          `❌ QR Code "${scannedCode}" não encontrado para a empresa ${user.companyId}`
        );
        return;
      }

      const stockDoc = snapshot.docs[0];
      const stockData = stockDoc.data();
      const size = stockData.volumeLiters?.toString();
      const stockId = stockDoc.id;

      // 🆕 Buscar nome do produto
      let productName: string | undefined;
      if (stockData?.productItemId) {
        const productSnap = await getDoc(
          doc(db, 'product', stockData.productItemId)
        );
        if (productSnap.exists()) {
          const productData = productSnap.data();
          productName = productData.name;
        }
      }

      console.log(
        `📦 Produto encontrado: ${productName} (${size}) - Stock ID: ${stockId}`
      );

      const matchedIndex = items.findIndex(
        (item) =>
          item.name.toLowerCase() === productName?.toLowerCase() &&
          (item.size || '') === size
      );

      if (matchedIndex === -1) {
        console.warn('⚠️ QR Code não corresponde a nenhum item do pedido.');
        return;
      }

      const itemKey = `${productName}_${size}_${matchedIndex}`;
      const current = quantities[itemKey] || 0;

      setQuantities((prev) => ({
        ...prev,
        [itemKey]: current + 1,
      }));

      if (!checkedItems.includes(itemKey)) {
        setCheckedItems((prev) => [...prev, itemKey]);
      }

      await qrCodeUtils.advanceQrCodeStepStatus(scannedCode, user.companyId);
    } catch (error: any) {
      console.error('❌ Erro ao processar QR Code:', error.message);
      Alert.alert('Erro ao processar QR Code', error.message);
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          📦 Lote: {loteId} -{' '}
          {dateUtils.formatDateString(
            Array.isArray(dataLote) ? dataLote[0] : dataLote
          )}
        </Text>

        {items.map((item, i) => (
          <Card key={i} style={{ backgroundColor: theme.card }}>
            <CardTitle>Produto: {item.productInfo?.name || '-'}</CardTitle>

            <Text style={[styles.label, { color: theme.text }]}>
              Preço Unitário:{' '}
              <Text style={styles.value}>R$ {item.price?.toFixed(2)}</Text>
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>
              Marca:{' '}
              <Text style={styles.value}>{item.productInfo?.brand || '-'}</Text>
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>
              Capacidade:{' '}
              <Text style={styles.value}>{item.productInfo?.size || '-'}</Text>
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>
              QR Code:{' '}
              <Text style={styles.value}>{item.qrCode || 'Não gerado'}</Text>
            </Text>

            <View style={styles.qrActions}>
              <Button
                type="icon"
                title="Imprimir"
                iconName="print-outline"
                iconColor={theme.primary}
                onPress={() => {
                  Alert.alert('Ação', 'Chamada de impressão aqui...');
                  // Aqui você chama sua função de impressão (API, local, etc)
                }}
              />
            </View>
            <View style={styles.qrActions}>
              <Button
                type="icon"
                title="Novo QR"
                iconName="qr-code-outline"
                iconColor={theme.text}
                onPress={async () => {
                  const qrCode = await qrCodeUtils.generateNextCompanyQrCode(
                    user?.companyId || ''
                  );
                  if (item.id) {
                    await updateDoc(doc(db, 'stock', item.id!), {
                      qrCode,
                      pendingPrint: 'Y',
                    });
                    // também cria no banco se desejar
                    fetchItems();
                    Alert.alert('QR Code Gerado', qrCode);
                  } else {
                    Alert.alert('Erro', 'ID do item não encontrado.');
                  }
                }}
              />

              <Button
                type="icon"
                title="Editar"
                iconName="create-outline"
                iconColor={theme.primary}
                onPress={() => {
                  if (item.id) {
                    // router.push({
                    //   pathname: '/stock/edit-type/[id]',
                    //   params: { id: item.id },
                    // });
                    navigate.push('EditStockItem', { itemId: item.id });
                  } else {
                    Alert.alert('Erro', 'ID do item não encontrado.');
                  }
                }}
              />
            </View>
            <View style={styles.qrActions}>
              <Button
                type="icon"
                title="Ler QR existente"
                iconName="qr-code-outline"
                iconColor={theme.text}
                onPress={
                  () => {
                    setQrItem(item.id || null);
                    setScanVisible(true);
                  }
                }
              />

              <Button
                type="icon"
                title="Apagar"
                iconName="trash-outline"
                iconColor={theme.red}
                onPress={() => {
                  if (item.id) handleDeleteItem(item.id);
                  else Alert.alert('Erro', 'ID do item não encontrado.');
                }}
              />
            </View>
          </Card>
        ))}
      </ScrollView>
      <ScanItemsModal
        visible={scanVisible}
        onClose={() => setScanVisible(false)}
        onScannedSuccess={handleQrScanned}
        stockId={qrItem ?? ''}
        companyId={user?.companyId || ''}
      />
    </>
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
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
});
