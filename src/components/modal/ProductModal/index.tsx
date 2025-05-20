import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryItem } from '@/app/(tabs)/index';
import ScanItemsModal from '../ScanItemsModal';
import Button from '../../Button';

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
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [qrItem, setQrItem] = useState<string | null>(null);
  const [scanVisible, setScanVisible] = useState(false);

  const handleConfirm = () => {
    console.log('Itens conferidos:', quantities, checkedItems);
    onRefresh();
    onClose();
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Itens do Pedido: {deliveryId}</Text>

          <ScrollView contentContainerStyle={styles.itemsContainer}>
            {items.map((item, index) => {
              const itemKey = `${item.name}_${item.size || ''}_${index}`;
              const currentQuantity = quantities[itemKey] || 0;
              const isChecked = checkedItems.includes(itemKey);

              return (
                <View key={itemKey} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemText}>
                      🔹 {item.name} {item.size ? `(${item.size})` : ''}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666' }}>
                      Quantidade: {currentQuantity} / {item.quantity}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    {/* <TextInput
                      placeholder="Qtd."
                      keyboardType="numeric"
                      style={styles.input}
                      value={currentQuantity.toString()}
                      onChangeText={(text) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [itemKey]: parseInt(text) || 0,
                        }))
                      }
                    /> */}

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
                        color={isChecked ? '#28A745' : '#333'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            {checkedItems.length > 0 && (
              <View style={styles.checkedSection}>
                <Text style={styles.checkedTitle}>Itens Conferidos:</Text>
                {checkedItems.map((itemKey) => {
                  const [name, size] = itemKey.split('_');
                  return (
                    <View key={itemKey} style={styles.checkedItem}>
                      <Text style={styles.checkedText}>
                        {name} {size ? `(${size})` : ''}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(itemKey)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#FF3B30"
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              onPress={handleConfirm}
              type="primary"
              title="Finalizar Conferência"
            />

            <Button onPress={onClose} type="outline" title="Cancelar" />
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
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 18,
    width: '92%',
    maxHeight: '90%',
  },
  headerText: { 
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
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
    color: '#000',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    width: 60,
    textAlign: 'center',
  },
  qrButton: {
    padding: 6,
  },
  footer: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 6,
  },
  confirmText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  checkedSection: {
    marginTop: 20,
  },
  checkedTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#28A745',
  },
  checkedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d4f8dc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  checkedText: {
    fontSize: 15,
    color: '#000',
  },
});
