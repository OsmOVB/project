import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import Button from '../../Button';
import { GroupedProduct, Product, Stock } from '@/src/types';
import { groupStockByProduct } from '@/src/utils/groupStock';

interface AddProductModalProps {
  visible: boolean;
  stock: Stock[];
  products: GroupedProduct[];
  onAdd: (product: GroupedProduct) => void;
  onClose: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  products,
  stock,
  onAdd,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.productItemName.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower) ||
      item.type?.toLowerCase().includes(searchLower) ||
      (item.size !== undefined && item.size.toString().toLowerCase().includes(searchLower)) ||
      item.unity?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Adicionar Produto</Text>
          <TextInput
            placeholder="Buscar produto"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.productItemId + item.batchDate}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {item.productItemName}
                  </Text>
                  <Text>Marca: {item.brand}</Text>
                  <Text>Tipo: {item.type}</Text>
                  <Text>
                    Tamanho: {item.size} {item.unity}
                  </Text>
                  <Text>Qtd total: {item.totalQuantity}</Text>
                  <Text>Preço médio: R$ {item.averagePrice.toFixed(2)}</Text>
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    title="Adicionar"
                    onPress={() => onAdd(item)}
                    fullWidth
                  />
                </View>
              </View>
            )}
          />
          <View style={styles.cancelButtonWrapper}>
            <Button
              title="Cancelar"
              onPress={onClose}
              type="outline"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buttonWrapper: {
    width: 120,
  },
  cancelButtonWrapper: {
    marginTop: 16,
  },
});

export default AddProductModal;
