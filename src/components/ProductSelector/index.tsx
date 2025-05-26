// components/ProductSelector.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Button from '../Button';
import { Product } from '@/src/types';

export interface SelectedItem {
  id: string;
  name: string;
  quantity: number;
  size?: string;
  brand?: string;
  unity?: string;
}

interface ProductSelectorProps {
  products: Product[];
  loading: boolean;
  selectedItems: SelectedItem[];
  onAddItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onOpenAddModal?: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  loading,
  selectedItems,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onOpenAddModal,
}) => {
  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Text style={styles.productText}>{item.name} { item.size }{ item.unity }</Text>
              <View style={styles.quantityContainer}>
                <Button
                  style={{ width: 40 }}
                  title="-"
                  onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  type="primary"
                />
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Button
                  style={{ width: 40 }}
                  title="+"
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  type="primary"
                />
                <Button
                  style={{ width: 100 }}
                  title="Remover"
                  onPress={() => onRemoveItem(item.id)}
                  type="danger"
                />
              </View>
            </View>
          ))}

          <Button
            title="Adicionar Produto"
            onPress={onOpenAddModal || (() => {})}
            type="primary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  productText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
});

export default ProductSelector;
