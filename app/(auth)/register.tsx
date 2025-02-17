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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
      await register(data);
      router.replace('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Container>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Title>Create Account</Title>
        
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Full Name"
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
              placeholder="Password"
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
                <Picker.Item label="Customer" value="customer" />
                <Picker.Item label="Delivery" value="delivery" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
          )}
        />
        {errors.role && <ErrorText>{errors.role.message}</ErrorText>}
        

        <Button onPress={handleSubmit(onSubmit)}>
          <ButtonText>Register</ButtonText>
        </Button>

        <Button 
          onPress={() => router.back()}
          style={{ backgroundColor: 'transparent', marginTop: 20 }}
        >
          <ButtonText style={{ color: '#007AFF' }}>Back to Login</ButtonText>
        </Button>
      </View>
    </Container>
  );
}