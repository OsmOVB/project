import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/src/context/ThemeContext';
import { db } from '@/src/firebase/config';
import StarRating from '../StarRating';
import Button from '../Button';
import { Product } from '@/src/types';

interface Props {
  product: Product;
  index: number;
  selected: Product | null;
  price: string;
  quantity: string;
  showList: boolean;
  setSelected: (product: Product) => void;
  setQuantity: (value: string) => void;
  setPrice: (value: string) => void;
  openConfirm: (msg: string, action: () => void) => void;
  addStockItem: () => void;
  fetchProduct: () => void;
}

const StockCard: React.FC<Props> = ({
  product,
  index,
  selected,
  price,
  quantity,
  showList,
  setSelected,
  setQuantity,
  setPrice,
  openConfirm,
  addStockItem,
  fetchProduct,
}) => {
  const { theme } = useTheme();
  const isSelected = selected?.id === product.id;

  return (
    <View key={index} style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {product.name}
      </Text>
      {product.size && (
        <Text style={{ color: theme.text }}>Tamanho: {product.size}</Text>
      )}
      {product.brand && (
        <Text style={{ color: theme.text }}>Marca: {product.brand}</Text>
      )}
      {product.type && (
        <Text style={{ color: theme.text }}>Tipo: {product.type}</Text>
      )}
      <Text style={{ color: theme.text }}>Unidade: {product.unity}</Text>

      <StarRating
        rating={product.favorite}
        onChange={
          showList
            ? (val: number) => {
                updateDoc(doc(db, 'product', product.id), { favorite: val });
                fetchProduct();
              }
            : undefined
        }
        disabled={!showList}
      />

      {!showList && (
        <>
          <TextInput
            placeholder="Quantidade"
            keyboardType="numeric"
            placeholderTextColor={theme.textSecondary}
            value={isSelected ? quantity : ''}
            onChangeText={(text) => {
              setSelected(product);
              setQuantity(text);
            }}
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
          />

          <TextInput
            placeholder="Preço unitário"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            value={isSelected ? price : ''}
            onChangeText={(text) => {
              setSelected(product);
              setPrice(text);
            }}
            style={[
              styles.input,
              { borderColor: theme.border, color: theme.text },
            ]}
          />

          <Button
            title="Adicionar lote ao estoque"
            onPress={() =>
              openConfirm('Deseja adicionar ao estoque?', addStockItem)
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default StockCard;
