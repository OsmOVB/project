import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabRoutes from './TabRoutes';
import CreateOrder from '@/src/screens/orders/create';
import Batches from '@/src/screens/stock/lotes';
import LoteDetails from '@/src/screens/stock/LoteDetails';
import ManageDeliveries from '@/src/screens/admin/ManageDeliveries';
import { AppStackParamList } from '../types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={TabRoutes} />
      <Stack.Screen name="OrderCreate" component={CreateOrder} />
      <Stack.Screen name="Batches" component={Batches} />
      <Stack.Screen name="LoteDetails" component={LoteDetails} />
      <Stack.Screen name="ManageDeliveries" component={ManageDeliveries} />
    </Stack.Navigator>
  );
}
