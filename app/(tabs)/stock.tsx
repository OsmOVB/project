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
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { StockItem, TipoItem } from '../../src/types';
import QrCodeModal from '@/src/components/ScanQrcode/QrCodeModal';
import { Ionicons } from '@expo/vector-icons';
import ConfirmModal from '@/src/components/ConfirmModal';
import StarRating from '@/src/components/StarRating';
import { useRouter } from 'expo-router';

export default function Stock() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEnum, setSelectedEnum] = useState<TipoItem | null>(null);
  const [quantity, setQuantity] = useState('');
  const [qrVisible, setQrVisible] = useState(false);
  const [currentQrValue, setCurrentQrValue] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [enumModalVisible, setEnumModalVisible] = useState(false);
  const [newEnumValue, setNewEnumValue] = useState('');
  const [newEnumSize, setNewEnumSize] = useState('');
  const [newEnumBrand, setNewEnumBrand] = useState('');
  const [newEnumFavorite, setNewEnumFavorite] = useState(3);
  const [enums, setEnums] = useState<TipoItem[]>([]);
  const [showEnumList, setShowEnumList] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchStock();
    fetchEnums();
  }, []);

  async function fetchStock() {
    const stockCollection = await getDocs(collection(db, 'stock'));
    const items: StockItem[] = stockCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockItem[];

    setStockItems(items);
  }

  async function fetchEnums() {
    const enumCollection = await getDocs(collection(db, 'product_enums'));
    const enumList = enumCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TipoItem[];
    setEnums(enumList.sort((a, b) => b.favorite - a.favorite));
  }

  async function saveEnum() {
    if (!newEnumValue) return;
    await addDoc(collection(db, 'product_enums'), {
      name: newEnumValue,
      size: newEnumSize,
      brand: newEnumBrand,
      favorite: newEnumFavorite,
      createdAt: new Date().toISOString(),
    });
    setNewEnumValue('');
    setNewEnumSize('');
    setNewEnumBrand('');
    setNewEnumFavorite(3);
    setEnumModalVisible(false);
    fetchEnums();
  }

  async function addStockItemFromEnum() {
    if (!selectedEnum || !quantity) return;
    await addDoc(collection(db, 'stock'), {
      tipoItemId: selectedEnum.id,
      tipoItemName: selectedEnum.name,
      quantity: Number(quantity),
      liters: selectedEnum.size ? parseInt(selectedEnum.size) : 0,
      loteId: 1,
      dataLote: new Date().toLocaleDateString(),
      sequenciaLote: stockItems.length + 1,
      pendenciaImpressao: 'S',
    });
    setModalVisible(false);
    setSelectedEnum(null);
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
      <TouchableOpacity
        style={styles.enumButton}
        onPress={() => setEnumModalVisible(true)}
      >
        <Ionicons name="list-circle-outline" size={28} color="#28A745" />
        <Text style={styles.enumButtonText}>Cadastrar Tipo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.enumButton}
        onPress={() => setShowEnumList(!showEnumList)}
      >
        <Ionicons name="list-outline" size={28} color="#007AFF" />
        <Text style={styles.enumButtonText}>Ver Lista de Tipos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.enumButton, { backgroundColor: '#ddd' }]}
        onPress={() => router.push('/stock/lotes')}
      >
        <Ionicons name="cube-outline" size={24} color="#000" />
        <Text style={styles.enumButtonText}>Ver Lotes</Text>
      </TouchableOpacity>

      {showEnumList ? (
        <ScrollView>
          {enums.map((enumItem, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{enumItem.name}</Text>
              <Text>{enumItem.size && `Tamanho: ${enumItem.size}`}</Text>
              <Text>{enumItem.brand && `Marca: ${enumItem.brand}`}</Text>
              <StarRating
                rating={enumItem.favorite}
                onChange={(val) => {
                  updateDoc(doc(db, 'product_enums', enumItem.id), {
                    favorite: val,
                  });
                  fetchEnums();
                }}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView>
          {enums.map((enumItem, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{enumItem.name}</Text>
              <Text>{enumItem.size && `Tamanho: ${enumItem.size}`}</Text>
              <Text>{enumItem.brand && `Marca: ${enumItem.brand}`}</Text>
              <StarRating rating={enumItem.favorite} disabled />
              <TextInput
                placeholder="Quantidade"
                keyboardType="numeric"
                value={selectedEnum?.id === enumItem.id ? quantity : ''}
                onChangeText={(text) => {
                  setSelectedEnum(enumItem);
                  setQuantity(text);
                }}
                style={styles.input}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() =>
                  openConfirm(
                    'Deseja adicionar ao estoque?',
                    addStockItemFromEnum
                  )
                }
              >
                <Text style={styles.saveButtonText}>Adicionar Estoque</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={enumModalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Novo tipo (ex: Barril, CO2, etc)"
              value={newEnumValue}
              onChangeText={setNewEnumValue}
              style={styles.input}
            />
            <TextInput
              placeholder="Tamanho (ex: 30L, 50L)"
              value={newEnumSize}
              onChangeText={setNewEnumSize}
              style={styles.input}
            />
            <TextInput
              placeholder="Marca (ex: Heineken)"
              value={newEnumBrand}
              onChangeText={setNewEnumBrand}
              style={styles.input}
            />
            <Text style={{ marginVertical: 8 }}>
              Favoritos (1 a 5 estrelas):
            </Text>
            <StarRating
              rating={newEnumFavorite}
              onChange={(val: React.SetStateAction<number>) =>
                setNewEnumFavorite(val)
              }
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveEnum}>
              <Text style={styles.saveButtonText}>Salvar Tipo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEnumModalVisible(false)}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
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
  itemType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
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
});
