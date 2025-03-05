import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Button from '@/components/Button';
import { Container, Title, Input, ErrorText } from '../../components/styled';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID_IOS, GOOGLE_CLIENT_ID_WEB  } from "@env";
WebBrowser.maybeCompleteAuthSession();


const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    webClientId: GOOGLE_CLIENT_ID_WEB,
    redirectUri: "exp://192.168.1.7:8081", // 🔹 Substitua conforme seu ambiente
  });
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { accessToken } = response.authentication!;
      authenticateWithGoogle(accessToken);
    }
  }, [response]);

  // 📌 Autenticação com Firebase usando Google
  const authenticateWithGoogle = async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      console.log('🔑 Usuário autenticado com Google:', user);
      if (!user) throw new Error('Usuário não encontrado.');

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const newUser = {
          uid: user.uid,
          name: user.displayName || 'Usuário Google',
          email: user.email,
          role: 'customer',
        };
        await setDoc(userRef, newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      } else {
        await AsyncStorage.setItem('user', JSON.stringify(userDoc.data()));
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Erro ao autenticar com Google:', error);
      Alert.alert('Erro', 'Falha ao autenticar com Google.');
    }
  };

  // 📌 Login com e-mail e senha
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      const userData = userDoc.data();
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Erro no login:', error);
      Alert.alert('Erro', 'Falha ao fazer login.');
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

        <Button title="Entrar teste" onPress={()=>router.navigate("/(auth)/register")} />
        <Button title="Entrar" onPress={handleSubmit(onSubmit)} />
        <Button title="Entrar com Google" onPress={() => promptAsync()} disabled={!request} />

        <Button title="Criar Conta" type="outline" onPress={() => router.push('/register')} />
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

