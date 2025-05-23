// CreateOrder.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
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
} from '../../src/components/styled';
import { router } from 'expo-router';
import { db } from '../../src/firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useTheme } from '@/src/context/ThemeContext';
import ProductSelector from '@/src/components/ProductSelector';
import AddProductModal from '@/src/components/modal/AddProductModal';
import { Product } from '@/src/types';
import { Picker } from '@react-native-picker/picker';
import AddressModal from '@/src/components/modal/AddressModal/AddressModal';

const orderSchema = z.object({
  customerName: z.string().min(2),
  address: z.string().min(5),
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
type SelectableProduct = Product & { quantity: number };
type Address = {
  id: string;
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  reference?: string;
  companyId: string;
  createdAt: string;
};

export default function CreateOrder() {
  const { theme } = useTheme();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectableProduct[]>([]);

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
          favorite: doc.data().favorite ?? false,
          createdAt: doc.data().createdAt ?? '',
          companyId: doc.data().companyId ?? '',
          unity: doc.data().unity ?? '',
          type: doc.data().type || '',
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

  useEffect(() => {
    const fetchAddresses = async () => {
      const snapshot = await getDocs(collection(db, 'addresses'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAddresses(list as Address[]);
    };
    fetchAddresses();
  }, []);

  const updateFormItems = (items: SelectableProduct[]) => {
    setValue(
      'items',
      items.map(({ id, name, quantity, size, price }) => ({
        id,
        name,
        quantity,
        size,
        price,
      }))
    );
  };

  const addItem = (itemId: string) => {
    const item = products.find((i) => i.id === itemId);
    if (item) {
      const withQty: SelectableProduct = { ...item, quantity: 1 };
      const updated = [...selectedItems, withQty];
      setSelectedItems(updated);
      updateFormItems(updated);
    }
  };

  const removeItem = (itemId: string) => {
    const updated = selectedItems.filter((i) => i.id !== itemId);
    setSelectedItems(updated);
    updateFormItems(updated);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const updated = selectedItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setSelectedItems(updated);
    updateFormItems(updated);
  };

  const onSubmit = async (data: OrderForm) => {
    try {
      const user = {
        email: '',
        companyId: 'empresa-123',
      };
      const totalLiters = data.items.reduce(
        (sum, item) => sum + item.quantity * (parseInt(item.size || '0') || 0),
        0
      );
      const newOrder = {
        customerName: data.customerName,
        items: data.items.map(({ id, name, quantity }) => ({
          id,
          stockItemId: id,
          name,
          quantity,
        })),
        status: 'pendente',
        deliveryPersonId: undefined,
        date: data.scheduledDate,
        paymentMethod: data.paymentMethod,
        totalLiters,
        adminEmail: user.email,
        companyId: user.companyId,
      };
      await addDoc(collection(db, 'orders'), newOrder);
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
            <CardTitle style={{ color: theme.textPrimary }}>
              Agendar Entrega
            </CardTitle>
            <TouchableOpacity
              onPress={() => setCalendarVisible(true)}
              style={[styles.dateButton, { backgroundColor: theme.inputBg }]}
            >
              <Text style={{ color: theme.text }}>
                {scheduledDate.toLocaleString()}
              </Text>
            </TouchableOpacity>
            <Modal visible={calendarVisible} transparent>
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

            <CardTitle style={{ color: theme.textPrimary }}>Endereço</CardTitle>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <>
                  <Picker selectedValue={value} onValueChange={onChange}>
                    <Picker.Item label="Selecione um endereço" value="" />
                    {addresses.map((addr) => (
                      <Picker.Item
                        key={addr.id}
                        label={`${addr.name} - ${addr.street}, ${addr.number}`}
                        value={`${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city} - ${addr.state}`}
                      />
                    ))}
                  </Picker>
                  <Button onPress={() => setAddressModalVisible(true)}>
                    <ButtonText>Novo Endereço</ButtonText>
                  </Button>
                </>
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

        <AddressModal
          visible={addressModalVisible}
          onClose={() => setAddressModalVisible(false)}
          onAddressAdded={async () => {
            const snapshot = await getDocs(collection(db, 'addresses'));
            const list = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAddresses(list as Address[]);
          }}
        />
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    marginVertical: 20,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});
