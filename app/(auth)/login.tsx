import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Container, Title, Input, Button, ButtonText, ErrorText } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login falhou:', error);
    }
  };

  return (
    <Container>
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581684652012-e7c4f8f9f4d1?q=80&w=400' }}
          style={styles.logo}
        />
        <Title>Bem-vindo de volta</Title>
        
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
        

        <Button onPress={handleSubmit(onSubmit)} style={styles.loginButton}>
          <ButtonText>Entrar</ButtonText>
        </Button>

        <Button 
          onPress={() => router.push('/register')}
          style={styles.registerButton}
        >
          <ButtonText style={styles.registerText}>Criar Conta</ButtonText>
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    maxWidth: 400,
  },
  loginButton: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: 'transparent',
    marginTop: 20,
    width: '100%',
    maxWidth: 400,
  },
  registerText: {
    color: '#007AFF',
  },
});