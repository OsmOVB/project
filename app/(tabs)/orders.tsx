import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Container, Title, Button, ButtonText } from '../../components/styled';
import { Order, StatusOrder } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import CustomDateTimePicker from '../../components/Calendar1';

const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'João Silva',
    items: [
      { id: '1', stockItemId: '1', name: 'Pilsen 50L', quantity: 2 },
      { id: '2', stockItemId: '2', name: 'Cilindro de CO2', quantity: 1 },
    ],
    totalLiters: 100,
    status: 'pendente',
    date: new Date(),
    paymentMethod: 'crédito',
  },
];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const getStatusColor = (status: StatusOrder) => {
    switch (status) {
      case 'pendente':
        return '#FFA500';
      case 'em progresso':
        return '#007AFF';
      case 'finalizado':
        return '#4CD964';
      default:
        return '#666';
    }
  };

  return (
    <Container>
      <ScrollView>
        <Title>Pedidos</Title>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderContainer}>
            <View style={styles.orderHeader}>
              <Title style={styles.customerName}>{order.customerName}</Title>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) }
              ]}>
                <Text style={styles.statusText}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.itemsList}>
              {order.items.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text>{item.name}</Text>
                  <Text>x{item.quantity}</Text>
                </View>
              ))}
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.totalLiters}>{order.totalLiters}L Total</Text>
              <Text style={styles.paymentMethod}>
                {order.paymentMethod.toUpperCase()}
              </Text>
            </View>

            {user?.role === 'admin' && (
              <Button style={{ marginTop: 10 }}>
                <ButtonText>Atualizar Status</ButtonText>
              </Button>
            )}
          </View>
        ))}

        {user?.role === 'customer' && (
          <Button>
            <ButtonText>Novo Pedido</ButtonText>
          </Button>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  orderContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 18,
    marginBottom: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsList: {
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  totalLiters: {
    fontWeight: 'bold',
  },
  paymentMethod: {
    color: '#666',
  },
});