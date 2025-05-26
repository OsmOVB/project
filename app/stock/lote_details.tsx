import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Text,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/src/firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';
import { Card, CardTitle } from '@/src/components/styled';
import {
  generateNextQrCode,
  generateNextQrCodeByAdmin,
} from '@/src/utils/qrCodeUtils';
import Button from '@/src/components/Button';
import { QRCode } from 'react-native-qrcode-svg';

interface StockItem {
  id: string;
  loteId: string;
  dataLote: string;
  tipoItemName: string;
  marca: string;
  capacidade: string;
}

export default function LoteDetails() {
  const { loteId, dataLote } = useLocalSearchParams();
  const [barris, setBarris] = useState<StockItem[]>([]);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetchBarris();
  }, []);

  async function fetchBarris() {
    const snapshot = await getDocs(collection(db, 'stock'));
    const docs: StockItem[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as StockItem)
    );
    const filtrados = docs.filter(
      (item) => item.loteId == loteId && item.dataLote == dataLote
    );
    setBarris(filtrados);
  }

  function handleDeleteItem(itemId: string) {
    Alert.alert('Confirmar', 'Deseja apagar este item?', [
      { text: 'Cancelar' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'stock', itemId));
          fetchBarris();
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        📦 Lote #{loteId}
      </Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        🗓️ Data: {dataLote}
      </Text>

      {barris.map((item, i) => (
        <Card key={i} style={{ backgroundColor: theme.card }}>
          <CardTitle>{item.tipoItemName}</CardTitle>
          <Text style={[styles.label, { color: theme.text }]}>
            ID do Item: <Text style={styles.value}>{item.id}</Text>
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>
            Marca: <Text style={styles.value}>{item.marca}</Text>
          </Text>
          <Text style={[styles.label, { color: theme.text }]}>
            Capacidade: <Text style={styles.value}>{item.capacidade}</Text>
          </Text>

          <View style={styles.qrActions}>
            {/* <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: theme.inputBg }]}
              onPress={async () => {
                //deve gerar o qr code apartir do id do item mas deve ser um sequencial
                //exemplo: 1, 2, 3, 4, 5
                //deve ser gerado um qr code para cada item do lote
                console.log(await generateNextQrCode());
             
                // console.log(await generateNextQrCodeByAdmin(item.adminEmail));

                // const adminEmail = user.email; // ou de onde você pega o e-mail do admin
                // const qrCode = await generateNextQrCodeByAdmin(adminEmail);

                // await addDoc(collection(db, 'stock'), {
                //   ...dadosDoProduto,
                //   adminEmail,
                //   qrCode,
                // });
              }}
            >
              <Ionicons name="qr-code-outline" size={20} color={theme.text} />
              <Text style={[styles.qrText, { color: theme.text }]}>
                Gerar QR Code
              </Text>
            </TouchableOpacity> */}
            <Button
              type="icon" 
              title='Gerar Novo'
              iconName="qr-code-outline"
              iconColor={theme.text}
              onPress={async () => {
                const qrCode = await generateNextQrCode();
                Alert.alert('QR Code Gerado', qrCode);
              }}
            />

            {/* <TouchableOpacity
              style={[styles.qrButton, { backgroundColor: theme.inputBg }]}
              onPress={() => {}}
            >
              <Ionicons name="qr-code-outline" size={20} color={theme.text} />
              <Text style={[styles.qrText, { color: theme.text }]}>
                Ler QR Existente
              </Text>
            </TouchableOpacity> */}
            <Button
              type="icon"
              title='Adicionar Existente'
              iconName="qr-code-outline"
              iconColor={theme.text}
              onPress={async () => {
                const qrCode = await generateNextQrCode();
                Alert.alert('QR Code Gerado', qrCode);
              }}
              
            />
          </View>

          <View style={styles.actions}>
            <Button
              type="icon"
              iconName="create-outline"
              iconColor={theme.primary}
              onPress={() =>
                router.push({
                  pathname: '/stock/edit-type/[id]',
                  params: { id: item.id },
                })
              }
              title="Editar"
            />
            <Button
              type="icon"
              iconName="trash-outline"
              iconColor={theme.red}
              onPress={() => handleDeleteItem(item.id)}
              title="Apagar"
            />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  value: {
    fontWeight: 'normal',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  edit: {
    fontWeight: '500',
  },
  delete: {
    fontWeight: '500',
  },
  qrActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 6,
    flex: 1,
  },
  qrText: {
    fontWeight: '500',
  },
});
