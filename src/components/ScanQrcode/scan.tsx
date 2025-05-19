
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function ScanItems() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back'); 
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
      alert(`Código QR escaneado: ${data}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Carregando câmera...</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos de permissão para acessar a câmera.</Text>
        <TouchableOpacity onPress={() => Camera.requestCameraPermissionsAsync()} style={styles.button}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      <TouchableOpacity onPress={() => router.back()} style={styles.button}>
        <Ionicons name="arrow-back" size={18} color="#fff" />
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
