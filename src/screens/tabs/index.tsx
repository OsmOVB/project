import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderItem, Product, StatusOrder, Stock } from '@/src/types';
import { useAuth } from '@/src/hooks/useAuth';
import { db } from '@/src/firebase/config';
import { getDocs, collection, query, where } from 'firebase/firestore';
import ProductModal from '@/src/components/modal/ProductModal';
import Button from '@/src/components/Button';
import { useTheme } from '@/src/context/ThemeContext';
import { ThemeType } from '@/src/theme';
import { RefreshControl } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { dateUtils } from '@/src/utils/date';

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
  orderNumber: string;
}

export default function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = themedStyles(theme);

  const [orders, setOrders] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [productModal, setProductModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'entregas' | 'retiradas'>(
    'entregas'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      if (!user?.companyId) return;

      setLoading(true);
      const companyId = user.companyId;

      // Busca os pedidos e os produtos da empresa
      const [ordersSnap, productSnap] = await Promise.all([
        getDocs(
          query(collection(db, 'orders'), where('companyId', '==', companyId))
        ),
        getDocs(
          query(collection(db, 'product'), where('companyId', '==', companyId))
        ),
      ]);

      // Cria o Map de produtos para join
      const productMap = new Map<string, Product>(
        productSnap.docs.map((doc) => [
          doc.id,
          { id: doc.id, ...doc.data() } as Product,
        ])
      );

      // Enriquecer os pedidos
      const enrichedOrders = await Promise.all(
        ordersSnap.docs.map(async (doc) => {
          const orderData = doc.data();
          const scheduledDate = dateUtils.parseFirestoreDate(orderData.date);
          if (!scheduledDate) return null;

          const date = scheduledDate.toLocaleDateString('pt-BR');
          const time = scheduledDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          const enrichedItems = ((orderData.items as OrderItem[]) || []).map(
            (item) => {
              const product = productMap.get(item.id);
              return {
                name: product?.name || item.name || 'Produto desconhecido',
                quantity: item.quantity,
                size: product?.size || '',
                orderNumber: orderData.orderNumber || '', // ✅ aqui
              };
            }
          );

          const enrichedDelivery: Delivery = {
            scheduledTimestamp: scheduledDate.getTime(),
            id: doc.id,
            customerName: orderData.customerName || '',
            address: orderData.address || '',
            time,
            date,
            items: enrichedItems,
            status: orderData.status as StatusOrder,
            orderNumber: orderData.orderNumber || '???', // ✅ certo: pega do banco

          };

          return enrichedDelivery;
        })
      );

      setOrders(enrichedOrders.filter((o): o is Delivery => !!o));
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => {
    console.log('selectedDelivery', selectedDelivery);
  }, [selectedDelivery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            Bem-vindo de volta, {user?.name}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pedidos de hoje</Text>

      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Pressable
            style={[
              styles.statItem,
              activeTab === 'entregas' && styles.activeStatItem,
            ]}
            onPress={() => setActiveTab('entregas')}
          >
            <Text
              style={[
                styles.statValue,
                activeTab === 'entregas' && styles.activeStatText,
              ]}
            >
              {orders.length}
            </Text>
            <Text
              style={[
                styles.statLabel,
                activeTab === 'entregas' && styles.activeStatText,
              ]}
            >
              Entregas de hoje
            </Text>
          </Pressable>

          <View style={styles.statDivider} />

          <Pressable
            style={[
              styles.statItem,
              activeTab === 'retiradas' && styles.activeStatItem,
            ]}
            onPress={() => setActiveTab('retiradas')}
          >
            <Text
              style={[
                styles.statValue,
                activeTab === 'retiradas' && styles.activeStatText,
              ]}
            >
              {
                orders.filter(
                  (o) =>
                    o.status === 'em progresso' &&
                    Date.now() - o.scheduledTimestamp >= 65 * 60 * 1000
                ).length
              }
            </Text>
            <Text
              style={[
                styles.statLabel,
                activeTab === 'retiradas' && styles.activeStatText,
              ]}
            >
              Retiradas de hoje
            </Text>
          </Pressable>
        </View>
      </View>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: theme.textPrimary, marginBottom: 8 }}>
            Carregando pedidos...
          </Text>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {orders
            .filter(
              (d) =>
                activeTab === 'entregas' ||
                (d.status === 'em progresso' &&
                  Date.now() - d.scheduledTimestamp >= 65 * 60 * 1000)
            )
            .map((delivery) => (
              <Pressable
                key={delivery.id}
                style={styles.deliveryCard}
                onPress={() => {
                  setSelectedDelivery(delivery);
                  setProductModal(true);
                }}
              >
                <View style={styles.deliveryHeader}>
                  <View style={styles.deliveryTime}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.timeText}>{delivery.date}</Text>
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
                <Text style={styles.customerName}>
                  #{delivery.orderNumber} - {delivery.customerName}
                </Text>

                <Text style={styles.address}>{delivery.address}</Text>
                <View style={styles.itemsList}>
                  {delivery.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {item.name} {item.size}
                      </Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))}
        </ScrollView>
      )}
      <ProductModal
        visible={productModal}
        onClose={() => setProductModal(false)}
        onRefresh={() => setOrders([])}
        items={selectedDelivery?.items || []}
        deliveryId={selectedDelivery?.id || ''}
        orderNumber={selectedDelivery?.orderNumber || ''}
      />

      {user?.role === 'admin' && (
        <Button type="fab" onPress={() => {
          console.log('Create Order');
          // router.push('/orders/create');
        }}
        />
      )}
    </View>
  );
}

const themedStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      padding: 16,
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
      color: theme.textSecondary,
    },
    sectionTitle: {
      fontSize: 16,
      color: theme.textPrimary,
      marginBottom: 8,
    },
    statsCard: {
      marginBottom: 24,
      padding: 20,
      backgroundColor: theme.card,
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
      backgroundColor: theme.border,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    activeStatItem: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 8,
    },
    activeStatText: {
      color: theme.buttonText,
    },
    deliveryCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
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
      color: theme.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      color: theme.buttonText,
      fontSize: 12,
      fontWeight: 'bold',
    },
    customerName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    address: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    itemsList: {
      backgroundColor: theme.inputBg,
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
      color: theme.textPrimary,
    },
    itemQuantity: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primary,
    },
  });
