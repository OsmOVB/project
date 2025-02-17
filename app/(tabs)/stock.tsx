import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Container, Title, Button, ButtonText } from '../../components/styled';
import { StockItem } from '../../types';

const mockStockItems: StockItem[] = [
  { id: '1', type: 'barril', name: 'Pilsen 50L', quantity: 10 },
  { id: '2', type: 'co2', name: 'Cilindro de CO2', quantity: 15 },
  { id: '3', type: 'torneira', name: 'Torneira de Chopp', quantity: 8 },
  { id: '4', type: 'copo', name: 'Copo de Pint', quantity: 100 },
];

export default function Stock() {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems);

  return (
    <Container>
      <ScrollView>
        <Title>Gestão de Estoque</Title>
        {stockItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <View>
              <Title style={styles.itemName}>{item.name}</Title>
              <Text style={styles.itemType}>{item.type}</Text>
            </View>
            <Text style={styles.quantity}>{item.quantity} unidades</Text>
          </View>
        ))}
        <Button>
          <ButtonText>Adicionar Novo Produto</ButtonText>
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    marginBottom: 5,
  },
  itemType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});