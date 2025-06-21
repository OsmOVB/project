import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import Button from '@/src/components/Button';
import { Container, Title, Input, ErrorText } from '../../components/styled';
import Checkbox from '@/src/components/CheckBox';
import { Ionicons } from '@expo/vector-icons';
import { navigate } from '@/src/navigation/NavigationService';
import { useAuth, User } from '@/src/context/AuthContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();

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

      const userData: User = userDoc.exists()
        ? {
            uid: user.uid,
            name: userDoc.data().name,
            email: userDoc.data().email,
            role: userDoc.data().role,
            companyId: userDoc.data().companyId,
          }
        : {
            uid: user.uid,
            name: user.displayName || 'Usuário',
            email: user.email!,
            role: 'customer',
          };

      if (!userDoc.exists()) {
        await setDoc(userRef, userData);
      }

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      if (remember) {
        await AsyncStorage.setItem('@email', data.email);
        await AsyncStorage.setItem('@password', data.password);
      } else {
        await AsyncStorage.removeItem('@email');
        await AsyncStorage.removeItem('@password');
      }
      if (userData.role === 'admin' && !userData.companyId) {
        navigate.replace('ManageDeliveries');
        return;
      }
      navigate.replace('HomeMain');
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
            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="Senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
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
          title="Criar Conta"
          type="outline"
          onPress={() => navigate.push('Register')}
        />
        <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
          <Button
            title="Esqueceu a senha?"
            type="text"
            onPress={() => navigate.push('ForgotPassword')}
          />
        </View>
      </View>

      <View style={styles.termsContainer}>
        <Button
          title="Termos de Uso"
          type="text"
          onPress={() => WebBrowser.openBrowserAsync('https://google.com')}
        />
        <Text style={styles.separator}> e </Text>
        <Button
          title="Política de Privacidade"
          type="text"
          onPress={() => WebBrowser.openBrowserAsync('https://google.com')}
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
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    paddingVertical: 10,
  },
  separator: {
    color: '#888',
    fontSize: 14,
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  passwordIcon: {
    marginLeft: 10,
  },
});
