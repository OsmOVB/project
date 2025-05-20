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
import { router } from 'expo-router';
import { db } from '../../src/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useTheme } from '@/src/context/ThemeContext';
import ProductSelector from '@/src/components/ProductSelector';
import AddProductModal from '@/src/components/modal/AddProductModal';

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
      size: z.string().optional(),
      price: z.number().optional(),
    })
  ),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function CreateOrder() {
  const { theme, darkMode } = useTheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanningItemId, setScanningItemId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  type Product = {
    id: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'product'));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Produto sem nome',
          price: doc.data().price || 0,
          size: doc.data().size || '',
          quantity: doc.data().quantity || 0,
        }));
        setProducts(productsList);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addItem = (itemId: string) => {
    const item = products.find((i) => i.id === itemId);
    if (item) {
      const newItem = {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price, // Add price property to match Product type
      };
      const updatedItems = [...selectedItems, newItem];
      setSelectedItems(updatedItems);
      setValue('items', updatedItems);
    }
  };

  const removeItem = (itemId: string) => {
    const updatedItems = selectedItems.filter((item) => item.id !== itemId);
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const updatedItems = selectedItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
  };

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
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <Container>
        <ScrollView>
          <Title style={{ color: theme.textPrimary }}>Criar Novo Pedido</Title>

        <Card style={{ backgroundColor: theme.card }}>
          <CardTitle style={{ color: theme.textPrimary }}>Agendar Entrega</CardTitle>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            style={[styles.dateButton, { backgroundColor: theme.inputBg }]}
          >
            <Text style={{ color: theme.text }}> {scheduledDate.toLocaleString()} </Text>
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
              theme={theme.card}
            />
          </Modal>
        </Card>

        <Card style={{ backgroundColor: theme.card }}>
          <CardTitle style={{ color: theme.textPrimary }}>Informações do Cliente</CardTitle>
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

        <Card style={{ backgroundColor: theme.card }}>
          <CardTitle style={{ color: theme.textPrimary }}>Produtos</CardTitle>
          <ProductSelector
            products={products}
            loading={loading}
            selectedItems={selectedItems}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
            onOpenAddModal={() => setModalVisible(true)}
          />
        </Card>
        </ScrollView>
        <Button onPress={handleSubmit(onSubmit)} style={styles.submitButton}>
          <ButtonText>Cadastrar Pedido</ButtonText>
        </Button>
        <AddProductModal
          visible={modalVisible}
          products={products}
          onAdd={(product: any) => {
            addItem(product.id);
            setModalVisible(false);
          }}
          onClose={() => setModalVisible(false)}
        />
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  removeButton: {
    backgroundColor: '#FF3B30',
    marginLeft: 10,
  },
  submitButton: {
    marginVertical: 20,
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
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  dateButtonText: { color: '#1c1c1e' },
});
