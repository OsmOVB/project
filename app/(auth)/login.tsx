import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Container, Title, Input, Button, ButtonText, ErrorText } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../../firebase/config';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from '@firebase/app';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "usuarios"));
        querySnapshot.forEach((doc) => {
          console.log("📌 Usuário encontrado:", doc.data());
        });
      } catch (error) {
        console.error("❌ Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchData();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));

      if (!userDoc.exists()) {
        alert("Usuário não existe.");
        return;
      }
      const userData = userDoc.data();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login falhou:', error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
        <Title>Bem-vindo de volta</Title>

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

        {/* Botão de Login */}

        <Button onPress={handleSubmit(onSubmit)} style={styles.loginButton}>
          <ButtonText>Entrar</ButtonText>
        </Button>

        {/* Botão de Criar Conta */}
        <Button onPress={() => router.push('/register')} style={styles.registerButton}>
          <ButtonText style={styles.registerText}>Criar Conta</ButtonText>
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
