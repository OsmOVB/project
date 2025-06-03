// app/help/ReportProblemScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Container, Title, Button, ButtonText } from '@/src/components/styled';
import { useTheme } from '@/src/context/ThemeContext';

export default function ReportProblemScreen() {
    const { theme } = useTheme();
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim().length < 5) {
            Alert.alert('Erro', 'Descreva melhor o problema.');
            return;
        }

        Alert.alert('Enviado', 'Seu problema foi enviado para o suporte.');
        setMessage('');
    };

    return (
        <Container>
            <Title>Reportar um Problema</Title>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
                Descreva o problema abaixo:
            </Text>
            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Descreva aqui..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={5}
                style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.inputBg }]}
            />
            <Button onPress={handleSubmit}>
                <ButtonText>Enviar</ButtonText>
            </Button>
        </Container>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        marginTop: 12,
        marginBottom: 8,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
});
