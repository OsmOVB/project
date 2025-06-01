import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import Button from '@/src/components/Button';
import { qrCodeUtils } from '@/src/utils/qrCodeUtils';

interface ScanItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onScannedSuccess: (qrCode: string) => void;
  stockId: string;
  companyId: string;
}

export default function ScanItemsModal({
  visible,
  onClose,
  onScannedSuccess,
  stockId,
  companyId,
}: ScanItemsModalProps) {
  const cameraRef = useRef<Camera>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [manualQrCode, setManualQrCode] = useState('');

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermission(status === 'granted');
        setLoading(false);
        setScanned(false);
        setManualQrCode('');
      })();
    }
  }, [visible]);

  const handleScannedQr = async (qrCode: string) => {
    try {
      await qrCodeUtils.assignQrCodeToStock(qrCode, stockId, companyId);
      Alert.alert('QR Code atribuído', `QR ${qrCode} foi vinculado com sucesso.`);
      onScannedSuccess(qrCode);
      onClose();
    } catch (err: any) {
      Alert.alert('Erro ao vincular QR Code', err.message || 'Erro desconhecido.');
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      await handleScannedQr(data);
    }
  };

  const handleManualSubmit = async () => {
    // if (!manualQrCode.trim()) {
    //   Alert.alert('Erro', 'Digite um código válido.');
    //   return;
    // }
    await handleScannedQr(
      `QR0005`
      // manualQrCode.trim()
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {loading ? (
            <ActivityIndicator size="large" color="#6200EE" />
          ) : !permission ? (
            <Text style={styles.message}>
              É necessário conceder permissão à câmera.
            </Text>
          ) : (
            <>
              <Text style={styles.title}>📷 Leitura de QR Code</Text>

              <View style={styles.cameraContainer}>
                <CameraView
                  ref={cameraRef}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={styles.camera}
                  ratio="1:1"
                />
              </View>

              <Text style={styles.instructions}>Aponte para o QR Code</Text>

              {scanned && (
                <Button title="Escanear novamente" onPress={() => setScanned(false)} />
              )}

              <View style={{ width: '100%', marginTop: 20 }}>
                <Text style={{ marginBottom: 6 }}>Ou digite manualmente:</Text>
                <TextInput
                  placeholder="Digite o QR Code"
                  value={manualQrCode}
                  onChangeText={setManualQrCode}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
                <Button title="Vincular Manual" onPress={handleManualSubmit} />
              </View>

              <Button
                title="Fechar"
                type="outline"
                onPress={onClose}
                style={{ marginTop: 16 }}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  instructions: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    color: '#000',
    width: '100%',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
});
