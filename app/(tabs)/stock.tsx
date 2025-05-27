import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Container, Title } from '../../src/components/styled';
import { db } from '../../src/firebase/config';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import type { Stock, Product } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from '@/src/components/ConfirmModal';
import StarRating from '@/src/components/StarRating';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import StockCard from '@/src/components/stock/StockCard';
import Button from '@/src/components/Button';
import { useAuth } from '@/src/hooks/useAuth';

export default function Stock() {
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [showList, setShowList] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [productForm, setProductForm] = useState<
    Omit<Product, 'id' | 'createdAt' | 'companyId'>
  >({
    name: '',
    type: '',
    size: '',
    brand: '',
    unity: '',
    favorite: 1,
  });

  useEffect(() => {
    fetchStock();
    fetchProduct();
  }, []);

  const updateProductField = <T extends keyof typeof productForm>(
    field: T,
    value: (typeof productForm)[T]
  ) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchStock = async () => {
    const stockCollection = await getDocs(collection(db, 'stock'));
    const items = stockCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Stock[];
    setStockItems(items);
  };

  const fetchProduct = async () => {
    const productCollection = await getDocs(collection(db, 'product'));
    const items = productCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    setProductList(items.sort((a, b) => b.favorite - a.favorite));
  };

async function addStockItem() {
  if (!selected || !quantity || !price) return;

  const currentDate = new Date().toISOString().slice(0, 10);
  const productId = selected.id;
  const parsedPrice = parseFloat(price);
  const qty = Number(quantity);
  const companyId = selected.companyId || '';

  const batchId = await calculateNextBatchId(currentDate, productId, parsedPrice, companyId);

  const promises = Array.from({ length: qty }).map(async () => {
    const newStockItem: Omit<Stock, 'id'> = {
      productItemId: productId,
      batchId,
      companyId,
      adminEmail: user?.email || '',
      volumeLiters: selected.size ? parseInt(selected.size) : 0,
      batchDate: currentDate,
      pendingPrint: 'Y',
      price: parsedPrice,
      qrCode: '',
    };
    await addDoc(collection(db, 'stock'), newStockItem);
  });

  await Promise.all(promises);

  setSelected(null);
  setQuantity('');
  setPrice('');
  fetchStock();
}

async function calculateNextBatchId(
  batchDate: string,
  productId: string,
  price: number,
  companyId: string
): Promise<number> {
  const stockQuery = query(
    collection(db, 'stock'),
    where('productItemId', '==', productId),
    where('batchDate', '==', batchDate),
    where('companyId', '==', companyId)
  );

  const stockSnapshot = await getDocs(stockQuery);

  let maxBatchId = 0;
  let matchedBatchId: number | null = null;

  stockSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (typeof data.batchId === 'number') {
      if (data.price === price && matchedBatchId === null) {
        matchedBatchId = data.batchId;
      }
      if (data.batchId > maxBatchId) {
        maxBatchId = data.batchId;
      }
    }
  });

  if (matchedBatchId !== null) return matchedBatchId;

  return maxBatchId + 1;
}

  const saveProduct = async () => {
    if (!productForm.name || !productForm.type) return;
    await addDoc(collection(db, 'product'), {
      ...productForm,
      createdAt: new Date().toISOString(),
      companyId: user?.companyId || '',
    });
    setProductForm({
      name: '',
      type: '',
      size: '',
      brand: '',
      unity: '',
      favorite: 1,
    });
    setProductModalVisible(false);
    fetchProduct();
  };

  const openConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStock();
    fetchProduct();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <Container>
      <Title>Gestão de Estoque</Title>

      <Text style={[styles.tabLabel, { color: theme.primary }]}>Produtos</Text>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabItem, { backgroundColor: theme.background }]}
            onPress={() => setProductModalVisible(true)}
          >
            <Ionicons
              name="list-circle-outline"
              size={28}
              color={theme.primary}
            />
            <Text style={[styles.tabLabel, { color: theme.primary }]}>
              Cadastrar
            </Text>
          </Pressable>
          <View
            style={[styles.statDivider, { backgroundColor: theme.border }]}
          />
          <Pressable
            style={[styles.tabItem, { backgroundColor: theme.background }]}
            onPress={() => setShowList(!showList)}
          >
            <Ionicons name="list-outline" size={28} color={theme.primary} />
            <Text style={[styles.tabLabel, { color: theme.primary }]}>
              Lista
            </Text>
          </Pressable>
          <View
            style={[styles.statDivider, { backgroundColor: theme.border }]}
          />
          <Pressable
            style={[styles.tabItem, { backgroundColor: theme.background }]}
            onPress={() => router.push('/stock/lotes')}
          >
            <Ionicons name="cube-outline" size={28} color={theme.primary} />
            <Text style={[styles.tabLabel, { color: theme.primary }]}>
              Lotes
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {productList.map((product, index) => (
          <StockCard
            key={index}
            product={product}
            index={index}
            selected={selected}
            price={price}
            quantity={quantity}
            showList={showList}
            setPrice={setPrice}
            setSelected={setSelected}
            setQuantity={setQuantity}
            openConfirm={openConfirm}
            addStockItem={addStockItem}
            fetchProduct={fetchProduct}
          />
        ))}
      </ScrollView>

      <Modal visible={productModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <TextInput
              placeholder="Nome do produto (ex: Barril)"
              value={productForm.name}
              onChangeText={(text) => updateProductField('name', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Tipo (ex: chopeira, CO2)"
              value={productForm.type}
              onChangeText={(text) => updateProductField('type', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Tamanho (ex: 50 litros)"
              value={productForm.size}
              onChangeText={(text) => updateProductField('size', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Marca (ex: Colina, Heineken)"
              value={productForm.brand}
              onChangeText={(text) => updateProductField('brand', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Unidade (ex: L, UN, KG)"
              value={productForm.unity}
              onChangeText={(text) => updateProductField('unity', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={{ marginVertical: 8, color: theme.textPrimary }}>
              Favoritos (1 a 6 estrelas):
            </Text>
            <StarRating
              rating={productForm.favorite}
              onChange={(val: number) => updateProductField('favorite', val)}
            />
            <Button
              type="primary"
              onPress={saveProduct}
              title="Salvar Produto"
            />
            <Button
              type="outline"
              onPress={() => setProductModalVisible(false)}
              title="Cancelar"
            />
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmVisible}
        message={confirmMessage}
        onConfirm={() => {
          confirmAction();
          setConfirmVisible(false);
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 5,
    gap: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tabItem: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});
