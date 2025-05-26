import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Container, Title } from '../../src/components/styled';
import { db } from '../../src/firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Stock as StockProduct, Product } from '../../src/types';
import QrCodeModal from '@/src/components/ScanQrcode/QrCodeModal';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from '@/src/components/ConfirmModal';
import StarRating from '@/src/components/StarRating';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import StockCard from '@/src/components/stock/StockCard';
import Button from '@/src/components/Button';
import { RefreshControl } from 'react-native';

export default function Stock() {
  const [stockItems, setStockItems] = useState<StockProduct[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productList, setProductList] = useState<Product[]>([]);
  const [price, setPrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [showList, setShowList] = useState(false);

  const { theme } = useTheme();

  const [productForm, setProductForm] = useState({
    name: '',
    size: '',
    brand: '',
    unit: '',
    favorite: 1,
  });

  const router = useRouter();

  useEffect(() => {
    fetchStock();
    fetchProduct();
  }, []);

  function updateProductField<T extends keyof typeof productForm>(
    field: T,
    value: (typeof productForm)[T]
  ) {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function fetchStock() {
    const stockCollection = await getDocs(collection(db, 'stock'));
    const items: StockProduct[] = stockCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockProduct[];
    setStockItems(items);
  }

  async function fetchProduct() {
    const productCollection = await getDocs(collection(db, 'product'));
    const items = productCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
    setProductList(items.sort((a, b) => b.favorite - a.favorite));
  }

  async function saveProduct() {
    if (!productForm.name) return;
    await addDoc(collection(db, 'product'), {
      name: productForm.name,
      size: productForm.size,
      brand: productForm.brand,
      favorite: productForm.favorite,
      createdAt: new Date().toISOString(),
    });
    setProductForm({ name: '', size: '', brand: '', unit: '', favorite: 1 });
    setProductModalVisible(false);
    fetchProduct();
  }

async function fetchLastPrice(productId: string): Promise<string> {
  const stockRef = collection(db, 'stock');
  const q = query(
    stockRef,
    where('ProductItemId', '==', productId),
    orderBy('createdAt', 'desc'), // ou 'dataLote' se preferir
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const price = doc.data().price;
    return price ? String(price) : '';
  }

  return '';
}

  // async function addStockItem() {
  //   if (!selected || !quantity) return;
  //   await addDoc(collection(db, 'stock'), {
  //     ProductItemId: selected.id,
  //     ProductItemName: selected.name,
  //     quantity: Number(quantity),
  //     liters: selected.size ? parseInt(selected.size) : 0,
  //     loteId: 1,
  //     dataLote: new Date().toISOString().slice(0, 10),
  //     sequenciaLote: stockItems.length + 1,
  //     pendenciaImpressao: 'S',
  //   });
  //   setModalVisible(false);
  //   setSelected(null);
  //   setQuantity('');
  //   fetchStock();
  // }

async function addStockItem() {
  if (!selected || !quantity || !price) return;

  const currentDate = new Date().toISOString().slice(0, 10);
  const productId = selected.id;
  const parsedPrice = parseFloat(price);

  const stockSnapshot = await getDocs(collection(db, 'stock'));
  const existingLote = stockSnapshot.docs.find((doc) => {
    const data = doc.data();
    return (
      data.ProductItemId === productId &&
      data.dataLote === currentDate &&
      data.price === parsedPrice
    );
  });

  if (existingLote) {
    const docRef = doc(db, 'stock', existingLote.id);
    const newQty = existingLote.data().quantity + Number(quantity);
    await updateDoc(docRef, {
      quantity: newQty,
      pendenciaImpressao: 'S',
    });
  } else {
    const loteId = await calculateNextLoteId(currentDate, productId, parsedPrice);

    await addDoc(collection(db, 'stock'), {
      ProductItemId: productId,
      ProductItemName: selected.name,
      quantity: Number(quantity),
      liters: selected.size ? parseInt(selected.size) : 0,
      loteId,
      dataLote: currentDate,
      sequenciaLote: stockItems.length + 1,
      pendenciaImpressao: 'S',
      price: parsedPrice,
    });
  }

  setModalVisible(false);
  setSelected(null);
  setQuantity('');
  setPrice('');
  fetchStock();
}

async function calculateNextLoteId(date: string, productId: string, price: number) {
  const snapshot = await getDocs(collection(db, 'stock'));
  const todayLotes = snapshot.docs.filter((doc) => {
    const data = doc.data();
    return data.dataLote === date && data.ProductItemId === productId;
  });

  const hasSamePrice = todayLotes.find((doc) => doc.data().price === price);
  if (hasSamePrice) {
    return hasSamePrice.data().loteId;
  }

  const loteIds = todayLotes.map((doc) => doc.data().loteId);
  return loteIds.length > 0 ? Math.max(...loteIds) + 1 : 1;
}

  function openConfirm(message: string, action: () => void) {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  }

  function onRefresh() {
    setRefreshing(true);
    fetchStock();
    fetchProduct();
    setTimeout(() => setRefreshing(false), 1000);
  }

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
              placeholder="Tipo do produto (ex: Barril, CO2)"
              value={productForm.name}
              onChangeText={(text) => updateProductField('name', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Especificação (ex: 30, 50, 2 torneiras)"
              value={productForm.size}
              onChangeText={(text) => updateProductField('size', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Marca (ex: Premium, Larger)"
              value={productForm.brand}
              onChangeText={(text) => updateProductField('brand', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <TextInput
              placeholder="Unidade (ex: UN, KG)"
              value={productForm.unit}
              onChangeText={(text) => updateProductField('unit', text)}
              style={styles.input}
              placeholderTextColor={theme.textSecondary}
            />
            <Text style={{ marginVertical: 8, color: theme.textPrimary }}>
              Favoritos (1 a 5 estrelas):
            </Text>
            <StarRating
              rating={productForm.favorite}
              onChange={(val: number) => updateProductField('favorite', val)}
            />
            <Button
              type="primary"
              onPress={() => saveProduct()}
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
  enumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  enumButtonText: {
    fontSize: 16,
    color: '#28A745',
    marginLeft: 8,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    elevation: 2,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
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

  statDivider: {
    width: 1,
    height: '100%',
  },
});
