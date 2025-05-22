// components/AddProductModal.tsx
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
import { Product } from '@/src/types';

interface AddProductModalProps {
  visible: boolean;
  products: Product[];
  onAdd: (product: Product) => void;
  onClose: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ visible, products, onAdd, onClose }) => {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text>{item.name}</Text>
                <Text>{item.size}</Text>
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