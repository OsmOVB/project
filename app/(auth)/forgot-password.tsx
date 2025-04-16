import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Container, Title, Input, ErrorText } from '../../components/styled';
import Button from '@/components/Button';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, data.email);
            Alert.alert('Sucesso', 'Email de recuperação enviado!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o email.');
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
                            placeholder="Digite seu email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.email && <ErrorText>{errors.email.message}</ErrorText>}

                <Button
                    title="Enviar Email"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={isLoading}
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
