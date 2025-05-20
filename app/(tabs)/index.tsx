//caminho do arquivo: app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import {
  Container,
  Title,
  Card,
  CardTitle,
  CardText,
  // Button,
  ButtonText,
} from '../../src/components/styled';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusOrder } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { db } from '@/src/firebase/config';
import { getDocs, collection } from 'firebase/firestore';
import ProductModal from '@/src/components/modal/ProductModal';
import ScanItemsModal from '@/src/components/modal/ScanItemsModal';
import Button from '@/src/components/Button';

export interface DeliveryItem {
  name: string;
  quantity: number;
  size?: string;
}
export interface Delivery {
  scheduledTimestamp: number;
  id: string;
  customerName: string;
  address: string;
  time: string;
  date: string;
  items: DeliveryItem[];
  status: StatusOrder;
}

export default function Home() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'entregas' | 'retiradas'>(
    'entregas'
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'orders'));

        const data = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const orderData = doc.data();
            const scheduledDate = new Date(
              orderData.scheduledDate?.seconds * 1000 || 0
            );
            const iso = scheduledDate.toISOString();

            //Enriquecer cada item com o tamanho (size)
            const enrichedItems = await Promise.all(
              (orderData.items || []).map(async (item: any) => {
                const productDoc = await getDocs(collection(db, 'product'));
                const matchedDoc = productDoc.docs.find(
                  (d) => d.id === item.id
                );
                const size = matchedDoc?.data().size || '';
                return { ...item, size };
              })
            );

            return {
              id: doc.id,
              customerName: orderData.customerName,
              address: orderData.address,
              date: iso.split('T')[0],
              time: iso.split('T')[1]?.slice(0, 5),
              items: enrichedItems,
              status: orderData.status || 'pendente',
            } as Delivery;
          })
        );

        setOrders(data);
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
        return '#34C759';
      default:
        return '#666';
    }
  };

  return (
    <Container>
      <View style={styles.header}>
        <View>
          <Title style={styles.welcomeText}>
            Bem-vindo de volta, {user?.name}
          </Title>
        </View>
      </View>
      <Title style={styles.sectionTitle}>Pedidos de hoje</Title>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Pressable
            style={[
              styles.statItem,
              activeTab === 'entregas' && styles.activeStatItem,
            ]}
            onPress={() => setActiveTab('entregas')}
          >
            <CardTitle
              style={[
                styles.statValue,
                activeTab === 'entregas' && styles.activeStatText,
              ]}
            >
              {orders.length}
            </CardTitle>
            <CardText
              style={[
                styles.statLabel,
                activeTab === 'entregas' && styles.activeStatText,
              ]}
            >
              Entregas de hoje
            </CardText>
          </Pressable>

          <View style={styles.statDivider} />

          <Pressable
            style={[
              styles.statItem,
              activeTab === 'retiradas' && styles.activeStatItem,
            ]}
            onPress={() => setActiveTab('retiradas')}
          >
            <CardTitle
              style={[
                styles.statValue,
                activeTab === 'retiradas' && styles.activeStatText,
              ]}
            >
              {
                orders.filter(
                  (order) =>
                    order.status === 'em progresso' &&
                    Date.now() - order.scheduledTimestamp >= 65 * 60 * 1000
                ).length
              }
            </CardTitle>
            <CardText
              style={[
                styles.statLabel,
                activeTab === 'retiradas' && styles.activeStatText,
              ]}
            >
              Retiradas de hoje
            </CardText>
          </Pressable>
        </View>
      </Card>

      <ScrollView style={styles.container}>
        {orders
          .filter((delivery) => {
            if (activeTab === 'entregas') {
              return true;
            }
            return (
              delivery.status === 'em progresso' &&
              Date.now() - delivery.scheduledTimestamp >= 65 * 60 * 1000
            );
          })
          .map((delivery) => (
            <Pressable
              key={delivery.id}
              style={styles.deliveryCard}
              onPress={() => {
                setSelectedDelivery(delivery);
                setProductModal(true);
                // setScanVisible(true);
              }}
            >
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryTime}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.timeText}>{delivery.time}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(delivery.status) },
                  ]}
                >
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
                    <Text style={styles.itemName}>
                      {item.name}
                      {item.size ? ` ${item.size}` : ''}
                    </Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
      </ScrollView>
      <ProductModal
        visible={productModal}
        onClose={() => setProductModal(false)}
        onRefresh={() => setOrders([])}
        items={selectedDelivery?.items || []}
        deliveryId={selectedDelivery?.id || ''}
      />
      <Button type="fab" onPress={() => router.push('/orders/create')} />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  activeStatItem: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
  },
  activeStatText: {
    color: '#fff',
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
