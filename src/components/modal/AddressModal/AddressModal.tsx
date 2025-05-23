// AddressModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/src/firebase/config';
import { useTheme } from '@/src/context/ThemeContext';
import Button from '../../Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddressAdded: () => void;
}

export default function AddressModal({
  visible,
  onClose,
  onAddressAdded,
}: Props) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    reference: '',
  });
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, 'addresses'), {
        ...form,
        companyId: 'empresa-123',
        createdAt: new Date().toISOString(),
      });
      onAddressAdded();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar endereço', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.card },
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Novo Endereço
          </Text>
          {[
            'nome',
            'rua',
            'número',
            'bairro',
            'cidade',
            'estado',
            'referência',
          ].map((field) => (
            <TextInput
              key={field}
              placeholder={field}
              value={(form as any)[field]}
              onChangeText={(text) => handleChange(field, text)}
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, color: theme.text },
              ]}
            />
          ))}
          <Button type="primary" title="Salvar" onPress={handleSubmit} />
          <Button type="outline" title="Cancelar" onPress={onClose} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
  },
});
