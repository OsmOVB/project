//caminho do arquivo: app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable, Image } from 'react-native';
import { Container, Title, Card, CardTitle, CardText, Button, ButtonText } from '../../src/components/styled';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusOrder } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { db } from '@/src/firebase/config';
import { getDocs, collection } from 'firebase/firestore';


export interface DeliveryItem {
  name: string;
  quantity: number;
}

export interface Delivery {
  id: string;
  customerName: string;
  address: string;
  time: string;
  date: string;
  items: DeliveryItem[];
  status: StatusOrder;
}
// const mockDeliveries = [
//   {
//     id: '1',
//     customerName: 'João Silva',
//     address: 'Rua Principal, 123',
//     time: '09:00',
//     date: '2024-02-20',
//     items: [
//       { name: 'Pilsen 50L', quantity: 2 },
//       { name: 'Cilindro de CO2', quantity: 1 }
//     ],
//     status: 'pendente' as StatusOrder
//   },
//   {
//     id: '2',
//     customerName: 'Maria Souza',
//     address: 'Avenida das Acácias, 456',
//     time: '14:30',
//     date: '2024-02-20',
//     items: [
//       { name: 'Pilsen 50L', quantity: 1 },
//       { name: 'Torneira de Chopp', quantity: 1 }
//     ],
//     status: 'em progresso' as StatusOrder
//   }
// ];

export default function Home() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState<Delivery[]>([]);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));

      const data = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const scheduledDate = new Date(data.scheduledDate?.seconds * 1000 || 0);
          const iso = scheduledDate.toISOString();
          return {
            id: doc.id,
            customerName: data.customerName,
            address: data.address,
            date: iso.split('T')[0],               
            time: iso.split('T')[1]?.slice(0, 5),
            items: data.items || [],
            status: data.status || 'pendente',
          } as Delivery;
        })

      console.log('Pedidos:', data);
     setOrders(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  fetchOrders();
}, []);

  const getStatusColor = (status: StatusOrder) => {
    switch (status) {
      case 'pendente': return '#FFA500';
      case 'em progresso': return '#007AFF';
      case 'finalizado': return '#34C759';
      default: return '#666';
    }
  };

  return (
    <Container>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Title style={styles.welcomeText}>Bem-vindo de volta, {user?.name}</Title>           
          </View>
        </View>

        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CardTitle style={styles.statValue}>12</CardTitle>
              <CardText style={styles.statLabel}>Entregas de hoje</CardText>
            </View>
            {/* <View style={styles.statDivider} /> */}
            <View style={styles.statItem}>
              {/* <CardTitle style={styles.statValue}>85%</CardTitle> */}
              {/* <CardText style={styles.statLabel}>Taxa de pontualidade</CardText> */}
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Agenda de hoje</Title>
            <Button 
              onPress={() => router.push('/orders/create')}
              style={styles.addButton}
            >
              <ButtonText>Novo Pedido</ButtonText>
            </Button>
          </View>

          {orders.map((delivery) => (
            <Pressable 
              key={delivery.id}
              style={styles.deliveryCard}
              onPress={() => router.push(`/orders/${delivery.id}` as any)}
            >
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryTime}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.timeText}>{delivery.time}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                  <Text style={styles.statusText}>
                    {delivery.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.customerName}>{delivery.customerName}</Text>
              <Text style={styles.address}>{delivery.address}</Text>

              <View style={styles.itemsList}>
                {delivery.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 4,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    marginBottom: 24,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 0,
  },
  addButton: {
    height: 40,
    paddingHorizontal: 16,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  itemsList: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#1c1c1e',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});