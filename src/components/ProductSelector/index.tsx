// components/ProductSelector.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Button from '../Button';
import { SelectableProduct } from '@/src/types';
import { useTheme } from '@/src/context/ThemeContext';

interface ProductSelectorProps {
  loading: boolean;
  selectedItems: SelectableProduct[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onOpenAddModal?: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  loading,
  selectedItems,
  onRemoveItem,
  onUpdateQuantity,
  onOpenAddModal,
}) => {
  const { theme } = useTheme();
  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <View>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Text style={styles.productText}>
                {item.name}
              </Text>
              <Text style={styles.productText}>
                {item.type}, {item.brand}
              </Text>
              <Text style={styles.productText}>
                {item.size} {item.unity} 
              </Text>
             
              <View style={styles.quantityContainer}>
                <Button    
                  iconName='remove'
                  onPress={() => {
                    if (item.quantity > 1) {
                      onUpdateQuantity(item.id, item.quantity - 1);
                    }
                  }}
                  type="icon"
                  disabled={item.quantity <= 1}
                />
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Button
                  iconName='add'
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  type="icon"
                />
                <Button
                  style={{ width: 100 }}
                  iconName='trash'
                  iconColor={theme.red}
                  onPress={() => onRemoveItem(item.id)}
                  type="icon"
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
