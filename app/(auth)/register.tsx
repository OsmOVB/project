import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../src/firebase/config';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/src/components/Button';
import {
  Container,
  Title,
  Input,
  ErrorText,
} from '../../src/components/styled';

// 📌 Schema de validação do formulário
const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(6, 'Senha deve ter pelo menos 6 caracteres'),
    role: z.enum(['admin', 'delivery', 'customer'] as const),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'admin' },
  });

  useEffect(() => {
    // 📌 Verifica se a coleção "users" existe e cria se necessário
    const checkOrCreateUsersCollection = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        if (querySnapshot.empty) {
          await setDoc(doc(db, 'users', 'init'), {
            message: 'Tabela criada automaticamente',
          });
          console.log('✅ Coleção "users" criada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar/criar a coleção "users":', error);
      }
    };

    checkOrCreateUsersCollection();
  }, []);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const uid = userCredential.user.uid;

      const userData = {
        uid,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      await setDoc(doc(db, 'users', uid), userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      if (data.role === 'admin') {
        router.replace('/screens/RegisterCompany');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      Alert.alert('Erro', 'Falha ao registrar usuário.');
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
        <Title>Criar Conta</Title>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Nome Completo"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.name && <ErrorText>{errors.name.message}</ErrorText>}

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
            />
          )}
        />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.password && <ErrorText>{errors.password.message}</ErrorText>}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Confirmar Senha"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.confirmPassword && (
          <ErrorText>{errors.confirmPassword.message}</ErrorText>
        )}
        {errors.role && <ErrorText>{errors.role.message}</ErrorText>}
        <Button title="Registrar" onPress={handleSubmit(onSubmit)} />
        <Button
          title="Voltar para Login"
          type="outline"
          onPress={() => router.back()}
        />
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
});
