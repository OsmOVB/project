import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Container, Title, Input, Button, ButtonText, ErrorText } from '../../components/styled';
import { useAuth } from '../../hooks/useAuth';
import { Picker } from '@react-native-picker/picker';
import { useThemeContext } from '../../context/ThemeContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'delivery', 'customer'] as const),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
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
      await register(data);
      router.replace('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Container>
      <View style={styles.formContainer}>
        <Title>Create Account</Title>

        {/* Nome */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Full Name"
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
              placeholder="Password"
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
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.input, styles.pickerContainer]}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Delivery" value="delivery" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
          )}
        />
        {errors.role && <ErrorText>{errors.role.message}</ErrorText>}

        {/* Botão de Registro */}
        <Button onPress={handleSubmit(onSubmit)} style={styles.registerButton}>
          <ButtonText>Register</ButtonText>
        </Button>

        {/* Botão de Voltar */}
        <Button onPress={() => router.back()} style={styles.backButton}>
          <ButtonText style={styles.backText}>Back to Login</ButtonText>
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
    height: 50, // Mantém todos os inputs com o mesmo tamanho
    width: '100%',
    maxWidth: 400,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  pickerContainer: {
    height: 50, // Garante que o Picker tenha o mesmo tamanho dos outros inputs
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
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
});
