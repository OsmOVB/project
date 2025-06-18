import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Container, Title, Button, ButtonText } from '../../../src/components/styled';
import { Order, StatusOrder } from '../../../src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../src/firebase/config';
import { Delivery } from '../tabs';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      }
    };

    fetchOrders();
  }, []);

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
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum pedido encontrado.</Text>
        ) : (
          orders.map((order) => (
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
          ))
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
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
