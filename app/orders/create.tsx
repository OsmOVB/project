import React, { useState } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';

export default function CreateOrder() {
  const [date, setDate] = useState<Date>(new Date());

  const handleDateTimeChange = (selectedDate: Date) => {
    setDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecione a data e hora do pedido:</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 16,
  },
});
