import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Calendar from '../../../components/Calendar';
import { Container, Title, Input, Button, ButtonText, ErrorText, Card, CardTitle, CardText } from '../../../components/styled';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useThemeContext } from '../../../context/ThemeContext';
import ScanItems from '@/components/ScanQrcode';

const orderSchema = z.object({
  customerName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  address: z.string().min(5, 'O endereço deve ter pelo menos 5 caracteres'),
  scheduledDate: z.date(),
  paymentMethod: z.enum(['crédito', 'débito', 'dinheiro', 'pix']),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().min(1),
  })),
});

type OrderForm = z.infer<typeof orderSchema>;

const mockItems = [
  { id: '1', name: 'Pilsen 50L', type: 'barril', price: 350 },
  { id: '2', name: 'Cilindro de CO2', type: 'co2', price: 80 },
  { id: '3', name: 'Torneira de Chopp', type: 'torneira', price: 120 },
];

export default function CreateOrder() {
  const [selectedItems, setSelectedItems] = useState<{ id: string; quantity: number }[]>([]);
  const { darkMode } = useThemeContext();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanningItemId, setScanningItemId] = useState<string | null>(null); // Para saber qual item está sendo escaneado


  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      paymentMethod: 'pix',
      scheduledDate: new Date(),
      items: [],
    },
  });

  const scheduledDate = watch('scheduledDate');

  const onSubmit = async (data: OrderForm) => {
    try {
      console.log('Order data:', data);
      router.back();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const addItem = (itemId: string) => {
    const item = mockItems.find(i => i.id === itemId);
    if (item) {
      const newItem = { ...item, quantity: 1, qrCode: '' };
      const updatedItems = [...selectedItems, newItem];
      setSelectedItems(updatedItems);
      setValue('items', updatedItems);
    }
  };

  const removeItem = (itemId: string) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const updatedItems = selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
  };

  const setQRCodeForItem = (qrCode: string) => {
    if (!scanningItemId) return;
    const updatedItems = selectedItems.map(item =>
      item.id === scanningItemId ? { ...item, qrCode } : item
    );
    setSelectedItems(updatedItems);
    setValue('items', updatedItems);
    setScannerVisible(false);
  };

  const formatDateToBrazilian = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
          {errors.customerName && <ErrorText>{errors.customerName.message}</ErrorText>}


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

        <Card>
          <CardTitle>Agendar Entrega</CardTitle>
          <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>{formatDateToBrazilian(scheduledDate)}</Text>
          </TouchableOpacity>
          <Modal visible={calendarVisible} transparent={true}>
            <Calendar
              initialDate={scheduledDate}
              onDateChange={(date) => {
                setValue('scheduledDate', date);
                setCalendarVisible(false);
              }}
              mode='datetime'
              visible={calendarVisible}
              onClose={() => setCalendarVisible(false)}
              theme={darkMode ? '#1c1c1e' : '#f5f5f5'}
            />
          </Modal>
        </Card>

        <Card>
          <CardTitle>Itens do Pedido</CardTitle>
          {mockItems.map(item => {
            const selectedItem = selectedItems.find(si => si.id === item.id);
            return (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <CardText>{item.name}</CardText>
                  <CardText style={styles.price}>R${item.price}</CardText>
                </View>
                {selectedItem ? (
                  <View style={styles.quantityContainer}>
                    <Button
                      onPress={() => updateQuantity(item.id, selectedItem.quantity - 1)}
                      style={styles.quantityButton}
                    >
                      <ButtonText>-</ButtonText>
                    </Button>
                    <CardText style={styles.quantity}>{selectedItem.quantity}</CardText>

                    <TouchableOpacity
                      onPress={() => {
                        setScanningItemId(item.id);
                        setScannerVisible(true);
                      }}
                      style={styles.qrButton}
                    >
                      <Text style={styles.qrButtonText}>Escanear QR Code</Text>
                    </TouchableOpacity>
                    <Button
                      onPress={() => updateQuantity(item.id, selectedItem.quantity + 1)}
                      style={styles.quantityButton}
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
                  <Button
                    onPress={() => addItem(item.id)}
                    style={styles.addButton}
                  >
                    <ButtonText>Adicionar</ButtonText>
                  </Button>
                )}
              </View>
            );
          })}
        </Card>

        <Card>
          <CardTitle>Método de Pagamento</CardTitle>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={[styles.picker, { backgroundColor: darkMode ? '#1c1c1e' : '#f5f5f5' }]}
              >
                <Picker.Item label="PIX" value="pix" />
                <Picker.Item label="Cartão de Crédito" value="crédito" />
                <Picker.Item label="Cartão de Débito" value="débito" />
                <Picker.Item label="Dinheiro" value="dinheiro" />
              </Picker>
            )}
          />
        </Card>
        <ScanItems visible={scannerVisible} onClose={() => setScannerVisible(false)} onScan={setQRCodeForItem} />

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
  removeButton: {
    backgroundColor: '#FF3B30',
    marginLeft: 10,
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
  dateButtonText: {
    color: '#1c1c1e',
  },
  submitButton: {
    marginVertical: 20,
  },
});