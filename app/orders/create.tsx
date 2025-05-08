import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calendar from '../../src/components/Calendar';
import {
  Container,
  Title,
  Input,
  Button,
  ButtonText,
  ErrorText,
  Card,
  CardTitle,
  CardText,
} from '../../src/components/styled';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import ScanItems from '@/src/components/ScanQrcode';
import { db } from '../../src/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useThemeContext } from '@/src/context/ThemeContext';

// 📌 Validação do pedido
const orderSchema = z.object({
  customerName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  address: z.string().min(5, 'O endereço deve ter pelo menos 5 caracteres'),
  scheduledDate: z.date(),
  paymentMethod: z.enum(['crédito', 'débito', 'dinheiro', 'pix']),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number().min(1),
    })
  ),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function CreateOrder() {
  const { darkMode } = useThemeContext();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanningItemId, setScanningItemId] = useState<string | null>(null);
  const [products, setProducts] = useState<
    { id: string; name: string; price: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<
    { id: string; name: string; quantity: number }[]
  >([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      paymentMethod: 'pix',
      scheduledDate: new Date(),
      items: [],
    },
  });

  const scheduledDate = watch('scheduledDate');

  // 🔥 Buscar produtos do Firestore ao carregar a tela
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as { id: string; name: string; price: number }[];
        setProducts(productsList);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 📌 Adicionar item ao pedido
  const addItem = (itemId: string) => {
    const item = products.find((i) => i.id === itemId);
    if (item) {
      const newItem = { id: item.id, name: item.name, quantity: 1 };
      const updatedItems = [...selectedItems, newItem];
      setSelectedItems(updatedItems);
      setValue('items', updatedItems);
    }
  };

  // 📌 Remover item do pedido
  const removeItem = (itemId: string) => {
    const updatedItems = selectedItems.filter((item) => item.id !== itemId);
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
  };

  // 📌 Atualizar quantidade de item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const updatedItems = selectedItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
  };

  // 📌 Salvar pedido no Firestore
  const onSubmit = async (data: OrderForm) => {
    try {
      await addDoc(collection(db, 'orders'), data);
      console.log('Pedido salvo com sucesso:', data);
      router.back();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  return (
    <Container>
      <ScrollView>
        <Title>Criar Novo Pedido</Title>

        <Card>
          <CardTitle>Informações do Cliente</CardTitle>
          <Controller
            control={control}
            name="customerName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome do Cliente"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.customerName && (
            <ErrorText>{errors.customerName.message}</ErrorText>
          )}

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Endereço de Entrega"
                value={value}
                onChangeText={onChange}
                multiline
              />
            )}
          />
          {errors.address && <ErrorText>{errors.address.message}</ErrorText>}
        </Card>

        {/* 🔹 SELEÇÃO DE DATA MANTIDA */}
        <Card>
          <CardTitle>Agendar Entrega</CardTitle>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              {scheduledDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          <Modal visible={calendarVisible} transparent={true}>
            <Calendar
              initialDate={scheduledDate}
              onDateChange={(date) => {
                setValue('scheduledDate', date);
                setCalendarVisible(false);
              }}
              mode="datetime"
              visible={calendarVisible}
              onClose={() => setCalendarVisible(false)}
              theme={darkMode ? '#1c1c1e' : '#f5f5f5'}
            />
          </Modal>
        </Card>

        <Card>
          <CardTitle>Itens do Pedido</CardTitle>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            products.map((item) => {
              const selectedItem = selectedItems.find(
                (si) => si.id === item.id
              );
              return (
                <View key={item.id} style={styles.itemContainer}>
                  <CardText>
                    {item.name} - R${item.price}
                  </CardText>
                  {selectedItem ? (
                    <View style={styles.quantityContainer}>
                      <Button
                        onPress={() =>
                          updateQuantity(item.id, selectedItem.quantity - 1)
                        }
                      >
                        <ButtonText>-</ButtonText>
                      </Button>
                      <CardText>{selectedItem.quantity}</CardText>
                      <Button
                        onPress={() =>
                          updateQuantity(item.id, selectedItem.quantity + 1)
                        }
                      >
                        <ButtonText>+</ButtonText>
                      </Button>
                      <Button
                        onPress={() => removeItem(item.id)}
                        style={styles.removeButton}
                      >
                        <ButtonText>Remover</ButtonText>
                      </Button>
                    </View>
                  ) : (
                    <Button onPress={() => addItem(item.id)}>
                      <ButtonText>Adicionar</ButtonText>
                    </Button>
                  )}
                </View>
              );
            })
          )}
        </Card>

        <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
          <ButtonText>Criar Pedido</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  qrButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  removeButton: { 
    backgroundColor: '#FF3B30', 
    marginLeft: 10 
  },
  submitButton: { 
    marginVertical: 20 
  },
  qrButtonText: {
    color: '#FFF',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  price: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 80,
  },

  picker: {
    borderRadius: 8,
    marginTop: 10,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  dateButtonText: { color: '#1c1c1e' },
});
