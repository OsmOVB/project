import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryItem } from '@/app/(tabs)/index';
import ScanItemsModal from '../ScanItemsModal';
import Button from '../../Button';
import { useTheme } from '@/src/context/ThemeContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { StatusOrder } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { router } from 'expo-router';

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh: () => void;
  items: DeliveryItem[];
  deliveryId: string;
}

export default function ProductModal({
  visible,
  onClose,
  onRefresh,
  items,
  deliveryId,
}: ProductModalProps) {
  const { theme } = useTheme();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [qrItem, setQrItem] = useState<string | null>(null);
  const [scanVisible, setScanVisible] = useState(false);

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

      console.log(`Status atualizado: ${currentStatus} -> ${nextStatus}`);
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status. Tente novamente.');
    }
  };

  const { user } = useAuth();

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

  const handleQrScanned = (itemKey: string) => {
    const [name, size, indexStr] = itemKey.split('_');
    const index = parseInt(indexStr);
    const item = items[index];

    if (!item || `${item.name}_${item.size || ''}_${index}` !== itemKey) {
      alert(`QR inválido ou fora do pedido.`);
      return;
    }

    const current = quantities[itemKey] || 0;
    if (current >= item.quantity) {
      alert(`"${item.name} ${item.size}" já conferido totalmente.`);
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [itemKey]: current + 1,
    }));

    if (!checkedItems.includes(itemKey)) {
      setCheckedItems((prev) => [...prev, itemKey]);
    }
  };

  const handleRemoveItem = (itemName: string) => {
    setCheckedItems((prev) => prev.filter((name) => name !== itemName));
    const updated = { ...quantities };
    delete updated[itemName];
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
            Itens do Pedido: {deliveryId}
          </Text>
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/orders/edit/${delivery.id}`)}
            >
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          )}

          <ScrollView contentContainerStyle={styles.itemsContainer}>
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
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => {
                        setQrItem(itemKey);
                        setScanVisible(true);
                      }}
                    >
                      <Ionicons
                        name={
                          isChecked ? 'checkmark-circle' : 'qr-code-outline'
                        }
                        size={24}
                        color={isChecked ? theme.green : theme.textPrimary}
                      />
                    </TouchableOpacity>
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
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(itemKey)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={theme.red}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {user?.role === 'admin' && (
              <Button
                onPress={handleCancel}
                type="danger"
                title="Cancelar Pedido"
              />
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
          onScanned={handleQrScanned}
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
  editButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},
editText: {
  marginLeft: 6,
  fontSize: 14,
  color: '#007AFF',
  fontWeight: '600',
},

});
