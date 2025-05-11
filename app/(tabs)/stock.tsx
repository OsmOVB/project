import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Container, Title } from '../../src/components/styled';
import { db } from '../../src/firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { Stock as StockProduct, Product } from '../../src/types';
import QrCodeModal from '@/src/components/ScanQrcode/QrCodeModal';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from '@/src/components/ConfirmModal';
import StarRating from '@/src/components/StarRating';
import { useRouter } from 'expo-router';

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
  const [showList, setShowList] = useState(false);

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
    value: typeof productForm[T]
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

  async function addStockItem() {
    if (!selected || !quantity) return;
    await addDoc(collection(db, 'stock'), {
      ProductItemId: selected.id,
      ProductItemName: selected.name,
      quantity: Number(quantity),
      liters: selected.size ? parseInt(selected.size) : 0,
      loteId: 1,
      dataLote: new Date().toLocaleDateString(),
      sequenciaLote: stockItems.length + 1,
      pendenciaImpressao: 'S',
    });
    setModalVisible(false);
    setSelected(null);
    setQuantity('');
    fetchStock();
  }

  function openConfirm(message: string, action: () => void) {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmVisible(true);
  }

  return (
    <Container>
      <Title>Gestão de Estoque</Title>

      <TouchableOpacity style={styles.enumButton} onPress={() => setProductModalVisible(true)}>
        <Ionicons name="list-circle-outline" size={28} color="#28A745" />
        <Text style={styles.enumButtonText}>Cadastrar Produto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.enumButton} onPress={() => setShowList(!showList)}>
        <Ionicons name="list-outline" size={28} color="#007AFF" />
        <Text style={styles.enumButtonText}>Ver Lista de Produtos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.enumButton, { backgroundColor: '#ddd' }]}
        onPress={() => router.push('/stock/lotes')}
      >
        <Ionicons name="cube-outline" size={24} color="#000" />
        <Text style={styles.enumButtonText}>Lotes de Produtos</Text>
      </TouchableOpacity>

      <ScrollView>
        {productList.map((product, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={styles.itemName}>{product.name}</Text>
            <Text>{product.size && `Tamanho: ${product.size}`}</Text>
            <Text>{product.brand && `Marca: ${product.brand}`}</Text>
            <StarRating
              rating={product.favorite}
              onChange={showList ? (val) => {
                updateDoc(doc(db, 'product', product.id), {
                  favorite: val,
                });
                fetchProduct();
              } : undefined}
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
                  style={styles.input}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() =>
                    openConfirm('Deseja adicionar ao estoque?', addStockItem)
                  }
                >
                  <Text style={styles.saveButtonText}>Adicionar ao Estoque</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={productModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Tipo do produto (ex: Barril, CO2)"
              value={productForm.name}
              onChangeText={(text) => updateProductField('name', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Especificação (ex: 30, 50, 2 torneiras)"
              value={productForm.size}
              onChangeText={(text) => updateProductField('size', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Marca (ex: Premium, Larger)"
              value={productForm.brand}
              onChangeText={(text) => updateProductField('brand', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Unidade (ex: UN, KG)"
              value={productForm.unit}
              onChangeText={(text) => updateProductField('unit', text)}
              style={styles.input}
            />
            <Text style={{ marginVertical: 8 }}>Favoritos (1 a 5 estrelas):</Text>
            <StarRating
              rating={productForm.favorite}
              onChange={(val: number) => updateProductField('favorite', val)}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
              <Text style={styles.saveButtonText}>Salvar Produto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setProductModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 10,
  },
});
