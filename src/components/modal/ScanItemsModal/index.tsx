import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface ScanItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}

export default function ScanItemsModal({
  visible,
  onClose,
  onScanned,
}: ScanItemsModalProps) {
  const cameraRef = useRef<Camera>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [scanVisible, setScanVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermission(status === 'granted');
        setLoading(false);
        setScanned(false);
      })();
    }
  }, [visible]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (!scanned) {
      setScanned(true);
      onScanned(data);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200EE" />
              <Text style={styles.loadingText}>Carregando câmera...</Text>
            </View>
          ) : !permission ? (
            <View style={styles.permissionContainer}>
              <Text style={styles.message}>
                Precisamos de permissão para acessar a câmera.
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  const { status } =
                    await Camera.requestCameraPermissionsAsync();
                  setPermission(status === 'granted');
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Conceder Permissão</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.instructions}>
                📷 Aponte a câmera para o QR Code
              </Text>

              {scanned && (
                <TouchableOpacity
                  onPress={() => setScanned(false)}
                  style={styles.scanAgainButton}
                >
                  <Text style={styles.buttonText}>Escanear Novamente</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onClose} style={styles.button}>
                <Ionicons name="arrow-back" size={18} color="#fff" />
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScanItemsModal
        visible={scanVisible}
        onClose={() => setScanVisible(false)}
        onScanned={(data) => {
          console.log('QR lido:', data);
          setScanVisible(false);
          // Aqui você pode preencher a quantidade ou marcar o item como conferido
        }}
      />
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200EE',
  },
  permissionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
});
