import React from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Container, Title, Input, Button, ButtonText, ErrorText } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { Picker } from '@react-native-picker/picker';
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
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register } = useAuth();
  const { darkMode } = useThemeContext();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
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
          name="role"
          render={({ field: { onChange, value } }) => (
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
          )}
        />
        {errors.role && <ErrorText>{errors.role.message}</ErrorText>}
        
        <Button onPress={handleSubmit(onSubmit)}>
          <ButtonText>Registrar</ButtonText>
        </Button>

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