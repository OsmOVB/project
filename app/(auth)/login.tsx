import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../src/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import Button from '@/src/components/Button';
import { Container, Title, Input, ErrorText } from '../../src/components/styled';
import Checkbox from '@/src/components/CheckBox';

WebBrowser.maybeCompleteAuthSession();

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      const email = await AsyncStorage.getItem('@email');
      const password = await AsyncStorage.getItem('@password');

      if (email && password) {
        setValue('email', email);
        setValue('password', password);
        setRemember(true);
      }
    };

    loadCredentials();
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      if (!user) throw new Error('Usuário não encontrado.');

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      const userData = userDoc.exists()
        ? userDoc.data()
        : {
          uid: user.uid,
          name: user.displayName || 'Usuário',
          email: user.email,
          role: 'customer',
        };

      if (!userDoc.exists()) {
        await setDoc(userRef, userData);
      }

      await AsyncStorage.setItem('user', JSON.stringify(userData));

      if (remember) {
        await AsyncStorage.setItem('@email', data.email);
        await AsyncStorage.setItem('@password', data.password);
      } else {
        await AsyncStorage.removeItem('@email');
        await AsyncStorage.removeItem('@password');
      }

      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
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

        <Checkbox
          label="Lembrar usuário e senha"
          value={remember}
          onValueChange={setRemember}
        />

        <Button
          title="Entrar"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          fullWidth
        />

        <Button
          title="Recuperar Senha"
          type="ghost"
          onPress={() => router.push('/forgot-password')}
        />

        <Button
          title="Criar Conta"
          type="outline"
          onPress={() => router.push('/register')}
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
});
