// CreateOrder.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calendar from '../../src/components/Calendar';
import {
  Container,
  Title,
  Input,
  ErrorText,
  Card,
  CardTitle,
} from '../../src/components/styled';
import { router, useLocalSearchParams } from 'expo-router';
import { db } from '../../src/firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  runTransaction,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { useTheme } from '@/src/context/ThemeContext';
import ProductSelector from '@/src/components/ProductSelector';
import AddProductModal from '@/src/components/modal/AddProductModal';
import { GroupedProduct, Product, Stock } from '@/src/types';
import { Picker } from '@react-native-picker/picker';
import AddressModal from '@/src/components/modal/AddressModal/AddressModal';
import { useAuth } from '@/src/hooks/useAuth';
import Button from '@/src/components/Button';
import { groupStockByProduct } from '@/src/utils/groupStock';

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
type SelectableProduct = GroupedProduct & { quantity: number };
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
  const { user } = useAuth();
  const localParams = useLocalSearchParams<{ orderId?: string }>();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectableProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderId = localParams.orderId;
  const isEditMode = !!orderId;
  const [pageTitle, setPageTitle] = useState(
    isEditMode ? 'Editar Pedido' : 'Criar Novo Pedido'
  );
  const [submitButtonText, setSubmitButtonText] = useState(
    isEditMode ? 'Salvar Alterações' : 'Salvar Pedido'
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
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
    if (isEditMode && orderId && groupedProducts.length > 0) {
      setPageTitle(`Editar Pedido`);
      setSubmitButtonText('Salvar Alterações');
      setLoading(true);

      const fetchOrderDetails = async () => {
        try {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);

          if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            setPageTitle(
              `Editar Pedido #${
                orderData.orderNumber || orderId.substring(0, 5)
              }`
            );

            setValue('customerName', orderData.customerName);
            setValue('address', orderData.address);
            setValue('scheduledDate', (orderData.date as Timestamp).toDate());
            setValue('paymentMethod', orderData.paymentMethod);

            const itemsFromDb = orderData.items || [];
            const enrichedSelectedItems = itemsFromDb
              .map((dbItem: any) => {
                const baseProductInfo = groupedProducts.find(
                  (gp) => gp.productItemId === dbItem.id
                );
                if (!baseProductInfo && !dbItem.name) return null;

                return {
                  productItemId: dbItem.id,
                  productItemName:
                    dbItem.name ||
                    baseProductInfo?.productItemName ||
                    'Produto Desconhecido',
                  quantity: dbItem.quantity,
                  size: dbItem.size || baseProductInfo?.size || '',
                  unity: baseProductInfo?.unity || '',
                  brand: baseProductInfo?.brand || '',
                  type: baseProductInfo?.type || '',
               //   availableStock: baseProductInfo?.availableStock || 0,
             //     price: dbItem.price || baseProductInfo?.price || 0,
                };
              })
              .filter(Boolean) as SelectableProduct[];

            setSelectedItems(enrichedSelectedItems);
            updateFormItems(enrichedSelectedItems); // Atualiza o react-hook-form
          } else {
            Alert.alert('Erro', 'Pedido não encontrado.');
            router.back();
          }
        } catch (error) {
          console.error('Erro ao buscar detalhes do pedido:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do pedido.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    } else if (!isEditMode) {
      setPageTitle('Criar Novo Pedido');
      setSubmitButtonText('Salvar Pedido');
    }
  }, [isEditMode, orderId, groupedProducts, setValue, reset, router]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stockSnap = await getDocs(collection(db, 'stock'));
      const productSnap = await getDocs(collection(db, 'product'));

      const stockItems = stockSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stock[];

      const productItems = productSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      const filteredStock = stockItems.filter(
        (item) => item.companyId === user?.companyId
      );
      const filteredProducts = productItems.filter(
        (prod) => prod.companyId === user?.companyId
      );

      const grouped = groupStockByProduct(filteredStock, filteredProducts);
      setGroupedProducts(grouped);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.companyId || !watch('customerName')) return;

      const snapshot = await getDocs(collection(db, 'addresses'));
      const list = snapshot.docs
        .map((doc) => ({ ...(doc.data() as Address), id: doc.id }))
        .filter(
          (addr) =>
            addr.name
              .toLowerCase()
              .includes(watch('customerName').toLowerCase()) &&
            addr.companyId === user.companyId
        );

      setAddresses(list);
    };

    fetchAddresses();
  }, [user?.companyId, watch('customerName')]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const updateFormItems = (items: SelectableProduct[]) => {
    setValue(
      'items',
      items.map(({ productItemId, productItemName, quantity, size }) => ({
        id: productItemId,
        name: productItemName,
        quantity,
        size,
      }))
    );
  };

  const addItem = (productId: string) => {
    const item = groupedProducts.find((i) => i.productItemId === productId);
    if (item) {
      const withQty: SelectableProduct = {
        ...item,
        quantity: 1,
      };
      const updated = [...selectedItems, withQty];
      setSelectedItems(updated);
      updateFormItems(updated);
    }
  };

  const removeItem = (itemId: string) => {
    const updated = selectedItems.filter((i) => i.productItemId !== itemId);
    setSelectedItems(updated);
    updateFormItems(updated);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const updated = selectedItems.map((item) =>
      item.productItemId === itemId ? { ...item, quantity } : item
    );
    setSelectedItems(updated);
    updateFormItems(updated);
  };

  const onSubmit = async (data: OrderForm) => {
    setIsSubmitting(true);
    try {
      if (!user?.email || !user?.companyId) {
        console.error('Usuário não autenticado ou sem empresa vinculada.');
         Alert.alert('Erro', 'Usuário não autenticado ou sem empresa vinculada.');
        setIsSubmitting(false);
        return;
      }

      const totalLiters = data.items.reduce(
        (sum, item) => sum + item.quantity * (parseInt(item.size || '0') || 0),
        0
      );

      const companyId = user.companyId;
      const counterRef = doc(db, 'counters', companyId); // cada empresa tem seu contador

      const orderNumber = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        const lastOrder = counterSnap.exists()
          ? counterSnap.data().lastOrderNumber
          : 0;
        const nextOrder = lastOrder + 1;

        transaction.set(counterRef, { lastOrderNumber: nextOrder });
        return String(nextOrder).padStart(4, '0'); // ex: '0001'
      });
       const orderPayload ={
        customerName: data.customerName,
        items: data.items.map(({ id, name, quantity, size, price }) => ({ // Adicionado size e price
          id,
          stockItemId: id, // Mantém a referência ao item de estoque original se necessário
          name,
          quantity,
          size,
          price,
        })),
        status: 'pendente',
        deliveryPersonId: null,
        address: data.address,
        date: Timestamp.fromDate(data.scheduledDate),
        paymentMethod: data.paymentMethod,
        totalLiters,
        adminEmail: user.email,
        companyId: user.companyId,
        orderNumber,
      };
      if (isEditMode && orderId) {
        // Modo Edição
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          ...orderPayload,
          updatedAt: Timestamp.now(), // Atualiza o timestamp de modificação
        });
        Alert.alert('Sucesso', 'Pedido atualizado com sucesso!');
      } else {
        // Modo Criação
        const companyId = user.companyId;
        const counterRef = doc(db, 'counters', companyId);

        const orderNumber = await runTransaction(db, async (transaction) => {
          const counterSnap = await transaction.get(counterRef);
          const lastOrder = counterSnap.exists()
            ? counterSnap.data().lastOrderNumber
            : 0;
          const nextOrder = lastOrder + 1;
          // Usar merge: true para não sobrescrever outros campos no contador, caso existam
          transaction.set(counterRef, { lastOrderNumber: nextOrder }, { merge: true });
          return String(nextOrder).padStart(4, '0');
        });

        await addDoc(collection(db, 'orders'), {
          ...orderPayload,
          orderNumber,
          status: 'pendente', // Status inicial para novos pedidos
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        Alert.alert('Sucesso', 'Pedido criado com sucesso!');
      }
      router.back();
    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} pedido:`, error);
      Alert.alert('Erro', `Não foi possível ${isEditMode ? 'atualizar' : 'salvar'} o pedido.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <Container>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Title style={{ color: theme.textPrimary }}>{pageTitle}</Title>

          <Card style={{ backgroundColor: theme.card }}>
            <CardTitle style={{ color: theme.textPrimary }}>
              Agendar Entrega
            </CardTitle>

            <Button
              type="icon"
              iconName="calendar-outline"
              onPress={() => setCalendarVisible(true)}
              title={scheduledDate.toLocaleString()}
            />

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
            <CardTitle style={{ color: theme.textPrimary }}>
              Informações do Cliente
            </CardTitle>
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
                  <Button
                    title="Novo Endereço"
                    type="primary"
                    onPress={() => setAddressModalVisible(true)}
                  />
                </>
              )}
            />
            {errors.address && <ErrorText>{errors.address.message}</ErrorText>}
          </Card>

          <Card style={{ backgroundColor: theme.card }}>
            <CardTitle style={{ color: theme.textPrimary }}>Produtos</CardTitle>
            <ProductSelector
              loading={loading}
              selectedItems={selectedItems.map((item) => ({
                id: item.productItemId,
                name: item.name,
                quantity: item.quantity,
                size: item.size,
                unity: item.unity,
                brand: item.brand,
                type: item.type,
                // price: item.price,
                companyId: user?.companyId || '',
              }))}
              onRemoveItem={removeItem}
              onUpdateQuantity={updateQuantity}
              onOpenAddModal={() => setModalVisible(true)}
              // isEditMode={isEditMode}
            />
          </Card>
        </ScrollView>

        <Button
          onPress={handleSubmit(onSubmit)}
          style={styles.submitButton}
          title={submitButtonText}
          disabled={isSubmitting || (loading && isEditMode)} // Desabilitar se estiver submetendo ou carregando dados para edição
          isLoading={isSubmitting}
        />

        <AddProductModal
          visible={modalVisible}
          products={groupedProducts}
          onAdd={(product) => {
            addItem(product.productItemId);
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
