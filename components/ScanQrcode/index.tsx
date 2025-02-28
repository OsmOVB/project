import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal 
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface ScanItemsProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function ScanItems({ visible, onClose, onScan }: ScanItemsProps) {
  const cameraRef = useRef<Camera>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
      setLoading(false);
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
      onClose(); // Fecha o modal automaticamente após a leitura
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Carregando câmera...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <Text style={styles.message}>Precisamos de permissão para acessar a câmera.</Text>
          <TouchableOpacity onPress={() => Camera.requestCameraPermissionsAsync()} style={styles.button}>
            <Text style={styles.buttonText}>Conceder Permissão</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>📷 Leitura de QR Code</Text>
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.camera}
              ratio="1:1"
            />
          </View>
          <Text style={styles.instructions}>📷 Aponte a câmera para o QR Code</Text>
          {scanned && (
            <TouchableOpacity onPress={() => setScanned(false)} style={styles.scanAgainButton}>
              <Text style={styles.buttonText}>Escanear Novamente</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200EE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  instructions: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  scanAgainButton: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});
