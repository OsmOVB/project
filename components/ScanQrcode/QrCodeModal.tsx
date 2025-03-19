import React, { useRef, useState } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import handlePrint from '../Print';

interface QrCodeModalProps {
  visible: boolean;
  value: string;
  onClose: () => void;
}

export default function QrCodeModal({ visible, value, onClose }: QrCodeModalProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [qrSize, setQrSize] = useState(200); // tamanho padrão M

  const handlePrintQrCode = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await handlePrint(uri);
      }
    } catch (error) {
      console.error('Erro ao capturar ou imprimir:', error);
    }
  };

  return (
    <Modal visible={visible} transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
            <QRCode value={value} size={qrSize} />
          </ViewShot>
          <Text>ID: {value}</Text>

          <View style={styles.sizeSelector}>
            <TouchableOpacity onPress={() => setQrSize(150)} style={styles.sizeButton}>
              <Text>Tamanho P</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setQrSize(200)} style={styles.sizeButton}>
              <Text>Tamanho M</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setQrSize(300)} style={styles.sizeButton}>
              <Text>Tamanho G</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handlePrintQrCode} style={styles.printButton}>
            <Text style={styles.buttonText}>Imprimir QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  sizeSelector: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-around',
    width: '100%',
  },
  sizeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  printButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
  },
});
