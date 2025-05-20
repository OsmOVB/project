import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/src/context/ThemeContext';
import { db } from '@/src/firebase/config';
import StarRating from '../StarRating';

interface Props {
  product: any;
  index: number;
  selected: any;
  quantity: string;
  showList: boolean;
  setSelected: (product: any) => void;
  setQuantity: (value: string) => void;
  openConfirm: (msg: string, action: () => void) => void;
  addStockItem: () => void;
  fetchProduct: () => void;
}

const StockCard: React.FC<Props> = ({
  product,
  index,
  selected,
  quantity,
  showList,
  setSelected,
  setQuantity,
  openConfirm,
  addStockItem,
  fetchProduct,
}) => {
  const { theme } = useTheme();

  return (
    <View key={index} style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{product.name}</Text>
      <Text style={{ color: theme.text }}>{product.size && `Tamanho: ${product.size}`}</Text>
      <Text style={{ color: theme.text }}>{product.brand && `Marca: ${product.brand}`}</Text>

      <StarRating
        rating={product.favorite}
        onChange={
          showList
            ? (val: any) => {
                updateDoc(doc(db, 'product', product.id), {
                  favorite: val,
                });
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
            value={selected?.id === product.id ? quantity : ''}
            onChangeText={(text) => {
              setSelected(product);
              setQuantity(text);
            }}
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholderTextColor={theme.background}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => openConfirm('Deseja adicionar ao estoque?', addStockItem)}
          >
            <Text style={styles.buttonText}>Adicionar lote ao estoque</Text>
          </TouchableOpacity>
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