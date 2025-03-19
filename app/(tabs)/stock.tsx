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
  Image,
} from 'react-native';
import { Container, Title, Button, ButtonText } from '../../components/styled';
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
import QRCode from 'qrcode';
import QrCodeModal from '@/components/ScanQrcode/QrCodeModal';

export default function Stock() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQrImage, setCurrentQrImage] = useState<string | null>(null);
  const [currentQrItemId, setCurrentQrItemId] = useState<string | null>(null);
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

  async function showQrCode(itemId: string) {
    setCurrentQrValue(itemId);
    setQrVisible(true);
  }

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
        setCurrentQrItemId(newDocRef.id);
        await showQrCode(newDocRef.id);
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



  async function handleEditItem(item: StockItem) {
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
      <ScrollView>
        <Title>Gestão de Estoque</Title>
        {stockItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <View>
              <Title style={styles.itemName}>{item.name}</Title>
              <Text style={styles.itemType}>Tipo: {item.type}</Text>
              <Text style={styles.quantity}>
                Quantidade: {item.quantity} unidades
              </Text>
              <Text style={styles.quantity}>
                Capacidade: {item.liters} litros
              </Text>
              <Button onPress={() => showQrCode(item.id)}>
                <ButtonText>Visualizar QRCode</ButtonText>
              </Button>
              <Button onPress={() => handleEditItem(item)}>
                <ButtonText>Editar</ButtonText>
              </Button>
              <Button onPress={() => handleDeleteItem(item.id)}>
                <ButtonText>Apagar</ButtonText>
              </Button>
            </View>
          </View>
        ))}
        <Button onPress={() => setModalVisible(true)}>
          <ButtonText>Adicionar Novo Produto</ButtonText>
        </Button>

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
              <Button onPress={saveStockItem}>
                <ButtonText>Salvar Produto e Gerar QRCode</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  setModalVisible(false);
                  setEditItem(null);
                }}
              >
                <ButtonText>Cancelar</ButtonText>
              </Button>
            </View>
          </View>
        </Modal>

        <Modal visible={qrModalVisible} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {currentQrImage && (
                <Image
                  source={{ uri: currentQrImage }}
                  style={{ width: 200, height: 200 }}
                />
              )}
              <Text>ID: {currentQrItemId}</Text>
              <Button onPress={() => setQrModalVisible(false)}>
                <ButtonText>Fechar</ButtonText>
              </Button>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <QrCodeModal
        visible={qrVisible}
        value={currentQrValue || ''}
        onClose={() => setQrVisible(false)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    marginBottom: 5,
  },
  itemType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
});
