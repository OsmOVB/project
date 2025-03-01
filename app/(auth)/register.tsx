import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Container, Title, Input, Button, ButtonText, ErrorText } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'delivery', 'customer'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register } = useAuth();
  const { darkMode } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const userData = {
        uid,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      await setDoc(doc(db, 'users', uid), userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      router.replace('/login');
    } catch (error) {
      console.error('Falha no registro:', error);
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
        <Title>Create Account</Title>

        {/* Nome */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Title>Criar Conta</Title>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Nome Completo"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
          {errors.name && <ErrorText>{errors.name.message}</ErrorText>}

          {/* Email */}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
          {errors.email && <ErrorText>{errors.email.message}</ErrorText>}

          {/* Senha */}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}

          {/* Confirmar Senha */}

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Confirm Password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
          {errors.confirmPassword && <ErrorText>{errors.confirmPassword.message}</ErrorText>}

          {/* Seleção de Função */}
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.input}>
            <Text style={styles.selectedRole}>{watch('role')}</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                {['Customer', 'delivery', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => {
                      setValue('role', role as RegisterForm['role']);
                      setModalVisible(false);
                    }}
                    style={styles.roleOption}
                  >
                    <Text style={styles.roleText}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
                <Button onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <ButtonText>Close</ButtonText>
                </Button>
                <View style={{
                  backgroundColor: darkMode ? '#1c1c1e' : '#f5f5f5',
                  borderRadius: 8,
                  marginBottom: 15,
                }}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Cliente" value="customer" />
                    <Picker.Item label="Entregador" value="delivery" />
                    <Picker.Item label="Admin" value="admin" />
                  </Picker>
                </View>
              </View>
          </Modal>

          {errors.role && <ErrorText>{errors.role.message}</ErrorText>}

          {/* Botão de Registro */}
          <Button onPress={handleSubmit(onSubmit)} style={styles.registerButton}>
            <ButtonText>Register</ButtonText>

            <Button onPress={handleSubmit(onSubmit)}>
              <ButtonText>Registrar</ButtonText>
            </Button>

            {/* Botão de Voltar */}
            <Button onPress={() => router.back()} style={styles.backButton}>
              <ButtonText style={styles.backText}>Back to Login</ButtonText>
              <Button
                onPress={() => router.back()}
                style={{ backgroundColor: 'transparent', marginTop: 20 }}
              >
                <ButtonText style={{ color: '#007AFF' }}>Voltar para Login</ButtonText>
              </Button>
            </View>
          </Container>
          );
}

          const styles = StyleSheet.create({
            formContainer: {
            flex: 1,
          justifyContent: 'center',
          width: '100%',
          paddingHorizontal: 20,
  },
          input: {
            height: 50,
          width: '100%',
          maxWidth: 400,
          marginBottom: 15,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          backgroundColor: '#fff',
          paddingHorizontal: 10,
          justifyContent: 'center',
  },
          selectedRole: {
            color: '#ccc',
          fontSize: 16,
  },
          registerButton: {
            width: '100%',
          maxWidth: 400,
          marginTop: 20,
  },
          backButton: {
            backgroundColor: 'transparent',
          marginTop: 20,
          width: '100%',
          maxWidth: 400,
  },
          backText: {
            color: '#007AFF',
  },
          modalContainer: {
            flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
          modalContent: {
            backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
          width: '80%',
          alignItems: 'center',
  },
          roleOption: {
            padding: 10,
          width: '100%',
          alignItems: 'center',
  },
          roleText: {
            fontSize: 18,
          color: '#000',
  },
          closeButton: {
            marginTop: 10,
          width: '100%',
  },
});