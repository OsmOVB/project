import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/src/firebase/config';
import Button from '@/src/components/Button';
import { router } from 'expo-router';
import { Container, ErrorText, Input, Title } from '@/src/components/styled';



const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
    const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, data.email);
            Alert.alert('Recuperação enviada', 'Verifique seu e-mail para redefinir a senha.');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o e-mail de recuperação.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <View style={styles.formContainer}>
                <Title>Recuperar Senha</Title>

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <Input
                            placeholder="Digite seu e-mail"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.email && <ErrorText>{errors.email.message}</ErrorText>}

                <Button title="Enviar e-mail" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth />

                <Button
                    title="Voltar para Login"
                    type="outline"
                    onPress={() => router.push('/(auth)/login')}
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
