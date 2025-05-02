import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ visible, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.confirm} onPress={onConfirm}>
              <Text style={styles.textButton}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={onCancel}>
              <Text style={styles.textButton}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  confirm: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6 },
  cancel: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 6 },
  textButton: { color: '#fff', fontWeight: 'bold' },
});
