import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Container, Title, ButtonText } from '../../components/styled';
import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { StockItem } from '../../types';
import QrCodeModal from '@/components/ScanQrcode/QrCodeModal';
import { Ionicons } from '@expo/vector-icons';

export default function Stock() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [liters, setLiters] = useState('');
  const [qrVisible, setQrVisible] = useState(false);
  const [currentQrValue, setCurrentQrValue] = useState<string | null>(null);

  useEffect(() => {
    fetchStock();
  }, []);

  async function fetchStock() {
    const stockCollection = await getDocs(collection(db, 'stock'));
    const items: StockItem[] = stockCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockItem[];
    setStockItems(items);
  }

  async function saveStockItem() {
    try {
      if (editItem) {
        await updateDoc(doc(db, 'stock', editItem.id), {
          name,
          type,
          quantity: Number(quantity),
          liters: Number(liters),
        });
        setEditItem(null);
      } else {
        const newDocRef = await addDoc(collection(db, 'stock'), {
          name,
          type,
          quantity: Number(quantity),
          liters: Number(liters),
        });
        setCurrentQrValue(newDocRef.id);
        setQrVisible(true);
      }
      setModalVisible(false);
      setName('');
      setType('');
      setQuantity('');
      setLiters('');
      fetchStock();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Falha ao salvar o produto');
    }
  }

  function handleEditItem(item: StockItem) {
    setEditItem(item);
    setName(item.name);
    setType(item.type);
    setQuantity(item.quantity.toString());
    setLiters(item.liters?.toString() || '');
    setModalVisible(true);
  }

  async function handleDeleteItem(itemId: string) {
    await deleteDoc(doc(db, 'stock', itemId));
    fetchStock();
  }

  return (
    <Container>
      {/* Botão fora do scroll */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
        <Text style={styles.addButtonText}>Adicionar Produto</Text>
      </TouchableOpacity>

      <ScrollView>
        <Title>Gestão de Estoque</Title>
        {stockItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemType}>Tipo: {item.type}</Text>
            <Text style={styles.quantity}>
              Quantidade: {item.quantity} unidades
            </Text>
            <Text style={styles.quantity}>
              Capacidade: {item.liters} litros
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setCurrentQrValue(item.id) || setQrVisible(true)}>
                <Ionicons name="qr-code-outline" size={22} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEditItem(item)}>
                <Ionicons name="create-outline" size={22} color="#FFA500" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Nome do Produto"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Tipo (barril, co2, etc)"
              value={type}
              onChangeText={setType}
              style={styles.input}
            />
            <TextInput
              placeholder="Quantidade"
              value={quantity}
              keyboardType="numeric"
              onChangeText={setQuantity}
              style={styles.input}
            />
            <TextInput
              placeholder="Litros (se aplicável)"
              value={liters}
              keyboardType="numeric"
              onChangeText={setLiters}
              style={styles.input}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveStockItem}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <QrCodeModal
        visible={qrVisible}
        value={currentQrValue || ''}
        onClose={() => setQrVisible(false)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
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
