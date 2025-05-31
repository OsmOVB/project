import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { DeliveryItem } from '@/app/(tabs)/index';
import ScanItemsModal from '../ScanItemsModal';
import Button from '../../Button';
import { useTheme } from '@/src/context/ThemeContext';
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  collection,
  where,
} from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { StatusOrder } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { router } from 'expo-router';
import { qrCodeUtils } from '@/src/utils/qrCodeUtils';

export default function ProductModal({
  visible,
  onClose,
  onRefresh,
  items,
  deliveryId,
  orderNumber,
}: {
  visible: boolean;
  onClose: () => void;
  onRefresh: () => void;
  items: DeliveryItem[];
  deliveryId: string;
  orderNumber: string;
}) {
  const { theme } = useTheme();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [qrItem, setQrItem] = useState<string | null>(null);
  const [scanVisible, setScanVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const statusSequence: StatusOrder[] = [
    'pendente',
    'a caminho',
    'em progresso',
    'finalizado',
  ];

  const handleConfirm = async () => {
    try {
      const orderRef = doc(db, 'orders', deliveryId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        alert('Pedido não encontrado.');
        return;
      }

      const currentStatus = orderSnap.data().status as StatusOrder;
      const currentIndex = statusSequence.indexOf(currentStatus);

      if (currentIndex === -1 || currentIndex === statusSequence.length - 1) {
        alert('Status não pode ser atualizado.');
        return;
      }

      const nextStatus = statusSequence[currentIndex + 1];

      await updateDoc(orderRef, {
        status: nextStatus,
      });

      if (nextStatus === 'finalizado') {
        // Busque o pedido para extrair os stockIds
        const orderData = orderSnap.data();
        const stockIds = (orderData.items || []).map(
          (item: any) => item.stockItemId
        );
        await qrCodeUtils.releaseQRCodesByStockIds(
          stockIds,
          user?.companyId || ''
        );
      }

      onRefresh();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const handleCancel = async () => {
    try {
      await updateDoc(doc(db, 'orders', deliveryId), {
        status: 'cancelado',
      });
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err);
      alert('Erro ao cancelar. Tente novamente.');
    }
  };

  const handleQrScanned = async (scannedCode: string) => {
    try {
      if (!user?.companyId) throw new Error('Empresa não identificada.');

      const qrQuery = query(
        collection(db, 'qrcodes'),
        where('code', '==', scannedCode),
        where('companyId', '==', user.companyId),
        where('status', '==', 'occupied')
      );
      const snapshot = await getDocs(qrQuery);

      if (snapshot.empty) {
        Alert.alert('QR Code inválido ou não vinculado a esta empresa.');
        return;
      }

      const qrDoc = snapshot.docs[0];
      const stockId = qrDoc.data().usedByStockId;

      const stockDoc = await getDoc(doc(db, 'stock', stockId));
      if (!stockDoc.exists()) {
        Alert.alert('Estoque vinculado ao QR não encontrado.');
        return;
      }

      const stockData = stockDoc.data();
      const itemKey = `${stockData.productName}_${stockData.volumeLiters}_${stockId}`;

      const current = quantities[itemKey] || 0;
      setQuantities((prev) => ({
        ...prev,
        [itemKey]: current + 1,
      }));

      if (!checkedItems.includes(itemKey)) {
        setCheckedItems((prev) => [...prev, itemKey]);
      }
    } catch (error: any) {
      Alert.alert('Erro ao ler QR', error.message);
    }
  };

  const handleRemoveItem = (itemKey: string) => {
    setCheckedItems((prev) => prev.filter((key) => key !== itemKey));
    const updated = { ...quantities };
    delete updated[itemKey];
    setQuantities(updated);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.card,
              marginBottom: Platform.OS === 'android' ? 32 : 0,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Pedido #{orderNumber}
          </Text>

          <ScrollView
            contentContainerStyle={styles.itemsContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {items.map((item, index) => {
              const itemKey = `${item.name}_${item.size || ''}_${index}`;
              const currentQuantity = quantities[itemKey] || 0;
              const isChecked = checkedItems.includes(itemKey);

              return (
                <View key={itemKey} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[styles.itemText, { color: theme.textPrimary }]}
                    >
                      🔹 {item.name} {item.size ? `(${item.size})` : ''}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                      Quantidade: {currentQuantity} / {item.quantity}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.inputGroup,
                      { backgroundColor: theme.inputBg },
                    ]}
                  >
                    <Button
                      type="icon"
                      iconName={
                        isChecked ? 'checkmark-circle' : 'qr-code-outline'
                      }
                      iconColor={isChecked ? theme.green : theme.textPrimary}
                      onPress={() => {
                        setQrItem(itemKey);
                        setScanVisible(true);
                      }}
                    />
                  </View>
                </View>
              );
            })}

            {checkedItems.length > 0 && (
              <View style={styles.checkedSection}>
                <Text style={[styles.checkedTitle, { color: theme.green }]}>
                  Itens Conferidos:
                </Text>
                {checkedItems.map((itemKey) => {
                  const [name, size] = itemKey.split('_');
                  return (
                    <View
                      key={itemKey}
                      style={[
                        styles.checkedItem,
                        { backgroundColor: theme.inputBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkedText,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {name} {size ? `(${size})` : ''}
                      </Text>
                      <Button
                        type="icon"
                        iconName="close-circle"
                        iconColor={theme.red}
                        onPress={() => handleRemoveItem(itemKey)}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {user?.role === 'admin' && (
              <View style={styles.row}>
                <Button
                  type="icon"
                  iconName="create-outline"
                  title="Editar"
                  iconColor="#007AFF"
                  onPress={() => 
                   // router.push(
                     // `/orders/edit/${deliveryId}`
                   // )
                   {}
                  }
                />
                <Button
                  onPress={handleCancel}
                  type="icon"
                  iconName="close-circle"
                  iconColor={theme.red}
                  title="Cancelar Pedido"
                />
              </View>
            )}

            <Button
              onPress={handleConfirm}
              type="primary"
              title="Finalizar Conferência"
            />
            <Button onPress={onClose} type="outline" title="Fechar" />
          </View>
        </View>

        <ScanItemsModal
          visible={scanVisible}
          onClose={() => setScanVisible(false)}
          onScannedSuccess={handleQrScanned}
          stockId={qrItem ?? ''}
          companyId={user?.companyId || ''}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    borderRadius: 12,
    padding: 18,
    width: '92%',
    maxHeight: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  itemsContainer: {
    paddingBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  qrButton: {
    padding: 6,
  },
  footer: {
    marginTop: 20,
  },
  checkedSection: {
    marginTop: 20,
  },
  checkedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  checkedText: {
    fontSize: 15,
  },
});
